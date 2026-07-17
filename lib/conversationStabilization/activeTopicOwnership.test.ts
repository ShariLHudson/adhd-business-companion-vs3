/**
 * @vitest-environment node
 * CB-022 — Global Chamber topic ownership gate
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { classifyCompanionIntent } from "@/lib/companionTurn/classifyCompanionIntent";
import { detectChamberMemberCommand } from "@/lib/estateIntelligence/estateCommandRouter";
import { resolveEstateAction } from "@/lib/estate/decisionKernel/resolveEstateAction";
import { resetEstateRoomAwarenessForTests } from "@/lib/estate/roomAwareness";
import { GENERIC_RECOVERY_BRIDGE } from "@/lib/sparkConversation/coachingFallback";
import {
  clearActiveTopic,
  getActiveTopic,
  isBlockedGenericFallbackText,
  isExplicitChamberNavigationRequest,
  mayNavigateToChamberMember,
  processActiveTopicOnUserTurn,
  resetActiveTopicStoreForTests,
  shouldBlockGenericFallback,
  topicPreservingFallbackLine,
} from "@/lib/conversationStabilization";

function stubSession() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
    clear: () => mem.clear(),
  };
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("window", { sessionStorage: storage, dispatchEvent: vi.fn() });
}

describe("CB-022 active topic ownership", () => {
  beforeEach(() => {
    stubSession();
    resetActiveTopicStoreForTests();
    resetEstateRoomAwarenessForTests();
  });

  it("Client Relationships domain question — no Chamber NAVIGATE", () => {
    const text =
      "i want to build relationships with my new adhd app members but don't know where to start";
    expect(mayNavigateToChamberMember({ userText: text }).allow).toBe(false);
    expect(detectChamberMemberCommand(text)).toBeNull();
    const action = resolveEstateAction({ userText: text });
    expect(action.action).not.toBe("NAVIGATE");
    const turn = processActiveTopicOnUserTurn({ userText: text, turn: 1 });
    expect(turn.preserveChatForDomainQuestion).toBe(true);
    expect(turn.topic?.responseOwner).toBe("shari");
    expect(turn.topic?.status).toBe("ready_to_answer");
    expect(turn.suppressChamberIntroWriters).toBe(true);
  });

  it("Client Relationships follow-up — topic preserved, no restart navigate", () => {
    const first =
      "i want to build relationships with my new adhd app members but don't know where to start";
    processActiveTopicOnUserTurn({ userText: first, turn: 1 });
    const follow =
      "how do i build good relationships with new adhd app members";
    const turn = processActiveTopicOnUserTurn({ userText: follow, turn: 2 });
    expect(detectChamberMemberCommand(follow)).toBeNull();
    expect(turn.topic).toBeTruthy();
    expect(isBlockedGenericFallbackText(GENERIC_RECOVERY_BRIDGE)).toBe(true);
    expect(
      isBlockedGenericFallbackText(
        "Tell me what you're trying to do — settings, reminders, Clear My Mind, or something else — and I'll walk you through it.",
      ),
    ).toBe(true);
  });

  it("Content domain question — no Chamber arrival navigate", () => {
    const text =
      "what is the best type of content for instagram vs facebook vs linkedin";
    expect(detectChamberMemberCommand(text)).toBeNull();
    expect(resolveEstateAction({ userText: text }).action).not.toBe("NAVIGATE");
    const classified = classifyCompanionIntent({ userText: text });
    expect(classified.kind).toBe("CHAT");
  });

  it("Finance domain question — no Finance introduction navigate", () => {
    const text =
      "why do i procrastinate about cancelling subscriptions i don't use";
    // may still mention money in longer variants
    const withMoney = `${text} and they cost me money`;
    expect(detectChamberMemberCommand(withMoney)).toBeNull();
    expect(resolveEstateAction({ userText: withMoney }).action).not.toBe(
      "NAVIGATE",
    );
    const turn = processActiveTopicOnUserTurn({
      userText: withMoney,
      turn: 1,
    });
    expect(turn.preserveChatForDomainQuestion).toBe(true);
    expect(turn.topic?.chamberMemberId).toBe("finance");
  });

  it("AI & Technology domain question — no auto Chamber NAVIGATE", () => {
    const text =
      "what webinar equipment and ai tools should i use for online workshops";
    expect(detectChamberMemberCommand(text)).toBeNull();
    const classified = classifyCompanionIntent({ userText: text });
    expect(classified.kind).toBe("CHAT");
  });

  it("explicit Chamber navigation — allowed once", () => {
    const text = "take me to Client Relationships";
    expect(isExplicitChamberNavigationRequest(text)).toBe(true);
    const gate = mayNavigateToChamberMember({ userText: text });
    expect(gate.allow).toBe(true);
    if (gate.allow) {
      expect(gate.memberId).toBe("client-relationships");
    }
    const cmd = detectChamberMemberCommand(text);
    expect(cmd?.workspaceOffer.chamberMemberId).toBe("client-relationships");
    const action = resolveEstateAction({ userText: text });
    expect(action.action).toBe("NAVIGATE");
    if (action.action === "NAVIGATE") {
      expect(action.navigationLine).toMatch(/We're with/i);
      expect(action.navigationLine).not.toMatch(/Of course — here's/i);
    }
  });

  it("valid menu selection — allows Chamber navigate", () => {
    const gate = mayNavigateToChamberMember({
      userText: "1",
      menuSelectedMemberId: "content",
    });
    expect(gate.allow).toBe(true);
    const cmd = detectChamberMemberCommand("1", {
      menuSelectedMemberId: "content",
    });
    expect(cmd?.workspaceOffer.chamberMemberId).toBe("content");
  });

  it("explicit topic change — clears prior topic", () => {
    processActiveTopicOnUserTurn({
      userText:
        "i want to build relationships with my new adhd app members but don't know where to start",
      turn: 1,
    });
    expect(getActiveTopic()).toBeTruthy();
    const turn = processActiveTopicOnUserTurn({
      userText: "actually help me set a reminder",
      turn: 2,
    });
    expect(turn.explicitTopicChange).toBe(true);
    expect(getActiveTopic()).toBeNull();
  });

  it("ambiguous short clarification — advances without restart navigate", () => {
    processActiveTopicOnUserTurn({
      userText: "I need more clients",
      turn: 1,
    });
    const topic = getActiveTopic();
    expect(topic?.status).toBe("awaiting_clarification");
    const next = processActiveTopicOnUserTurn({
      userText: "yes",
      turn: 2,
    });
    expect(next.navigateGate.allow).toBe(false);
    expect(getActiveTopic()?.status).toBe("ready_to_answer");
    expect(detectChamberMemberCommand("yes")).toBeNull();
  });

  it("generic fallback suppression while unresolved", () => {
    processActiveTopicOnUserTurn({
      userText:
        "what is the best type of content for instagram vs facebook vs linkedin",
      turn: 1,
    });
    expect(shouldBlockGenericFallback()).toBe(true);
    expect(isBlockedGenericFallbackText(GENERIC_RECOVERY_BRIDGE)).toBe(true);
    expect(
      isBlockedGenericFallbackText("What would help you move forward today?"),
    ).toBe(true);
    expect(
      isBlockedGenericFallbackText(
        "I'm Content Intelligence. What do you want to say?",
      ),
    ).toBe(true);
    expect(topicPreservingFallbackLine()).toContain("Still with you");
  });

  it("single Shari response ownership on topic state", () => {
    const turn = processActiveTopicOnUserTurn({
      userText: "how should I repair trust after a missed client deadline",
      turn: 1,
    });
    expect(turn.topic?.responseOwner).toBe("shari");
    clearActiveTopic();
    expect(topicPreservingFallbackLine()).toMatch(/Still with you/);
  });
});
