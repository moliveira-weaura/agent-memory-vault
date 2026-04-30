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

/**
 * List all available packs in the packs directory.
 */
export function listPacks(packsDir: string): string[] {
	if (!fs.existsSync(packsDir)) return [];
	const entries = fs.readdirSync(packsDir, { withFileTypes: true });
	return entries
		.filter((e) => e.isDirectory() && !e.name.startsWith("."))
		.map((e) => e.name);
}

/**
 * Score how well a pack matches the current working directory.
 * Reads the pack's resource-map and context files looking for repo names
 * that match the cwd basename or parent directories.
 */
export function scorePackForCwd(packPath: string, cwd: string): number {
	const cwdParts = cwd.split(path.sep).filter(Boolean);
	// Collect the last 3 path segments as candidates (e.g. "aura", "weaurapay-api", "payment")
	const candidates = cwdParts.slice(-3).map((p) => p.toLowerCase());
	if (candidates.length === 0) return 0;

	// Scan all markdown files in the pack for mentions of cwd segments
	const files = scanPackFiles(packPath);
	let score = 0;

	for (const f of files) {
		const content = readFileSafe(f);
		if (!content) continue;
		const contentLower = content.toLowerCase();
		for (const candidate of candidates) {
			if (candidate.length >= 3 && contentLower.includes(candidate)) {
				score++;
			}
		}
	}

	return score;
}

export function detectActivePack(packsDir: string, cwd?: string): string | null {
	const packs = listPacks(packsDir);
	if (packs.length === 0) return null;
	if (packs.length === 1) return packs[0];

	// Auto-detect by cwd: score each pack and pick the best match
	if (cwd) {
		const scored = packs
			.map((pack) => ({ pack, score: scorePackForCwd(path.join(packsDir, pack), cwd) }))
			.filter((s) => s.score > 0)
			.sort((a, b) => b.score - a.score);
		if (scored.length > 0) return scored[0].pack;
	}

	// Fallback: prefer one with a manifest
	for (const pack of packs) {
		const manifestDir = path.join(packsDir, pack, "00-system");
		if (fs.existsSync(manifestDir)) return pack;
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
	const decisionsDir = ["50-decisions", "30-decisions"]
		.map((d) => path.join(packPath, d))
		.find((d) => fs.existsSync(d));
	if (decisionsDir) {
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
	const runbooksDir = ["70-runbooks", "80-runbooks"]
		.map((d) => path.join(packPath, d))
		.find((d) => fs.existsSync(d));
	if (runbooksDir) {
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
// Vault / packs path resolution
// ---------------------------------------------------------------------------

/**
 * Default global packs directory: ~/.pi/agent/memory-vault/packs
 */
const DEFAULT_GLOBAL_PACKS_DIR = path.join(
	process.env.HOME ?? process.env.USERPROFILE ?? "~",
	".pi",
	"agent",
	"memory-vault",
	"packs",
);

/**
 * Resolve the packs directory using a priority chain:
 *
 *   1. AMV_PACKS_PATH env var           — explicit override
 *   2. .pi/memory-vault/packs/          — project-local (relative to cwd)
 *   3. ~/.pi/agent/memory-vault/packs/  — global default
 *   4. <package-root>/packs/            — fallback for development
 *
 * Returns the first path that exists and contains at least one pack.
 */
export function resolvePacksDir(cwd: string): string | null {
	const candidates: { label: string; dir: string }[] = [];

	// 1. Explicit env var
	if (process.env.AMV_PACKS_PATH) {
		candidates.push({ label: "AMV_PACKS_PATH", dir: process.env.AMV_PACKS_PATH });
	}

	// 2. Project-local: <cwd>/.pi/memory-vault/packs/
	candidates.push({
		label: "project-local",
		dir: path.join(cwd, ".pi", "memory-vault", "packs"),
	});

	// 3. Global default: ~/.pi/agent/memory-vault/packs/
	candidates.push({ label: "global", dir: DEFAULT_GLOBAL_PACKS_DIR });

	// 4. Package root fallback (development): <package>/packs/
	const packageRoot = findVaultRoot(path.resolve(__dirname, "../.."));
	if (packageRoot) {
		candidates.push({ label: "package-root", dir: path.join(packageRoot, "packs") });
	}

	// Return first candidate that exists and has packs
	for (const { dir } of candidates) {
		if (listPacks(dir).length > 0) {
			return dir;
		}
	}

	return null;
}

// ---------------------------------------------------------------------------
// Test hooks (override state for testing)
// ---------------------------------------------------------------------------

let _packsDir = "";

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
	_packsDir = "";
}

// ---------------------------------------------------------------------------
// Extension entry point
// ---------------------------------------------------------------------------

export default function (pi: ExtensionAPI) {
	// --- session_start: detect vault, active pack, qmd ---
	pi.on("session_start", async (_event, ctx) => {
		// Resolve packs directory
		const packsDir = resolvePacksDir(ctx.cwd);

		if (!packsDir) {
			if (ctx.hasUI) {
				ctx.ui.notify(
					"AMV: No packs found. Set AMV_PACKS_PATH, create .pi/memory-vault/packs/, or use ~/.pi/agent/memory-vault/packs/",
					"info",
				);
			}
			return;
		}

		vaultRoot = path.dirname(packsDir);
		_packsDir = packsDir;
		const detected = detectActivePack(packsDir, ctx.cwd);

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

	// --- /pack command: list and switch packs ---
	pi.registerCommand("pack", {
		description: "List or switch AMV memory packs. Usage: /pack [name]",
		handler: async (args, ctx) => {
			if (!vaultRoot) {
				ctx.ui.notify("AMV: No vault loaded.", "error");
				return;
			}

			const packsDir = _packsDir || path.join(vaultRoot, "packs");
			const packs = listPacks(packsDir);

			if (packs.length === 0) {
				ctx.ui.notify("AMV: No packs found.", "info");
				return;
			}

			const target = args?.trim();

			if (!target) {
				// No argument: show picker
				const options = packs.map((p) =>
					p === activePack ? `📦 ${p} (active)` : p,
				);

				const selected = await ctx.ui.select("Select memory pack", options);
				if (!selected) return;

				// Strip the prefix if it was the active one
				const packName = selected.replace(/^📦 /, "").replace(/ \(active\)$/, "");

				if (packName === activePack) {
					ctx.ui.notify(`AMV: Already using pack "${activePack}".`, "info");
					return;
				}

				activePack = packName;
				activePackPath = path.join(packsDir, packName);
				qmdCollection = `amv-${packName}`;

				if (qmdAvailable) {
					qmdEmbed(qmdCollection, activePackPath).catch(() => {});
				}

				ctx.ui.notify(`AMV: Switched to pack "${activePack}".`, "success");
				ctx.ui.setStatus("amv", `📦 ${activePack}`);
				return;
			}

			// Argument provided: switch directly
			if (!packs.includes(target)) {
				ctx.ui.notify(`AMV: Pack "${target}" not found. Available: ${packs.join(", ")}`, "error");
				return;
			}

			if (target === activePack) {
				ctx.ui.notify(`AMV: Already using pack "${activePack}".`, "info");
				return;
			}

			activePack = target;
			activePackPath = path.join(packsDir, target);
			qmdCollection = `amv-${target}`;

			if (qmdAvailable) {
				qmdEmbed(qmdCollection, activePackPath).catch(() => {});
			}

			ctx.ui.notify(`AMV: Switched to pack "${activePack}".`, "success");
			ctx.ui.setStatus("amv", `📦 ${activePack}`);
		},
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
