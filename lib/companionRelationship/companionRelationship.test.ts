import { describe, expect, it, beforeEach } from "vitest";
import {
  evaluateCompanionRelationship,
  resolveVisitIntent,
  rhythmForStyle,
  LEARNING_OFFER_QUIET,
  LEARNING_OFFER_FRONT_PORCH,
  clearCompanionRelationshipStoreForTests,
  recordCompanionRelationshipVisitPattern,
  getCompanionRelationshipLearning,
  markCompanionRelationshipOfferShown,
  isMemoryTriggerVisitEligible,
  COMPANION_RELATIONSHIP_STYLES_CATALOG,
} from "./index";

describe("Companion Relationship™", () => {
  beforeEach(() => {
    clearCompanionRelationshipStoreForTests();
  });

  it("defines three relationship styles with distinct rhythm", () => {
    expect(COMPANION_RELATIONSHIP_STYLES_CATALOG).toHaveLength(3);
    const quiet = rhythmForStyle("quiet-companion");
    const balanced = rhythmForStyle("balanced-companion");
    const porch = rhythmForStyle("front-porch-companion");

    expect(quiet.greetingLength).toBe("brief");
    expect(porch.greetingLength).toBe("rich");
    expect(quiet.memoryTriggerVisitModulo).toBeGreaterThan(balanced.memoryTriggerVisitModulo);
    expect(porch.memoryTriggerVisitModulo).toBeLessThan(balanced.memoryTriggerVisitModulo);
    expect(quiet.speedToWork).toBe("immediate");
    expect(porch.speedToWork).toBe("gentle");
  });

  it("defaults to balanced companion", () => {
    const verdict = evaluateCompanionRelationship();
    expect(verdict.style).toBe("balanced-companion");
    expect(verdict.constitutionalRule).toContain("Shari remains Shari");
  });

  it("Dynamic Visit Awareness — work intent overrides front porch pace", () => {
    const verdict = evaluateCompanionRelationship({
      style: "front-porch-companion",
      userText: "Help me create an SOP.",
    });
    expect(verdict.visitIntent).toBe("work_now");
    expect(verdict.rhythm.speedToWork).toBe("immediate");
    expect(verdict.rhythm.prioritizeWorkRouting).toBe(true);
    expect(verdict.rhythm.preferLivingRoomLinger).toBe(false);
  });

  it("Dynamic Visit Awareness — linger intent keeps conversation", () => {
    const verdict = evaluateCompanionRelationship({
      style: "quiet-companion",
      userText: "I don't even know where to start.",
    });
    expect(verdict.visitIntent).toBe("linger");
    expect(verdict.rhythm.preferLivingRoomLinger).toBe(true);
    expect(verdict.rhythm.speedToWork).toBe("gentle");
  });

  it("offers quiet style once after repeated quick-work visits", () => {
    for (let i = 0; i < 5; i++) {
      recordCompanionRelationshipVisitPattern("quick_work");
    }
    const verdict = evaluateCompanionRelationship({ style: "balanced-companion" });
    expect(verdict.learningOffer).toBe(LEARNING_OFFER_QUIET);

    markCompanionRelationshipOfferShown("suggest-quiet");
    const again = evaluateCompanionRelationship({ style: "balanced-companion" });
    expect(again.learningOffer).toBeNull();
  });

  it("offers front porch once after repeated linger visits", () => {
    for (let i = 0; i < 5; i++) {
      recordCompanionRelationshipVisitPattern("linger");
    }
    const verdict = evaluateCompanionRelationship({ style: "quiet-companion" });
    expect(verdict.learningOffer).toBe(LEARNING_OFFER_FRONT_PORCH);
  });

  it("memory trigger eligibility scales with relationship rhythm", () => {
    const quiet = rhythmForStyle("quiet-companion");
    const porch = rhythmForStyle("front-porch-companion");
    expect(isMemoryTriggerVisitEligible(quiet, 4)).toBe(false);
    expect(isMemoryTriggerVisitEligible(porch, 3)).toBe(true);
  });

  it("resolveVisitIntent detects SOP and overwhelm patterns", () => {
    expect(resolveVisitIntent({ userText: "Help me create an SOP." })).toBe("work_now");
    expect(resolveVisitIntent({ userText: "I don't know where to start." })).toBe("linger");
    expect(resolveVisitIntent({ overwhelmed: true })).toBe("linger");
  });

  it("records visit patterns in learning store", () => {
    recordCompanionRelationshipVisitPattern("quick_work");
    expect(getCompanionRelationshipLearning().quickWorkVisitCount).toBe(1);
  });
});
