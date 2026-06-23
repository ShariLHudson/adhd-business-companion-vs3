import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FounderWarning } from "./founderEarlyWarning";
import {
  assertTrustSafeMessage,
  buildCompanionImprovementHint,
  buildRecentlyImprovedSummary,
  buildRecoveryMessage,
  buildRecoveryMessageForMisunderstanding,
  buildUserTrustCommunicationProfile,
  classifyImprovement,
  detectSurveillanceRisk,
  detectTechnicalLanguage,
  evaluateCommunicationTrust,
  evaluateFounderIssueCommunication,
  formatRecoveryMessage,
  generateWhatsNewSummary,
  inferImprovementArea,
  isInternalOnlyTopic,
  registerInternalImprovement,
  resetTrustSafeCommunicationForTests,
  sanitizeUserFacingMessage,
  translateInternalToExternal,
} from "./trustSafeCommunication";

describe("trustSafeCommunication", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    resetTrustSafeCommunicationForTests();
  });

  it("classifies internal diagnostics as internal only", () => {
    const decision = classifyImprovement({
      internalSummary: "Routing defect in intervention weighting algorithm",
      userExperiencedImpact: false,
      recoveryNeeded: false,
    });
    expect(decision.shouldCommunicate).toBe(false);
    expect(decision.category).toBe("internal_only");
  });

  it("allows recovery when user experienced impact", () => {
    const decision = classifyImprovement({
      internalSummary: "Workspace abandoned after wrong intervention",
      userExperiencedImpact: true,
      recoveryNeeded: true,
    });
    expect(decision.shouldCommunicate).toBe(true);
    expect(decision.category).toBe("user_experienced_problem");
    expect(decision.trustImpact).toBe("positive");
  });

  it("translates meaningful improvements to user benefits", () => {
    const benefit = translateInternalToExternal("Project memory persistence improved");
    expect(benefit).toMatch(/remembering where you left off/i);
    expect(benefit).not.toMatch(/bug|defect|algorithm/i);
  });

  it("builds trust-safe recovery messages without technical language", () => {
    const msg = buildRecoveryMessage({ informationPreserved: true, readyToContinue: true });
    const formatted = formatRecoveryMessage(msg);
    expect(formatted).toMatch(/didn't work the way it should/i);
    expect(formatted).toMatch(/corrected/i);
    expect(formatted).toMatch(/preserved|continue/i);
    expect(formatted).not.toMatch(/routing defect|scoring|synchronization/i);
    expect(assertTrustSafeMessage(formatted).safe).toBe(true);
  });

  it("builds recovery for misunderstanding types", () => {
    const msg = buildRecoveryMessageForMisunderstanding("wrong_intervention");
    expect(formatRecoveryMessage(msg)).toMatch(/continue/i);
  });

  it("detects surveillance-risk language", () => {
    expect(detectSurveillanceRisk("We tracked your behavior and analyzed your actions")).toBe(
      true,
    );
    expect(detectSurveillanceRisk("Based on your experience, here's a next step")).toBe(false);
  });

  it("sanitizes surveillance phrasing to trust-safe alternatives", () => {
    const sanitized = sanitizeUserFacingMessage(
      "We tracked your behavior and detected you were stuck.",
    );
    expect(sanitized).toMatch(/Based on your experience/i);
    expect(sanitized).not.toMatch(/tracked your behavior/i);
  });

  it("detects and rejects technical user-facing language", () => {
    const bad = "A routing defect was detected. A synchronization failure happened.";
    expect(detectTechnicalLanguage(bad)).toBe(true);
    const evalResult = evaluateCommunicationTrust(bad);
    expect(evalResult.buildsTrust).toBe(false);
    expect(evalResult.couldCreateConcern).toBe(true);
  });

  it("flags internal-only founder issues as not user-communicable by default", () => {
    const warning: FounderWarning = {
      id: "w1",
      category: "emerging",
      title: "Companion scoring drift",
      summary: "Behavioral model tuning caused recommendation ranking changes",
      metric: "intervention_failure",
      trustImpact: 10,
      confidenceImpact: 8,
      retentionImpact: 5,
      businessImpact: 4,
      usersAffected: 0,
      detectedAt: new Date().toISOString(),
    };
    const decision = evaluateFounderIssueCommunication(warning);
    expect(decision.category).toBe("internal_only");
    expect(decision.shouldCommunicate).toBe(false);
  });

  it("generates whats new from registered improvements", () => {
    registerInternalImprovement({
      id: "imp-1",
      internalSummary: "Conversation continuity issue fixed",
      area: "conversation_continuity",
      userExperiencedImpact: false,
      recoveryNeeded: false,
    });
    const summary = generateWhatsNewSummary();
    expect(summary.items.length).toBeGreaterThan(0);
    expect(summary.items[0]?.benefit).toMatch(/seamless|continu/i);
    expect(summary.items[0]?.benefit).not.toMatch(/fixed|bug/i);
  });

  it("builds recently improved without bugs or failures", () => {
    const recent = buildRecentlyImprovedSummary();
    expect(recent.heading).toMatch(/Recently improved/i);
    for (const item of recent.items) {
      expect(item.toLowerCase()).not.toMatch(/\bbug\b|\bfailure\b|\bdefect\b|\bscoring\b/);
    }
  });

  it("adjusts trust profile for users who recently corrected the companion", () => {
    const profile = buildUserTrustCommunicationProfile({
      trustScore: 55,
      recentCorrections: 3,
      explicitCorrectionJustNow: true,
    });
    expect(profile.level).toBe("minimal");
    expect(profile.prefersMinimalExplanation).toBe(true);
  });

  it("provides companion improvement hints as benefits not fixes", () => {
    const hint = buildCompanionImprovementHint("follow_through");
    expect(hint).toMatch(/follow-through/i);
    expect(hint).not.toMatch(/we fixed/i);
  });

  it("infers improvement areas from internal summaries", () => {
    expect(inferImprovementArea("Decision Compass support improved")).toBe("decision_support");
    expect(isInternalOnlyTopic("analytics dashboard routing failure")).toBe(true);
  });
});
