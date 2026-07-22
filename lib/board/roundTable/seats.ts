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
 * Index 0 = member place; remaining slots hold the full visible Board roster.
 */
const CHAIR_AND_FUTURE_SLOTS = 12;

/**
 * Hand-placed seat coordinates, traced directly on the official Round Table
 * plate (public/backgrounds/round-table-boardroom-background.png) so every
 * marker sits on the visible wood rim of the table — never floating above it
 * into the fireplace, bookshelves, or side furniture behind the table.
 *
 * A pure ellipse formula previously placed the near seats (member place,
 * Chair, Vice Chair, and their mirrors) correctly, but pushed the seats
 * along the back of the table up into the fireplace opening and bookshelves.
 * These coordinates were verified pixel-by-pixel against the plate image
 * (percentage-grid + marker overlays) so the whole ring reads as one
 * continuous edge around the table, front to back.
 *
 * Order is clockwise starting at the member's place (bottom, nearest
 * camera): member → left side → back (kept clear of the fireplace) →
 * right side → back to the member's near-right neighbor.
 */
const SEAT_POSITIONS: readonly { x: number; y: number }[] = [
  { x: 50, y: 84 }, // 0 member place
  { x: 33.27, y: 80.56 }, // 1 board-chair (Thomas)
  { x: 20.33, y: 70.98 }, // 2 vice-chair (Shari)
  { x: 14, y: 63 }, // 3 founder-advocate (David)
  { x: 22, y: 54 }, // 4 strategy-director (Victoria)
  { x: 33, y: 50 }, // 5 financial-stewardship (Melissa)
  { x: 44, y: 49 }, // 6 operations-capacity (Marcus)
  { x: 56, y: 49 }, // 7 customer-market (Sofia)
  { x: 67, y: 50 }, // 8 growth-opportunity (James)
  { x: 78, y: 54 }, // 9 risk-resilience (Laura)
  { x: 86, y: 63 }, // 10 technology-future (Maya)
  { x: 79.6, y: 70.98 }, // 11 values-trust (Carlos)
  { x: 66.7, y: 80.56 }, // 12 devils-advocate (Mateo)
];

function ringSeat(index: number): { x: number; y: number } {
  const pos = SEAT_POSITIONS[index % SEAT_POSITIONS.length];
  return { x: pos.x, y: pos.y };
}

/** 1 member place + 12 Director chairs */
export const ROUND_TABLE_SEAT_COUNT = 13;

export const ROUND_TABLE_SEATS: readonly RoundTableSeat[] = (() => {
  const seats: RoundTableSeat[] = [];

  const memberPos = ringSeat(0);
  seats.push({
    seatId: "member-place",
    x: memberPos.x,
    y: memberPos.y,
    kind: "member",
    label: "Your seat",
  });

  for (let i = 0; i < CHAIR_AND_FUTURE_SLOTS; i++) {
    const pos = ringSeat(i + 1);
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
