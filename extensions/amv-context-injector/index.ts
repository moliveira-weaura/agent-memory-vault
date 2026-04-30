/**
 * AMV Context Injector — automatic context injection for Agent Memory Vault.
 *
 * Bridges Agent Memory Vault (Markdown skill + packs) with pi's extension API:
 *
 *   session_start         → detect active pack, optionally index with qmd
 *   before_agent_start    → search pack + inject prioritized context into system prompt
 *   session_before_compact → capture session handoff as action note in pack
 *   session_shutdown      → flush pending qmd updates
 *
 * Tools registered:
 *   amv_search  — search across pack files via qmd (keyword, semantic, deep)
 *
 * Design principles (inherited from AMV):
 *   - Local-first, zero external infra
 *   - Markdown files are the source of truth
 *   - qmd is optional — degrades gracefully without it
 *   - Obsidian-compatible pack structure preserved
 */

import { execFile } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { StringEnum } from "@mariozechner/pi-ai";
import { Type } from "@sinclair/typebox";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Max chars for each context section */
const BUDGET = {
	manifest: 2000,
	sourceOfTruth: 3000,
	searchResults: 2500,
	recentActions: 2000,
	decisions: 2000,
	runbooks: 2000,
	total: 16000,
} as const;

/** Priority order for context sections (higher index = lower priority, trimmed first) */
const SECTION_PRIORITY = [
	"manifest",
	"sourceOfTruth",
	"searchResults",
	"recentActions",
	"decisions",
	"runbooks",
] as const;

// ---------------------------------------------------------------------------
// State (mutable for testing)
// ---------------------------------------------------------------------------

let vaultRoot = "";
let activePack = "";
let activePackPath = "";
let qmdAvailable = false;
let qmdCollection = "";

// ---------------------------------------------------------------------------
// Public helpers (exported for testing)
// ---------------------------------------------------------------------------

export function readFileSafe(filePath: string): string | null {
	try {
		return fs.readFileSync(filePath, "utf-8");
	} catch {
		return null;
	}
}

export function findVaultRoot(startDir: string): string | null {
	let dir = startDir;
	for (let i = 0; i < 10; i++) {
		const pkgPath = path.join(dir, "package.json");
		if (fs.existsSync(pkgPath)) {
			try {
				const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
				if (pkg.name === "agent-memory-vault") return dir;
			} catch {
				// not valid JSON, keep searching
			}
		}
		const parent = path.dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return null;
}

export function detectActivePack(packsDir: string): string | null {
	if (!fs.existsSync(packsDir)) return null;
	const entries = fs.readdirSync(packsDir, { withFileTypes: true });
	const packs = entries
		.filter((e) => e.isDirectory() && !e.name.startsWith("."))
		.map((e) => e.name);
	if (packs.length === 0) return null;
	if (packs.length === 1) return packs[0];
	// Multiple packs: prefer one with a manifest
	for (const pack of packs) {
		const manifestGlob = path.join(packsDir, pack, "00-system");
		if (fs.existsSync(manifestGlob)) return pack;
	}
	return packs[0];
}

export async function detectQmd(): Promise<boolean> {
	return new Promise((resolve) => {
		execFile("qmd", ["--version"], { timeout: 5000 }, (err) => {
			resolve(!err);
		});
	});
}

export async function qmdSearch(
	query: string,
	collection: string,
	limit = 5,
	mode: "keyword" | "semantic" | "deep" = "keyword",
): Promise<string> {
	if (!qmdAvailable) return "";
	return new Promise((resolve) => {
		const args = ["search", query, "-n", String(limit), "-c", collection];
		if (mode === "semantic") args.push("--semantic");
		else if (mode === "deep") args.push("--deep");

		execFile("qmd", args, { timeout: mode === "deep" ? 15000 : 5000 }, (err, stdout) => {
			if (err) {
				resolve("");
				return;
			}
			resolve(stdout.trim());
		});
	});
}

export async function qmdEmbed(collection: string, packPath: string): Promise<boolean> {
	if (!qmdAvailable) return false;
	return new Promise((resolve) => {
		execFile("qmd", ["embed", "-c", collection, packPath], { timeout: 30000 }, (err) => {
			resolve(!err);
		});
	});
}

/**
 * Scan a pack directory for Markdown files sorted by mtime (newest first).
 */
export function scanPackFiles(packPath: string): string[] {
	if (!fs.existsSync(packPath)) return [];
	const results: { path: string; mtime: number }[] = [];

	function walk(dir: string) {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			if (entry.name.startsWith(".")) continue;
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				walk(full);
			} else if (entry.name.endsWith(".md")) {
				try {
					const stat = fs.statSync(full);
					results.push({ path: full, mtime: stat.mtimeMs });
				} catch {
					// skip unreadable
				}
			}
		}
	}

	walk(packPath);
	results.sort((a, b) => b.mtime - a.mtime);
	return results.map((r) => r.path);
}

