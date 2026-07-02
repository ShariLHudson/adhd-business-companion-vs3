import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  shouldShowDirectEstateOverlay,
  shouldShowDirectEstateVisitOverlay,
} from "./estateChatNavigation";
import type { DirectEstateVisit } from "./directEstateVisit";
import {
  registerEstatePendingTransition,
  clearEstatePendingTransition,
} from "@/lib/estateMemory";

describe("estateChatNavigation", () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    Object.defineProperty(globalThis, "sessionStorage", {
      value: {
        getItem: (k: string) => storage.get(k) ?? null,
        setItem: (k: string, v: string) => {
          storage.set(k, v);
        },
        removeItem: (k: string) => {
          storage.delete(k);
        },
      },
      configurable: true,
    });
    clearEstatePendingTransition();
  });

  afterEach(() => {
    clearEstatePendingTransition();
  });

  it("shows overlay for apple orchard on focus-audio with visit state", () => {
    const visit: DirectEstateVisit = {
      roomId: "apple-orchard",
      section: "focus-audio",
      userIntent: "go to the apple orchard",
      userMessageCountAtArrival: 0,
    };
    expect(shouldShowDirectEstateVisitOverlay(visit, "focus-audio")).toBe(true);
    expect(shouldShowDirectEstateOverlay("focus-audio", visit)).toBe(true);
    expect(shouldShowDirectEstateOverlay("stables", visit)).toBe(false);
  });

  it("falls back to pending transition without visit state", () => {
    registerEstatePendingTransition({
      destinationSection: "focus-audio",
      destinationEntryId: "apple-orchard",
      originalUserIntent: "go to the apple orchard",
      offeredAtTurn: 1,
      followUpQuestion: false,
    });
    expect(shouldShowDirectEstateOverlay("focus-audio")).toBe(true);
  });
});
