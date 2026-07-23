/**
 * Generated paraphrase matrix — Music Room navigation + interrupts.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { clearConversationOwner, setActiveConversationOwner } from "@/lib/conversationContinuity";
import {
  __resetActiveChatScopeForTests,
  __resetDaySessionForTests,
  activateNewDayChatScope,
  startNewDaySession,
} from "@/lib/chatScope";
import {
  clearBoardIntakeDraft,
  createEmptyBoardIntakeDraft,
  saveBoardIntakeDraft,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import { classifyTurnIntent } from "./classifyTurnIntent";
import { isDirectNavigationPriorityTurn } from "@/lib/chatScope";
import { routeConversationTurn } from "./routeConversationTurn";
import { clearRoutingTracesForTests } from "./routingTrace";

const MUSIC_ROOM_PARAPHRASES = [
  "go to the music room",
  "take me to music",
  "can we head over to the music room",
  "open the room where I can listen to music",
  "I'd like to visit the music room",
  "music room please",
  "leave this and take me to music",
  "forget the Board, let's go listen to something",
  "take me over to the music room",
  "could we go listen to music?",
  "I want the music room",
  "let's head to Music",
  "please take me to the music room",
  "bring me to the music room",
];

beforeEach(() => {
  clearRoutingTracesForTests();
  clearConversationOwner();
  clearBoardIntakeDraft();
  __resetDaySessionForTests();
  __resetActiveChatScopeForTests();
  startNewDaySession("conv-para");
  activateNewDayChatScope();
});

describe("music room paraphrase matrix", () => {
  it.each(MUSIC_ROOM_PARAPHRASES)(
    "classifies navigation family or direct-nav priority: %s",
    (phrase) => {
      const classified = classifyTurnIntent({ userText: phrase });
      const direct = isDirectNavigationPriorityTurn(phrase);
      // Fragments / mixed cancel+nav may resolve cancel first (higher priority).
      expect(classified.family).not.toBe("answer_pending_question");
      if (direct && classified.family !== "cancel_stop_exit") {
        expect(classified.family).toBe("direct_navigation");
      }
    },
  );

  it.each(
    MUSIC_ROOM_PARAPHRASES.filter(
      (p) =>
        isDirectNavigationPriorityTurn(p) &&
        !/\b(?:never mind|forget|leave this)\b/i.test(p),
    ),
  )("Board awaiting cannot claim direct-nav paraphrase: %s", (phrase) => {
    const draft = createEmptyBoardIntakeDraft(["board-chair"]);
    saveBoardIntakeDraft(draft);
    setActiveConversationOwner({
      kind: "board_intake",
      discussionDraftId: "draft-para",
      currentStepId: draft.currentStep,
      awaitingAnswer: true,
    });

    const result = routeConversationTurn({
      userText: phrase,
      conversationId: "conv-para",
    });
    expect(result.decision.intentFamily).toBe("direct_navigation");
    expect(result.continuityGate.action).not.toBe("route_to_owner");
  });
});

describe("keyboard / voice parity", () => {
  it("trims and ignores trailing punctuation the same way", () => {
    const a = routeConversationTurn({
      userText: "go to the music room",
      conversationId: "conv-para",
    });
    const b = routeConversationTurn({
      userText: "go to the music room.",
      conversationId: "conv-para",
    });
    expect(a.decision.intentFamily).toBe(b.decision.intentFamily);
    expect(a.decision.targetId).toBe(b.decision.targetId);
  });
});