/**
 * Read frontmatter `type` field from a Markdown file.
 */
export function readFrontmatterType(filePath: string): string | null {
	const content = readFileSafe(filePath);
	if (!content) return null;
	const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
	if (!match) return null;
	const typeMatch = match[1].match(/^type:\s*(.+)$/m);
	return typeMatch ? typeMatch[1].trim() : null;
}

/**
 * Truncate text to a max character budget.
 */
export function truncate(text: string, maxChars: number, from: "start" | "end" | "middle" = "end"): string {
	if (text.length <= maxChars) return text;
	const ellipsis = "\n…[truncated]…\n";
	const available = maxChars - ellipsis.length;
	if (available <= 0) return ellipsis;

	if (from === "start") {
		return ellipsis + text.slice(text.length - available);
	} else if (from === "end") {
		return text.slice(0, available) + ellipsis;
	} else {
		const half = Math.floor(available / 2);
		return text.slice(0, half) + ellipsis + text.slice(text.length - half);
	}
}

/**
 * Build prioritized context from a pack for injection into the system prompt.
 */
export function buildPackContext(packPath: string, searchResults?: string): string {
	const sections: { key: string; header: string; content: string }[] = [];

	// 1. Manifest (highest priority)
	const manifestDir = path.join(packPath, "00-system");
	if (fs.existsSync(manifestDir)) {
		const manifestFiles = scanPackFiles(manifestDir);
		const manifestParts: string[] = [];
		for (const f of manifestFiles) {
			const content = readFileSafe(f);
			if (content?.trim()) {
				const rel = path.relative(packPath, f);
				manifestParts.push(`### ${rel}\n${content.trim()}`);
			}
		}
		if (manifestParts.length > 0) {
			sections.push({
				key: "manifest",
				header: "## Pack System (manifest, indexes, retrieval protocol)",
				content: truncate(manifestParts.join("\n\n"), BUDGET.manifest),
			});
		}
	}

	// 2. Source-of-truth pointers (context packs)
	const contextDir = path.join(packPath, "20-context");
	if (fs.existsSync(contextDir)) {
		const contextFiles = scanPackFiles(contextDir);
		const contextParts: string[] = [];
		for (const f of contextFiles.slice(0, 5)) {
			const content = readFileSafe(f);
			if (content?.trim()) {
				const rel = path.relative(packPath, f);
				contextParts.push(`### ${rel}\n${content.trim()}`);
			}
		}
		if (contextParts.length > 0) {
			sections.push({
				key: "sourceOfTruth",
				header: "## Context Packs (source-of-truth pointers)",
				content: truncate(contextParts.join("\n\n"), BUDGET.sourceOfTruth),
			});
		}
	}

	// 3. Search results
	if (searchResults?.trim()) {
		sections.push({
			key: "searchResults",
			header: "## Relevant Memory (search results)",
			content: truncate(searchResults, BUDGET.searchResults),
		});
	}

	// 4. Recent actions
	const actionsDir = path.join(packPath, "40-actions");
	if (fs.existsSync(actionsDir)) {
		const actionFiles = scanPackFiles(actionsDir).slice(0, 5);
		const actionParts: string[] = [];
		for (const f of actionFiles) {
			const content = readFileSafe(f);
			if (content?.trim()) {
				const rel = path.relative(packPath, f);
				actionParts.push(`### ${rel}\n${content.trim()}`);
			}
		}
		if (actionParts.length > 0) {
			sections.push({
				key: "recentActions",
				header: "## Recent Actions",
				content: truncate(actionParts.join("\n\n"), BUDGET.recentActions),
			});
		}
	}

	// 5. Active decisions
	const decisionsDir = path.join(packPath, "30-decisions");
	if (fs.existsSync(decisionsDir)) {
		const decisionFiles = scanPackFiles(decisionsDir).slice(0, 5);
		const decisionParts: string[] = [];
		for (const f of decisionFiles) {
			const content = readFileSafe(f);
			if (content?.trim()) {
				const rel = path.relative(packPath, f);
				decisionParts.push(`### ${rel}\n${content.trim()}`);
			}
		}
		if (decisionParts.length > 0) {
			sections.push({
				key: "decisions",
				header: "## Active Decisions",
				content: truncate(decisionParts.join("\n\n"), BUDGET.decisions),
			});
		}
	}

	// 6. Runbooks
	const runbooksDir = path.join(packPath, "80-runbooks");
	if (fs.existsSync(runbooksDir)) {
		const runbookFiles = scanPackFiles(runbooksDir).slice(0, 3);
		const runbookParts: string[] = [];
		for (const f of runbookFiles) {
			const content = readFileSafe(f);
			if (content?.trim()) {
				const rel = path.relative(packPath, f);
				runbookParts.push(`### ${rel}\n${content.trim()}`);
			}
		}
		if (runbookParts.length > 0) {
			sections.push({
				key: "runbooks",
				header: "## Runbooks",
				content: truncate(runbookParts.join("\n\n"), BUDGET.runbooks),
			});
		}
	}

	// Apply total budget — trim from lowest priority
	const result: string[] = [];
	let totalChars = 0;

	for (const section of sections) {
		const sectionText = `${section.header}\n\n${section.content}`;
		if (totalChars + sectionText.length > BUDGET.total) {
			const remaining = BUDGET.total - totalChars;
			if (remaining > 200) {
				result.push(truncate(sectionText, remaining));
			}
			break;
		}
		result.push(sectionText);
		totalChars += sectionText.length;
	}

	return result.join("\n\n");
}

