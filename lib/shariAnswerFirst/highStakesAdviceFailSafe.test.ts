/**
 * Regression: the high-stakes honesty rule now covers the advice / comparison
 * fallback paths too. A legal / tax / medical / regulated-finance / insurance
 * decision must not get an invented or authoritative recommendation when the
 * model answer is absent. Ordinary low-risk advice is unchanged.
 */
import { describe, expect, it } from "vitest";

import { buildAnswerFirstFailSafeReply } from "./index";
import { localFallbackMayReplace } from "./answerPreservation";
import { isIllegalTopicLabel } from "@/lib/topicContinuityAnchorIntelligence";

/** Honest safe-fallback signature (no fabricated specifics). */
const SAFE = /depends on your specifics|rules in force|safest next step|confirm it with a professional/i;

/** Fabricated specifics the safe fallback must never contain. */
const INVENTED =
  /file (?:form|articles)|register with the (?:state|secretary)|\bstep 1\b|\$\d|\d+\s*mg\b|ibuprofen|acetaminophen|every \d+ hours|\d+%\s*(?:return|interest)|buy \d+ shares/i;

function reply(q: string): string {
  const r = buildAnswerFirstFailSafeReply(q);
  expect(r, `expected a fallback for "${q}"`).toBeTruthy();
  return r!;
}

describe("high-stakes honesty extends to advice / comparison fallbacks", () => {
  it("1. LLC vs S-corp gets an honest safe fallback, not an invented recommendation", () => {
    const r = reply("Should I form an LLC or S-corp?");
    expect(r).toMatch(SAFE);
    expect(r).not.toMatch(INVENTED);
  });

  it("2. a legal advice question is not answered with fabricated legal conclusions", () => {
    const r = reply("Should I trademark my business name, or is that overkill?");
    expect(r).toMatch(SAFE);
    expect(r).not.toMatch(INVENTED);
  });

  it("3. a tax question is not answered with invented tax treatment", () => {
    const r = reply("Should I take the standard deduction or itemize on my taxes?");
    expect(r).toMatch(SAFE);
    expect(r).not.toMatch(INVENTED);
  });

  it("4. a financial recommendation is not answered with authoritative finance guidance", () => {
    const r = reply("Should I invest in stocks or an index fund with my savings?");
    expect(r).toMatch(SAFE);
    expect(r).not.toMatch(INVENTED);
  });

  it("5. a medical advice question still gets the safe high-stakes fallback", () => {
    const r = reply("Should I start taking medication for my high blood pressure?");
    expect(r).toMatch(SAFE);
    expect(r).not.toMatch(INVENTED);
  });

  it("6. a comparison-framed high-stakes question is guarded", () => {
    const r = reply("Which is better for taxes, an LLC or an S-corp?");
    expect(r).toMatch(SAFE);
    expect(r).not.toMatch(INVENTED);
  });

  it("6b. insurance decisions are covered by the widened detector", () => {
    const r = reply("Should I buy disability insurance for my business?");
    expect(r).toMatch(SAFE);
  });

  it("7. a normal low-risk advice question still uses the ordinary advice fallback", () => {
    const r = reply("Should I raise my prices or keep them the same?");
    expect(r).not.toMatch(SAFE);
    expect(r.toLowerCase()).toMatch(/tradeoff|optimizing|considered|tip this either way/);
  });

  it("8. the high-stakes advice fallback does not end with a compulsory question", () => {
    for (const q of [
      "Should I form an LLC or S-corp?",
      "Which is better for taxes, an LLC or an S-corp?",
    ]) {
      expect(reply(q).trim().endsWith("?")).toBe(false);
    }
  });

  it("9. a substantive model answer is never replaced by the fallback", () => {
    const substantive =
      "An LLC gives liability protection with simple pass-through taxes; an S-corp can lower self-employment tax once profit is steady.";
    expect(
      localFallbackMayReplace({ finalizedAnswer: substantive, hasModelRepair: false }),
    ).toBe(false);
    expect(
      localFallbackMayReplace({ finalizedAnswer: "", hasModelRepair: false }),
    ).toBe(true);
  });

  it("10. networking (49f8e1f2) and topic-anchor (3afa60bd) regressions stay green", () => {
    const net = reply(
      "What is the best way to introduce myself at a meeting where I don't know anyone?",
    );
    expect(net.toLowerCase()).toMatch(/arrive early|standing on their own|listen|follow up/);
    expect(net).not.toMatch(SAFE); // low-risk social question, not high-stakes
    expect(isIllegalTopicLabel("best way determine network meeting before")).toBe(true);
  });
});
