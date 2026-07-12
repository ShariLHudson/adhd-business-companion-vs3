/**
 * Round Table — visible Directors only (Thomas MVP).
 * @vitest-environment node
 */

import { describe, expect, it } from "vitest";
import {
  THOMAS_ELLISON_DIRECTOR_ID,
  VISIBLE_BOARD_DIRECTOR_IDS,
} from "@/lib/board/visibleDirectors";
import {
  ROUND_TABLE_SCENE_SRC,
  ROUND_TABLE_SEATS,
  closeRoundTable,
  createClosedRoundTableNav,
  getRoundTableSeatForDirector,
  openRoundTable,
  returnToMemberPlace,
  selectRoundTableDirector,
  verifyRoundTableSeatsCoverAllDirectors,
} from "@/lib/board/roundTable";

describe("Round Table seats", () => {
  it("uses the official Spark Estate Round Table scene", () => {
    expect(ROUND_TABLE_SCENE_SRC).toBe(
      "/backgrounds/round-table-boardroom-background.png",
    );
  });

  it("seats only visible Directors — empty chairs are not Directors", () => {
    expect(verifyRoundTableSeatsCoverAllDirectors()).toBe(true);
    const directorSeats = ROUND_TABLE_SEATS.filter((s) => s.kind === "director");
    expect(directorSeats).toHaveLength(VISIBLE_BOARD_DIRECTOR_IDS.length);
    expect(directorSeats.map((s) => s.directorId)).toEqual([
      THOMAS_ELLISON_DIRECTOR_ID,
    ]);
    expect(ROUND_TABLE_SEATS.some((s) => s.kind === "empty")).toBe(true);
    expect(
      ROUND_TABLE_SEATS.some((s) => s.directorId === "vice-chair"),
    ).toBe(false);
  });

  it("highlights Thomas Ellison’s chair (Chair of the Board)", () => {
    const chair = getRoundTableSeatForDirector("board-chair");
    expect(chair?.chairHighlight).toBe(true);
    expect(chair?.directorId).toBe("board-chair");
    expect(chair?.label).toMatch(/Thomas/i);
  });

  it("includes My Place at the Table as the member seat", () => {
    const member = ROUND_TABLE_SEATS.find((s) => s.kind === "member");
    expect(member?.seatId).toBe("member-place");
    expect(member?.label).toBe("My Place at the Table");
  });
});

describe("Round Table navigation", () => {
  it("opens and closes without clearing Director history", () => {
    let nav = openRoundTable(createClosedRoundTableNav(), "board-chair");
    expect(nav.open).toBe(true);
    expect(nav.activeDirectorId).toBe("board-chair");
    nav = selectRoundTableDirector(nav, "board-chair");
    expect(nav.activeDirectorId).toBe("board-chair");
    nav = closeRoundTable(nav);
    expect(nav.open).toBe(false);
    expect(nav.activeDirectorId).toBe("board-chair");
  });

  it("returns to the member place while preserving previous Director", () => {
    let nav = selectRoundTableDirector(
      openRoundTable(createClosedRoundTableNav(), null),
      "board-chair",
    );
    nav = returnToMemberPlace(nav);
    expect(nav.activeDirectorId).toBeNull();
    expect(nav.previousDirectorId).toBe("board-chair");
    expect(nav.open).toBe(true);
  });
});
