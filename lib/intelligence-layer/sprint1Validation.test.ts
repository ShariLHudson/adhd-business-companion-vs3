/**
 * Sprint 1 founder validation — 20 messages, behavioral parity + shadow metrics.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { observeUserSignalsFromText } from "@/lib/ecosystem/userIntelligenceEngine";
import { detectEmotionalState } from "@/lib/companionEmotions";
import { classifyUserMessage } from "@/lib/messageClassification";
import { evaluateEcosystem } from "@/lib/ecosystem-intelligence/ecosystemEngine";
import { evaluateActivation } from "@/lib/activation/activationEngine";
import { evaluateRecovery } from "@/lib/recovery-intelligence/recoveryEngine";
import { evaluateCognitiveLoad } from "@/lib/cognitive-load/loadEngine";
import { ingestClassifiedUserSignals, getLastChatBusSummary } from "./ingest";
import { legacyKeysFromClassified } from "./chatSignalAdapter";
import { getRegistryCoverageReport } from "./signalRegistry";
import { benchmarkEmitCompanionSignal, emitCompanionSignal } from "./signalBus";
import {
  compareEmittedParity,
  resetShadowDiagnosticsForTests,
} from "./shadowDiagnostics";
import {
  clearShadowSignalStoreForTests,
  getShadowSignalStore,
} from "./shadowSignalStore";
import { SIGNAL_BUS_FLAG_KEYS } from "./featureFlags";

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

function mockStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { dispatchEvent: vi.fn(), localStorage: storage });
  vi.stubGlobal("structuredClone", (v: unknown) => JSON.parse(JSON.stringify(v)));
  vi.stubGlobal("performance", { now: () => Date.now() });
}

type TurnCapture = {
  emotion: string;
  messageCategory: string;
  classified: ReturnType<typeof observeUserSignalsFromText>;
  ecosystemPriority: string;
  activationOffer: string | null;
  recoveryLevel: string;
  loadLevel: string;
  parityPass: boolean;
};

function captureTurn(text: string, busOn: boolean): TurnCapture {
  mockStorage();
  clearShadowSignalStoreForTests();
  resetShadowDiagnosticsForTests();
  if (busOn) {
    localStorage.setItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus, "1");
  }

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

  let parityPass = true;
  if (busOn) {
    const summary = getLastChatBusSummary();
    const shadowKeys =
      summary?.emitted.map((s) => `${s.domain}:${s.category}`) ?? [];
    parityPass = compareEmittedParity(
      legacyKeysFromClassified(classified, emotion),
      shadowKeys,
    ).pass;
  }

  return {
    emotion,
    messageCategory,
    classified,
    ecosystemPriority: ecosystem.topSignal,
    activationOffer: activation.companionOffer ?? null,
    recoveryLevel: recovery.recoveryLevel,
    loadLevel: load.score.level,
    parityPass,
  };
}

describe("Sprint 1 founder validation", () => {
  beforeEach(() => {
    mockStorage();
    clearShadowSignalStoreForTests();
    resetShadowDiagnosticsForTests();
  });

  it("registry 100% coverage", () => {
    const report = getRegistryCoverageReport();
    expect(report.missingCategories).toEqual([]);
    expect(report.coveragePercent).toBe(100);
    expect(report.totalMappingCategories).toBeGreaterThan(30);
  });

  it("20 founder messages — identical behavior flag off vs on", () => {
    for (const text of FOUNDER_MESSAGES) {
      const off = captureTurn(text, false);
      const on = captureTurn(text, true);
      expect(on.emotion).toBe(off.emotion);
      expect(on.messageCategory).toBe(off.messageCategory);
      expect(on.activationOffer).toBe(off.activationOffer);
      expect(on.recoveryLevel).toBe(off.recoveryLevel);
      expect(on.loadLevel).toBe(off.loadLevel);
      expect(JSON.stringify(on.classified)).toBe(JSON.stringify(off.classified));
      expect(on.parityPass).toBe(true);
    }
  });

  it("shadow parity >= 95% with bus on", () => {
    const turns = FOUNDER_MESSAGES.map((t) => captureTurn(t, true));
    const passes = turns.filter((t) => t.parityPass).length;
    const pct = (passes / turns.length) * 100;
    expect(pct).toBeGreaterThanOrEqual(95);
    mockStorage();
    localStorage.setItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus, "1");
    ingestClassifiedUserSignals(
      { struggles: ["overwhelm"], questions: [], emotions: [] },
      { source: "chat" },
    );
    expect(getShadowSignalStore().signals.length).toBeGreaterThan(0);
  });

  it("bus performance p95 under 10ms for 100 emits", () => {
    mockStorage();
    localStorage.setItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus, "1");
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
    expect(bench.p95Ms).toBeLessThan(10);
  });

  it("dedupe effective for identical rapid emits", () => {
    mockStorage();
    localStorage.setItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus, "1");
    clearShadowSignalStoreForTests();
    const input = {
      domain: "emotional" as const,
      category: "overwhelm",
      source: "chat",
      emitter: "test.dedupe",
    };
    emitCompanionSignal(input);
    const second = emitCompanionSignal(input);
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.deduped).toBe(true);
    expect(getShadowSignalStore().signals).toHaveLength(1);
  });
});
