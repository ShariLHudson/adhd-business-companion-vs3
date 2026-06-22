import { beforeEach, describe, expect, it, vi } from "vitest";
import { PROFILE_LEARNING_FLAG_KEYS, SIGNAL_BUS_FLAG_KEYS, TRUST_INSPECTOR_FLAG_KEYS } from "./featureFlags";
import { initCompanionSession, resetCompanionSessionForTests } from "./companionSession";
import { getIntelligenceProfile } from "./profileStore";
import { getIntelligenceSignalStore } from "./signalStore";
import { clearShadowSignalStoreForTests, getShadowSignalStore } from "./shadowSignalStore";
import {
  getTrustCollectionDiagnostics,
  resetTrustDiagnosticsForTests,
} from "./trustDiagnostics";
import { getTrustAuditLog, resetTrustAuditLogForTests } from "./trustEvolutionAudit";
import { recordTrustEvidence } from "./trustSignals";

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

describe("trustSignals", () => {
  beforeEach(() => {
    mockStorage();
    resetCompanionSessionForTests();
    resetTrustDiagnosticsForTests();
    resetTrustAuditLogForTests();
    clearShadowSignalStoreForTests();
    localStorage.removeItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning);
    localStorage.removeItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus);
    localStorage.removeItem(TRUST_INSPECTOR_FLAG_KEYS.trustInspector);
    initCompanionSession(new Date("2026-06-22T12:00:00.000Z"));
  });

  it("records trust signal with attribution meta when learning is OFF", () => {
    const result = recordTrustEvidence({
      category: "trust.suggestion_accepted",
      offerKey: "clear-mind",
      source: "test:clear-mind",
    });
    expect(result.signal.domain).toBe("trust");
    expect(result.signal.category).toBe("suggestion_accepted");
    expect(result.signal.meta?.interventionBucket).toBe("clear_mind");
    expect(result.signal.meta?.sessionId).toBeTruthy();
    expect(result.decision.evolve).toBe(false);
    expect(result.decision.reason).toBe("profile_learning_disabled");
    expect(getIntelligenceSignalStore().signals).toHaveLength(1);
    expect(getIntelligenceProfile().relationship.trust.responds_to_suggestions).toBeUndefined();
  });

  it("evolves trust traits when learning ON and attribution valid", () => {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    const result = recordTrustEvidence({
      category: "trust.suggestion_accepted",
      offerKey: "clear-mind",
      source: "test",
    });
    expect(result.decision.evolve).toBe(true);
    expect(result.attribution?.interventionBucket).toBe("clear_mind");
    const profile = getIntelligenceProfile();
    expect(profile.relationship.trust.responds_to_suggestions?.observations).toBe(1);
  });

  it("records signal but blocks evolution for unknown bucket", () => {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    const result = recordTrustEvidence({
      category: "trust.suggestion_accepted",
      offerKey: "totally-unknown-offer",
      source: "test",
    });
    expect(getIntelligenceSignalStore().signals).toHaveLength(1);
    expect(result.decision.evolve).toBe(false);
    expect(result.decision.reason).toBe("unknown_intervention_bucket");
    expect(getIntelligenceProfile().relationship.trust.responds_to_suggestions).toBeUndefined();
  });

  it("never evolves offer_rendered", () => {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    const result = recordTrustEvidence({
      category: "trust.offer_rendered",
      offerKey: "breathe",
      source: "test",
    });
    expect(result.decision.evolve).toBe(false);
    expect(result.decision.reason).toBe("render_only_signal");
  });

  it("never evolves system suppression signals", () => {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    const suppressed = recordTrustEvidence({
      category: "trust.offer_suppressed",
      offerKey: "momentum_offer",
      source: "test",
      causationType: "system_suppressed",
    });
    expect(suppressed.decision.evolve).toBe(false);
    expect(suppressed.decision.reason).toBe("system_causation");
    expect(getIntelligenceProfile().relationship.trust.disengages_from_nagging).toBeUndefined();
  });

  it("mirrors to bus when bus flag is ON", () => {
    localStorage.setItem(SIGNAL_BUS_FLAG_KEYS.unifiedBus, "1");
    const result = recordTrustEvidence({
      category: "trust.suggestion_dismissed",
      offerKey: "generic-tip",
      source: "test",
    });
    expect(result.busMirrored).toBe(true);
    expect(getShadowSignalStore().signals.length).toBeGreaterThan(0);
    expect(getShadowSignalStore().signals[0]?.domain).toBe("trust");
  });

  it("does not persist audit entry when trust inspector flag is OFF", () => {
    recordTrustEvidence({
      category: "trust.suggestion_accepted",
      offerKey: "clear-mind",
      source: "test",
    });
    expect(getTrustAuditLog()).toHaveLength(0);
  });

  it("persists blocked audit entry with empty traitDeltas when inspector ON", () => {
    localStorage.setItem(TRUST_INSPECTOR_FLAG_KEYS.trustInspector, "1");
    recordTrustEvidence({
      category: "trust.suggestion_accepted",
      offerKey: "clear-mind",
      source: "test",
    });
    const log = getTrustAuditLog();
    expect(log).toHaveLength(1);
    expect(log[0]?.evolve).toBe(false);
    expect(log[0]?.reason).toBe("profile_learning_disabled");
    expect(log[0]?.traitDeltas).toEqual([]);
    expect(log[0]?.interventionBucket).toBe("clear_mind");
    expect(log[0]?.attributionValid).toBe(true);
  });

  it("persists evolved audit entry with traitDeltas when inspector ON", () => {
    localStorage.setItem(TRUST_INSPECTOR_FLAG_KEYS.trustInspector, "1");
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    recordTrustEvidence({
      category: "trust.suggestion_accepted",
      offerKey: "clear-mind",
      source: "test",
    });
    const log = getTrustAuditLog();
    expect(log).toHaveLength(1);
    expect(log[0]?.evolve).toBe(true);
    expect(log[0]?.reason).toBe("evolved");
    expect(log[0]?.traitDeltas.length).toBeGreaterThan(0);
    const responds = log[0]?.traitDeltas.find(
      (d) => d.path === "relationship.trust.responds_to_suggestions",
    );
    expect(responds?.before).toBeNull();
    expect(responds?.after.observations).toBe(1);
  });

  it("continues collection when audit persistence throws", async () => {
    localStorage.setItem(TRUST_INSPECTOR_FLAG_KEYS.trustInspector, "1");
    const auditModule = await import("./trustEvolutionAudit");
    vi.spyOn(auditModule, "appendTrustAuditEntry").mockImplementation(() => {
      throw new Error("audit write failed");
    });
    const result = recordTrustEvidence({
      category: "trust.offer_rendered",
      offerKey: "breathe",
      source: "test",
    });
    expect(result.signal.domain).toBe("trust");
    expect(getIntelligenceSignalStore().signals).toHaveLength(1);
    expect(getTrustCollectionDiagnostics().recorded).toBe(1);
  });
});
