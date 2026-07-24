import { describe, expect, it } from "vitest";
import { decideShariResponse } from "./decideShariResponse";
import { decideConversationTurnAuthority } from "./turnAuthority";
import type { ShariConversationThread } from "./conversationContinuity";

function thread(topic = "loom video how-to"): ShariConversationThread {
  return {
    id: "thread-test-1",
    conversationId: "conv-test-1",
    originalRequest: topic,
    currentGoal: topic,
    conversationMode: "teaching",
    primaryHelpMode: "how_to_guidance",
    lastAnswer: "outline three beats",
    topicKeywords: topic.split(/\s+/).slice(0, 4),
    memberContextNotes: [],
    assumptions: [],
    corrections: [],
    relevantContextKeys: [],
    updatedAt: new Date().toISOString(),
  };
}

describe("decideConversationTurnAuthority — production failure modes", () => {
  it("pending Create consent + bare ok → Create owns; relationship suppressed", () => {
    const decision = decideShariResponse("ok");
    const auth = decideConversationTurnAuthority({
      userText: "ok",
      decision,
      isFollowUp: true,
      thread: thread(),
      primaryRole: "teacher",
      pendingCreateConsent: true,
      hasCurrentFounderAction: false,
    });
    expect(auth.owner).toBe("create_consent_accept");
    expect(auth.allowRelationshipLocal).toBe(false);
    expect(auth.allowFounderActionAccept).toBe(false);
    expect(auth.allowContinuityAdapt).toBe(false);
  });

  it("detailed Loom depth ask → companion_chat; local how-to never primary", () => {
    const text =
      "i need detailed step by step instructions on how to do a loom video because i have never done one";
    const decision = decideShariResponse(text);
    const auth = decideConversationTurnAuthority({
      userText: text,
      decision,
      isFollowUp: true,
      thread: thread(),
      primaryRole: "teacher",
      pendingCreateConsent: false,
      hasCurrentFounderAction: false,
    });
    expect(auth.owner).toBe("companion_chat");
    expect(auth.allowLocalHowToFailsafeAsPrimary).toBe(false);
    expect(auth.allowContinuityAdapt).toBe(false);
    expect(auth.preferCompanionChat).toBe(true);
  });

  it("never-used-app walkthrough → companion_chat; continuity filler suppressed", () => {
    const text =
      "i dont even know how to start, never used the app before, there are lots of different tools and so i need to know what they all are and you to walk me through the process from start to finish";
    const decision = decideShariResponse(text);
    const auth = decideConversationTurnAuthority({
      userText: text,
      decision,
      isFollowUp: true,
      thread: thread(),
      primaryRole: "teacher",
      pendingCreateConsent: false,
      hasCurrentFounderAction: false,
    });
    expect(auth.owner).toBe("companion_chat");
    expect(auth.allowContinuityAdapt).toBe(false);
    expect(auth.allowLocalHowToFailsafeAsPrimary).toBe(false);
  });

  it("how do i build it in create → companion_chat; continuity suppressed", () => {
    const text = "how do i build it in create";
    const decision = decideShariResponse(text);
    const auth = decideConversationTurnAuthority({
      userText: text,
      decision,
      isFollowUp: true,
      thread: thread(),
      primaryRole: "teacher",
      pendingCreateConsent: false,
      hasCurrentFounderAction: true,
    });
    expect(auth.owner).toBe("companion_chat");
    expect(auth.allowContinuityAdapt).toBe(false);
    expect(auth.allowFounderActionRecovery).toBe(false);
  });

  it("daily focus does not replay founder action recovery", () => {
    const text = "what should i work on today";
    const decision = decideShariResponse(text);
    const auth = decideConversationTurnAuthority({
      userText: text,
      decision,
      isFollowUp: true,
      thread: thread(),
      primaryRole: "coach",
      pendingCreateConsent: false,
      hasCurrentFounderAction: true,
    });
    expect(auth.owner).toBe("companion_chat");
    expect(auth.allowFounderActionRecovery).toBe(false);
    expect(auth.allowFounderActionAccept).toBe(false);
    expect(auth.breakHelpThread).toBe(true);
  });

  it("checklist yes does not accept stale founder action", () => {
    const text = "yes let's turn this into a checklist";
    const decision = decideShariResponse(text);
    const auth = decideConversationTurnAuthority({
      userText: text,
      decision,
      isFollowUp: true,
      thread: thread("craft fair booth setup"),
      primaryRole: "advisor",
      pendingCreateConsent: false,
      hasCurrentFounderAction: true,
    });
    expect(auth.owner).toBe("companion_chat");
    expect(auth.allowFounderActionAccept).toBe(false);
    expect(auth.allowFounderActionRecovery).toBe(false);
    expect(auth.allowContinuityAdapt).toBe(false);
  });

  it("emotional overload breaks help-thread and blocks continuity/founder steals", () => {
    const text = "i feel very frustrated and have a ton on my mind";
    const decision = decideShariResponse(text);
    const auth = decideConversationTurnAuthority({
      userText: text,
      decision,
      isFollowUp: true,
      thread: thread("craft fair booth setup"),
      primaryRole: "coach",
      pendingCreateConsent: false,
      hasCurrentFounderAction: true,
    });
    expect(auth.owner).toBe("overwhelm_frictionless");
    expect(auth.breakHelpThread).toBe(true);
    expect(auth.allowContinuityAdapt).toBe(false);
    expect(auth.allowFounderActionRecovery).toBe(false);
    expect(auth.allowRelationshipLocal).toBe(false);
    expect(auth.allowOverwhelmFrictionless).toBe(true);
  });

  it("C1: overwhelm + write the email → create_execution, not overwhelm", () => {
    const text =
      "I'm so overwhelmed, I don't even know what to tell my team — can you just write the email for me.";
    const decision = decideShariResponse(text);
    const auth = decideConversationTurnAuthority({
      userText: text,
      decision,
      isFollowUp: false,
      thread: null,
      primaryRole: "teacher",
      pendingCreateConsent: false,
      hasCurrentFounderAction: false,
    });
    expect(decision.explicitCreationRequested).toBe(true);
    expect(auth.owner).toBe("create_execution");
    expect(auth.allowEmotionalDestinationOffer).toBe(false);
    expect(auth.allowOverwhelmFrictionless).toBe(false);
  });

  it("short same-topic refinement may allow continuity adapt", () => {
    const text = "make that shorter";
    const decision = decideShariResponse(text);
    const auth = decideConversationTurnAuthority({
      userText: text,
      decision,
      isFollowUp: true,
      thread: thread(),
      primaryRole: "teacher",
      pendingCreateConsent: false,
      hasCurrentFounderAction: false,
    });
    // Either companion_chat with continuity allowed, or other — never local howto primary
    expect(auth.allowLocalHowToFailsafeAsPrimary).toBe(false);
    if (auth.owner === "companion_chat" && decision.directAnswerRequired) {
      expect(auth.allowContinuityAdapt).toBe(true);
    }
  });
});
