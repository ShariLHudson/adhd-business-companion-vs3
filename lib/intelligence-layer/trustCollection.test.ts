import { beforeEach, describe, expect, it, vi } from "vitest";
import { PROFILE_LEARNING_FLAG_KEYS, TRUST_INSPECTOR_FLAG_KEYS } from "./featureFlags";
import {
  initCompanionSession,
  resetCompanionSessionForTests,
} from "./companionSession";
import { getIntelligenceProfile } from "./profileStore";
import { getIntelligenceSignalStore } from "./signalStore";
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

describe("trust collection integration", () => {
  beforeEach(() => {
    mockStorage();
    resetCompanionSessionForTests();
    resetTrustDiagnosticsForTests();
    resetTrustAuditLogForTests();
    localStorage.removeItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning);
    localStorage.removeItem(TRUST_INSPECTOR_FLAG_KEYS.trustInspector);
    initCompanionSession();
  });

  it("end-to-end: record → diagnostics → no evolution when gated", () => {
    recordTrustEvidence({
      category: "trust.suggestion_accepted",
      offerKey: "plan-my-day",
      source: "integration-test",
    });
    recordTrustEvidence({
      category: "trust.offer_rendered",
      offerKey: "breathe",
      source: "integration-test",
    });

    const diag = getTrustCollectionDiagnostics();
    expect(diag.recorded).toBe(2);
    expect(diag.evolved).toBe(0);
    expect(diag.blocked).toBe(2);
    expect(diag.blockedByReason).toEqual({
      profile_learning_disabled: 1,
      render_only_signal: 1,
    });
    expect(getIntelligenceSignalStore().signals).toHaveLength(2);
    expect(getIntelligenceProfile().relationship.trust.responds_to_suggestions).toBeUndefined();
  });

  it("end-to-end: learning ON evolves dismiss into disengages trait", () => {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    const result = recordTrustEvidence({
      category: "trust.suggestion_dismissed",
      offerKey: "clear-mind",
      source: "integration-test",
    });
    expect(result.decision.evolve).toBe(true);
    const profile = getIntelligenceProfile();
    expect(profile.relationship.trust.disengages_from_nagging?.observations).toBe(1);
    expect(getTrustCollectionDiagnostics().evolved).toBe(1);
  });

  it("persists audit trail when inspector ON with blocked and evolved entries", () => {
    localStorage.setItem(TRUST_INSPECTOR_FLAG_KEYS.trustInspector, "1");
    recordTrustEvidence({
      category: "trust.suggestion_accepted",
      offerKey: "plan-my-day",
      source: "integration-test",
    });
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    recordTrustEvidence({
      category: "trust.suggestion_dismissed",
      offerKey: "clear-mind",
      source: "integration-test",
    });
    const log = getTrustAuditLog();
    expect(log).toHaveLength(2);
    expect(log[0]?.evolve).toBe(false);
    expect(log[0]?.traitDeltas).toEqual([]);
    expect(log[1]?.evolve).toBe(true);
    expect(log[1]?.traitDeltas.length).toBeGreaterThan(0);
  });
});
