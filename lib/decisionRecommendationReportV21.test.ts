import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  advanceDecisionCompass,
  emptyDecisionCompassState,
  setDecisionType,
} from "./decisionCompass";
import {
  buildDecisionRecommendationReport,
  rawUserAnswersFromSession,
  reportUsesNonAuthoritativeLanguage,
} from "./decisionRecommendationReport";
import {
  containsFirstPerson,
  reportContainsRawUserPhrase,
  reportUsesSecondPersonVoice,
  synthesizeConcern,
} from "./decisionReportSynthesis";
import { enrichAuthority } from "./decisionCompassSessionAuthority";
import { snapshotFromPanelState } from "./decisionCompassSessionStore";

function sessionWithRawAnswers() {
  let state = emptyDecisionCompassState();
  state = advanceDecisionCompass(state, {
    decision: "Hire a salesperson or keep doing sales myself?",
  });
  state = advanceDecisionCompass(state, {
    options: "Hire a salesperson\n---\nKeep doing sales myself",
  });
  state = setDecisionType(state, "strategic");
  state = advanceDecisionCompass(state);
  state = advanceDecisionCompass(state, {
    "why-a": "I would rather be creating",
    "why-b": "save money",
    "concern-a": "because i don't like sales",
    "concern-b": "i suck at it",
    "concern-extra": "i don't know how much it would cost",
    freedom: "A",
    growth: "A",
    stress: "A",
  });
  const snap = snapshotFromPanelState(
    state,
    "Hire a salesperson",
    "Keep doing sales myself",
    "",
  );
  return enrichAuthority({
    ...snap,
    complete: true,
    recommendation: {
      type: "strategic",
      headline: "Strategic Recommendation",
      choice: "Hire a salesperson",
      summary: "Growth and freedom lead with hiring",
    },
  });
}

function reportBlob(report: NonNullable<ReturnType<typeof buildDecisionRecommendationReport>>) {
  return [
    ...report.whatWeNotice,
    ...report.potentialAdvantages,
    ...report.potentialConcerns,
    ...report.questionsWorthConsidering,
    ...report.alternativePaths,
    report.overallDirection?.summary ?? "",
    report.disclaimer,
  ].join("\n");
}

describe("Decision Compass V2.1 — report synthesis", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("1. report does not contain raw first-person user phrases", () => {
    const session = sessionWithRawAnswers();
    const report = buildDecisionRecommendationReport(session)!;
    const raw = [
      "because i don't like sales",
      "i suck at it",
      "i don't know how much it would cost",
      "I would rather be creating",
    ];
    const hit = reportContainsRawUserPhrase(reportBlob(report), raw);
    expect(hit).toBeNull();
  });

  it("2. report uses second-person companion language", () => {
    const report = buildDecisionRecommendationReport(sessionWithRawAnswers())!;
    expect(reportUsesSecondPersonVoice(reportBlob(report))).toBe(true);
  });

  it("3. report paraphrases concerns", () => {
    const report = buildDecisionRecommendationReport(sessionWithRawAnswers())!;
    expect(report.potentialConcerns.length).toBeGreaterThan(0);
    expect(
      report.potentialConcerns.some((c) =>
        /recurring theme|discussion suggests|uncertainty|financial/i.test(c),
      ),
    ).toBe(true);
    expect(
      report.potentialConcerns.every((c) => !containsFirstPerson(c)),
    ).toBe(true);
  });

  it("4. report paraphrases motivations", () => {
    const synthesized = synthesizeConcern("because i don't like sales");
    expect(synthesized).toMatch(/recurring theme/i);
    expect(containsFirstPerson(synthesized)).toBe(false);
  });

  it("5. report avoids transcript dumping", () => {
    const session = sessionWithRawAnswers();
    const report = buildDecisionRecommendationReport(session)!;
    const rawAnswers = rawUserAnswersFromSession(session);
    for (const section of [
      report.whatWeNotice,
      report.potentialAdvantages,
      report.potentialConcerns,
    ]) {
      for (const line of section) {
        for (const raw of rawAnswers) {
          if (raw.length >= 12) {
            expect(line.toLowerCase()).not.toContain(raw.toLowerCase());
          }
        }
      }
    }
  });

  it("6. What We Notice reads as a summary", () => {
    const report = buildDecisionRecommendationReport(sessionWithRawAnswers())!;
    expect(report.whatWeNotice[0]).toMatch(/exploring|tradeoff|discussion/i);
    expect(report.whatWeNotice[0]).not.toMatch(/^because\b/i);
  });

  it("7. Potential Advantages reads as interpretation", () => {
    const report = buildDecisionRecommendationReport(sessionWithRawAnswers())!;
    expect(report.potentialAdvantages.length).toBeGreaterThan(0);
    expect(
      report.potentialAdvantages.some((a) =>
        /potential benefit|bandwidth|align|upside|evidence/i.test(a),
      ),
    ).toBe(true);
  });

  it("8. Potential Concerns reads as interpretation", () => {
    const report = buildDecisionRecommendationReport(sessionWithRawAnswers())!;
    expect(
      report.potentialConcerns.every(
        (c) => c.length > 40 && !/^because\b/i.test(c),
      ),
    ).toBe(true);
  });

  it("9. questions are companion-generated", () => {
    const report = buildDecisionRecommendationReport(sessionWithRawAnswers())!;
    expect(report.questionsWorthConsidering.length).toBeGreaterThan(0);
    expect(
      report.questionsWorthConsidering.every((q) => q.endsWith("?")),
    ).toBe(true);
    expect(
      report.questionsWorthConsidering.some((q) =>
        /success|test|information|risk/i.test(q),
      ),
    ).toBe(true);
  });

  it("10. alternative paths are companion-generated", () => {
    const report = buildDecisionRecommendationReport(sessionWithRawAnswers())!;
    expect(report.alternativePaths.length).toBeGreaterThan(2);
    expect(
      report.alternativePaths.some((p) =>
        /commission|part-time|pilot|document/i.test(p),
      ),
    ).toBe(true);
  });

  it("11. overall direction remains non-authoritative", () => {
    const report = buildDecisionRecommendationReport(sessionWithRawAnswers())!;
    expect(reportUsesNonAuthoritativeLanguage(report)).toBe(true);
    expect(report.disclaimer).toMatch(/thinking tool/i);
    expect(report.overallDirection?.qualifier).toMatch(
      /Based on the information/i,
    );
  });

  it("12. report sounds natural when user answers are hidden", () => {
    const session = sessionWithRawAnswers();
    const report = buildDecisionRecommendationReport(session)!;
    const blob = reportBlob(report);
    const raw = rawUserAnswersFromSession(session);
    expect(reportContainsRawUserPhrase(blob, raw)).toBeNull();
    expect(blob).toMatch(/discussion|appears|emerged|exploring/i);
    expect(blob.split("\n").filter((l) => l.length > 20).length).toBeGreaterThan(
      4,
    );
  });
});
