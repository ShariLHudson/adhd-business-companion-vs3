import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearGrowthSaveSuggestion,
  getPendingGrowthSaveSuggestion,
  queueGrowthSaveSuggestion,
} from "./growthSaveSuggestions";

describe("growthSaveSuggestions", () => {
  beforeEach(() => {
    const storage: Record<string, string> = {};
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => storage[k] ?? null,
      setItem: (k: string, v: string) => {
        storage[k] = v;
      },
      removeItem: (k: string) => {
        delete storage[k];
      },
    });
  });

  afterEach(() => {
    clearGrowthSaveSuggestion();
    vi.unstubAllGlobals();
  });

  it("queues and clears a pending suggestion", () => {
    expect(getPendingGrowthSaveSuggestion()).toBeNull();
    queueGrowthSaveSuggestion({
      text: "Signed a new client",
      destinations: ["wins", "evidence"],
    });
    const pending = getPendingGrowthSaveSuggestion();
    expect(pending?.text).toBe("Signed a new client");
    expect(pending?.destinations).toEqual(["wins", "evidence"]);
    clearGrowthSaveSuggestion();
    expect(getPendingGrowthSaveSuggestion()).toBeNull();
  });
});
