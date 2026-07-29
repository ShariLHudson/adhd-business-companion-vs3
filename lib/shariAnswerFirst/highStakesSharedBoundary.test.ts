/**
 * Regression: the high-stakes honesty guard now sits at a single shared boundary
 * before ordinary substantive-fallback selection, so a legal / tax / medical /
 * regulated-finance / insurance question gets the honest safe fallback no matter
 * which substantive intent the classifier assigns (how-to, advice, comparison,
 * brainstorming, troubleshooting, planning, explanation, research). Non-substantive
 * turns and ordinary low-risk fallbacks are unchanged.
 */
import { describe, expect, it } from "vitest";

import { buildAnswerFirstFailSafeReply } from "./index";
import { localFallbackMayReplace } from "./answerPreservation";
import { isIllegalTopicLabel } from "@/lib/topicContinuityAnchorIntelligence";

const SAFE = /depends on your specifics|rules in force|safest next step|confirm it with a professional/i;
const INVENTED =
  /file (?:form|articles)|register with the (?:state|secretary)|\bstep 1\b|\$\d|\d+\s*mg\b|ibuprofen|acetaminophen|every \d+ hours|\d+%\s*(?:return|interest)|buy \d+ shares/i;

function reply(q: string): string {
  const r = buildAnswerFirstFailSafeReply(q);
  expect(r, `expected a fallback for "${q}"`).toBeTruthy();
  return r!;
}

describe("shared high-stakes boundary covers every substantive intent", () => {
  it("1. a legal question that classifies as troubleshooting gets the safe fallback", () => {
    const r = reply("Should I take legal action against a client who won't pay?");
    expect(r).toMatch(SAFE);
    expect(r).not.toMatch(INVENTED);
    // Proves the fix: previously this returned "Let's troubleshoot…".
    expect(r.toLowerCase()).not.toContain("let’s troubleshoot");
    expect(r.toLowerCase()).not.toContain("let's troubleshoot");
  });

  it("2. a medical question framed as brainstorming gets the safe fallback", () => {
    const r = reply("Brainstorm ways to treat my chronic migraines without medication.");
    expect(r).toMatch(SAFE);
    expect(r).not.toMatch(INVENTED);
  });

  it("3. a tax question framed as planning gets the safe fallback", () => {
    const r = reply("Help me plan how to handle my quarterly business taxes.");
    expect(r).toMatch(SAFE);
    expect(r).not.toMatch(INVENTED);
  });

  it("4. a regulated-finance question framed as explanation gets the safe fallback", () => {
    const r = reply("Explain whether I should move my 401k into an index fund.");
    expect(r).toMatch(SAFE);
    expect(r).not.toMatch(INVENTED);
  });

  it("5. a high-stakes question cannot bypass the guard via its classification", () => {
    const highStakes = [
      "Should I take legal action against a client who won't pay?", // troubleshooting
      "Brainstorm ways to reduce my payroll tax legally.", // brainstorming
      "Help me plan how to set up an LLC.", // planning
      "Explain whether I should buy stocks right now.", // explanation
      "How do I handle a wrongful-termination lawsuit?", // how-to
      "Should I form an LLC or S-corp?", // comparison / advice
    ];
    for (const q of highStakes) {
      const r = reply(q);
      expect(r, `bypassed guard: "${q}"`).toMatch(SAFE);
      expect(r, `invented specifics: "${q}"`).not.toMatch(INVENTED);
    }
  });

  it("6. existing how-to high-stakes behavior stays green", () => {
    expect(reply("How do I set up an LLC for my business?")).toMatch(SAFE);
  });

  it("7. existing advice / comparison high-stakes behavior stays green", () => {
    expect(reply("Should I form an LLC or S-corp?")).toMatch(SAFE);
    expect(reply("Which is better for taxes, an LLC or an S-corp?")).toMatch(SAFE);
  });

  it("8. a normal troubleshooting question still gets the troubleshooting fallback", () => {
    const r = reply("My QR code won't scan from my computer screen — how do I fix it?");
    expect(r).not.toMatch(SAFE);
    expect(r.toLowerCase()).toMatch(/brightness|glare|steady|different phone/);
  });

  it("9. a normal brainstorming question still gets the brainstorming fallback", () => {
    const r = reply("Give me ideas for promoting my new workshop.");
    expect(r).not.toMatch(SAFE);
    expect(r.toLowerCase()).toMatch(/varied angles|direct outreach|partnership|visibility/);
  });

  it("10. a normal planning question still gets the ordinary planning fallback", () => {
    const r = reply("Help me plan the steps to launch my new service.");
    expect(r).not.toMatch(SAFE);
    expect(r.toLowerCase()).toMatch(/launch|service|one piece you can act on/);
    // Not the retired generic scaffold.
    expect(r).not.toMatch(/clarify what success looks like|break the work into a clear sequence/i);
  });

  it("11. a substantive model answer is never replaced by the fallback", () => {
    const substantive =
      "An LLC gives liability protection with pass-through taxes; an S-corp can lower self-employment tax once profit is steady.";
    expect(
      localFallbackMayReplace({ finalizedAnswer: substantive, hasModelRepair: false }),
    ).toBe(false);
    expect(
      localFallbackMayReplace({ finalizedAnswer: "", hasModelRepair: false }),
    ).toBe(true);
  });

  it("12. non-substantive turns are unaffected — the guard never fires for them", () => {
    // Bare acceptance and unresolved contextual replies still yield null even
    // when they contain a high-stakes word (guard is scoped to substantive intents).
    expect(buildAnswerFirstFailSafeReply("yes")).toBeNull();
    expect(buildAnswerFirstFailSafeReply("okay sounds good")).toBeNull();
  });

  it("13. the networking (49f8e1f2) regression stays green", () => {
    const r = reply(
      "What is the best way to introduce myself at a meeting where I don't know anyone?",
    );
    expect(r).not.toMatch(SAFE);
    expect(r.toLowerCase()).toMatch(/arrive early|standing on their own|listen|follow up/);
  });

  it("14. the topic-anchor keyword-dump (3afa60bd) regression stays green", () => {
    expect(isIllegalTopicLabel("best way determine network meeting before")).toBe(true);
    expect(isIllegalTopicLabel("hiring a marketing assistant")).toBe(false);
  });
});
