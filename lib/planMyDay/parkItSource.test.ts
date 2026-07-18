/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addParkingLotItem,
  parkingLotHasActiveTitle,
  parkingLotSourceLabel,
  readPlanningParkingLotItems,
} from "./planDayItems";

const DEFERRED_KEY = "companion-plan-my-day-deferred-v1";

describe("Park It source and duplicates (168)", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it("saves one item with source park-it and optional note", () => {
    const created = addParkingLotItem({
      title: "Call the dentist",
      notes: "Tuesday if possible",
      source: "park-it",
    });
    expect(created?.source).toBe("park-it");
    expect(created?.notes).toBe("Tuesday if possible");
    expect(parkingLotSourceLabel(created?.source)).toBe("Park It");
    expect(readPlanningParkingLotItems()).toHaveLength(1);
  });

  it("does not require category or review date", () => {
    const created = addParkingLotItem({
      title: "Loose idea",
      source: "park-it",
    });
    expect(created?.parkCategory).toBeUndefined();
    expect(created?.reviewDate).toBeUndefined();
  });

  it("prevents duplicate active titles", () => {
    addParkingLotItem({ title: "Same thing", source: "park-it" });
    expect(parkingLotHasActiveTitle("Same thing")).toBe(true);
    const second = addParkingLotItem({
      title: "Same thing",
      source: "clear-my-mind",
      preventDuplicate: true,
    });
    expect(readPlanningParkingLotItems()).toHaveLength(1);
    expect(second?.source).toBe("park-it");
    expect(localStorage.getItem(DEFERRED_KEY)).toBeTruthy();
  });
});
