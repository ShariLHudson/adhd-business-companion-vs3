/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  FIRE_READING_SIZE_DEFAULT,
  FIRE_READING_SIZE_STORAGE_KEY,
  isFireReadingSize,
  readFireReadingSize,
  writeFireReadingSize,
} from "./fireReadingSize";

describe("fireReadingSize", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to readable default size", () => {
    expect(readFireReadingSize()).toBe(FIRE_READING_SIZE_DEFAULT);
    expect(FIRE_READING_SIZE_DEFAULT).toBe("default");
  });

  it("persists selected size", () => {
    writeFireReadingSize("larger");
    expect(window.localStorage.getItem(FIRE_READING_SIZE_STORAGE_KEY)).toBe(
      "larger",
    );
    expect(readFireReadingSize()).toBe("larger");
  });

  it("rejects invalid stored values", () => {
    window.localStorage.setItem(FIRE_READING_SIZE_STORAGE_KEY, "huge");
    expect(isFireReadingSize("huge")).toBe(false);
    expect(readFireReadingSize()).toBe("default");
  });
});
