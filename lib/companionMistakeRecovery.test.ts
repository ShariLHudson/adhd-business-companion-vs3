import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  analyzeTurnForMistakes,
  buildTrustRepairProfile,
  classifyMisunderstanding,
  computeRecoveryEffectivenessScore,
  detectExplicitCorrection,
  detectFrustrationSignal,
  detectRepeatedFailure,
  detectSoftCorrection,
  getMistakePenaltyForIntervention,
  getMistakeRecords,
  getMistakeRecoveryDashboardSlice,
  getUserHelpPreferences,
  processMistakeSignalsFromUserTurn,
  recordBehavioralMistakeSignal,
  recordMistake,
  recordRecoveryOutcome,
  recordTrustRepair,
  resetMistakeRecoveryForTests,
  shouldSuppressIntervention,
} from "./companionMistakeRecovery";
import {
  getAdaptiveInterventionWeight,
  recordInterventionLifecycle,
  resetInterventionLearningForTests,
} from "./companionInterventionLearning";
import { buildCompanionEffectivenessDashboard, resetClosedLoopLearningForTests } from "./closedLoopLearning";

describe("companionMistakeRecovery", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    resetMistakeRecoveryForTests();
    resetInterventionLearningForTests();
    resetClosedLoopLearningForTests();
  });

  it("detects explicit user corrections", () => {
    expect(detectExplicitCorrection("No. That's not what I meant.")).toBe(true);
    expect(detectExplicitCorrection("You're missing the point.")).toBe(true);
    expect(detectExplicitCorrection("Yes, let's do that")).toBe(false);
  });

  it("classifies wrong routing from explicit correction after offer", () => {
    const type = classifyMisunderstanding({
      signalKind: "explicit_correction",
      userText: "No, that's not it.",
      hadRecentOffer: true,
      interventionId: "decision_compass",
    });
    expect(type).toBe("wrong_intervention");
  });

  it("detects soft correction when user restates the problem", () => {
    expect(
      detectSoftCorrection(
        "What I really meant is I'm overwhelmed by email",
        "Try opening Clear My Mind",
      ),
    ).toBe(true);
  });

  it("records mistake from user correction turn", () => {
    const record = processMistakeSignalsFromUserTurn({
      userText: "You don't understand — that's not the issue.",
      lastAssistantText: "Let's use Decision Compass.",
      hadRecentOffer: true,
      lastInterventionId: "decision_compass",
    });
    expect(record).not.toBeNull();
    expect(getMistakeRecords()).toHaveLength(1);
    expect(getMistakeRecords()[0]?.interventionId).toBe("decision_compass");
  });

  it("tracks behavioral corrections from repeated dismissals", () => {
    for (let i = 0; i < 3; i++) {
      recordInterventionLifecycle({
        interventionId: "decision_compass",
        stage: "recommended",
      });
      recordBehavioralMistakeSignal({
        interventionId: "decision_compass",
        kind: "dismissed",
      });
    }
    expect(getMistakeRecords().length).toBeGreaterThan(0);
  });

  it("detects repeated failure and suppresses intervention", () => {
    for (let i = 0; i < 12; i++) {
      recordInterventionLifecycle({
        interventionId: "decision_compass",
        stage: "recommended",
      });
      recordInterventionLifecycle({
        interventionId: "decision_compass",
        stage: "dismissed",
      });
    }
    const failure = detectRepeatedFailure("decision_compass");
    expect(failure.failed).toBe(true);
    expect(shouldSuppressIntervention("decision_compass")).toBe(true);
  });

  it("reduces adaptive weight after repeated failures", () => {
    for (let i = 0; i < 10; i++) {
      recordInterventionLifecycle({
        interventionId: "decision_compass",
        stage: "recommended",
      });
      recordInterventionLifecycle({
        interventionId: "decision_compass",
        stage: "dismissed",
      });
    }
    recordInterventionLifecycle({
      interventionId: "clear_my_mind",
      stage: "recommended",
    });
    recordInterventionLifecycle({
      interventionId: "clear_my_mind",
      stage: "accepted",
    });
    recordInterventionLifecycle({
      interventionId: "clear_my_mind",
      stage: "completed",
    });

    const compassWeight = getAdaptiveInterventionWeight("decision_compass");
    const clearWeight = getAdaptiveInterventionWeight("clear_my_mind");
    expect(compassWeight).toBeLessThan(clearWeight);
    expect(getMistakePenaltyForIntervention("decision_compass", 80)).toBeLessThan(40);
  });

  it("tracks trust repair success and recovery effectiveness", () => {
    const mistake = recordMistake({
      signalKind: "frustration",
      misunderstanding: "wrong_intervention",
      userText: "Stop suggesting that tool",
      interventionId: "clear_my_mind",
    });
    recordTrustRepair({ mistakeId: mistake.id, successful: true, recoverySpeedMs: 4000 });
    recordRecoveryOutcome({
      mistakeId: mistake.id,
      repairAttempted: true,
      conversationContinued: true,
      outcomeAchieved: true,
    });

    const profile = buildTrustRepairProfile();
    expect(profile.trustRepairs).toBeGreaterThan(0);
    expect(profile.recentRepairsSuccessful).toBeGreaterThan(0);
    expect(computeRecoveryEffectivenessScore()).toBeGreaterThan(0);
  });

  it("learns user help preferences from corrections", () => {
    recordMistake({
      signalKind: "soft_correction",
      misunderstanding: "wrong_timing",
      userText: "Let's just talk first — not ready for a tool",
    });
    const prefs = getUserHelpPreferences();
    expect(prefs.conversation_first).toBeGreaterThan(0);
  });

  it("detects frustrated user signals", () => {
    expect(detectFrustrationSignal("I'm so frustrated, you keep suggesting the wrong thing")).toBe(
      true,
    );
    const analysis = analyzeTurnForMistakes({
      userText: "This isn't helping. Stop suggesting things.",
      lastAssistantText: "Open Decision Compass?",
      hadRecentOffer: true,
    });
    expect(analysis?.signalKind).toBe("frustration");
    expect(analysis?.needsRepair).toBe(true);
  });

  it("extends effectiveness dashboard with mistake recovery metrics", () => {
    recordMistake({
      signalKind: "explicit_correction",
      misunderstanding: "wrong_problem",
      userText: "That's not the real problem",
      interventionId: "decision_compass",
    });
    recordRecoveryOutcome({
      mistakeId: getMistakeRecords()[0]!.id,
      repairAttempted: true,
      conversationContinued: true,
      outcomeAchieved: false,
    });

    const slice = getMistakeRecoveryDashboardSlice();
    expect(slice.topMisunderstandingTypes.length).toBeGreaterThan(0);
    expect(slice.recoveredConversations).toBeGreaterThan(0);

    const dashboard = buildCompanionEffectivenessDashboard();
    expect(dashboard.mistakeRecovery).toBeDefined();
    expect(dashboard.mistakeRecovery.recoveryEffectivenessScore).toBeGreaterThanOrEqual(0);
  });
});
