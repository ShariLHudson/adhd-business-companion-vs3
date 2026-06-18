import { describe, expect, it } from "vitest";
import {
  ACTIVE_AVATARS,
  formatActiveCompanionsDisplay,
  MAX_ACTIVE_COMPANIONS,
  setActiveCompanionIds,
} from "./activeCompanions";

describe("activeCompanions", () => {
  it("formats combined avatar display", () => {
    expect(
      formatActiveCompanionsDisplay(["wisdom", "adhd-business"]),
    ).toBe("Wisdom Companion + ADHD Business Clients");
  });

  it("respects max active avatars", () => {
    expect(MAX_ACTIVE_COMPANIONS).toBe(3);
    expect(ACTIVE_AVATARS.length).toBeGreaterThanOrEqual(5);
  });

  it("toggles companions without empty selection", () => {
    const withWisdom = setActiveCompanionIds(["adhd-business", "wisdom"]);
    expect(withWisdom).toContain("wisdom");
    const onlyWisdom = withWisdom.filter((id) => id !== "adhd-business");
    expect(setActiveCompanionIds(onlyWisdom.length ? onlyWisdom : ["wisdom"])).toContain(
      "wisdom",
    );
  });
});
