/**
 * 101 — Boundaries, recognition, celebration, pulse, conversation certification.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  assertCompletionKindsNeverAutoEvidence,
  assertNotEvidenceByDefault,
  buildBusinessPulse,
  buildCelebrationRouteOffer,
  buildRecognitionReviewOffer,
  classifyProgressRecognition,
  completionMayBecomeEvidenceWithoutDiscovery,
  evaluateEvidenceEligibility,
  explainHowMovedBusinessForward,
  fingerprintRecognition,
  getRecognitionPreferences,
  getRecognitionSurfaceBoundary,
  inPlaceCelebrationMessage,
  listWinRecords,
  parseRecognitionConversationIntent,
  pickPrimaryReviewCandidate,
  recognitionCopyPassesTone,
  resetProgressRecognitionAdaptersForTests,
  resetRecognitionPreferencesForTests,
  resolveCelebrationChoice,
  resolveCelebrationSound,
  saveAccomplishmentRecord,
  saveEvidenceRecognitionRecord,
  saveWinRecord,
  setRecognitionPreferences,
  wouldDuplicateRecognition,
  RECOGNITION_LANGUAGE,
  RECOGNITION_SURFACE_BOUNDARIES,
} from "./index";
import { applyRecognitionReviewChoice } from "./applyReviewChoice";

describe("101 progress recognition — boundaries", () => {
  beforeEach(() => {
    resetProgressRecognitionAdaptersForTests();
    resetRecognitionPreferencesForTests();
  });

  afterEach(() => {
    resetProgressRecognitionAdaptersForTests();
    resetRecognitionPreferencesForTests();
  });

  it("keeps distinct surface responsibilities", () => {
    expect(RECOGNITION_SURFACE_BOUNDARIES.length).toBe(7);
    expect(getRecognitionSurfaceBoundary("business_pulse").ownsRecords).toBe(
      false,
    );
    expect(getRecognitionSurfaceBoundary("wins").neverTreatAs).toContain(
      "evidence_vault",
    );
    expect(
      getRecognitionSurfaceBoundary("hall_of_accomplishments").neverTreatAs,
    ).toContain("evidence_vault");
    assertNotEvidenceByDefault("win");
    assertNotEvidenceByDefault("accomplishment");
  });

  it("win is not Evidence; accomplishment is not Evidence", () => {
    const win = saveWinRecord({
      title: "Finished audience section",
      significance: "meaningful",
      sourceType: "section",
      sourceId: "sec-1",
      occurredAt: "2026-07-21T10:00:00.000Z",
    });
    expect("winId" in win).toBe(true);

    const acc = saveAccomplishmentRecord({
      title: "Published workshop blueprint",
      sourceType: "blueprint",
      sourceId: "bp-1",
      occurredAt: "2026-07-21T11:00:00.000Z",
    });
    expect("accomplishmentId" in acc).toBe(true);

    const refused = saveEvidenceRecognitionRecord({
      discovery: "",
      sourceType: "blueprint",
      sourceId: "bp-1",
    });
    expect("refused" in refused).toBe(true);
  });

  it("Evidence requires discovery — completions never auto-Evidence", () => {
    assertCompletionKindsNeverAutoEvidence();
    expect(
      completionMayBecomeEvidenceWithoutDiscovery("project_finished"),
    ).toBe(false);
    expect(
      evaluateEvidenceEligibility({ completionOnly: true }).eligible,
    ).toBe(false);
    expect(
      evaluateEvidenceEligibility({
        discoveryText: "Reminder emails lifted registrations",
      }).eligible,
    ).toBe(true);

    const saved = saveEvidenceRecognitionRecord({
      discovery: "Reminder emails lifted registrations",
      pattern: "Send three days before",
    });
    expect("evidenceId" in saved).toBe(true);
  });
});

describe("101 progress recognition — classification", () => {
  beforeEach(() => {
    resetRecognitionPreferencesForTests();
  });

  it("meaningful progress becomes candidate win", () => {
    const cands = classifyProgressRecognition({
      sourceType: "section",
      sourceId: "s1",
      title: "Audience and Offer sections",
      isMeaningfulSection: true,
      workId: "work-1",
    });
    expect(cands.some((c) => c.kind === "win")).toBe(true);
    expect(cands.every((c) => c.kind !== "evidence")).toBe(true);
  });

  it("major completion becomes candidate accomplishment", () => {
    const cands = classifyProgressRecognition({
      sourceType: "blueprint",
      sourceId: "bp1",
      title: "Workshop Blueprint",
      isMajorDeliverable: true,
      isLaunchOrDelivery: true,
      durableBusinessAsset: true,
    });
    expect(cands.some((c) => c.kind === "accomplishment")).toBe(true);
  });

  it("trivial actions do not trigger", () => {
    const cands = classifyProgressRecognition({
      sourceType: "task",
      sourceId: "t1",
      title: "Clicked save",
      isTrivialClick: true,
    });
    expect(cands).toHaveLength(0);
  });

  it("honors do-not-suggest preference", () => {
    setRecognitionPreferences({ doNotSuggestRecognition: true });
    const cands = classifyProgressRecognition({
      sourceType: "section",
      sourceId: "s2",
      title: "Big section",
      isMeaningfulSection: true,
    });
    expect(cands).toHaveLength(0);
  });

  it("duplicate protection blocks repeat wins", () => {
    resetProgressRecognitionAdaptersForTests();
    const first = saveWinRecord({
      title: "Same moment",
      significance: "meaningful",
      sourceType: "section",
      sourceId: "dup-1",
      occurredAt: "2026-07-21T12:00:00.000Z",
    });
    expect("winId" in first).toBe(true);
    const second = saveWinRecord({
      title: "Same moment",
      significance: "meaningful",
      sourceType: "section",
      sourceId: "dup-1",
      occurredAt: "2026-07-21T15:00:00.000Z",
    });
    expect("duplicateOf" in second).toBe(true);
    const fp = fingerprintRecognition({
      sourceType: "section",
      sourceId: "dup-1",
      kind: "win",
      title: "Same moment",
      occurredAt: "2026-07-21T15:00:00.000Z",
    });
    expect(wouldDuplicateRecognition(fp, listWinRecords(), [])).toBe(true);
  });

  it("user can decline review", () => {
    const cands = classifyProgressRecognition({
      sourceType: "section",
      sourceId: "s3",
      title: "Offer clarity",
      isMeaningfulSection: true,
    });
    const primary = pickPrimaryReviewCandidate(cands)!;
    const offer = buildRecognitionReviewOffer(primary)!;
    expect(offer.choices.some((c) => c.id === "not_this_time")).toBe(true);
    const result = applyRecognitionReviewChoice({
      candidate: primary,
      choiceId: "not_this_time",
    });
    expect(result.outcome).toBe("declined");
  });

  it("separate evidence candidate when discovery present", () => {
    const cands = classifyProgressRecognition({
      sourceType: "blueprint",
      sourceId: "bp2",
      title: "Workshop launch",
      isMajorDeliverable: true,
      isLaunchOrDelivery: true,
      discoveryText: "Reminder emails increased registrations",
    });
    expect(cands.some((c) => c.kind === "accomplishment")).toBe(true);
    expect(cands.some((c) => c.kind === "evidence")).toBe(true);
  });
});

describe("101 progress recognition — celebration", () => {
  beforeEach(() => {
    resetProgressRecognitionAdaptersForTests();
  });

  it("win routes to Garden; accomplishment routes to Hall", () => {
    const winOffer = buildCelebrationRouteOffer({
      recognitionType: "win",
      recognitionId: "w1",
      title: "Section done",
      returnPath: { workId: "work-9", sectionId: "sec-a" },
    });
    expect(winOffer.placeId).toBe("gardens");
    expect(winOffer.returnPath?.workId).toBe("work-9");

    const hallOffer = buildCelebrationRouteOffer({
      recognitionType: "accomplishment",
      recognitionId: "a1",
      title: "Blueprint published",
      returnPath: { workId: "work-9" },
    });
    expect(hallOffer.placeId).toBe("portfolio");
  });

  it("celebrate-here preserves return path and records celebration", () => {
    const offer = buildCelebrationRouteOffer({
      recognitionType: "win",
      recognitionId: "w2",
      title: "Returned after stuck",
      returnPath: { workId: "work-2", sectionId: "s1" },
    });
    const resolved = resolveCelebrationChoice({
      recognitionType: "win",
      recognitionId: "w2",
      choiceId: "here",
      offer,
    });
    expect(resolved.celebrateInPlace).toBe(true);
    expect(resolved.celebration?.returnPath?.workId).toBe("work-2");
    expect(inPlaceCelebrationMessage("Returned after stuck")).toMatch(
      /moved your business forward/,
    );
  });

  it("no sound by default; quiet hours suppress", () => {
    const defaults = getRecognitionPreferences();
    expect(defaults.neverAutoPlayCelebrationSounds).toBe(true);

    const auto = resolveCelebrationSound({
      chosenId: "gentle_chime",
      memberRequestedPlay: false,
    });
    expect(auto.willPlay).toBe(false);

    setRecognitionPreferences({ quietHoursEnabled: true });
    const quiet = resolveCelebrationSound({
      chosenId: "gentle_chime",
      memberRequestedPlay: true,
    });
    expect(quiet.willPlay).toBe(false);
  });

  it("recognition language stays grounded", () => {
    expect(recognitionCopyPassesTone(RECOGNITION_LANGUAGE.meaningfulProgress)).toBe(
      true,
    );
    expect(recognitionCopyPassesTone("Amazing!!! You're crushing it")).toBe(
      false,
    );
  });
});

describe("101 progress recognition — Business Pulse", () => {
  beforeEach(() => {
    resetProgressRecognitionAdaptersForTests();
  });

  it("does not invent business impact when unconnected", () => {
    const explanation = explainHowMovedBusinessForward({
      completedLabel: "Audience section",
    });
    expect(explanation.unclear).toBe(true);
    expect(explanation.unclearMessage).toMatch(/not yet connected/);
  });

  it("reads wins and accomplishments into pulse without owning them", () => {
    saveWinRecord({
      title: "Clarified offer",
      significance: "meaningful",
      sourceType: "decision",
      sourceId: "d1",
      occurredAt: new Date().toISOString(),
    });
    saveAccomplishmentRecord({
      title: "Delivered October workshop",
      sourceType: "project",
      sourceId: "p1",
      occurredAt: new Date().toISOString(),
    });
    const pulse = buildBusinessPulse();
    // Pulse is a read model — boundaries declare ownsRecords: false
    expect(getRecognitionSurfaceBoundary("business_pulse").ownsRecords).toBe(
      false,
    );
    expect(pulse.recentWinCount).toBeGreaterThanOrEqual(1);
    expect(pulse.recentAccomplishmentCount).toBeGreaterThanOrEqual(1);
    expect(pulse.primaryStatement.length).toBeGreaterThan(0);
    expect(pulse.disclosure).toBeTruthy();
  });
});

describe("101 progress recognition — conversation", () => {
  it("parses save win, hall, celebrate, garden, hall, sound, evidence", () => {
    expect(parseRecognitionConversationIntent("Save that as a win.").intent.type).toBe(
      "save_as_win",
    );
    expect(
      parseRecognitionConversationIntent(
        "That belongs in my Hall of Accomplishments.",
      ).intent.type,
    ).toBe("add_to_hall");
    expect(parseRecognitionConversationIntent("I want to celebrate.").intent.type).toBe(
      "celebrate",
    );
    expect(
      parseRecognitionConversationIntent("Take me to the Celebration Garden.")
        .placeId,
    ).toBe("gardens");
    expect(
      parseRecognitionConversationIntent("Take me to the Celebration Hall.")
        .placeId,
    ).toBe("portfolio");
    expect(
      parseRecognitionConversationIntent("Play a gentle celebration sound.")
        .intent.type,
    ).toBe("play_gentle_sound");
    expect(parseRecognitionConversationIntent("No sound.").intent.type).toBe(
      "no_sound",
    );
    expect(
      parseRecognitionConversationIntent("How did this move my business forward?")
        .intent.type,
    ).toBe("explain_business_forward");
    expect(
      parseRecognitionConversationIntent(
        "Save what I learned in the Evidence Vault.",
      ).intent.type,
    ).toBe("save_learning_evidence");
    expect(
      parseRecognitionConversationIntent("Do not save this as an accomplishment.")
        .intent.type,
    ).toBe("decline_accomplishment");
  });
});
