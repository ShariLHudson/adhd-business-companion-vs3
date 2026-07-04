import { describe, expect, it } from "vitest";
import { ESTATE_EXPERIENCES } from "./registry";
import { resolveEstateExperienceFromIntent } from "./intentToExperience";

describe("estateExperiences", () => {
  it("defines ten experience pillars", () => {
    expect(Object.keys(ESTATE_EXPERIENCES)).toHaveLength(10);
    expect(ESTATE_EXPERIENCES.create.arrivalPrompt).toBe(
      "What would you like to bring to life today?",
    );
    expect(ESTATE_EXPERIENCES.momentum.arrivalPrompt).toBe(
      "What are we moving forward today?",
    );
    expect(ESTATE_EXPERIENCES.business.defaultSpaceId).toBe("round-table");
  });

  it("classifies intent by experience not room name", () => {
    expect(resolveEstateExperienceFromIntent("help me write an email")).toBe(
      "create",
    );
    expect(resolveEstateExperienceFromIntent("create a new project")).toBe(
      "create",
    );
    expect(resolveEstateExperienceFromIntent("weekly planning")).toBe(
      "momentum",
    );
    expect(resolveEstateExperienceFromIntent("I can't concentrate")).toBe(
      "focus",
    );
    expect(resolveEstateExperienceFromIntent("help me decide")).toBe("think");
    expect(resolveEstateExperienceFromIntent("visit another room")).toBe(
      "explore",
    );
  });
});
