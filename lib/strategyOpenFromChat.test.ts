import { describe, expect, it } from "vitest";
import { resolveStrategyOpenFromChat } from "./strategyOpenFromChat";

describe("strategyOpenFromChat", () => {
  it("opens Start Ugly from casual phrasing", () => {
    const r = resolveStrategyOpenFromChat("open just start ugly");
    expect(r?.kind).toBe("builtin");
    if (r?.kind === "builtin") {
      expect(r.strategyId).toBe("ugly-first-draft");
      expect(r.title).toBe("Start Ugly");
    }
  });

  it("opens Body Double", () => {
    const r = resolveStrategyOpenFromChat("open body double");
    expect(r?.kind).toBe("builtin");
    if (r?.kind === "builtin") expect(r.strategyId).toBe("body-double");
  });

  it("ignores unrelated messages", () => {
    expect(resolveStrategyOpenFromChat("I'm overwhelmed")).toBeNull();
  });
});
