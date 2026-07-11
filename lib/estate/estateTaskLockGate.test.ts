import { beforeEach, describe, expect, it } from "vitest";

import { clearActiveTaskLockState } from "./activeTaskLock";
import { ESTATE_PLACE_SUGGESTION_INTRO } from "./estatePlaceIdentityLock";
import { isEstateTransitionOfferMessage } from "../estateMemory/estatePendingTransition";
import {
  activeTaskLockHintForChat,
  applyAssistantTaskLockTurn,
  applyEstateTaskLockTurn,
  frictionlessOffersEstateRoom,
  isExplicitEstateNavigationRequest,
  sanitizeAssistantCopyDuringActiveTask,
  shouldBlockEstateRoomRouting,
} from "./estateTaskLockGate";
import {
  ESTATE_PLACE_SUGGESTION_CLOSER,
  ESTATE_PLACE_SUGGESTION_INTRO,
  formatEstatePlaceSuggestionMenu,
} from "./estatePlaceIdentityLock";

const SPARK_RESEARCH_PROMISE =
  "I'll look into that — give me a moment.";

/**
 * Simulates the handleSend gate sequence per turn (apply → block check).
 */
function simulateHandleSendTaskLockGate(turns: {
  userText: string;
  lastAssistantText?: string;
  priorUserText?: string;
  conversationTurn: number;
}[]) {
  return turns.map((turn) => applyEstateTaskLockTurn(turn));
}

