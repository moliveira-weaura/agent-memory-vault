/**
 * E2E test — simulates pi loading the extension against a real pack.
 *
 * Run:   bun run test/e2e.ts
 *
 * This test uses the real aura-test pack in packs/ to validate:
 *   1. session_start  → detects pack
 *   2. before_agent_start → injects context
 *   3. amv_search → finds relevant memories
 *   4. session_before_compact → creates handoff
 */

import * as fs from "node:fs";
import * as path from "node:path";

import {
	_resetState,
	_setActivePack,
	_setQmdAvailable,
	_setVaultRoot,
	buildPackContext,
	detectActivePack,
	findVaultRoot,
	scanPackFiles,
} from "../index.js";
import registerExtension from "../index.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VAULT_ROOT = path.resolve(__dirname, "../../..");
const PACKS_DIR = path.join(VAULT_ROOT, "packs");
const PACK_NAME = "aura-test";
const PACK_PATH = path.join(PACKS_DIR, PACK_NAME);

function createMockPi() {
	const tools: Record<string, any> = {};
	const hooks: Record<string, (...args: unknown[]) => unknown> = {};
	return {
		pi: {
			registerTool(def: any) { tools[def.name] = def; },
			on(event: string, handler: (...args: unknown[]) => unknown) { hooks[event] = handler; },
		},
		tools,
		hooks,
	};
}

function pass(name: string) {
	console.log(`  ✅ ${name}`);
}

function fail(name: string, detail: string) {
	console.error(`  ❌ ${name}: ${detail}`);
	process.exitCode = 1;
}

