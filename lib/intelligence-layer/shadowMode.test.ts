import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  classifyAndEmitChatSignals,
  legacyKeysFromClassified,
} from "./chatSignalAdapter";
import { ingestClassifiedUserSignals, getLastChatBusSummary } from "./ingest";
import { getIntelligenceProfile } from "./profileStore";
import { getShadowSignalStore } from "./shadowSignalStore";
import {
  compareEmittedParity,
  resetShadowDiagnosticsForTests,
} from "./shadowDiagnostics";
import { clearShadowSignalStoreForTests } from "./shadowSignalStore";
import { SIGNAL_BUS_FLAG_KEYS } from "./featureFlags";

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
}

function profileTraitsFingerprint() {
  const p = getIntelligenceProfile();
  const strip = (map: Record<string, { score: number; confidence: number; observations: number }>) =>
    Object.fromEntries(
      Object.entries(map).map(([k, v]) => [
        k,
        { score: v.score, confidence: v.confidence, observations: v.observations },
      ]),
    );
  const stripSection = (section: Record<string, Record<string, { score: number; confidence: number; observations: number }>>) =>
    Object.fromEntries(
      Object.entries(section).map(([k, m]) => [k, strip(m)]),
    );
  return JSON.stringify({
    signalCount: p.signalCount,
    human: stripSection(p.human as never),
    relationship: stripSection(p.relationship as never),
    business: stripSection(p.business as never),
    adhd: stripSection(p.adhd as never),
  });
}

describe("chatSignalAdapter", () => {
  beforeEach(() => {
    mockStorage();
    clearShadowSignalStoreForTests();
    resetShadowDiagnosticsForTests();
    localStorage.removeItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus);
  });

  it("maps overwhelmed message to legacy keys matching ingest domains", () => {
    const classified = {
      struggles: ["overwhelm" as const],
      questions: ["im_overwhelmed" as const],
      emotions: ["stuck" as const],
    };
    const keys = legacyKeysFromClassified(classified, "overwhelmed");
    expect(keys).toContain("emotional:overwhelm");
    expect(keys).toContain("conversation:im_overwhelmed");
    expect(keys).toContain("emotional:stuck");
  });

  it("does not emit when bus flag is off", () => {
    const summary = classifyAndEmitChatSignals({
      struggles: ["overwhelm"],
      questions: [],
      emotions: [],
    });
    expect(summary.emitted).toHaveLength(0);
    expect(getShadowSignalStore().signals).toHaveLength(0);
  });

  it("emits to shadow when flag is on", () => {
    localStorage.setItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus, "1");
    classifyAndEmitChatSignals({
      struggles: ["overwhelm"],
      questions: [],
      emotions: [],
    });
    expect(getShadowSignalStore().signals.length).toBeGreaterThan(0);
  });
});

describe("shadow mode integration", () => {
  beforeEach(() => {
    mockStorage();
    clearShadowSignalStoreForTests();
    resetShadowDiagnosticsForTests();
    localStorage.removeItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus);
  });

  const classified = {
    struggles: ["overwhelm" as const],
    questions: ["help_me_prioritize" as const],
    emotions: ["frustrated" as const],
  };

  function runIngest() {
    return ingestClassifiedUserSignals(classified, {
      source: "chat",
      emotionalState: "overwhelmed",
    });
  }

  it("legacy profile trait scores identical with flag off vs on", () => {
    runIngest();
    const profileOff = profileTraitsFingerprint();

    mockStorage();
    clearShadowSignalStoreForTests();
    localStorage.setItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus, "1");
    runIngest();
    const profileOn = profileTraitsFingerprint();

    expect(profileOn).toBe(profileOff);
  });

  it("shadow store populated only when flag on", () => {
    runIngest();
    expect(getShadowSignalStore().signals).toHaveLength(0);

    localStorage.setItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus, "1");
    runIngest();
    expect(getShadowSignalStore().signals.length).toBeGreaterThan(0);
  });

  it("parity passes for mirrored chat ingest", () => {
    localStorage.setItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus, "1");
    localStorage.setItem(SIGNAL_BUS_FLAG_KEYS.diagnostics, "1");
    const legacyKeys = legacyKeysFromClassified(classified, "overwhelmed");
    ingestClassifiedUserSignals(classified, {
      source: "chat",
      emotionalState: "overwhelmed",
    });
    const summary = getLastChatBusSummary();
    expect(summary).not.toBeNull();
    const shadowKeys = summary!.emitted.map((s) => `${s.domain}:${s.category}`);
    const { pass } = compareEmittedParity(summary!.legacyKeys, shadowKeys);
    expect(pass).toBe(true);
  });
});
