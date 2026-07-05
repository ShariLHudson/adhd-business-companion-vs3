import { describe, expect, it } from "vitest";
import {
  resolveEarlyLocalSupportTurn,
  shouldResolveEarlyLocalSupportTurn,
} from "./earlyLocalSupportTurn";
import { classifyPrimaryConversationTurn } from "./primaryTurnClassifier";
import {
  isEstateGuideQuestion,
  isInformationalAdhdQuestion,
} from "@/lib/sparkKnowledge/estateGuide";
import {
  normalizeLooseKnowledgeText,
  resolveInformationalKnowledgeLocalReply,
} from "@/lib/sparkKnowledge/informationalKnowledge";
import { buildRuntimeRecoveryResponse } from "@/lib/sparkConversation/coachingFallback";
import { buildBlockedTurnFallbackReply } from "@/lib/sparkConversation/bridgeResponderGuard";
import { evaluateConversationEnvironmentNeed } from "@/lib/estate/conversationDrivesNavigation/evaluateEnvironmentNeed";

describe("estate guide vs informational ADHD", () => {
  it("does not treat ADHD symptom questions as estate guide", () => {
    const text = "what are some of the symptoms of adhd";
    expect(isInformationalAdhdQuestion(text)).toBe(true);
    expect(isEstateGuideQuestion(text)).toBe(false);
  });

  it("handles typo spacing for ADHD symptoms", () => {
    const text = "what aresome symptoms of adhd";
    expect(normalizeLooseKnowledgeText(text)).toMatch(/what are some/i);
    const reply = resolveInformationalKnowledgeLocalReply(text);
    expect(reply).toBeTruthy();
    expect(reply).toMatch(/Inattention/i);
  });

  it("still routes Spark ADHD capability questions to estate guide", () => {
    const text = "how can spark help with adhd";
    expect(isEstateGuideQuestion(text)).toBe(true);
  });
});

describe("emotional support classification", () => {
  it("classifies stress as EMOTIONAL_SUPPORT", () => {
    const decision = classifyPrimaryConversationTurn({
      userText: "today i am really stressed",
    });
    expect(decision.type).toBe("EMOTIONAL_SUPPORT");
  });

  it("classifies brain overload as EMOTIONAL_SUPPORT", () => {
    const decision = classifyPrimaryConversationTurn({
      userText: "i have too much on my brain right now",
    });
    expect(decision.type).toBe("EMOTIONAL_SUPPORT");
  });

  it("classifies can't relax as EMOTIONAL_SUPPORT", () => {
    const decision = classifyPrimaryConversationTurn({
      userText: "i know, i can't seem to relax or catch my breath",
    });
    expect(decision.type).toBe("EMOTIONAL_SUPPORT");
  });
});

describe("early local support turn", () => {
  it("resolves stress without recovery lead copy", () => {
    expect(
      shouldResolveEarlyLocalSupportTurn("today i am really stressed", {
        type: "EMOTIONAL_SUPPORT",
        confidence: "high",
        owner: "frictionless:support",
        reason: "test",
        blockKernelNavigation: true,
        blockBridgeResponder: true,
        blockCollectionOffer: true,
        blockSecondaryResponders: true,
      }),
    ).toBe(true);

    const decision = resolveEarlyLocalSupportTurn({
      userText: "today i am really stressed",
      currentTurn: 1,
      workspacePanel: null,
      emotionalState: "stressed",
      overwhelmed: false,
      primaryTurn: classifyPrimaryConversationTurn({
        userText: "today i am really stressed",
      }),
      pendingConciergeChoices: false,
    });
    expect(decision.localReply).toBeTruthy();
    expect(decision.localReply).not.toMatch(/Something got tangled/i);
    expect(decision.localReply).not.toMatch(/Coffee House/i);
  });

  it("continues emotional thread instead of estate unwind menu", () => {
    const lastAssistant =
      "There's pressure here — I hear it. Your body is responding to real pressure.";
    const userText = "i know, i can't seem to relax or catch my breath";
    expect(
      shouldResolveEarlyLocalSupportTurn(
        userText,
        classifyPrimaryConversationTurn({ userText }),
        lastAssistant,
      ),
    ).toBe(true);

    const decision = resolveEarlyLocalSupportTurn({
      userText,
      currentTurn: 2,
      lastAssistantText: lastAssistant,
      workspacePanel: null,
      emotionalState: "stressed",
      overwhelmed: false,
      primaryTurn: classifyPrimaryConversationTurn({ userText }),
      pendingConciergeChoices: false,
    });
    expect(decision.localReply).toMatch(/weighing on you|hardest part/i);
    expect(decision.localReply).not.toMatch(/Coffee House/i);
    expect(decision.localReply).not.toMatch(/Porch Swing/i);

    const env = evaluateConversationEnvironmentNeed(userText, {
      lastAssistantText: lastAssistant,
    });
    expect(env.detected).toBe(false);
  });

  it("answers hardest-part follow-up locally — not tangled recovery", () => {
    const lastAssistant =
      "You're carrying a lot of tension in this. Stress doesn't mean you're failing — it means something matters.\n\nWhat's been the hardest part today?";
    const userText = "trying to appease craig";
    const primary = classifyPrimaryConversationTurn({
      userText,
      lastAssistantText: lastAssistant,
    });
    expect(
      shouldResolveEarlyLocalSupportTurn(userText, primary, lastAssistant),
    ).toBe(true);

    const decision = resolveEarlyLocalSupportTurn({
      userText,
      currentTurn: 4,
      lastAssistantText: lastAssistant,
      workspacePanel: null,
      emotionalState: "stressed",
      overwhelmed: false,
      primaryTurn: primary,
      pendingConciergeChoices: false,
    });
    expect(decision.localReply).toBeTruthy();
    expect(decision.localReply).not.toMatch(/Something got tangled/i);
    expect(decision.localReply).toMatch(/heaviest|hold/i);
  });

  it("offers rare presence suggestion when overwhelmed", () => {
    const decision = resolveEarlyLocalSupportTurn({
      userText: "I'm overwhelmed",
      currentTurn: 1,
      workspacePanel: null,
      emotionalState: "overwhelmed",
      overwhelmed: true,
      primaryTurn: classifyPrimaryConversationTurn({
        userText: "I'm overwhelmed",
      }),
      pendingConciergeChoices: false,
    });
    expect(decision.localReply).toMatch(/simply sit here for a few minutes/i);
    expect(decision.localReply).not.toMatch(/Something got tangled/i);
  });

  it("offers rare presence suggestion when mind won't stop", () => {
    const decision = resolveEarlyLocalSupportTurn({
      userText: "my brain won't stop",
      currentTurn: 1,
      workspacePanel: null,
      emotionalState: "stressed",
      overwhelmed: false,
      primaryTurn: classifyPrimaryConversationTurn({
        userText: "my brain won't stop",
      }),
      pendingConciergeChoices: false,
    });
    expect(decision.localReply).toMatch(/enjoy the Estate for a while/i);
  });

  it("runtime recovery for stress omits tangled lead", () => {
    const reply = buildRuntimeRecoveryResponse({
      userText: "today i am really stressed",
    });
    expect(reply).not.toMatch(/Something got tangled/i);
    expect(reply.length).toBeGreaterThan(20);
  });

  it("blocked fallback answers ADHD symptoms instead of generic question prompt", () => {
    const reply = buildBlockedTurnFallbackReply("what aresome symptoms of adhd");
    expect(reply).toMatch(/Inattention/i);
    expect(reply).not.toMatch(/what's your question/i);
  });
});
