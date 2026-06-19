import { describe, expect, it } from "vitest";
import { processClientAvatarCoachTurn } from "./clientAvatarCoach";
import {
  extractPendingBuilderContent,
  isBuilderAddCommand,
  isBuilderApprovalPhrase,
  isHelpSeekingAnswer,
  isInvalidBuilderFieldValue,
  isUserQuestionText,
  tryResolveBuilderApproval,
} from "./builderContentSync";

describe("builderContentSync", () => {
  const goalsAssistant = `Top 5 goals ADHD entrepreneurs want:
* Clarity and Focus
* Better Time Management
* Increased Productivity
* Creative Expression
* Sustainable Growth

Would you like me to add these to the avatar?`;

  it("extracts for example sentence from assistant message", () => {
    const content = extractPendingBuilderContent(
      "For example: coaches, authors, and speakers who want to turn their knowledge into digital products. Want to use that or adjust it?",
    );
    expect(content).toMatch(/coaches, authors, and speakers/);
  });

  it("rejects questions as field values", () => {
    expect(isUserQuestionText("What should the description say?")).toBe(true);
    expect(isHelpSeekingAnswer("I don't know")).toBe(true);
    expect(isHelpSeekingAnswer("not sure")).toBe(true);
    expect(isHelpSeekingAnswer("give me options")).toBe(true);
    expect(
      isInvalidBuilderFieldValue(
        "What should the description say?",
        "What should the description say?",
      ),
    ).toBe(true);
    expect(isInvalidBuilderFieldValue("I don't know", "I don't know")).toBe(true);
  });

  it("detects approval phrases", () => {
    expect(isBuilderApprovalPhrase("These are good.")).toBe(true);
    expect(isBuilderApprovalPhrase("looks good")).toBe(true);
    expect(isBuilderApprovalPhrase("yes please")).toBe(true);
    expect(isBuilderApprovalPhrase("use this")).toBe(true);
    expect(isBuilderApprovalPhrase("save that")).toBe(true);
    expect(isBuilderApprovalPhrase("I like that one")).toBe(true);
  });

  it("detects add-to-avatar commands as approval not content", () => {
    expect(isBuilderAddCommand("Add information to avatar.")).toBe(true);
    expect(isBuilderAddCommand("add to avatar")).toBe(true);
  });

  it("does not treat substantive content as approval", () => {
    expect(isBuilderApprovalPhrase("They struggle with focus and time management daily")).toBe(
      false,
    );
  });

  it("extracts bullet list from assistant message", () => {
    const content = extractPendingBuilderContent(goalsAssistant);
    expect(content).toMatch(/Clarity and Focus/);
    expect(content).toMatch(/Sustainable Growth/);
  });

  it("applies pending content on approval instead of the approval phrase", () => {
    const resolved = tryResolveBuilderApproval(
      "These are good.",
      goalsAssistant,
      "avatar-goals",
    );
    expect(resolved?.value).toMatch(/Clarity and Focus/);
    expect(resolved?.value).not.toMatch(/these are good/i);
  });

  it("coach turn applies goals list on these are good", () => {
    const turn = processClientAvatarCoachTurn(
      "These are good.",
      {
        step: "goals",
        stepIndex: 3,
        building: true,
        name: "ADHD entrepreneurs",
        who: "Founders",
        tagline: "",
        painPoints: "Overwhelm",
        goals: "",
        currentBehavior: "",
        solution: "",
      },
      goalsAssistant,
    );
    expect(turn?.fills?.[0]?.value).toMatch(/Clarity and Focus/);
    expect(turn?.reply).toMatch(/added those to/i);
  });

  it("applies pending content for add-to-avatar command", () => {
    const resolved = tryResolveBuilderApproval(
      "Add information to avatar.",
      goalsAssistant,
      "avatar-goals",
    );
    expect(resolved?.field).toBe("avatar-goals");
    expect(resolved?.value).toMatch(/Productivity/);
  });
});
