import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PROFILE_LEARNING_FLAG_KEYS,
  TRUST_INSPECTOR_FLAG_KEYS,
} from "./featureFlags";
import { getIntelligenceProfile, saveIntelligenceProfile } from "./profileStore";
import {
  getTrustCollectionDiagnostics,
  logTrustEvolutionDecision,
  recordTrustSignalRecorded,
  resetTrustDiagnosticsForTests,
} from "./trustDiagnostics";
import {
  appendTrustAuditEntry,
  resetTrustAuditLogForTests,
  type TrustAuditEntry,
} from "./trustEvolutionAudit";
import {
  buildTrustInspectorReport,
  exposeTrustInspectorToWindow,
  getTrustAuditLog,
  getTrustInspectorSummary,
  getTrustTraitSnapshot,
} from "./trustInspector";

function mockStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { localStorage: storage });
  vi.stubGlobal("structuredClone", (v: unknown) => JSON.parse(JSON.stringify(v)));
}

function entry(
  overrides: Partial<TrustAuditEntry> & Pick<TrustAuditEntry, "id">,
): TrustAuditEntry {
  return {
    at: "2026-06-22T12:00:00.000Z",
    trustCategory: "trust.suggestion_accepted",
    busCategory: "suggestion_accepted",
    source: "test",
    valence: "positive",
    attributionValid: true,
    evolve: false,
    reason: "profile_learning_disabled",
    traitDeltas: [],
    ...overrides,
  };
}

