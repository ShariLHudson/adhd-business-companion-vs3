/**
 * Spark V4 reliability — golden paths for commit readiness.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";
import { resolveFrictionlessAction } from "@/lib/frictionlessActionLayer";
import { resolveEstateDestination } from "@/lib/estate/estateDestinationResolver";
import { resolveEstateAction } from "@/lib/estate/decisionKernel";
import { evaluateEstateRoomAction } from "@/lib/estate/roomContext/evaluateEstateRoomAction";
import { evaluateEstatePlaceTurn } from "@/lib/estate/estatePlaceNavigation";
import { resolveChatFailureReply } from "@/lib/chatFastPath/resolveChatFailureReply";
import { buildFailSafeChatReply } from "@/lib/chatFastPath/chatTurnGuarantee";
import { SHARI_ERROR_RECOVERY_LINE } from "@/lib/conversation/shariCompanionEngine";
import {
  evaluateSparkDecisionEngine,
} from "@/lib/sparkCompanion";
import { shouldEnterUniversalCreation } from "@/lib/universalCreation";
import {
  clearPendingChoice,
  registerPendingChoiceFromNavigation,
  resolvePendingChoiceTurn,
} from "@/lib/pendingChoice";

describe("Spark V4 reliability — Priority 9 scenarios", () => {
  beforeEach(() => {
    clearPendingChoice();
  });

  it("1 — relationship chat: good day, no celebration auto-route", () => {
    const text = "I hope you're having a good day";
    const primary = classifyPrimaryConversationTurn({ userText: text });
    expect(primary.type).toBe("RELATIONSHIP_CHAT");

    const frictionless = resolveFrictionlessAction({
      userText: text,
      primaryTurn: primary,
    });
    expect(frictionless.localReply).toBeNull();
    expect(frictionless.immediateEstatePlaceNavigate).toBeUndefined();
    expect(frictionless.category).not.toBe("direct_action");
  });

  it("2 — coffee implied need: choices, no auto-route", () => {
    const text = "I need a cup of coffee";
    const primary = classifyPrimaryConversationTurn({ userText: text });
    expect(primary.type).toBe("IMPLIED_NEED");

    const frictionless = resolveFrictionlessAction({
      userText: text,
      primaryTurn: primary,
    });
    expect(
      frictionless.category === "implied_need" ||
        frictionless.impliedNeedEvaluation != null,
    ).toBe(true);
    expect(frictionless.immediateEstatePlaceNavigate).toBeUndefined();
  });

  it("3 — Take me to the Music Room → navigate", () => {
    const text = "Take me to the Music Room";
    const result = resolveEstateAction({
      userText: text,
      currentPlaceId: "conservatory",
    });
    expect(result.action).toBe("NAVIGATE");
    if (result.action === "NAVIGATE" && result.target.kind === "place") {
      expect(
        result.target.command.roomId ?? result.target.command.entryId,
      ).toBe("music-room");
    }
  });

  it("4 — garden → ambiguous choices", () => {
    const result = resolveEstateDestination({
      userText: "garden",
      destinationPhrase: "garden",
    });
    expect(result.kind).toBe("ambiguous_match");
    if (result.kind === "ambiguous_match") {
      expect(result.choices.length).toBeGreaterThanOrEqual(2);
      expect(result.choices.length).toBeLessThanOrEqual(4);
      expect(result.intro).toMatch(/few places|which one/i);
    }
  });

  it("5 — 1 after garden choices → first option", () => {
    const ambiguous = resolveEstateDestination({
      userText: "garden",
      destinationPhrase: "garden",
    });
    expect(ambiguous.kind).toBe("ambiguous_match");
    if (ambiguous.kind !== "ambiguous_match") return;

    registerPendingChoiceFromNavigation({
      choices: ambiguous.choices,
      menuText: ambiguous.intro,
      queryPhrase: "garden",
    });

    const result = resolvePendingChoiceTurn("1");
    expect(result.kind).toBe("resolved");
    if (result.kind === "resolved") {
      expect(result.action.placeId).toBe(ambiguous.choices[0]!.destinationId);
    }
  });

  it("6 — marketing plan → CREATE workflow, no tangle copy", () => {
    const text = "I need to create a marketing plan";
    expect(shouldEnterUniversalCreation(text)).toBe(true);
    const decision = evaluateSparkDecisionEngine({ userText: text });
    expect(decision.intent).toBe("CREATE");

    const failSafe = buildFailSafeChatReply(text);
    expect(failSafe).not.toContain(SHARI_ERROR_RECOVERY_LINE);
  });

  it("7 — write a piece of music → helpful guidance, no freeze", () => {
    const text = "I need to write a piece of music";
    const frictionless = resolveFrictionlessAction({ userText: text });
    expect(frictionless.localReply).toMatch(/can't compose playable music/i);
    expect(frictionless.localReply).toMatch(/lyrics|chord|music tool/i);
  });

  it("8 — show me my journal in Journal Gazebo → in-room action", () => {
    const action = evaluateEstateRoomAction({
      userText: "show me my journal",
      currentPlaceId: "journal",
    });
    expect(action?.action.kind).toBe("open_journal");

    const kernel = resolveEstateAction({
      userText: "Show me my journal.",
      currentPlaceId: "journal",
    });
    expect(kernel.action).toBe("ROOM_ACTION");
  });

  it("9 — never mind after numbered choices → clears pending", () => {
    const ambiguous = resolveEstateDestination({
      userText: "garden",
      destinationPhrase: "garden",
    });
    if (ambiguous.kind !== "ambiguous_match") return;
    registerPendingChoiceFromNavigation({
      choices: ambiguous.choices,
      menuText: ambiguous.intro,
    });
    const result = resolvePendingChoiceTurn("never mind");
    expect(result.kind).toBe("cancelled");
  });

  it("10 — API timeout → graceful recovery without tangled lead", () => {
    const reply = resolveChatFailureReply({
      err: new Error("companion-chat-timeout"),
      userText: "Help me plan my week",
      messages: [{ role: "user", content: "Help me plan my week" }],
    });
    expect(reply).toBeTruthy();
    expect(reply).not.toContain(SHARI_ERROR_RECOVERY_LINE);
  });
});

describe("Spark V4 reliability — estate place turn", () => {
  it("garden bare phrase offers menu via place turn", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "garden",
      currentPlaceId: null,
    });
    expect(turn.type === "offer" || turn.type === "reply").toBe(true);
    if (turn.type === "offer") {
      expect(turn.placeIds.length).toBeGreaterThanOrEqual(2);
    }
  });
});
