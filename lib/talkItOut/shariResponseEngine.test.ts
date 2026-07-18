import { describe, expect, it } from "vitest";
import {
  TALK_IT_OUT_OPENING,
  TALK_IT_OUT_SHARI_OPENING,
  TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT,
  applyShariResponseEngine,
  buildShariResponseEngineLlmContext,
  countQuestionMarks,
  scrubShariAiTells,
} from "@/lib/talkItOut";

describe("Shari Response Engine", () => {
  it("keeps the canonical opening unchanged", () => {
    expect(TALK_IT_OUT_SHARI_OPENING).toBe("What would you like to talk through?");
    expect(TALK_IT_OUT_OPENING).toBe(TALK_IT_OUT_SHARI_OPENING);
  });

  it("exposes the full system prompt for every-turn LLM use", () => {
    expect(TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT).toContain(
      "What would you like to talk through?",
    );
    expect(TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT).toContain(
      "Never give advice",
    );
    const ctx = buildShariResponseEngineLlmContext({
      messages: [{ role: "user", content: "I'm stuck on hiring." }],
      verbatimUsed: false,
    });
    expect(ctx.systemPrompt).toBe(TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT);
    expect(ctx.verbatim_used).toBe(false);
  });

  it("scrubs AI chatbot tells", () => {
    expect(
      scrubShariAiTells("It sounds like you're feeling torn. What's next?"),
    ).not.toMatch(/it sounds like/i);
    expect(scrubShariAiTells("Great question! What's hard?")).not.toMatch(
      /great question/i,
    );
  });

  it("distressed turns drop the question", () => {
    const result = applyShariResponseEngine({
      userText: "I'm terrified and falling apart about this.",
      draftText: "You're scared.\n\nWhat feels hardest?",
      messages: [],
      verbatimUsed: false,
      lastMoveWasSkip: false,
      seed: 1,
    });
    expect(result.mode).toBe("distressed");
    expect(result.text).not.toContain("?");
    expect(countQuestionMarks(result.text)).toBe(0);
  });

  it("redirects direct asks for the answer", () => {
    const result = applyShariResponseEngine({
      userText: "Just tell me what I should do.",
      draftText: "You should hire someone.\n\nWhat role?",
      messages: [],
      verbatimUsed: false,
      lastMoveWasSkip: false,
      seed: 2,
    });
    expect(result.mode).toBe("answer_redirect");
    expect(result.text).toMatch(/with you, not for you/i);
    expect(countQuestionMarks(result.text)).toBe(1);
    expect(result.text).not.toMatch(/you should/i);
  });

  it("closing names insight and asks for their smallest next move", () => {
    const result = applyShariResponseEngine({
      userText: "Oh. That's exactly it — I'm avoiding the hire.",
      draftText: "Interesting.\n\nWhat else?",
      messages: [],
      verbatimUsed: false,
      lastMoveWasSkip: false,
      seed: 3,
    });
    expect(result.mode).toBe("closing");
    expect(result.text).toMatch(/smallest next move/i);
    expect(countQuestionMarks(result.text)).toBe(1);
  });

  it("names the loop after the same worry repeats 3 times", () => {
    const worry = "I keep putting off hiring a marketing person again.";
    let fingerprint: string | null = null;
    let count = 0;
    let last = applyShariResponseEngine({
      userText: worry,
      draftText: "Hiring is hard.\n\nWhat is making you consider it now?",
      messages: [],
      verbatimUsed: false,
      lastMoveWasSkip: false,
      worryFingerprint: fingerprint,
      worryRepeatCount: count,
      seed: 4,
    });
    fingerprint = last.worryFingerprint;
    count = last.worryRepeatCount;
    last = applyShariResponseEngine({
      userText: worry,
      draftText: "Still circling.\n\nWhat is making you consider it now?",
      messages: [{ role: "user", content: worry }],
      verbatimUsed: false,
      lastMoveWasSkip: false,
      worryFingerprint: fingerprint,
      worryRepeatCount: count,
      seed: 5,
    });
    fingerprint = last.worryFingerprint;
    count = last.worryRepeatCount;
    last = applyShariResponseEngine({
      userText: worry,
      draftText: "Still circling.\n\nWhat is making you consider it now?",
      messages: [
        { role: "user", content: worry },
        { role: "user", content: worry },
      ],
      verbatimUsed: false,
      lastMoveWasSkip: false,
      worryFingerprint: fingerprint,
      worryRepeatCount: count,
      seed: 6,
    });
    expect(last.mode).toBe("loop_named");
    expect(last.text).toMatch(/same worry keeps circling/i);
    expect(countQuestionMarks(last.text)).toBe(1);
  });

  it("never skips two turns in a row", () => {
    const short = "I'm stuck.";
    const first = applyShariResponseEngine({
      userText: short,
      draftText: "Stuck.\n\nWhat feels unfinished?",
      messages: [],
      verbatimUsed: false,
      lastMoveWasSkip: false,
      seed: 7,
    });
    // short/clear → skip allowed first
    expect(first.lastMoveWasSkip).toBe(true);

    const second = applyShariResponseEngine({
      userText: short,
      draftText: "Still stuck.\n\nWhat feels unfinished?",
      messages: [{ role: "user", content: short }],
      verbatimUsed: false,
      lastMoveWasSkip: true,
      seed: 8,
    });
    expect(second.lastMoveWasSkip).toBe(false);
    expect(second.lastMove).not.toBe("skip");
  });

  it("keeps at most one question mark", () => {
    const result = applyShariResponseEngine({
      userText: "I have three projects and no idea where to start this week.",
      draftText:
        "A lot at once.\n\nWhich one first? And what about the others?",
      messages: [],
      verbatimUsed: false,
      lastMoveWasSkip: false,
      seed: 9,
    });
    expect(countQuestionMarks(result.text)).toBe(1);
  });
});