/**
 * Generate a session handoff note in AMV action format.
 */
export function buildSessionHandoff(
	sessionId: string,
	packSlug: string,
	summary: string,
): string {
	const today = new Date().toISOString().slice(0, 10);
	const shortId = sessionId.slice(0, 8);
	return `---
type: action
id: action.${packSlug}.session-handoff-${shortId}
title: Session Handoff ${shortId}
status: completed
source_of_truth: false
freshness: current
last_reviewed: ${today}
tags:
  - pack/${packSlug}
  - agent-memory/action
  - session/handoff
---

# Session Handoff ${shortId}

**Session:** ${sessionId}
**Date:** ${today}

## Summary

${summary}

## Related

- [[packs/${packSlug}/00-system/pi-agent/memory-manifest|Memory Manifest]]
`;
}

export function nowTimestamp(): string {
	return new Date().toISOString().replace("T", " ").slice(0, 19);
}

export function todayStr(): string {
	return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Test hooks (override state for testing)
// ---------------------------------------------------------------------------

export function _setVaultRoot(root: string) {
	vaultRoot = root;
}
export function _setActivePack(pack: string, packPath: string) {
	activePack = pack;
	activePackPath = packPath;
}
export function _setQmdAvailable(available: boolean) {
	qmdAvailable = available;
}
export function _resetState() {
	vaultRoot = "";
	activePack = "";
	activePackPath = "";
	qmdAvailable = false;
	qmdCollection = "";
}

// ---------------------------------------------------------------------------
// Extension entry point
// ---------------------------------------------------------------------------

export default function (pi: ExtensionAPI) {
	// --- session_start: detect vault, active pack, qmd ---
	pi.on("session_start", async (_event, ctx) => {
		// Find vault root
		const skillDir = path.resolve(__dirname, "../../skills/agent-memory-vault");
		const root = findVaultRoot(skillDir) ?? findVaultRoot(process.cwd());

		if (!root) {
			if (ctx.hasUI) {
				ctx.ui.notify("AMV: No agent-memory-vault found in project tree.", "info");
			}
			return;
		}

		vaultRoot = root;
		const packsDir = path.join(root, "packs");
		const detected = detectActivePack(packsDir);

		if (!detected) {
			if (ctx.hasUI) {
				ctx.ui.notify("AMV: No memory packs found. Run `npm run new-pack` to create one.", "info");
			}
			return;
		}

		activePack = detected;
		activePackPath = path.join(packsDir, detected);
		qmdCollection = `amv-${detected}`;

		// Detect qmd
		qmdAvailable = await detectQmd();

		if (qmdAvailable) {
			// Index pack in background (fire-and-forget)
			qmdEmbed(qmdCollection, activePackPath).catch(() => {});
		}

		if (ctx.hasUI) {
			const qmdStatus = qmdAvailable ? "qmd ✓" : "qmd ✗ (keyword search only)";
			ctx.ui.notify(`AMV: Pack "${activePack}" loaded. ${qmdStatus}`, "info");
			ctx.ui.setStatus("amv", `📦 ${activePack}`);
		}
	});

	// --- before_agent_start: inject pack context ---
	pi.on("before_agent_start", async (event, _ctx) => {
		if (!activePackPath) return;

		// Semantic search for relevant memories
		let searchResults = "";
		if (qmdAvailable && event.prompt) {
			const sanitized = (event.prompt ?? "").replace(/[^\w\s.,?!-]/g, "").slice(0, 200);
			if (sanitized.trim()) {
				searchResults = await qmdSearch(sanitized, qmdCollection, 3);
			}
		}

		const packContext = buildPackContext(activePackPath, searchResults);
		if (!packContext) return;

		const injection = [
			"\n\n## Agent Memory Vault",
			`Active pack: \`${activePack}\``,
			"The following memory context has been loaded from the pack.",
			"Use the amv_search tool to find additional context across pack files.",
			"",
			packContext,
		].join("\n");

		return {
			systemPrompt: event.systemPrompt + injection,
		};
	});

	// --- session_before_compact: capture session handoff ---
	pi.on("session_before_compact", async (_event, ctx) => {
		if (!activePackPath || !activePack) return;

		const sessionId = ctx.sessionManager.getSessionId();
		const branch = ctx.sessionManager.getBranch();

		// Build summary from recent messages
		const recentMessages: string[] = [];
		const recent = branch.slice(-10);
		for (const entry of recent) {
			if (entry.type === "message") {
				const msg = (entry as any).message;
				if (msg?.role === "user" && typeof msg.content === "string") {
					recentMessages.push(`User: ${msg.content.slice(0, 200)}`);
				} else if (msg?.role === "assistant") {
					const content = msg.content;
					if (typeof content === "string") {
						recentMessages.push(`Assistant: ${content.slice(0, 200)}`);
					} else if (Array.isArray(content)) {
						for (const block of content) {
							if (block.type === "text") {
								recentMessages.push(`Assistant: ${block.text.slice(0, 200)}`);
								break;
							}
						}
					}
				}
			}
		}

		if (recentMessages.length === 0) return;

		const summary = recentMessages.join("\n");
		const handoff = buildSessionHandoff(sessionId, activePack, summary);

		const today = todayStr();
		const shortId = sessionId.slice(0, 8);
		const actionsDir = path.join(activePackPath, "40-actions");
		fs.mkdirSync(actionsDir, { recursive: true });
		const handoffPath = path.join(actionsDir, `${today}-session-handoff-${shortId}.md`);
		fs.writeFileSync(handoffPath, handoff, "utf-8");

		// Re-index after writing
		if (qmdAvailable) {
			qmdEmbed(qmdCollection, activePackPath).catch(() => {});
		}
	});

	// --- session_shutdown: cleanup ---
	pi.on("session_shutdown", async (_event, _ctx) => {
		// Nothing to flush at the moment
	});

	// --- amv_search tool ---
	pi.registerTool({
		name: "amv_search",
		label: "AMV Search",
		description: [
			"Search across Agent Memory Vault pack files for relevant context.",
			"Modes:",
			"- 'keyword' (default, fast): BM25 text search. Best for specific terms, tags, note names.",
			"- 'semantic' (~2s): Meaning-based search. Finds related concepts with different wording.",
			"- 'deep' (~10s): Hybrid with reranking. Use when other modes miss results.",
			"If qmd is not installed, falls back to grep-based keyword search across Markdown files.",
		].join("\n"),
		parameters: Type.Object({
			query: Type.String({ description: "Search query" }),
			mode: Type.Optional(
				StringEnum(["keyword", "semantic", "deep"] as const, {
					description: "Search mode. Default: 'keyword'.",
				}),
			),
			limit: Type.Optional(Type.Number({ description: "Max results (default: 5)" })),
		}),
		async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
			if (!activePackPath) {
				return {
					content: [{ type: "text" as const, text: "No active memory pack. Install a pack under packs/ first." }],
					details: {},
				};
			}

			const { query, mode = "keyword", limit = 5 } = params;

			// Try qmd first
			if (qmdAvailable) {
				const results = await qmdSearch(query, qmdCollection, limit, mode as any);
				if (results) {
					return {
						content: [{ type: "text" as const, text: results }],
						details: { mode, collection: qmdCollection },
					};
				}
			}

			// Fallback: grep-based search
			const files = scanPackFiles(activePackPath);
			const matches: string[] = [];
			const queryLower = query.toLowerCase();
			const terms = queryLower.split(/\s+/).filter(Boolean);

			for (const f of files) {
				if (matches.length >= limit) break;
				const content = readFileSafe(f);
				if (!content) continue;
				const contentLower = content.toLowerCase();
				const score = terms.filter((t) => contentLower.includes(t)).length;
				if (score > 0) {
					const rel = path.relative(activePackPath, f);
					// Extract matching lines
					const lines = content.split("\n");
					const matchingLines = lines
						.filter((line) => terms.some((t) => line.toLowerCase().includes(t)))
						.slice(0, 5);
					matches.push(`### ${rel} (${score}/${terms.length} terms matched)\n${matchingLines.join("\n")}`);
				}
			}

			if (matches.length === 0) {
				return {
					content: [{ type: "text" as const, text: `No results for "${query}" in pack "${activePack}".` }],
					details: { mode: "grep-fallback" },
				};
			}

			return {
				content: [
					{
						type: "text" as const,
						text: `## Search results (grep fallback, qmd not available)\n\n${matches.join("\n\n")}`,
					},
				],
				details: { mode: "grep-fallback", matchCount: matches.length },
			};
		},
	});
}
