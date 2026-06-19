import { describe, expect, it } from "vitest";

import { evaluateCompanionTurn } from "./companionGovernor";
import { extractArtifactFromChat, resolveCurrentArtifact } from "./createInitialization";
import {
  shouldHandoffChatArtifactToWorkspace,
  shouldSyncChatArtifactToCreate,
} from "./chatArtifactGuard";
import {
  isDraftDirectionSelectionOnly,
  shouldBlockDraftPanelFromChat,
  userGrantedDraftPermission,
} from "./draftPermissionGate";
import {
  classifyConversationalMode,
  isContentBrainstorming,
  shouldStayConversationalOnly,
} from "./messageClassification";
import { resolveIntent } from "./intentStabilizer";

const FB_BRAINSTORM =
  "I need some ideas to create a FB social media post but I don't have any ideas.";

const IDEA_REPLY = `Here are a few angles:

1. **Share a client win** — a short story about a result.
2. **Behind the scenes** — what your workday looks like.
3. **Tip of the week** — one actionable tip.
4. **Question post** — ask what they're struggling with.
5. **Story hook** — start with "I used to think…"`;

const chatAfterBrainstorm = [
  { role: "user" as const, content: FB_BRAINSTORM },
  { role: "assistant" as const, content: IDEA_REPLY },
];

describe("draftPermissionGate — manual QA scenarios", () => {
  it("Test 1 — FB ideation: chat only, no draft pipeline", () => {
    expect(classifyConversationalMode(FB_BRAINSTORM)).toBe("brainstorming");
    expect(shouldStayConversationalOnly(FB_BRAINSTORM)).toBe(true);
    expect(isContentBrainstorming(FB_BRAINSTORM)).toBe(true);
    expect(shouldBlockDraftPanelFromChat(FB_BRAINSTORM)).toBe(true);
    expect(userGrantedDraftPermission(FB_BRAINSTORM)).toBe(false);

    expect(
      shouldHandoffChatArtifactToWorkspace(IDEA_REPLY, FB_BRAINSTORM),
    ).toBe(false);
    expect(
      shouldSyncChatArtifactToCreate(IDEA_REPLY, FB_BRAINSTORM, true),
    ).toBe(false);
    expect(extractArtifactFromChat(chatAfterBrainstorm)).toBeNull();
    expect(
      resolveCurrentArtifact({
        userText: FB_BRAINSTORM,
        messages: chatAfterBrainstorm,
        creationContext: null,
        lastActivity: null,
        storedSession: null,
      }),
    ).toBeNull();
  });

  it("Test 2 — direction selection stays in chat", () => {
    const followUp = "I like the behind-the-scenes idea";
    expect(isDraftDirectionSelectionOnly(followUp)).toBe(true);
    expect(shouldBlockDraftPanelFromChat(followUp)).toBe(true);
    expect(userGrantedDraftPermission(followUp)).toBe(false);
    expect(
      shouldHandoffChatArtifactToWorkspace(IDEA_REPLY, followUp, IDEA_REPLY),
    ).toBe(false);
    expect(
      resolveCurrentArtifact({
        userText: followUp,
        messages: [
          ...chatAfterBrainstorm,
          { role: "user", content: followUp },
        ],
        creationContext: null,
        lastActivity: null,
        storedSession: null,
      }),
    ).toBeNull();
  });

  it("Test 3 — explicit draft follow-up allows Create", () => {
    const followUp = "Now draft it";
    expect(shouldBlockDraftPanelFromChat(followUp)).toBe(false);
    expect(userGrantedDraftPermission(followUp)).toBe(true);

    const messages = [
      ...chatAfterBrainstorm,
      { role: "user", content: "I like the behind-the-scenes idea" },
      {
        role: "assistant",
        content: "Would you like me to draft this as a Facebook post?",
      },
      { role: "user", content: followUp },
      {
        role: "assistant",
        content: `# Behind the Scenes

Here's a draft Facebook post about your workday — authentic, relatable, and short enough to read in one scroll.

## Hook
Ever wonder what running an ADHD-friendly business actually looks like behind the curtain?

## Body
Today I'm sharing the real rhythm: the wins, the pivots, and the tiny systems that keep me moving without burning out.

## Close
What part of your day would you love to see more of from me?`,
      },
    ];

    const artifact = extractArtifactFromChat(messages);
    expect(artifact).not.toBeNull();
    expect(artifact!.itemType).toMatch(/Facebook Post/i);
    expect(
      shouldHandoffChatArtifactToWorkspace(
        messages[messages.length - 1]!.content,
        followUp,
        "Would you like me to draft this as a Facebook post?",
      ),
    ).toBe(true);
  });

  it("Test 4 — give me 10 ideas stays chat only", () => {
    const text = "Give me 10 ideas for a Facebook post";
    expect(isContentBrainstorming(text)).toBe(true);
    expect(shouldBlockDraftPanelFromChat(text)).toBe(true);
    expect(
      shouldHandoffChatArtifactToWorkspace(IDEA_REPLY, text),
    ).toBe(false);
  });

  it("allows yes after apply-to-draft offer", () => {
    const offer = "Would you like me to apply this to the draft?";
    expect(userGrantedDraftPermission("yes", offer)).toBe(true);
    expect(shouldBlockDraftPanelFromChat("yes", offer)).toBe(false);
  });

  it("live create open allows incremental chat without re-gating", () => {
    const fact = "Commission is $10 after 3 paid months.";
    expect(
      shouldBlockDraftPanelFromChat(fact, "", { liveCreateOpen: true }),
    ).toBe(false);
  });

  it("deciding conversation does not grant draft permission", () => {
    expect(userGrantedDraftPermission("I need to make a decision")).toBe(false);
    expect(
      evaluateCompanionTurn({
        userText: "I need to make a decision",
        workspacePanel: null,
        workspaceSnap: { panel: null, activeSection: "home", revealSeq: 0 },
        resolvedIntent: resolveIntent("I need to make a decision"),
      }).outcome,
    ).toBe("chat_only");
  });
});
