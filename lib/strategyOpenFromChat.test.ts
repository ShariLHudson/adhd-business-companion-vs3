import { describe, expect, it } from "vitest";
import { resolveStrategyOpenFromChat } from "./strategyOpenFromChat";

const PROCRASTINATION_REPLY =
  "Procrastination is the worst — I get it. **Start Ugly**, **Shrink the First Step**, and **Body Double** are all in the ADHD dropdown on the right. Pick one, or tell me what's making this hard and we'll choose together.";

describe("strategyOpenFromChat", () => {
  it("opens Start Ugly from casual phrasing", () => {
    const r = resolveStrategyOpenFromChat("open just start ugly");
    expect(r?.kind).toBe("builtin");
    if (r?.kind === "builtin") {
      expect(r.strategyId).toBe("ugly-first-draft");
      expect(r.title).toBe("Start Ugly");
    }
  });

  it("opens Start Ugly when user picks by name in Strategies", () => {
    const r = resolveStrategyOpenFromChat("start ugly", {
      inStrategiesWorkspace: true,
    });
    expect(r?.strategyId).toBe("ugly-first-draft");
  });

  it("opens Body Double from bare pick after offer", () => {
    const r = resolveStrategyOpenFromChat("body double", {
      inStrategiesWorkspace: true,
      lastAssistantText: PROCRASTINATION_REPLY,
    });
    expect(r?.strategyId).toBe("body-double");
  });

  it("opens Shrink the First Step from shorthand", () => {
    const r = resolveStrategyOpenFromChat("shrink", {
      inStrategiesWorkspace: true,
    });
    expect(r?.strategyId).toBe("shrink-first-step");
  });

  it("opens first option from ordinal pick", () => {
    const r = resolveStrategyOpenFromChat("the first one", {
      inStrategiesWorkspace: true,
      lastAssistantText: PROCRASTINATION_REPLY,
    });
    expect(r?.strategyId).toBe("ugly-first-draft");
  });

  it("ignores unrelated messages outside Strategies", () => {
    expect(resolveStrategyOpenFromChat("I'm overwhelmed")).toBeNull();
    expect(resolveStrategyOpenFromChat("start ugly")).toBeNull();
  });
});
