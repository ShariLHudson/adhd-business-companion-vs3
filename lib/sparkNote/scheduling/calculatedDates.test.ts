import { describe, expect, it } from "vitest";
import {
  matchesCalculatedDate,
  resolveCalculatedDate,
} from "./calculatedDates";

describe("resolveCalculatedDate — fixed-weekday US observances", () => {
  it("Thanksgiving (4th Thursday of November)", () => {
    expect(resolveCalculatedDate("thanksgiving-us", 2024)).toEqual({
      month: 11,
      day: 28,
    });
    expect(resolveCalculatedDate("thanksgiving-us", 2025)).toEqual({
      month: 11,
      day: 27,
    });
  });

  it("Memorial Day (last Monday of May)", () => {
    expect(resolveCalculatedDate("memorial-day-us", 2024)).toEqual({
      month: 5,
      day: 27,
    });
    expect(resolveCalculatedDate("memorial-day-us", 2025)).toEqual({
      month: 5,
      day: 26,
    });
  });

  it("Mother's Day (2nd Sunday of May)", () => {
    expect(resolveCalculatedDate("mothers-day-us", 2024)).toEqual({
      month: 5,
      day: 12,
    });
    expect(resolveCalculatedDate("mothers-day-us", 2025)).toEqual({
      month: 5,
      day: 11,
    });
  });

  it("Martin Luther King Jr. Day (3rd Monday of January)", () => {
    expect(resolveCalculatedDate("mlk-day-us", 2024)).toEqual({
      month: 1,
      day: 15,
    });
    expect(resolveCalculatedDate("mlk-day-us", 2025)).toEqual({
      month: 1,
      day: 20,
    });
  });
});

describe("resolveCalculatedDate — conventional solstice/equinox observances", () => {
  it("Winter Solstice is the conventional Dec 21 every year", () => {
    expect(resolveCalculatedDate("winter-solstice", 2024)).toEqual({
      month: 12,
      day: 21,
    });
    expect(resolveCalculatedDate("winter-solstice", 2031)).toEqual({
      month: 12,
      day: 21,
    });
  });

  it("Spring Equinox is the conventional Mar 20 every year", () => {
    expect(resolveCalculatedDate("spring-equinox", 2024)).toEqual({
      month: 3,
      day: 20,
    });
    expect(resolveCalculatedDate("spring-equinox", 2030)).toEqual({
      month: 3,
      day: 20,
    });
  });
});

describe("matchesCalculatedDate — local-day matching", () => {
  it("matches only on the resolved local calendar day", () => {
    // 2024 Thanksgiving = Nov 28. Local Date constructor → local midnight.
    expect(matchesCalculatedDate("thanksgiving-us", new Date(2024, 10, 28))).toBe(
      true,
    );
    expect(matchesCalculatedDate("thanksgiving-us", new Date(2024, 10, 27))).toBe(
      false,
    );
  });

  it("MLK Day matches Jan 20, 2025", () => {
    expect(matchesCalculatedDate("mlk-day-us", new Date(2025, 0, 20))).toBe(true);
    expect(matchesCalculatedDate("mlk-day-us", new Date(2025, 0, 15))).toBe(
      false,
    );
  });

  it("Winter Solstice matches the conventional Dec 21", () => {
    expect(matchesCalculatedDate("winter-solstice", new Date(2024, 11, 21))).toBe(
      true,
    );
    expect(matchesCalculatedDate("winter-solstice", new Date(2024, 11, 20))).toBe(
      false,
    );
  });

  it("Spring Equinox matches the conventional Mar 20", () => {
    expect(matchesCalculatedDate("spring-equinox", new Date(2025, 2, 20))).toBe(
      true,
    );
    expect(matchesCalculatedDate("spring-equinox", new Date(2025, 2, 19))).toBe(
      false,
    );
  });

  it("Memorial Day matches last Monday of May 2025 (May 26)", () => {
    expect(matchesCalculatedDate("memorial-day-us", new Date(2025, 4, 26))).toBe(
      true,
    );
  });

  it("Mother's Day matches 2nd Sunday of May 2024 (May 12)", () => {
    expect(matchesCalculatedDate("mothers-day-us", new Date(2024, 4, 12))).toBe(
      true,
    );
  });
});
