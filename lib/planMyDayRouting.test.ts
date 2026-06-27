import { describe, expect, it } from "vitest";
import {
  isPlanMyDaySection,
  shouldOpenPlanMyDayBesideChat,
  shouldOpenPlanMyDayStandalone,
} from "./planMyDayRouting";

describe("planMyDayRouting", () => {
  it("opens Plan My Day only as a standalone room", () => {
    expect(shouldOpenPlanMyDayStandalone("plan-my-day")).toBe(true);
    expect(shouldOpenPlanMyDayStandalone("home")).toBe(false);
    expect(shouldOpenPlanMyDayBesideChat("plan-my-day")).toBe(false);
    expect(isPlanMyDaySection("plan-my-day")).toBe(true);
  });
});
