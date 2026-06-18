import { describe, expect, it } from "vitest";

import { bridgeFromResolved, resolveIntent } from "./intentStabilizer";
import { detectEmotionalState } from "./companionEmotions";
import { suggestSupportTool } from "./companionToolSuggestions";
import {
  classifyConversationalMode,
  classifyUserMessage,
  clearMyMindTrustHintForChat,
  isContentBrainstorming,
  isExplicitCreationRequest,
  shouldAutoOpenWorkspaceBeforeChat,
  shouldBlockArtifactPipeline,
  shouldDeferToolCardOnFirstDistress,
  shouldSuppressCreatePending,
  shouldRunEmotionalTriage,
  shouldSuppressEmotionalTools,
  shouldStayConversationalOnly,
  shouldUseEmotionalReflection,
} from "./messageClassification";
import { classifyWorkspaceIntent } from "./workspaceIntent";
import { shouldAutoRouteAssetRequest } from "./workspaceAssetRouting";
import { detectDoingIntent } from "./workspaceMode";
import { isExplicitWorkspaceOpenRequest } from "./conversationGating";

describe("messageClassification — Priority 3B emotional vs practical", () => {
  it("Test 1 — practical LinkedIn topic help", () => {
    const text =
      "I need to write a LinkedIn post but not sure what to write about.";
    expect(classifyUserMessage(text)).toBe("practical_task");
    expect(shouldUseEmotionalReflection(classifyUserMessage(text))).toBe(false);
    expect(shouldRunEmotionalTriage(text)).toBe(false);
    expect(detectEmotionalState(text)).not.toBe("emotional");
    expect(detectEmotionalState(text)).not.toBe("overwhelmed");
    expect(detectEmotionalState(text)).not.toBe("stuck");
  });

  it("Test 2 — mixed emotional + LinkedIn task", () => {
    const text = "I'm overwhelmed and I need to write a LinkedIn post.";
    expect(classifyUserMessage(text)).toBe("mixed_emotional_task");
    expect(shouldUseEmotionalReflection(classifyUserMessage(text))).toBe(true);
    expect(shouldRunEmotionalTriage(text)).toBe(false);
    expect(shouldSuppressCreatePending(text)).toBe(true);
  });

  it("Test 3 — pure emotional distress", () => {
    const text = "I'm so overwhelmed I don't know what to do.";
    expect(classifyUserMessage(text)).toBe("emotional_distress");
    expect(shouldRunEmotionalTriage(text)).toBe(true);
    expect(shouldSuppressCreatePending(text)).toBe(true);
  });

  it("Test 4 — uncertainty without emotion (sales page)", () => {
    const text = "I'm not sure what to do next for my sales page.";
    expect(classifyUserMessage(text)).toBe("practical_task");
    expect(shouldRunEmotionalTriage(text)).toBe(false);
    expect(detectEmotionalState(text)).not.toBe("overwhelmed");
  });

  it("Test 5 — stuck but practical (email)", () => {
    const text = "I'm stuck on what to say in this email.";
    expect(classifyUserMessage(text)).toBe("practical_task");
    expect(shouldRunEmotionalTriage(text)).toBe(false);
    expect(detectEmotionalState(text)).not.toBe("stuck");
  });
});

