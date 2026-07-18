import { describe, expect, it } from "vitest";
import {
  TALK_IT_OUT_OPENING,
  TALK_IT_OUT_SHARI_OPENING,
  TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT,
  TALK_IT_OUT_STOCK_LINE_BANS,
  applyShariResponseEngine,
  buildShariResponseEngineLlmContext,
  countQuestionMarks,
  isMechanicalFragment,
  scrubShariAiTells,
  validateShariResponseEngineDraft,
} from "@/lib/talkItOut";

describe("Shari Response Engine", () => {
  it("keeps the canonical opening unchanged", () => {
    expect(TALK_IT_OUT_SHARI_OPENING).toBe("What would you like to talk through?");
    expect(TALK_IT_OUT_OPENING).toBe(TALK_IT_OUT_SHARI_OPENING);
  });

  it("exposes the revised system prompt for every-turn LLM use", () => {
    expect(TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT).toContain(
      "Prove you understood by what you ask",
    );
    expect(TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT).toContain(
      "Most replies are just ONE good question",
    );
    expect(TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT).toContain(
      "never a stock phrase",
    );
    expect(TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT).not.toContain(
      "micro-quote: echo just the 1-3 word",
    );
    const ctx = buildShariResponseEngineLlmContext({
      messages: [{ role: "user", content: "I'm stuck on hiring." }],
    });
    expect(ctx.systemPrompt).toBe(TALK_IT_OUT_SHARI_RESPONSE_ENGINE_PROMPT);
  });

  it("scrubs AI chatbot tells and stock bans", () => {
    expect(
      scrubShariAiTells("It sounds like you're feeling torn. What's next?"),
    ).not.toMatch(/it sounds like/i);
    expect(scrubShariAiTells("Great question! What's hard?")).not.toMatch(
      /great question/i,
    );
    for (const ban of TALK_IT_OUT_STOCK_LINE_BANS) {
      expect(scrubShariAiTells(`${ban} What matters?`)).not.toContain(
        ban.slice(0, 20),
      );
    }
  });

  it("does not invent stock distress lines — keeps model draft", () => {
    const draft =
      "Scared she'd vanish if you said something real — that's worth sitting with. Has staying quiet kept her close?";
    const result = validateShariResponseEngineDraft(draft);
    expect(result.text).toMatch(/staying quiet/i);
    expect(result.text).not.toMatch(/heavy one to carry/i);
    expect(result.text).not.toMatch(/right here with it/i);
  });

  it("does not invent loop stock lines", () => {
    const draft = "What keeps making you reopen the hire question this week?";
    const result = applyShariResponseEngine({
      userText: "I keep putting off hiring again.",
      draftText: draft,
      worryRepeatCount: 5,
    });
    expect(result.text).toBe(draft);
    expect(result.text).not.toMatch(/same worry keeps circling/i);
  });

  it("keeps at most one question mark", () => {
    const result = validateShariResponseEngineDraft(
      "Which one first? And what about the others?",
    );
    expect(countQuestionMarks(result.text)).toBe(1);
  });

  it("strips mechanical fragment preambles", () => {
    expect(isMechanicalFragment("Again.")).toBe(true);
    const result = validateShariResponseEngineDraft(
      "Again. What do you do with that feeling once it passes?",
    );
    expect(result.text).not.toMatch(/^Again\./);
    expect(result.text).toMatch(/feeling once it passes/i);
    expect(countQuestionMarks(result.text)).toBe(1);
  });

  it("allows a question-only turn", () => {
    const result = validateShariResponseEngineDraft(
      "What is making you consider a marketing hire this week?",
    );
    expect(result.questionOnly).toBe(true);
    expect(result.questionCount).toBe(1);
  });
});