function assert(condition: boolean, name: string, detail = "") {
	if (condition) pass(name);
	else fail(name, detail || "assertion failed");
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function main() {
	console.log("\n🧪 AMV Context Injector — E2E Test\n");
	console.log(`Vault root: ${VAULT_ROOT}`);
	console.log(`Pack: ${PACK_NAME} (${PACK_PATH})\n`);

	// Pre-check: pack exists
	if (!fs.existsSync(PACK_PATH)) {
		console.error("❌ Pack aura-test not found. Run: python3 scripts/new-pack.py aura-test");
		process.exit(1);
	}

	// -----------------------------------------------------------------------
	// TEST 1: Vault discovery
	// -----------------------------------------------------------------------
	console.log("── 1. Vault Discovery ──");

	const foundRoot = findVaultRoot(PACK_PATH);
	assert(foundRoot === VAULT_ROOT, "findVaultRoot finds vault from pack subdir", `got: ${foundRoot}`);

	const foundPack = detectActivePack(PACKS_DIR);
	assert(foundPack === PACK_NAME, "detectActivePack finds aura-test", `got: ${foundPack}`);

	const packFiles = scanPackFiles(PACK_PATH);
	assert(packFiles.length >= 10, `scanPackFiles finds ${packFiles.length} markdown files (≥10 expected)`);

	// -----------------------------------------------------------------------
	// TEST 2: Pack context building
	// -----------------------------------------------------------------------
	console.log("\n── 2. Pack Context Building ──");

	const context = buildPackContext(PACK_PATH);
	assert(context.length > 0, "buildPackContext returns non-empty context");
	assert(context.includes("Go 1.22"), "Context includes stack info (Go 1.22)");
	assert(context.includes("PostgreSQL"), "Context includes database (PostgreSQL)");
	assert(context.includes("Chi"), "Context includes decision (Chi router)");
	assert(context.includes("NATS"), "Context includes decision (NATS)");
	assert(context.includes("gitlab-ci"), "Context includes action (GitLab CI)");
	assert(context.includes("Deploy Procedure"), "Context includes runbook (Deploy)");
	assert(context.includes("Pack System"), "Context has manifest section header");
	assert(context.includes("Context Packs"), "Context has context section header");
	assert(context.includes("Active Decisions"), "Context has decisions section header");
	assert(context.includes("Recent Actions"), "Context has actions section header");
	assert(context.includes("Runbooks"), "Context has runbooks section header");
	assert(context.length <= 16500, `Context within budget (${context.length} chars ≤ 16500)`);

	// With search results
	const contextWithSearch = buildPackContext(PACK_PATH, "Found: NATS JetStream config in events module");
	assert(contextWithSearch.includes("Relevant Memory"), "Context with search includes search header");
	assert(contextWithSearch.includes("NATS JetStream"), "Context with search includes search result text");

	// -----------------------------------------------------------------------
	// TEST 3: Extension hooks registration
	// -----------------------------------------------------------------------
	console.log("\n── 3. Extension Registration ──");

	_resetState();
	const { pi, tools, hooks } = createMockPi();
	registerExtension(pi as any);

	assert(!!tools["amv_search"], "amv_search tool registered");
	assert(!!hooks["session_start"], "session_start hook registered");
	assert(!!hooks["before_agent_start"], "before_agent_start hook registered");
	assert(!!hooks["session_before_compact"], "session_before_compact hook registered");
	assert(!!hooks["session_shutdown"], "session_shutdown hook registered");

	// -----------------------------------------------------------------------
	// TEST 4: before_agent_start injection
	// -----------------------------------------------------------------------
	console.log("\n── 4. Context Injection (before_agent_start) ──");

	_setVaultRoot(VAULT_ROOT);
	_setActivePack(PACK_NAME, PACK_PATH);
	_setQmdAvailable(false);

	// Re-register with state set
	const { pi: pi2, tools: tools2, hooks: hooks2 } = createMockPi();
	registerExtension(pi2 as any);
	_setActivePack(PACK_NAME, PACK_PATH);
	_setQmdAvailable(false);

	const basePrompt = "You are a helpful coding assistant.";

	const injectionResult = await hooks2["before_agent_start"](
		{ prompt: "how do we deploy to production?", systemPrompt: basePrompt },
		{ sessionManager: { getSessionId: () => "e2e-test" }, hasUI: false, ui: {} },
	) as any;

	assert(!!injectionResult, "before_agent_start returns injection result");
	assert(injectionResult.systemPrompt.startsWith(basePrompt), "Preserves original system prompt");
	assert(injectionResult.systemPrompt.includes("Agent Memory Vault"), "Injects AMV header");
	assert(injectionResult.systemPrompt.includes("aura-test"), "Injects active pack name");
	assert(injectionResult.systemPrompt.includes("Deploy Procedure"), "Injects relevant runbook");
	assert(injectionResult.systemPrompt.includes("Go 1.22"), "Injects stack context");
	assert(injectionResult.systemPrompt.includes("amv_search"), "Hints about amv_search tool");

	console.log(`\n  📏 Injected prompt size: ${injectionResult.systemPrompt.length} chars`);
	console.log(`  📏 Base prompt: ${basePrompt.length} chars`);
	console.log(`  📏 Injected context: ${injectionResult.systemPrompt.length - basePrompt.length} chars`);

	// -----------------------------------------------------------------------
	// TEST 5: amv_search tool (grep fallback)
	// -----------------------------------------------------------------------
	console.log("\n── 5. amv_search Tool ──");

	// Search for database
	const searchDb = await tools2["amv_search"].execute(
		"e2e-1", { query: "PostgreSQL database" }, null, () => {}, {},
	);
	assert(searchDb.content[0].text.includes("PostgreSQL"), "Search 'PostgreSQL database' finds match");
	assert(searchDb.details.mode === "grep-fallback", "Uses grep-fallback mode (no qmd)");

	// Search for deploy
	const searchDeploy = await tools2["amv_search"].execute(
		"e2e-2", { query: "deploy production kubectl" }, null, () => {}, {},
	);
	assert(searchDeploy.content[0].text.includes("kubectl"), "Search 'deploy production kubectl' finds match");

	// Search for NATS events
	const searchNats = await tools2["amv_search"].execute(
		"e2e-3", { query: "NATS JetStream events" }, null, () => {}, {},
	);
	assert(searchNats.content[0].text.includes("NATS"), "Search 'NATS JetStream events' finds match");

	// Search with no results
	const searchNone = await tools2["amv_search"].execute(
		"e2e-4", { query: "xyznonexistentterm" }, null, () => {}, {},
	);
	assert(searchNone.content[0].text.includes("No results"), "Search for nonexistent term returns 'No results'");

	// Search with limit
	const searchLimit = await tools2["amv_search"].execute(
		"e2e-5", { query: "aura", limit: 2 }, null, () => {}, {},
	);
	const matchHeaders = (searchLimit.content[0].text.match(/### /g) || []).length;
	assert(matchHeaders <= 2, `Search with limit=2 returns ≤2 results (got ${matchHeaders})`);

	// -----------------------------------------------------------------------
	// TEST 6: session_before_compact handoff
	// -----------------------------------------------------------------------
	console.log("\n── 6. Session Handoff (session_before_compact) ──");

	const handoffSessionId = "e2e-handoff-session-12345678";
	const compactCtx = {
		sessionManager: {
			getSessionId: () => handoffSessionId,
			getBranch: () => [
				{ type: "message", message: { role: "user", content: "How do I deploy to staging?" } },
				{ type: "message", message: { role: "assistant", content: "Run `make deploy-staging` after ensuring tests pass. See the deploy runbook." } },
				{ type: "message", message: { role: "user", content: "What about rollback?" } },
				{ type: "message", message: { role: "assistant", content: "Use `kubectl rollout undo deployment/aura-api -n aura-staging`." } },
			],
		},
		hasUI: false,
		ui: { notify: () => {}, setStatus: () => {} },
	};

	const actionsDir = path.join(PACK_PATH, "40-actions");
	const filesBefore = fs.readdirSync(actionsDir);
	await hooks2["session_before_compact"]({}, compactCtx);
	const filesAfter = fs.readdirSync(actionsDir);

	const newFiles = filesAfter.filter((f) => !filesBefore.includes(f));
	assert(newFiles.length === 1, `Created 1 handoff file (got ${newFiles.length})`);

	const handoffFile = newFiles[0];
	assert(handoffFile.includes("session-handoff"), `Handoff filename contains 'session-handoff': ${handoffFile}`);

	const handoffContent = fs.readFileSync(path.join(actionsDir, handoffFile), "utf-8");
	assert(handoffContent.includes("type: action"), "Handoff has type: action frontmatter");
	assert(handoffContent.includes("session/handoff"), "Handoff has session/handoff tag");
	assert(handoffContent.includes(handoffSessionId), "Handoff includes session ID");
	assert(handoffContent.includes("deploy to staging"), "Handoff captures user message");
	assert(handoffContent.includes("rollout undo"), "Handoff captures assistant response");
	assert(handoffContent.includes("memory-manifest|Memory Manifest"), "Handoff links to manifest");

	console.log(`\n  📄 Handoff file: ${handoffFile}`);
	console.log(`  📏 Handoff size: ${handoffContent.length} chars`);

	// -----------------------------------------------------------------------
	// TEST 7: Search finds the newly created handoff
	// -----------------------------------------------------------------------
	console.log("\n── 7. Search Finds New Handoff ──");

	const searchHandoff = await tools2["amv_search"].execute(
		"e2e-6", { query: "rollback staging handoff" }, null, () => {}, {},
	);
	assert(
		searchHandoff.content[0].text.includes("session-handoff"),
		"Search finds newly created handoff file",
	);

	// -----------------------------------------------------------------------
	// Cleanup: remove the handoff file (keep pack clean)
	// -----------------------------------------------------------------------
	fs.unlinkSync(path.join(actionsDir, handoffFile));

	// -----------------------------------------------------------------------
	// Summary
	// -----------------------------------------------------------------------
	console.log("\n══════════════════════════════════════");
	if (process.exitCode) {
		console.log("❌ Some tests FAILED. See above.");
	} else {
		console.log("✅ All E2E tests PASSED.");
	}
	console.log("══════════════════════════════════════\n");

	_resetState();
}

main().catch((err) => {
	console.error("Fatal:", err);
	process.exit(1);
});
