/**
 * Regression: the answer-first how-to fail-safe must be useful, not a generic
 * planning scaffold — and must stay honest (no invented facts) on high-stakes
 * legal / medical / financial questions. It still only fills an absent answer.
 */
import { describe, expect, it } from "vitest";

import { buildAnswerFirstFailSafeReply } from "./index";
import { localFallbackMayReplace } from "./answerPreservation";
import { isIllegalTopicLabel } from "@/lib/topicContinuityAnchorIntelligence";

const NETWORKING =
  "What is the best way to determine how to network at a meeting I have not been to before and don't know anyone?";

const BANNED = [
  /clarify what success looks like/i,
  /break the work into a clear sequence/i,
  /watch for common mistakes/i,
  /tell me your audience, constraints, and timeline/i,
  /here’s a practical way to approach/i,
  /here's a practical way to approach/i,
];

describe("how-to fail-safe — useful and honest", () => {
  it("1 + 2. the networking question drops the generic scaffold and does not echo the whole question", () => {
    const reply = buildAnswerFirstFailSafeReply(NETWORKING);
    expect(reply).toBeTruthy();
    for (const re of BANNED) expect(reply!).not.toMatch(re);
    // No awkward verbatim echo of the full question.
    expect(reply!).not.toContain("determine how to network at a meeting");
    // Topic-specific, genuinely useful networking guidance.
    expect(reply!.toLowerCase()).toMatch(/arrive early|standing on their own|listen|follow up/);
  });

  it("3. a simple practical how-to gets a concise, subject-named response", () => {
    const reply = buildAnswerFirstFailSafeReply("How do I organize my email inbox?");
    expect(reply).toBeTruthy();
    for (const re of BANNED) expect(reply!).not.toMatch(re);
    expect(reply!.toLowerCase()).toMatch(/email inbox/);
    expect(reply!.length).toBeGreaterThan(40);
  });

  it("4. a high-stakes legal question is not answered with invented legal guidance", () => {
    const reply = buildAnswerFirstFailSafeReply(
      "How do I set up an LLC for my business?",
    );
    expect(reply).toBeTruthy();
    const lower = reply!.toLowerCase();
    // Honest safe response, not fabricated legal steps.
    expect(lower).toMatch(/depends on your specifics|rules in force|professional/);
    expect(lower).not.toMatch(/file (?:form|articles)|\$\d|step 1|register with the (?:state|secretary)/);
    for (const re of BANNED) expect(reply!).not.toMatch(re);
  });

  it("5. a high-stakes medical question is not answered with invented medical guidance", () => {
    const reply = buildAnswerFirstFailSafeReply("How do I treat a fever at home?");
    expect(reply).toBeTruthy();
    const lower = reply!.toLowerCase();
    expect(lower).toMatch(/depends on your specifics|professional|safest next step/);
    // No fabricated dosages / drug names / clinical instructions.
    expect(lower).not.toMatch(/\bmg\b|ibuprofen|acetaminophen|take \d|every \d hours/);
  });

  it("6. the fail-safe can stand alone — no compulsory trailing question", () => {
    for (const q of [
      NETWORKING,
      "How do I organize my email inbox?",
      "How do I set up an LLC for my business?",
    ]) {
      const reply = buildAnswerFirstFailSafeReply(q);
      expect(reply).toBeTruthy();
      expect(reply!.trim().endsWith("?")).toBe(false);
    }
  });

  it("7. an absent model answer still yields a non-empty safe fallback", () => {
    const reply = buildAnswerFirstFailSafeReply("How do I plan a small workshop?");
    expect(reply && reply.trim().length).toBeGreaterThan(0);
  });

  it("8. a substantive model answer is never replaced by the fallback", () => {
    const substantive =
      "Arrive early, find someone standing alone, and open with a genuine question.";
    expect(
      localFallbackMayReplace({
        finalizedAnswer: substantive,
        hasModelRepair: false,
      }),
    ).toBe(false);
    expect(
      localFallbackMayReplace({ finalizedAnswer: "", hasModelRepair: false }),
    ).toBe(true);
  });

  it("9. non-how-to fail-safe branches are unchanged", () => {
    // Advice branch still reasons through, not a how-to scaffold.
    const advice = buildAnswerFirstFailSafeReply(
      "Should I raise my prices or keep them where they are?",
    );
    expect(advice).toBeTruthy();
    expect(advice!.toLowerCase()).toMatch(/tradeoff|optimizing|considered|tip this/);
    // Troubleshooting QR branch still returns its concrete checklist.
    const qr = buildAnswerFirstFailSafeReply(
      "My QR code won't scan from my computer screen — how do I fix it?",
    );
    expect(qr).toBeTruthy();
    expect(qr!.toLowerCase()).toMatch(/brightness|glare|steady|different phone/);
  });

  it("10. the 3afa60bd topic-anchor keyword-dump guard stays green", () => {
    expect(isIllegalTopicLabel("best way determine network meeting before")).toBe(
      true,
    );
    expect(isIllegalTopicLabel("hiring a marketing assistant")).toBe(false);
  });
});
