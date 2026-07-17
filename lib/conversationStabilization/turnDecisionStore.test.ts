/**
 * Phase A — immutable turn decision store.
 */
import { afterEach, describe, expect, it } from "vitest";
import {
  authorizeBreatheAutoOpen,
  authorizeScenicPlaceMenu,
  buildConversationDecision,
} from "./conversationDecision";
import {
  annotateTurnDecision,
  beginTurnDecision,
  endTurnDecision,
  getActiveTurnDecision,
  getTurnResponseMode,
  restrictTurnPermission,
  turnAllowsBreatheAutoOpen,
  turnAllowsScenicMenu,
} from "./turnDecisionStore";

afterEach(() => {
  endTurnDecision();
});

describe("turnDecisionStore — Phase A immutability", () => {
  it("authorize helpers prefer the active turn decision over recomputed text", () => {
    const cognitive = "I have too much on my brain to remember it all.";
    const decision = buildConversationDecision({ userText: cognitive });
    beginTurnDecision("turn-1", decision);

    expect(turnAllowsScenicMenu()).toBe(false);
    expect(authorizeScenicPlaceMenu(cognitive)).toBe(false);
    // Even if later text would allow scenic, turn decision wins.
    expect(authorizeScenicPlaceMenu("Take me somewhere peaceful.")).toBe(false);
    expect(authorizeBreatheAutoOpen("Open the breathing exercise.")).toBe(false);
  });

  it("permissions can only tighten, never loosen", () => {
    const decision = buildConversationDecision({
      userText: "Take me somewhere peaceful.",
    });
    beginTurnDecision("turn-2", decision);
    expect(getActiveTurnDecision()?.scenicMenuPermission).toBe("allowed");

    expect(restrictTurnPermission("scenicMenuPermission", "denied")).toBe(true);
    expect(getActiveTurnDecision()?.scenicMenuPermission).toBe("denied");
    expect(turnAllowsScenicMenu()).toBe(false);

    // Cannot re-enable after denial.
    expect(restrictTurnPermission("scenicMenuPermission", "allowed")).toBe(false);
    expect(getActiveTurnDecision()?.scenicMenuPermission).toBe("denied");
  });

  it("responseMode stays frozen for the turn", () => {
    const decision = buildConversationDecision({
      userText: "I'm overwhelmed trying to finish this project.",
    });
    beginTurnDecision("turn-3", decision);
    const mode = getTurnResponseMode();
    expect(mode).toBe("ask_one_needed_question");
    annotateTurnDecision({ finalResponseOwner: "chat_api" });
    expect(getTurnResponseMode()).toBe(mode);
  });

  it("bare overwhelm never enables breathe via store", () => {
    const text = "I'm overwhelmed today.";
    beginTurnDecision(
      "turn-4",
      buildConversationDecision({ userText: text }),
    );
    expect(turnAllowsBreatheAutoOpen()).toBe(false);
    expect(authorizeBreatheAutoOpen(text)).toBe(false);
  });
});
