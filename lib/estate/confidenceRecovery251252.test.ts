/**
 * Binding tests for Confidence Recovery (251) + Evidence Retrieval (252).
 */
import { describe, expect, it } from "vitest";
import {
  CONFIDENCE_RECOVERY_GOAL,
  CONFIDENCE_RECOVERY_PURPOSE,
  CONFIDENCE_RECOVERY_SEARCH_SOURCES,
  CONFIDENCE_RECOVERY_TRIGGER_EXAMPLES,
  EVIDENCE_RETRIEVAL_CONTEXT_DIMENSIONS,
  EVIDENCE_RETRIEVAL_MAX_ITEMS,
  EVIDENCE_RETRIEVAL_SOURCES,
  detectsConfidenceRecoveryNeed,
  formatConfidenceRecoveryMessage,
  inferEmotionalState,
  retrieveEvidenceReminders,
  runConfidenceRecovery,
} from "./confidenceRecoveryEngine";
import { shouldRecommendEvidenceVault } from "./evidenceIntelligence";

describe("251 Confidence Recovery Engine", () => {
  it("binds purpose, goal, triggers, and search sources", () => {
    expect(CONFIDENCE_RECOVERY_PURPOSE).toMatch(
      /meaningful evidence rather than generic encouragement/i,
    );
    expect(CONFIDENCE_RECOVERY_GOAL).toBe(
      "The goal is restoration, not motivation.",
    );
    expect(CONFIDENCE_RECOVERY_TRIGGER_EXAMPLES).toContain("I can't do this.");
    expect(CONFIDENCE_RECOVERY_TRIGGER_EXAMPLES).toContain("I'm overwhelmed.");
    expect(CONFIDENCE_RECOVERY_SEARCH_SOURCES).toContain("Evidence Vault");
    expect(CONFIDENCE_RECOVERY_SEARCH_SOURCES).toContain(
      "Hall of Accomplishments",
    );
  });

  it("detects recovery triggers from the standard", () => {
    expect(detectsConfidenceRecoveryNeed("I can't do this.")).toBe(true);
    expect(detectsConfidenceRecoveryNeed("I'm overwhelmed.")).toBe(true);
    expect(detectsConfidenceRecoveryNeed("I'm failing.")).toBe(true);
    expect(detectsConfidenceRecoveryNeed("Nothing is working.")).toBe(true);
    expect(detectsConfidenceRecoveryNeed("What should I work on today?")).toBe(
      false,
    );
  });

  it("infers emotional state and runs recovery without motivation fluff", () => {
    expect(inferEmotionalState("I'm overwhelmed at work")).toBe("overwhelmed");
    expect(inferEmotionalState("I can't do this")).toBe("fear");
    const result = runConfidenceRecovery("Nothing is working and I'm failing.");
    expect(result?.triggered).toBe(true);
    expect(result?.message).toMatch(/restoration, not motivation/i);
    expect(result?.message).not.toMatch(/you'?ve got this!|just believe/i);
  });

  it("aligns vault recommend with confidence recovery triggers", () => {
    expect(shouldRecommendEvidenceVault("I can't do this.")).toBe(true);
    expect(shouldRecommendEvidenceVault("I'm overwhelmed.")).toBe(true);
  });
});

describe("252 Evidence Retrieval Intelligence", () => {
  it("binds sources, context dimensions, and max items", () => {
    expect(EVIDENCE_RETRIEVAL_SOURCES).toEqual([
      "Evidence Vault",
      "Hall of Accomplishments",
      "Celebration Garden",
      "Wins Timeline",
      "Journal",
      "Projects",
    ]);
    expect(EVIDENCE_RETRIEVAL_CONTEXT_DIMENSIONS).toContain(
      "Current conversation",
    );
    expect(EVIDENCE_RETRIEVAL_CONTEXT_DIMENSIONS).toContain(
      "Similar past successes",
    );
    expect(EVIDENCE_RETRIEVAL_MAX_ITEMS).toBe(3);
  });

  it("never overwhelms — returns at most a small set", () => {
    const items = retrieveEvidenceReminders({
      conversationText: "I'm discouraged about my launch",
      maxItems: 10,
    });
    expect(items.length).toBeLessThanOrEqual(EVIDENCE_RETRIEVAL_MAX_ITEMS);
  });

  it("formats empty retrieval as restoration invitation, not a long list", () => {
    const message = formatConfidenceRecoveryMessage([]);
    expect(message).toMatch(/Evidence Vault/);
    expect(message).toMatch(/restoration, not motivation/i);
    expect(message.split("\n").length).toBeLessThan(12);
  });
});