describe("messageClassification — Priority 3C discovery vs creation", () => {
  it("Test 1 — ideas for LinkedIn post stays conversational", () => {
    const text = "I need ideas for a LinkedIn post.";
    expect(isContentBrainstorming(text)).toBe(true);
    expect(shouldSuppressCreatePending(text)).toBe(true);
    expect(detectDoingIntent(text)).toBeNull();
    expect(bridgeFromResolved(resolveIntent(text))).toBeNull();
  });

  it("Test 2 — brainstorm content ideas", () => {
    const text = "Help me brainstorm content ideas.";
    expect(isContentBrainstorming(text)).toBe(true);
    expect(shouldSuppressCreatePending(text)).toBe(true);
    expect(detectDoingIntent(text)).toBeNull();
  });

  it("Test 3 — write the LinkedIn post allows create", () => {
    const text = "Write the LinkedIn post.";
    expect(isExplicitCreationRequest(text)).toBe(true);
    expect(shouldSuppressCreatePending(text)).toBe(false);
  });

  it("Test 4 — draft the LinkedIn post allows create", () => {
    const text = "Draft the LinkedIn post.";
    expect(isExplicitCreationRequest(text)).toBe(true);
    expect(shouldSuppressCreatePending(text)).toBe(false);
  });

  it("Test 5 — what should I write this week stays conversational", () => {
    const text = "What should I write about this week?";
    expect(isContentBrainstorming(text)).toBe(true);
    expect(shouldSuppressCreatePending(text)).toBe(true);
    expect(detectDoingIntent(text)).toBeNull();
  });

  it("Facebook post ideation — ideas to create, no Create offer", () => {
    const text =
      "I need some ideas to create a FB social media post but I don't have any ideas.";
    expect(isContentBrainstorming(text)).toBe(true);
    expect(classifyConversationalMode(text)).toBe("brainstorming");
    expect(shouldStayConversationalOnly(text)).toBe(true);
    expect(shouldBlockArtifactPipeline(text)).toBe(true);
    expect(shouldSuppressCreatePending(text)).toBe(true);
    expect(detectDoingIntent(text)).toBeNull();
    expect(bridgeFromResolved(resolveIntent(text))).toBeNull();
    expect(resolveIntent(text).action).toBe("chat");
  });
});

describe("messageClassification — Priority 3F frustration context", () => {
  it("Test 1 — app frustration is problem-solving, not emotional", () => {
    const text =
      "The app is frustrating because it keeps creating drafts.";
    expect(classifyUserMessage(text)).toBe("practical_task");
    expect(shouldSuppressEmotionalTools(text)).toBe(true);
    expect(shouldRunEmotionalTriage(text)).toBe(false);
    expect(detectEmotionalState(text)).not.toBe("emotional");
    expect(
      suggestSupportTool({
        text,
        lastAssistantText: "",
        state: detectEmotionalState(text),
        obstacle: null,
        somatic: false,
        askingHow: false,
      }),
    ).toBeNull();
  });

  it("Test 2 — routing frustration is architecture, not Breathe", () => {
    const text = "The routing system is driving me crazy.";
    expect(classifyUserMessage(text)).toBe("practical_task");
    expect(shouldSuppressEmotionalTools(text)).toBe(true);
    expect(detectEmotionalState(text)).not.toBe("emotional");
    expect(
      suggestSupportTool({
        text,
        lastAssistantText: "",
        state: detectEmotionalState(text),
        obstacle: null,
        somatic: false,
        askingHow: false,
      }),
    ).toBeNull();
  });

  it("Test 3 — genuine overwhelm allows emotional support", () => {
    const text = "I feel overwhelmed and I can't do this.";
    expect(classifyUserMessage(text)).toBe("emotional_distress");
    expect(shouldSuppressEmotionalTools(text)).toBe(false);
    expect(shouldRunEmotionalTriage(text)).toBe(true);
    expect(["overwhelmed", "emotional"]).toContain(detectEmotionalState(text));
  });

  it("Test 4 — decision frustration is coaching, not emotional intervention", () => {
    const text =
      "I'm frustrated because I don't know which task to do first.";
    expect(classifyUserMessage(text)).toBe("practical_task");
    expect(shouldSuppressEmotionalTools(text)).toBe(true);
    expect(shouldRunEmotionalTriage(text)).toBe(false);
    expect(detectEmotionalState(text)).not.toBe("emotional");
    expect(
      suggestSupportTool({
        text,
        lastAssistantText: "",
        state: detectEmotionalState(text),
        obstacle: null,
        somatic: false,
        askingHow: false,
      }),
    ).toBeNull();
  });

  it("product debugging frustration from spec example", () => {
    const text =
      "I know what I want it to do, but I can't get the system to do what I want and it is frustrating.";
    expect(classifyUserMessage(text)).toBe("practical_task");
    expect(shouldSuppressEmotionalTools(text)).toBe(true);
    expect(detectEmotionalState(text)).not.toBe("emotional");
  });
});

