/**
 * Interactive Round Table — official Board navigation seats.
 * Visible Directors only occupy chairs; other seats stay empty (no fake Directors).
 */

import type { BoardDirectorId } from "@/lib/board/types";
import { VISIBLE_BOARD_DIRECTOR_IDS } from "@/lib/board/visibleDirectors";
import { getBoardDirectorById } from "@/lib/board/boardDirectorRegistry";

/** Official Spark Estate Round Table plate */
export const ROUND_TABLE_SCENE_SRC =
  "/backgrounds/round-table-boardroom-background.png" as const;

export type RoundTableSeatKind = "director" | "member" | "empty";

export type RoundTableSeat = {
  seatId: string;
  /** Percent positions within the table scene (0–100). */
  x: number;
  y: number;
  kind: RoundTableSeatKind;
  directorId?: BoardDirectorId;
  /** Chair of the Board — always highlighted on the table. */
  chairHighlight?: boolean;
  /** Accessible label when no director is assigned yet */
  label: string;
};

/**
 * Seat order around the table (clockwise from the member's place at bottom).
 * Index 0 = member place; Chair opposite the member when visible.
 * Remaining chairs are empty until more Directors are approved.
 */
const CHAIR_AND_FUTURE_SLOTS = 11;

function ellipseSeat(index: number, total: number): { x: number; y: number } {
  const angle = Math.PI / 2 + (index / total) * Math.PI * 2;
  return {
    x: Number((50 + 36 * Math.cos(angle)).toFixed(2)),
    y: Number((54 + 30 * Math.sin(angle)).toFixed(2)),
  };
}

/** 1 member place + 11 chair slots (only visible Directors assigned) */
export const ROUND_TABLE_SEAT_COUNT = 12;

export const ROUND_TABLE_SEATS: readonly RoundTableSeat[] = (() => {
  const seats: RoundTableSeat[] = [];
  const total = ROUND_TABLE_SEAT_COUNT;

  const memberPos = ellipseSeat(0, total);
  seats.push({
    seatId: "member-place",
    x: memberPos.x,
    y: memberPos.y,
    kind: "member",
    label: "My Place at the Table",
  });

  for (let i = 0; i < CHAIR_AND_FUTURE_SLOTS; i++) {
    const pos = ellipseSeat(i + 1, total);
    const directorId = VISIBLE_BOARD_DIRECTOR_IDS[i];
    if (directorId) {
      const director = getBoardDirectorById(directorId);
      seats.push({
        seatId: `seat-${directorId}`,
        x: pos.x,
        y: pos.y,
        kind: "director",
        directorId,
        chairHighlight: directorId === "board-chair",
        label: director?.name ?? directorId,
      });
    } else {
      seats.push({
        seatId: `seat-empty-${i}`,
        x: pos.x,
        y: pos.y,
        kind: "empty",
        label: "Chair reserved for a future Director",
      });
    }
  }

  return seats;
})();

export function getRoundTableDirectorSeats(): RoundTableSeat[] {
  return ROUND_TABLE_SEATS.filter((s) => s.kind === "director");
}

export function getRoundTableSeatForDirector(
  directorId: BoardDirectorId,
): RoundTableSeat | undefined {
  return ROUND_TABLE_SEATS.find((s) => s.directorId === directorId);
}

/** Sanity: every currently visible Director has exactly one chair. */
export function verifyRoundTableSeatsCoverAllDirectors(): boolean {
  const seated = new Set(
    ROUND_TABLE_SEATS.map((s) => s.directorId).filter(Boolean),
  );
  return VISIBLE_BOARD_DIRECTOR_IDS.every((id) => seated.has(id));
}
