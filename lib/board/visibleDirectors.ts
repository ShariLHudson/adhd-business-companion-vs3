/**
 * Visible Board Directors for Meet the Directors / Round Table / Board Review.
 * Full registry roster — all twelve Directors are approved for the current product pass.
 */

import {
  getBoardDirectorById,
  listBoardDirectors,
} from "@/lib/board/boardDirectorRegistry";
import {
  BOARD_DIRECTOR_IDS,
  type BoardDirectorDefinition,
  type BoardDirectorId,
} from "@/lib/board/types";

/** Stable Chair ID — aliases include thomas-ellison. */
export const THOMAS_ELLISON_DIRECTOR_ID: BoardDirectorId = "board-chair";

/** Stable Vice Chair ID — aliases include shari-menon. */
export const SHARI_MENON_DIRECTOR_ID: BoardDirectorId = "vice-chair";

/** Stable Operations & Capacity ID — aliases include marcus-whitaker. */
export const MARCUS_WHITAKER_DIRECTOR_ID: BoardDirectorId = "operations-capacity";

/** Stable Founder Advocate ID — aliases include david-kim. */
export const DAVID_KIM_DIRECTOR_ID: BoardDirectorId = "founder-advocate";

/** Stable Technology & Future ID — aliases include maya-chen. */
export const MAYA_CHEN_DIRECTOR_ID: BoardDirectorId = "technology-future";

/** Stable Values & Trust ID — aliases include carlos-rivera. */
export const CARLOS_RIVERA_DIRECTOR_ID: BoardDirectorId = "values-trust";

/** Stable Devil’s Advocate ID — aliases include mateo-vargas. */
export const MATEO_VARGAS_DIRECTOR_ID: BoardDirectorId = "devils-advocate";

/**
 * Directors shown in Meet the Directors / Round Table / Board Review suggestions.
 * Matches the full Board registry order.
 */
export const VISIBLE_BOARD_DIRECTOR_IDS: readonly BoardDirectorId[] =
  BOARD_DIRECTOR_IDS;

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

export function getShariMenon(): BoardDirectorDefinition {
  const shari = getBoardDirectorById(SHARI_MENON_DIRECTOR_ID);
  if (!shari) {
    throw new Error("Shari Menon (vice-chair) missing from Board registry");
  }
  return shari;
}

export function getMarcusWhitaker(): BoardDirectorDefinition {
  const marcus = getBoardDirectorById(MARCUS_WHITAKER_DIRECTOR_ID);
  if (!marcus) {
    throw new Error(
      "Marcus Whitaker (operations-capacity) missing from Board registry",
    );
  }
  return marcus;
}

export function getDavidKim(): BoardDirectorDefinition {
  const david = getBoardDirectorById(DAVID_KIM_DIRECTOR_ID);
  if (!david) {
    throw new Error(
      "David Kim (founder-advocate) missing from Board registry",
    );
  }
  return david;
}

export function getMayaChen(): BoardDirectorDefinition {
  const maya = getBoardDirectorById(MAYA_CHEN_DIRECTOR_ID);
  if (!maya) {
    throw new Error(
      "Maya Chen (technology-future) missing from Board registry",
    );
  }
  return maya;
}

export function getCarlosRivera(): BoardDirectorDefinition {
  const carlos = getBoardDirectorById(CARLOS_RIVERA_DIRECTOR_ID);
  if (!carlos) {
    throw new Error(
      "Carlos Rivera (values-trust) missing from Board registry",
    );
  }
  return carlos;
}

export function getMateoVargas(): BoardDirectorDefinition {
  const mateo = getBoardDirectorById(MATEO_VARGAS_DIRECTOR_ID);
  if (!mateo) {
    throw new Error(
      "Mateo Vargas (devils-advocate) missing from Board registry",
    );
  }
  return mateo;
}

/** All registry Directors. Prefer listVisible for UI. */
export function listAllRegisteredBoardDirectors(): readonly BoardDirectorDefinition[] {
  return listBoardDirectors();
}
