/**
 * Sprint 1 Founder Validation — behavioral parity (no OpenAI required).
 *
 * Runs 20 founder test messages through legacy intelligence paths with
 * UNIFIED_SIGNAL_BUS off vs on. Outputs must match except shadow signals.
 *
 * Run: npx tsx scripts/sprint1-founder-validation.mjs
 * Run with bus: UNIFIED_SIGNAL_BUS=1 npx tsx scripts/sprint1-founder-validation.mjs --phase after
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { observeUserSignalsFromText } from "../lib/ecosystem/userIntelligenceEngine.ts";
import { detectEmotionalState } from "../lib/companionEmotions.ts";
import { classifyUserMessage } from "../lib/messageClassification.ts";
import { evaluateEcosystem } from "../lib/ecosystem-intelligence/ecosystemEngine.ts";
import { evaluateActivation } from "../lib/activation/activationEngine.ts";
import { evaluateRecovery } from "../lib/recovery-intelligence/recoveryEngine.ts";
import { evaluateCognitiveLoad } from "../lib/cognitive-load/loadEngine.ts";
import { ingestClassifiedUserSignals } from "../lib/intelligence-layer/ingest.ts";
import { legacyKeysFromClassified } from "../lib/intelligence-layer/chatSignalAdapter.ts";
import { getRegistryCoverageReport } from "../lib/intelligence-layer/signalRegistry.ts";
import {
  benchmarkEmitCompanionSignal,
  emitCompanionSignal,
} from "../lib/intelligence-layer/signalBus.ts";
import {
  getShadowBusMetrics,
  compareSignalParity,
  resetShadowDiagnosticsForTests,
} from "../lib/intelligence-layer/shadowDiagnostics.ts";
import {
  clearShadowSignalStoreForTests,
  getShadowSignalStore,
  queryShadowSignals,
} from "../lib/intelligence-layer/shadowSignalStore.ts";
import { getIntelligenceProfile } from "../lib/intelligence-layer/profileStore.ts";
import { countSignalsByCategory } from "../lib/intelligence-layer/signalStore.ts";
import { SIGNAL_BUS_FLAG_KEYS } from "../lib/intelligence-layer/featureFlags.ts";

const FOUNDER_MESSAGES = [
  "I have 17 things on my list and my brain is shutting down.",
  "I know I need sales calls but I've been avoiding them for three days.",
  "I have so many business ideas I can't pick one.",
  "I have four half-finished projects and I feel like a failure.",
  "Who am I to charge these prices? Everyone seems more put together.",
  "I sat down at 9 and suddenly it's 3pm. Where did the day go?",
  "I've been staring at a blank doc for an hour. I need to post something.",
  "I know what to do but my body won't start. Like I'm frozen.",
  "I've rewritten this email six times and still won't send it.",
  "I'm exhausted and anxious and everything feels heavy.",
  "Help me prioritize — everything feels urgent right now.",
  "I don't know where to start with this launch.",
  "I'm stuck on this task. It feels too big.",
  "Can you help me plan my day? I'm overwhelmed.",
  "I keep replaying that conversation in my head.",
  "I need to write a newsletter but I'm procrastinating.",
  "What should I work on first today?",
  "I'm frustrated that I can't follow through on anything.",
  "I want to create content but I'm scared people will judge me.",
  "I'm excited about my new offer but also terrified to launch it.",
];

const NOW = new Date("2026-06-22T14:00:00.000Z");

function mockBrowserStorage() {
  const mem = new Map();
  const storage = {
    getItem: (k) => mem.get(k) ?? null,
    setItem: (k, v) => mem.set(k, v),
    removeItem: (k) => mem.delete(k),
    clear: () => mem.clear(),
  };
  globalThis.localStorage = storage;
  globalThis.window = { dispatchEvent: () => {}, localStorage: storage };
  globalThis.structuredClone = (v) => JSON.parse(JSON.stringify(v));
  globalThis.performance = { now: () => Date.now() };
}

function setBusEnabled(on) {
  if (on) {
    localStorage.setItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus, "1");
    localStorage.setItem(SIGNAL_BUS_FLAG_KEYS.diagnostics, "1");
  } else {
    localStorage.removeItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus);
    localStorage.removeItem(SIGNAL_BUS_FLAG_KEYS.diagnostics);
  }
}

function captureTurn(text) {
  const emotion = detectEmotionalState(text);
  const classified = observeUserSignalsFromText({
    text,
    emotionalState: emotion,
    source: "chat",
  });
  const messageCategory = classifyUserMessage(text, { workspaceOpen: null });
  const ecosystem = evaluateEcosystem({ text, now: NOW });
  const activation = evaluateActivation({ text, now: NOW });
  const recovery = evaluateRecovery({ text, now: NOW });
  const load = evaluateCognitiveLoad({ recentText: text, now: NOW });

  ingestClassifiedUserSignals(classified, {
    source: "chat",
    emotionalState: emotion,
  });

  const legacyKeys = legacyKeysFromClassified(classified, emotion);
  const parity = compareSignalParity(legacyKeys);

  return {
    text,
    emotion,
    messageCategory,
    classified,
    ecosystemPriority: ecosystem.topSignal ?? null,
    ecosystemSuppressed: ecosystem.suppressed ?? [],
    activationOffer: activation.companionOffer ?? null,
    recoveryLevel: recovery.recoveryLevel,
    loadLevel: load.score.level,
    legacySignalKeys: [...countSignalsByCategory().keys()],
    profileSignalCount: getIntelligenceProfile().signalCount,
    shadowSignalCount: getShadowSignalStore().signals.length,
    parityPass: parity.pass,
  };
}

function runPhase(busOn) {
  mockBrowserStorage();
  clearShadowSignalStoreForTests();
  resetShadowDiagnosticsForTests();
  setBusEnabled(busOn);

  const turns = FOUNDER_MESSAGES.map((text) => captureTurn(text));
  const profile = getIntelligenceProfile();
  const metrics = getShadowBusMetrics();

  return {
    busEnabled: busOn,
    turns,
    profileSummary: {
      signalCount: profile.signalCount,
      updatedAt: profile.updatedAt,
    },
    shadowSignals: queryShadowSignals(),
    metrics,
  };
}

function diffBehavior(before, after) {
  const diffs = [];
  for (let i = 0; i < before.turns.length; i += 1) {
    const b = before.turns[i];
    const a = after.turns[i];
    const fields = [
      "emotion",
      "messageCategory",
      "ecosystemPriority",
      "activationOffer",
      "recoveryLevel",
      "loadLevel",
      "profileSignalCount",
    ];
    for (const field of fields) {
      if (JSON.stringify(b[field]) !== JSON.stringify(a[field])) {
        diffs.push({ index: i, text: b.text, field, before: b[field], after: a[field] });
      }
    }
    if (JSON.stringify(b.classified) !== JSON.stringify(a.classified)) {
      diffs.push({
        index: i,
        text: b.text,
        field: "classified",
        before: b.classified,
        after: a.classified,
      });
    }
  }
  if (
    JSON.stringify(before.profileSummary.signalCount) !==
    JSON.stringify(after.profileSummary.signalCount)
  ) {
    diffs.push({
      field: "profileSignalCount",
      before: before.profileSummary.signalCount,
      after: after.profileSummary.signalCount,
    });
  }
  return diffs;
}

function runBenchmarks() {
  mockBrowserStorage();
  setBusEnabled(true);
  clearShadowSignalStoreForTests();
  const bench = benchmarkEmitCompanionSignal(
    {
      domain: "emotional",
      category: "overwhelm",
      source: "bench",
      emitter: "founder.validation",
    },
    100,
  );
  return bench;
}

const phase = process.argv.includes("--phase")
  ? process.argv[process.argv.indexOf("--phase") + 1]
  : "full";

const outDir = resolve(process.cwd(), "scripts");
const beforePath = resolve(outDir, "sprint1-founder-baseline.json");
const afterPath = resolve(outDir, "sprint1-founder-after.json");
const reportPath = resolve(outDir, "sprint1-founder-validation-report.json");

if (phase === "before") {
  const baseline = runPhase(false);
  writeFileSync(beforePath, JSON.stringify(baseline, null, 2));
  console.log(`Wrote baseline: ${beforePath}`);
  process.exit(0);
}

if (phase === "after") {
  if (!existsSync(beforePath)) {
    console.error("Run --phase before first");
    process.exit(1);
  }
  const before = JSON.parse(readFileSync(beforePath, "utf8"));
  const after = runPhase(true);
  writeFileSync(afterPath, JSON.stringify(after, null, 2));
  const diffs = diffBehavior(before, after);
  const coverage = getRegistryCoverageReport();
  mockBrowserStorage();
  setBusEnabled(true);
  const perf = runBenchmarks();
  const parityPasses = after.turns.filter((t) => t.parityPass).length;
  const parityPct = (parityPasses / after.turns.length) * 100;
  const report = {
    generatedAt: new Date().toISOString(),
    messageCount: FOUNDER_MESSAGES.length,
    behavioralDiffs: diffs,
    behavioralParity: diffs.length === 0,
    registryCoverage: coverage,
    shadowParity: {
      passes: parityPasses,
      total: after.turns.length,
      percent: parityPct,
    },
    performance: perf,
    duplicateRate: after.metrics.duplicateRate,
    shadowSignalCount: after.shadowSignals.length,
    rollback: {
      flag: SIGNAL_BUS_FLAG_KEYS.unifiedBus,
      setTo: "0",
      note: "Instant return to legacy-only behavior",
    },
  };
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (diffs.length > 0) {
    console.error(`FAIL: ${diffs.length} behavioral diffs`);
    process.exit(1);
  }
  if (coverage.coveragePercent < 100) {
    console.error("FAIL: registry coverage below 100%");
    process.exit(1);
  }
  if (parityPct < 95) {
    console.error(`FAIL: shadow parity ${parityPct}% < 95%`);
    process.exit(1);
  }
  if (perf.p95Ms >= 10) {
    console.error(`FAIL: p95 ${perf.p95Ms}ms >= 10ms`);
    process.exit(1);
  }
  console.log("PASS: Sprint 1 founder validation");
  process.exit(0);
}

// full: run both phases
const before = runPhase(false);
writeFileSync(beforePath, JSON.stringify(before, null, 2));
const after = runPhase(true);
writeFileSync(afterPath, JSON.stringify(after, null, 2));
const diffs = diffBehavior(before, after);
const coverage = getRegistryCoverageReport();
mockBrowserStorage();
setBusEnabled(true);
const perf = runBenchmarks();
const parityPasses = after.turns.filter((t) => t.parityPass).length;
const parityPct = (parityPasses / after.turns.length) * 100;

const report = {
  generatedAt: new Date().toISOString(),
  messageCount: FOUNDER_MESSAGES.length,
  behavioralDiffs: diffs,
  behavioralParity: diffs.length === 0,
  registryCoverage: coverage,
  shadowParity: { passes: parityPasses, total: after.turns.length, percent: parityPct },
  performance: perf,
  duplicateRate: after.metrics.duplicateRate,
  shadowSignalCount: after.shadowSignals.length,
};

writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

if (diffs.length > 0) process.exit(1);
if (coverage.coveragePercent < 100) process.exit(1);
if (parityPct < 95) process.exit(1);
if (perf.p95Ms >= 10) process.exit(1);

console.log("PASS: Sprint 1 founder validation");
