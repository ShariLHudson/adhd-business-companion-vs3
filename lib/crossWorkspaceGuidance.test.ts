import { describe, expect, it } from "vitest";
import {
  applyAvatarToDiscoveryAnswers,
  isAudienceGatheringInAssistant,
  isAudienceRelatedQuestion,
  resumeCreateBuilderAfterAvatar,
  shouldOfferClientAvatarHandoff,
  workflowBenefitsFromClientAvatar,
} from "./crossWorkspaceGuidance";
import { EMPTY_CREATE_WORKFLOW } from "./createWorkflow";
import type { CreateBuilderSession } from "./createBuilderChat";
import type { IdealClientAvatar } from "./companionStore";

const SAMPLE_AVATAR: IdealClientAvatar = {
  id: "a1",
  name: "Overwhelmed founders",
  who: "Solo founders with ADHD running service businesses",
  painPoints: "Marketing feels scattered and inconsistent",
  goals: "Steady visibility without burning out",
  solution: "One clear next step adapted to their energy",
  tagline: "Unlike generic to-do apps, we coach through the work",
  emoji: "👤",
  behaviorTraits: [],
  createdAt: "",
  updatedAt: "",
};

describe("crossWorkspaceGuidance", () => {
  it("detects workflows that benefit from Client Avatar", () => {
    expect(workflowBenefitsFromClientAvatar("Business Strategy")).toBe(true);
    expect(workflowBenefitsFromClientAvatar("Marketing Plan")).toBe(true);
    expect(workflowBenefitsFromClientAvatar("SOP")).toBe(false);
  });

  it("detects audience-related discovery prompts", () => {
    expect(
      isAudienceRelatedQuestion("audience", "Who is the target audience?"),
    ).toBe(true);
    expect(
      isAudienceRelatedQuestion(
        "x",
        "What specific need or struggle do they have?",
      ),
    ).toBe(true);
  });

  it("detects audience gathering in assistant copy", () => {
    expect(
      isAudienceGatheringInAssistant(
        "Who is your target customer?\nWhat key benefit do you offer?",
      ),
    ).toBe(true);
  });

  it("offers Client Avatar handoff for positioning audience questions", () => {
    expect(
      shouldOfferClientAvatarHandoff({
        workspacePanel: "content-generator",
        typeLabel: "Business Strategy",
        currentQuestionId: "audience",
        currentQuestionPrompt: "Who is the target audience?",
      }),
    ).toBe(true);
  });

  it("does not offer when Client Avatar already open", () => {
    expect(
      shouldOfferClientAvatarHandoff({
        workspacePanel: "client-avatars",
        typeLabel: "Business Strategy",
        currentQuestionId: "audience",
        currentQuestionPrompt: "Who is the target audience?",
      }),
    ).toBe(false);
  });

  it("applies avatar fields to discovery answers", () => {
    const next = applyAvatarToDiscoveryAnswers(
      {},
      SAMPLE_AVATAR,
      "Business Strategy",
    );
    expect(next.audience).toMatch(/founders/i);
  });

  it("resumes create builder after avatar with return message", () => {
    const session: CreateBuilderSession = {
      typeLabel: "Business Strategy",
      workflow: { ...EMPTY_CREATE_WORKFLOW, step: "discovery" },
      phase: "discovery",
    };
    const { reply } = resumeCreateBuilderAfterAvatar(session, SAMPLE_AVATAR);
    expect(reply).toMatch(/Client Avatar/i);
    expect(reply).toMatch(/Strategy Builder|Business Strategy/i);
  });
});
