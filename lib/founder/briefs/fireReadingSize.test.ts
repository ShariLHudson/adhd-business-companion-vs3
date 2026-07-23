/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  FIRE_READING_BODY_PX,
  FIRE_READING_SIZE_DEFAULT,
  FIRE_READING_SIZE_OPTIONS,
  FIRE_READING_SIZE_STORAGE_KEY,
  isFireReadingSize,
  normalizeFireReadingSize,
  readFireReadingSize,
  writeFireReadingSize,
} from "./fireReadingSize";

describe("fireReadingSize", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to comfortable readable size", () => {
    expect(readFireReadingSize()).toBe(FIRE_READING_SIZE_DEFAULT);
    expect(FIRE_READING_SIZE_DEFAULT).toBe("comfortable");
  });

  it("lists Small and Smaller under Comfortable, then enlarge options", () => {
    expect(FIRE_READING_SIZE_OPTIONS).toEqual([
      "comfortable",
      "small",
      "smaller",
      "larger",
      "largest",
    ]);
  });

  it("persists selected size including small and smaller", () => {
    writeFireReadingSize("small");
    expect(readFireReadingSize()).toBe("small");
    writeFireReadingSize("smaller");
    expect(readFireReadingSize()).toBe("smaller");
    writeFireReadingSize("largest");
    expect(window.localStorage.getItem(FIRE_READING_SIZE_STORAGE_KEY)).toBe(
      "largest",
    );
    expect(readFireReadingSize()).toBe("largest");
  });

  it("rejects invalid stored values", () => {
    window.localStorage.setItem(FIRE_READING_SIZE_STORAGE_KEY, "huge");
    expect(isFireReadingSize("huge")).toBe(false);
    expect(readFireReadingSize()).toBe("comfortable");
  });

  it("migrates legacy default to comfortable; smaller is a real size again", () => {
    expect(normalizeFireReadingSize("default")).toBe("comfortable");
    expect(normalizeFireReadingSize("smaller")).toBe("smaller");
    expect(isFireReadingSize("smaller")).toBe(true);
    expect(isFireReadingSize("small")).toBe(true);
    expect(FIRE_READING_BODY_PX.comfortable).toBe(24);
    expect(FIRE_READING_BODY_PX.small).toBeLessThan(
      FIRE_READING_BODY_PX.comfortable,
    );
    expect(FIRE_READING_BODY_PX.smaller).toBeLessThan(
      FIRE_READING_BODY_PX.small,
    );
  });
});
