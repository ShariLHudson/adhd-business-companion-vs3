import { describe, expect, it } from "vitest";

import {
  isDisplayableAssistantAnswer,
  localFallbackMayReplace,
} from "./answerPreservation";

// A substantive, streamed decision answer (imperfect but usable).
const SUBSTANTIVE_DECISION =
  "Spending $100 on a finance class can be worth it if it teaches you to read your numbers and price with confidence — that usually pays back many times over. If you already track cash flow and just want motivation, a $100 course is easy to skip. Before you buy, check whether the syllabus covers pricing, cash flow, and profit, and whether there's a refund.";

const SUBSTANTIVE_INFO =
  "A sales funnel is just the path someone takes from first hearing about you to buying: awareness, interest, decision, action. You don't need software to start — a simple note of where people drop off is enough.";

// Generic local-fallback templates that must never overwrite a substantive answer.
const GENERIC_TEMPLATES = [
  "On “should I spend $100 on a finance class” — here’s how I’d think it through.",
  "Here’s a practical way to approach the finance class decision.",
  "You're still sitting with the finance class decision. What feels murkiest about it right now?",
];

describe("answerPreservation — isDisplayableAssistantAnswer", () => {
  it("treats a real, substantive answer as displayable", () => {
    expect(isDisplayableAssistantAnswer(SUBSTANTIVE_DECISION)).toBe(true);
    expect(isDisplayableAssistantAnswer(SUBSTANTIVE_INFO)).toBe(true);
  });

  it("treats empty / whitespace / fragment results as NOT displayable", () => {
    expect(isDisplayableAssistantAnswer("")).toBe(false);
    expect(isDisplayableAssistantAnswer("   \n  ")).toBe(false);
    expect(isDisplayableAssistantAnswer(null)).toBe(false);
    expect(isDisplayableAssistantAnswer(undefined)).toBe(false);
    expect(isDisplayableAssistantAnswer("...")).toBe(false);
    expect(isDisplayableAssistantAnswer("ok")).toBe(false); // too short / fragment
  });
});

describe("answerPreservation — local fallback fills absence, not substance", () => {
  it("1. substantive decision answer flagged by a soft gate is preserved", () => {
    // No model repair; the answer is displayable → local fallback must not replace it.
    expect(
      localFallbackMayReplace({
        finalizedAnswer: SUBSTANTIVE_DECISION,
        hasModelRepair: false,
      }),
    ).toBe(false);
  });

  it("2. substantive informational answer that is imperfect but usable is preserved", () => {
    expect(
      localFallbackMayReplace({
        finalizedAnswer: SUBSTANTIVE_INFO,
        hasModelRepair: false,
      }),
    ).toBe(false);
  });

  it("3. a substantive answer with no successful model repair is preserved", () => {
    expect(
      localFallbackMayReplace({
        finalizedAnswer: SUBSTANTIVE_DECISION,
        hasModelRepair: false,
      }),
    ).toBe(false);
  });

  it("4. an empty assistant result still receives a local fail-safe", () => {
    expect(
      localFallbackMayReplace({ finalizedAnswer: "", hasModelRepair: false }),
    ).toBe(true);
  });

  it("5. a whitespace-only / failed result still receives a local fail-safe", () => {
    expect(
      localFallbackMayReplace({
        finalizedAnswer: "   \n\t ",
        hasModelRepair: false,
      }),
    ).toBe(true);
    expect(
      localFallbackMayReplace({ finalizedAnswer: null, hasModelRepair: false }),
    ).toBe(true);
  });

  it("6. a successful model repair owns the replacement; local fallback is skipped", () => {
    // When a model repair succeeded, hasModelRepair is true → the local fallback
    // is not applied (the improved answer, not a template, is used).
    expect(
      localFallbackMayReplace({
        finalizedAnswer: SUBSTANTIVE_DECISION,
        hasModelRepair: true,
      }),
    ).toBe(false);
    // Even for an otherwise-empty finalized answer, a real model repair wins.
    expect(
      localFallbackMayReplace({ finalizedAnswer: "", hasModelRepair: true }),
    ).toBe(false);
  });

  it("7. known generic templates cannot replace a substantive streamed answer", () => {
    // The local fallback (which would emit one of these templates) must not run
    // while the finalized answer is substantive.
    const mayReplace = localFallbackMayReplace({
      finalizedAnswer: SUBSTANTIVE_DECISION,
      hasModelRepair: false,
    });
    expect(mayReplace).toBe(false);
    // Sanity: the answer preserved is the real one, not any generic template.
    for (const template of GENERIC_TEMPLATES) {
      expect(SUBSTANTIVE_DECISION).not.toContain(template);
    }
  });
});

describe("answerPreservation — real-conversation acceptance ($100 finance class)", () => {
  it("keeps a useful streamed answer visible (no appear-then-disappear)", () => {
    expect(
      localFallbackMayReplace({
        finalizedAnswer: SUBSTANTIVE_DECISION,
        hasModelRepair: false,
      }),
    ).toBe(false);
  });

  it("still fails safe when the answer is genuinely empty or failed", () => {
    expect(
      localFallbackMayReplace({ finalizedAnswer: "", hasModelRepair: false }),
    ).toBe(true);
  });
});