describe("messageClassification — companion speaks before workspace (P0)", () => {
  it("ideas for LinkedIn post — discovery, no pre-chat workspace", () => {
    const text = "I need ideas for a LinkedIn post.";
    expect(classifyConversationalMode(text)).toBe("brainstorming");
    expect(shouldStayConversationalOnly(text)).toBe(true);
    expect(shouldSuppressCreatePending(text)).toBe(true);
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
    expect(detectDoingIntent(text)).toBeNull();
    expect(bridgeFromResolved(resolveIntent(text))).toBeNull();
    expect(classifyWorkspaceIntent(text).intent).toBe("discovery");
  });

  it("help me prioritize my week — conversation only, no routing", () => {
    const text = "Help me prioritize my week.";
    expect(classifyConversationalMode(text)).toBe("prioritizing");
    expect(shouldStayConversationalOnly(text)).toBe(true);
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
    expect(detectDoingIntent(text)).toBeNull();
    expect(classifyWorkspaceIntent(text).intent).toBe("conversation");
  });

  it("three things to do — conversation, no project lookup", () => {
    const text = "I have three things to do.";
    expect(classifyConversationalMode(text)).toBe("prioritizing");
    expect(shouldStayConversationalOnly(text)).toBe(true);
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
    expect(classifyWorkspaceIntent(text).intent).toBe("conversation");
  });

  it("write the LinkedIn post — explicit create allowed before chat", () => {
    const text = "Write the LinkedIn post.";
    expect(isExplicitCreationRequest(text)).toBe(true);
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(true);
    expect(shouldStayConversationalOnly(text)).toBe(false);
    expect(classifyConversationalMode(text)).toBe("creating");
  });

  it("asset discovery does not qualify for pre-chat workspace open", () => {
    const text = "help me write an SOP";
    expect(shouldAutoRouteAssetRequest(text)).toBe(true);
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
  });

  it("vague create stabilize does not qualify for pre-chat workspace open", () => {
    const text = "help me write something";
    expect(resolveIntent(text).action).toBe("stabilize");
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
  });

  it("open create — explicit workspace command allowed", () => {
    const text = "Open Create.";
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(true);
    expect(isExplicitWorkspaceOpenRequest(text)).toBe(true);
    expect(classifyWorkspaceIntent(text).intent).toBe("workspaceAction");
  });
});

describe("messageClassification — first distress tool card deferral", () => {
  const overwhelm = "I am so overwhelmed I don't know what to do.";

  it("defers tool cards on the first distress turn only", () => {
    expect(
      shouldDeferToolCardOnFirstDistress(
        [{ role: "user", content: overwhelm }],
        overwhelm,
      ),
    ).toBe(true);
    expect(
      shouldDeferToolCardOnFirstDistress(
        [
          { role: "user", content: overwhelm },
          { role: "assistant", content: "That sounds heavy." },
          { role: "user", content: "I'm still overwhelmed and frozen." },
        ],
        "I'm still overwhelmed and frozen.",
      ),
    ).toBe(false);
  });

  it("does not defer for practical task messages", () => {
    const text = "I need ideas for a LinkedIn post.";
    expect(
      shouldDeferToolCardOnFirstDistress(
        [{ role: "user", content: text }],
        text,
      ),
    ).toBe(false);
  });
});

describe("messageClassification — Clear My Mind trust hints", () => {
  it("warns chat task lists are not saved", () => {
    const hint = clearMyMindTrustHintForChat(
      "I need to call the client and email the team.",
    );
    expect(hint).toContain("NOT saved");
    expect(hint).toContain("Do NOT claim they were saved");
  });

  it("skips hint when Clear My Mind panel is open", () => {
    expect(
      clearMyMindTrustHintForChat("I need to email them.", {
        brainDumpPanelOpen: true,
      }),
    ).toBeUndefined();
  });
});
