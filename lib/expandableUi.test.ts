import { describe, expect, it } from "vitest";
import {
  initialCollapsedSectionMap,
  initialSectionOpen,
  SECTIONS_START_COLLAPSED,
  toggleSectionInMap,
} from "./expandableUi";

describe("expandableUi", () => {
  it("sections start collapsed on screen entry", () => {
    expect(SECTIONS_START_COLLAPSED).toBe(true);
    expect(initialSectionOpen()).toBe(false);
    expect(initialSectionOpen(true)).toBe(false);
  });

  it("initialCollapsedSectionMap starts every id closed", () => {
    expect(initialCollapsedSectionMap("recent", "all")).toEqual({
      recent: false,
      all: false,
    });
  });

  it("toggleSectionInMap flips one section and keeps page state", () => {
    const next = toggleSectionInMap({ recent: false, all: false }, "recent");
    expect(next).toEqual({ recent: true, all: false });
    expect(toggleSectionInMap(next, "recent")).toEqual({
      recent: false,
      all: false,
    });
  });
});
