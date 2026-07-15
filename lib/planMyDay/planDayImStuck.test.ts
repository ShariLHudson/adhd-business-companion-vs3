/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import {
  PLAN_DAY_IM_STUCK_EVENT,
  PLAN_DAY_IM_STUCK_QUESTION,
  buildPlanDayImStuckQuestion,
  requestPlanDayImStuck,
  type PlanDayImStuckDetail,
} from "@/lib/planMyDay/planDayImStuck";

describe("planDayImStuck", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("asks a contextual opening question (not a blank generic chat)", () => {
    expect(PLAN_DAY_IM_STUCK_QUESTION).toContain("Plan My Day");
    expect(PLAN_DAY_IM_STUCK_QUESTION).toMatch(/\?/);
    expect(PLAN_DAY_IM_STUCK_QUESTION.split("?").length).toBe(2);
  });

  it("includes plan titles when available", () => {
    const q = buildPlanDayImStuckQuestion({
      itemTitles: ["Call the client", "Send invoice"],
    });
    expect(q).toContain("Call the client");
    expect(q).toContain("Send invoice");
    expect(q).toContain("Plan My Day");
  });

  it("dispatches the chat event exactly once", () => {
    const spy = vi.fn();
    window.addEventListener(PLAN_DAY_IM_STUCK_EVENT, spy);
    requestPlanDayImStuck(["Call the client"]);
    expect(spy).toHaveBeenCalledTimes(1);
    const detail = (
      spy.mock.calls[0]![0] as CustomEvent<PlanDayImStuckDetail>
    ).detail;
    expect(detail.itemTitles).toEqual(["Call the client"]);
    window.removeEventListener(PLAN_DAY_IM_STUCK_EVENT, spy);
  });
});
