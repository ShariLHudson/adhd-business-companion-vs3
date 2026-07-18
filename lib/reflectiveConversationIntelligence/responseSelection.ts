/**
 * Response selection — one helpful move per turn; not always a question.
 */

import type {
  RciCandidateQuestion,
  RciResponseKind,
  ThinkingMap,
} from "./types";
import { filterCandidateQuestions } from "./questionQuality";
import {
  buildClarification,
  buildConnection,
  buildGentleObservation,
  buildInviteContinue,
  buildSummary,
  buildTentativePattern,
} from "./reflection";
import { sanitizeAgainstUser } from "./repetitionGuard";
import { RCI_COMPLETION_CHECK } from "./types";

export type SelectedResponse = {
  kind: RciResponseKind;
  text: string;
  questionId?: string;
  futureFeelingAsked: boolean;
  offeredCompletionCheck: boolean;
  rejectedAsAlreadyAnswered: boolean;
};

function pickKind(map: ThinkingMap, seed: number): RciResponseKind {
  const turns = map.turnCount;

  if (turns >= 5 && turns % 5 === 0) {
    return "completion-check";
  }
  if (turns >= 4 && seed % 7 === 0) {
    return "summary";
  }
  if (turns >= 2 && seed % 5 === 0) {
    return "invite-continue";
  }
  if (seed % 6 === 0) return "gentle-observation";
  if (seed % 6 === 1) return "tentative-pattern";
  if (seed % 6 === 2) return "connection";
  if (seed % 6 === 3) return "clarification";
  return "thoughtful-question";
}

function wantFutureFeeling(
  map: ThinkingMap,
  alreadyAsked: boolean,
): boolean {
  if (alreadyAsked) return false;
  if (map.turnCount < 3) return false;
  const last = (map.lastUserText ?? "").toLowerCase();
  if (
    !/\b(?:decid|handle|finish|avoid|cancel|act|ready|do it|start|subscription)\b/.test(
      last,
    )
  ) {
    return false;
  }
  return map.turnCount % 3 === 0;
}

