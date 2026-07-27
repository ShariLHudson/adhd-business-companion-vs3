import { describe, expect, it } from "vitest";
import {
  buildResearchSystemPrompt,
  buildResearchAutoPrompt,
  type ResearchPersonaConfig,
} from "./contextualResearchCore";

const CONFIG: ResearchPersonaConfig = {
  intro: ["You are a helper about", "the business."],
  nameLinePrefix: "Name: ",
  priorsHeader: "Known so far:",
  draftLabel: "Current draft:",
  emptyDraftText: "(empty)",
  guidance: ["Stay on this one question."],
};

describe("buildResearchSystemPrompt (config-driven)", () => {
  it("assembles question, name, priors and draft from config", () => {
    const p = buildResearchSystemPrompt(CONFIG, {
      questionLabel: "What do you sell?",
      currentAnswer: "Coaching",
      priorAnswers: [{ label: "Stage", value: "Growing" }],
      entityName: "Rivera Studio",
    });
    expect(p).toContain('The question: "What do you sell?"');
    expect(p).toContain("Name: Rivera Studio");
    expect(p).toContain("Known so far:");
    expect(p).toContain("- Stage: Growing");
    expect(p).toContain('Current draft: "Coaching"');
    expect(p).toContain("Stay on this one question.");
  });

  it("marks an empty draft with the config's empty text and omits an absent name", () => {
    const p = buildResearchSystemPrompt(CONFIG, { questionLabel: "Q" });
    expect(p).toContain("Current draft: (empty)");
    expect(p).not.toContain("Name:");
    expect(p).not.toContain("Known so far:");
  });
});

describe("buildResearchAutoPrompt", () => {
  it("references the draft when present, generic otherwise", () => {
    expect(buildResearchAutoPrompt({ questionLabel: "Q", currentAnswer: "D" })).toContain(
      "D",
    );
    const generic = buildResearchAutoPrompt({ questionLabel: "Q" });
    expect(generic.toLowerCase()).toContain("think through this question");
    expect(generic).not.toContain("draft so far");
  });
});