describe("trustInspector", () => {
  beforeEach(() => {
    mockStorage();
    resetTrustAuditLogForTests();
    resetTrustDiagnosticsForTests();
    localStorage.removeItem(TRUST_INSPECTOR_FLAG_KEYS.trustInspector);
    localStorage.removeItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning);
    saveIntelligenceProfile(
      structuredClone(getIntelligenceProfile()),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getTrustAuditLog", () => {
    beforeEach(() => {
      appendTrustAuditEntry(
        entry({
          id: "old",
          at: "2026-06-22T10:00:00.000Z",
          sessionId: "sess-a",
          trustCategory: "trust.offer_rendered",
          reason: "render_only_signal",
          evolve: false,
        }),
      );
      appendTrustAuditEntry(
        entry({
          id: "mid",
          at: "2026-06-22T11:00:00.000Z",
          sessionId: "sess-b",
          evolve: true,
          reason: "evolved",
          traitDeltas: [
            {
              path: "relationship.trust.responds_to_suggestions",
              before: null,
              after: {
                trait: "responds_to_suggestions",
                score: 51,
                confidence: 0.04,
                observations: 1,
                lastUpdated: "2026-06-22T11:00:00.000Z",
              },
            },
          ],
        }),
      );
      appendTrustAuditEntry(
        entry({
          id: "new",
          at: "2026-06-22T12:00:00.000Z",
          sessionId: "sess-b",
          reason: "system_causation",
          causationType: "system_blocked",
          evolve: false,
        }),
      );
    });

    it("returns newest first", () => {
      const log = getTrustAuditLog();
      expect(log.map((e) => e.id)).toEqual(["new", "mid", "old"]);
    });

    it("filters by sessionId, category, reason, evolve, and limit", () => {
      expect(getTrustAuditLog({ sessionId: "sess-b" }).map((e) => e.id)).toEqual([
        "new",
        "mid",
      ]);
      expect(
        getTrustAuditLog({ trustCategory: "trust.offer_rendered" }),
      ).toHaveLength(1);
      expect(getTrustAuditLog({ reason: "system_causation" })).toHaveLength(1);
      expect(getTrustAuditLog({ evolve: true })).toHaveLength(1);
      expect(getTrustAuditLog({ limit: 2 }).map((e) => e.id)).toEqual([
        "new",
        "mid",
      ]);
    });

    it("does not mutate persisted storage order", () => {
      getTrustAuditLog({ limit: 1 });
      const raw = JSON.parse(
        localStorage.getItem("companion-trust-evolution-audit-v1") ?? "{}",
      ) as { entries: TrustAuditEntry[] };
      expect(raw.entries.map((e) => e.id)).toEqual(["old", "mid", "new"]);
    });
  });

  describe("getTrustInspectorSummary", () => {
    it("derives counts from audit log when present", () => {
      appendTrustAuditEntry(
        entry({
          id: "1",
          evolve: false,
          reason: "profile_learning_disabled",
        }),
      );
      appendTrustAuditEntry(
        entry({
          id: "2",
          evolve: true,
          reason: "evolved",
        }),
      );
      appendTrustAuditEntry(
        entry({
          id: "3",
          trustCategory: "trust.offer_rendered",
          busCategory: "offer_rendered",
          reason: "render_only_signal",
          evolve: false,
        }),
      );
      appendTrustAuditEntry(
        entry({
          id: "4",
          interventionBucket: null,
          attributionError: "unknown_intervention_bucket",
          reason: "unknown_intervention_bucket",
          evolve: false,
        }),
      );
      appendTrustAuditEntry(
        entry({
          id: "5",
          causationType: "system_suppressed",
          reason: "system_causation",
          evolve: false,
        }),
      );

      const summary = getTrustInspectorSummary();
      expect(summary.recorded).toBe(5);
      expect(summary.evolved).toBe(1);
      expect(summary.blocked).toBe(4);
      expect(summary.blockedByReason).toEqual({
        profile_learning_disabled: 1,
        render_only_signal: 1,
        unknown_intervention_bucket: 1,
        system_causation: 1,
      });
      expect(summary.unknownBuckets).toBe(1);
      expect(summary.systemCaused).toBe(1);
      expect(summary.renderOnly).toBe(1);
    });

    it("falls back to in-memory diagnostics when audit log is empty", () => {
      recordTrustSignalRecorded();
      recordTrustSignalRecorded();
      logTrustEvolutionDecision({
        at: "2026-06-22T12:00:00.000Z",
        signalId: "s1",
        category: "trust.suggestion_accepted",
        evolve: false,
        reason: "profile_learning_disabled",
      });
      logTrustEvolutionDecision({
        at: "2026-06-22T12:00:01.000Z",
        signalId: "s2",
        category: "trust.suggestion_accepted",
        evolve: true,
        reason: "evolved",
      });

      const summary = getTrustInspectorSummary();
      expect(summary.recorded).toBe(2);
      expect(summary.evolved).toBe(1);
      expect(summary.blocked).toBe(1);
      expect(summary.blockedByReason).toEqual({
        profile_learning_disabled: 1,
      });
      expect(summary.unknownBuckets).toBe(0);
      expect(summary.systemCaused).toBe(0);
      expect(summary.renderOnly).toBe(0);
      expect(getTrustCollectionDiagnostics().recorded).toBe(2);
    });

    it("includes flag states", () => {
      localStorage.setItem(TRUST_INSPECTOR_FLAG_KEYS.trustInspector, "1");
      localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
      const summary = getTrustInspectorSummary();
      expect(summary.trustInspectorEnabled).toBe(true);
      expect(summary.profileLearningEnabled).toBe(true);
    });
  });

  describe("getTrustTraitSnapshot", () => {
    it("returns all four trust traits with unset status by default", () => {
      const snap = getTrustTraitSnapshot();
      expect(snap.responds_to_suggestions.path).toBe(
        "relationship.trust.responds_to_suggestions",
      );
      expect(snap.responds_to_suggestions.status).toBe("unset");
      expect(snap.ignores_generic_suggestions.status).toBe("unset");
      expect(snap.momentum_from_interventions.status).toBe("unset");
      expect(snap.disengages_from_nagging.status).toBe("unset");
    });

    it("computes learning and stable status", () => {
      const profile = getIntelligenceProfile();
      profile.relationship.trust.responds_to_suggestions = {
        trait: "responds_to_suggestions",
        score: 55,
        confidence: 0.1,
        observations: 2,
        lastUpdated: "2026-06-22T12:00:00.000Z",
      };
      profile.relationship.trust.disengages_from_nagging = {
        trait: "disengages_from_nagging",
        score: 60,
        confidence: 0.25,
        observations: 4,
        lastUpdated: "2026-06-22T12:00:00.000Z",
      };
      saveIntelligenceProfile(profile);

      const snap = getTrustTraitSnapshot();
      expect(snap.responds_to_suggestions.status).toBe("learning");
      expect(snap.disengages_from_nagging.status).toBe("stable");
    });

    it("includes recent evidence for mapped and delta traits", () => {
      appendTrustAuditEntry(
        entry({
          id: "blocked-accept",
          busCategory: "suggestion_accepted",
          evolve: false,
          reason: "profile_learning_disabled",
        }),
      );
      appendTrustAuditEntry(
        entry({
          id: "evolved-dismiss",
          busCategory: "suggestion_dismissed",
          evolve: true,
          reason: "evolved",
          traitDeltas: [
            {
              path: "relationship.trust.disengages_from_nagging",
              before: null,
              after: {
                trait: "disengages_from_nagging",
                score: 52,
                confidence: 0.04,
                observations: 1,
                lastUpdated: "2026-06-22T12:00:00.000Z",
              },
            },
          ],
        }),
      );

      const snap = getTrustTraitSnapshot();
      expect(snap.responds_to_suggestions.recentEvidence.map((e) => e.id)).toEqual(
        ["blocked-accept"],
      );
      expect(snap.momentum_from_interventions.recentEvidence.map((e) => e.id)).toEqual(
        ["blocked-accept"],
      );
      expect(snap.disengages_from_nagging.recentEvidence.map((e) => e.id)).toEqual(
        ["evolved-dismiss"],
      );
      expect(snap.ignores_generic_suggestions.recentEvidence).toEqual([]);
    });
  });

  describe("buildTrustInspectorReport", () => {
    it("includes summary, traits, and recent entries", () => {
      appendTrustAuditEntry(entry({ id: "r1", evolve: false }));
      const report = buildTrustInspectorReport();
      expect(report).toContain("Companion Trust Inspector");
      expect(report).toContain("recorded: 1");
      expect(report).toContain("relationship.trust.responds_to_suggestions");
      expect(report).toContain("profile_learning_disabled");
    });
  });

  describe("exposeTrustInspectorToWindow", () => {
    it("exposes helpers when inspector flag is ON", () => {
      localStorage.setItem(TRUST_INSPECTOR_FLAG_KEYS.trustInspector, "1");
      exposeTrustInspectorToWindow();
      const win = window as Window & {
        __companionTrustInspector?: () => string;
        __companionTrustAuditLog?: () => unknown[];
        __companionTrustTraits?: () => unknown;
        __companionTrustScenarios?: () => unknown[];
      };
      expect(typeof win.__companionTrustInspector).toBe("function");
      expect(typeof win.__companionTrustAuditLog).toBe("function");
      expect(typeof win.__companionTrustTraits).toBe("function");
      expect(typeof win.__companionTrustScenarios).toBe("function");
      expect(win.__companionTrustInspector?.()).toContain("Companion Trust Inspector");
    });

    it("does not expose helpers when inspector flag is OFF", () => {
      exposeTrustInspectorToWindow();
      const win = window as Window & {
        __companionTrustInspector?: () => string;
        __companionTrustScenarios?: () => unknown[];
      };
      expect(win.__companionTrustInspector).toBeUndefined();
      expect(win.__companionTrustScenarios).toBeUndefined();
    });

    it("is SSR-safe and does not throw", () => {
      vi.unstubAllGlobals();
      const originalWindow = globalThis.window;
      // @ts-expect-error — simulate SSR
      delete globalThis.window;
      expect(() => exposeTrustInspectorToWindow()).not.toThrow();
      globalThis.window = originalWindow;
    });
  });
});
