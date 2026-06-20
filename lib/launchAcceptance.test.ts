/**
 * Launch Acceptance Tests — routing/classification layer.
 * Maps to docs-companion-intelligence/15_Launch_Acceptance_Tests.md
 * (Constitution + Gold Standards + Anti-Patterns).
 */

import { describe, expect, it } from "vitest";

import { detectEmotionalState } from "./companionEmotions";
import { suggestSupportTool } from "./companionToolSuggestions";
import { isExplicitWorkspaceOpenRequest } from "./conversationGating";
import { bridgeFromResolved, resolveIntent } from "./intentStabilizer";
import {
  classifyConversationalMode,
  classifyUserMessage,
  clearMyMindTrustHintForChat,
  conversationModeHintForChat,
  isExplicitCreationRequest,
  shouldAutoOpenWorkspaceBeforeChat,
  shouldDeferToolCardOnFirstDistress,
  shouldRunEmotionalTriage,
  shouldSuppressCreatePending,
  shouldSuppressEmotionalTools,
  shouldStayConversationalOnly,
} from "./messageClassification";
import { classifyWorkspaceIntent } from "./workspaceIntent";
import { detectDoingIntent } from "./workspaceMode";
import { bootstrapCreateBuilderSession } from "./createBuilderChat";
import {
  shouldHandoffChatArtifactToWorkspace,
} from "./chatArtifactGuard";
import { resolveCurrentArtifact } from "./createInitialization";
import { evaluateActivation, shouldSurfaceActivationOffer } from "./activation/activationEngine";
import {
  isAssistantAwaitingUserAnswer,
  resolveCompanionCardUiState,
  shouldSuppressActivationForTurn,
  shouldSuppressSecondaryCards,
} from "./conversationIntervention";

describe("Launch Acceptance — Category 1: Conversation First", () => {
  it("1.1 — brainstorming does not create", () => {
    const text = "I need ideas for a LinkedIn post.";
    expect(classifyConversationalMode(text)).toBe("brainstorming");
    expect(shouldStayConversationalOnly(text)).toBe(true);
    expect(shouldSuppressCreatePending(text)).toBe(true);
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
    expect(detectDoingIntent(text)).toBeNull();
    expect(bridgeFromResolved(resolveIntent(text))).toBeNull();
    expect(conversationModeHintForChat(classifyConversationalMode(text), text)).toBeTruthy();
  });

  it("1.2 — prioritizing does not route to projects", () => {
    const text =
      "I need to practice for the summit, update the app, and redo the PDF.";
    expect(classifyConversationalMode(text)).toBe("prioritizing");
    expect(shouldStayConversationalOnly(text)).toBe(true);
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
    expect(classifyWorkspaceIntent(text).intent).toBe("conversation");
    expect(classifyWorkspaceIntent(text).intent).not.toBe("projectLookup");
  });

  it("1.3 — help me think stays conversational", () => {
    const text = "Help me think this through.";
    expect(shouldStayConversationalOnly(text)).toBe(true);
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
    expect(detectDoingIntent(text)).toBeNull();
  });

  it("1.4 — Facebook post ideation stays conversational", () => {
    const text =
      "I need some ideas to create a FB social media post but I don't have any ideas.";
    expect(classifyConversationalMode(text)).toBe("brainstorming");
    expect(shouldStayConversationalOnly(text)).toBe(true);
    expect(shouldSuppressCreatePending(text)).toBe(true);
    expect(detectDoingIntent(text)).toBeNull();
    expect(bridgeFromResolved(resolveIntent(text))).toBeNull();
    expect(resolveIntent(text).action).toBe("chat");

    const ideaReply = `1. **Win story** — quick client result.
2. **Behind the scenes** — your real day.
3. **Tip** — one ADHD-friendly hack.
4. **Question** — what are they stuck on?
5. **Hook** — I used to think…`;
    expect(shouldHandoffChatArtifactToWorkspace(ideaReply, text)).toBe(false);
    expect(
      resolveCurrentArtifact({
        userText: text,
        messages: [
          { role: "user", content: text },
          { role: "assistant", content: ideaReply },
        ],
        creationContext: null,
        lastActivity: null,
        storedSession: null,
      }),
    ).toBeNull();
  });
});

describe("Launch Acceptance — Category 2: Creation Consent", () => {
  it("2.1 — explicit draft request classifies as create; chat does not auto-open", () => {
    const text = "Draft the LinkedIn post.";
    expect(isExplicitCreationRequest(text)).toBe(true);
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
    expect(shouldStayConversationalOnly(text)).toBe(false);
  });

  it("2.2 — brainstorm turn blocks create; draft turn classifies but chat does not auto-open", () => {
    const brainstorm = "I need ideas for a LinkedIn post.";
    const draft = "Now draft it.";
    expect(shouldAutoOpenWorkspaceBeforeChat(brainstorm)).toBe(false);
    expect(shouldAutoOpenWorkspaceBeforeChat(draft)).toBe(false);
    expect(isExplicitCreationRequest(draft)).toBe(true);
  });

  it("explicit open create command classifies but chat does not auto-open", () => {
    const text = "Open Create.";
    expect(isExplicitWorkspaceOpenRequest(text)).toBe(true);
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
    expect(classifyWorkspaceIntent(text).intent).toBe("workspaceAction");
  });
});