describe("estateTaskLockGate — Wonderdog / AI research handleSend gate", () => {
  beforeEach(() => {
    clearActiveTaskLockState();
  });

  it("R1 — research request opens task and blocks estate routing", () => {
    const result = applyEstateTaskLockTurn({
      userText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 1,
    });

    expect(result.decision).toBe("begin_task");
    expect(result.activeTask?.kind).toBe("research");
    expect(result.activeTask?.status).toBe("begin");
    expect(shouldBlockEstateRoomRouting(result)).toBe(true);
    expect(activeTaskLockHintForChat(result.state)).toMatch(/open research task/i);
    expect(activeTaskLockHintForChat(result.state)).toMatch(
      /A few places on the Estate/,
    );
  });

  it("R2 — yes after Spark research promise continues task, does not open estate", () => {
    applyEstateTaskLockTurn({
      userText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 1,
    });

    const result = applyEstateTaskLockTurn({
      userText: "Yes",
      lastAssistantText: SPARK_RESEARCH_PROMISE,
      priorUserText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 3,
    });

    expect(result.decision).toBe("continue_task");
    expect(shouldBlockEstateRoomRouting(result)).toBe(true);
  });

  it("R3/R4 — artifact questions stay on task; gate blocks estate menus", () => {
    const results = simulateHandleSendTaskLockGate([
      {
        userText: "Can you research AI tools for Wonderdog?",
        conversationTurn: 1,
      },
      {
        userText: "What did you find?",
        lastAssistantText: SPARK_RESEARCH_PROMISE,
        priorUserText: "Can you research AI tools for Wonderdog?",
        conversationTurn: 4,
      },
      {
        userText: "Show me the research",
        lastAssistantText: SPARK_RESEARCH_PROMISE,
        priorUserText: "Can you research AI tools for Wonderdog?",
        conversationTurn: 5,
      },
    ]);

    expect(results[1]?.decision).toBe("continue_task");
    expect(shouldBlockEstateRoomRouting(results[1]!)).toBe(true);
    expect(results[2]?.decision).toBe("continue_task");
    expect(shouldBlockEstateRoomRouting(results[2]!)).toBe(true);
  });

  it("R5/R6 — correction phrases extend routing suppression", () => {
    applyEstateTaskLockTurn({
      userText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 1,
    });

    const rejectRoom = applyEstateTaskLockTurn({
      userText: "I don't want a room",
      conversationTurn: 6,
    });
    expect(shouldBlockEstateRoomRouting(rejectRoom)).toBe(true);
    expect(rejectRoom.state.routingSuppressedUntilTurn).toBeGreaterThanOrEqual(6);

    const notWhatIAsked = applyEstateTaskLockTurn({
      userText: "That's not what I asked",
      conversationTurn: 7,
    });
    expect(shouldBlockEstateRoomRouting(notWhatIAsked)).toBe(true);
  });

  it("R8 — explicit Journal Gazebo navigation is allowed during active research", () => {
    applyEstateTaskLockTurn({
      userText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 1,
    });

    const result = applyEstateTaskLockTurn({
      userText: "Take me to the Journal Gazebo",
      conversationTurn: 9,
    });

    expect(result.decision).toBe("navigate");
    expect(result.allowsExplicitEstateNavigation).toBe(true);
    expect(shouldBlockEstateRoomRouting(result)).toBe(false);
    expect(isExplicitEstateNavigationRequest("Take me to the Journal Gazebo")).toBe(
      true,
    );
  });

  it("R9 — On it ack then Do you have any research stays on task", () => {
    applyEstateTaskLockTurn({
      userText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 1,
    });
    applyAssistantTaskLockTurn({
      assistantText: "On it.",
      priorUserText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 2,
    });

    const result = applyEstateTaskLockTurn({
      userText: "Do you have any research?",
      lastAssistantText: "On it.",
      priorUserText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 3,
    });

    expect(result.decision).toBe("continue_task");
    expect(result.activeTask?.status).toBe("working");
    expect(shouldBlockEstateRoomRouting(result)).toBe(true);
  });

  it("R9c — Do you have anything continues active research", () => {
    applyEstateTaskLockTurn({
      userText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 1,
    });
    const result = applyEstateTaskLockTurn({
      userText: "Do you have anything?",
      lastAssistantText: "On it.",
      priorUserText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 3,
    });
    expect(result.decision).toBe("continue_task");
    expect(shouldBlockEstateRoomRouting(result)).toBe(true);
  });

  it("R9d — Any updates after Spark ack recovers task and blocks routing", () => {
    clearActiveTaskLockState();
    const result = applyEstateTaskLockTurn({
      userText: "Any updates?",
      lastAssistantText: "On it.",
      priorUserText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 3,
    });
    expect(result.decision).toBe("continue_task");
    expect(result.activeTask?.status).toBe("working");
    expect(shouldBlockEstateRoomRouting(result)).toBe(true);
  });

  it("R10 — assistant ack promotes begin to working without completing", () => {
    clearActiveTaskLockState();
    applyEstateTaskLockTurn({
      userText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 1,
    });
    const afterAck = applyAssistantTaskLockTurn({
      assistantText: "On it.",
      priorUserText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 2,
    });
    expect(afterAck.activeTask?.status).toBe("working");
    expect(afterAck.activeTask?.status).not.toBe("complete");
  });

  it("R11 — follow-up phrases continue task and block estate routing", () => {
    applyEstateTaskLockTurn({
      userText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 1,
    });
    applyAssistantTaskLockTurn({
      assistantText: "On it.",
      priorUserText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 2,
    });

    for (const userText of [
      "What have you got?",
      "Show me",
      "What did you find?",
    ]) {
      const result = applyEstateTaskLockTurn({
        userText,
        lastAssistantText: "On it.",
        priorUserText: "Can you research AI tools for Wonderdog?",
        conversationTurn: 4,
      });
      expect(result.decision).toBe("continue_task");
      expect(shouldBlockEstateRoomRouting(result)).toBe(true);
    }
  });

  it("R9b — follow-up without prior turn still blocks routing", () => {
    clearActiveTaskLockState();
    const result = applyEstateTaskLockTurn({
      userText: "Do you have any research?",
      lastAssistantText: "On it.",
      priorUserText: "Can you research AI tools for Wonderdog?",
      conversationTurn: 3,
    });
    expect(shouldBlockEstateRoomRouting(result)).toBe(true);
  });

  it("detects estate frictionless copy that must be blocked during tasks", () => {
    expect(
      frictionlessOffersEstateRoom(
        `${ESTATE_PLACE_SUGGESTION_INTRO}\n1. Greenhouse`,
      ),
    ).toBe(true);
    expect(frictionlessOffersEstateRoom("Got it — I'll keep looking into that.")).toBe(
      false,
    );
  });

  it("R12 — yes please after research permission continues task, blocks estate menu", () => {
    const researchRequest = "I need to research new AI products.";
    const permissionQuestion =
      "I can help with that. Would you like me to gather some recent findings?";

    expect(isEstateTransitionOfferMessage(permissionQuestion)).toBe(false);

    const turn1 = applyEstateTaskLockTurn({
      userText: researchRequest,
      conversationTurn: 1,
    });
    expect(turn1.decision).toBe("begin_task");
    expect(turn1.activeTask?.status).toBe("begin");
    expect(shouldBlockEstateRoomRouting(turn1)).toBe(true);

    const turn2 = applyEstateTaskLockTurn({
      userText: "Yes please.",
      lastAssistantText: permissionQuestion,
      priorUserText: researchRequest,
      conversationTurn: 2,
    });

    expect(["continue_task", "begin_task"]).toContain(turn2.decision);
    expect(turn2.activeTask?.status).toBe("working");
    expect(turn2.suppressEstateRoomRouting).toBe(true);
    expect(shouldBlockEstateRoomRouting(turn2)).toBe(true);
    expect(frictionlessOffersEstateRoom(permissionQuestion)).toBe(false);
  });

  it("R13 — research refinement after clarifying assistant stays on task", () => {
    const researchRequest = "i need to research new AI products and updates";
    const clarifyingAssistant =
      "A great next step would be to identify a specific area of AI you're most interested in. When you're ready, let me know if you'd like to explore articles, reports, or any other resources together!";
    const refinement =
      "new ai tools for productivity and especially if there is anything new for adhd";

    const turn1 = applyEstateTaskLockTurn({
      userText: researchRequest,
      conversationTurn: 1,
    });
    expect(turn1.decision).toBe("begin_task");
    expect(shouldBlockEstateRoomRouting(turn1)).toBe(true);

    const turn2 = applyEstateTaskLockTurn({
      userText: refinement,
      lastAssistantText: clarifyingAssistant,
      priorUserText: researchRequest,
      conversationTurn: 2,
    });

    expect(turn2.decision).toBe("continue_task");
    expect(turn2.activeTask?.status).toBe("working");
    expect(turn2.suppressEstateRoomRouting).toBe(true);
    expect(shouldBlockEstateRoomRouting(turn2)).toBe(true);
  });

  it("R14 — strips canonical estate menu from assistant copy during task lock", () => {
    const menu = formatEstatePlaceSuggestionMenu([
      "reading-nook",
      "greenhouse",
      "welcome-home",
    ]);
    expect(menu).toContain(ESTATE_PLACE_SUGGESTION_INTRO);

    const sanitized = sanitizeAssistantCopyDuringActiveTask(menu);
    expect(sanitized).not.toContain(ESTATE_PLACE_SUGGESTION_INTRO);
    expect(sanitized).not.toContain(ESTATE_PLACE_SUGGESTION_CLOSER);
    expect(sanitized).not.toMatch(/Reading Nook/i);
  });
});
