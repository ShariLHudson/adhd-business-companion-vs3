/**
 * Boardroom view modes — destination entry vs conversation resume.
 * Ordinary Estate navigation always opens boardroom_home (seating overview).
 */

import type { BoardroomView } from "./types";
import {
  loadBoardIntakeDraft,
  type BoardDiscussionIntakeDraft,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";

/** Product-facing modes (one controls main content at a time). */
export type BoardroomViewMode =
  | "boardroom_home"
  | "director_profile"
  | "board_discussion"
  | "saved_discussions";

/** Ordinary Round Table destination navigation lands here. */
export function ordinaryDestinationBoardroomView(): BoardroomView {
  return "meet-directors";
}

export function boardroomViewModeFromView(
  view: BoardroomView,
): BoardroomViewMode {
  if (
    view === "board-director-intake" ||
    view === "discussion" ||
    view === "brief" ||
    view === "new-situation" ||
    view === "new-assembly" ||
    view === "new-members" ||
    view === "new-style"
  ) {
    return "board_discussion";
  }
  if (view === "past" || view === "past-detail") {
    return "saved_discussions";
  }
  // home + meet-directors = seating / director overview
  return "boardroom_home";
}

export function isBoardroomDestinationHomeView(view: BoardroomView): boolean {
  return view === "meet-directors" || view === "home";
}

/** Unfinished intake/discussion the member may explicitly resume. */
export function hasResumableBoardDiscussion(): boolean {
  const draft = loadBoardIntakeDraft();
  return isResumableBoardIntakeDraft(draft);
}

export function isResumableBoardIntakeDraft(
  draft: BoardDiscussionIntakeDraft | null | undefined,
): boolean {
  if (!draft) return false;
  if (draft.currentStep === "discussion") return false;
  const hasContent =
    Boolean(draft.decision?.trim()) ||
    Boolean(draft.importance?.trim()) ||
    Boolean(draft.concerns?.trim()) ||
    draft.selectedDirectorIds.length > 0 ||
    draft.options.length > 0 ||
    Boolean(draft.conversationSuspended);
  return hasContent;
}
