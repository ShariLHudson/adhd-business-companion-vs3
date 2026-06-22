import { beforeEach, describe, expect, it, vi } from "vitest";
import { evaluateCompanionTurn } from "@/lib/companionGovernor";
import { evaluateAndRecordEcosystem } from "@/lib/ecosystem-intelligence/ecosystemEngine";
import { PROFILE_LEARNING_FLAG_KEYS } from "./featureFlags";
import {
  initCompanionSession,
  resetCompanionSessionForTests,
} from "./companionSession";
import {
  observeEcosystemSuppressions,
  observeGovernorTurnSurface,
  resetGovernorTrustDedupeForTests,
} from "./governorTrustSignals";
import { getIntelligenceProfile } from "./profileStore";
import { getIntelligenceSignalStore } from "./signalStore";
import { resetTrustDiagnosticsForTests } from "./trustDiagnostics";
import type { WorkspaceOpenSnapshot } from "@/lib/workspaceExecution";
import { resolveIntent } from "@/lib/intentStabilizer";

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

const emptySnap: WorkspaceOpenSnapshot = {
  open: false,
  section: null,
  title: null,
  fieldCount: 0,
  filledCount: 0,
};

function governorInput(text: string) {
  return {
    userText: text,
    lastAssistantText: "",
    workspacePanel: null,
    workspaceSnap: emptySnap,
    resolvedIntent: resolveIntent(text),
  };
}

describe("governorTrustSignals", () => {
  beforeEach(() => {
    mockStorage();
    resetCompanionSessionForTests();
    resetTrustDiagnosticsForTests();
    resetGovernorTrustDedupeForTests();
    localStorage.removeItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning);
    initCompanionSession();
  });

  it("records ecosystem suppressions as trust.offer_suppressed", () => {
    const snapshot = evaluateAndRecordEcosystem({
      text: "burned out exhausted depleted, also have a business opportunity idea",
    });
    const trustSignals = getIntelligenceSignalStore().signals.filter(
      (s) => s.domain === "trust" && s.category === "offer_suppressed",
    );
    expect(trustSignals.length).toBeGreaterThan(0);
    expect(snapshot.suppressions.length).toBeGreaterThan(0);
    const first = trustSignals[0]!;
    expect(first.meta?.causationType).toBe("system_suppressed");
    expect(first.meta?.governorRuleId).toBe("ecosystem_priority");
    expect(first.category).not.toBe("suggestion_ignored");
    expect(first.category).not.toBe("suggestion_dismissed");
  });

  it("does not evolve trust traits for ecosystem suppression even when learning ON", () => {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    observeEcosystemSuppressions(
      evaluateAndRecordEcosystem({
        text: "burned out exhausted depleted, also have a business opportunity idea",
      }),
    );
    const profile = getIntelligenceProfile();
    expect(profile.relationship.trust.disengages_from_nagging).toBeUndefined();
    expect(profile.relationship.trust.ignores_generic_suggestions).toBeUndefined();
    expect(profile.relationship.trust.responds_to_suggestions).toBeUndefined();
  });

  it("records governor suppressCards as trust.offer_blocked", () => {
    const surface = evaluateCompanionTurn(
      governorInput("I feel completely overwhelmed and panicking"),
    );
    expect(surface.suppressCards).toBe(true);
    const blocked = getIntelligenceSignalStore().signals.filter(
      (s) => s.domain === "trust" && s.category === "offer_blocked",
    );
    expect(blocked.length).toBeGreaterThan(0);
    expect(blocked[0]!.meta?.governorRuleId).toBe("suppressCards");
    expect(blocked[0]!.meta?.causationType).toBe("system_blocked");
  });

  it("does not evolve trust traits for governor blocked signals when learning ON", () => {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
    const surface = evaluateCompanionTurn(
      governorInput("I feel completely overwhelmed and panicking"),
    );
    observeGovernorTurnSurface(surface, governorInput("I feel completely overwhelmed and panicking"));
    const profile = getIntelligenceProfile();
    expect(profile.relationship.trust.disengages_from_nagging).toBeUndefined();
    expect(profile.relationship.trust.responds_to_suggestions).toBeUndefined();
  });

  it("dedupes identical suppression emits within 60 seconds", () => {
    const snapshot = evaluateAndRecordEcosystem({
      text: "burned out exhausted depleted, also have a business opportunity idea",
    });
    const before = getIntelligenceSignalStore().signals.filter(
      (s) => s.category === "offer_suppressed",
    ).length;
    observeEcosystemSuppressions(snapshot);
    const after = getIntelligenceSignalStore().signals.filter(
      (s) => s.category === "offer_suppressed",
    ).length;
    expect(after).toBe(before);
  });
});
