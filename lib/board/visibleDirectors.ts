/**
 * Visible Board Directors for the current product pass.
 * Full registry may hold future Directors; UI only surfaces this list.
 *
 * Thomas Ellison (Chair) is the first fully functional Director.
 */

import {
  getBoardDirectorById,
  listBoardDirectors,
} from "@/lib/board/boardDirectorRegistry";
import type { BoardDirectorDefinition, BoardDirectorId } from "@/lib/board/types";

/** Stable Chair ID — aliases include thomas-ellison. */
export const THOMAS_ELLISON_DIRECTOR_ID: BoardDirectorId = "board-chair";

/**
 * Directors shown in Meet the Directors / Round Table / Board Review suggestions.
 * Expand this list when additional Directors are approved.
 */
export const VISIBLE_BOARD_DIRECTOR_IDS: readonly BoardDirectorId[] = [
  THOMAS_ELLISON_DIRECTOR_ID,
] as const;

export function isVisibleBoardDirectorId(id: string): boolean {
  return (VISIBLE_BOARD_DIRECTOR_IDS as readonly string[]).includes(id);
}

export function listVisibleBoardDirectors(): BoardDirectorDefinition[] {
  return VISIBLE_BOARD_DIRECTOR_IDS.map((id) => getBoardDirectorById(id)).filter(
    (d): d is BoardDirectorDefinition => Boolean(d),
  );
}

export function getThomasEllison(): BoardDirectorDefinition {
  const thomas = getBoardDirectorById(THOMAS_ELLISON_DIRECTOR_ID);
  if (!thomas) {
    throw new Error("Thomas Ellison (board-chair) missing from Board registry");
  }
  return thomas;
}

/** All registry Directors (including not-yet-visible). Prefer listVisible for UI. */
export function listAllRegisteredBoardDirectors(): readonly BoardDirectorDefinition[] {
  return listBoardDirectors();
}
