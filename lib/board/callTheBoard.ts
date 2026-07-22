/**
 * Call the Board — bring Current Focus / Work / Strategy context into the
 * Round Table without restating everything (Prompt 145).
 */

import type { BoardDiscussionContext } from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import {
  clearBoardIntakeDraft,
  createEmptyBoardIntakeDraft,
  saveBoardIntakeDraft,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";

export const CALL_THE_BOARD_STORAGE_KEY =
  "spark.board.call-the-board.v1" as const;

export type CallTheBoardPayload = BoardDiscussionContext & {
  /** Optional seed for the decision question */
  decisionSeed?: string;
};

export function buildCallTheBoardContext(input: {
  projectId?: string | null;
  projectName?: string | null;
  projectFocus?: string | null;
  strategyId?: string | null;
  strategyTitle?: string | null;
  workTitle?: string | null;
  cartographyMapId?: string | null;
  source?: string;
}): CallTheBoardPayload {
  const focus = (input.projectFocus ?? "").trim();
  const work = (input.workTitle ?? input.strategyTitle ?? "").trim();
  const decisionSeed =
    focus ||
    work ||
    (input.projectName
      ? `What should we decide next for ${input.projectName}?`
      : "");
  return {
    source: input.source ?? "call-the-board",
    note: focus || work || undefined,
    projectId: input.projectId ?? null,
    projectName: input.projectName ?? null,
    strategyId: input.strategyId ?? null,
    workTitle: work || input.projectName || null,
    decisionSeed: decisionSeed || undefined,
  };
}

/** Persist payload so Boardroom can seed intake after navigation. */
export function prepareCallTheBoard(payload: CallTheBoardPayload): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CALL_THE_BOARD_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
  clearBoardIntakeDraft();
  const draft = createEmptyBoardIntakeDraft([], {
    source: payload.source,
    note: payload.note,
    projectId: payload.projectId,
    projectName: payload.projectName,
    strategyId: payload.strategyId,
    workTitle: payload.workTitle,
  });
  if (payload.decisionSeed?.trim()) {
    draft.decision = payload.decisionSeed.trim();
    draft.currentStep = "review";
  }
  saveBoardIntakeDraft(draft);
}

export function peekCallTheBoard(): CallTheBoardPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CALL_THE_BOARD_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CallTheBoardPayload;
  } catch {
    return null;
  }
}

export function consumeCallTheBoard(): CallTheBoardPayload | null {
  const payload = peekCallTheBoard();
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(CALL_THE_BOARD_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  return payload;
}
