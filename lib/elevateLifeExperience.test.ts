import { describe, expect, it } from "vitest";
import { buildCompanionSystemPrompt } from "./companionPrompt";
import { ELEVATE_LIFE_EXPERIENCE_RULE } from "./companionConstitution";
import {
  ELEVATE_LIFE_EXPERIENCE_PROMPT_BLOCK,
  ELEVATE_LIFE_EXPERIENCE_PRINCIPLE,
  elevateLifeExperienceHintForChat,
  FORBIDDEN_PERFORMATIVE_PATTERNS,
  INVISIBLE_SUCCESS_TEST,
  LIFE_EXPERIENCE_DIMENSIONS,
  responseImprovesLifeExperience,
} from "./elevateLifeExperience";

describe("elevateLifeExperience", () => {
  it("declares life experience dimensions", () => {
    expect(LIFE_EXPERIENCE_DIMENSIONS).toContain("Clarity");
    expect(LIFE_EXPERIENCE_DIMENSIONS).toContain("Momentum");
    expect(LIFE_EXPERIENCE_DIMENSIONS.length).toBeGreaterThanOrEqual(10);
  });

  it("embeds constitutional principle in system prompt", () => {
    const prompt = buildCompanionSystemPrompt("today", "text");
    expect(prompt).toContain("ELEVATE THE LIFE EXPERIENCE");
    expect(prompt).toContain("internal experience a little better");
    expect(prompt).toContain("I'm glad I asked");
  });

  it("exports constitutional rule from companion constitution", () => {
    expect(ELEVATE_LIFE_EXPERIENCE_RULE).toMatch(/internal experience/i);
  });

  it("prompt block forbids false positivity and treating users as problems", () => {
    expect(ELEVATE_LIFE_EXPERIENCE_PROMPT_BLOCK).toMatch(/false positivity/i);
    expect(ELEVATE_LIFE_EXPERIENCE_PROMPT_BLOCK).toMatch(
      /not projects, productivity systems, or diagnoses/i,
    );
    expect(ELEVATE_LIFE_EXPERIENCE_PROMPT_BLOCK).toMatch(/I'm glad I asked/i);
  });

  it("turn hint adapts for overwhelmed states", () => {
    const calm = elevateLifeExperienceHintForChat({ emotionalState: "focused" });
    const stressed = elevateLifeExperienceHintForChat({
      emotionalState: "overwhelmed",
      overwhelmed: true,
    });
    expect(calm).toContain("ELEVATE THE LIFE EXPERIENCE");
    expect(stressed).toMatch(/relief and calm/i);
    expect(stressed).toMatch(/FORBIDDEN/i);
  });

  it("flags hollow performative cheerleading", () => {
    expect(responseImprovesLifeExperience("You got this!!!")).toBe(false);
    expect(
      FORBIDDEN_PERFORMATIVE_PATTERNS.some((re) =>
        re.test("Just believe in yourself!"),
      ),
    ).toBe(true);
    expect(
      responseImprovesLifeExperience(
        "That sounds heavy. One small step might be naming what matters most today.",
      ),
    ).toBe(true);
  });
});