export function selectReflectiveResponse(input: {
  map: ThinkingMap;
  userText: string;
  userMessages: readonly string[];
  usedQuestionIds: readonly string[];
  candidateQuestions: readonly RciCandidateQuestion[];
  futureFeelingAlreadyAsked: boolean;
}): SelectedResponse {
  const {
    map,
    userText,
    userMessages,
    usedQuestionIds,
    candidateQuestions,
    futureFeelingAlreadyAsked,
  } = input;
  const seed = map.turnCount * 17 + userText.length;
  const used = new Set(usedQuestionIds);
  let rejectedAsAlreadyAnswered = false;

  if (wantFutureFeeling(map, futureFeelingAlreadyAsked)) {
    const ff = filterCandidateQuestions(
      candidateQuestions.filter(
        (q) =>
          q.area === "future-feeling" ||
          /\bfeel once|hanging over|tomorrow feel|future self\b/i.test(q.text),
      ),
      map,
      used,
      userMessages,
    );
    if (ff[0]) {
      return {
        kind: "future-feeling",
        text: sanitizeAgainstUser(userText, ff[0].text),
        questionId: ff[0].id,
        futureFeelingAsked: true,
        offeredCompletionCheck: false,
        rejectedAsAlreadyAnswered: false,
      };
    }
  }

  let kind = pickKind(map, seed);

  // First user turn: prefer observation or situation question over summary
  if (map.turnCount <= 1) {
    kind =
      seed % 2 === 0 ? "gentle-observation" : "thoughtful-question";
  }

  if (kind === "completion-check") {
    return {
      kind,
      text: RCI_COMPLETION_CHECK,
      futureFeelingAsked: futureFeelingAlreadyAsked,
      offeredCompletionCheck: true,
      rejectedAsAlreadyAnswered: false,
    };
  }

  if (kind === "summary") {
    return {
      kind,
      text: sanitizeAgainstUser(userText, buildSummary(map)),
      futureFeelingAsked: futureFeelingAlreadyAsked,
      offeredCompletionCheck: false,
      rejectedAsAlreadyAnswered: false,
    };
  }

  if (kind === "invite-continue") {
    return {
      kind,
      text: sanitizeAgainstUser(userText, buildInviteContinue(seed)),
      futureFeelingAsked: futureFeelingAlreadyAsked,
      offeredCompletionCheck: false,
      rejectedAsAlreadyAnswered: false,
    };
  }

  if (kind === "gentle-observation") {
    const obs = buildGentleObservation(map, seed);
    // Sometimes observation alone; sometimes + question
    if (seed % 3 === 0 || obs.includes("?")) {
      return {
        kind,
        text: sanitizeAgainstUser(userText, obs),
        futureFeelingAsked: futureFeelingAlreadyAsked,
        offeredCompletionCheck: false,
        rejectedAsAlreadyAnswered: false,
      };
    }
    kind = "thoughtful-question";
    const filtered = filterCandidateQuestions(
      candidateQuestions,
      map,
      used,
      userMessages,
    ).sort((a, b) => {
      const as = a.id.startsWith("sit-") ? 0 : 1;
      const bs = b.id.startsWith("sit-") ? 0 : 1;
      return as - bs;
    });
    const q = filtered[0];
    if (q) {
      return {
        kind: "gentle-observation",
        text: sanitizeAgainstUser(userText, `${obs}\n\n${q.text}`),
        questionId: q.id,
        futureFeelingAsked: futureFeelingAlreadyAsked,
        offeredCompletionCheck: false,
        rejectedAsAlreadyAnswered: false,
      };
    }
    return {
      kind: "gentle-observation",
      text: sanitizeAgainstUser(userText, obs),
      futureFeelingAsked: futureFeelingAlreadyAsked,
      offeredCompletionCheck: false,
      rejectedAsAlreadyAnswered: false,
    };
  }

  if (kind === "tentative-pattern") {
    return {
      kind,
      text: sanitizeAgainstUser(userText, buildTentativePattern(map, seed)),
      futureFeelingAsked: futureFeelingAlreadyAsked,
      offeredCompletionCheck: false,
      rejectedAsAlreadyAnswered: false,
    };
  }

  if (kind === "connection") {
    return {
      kind,
      text: sanitizeAgainstUser(userText, buildConnection(map, seed)),
      futureFeelingAsked: futureFeelingAlreadyAsked,
      offeredCompletionCheck: false,
      rejectedAsAlreadyAnswered: false,
    };
  }

  if (kind === "clarification") {
    return {
      kind,
      text: sanitizeAgainstUser(userText, buildClarification(seed)),
      futureFeelingAsked: futureFeelingAlreadyAsked,
      offeredCompletionCheck: false,
      rejectedAsAlreadyAnswered: false,
    };
  }

  // thoughtful-question — prefer situation-tuned (sit-*) candidates first
  const filtered = filterCandidateQuestions(
    candidateQuestions.filter((q) => q.area !== "future-feeling"),
    map,
    used,
    userMessages,
  ).sort((a, b) => {
    const as = a.id.startsWith("sit-") ? 0 : 1;
    const bs = b.id.startsWith("sit-") ? 0 : 1;
    return as - bs;
  });
  if (filtered.length === 0 && candidateQuestions.length > 0) {
    rejectedAsAlreadyAnswered = true;
  }
  const q =
    filtered[0] ??
    ({
      id: "rci-fallback",
      text: "What feels most important to understand next?",
    } satisfies RciCandidateQuestion);

  // Openers / delivery variation owned by Conversational Intelligence (183).
  return {
    kind: "thoughtful-question",
    text: sanitizeAgainstUser(userText, q.text),
    questionId: q.id === "rci-fallback" ? undefined : q.id,
    futureFeelingAsked: futureFeelingAlreadyAsked,
    offeredCompletionCheck: false,
    rejectedAsAlreadyAnswered,
  };
}