describe("Launch Acceptance — Category 3: Emotional Intelligence", () => {
  it("3.4 — workload stress does not surface activation card before discovery answer", () => {
    const text =
      "I have lots to do before Friday's launch and am pretty stressed.";
    const snap = evaluateActivation({
      text,
      emotionalState: "emotional",
      projectsMissingNextAction: 1,
    });
    expect(shouldSuppressActivationForTurn(text)).toBe(true);
    expect(shouldSurfaceActivationOffer(snap)).toBe(false);
    const messages = [
      { role: "user", content: text },
      {
        role: "assistant",
        content:
          "It sounds like you're feeling a lot of pressure. What specific tasks are weighing on you the most right now?",
      },
    ];
    expect(
      shouldSuppressSecondaryCards({
        messages,
        userText: text,
      }),
    ).toBe(true);
    expect(
      resolveCompanionCardUiState({
        userText: text,
        messages,
        activationOffer: snap.companionOffer,
        pendingAction: false,
        actionBridge: false,
        toolCard: false,
      }).showActivation,
    ).toBe(false);
  });

  it("3.1 — genuine overwhelm allows triage, not practical routing", () => {
    const text = "I am so overwhelmed I don't know what to do.";
    expect(classifyUserMessage(text)).toBe("emotional_distress");
    expect(shouldRunEmotionalTriage(text)).toBe(true);
    expect(shouldSuppressCreatePending(text)).toBe(true);
    expect(
      shouldDeferToolCardOnFirstDistress(
        [{ role: "user", content: text }],
        text,
      ),
    ).toBe(true);
  });

  it("3.2 — product frustration is problem-solving not emotional", () => {
    const text = "The app is frustrating because it keeps creating drafts.";
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

  it("3.3 — mixed emotion + task suppresses create pending", () => {
    const text = "I'm overwhelmed and I need to write a LinkedIn post.";
    expect(classifyUserMessage(text)).toBe("mixed_emotional_task");
    expect(shouldSuppressCreatePending(text)).toBe(true);
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
  });
});

describe("Launch Acceptance — Category 4: Tool consent", () => {
  it("4.1 — no emotional tool card on first distress response", () => {
    const text = "I am so overwhelmed I don't know what to do.";
    expect(shouldDeferToolCardOnFirstDistress([{ role: "user", content: text }], text)).toBe(
      true,
    );
  });

  it("4.2 — assistant tool mention does not auto-launch", async () => {
    const { shouldAutoLaunchAfterAssistantOffer } = await import(
      "./companionAutoLaunch"
    );
    expect(
      shouldAutoLaunchAfterAssistantOffer(
        "yes",
        "Want to try Breathe & Reset?",
        "Opening Breathe & Reset for you now.",
        {
          kind: "tool",
          suggestion: {
            kind: "breathe",
            line: "",
            toolLabel: "Breathe & Reset",
            toolEmoji: "🌿",
            keepTalkingLabel: "Not now",
            action: { type: "tool", tool: "breathe" },
          },
        },
      ),
    ).toBe(false);
  });
});

describe("Launch Acceptance — Category 6: Clear My Mind trust", () => {
  it("6.1 — chat task list is not saved without panel", () => {
    const hint = clearMyMindTrustHintForChat(
      "I need to call mom and email the team about the launch.",
    );
    expect(hint).toMatch(/NOT saved/i);
    expect(hint).toMatch(/Do NOT claim they were saved/i);
  });
});

describe("Launch Acceptance — user-specified regression scenarios", () => {
  it("Help me prioritize my week", () => {
    const text = "Help me prioritize my week.";
    expect(classifyConversationalMode(text)).toBe("prioritizing");
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
    expect(conversationModeHintForChat(classifyConversationalMode(text), text)).toContain(
      "CONVERSATION MODE",
    );
  });

  it("I have three things to do", () => {
    const text = "I have three things to do.";
    expect(classifyWorkspaceIntent(text).intent).toBe("conversation");
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
  });

  it("Write the LinkedIn post", () => {
    const text = "Write the LinkedIn post.";
    expect(shouldAutoOpenWorkspaceBeforeChat(text)).toBe(false);
    expect(classifyConversationalMode(text)).toBe("creating");
    expect(isExplicitCreationRequest(text)).toBe(true);
  });
});

describe("Launch Acceptance — Category 2: Create builder single thread", () => {
  it("Social Post selection asks topic first", () => {
    const { opener } = bootstrapCreateBuilderSession("Social Post");
    expect(opener).toContain("What is the post about?");
    expect(opener).toMatch(/Social Media Content/i);
    expect(opener.match(/\?/g)?.length).toBeGreaterThanOrEqual(1);
  });
});
