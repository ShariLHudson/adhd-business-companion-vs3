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
import {
  containsUnsupportedHiddenMeaning,
  draftReusesRejectedInterpretation,
} from "./noHiddenMeaning";
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

  // Package 192 — opening turns stay concrete; no hidden-meaning interpretation
  if (map.turnCount <= 2 || !map.interpretationAllowed) {
    kind = "thoughtful-question";
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
    if (!map.interpretationAllowed) {
      kind = "thoughtful-question";
    } else {
      const obs = buildGentleObservation(map, seed);
      if (
        containsUnsupportedHiddenMeaning(obs) ||
        draftReusesRejectedInterpretation(obs, map)
      ) {
        kind = "thoughtful-question";
      } else if (seed % 3 === 0 || obs.includes("?")) {
        return {
          kind,
          text: sanitizeAgainstUser(userText, obs),
          futureFeelingAsked: futureFeelingAlreadyAsked,
          offeredCompletionCheck: false,
          rejectedAsAlreadyAnswered: false,
        };
      } else {
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
          const combined = `${obs}\n\n${q.text}`;
          if (
            !containsUnsupportedHiddenMeaning(combined) &&
            !draftReusesRejectedInterpretation(combined, map)
          ) {
            return {
              kind: "gentle-observation",
              text: sanitizeAgainstUser(userText, combined),
              questionId: q.id,
              futureFeelingAsked: futureFeelingAlreadyAsked,
              offeredCompletionCheck: false,
              rejectedAsAlreadyAnswered: false,
            };
          }
        }
      }
    }
  }

  if (kind === "tentative-pattern") {
    if (!map.interpretationAllowed) {
      kind = "thoughtful-question";
    } else {
      const pattern = buildTentativePattern(map, seed);
      if (
        !containsUnsupportedHiddenMeaning(pattern) &&
        !draftReusesRejectedInterpretation(pattern, map)
      ) {
        return {
          kind,
          text: sanitizeAgainstUser(userText, pattern),
          futureFeelingAsked: futureFeelingAlreadyAsked,
          offeredCompletionCheck: false,
          rejectedAsAlreadyAnswered: false,
        };
      }
      kind = "thoughtful-question";
    }
  }

  if (kind === "connection") {
    if (!map.interpretationAllowed) {
      kind = "thoughtful-question";
    } else {
      const conn = buildConnection(map, seed);
      if (
        !containsUnsupportedHiddenMeaning(conn) &&
        !draftReusesRejectedInterpretation(conn, map)
      ) {
        return {
          kind,
          text: sanitizeAgainstUser(userText, conn),
          futureFeelingAsked: futureFeelingAlreadyAsked,
          offeredCompletionCheck: false,
          rejectedAsAlreadyAnswered: false,
        };
      }
      kind = "thoughtful-question";
    }
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
  const hiddenQ =
    /\b(?:really about|underneath|what else wants to be said|what feels unfinished|what matters most)\b/i;
  const filtered = filterCandidateQuestions(
    candidateQuestions.filter((q) => {
      if (q.area === "future-feeling") return false;
      if (
        !map.interpretationAllowed &&
        (q.area === "meaning" || hiddenQ.test(q.text))
      ) {
        return false;
      }
      if (draftReusesRejectedInterpretation(q.text, map)) return false;
      return true;
    }),
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

  const hireFallback =
    /\bhir|marketing|sales/i.test(userText) ||
    /\bhir|marketing|sales/i.test(map.literalTopic ?? "");
  const q =
    filtered[0] ??
    ({
      id: "rci-fallback",
      text: hireFallback
        ? "What is making you consider hiring someone now?"
        : "What feels most important to understand next?",
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
