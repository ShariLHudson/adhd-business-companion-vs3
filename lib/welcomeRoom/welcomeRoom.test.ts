import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  dismissWelcomeRoomInvitation,
  hasVisitedWelcomeRoom,
  recordWelcomeRoomVisit,
  resetWelcomeRoomMemoryForTests,
  scheduleWelcomeRoomInvitation,
  shouldShowWelcomeRoomInvitation,
  shouldShowWelcomeRoomLoginOffer,
} from "./persistence";

describe("welcomeRoom persistence", () => {
  beforeEach(() => {
    const localMem = new Map<string, string>();
    const sessionMem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => localMem.get(k) ?? null,
      setItem: (k: string, v: string) => localMem.set(k, v),
      removeItem: (k: string) => localMem.delete(k),
      clear: () => localMem.clear(),
    });
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => sessionMem.get(k) ?? null,
      setItem: (k: string, v: string) => sessionMem.set(k, v),
      removeItem: (k: string) => sessionMem.delete(k),
    });
    vi.stubGlobal("window", {
      localStorage,
      sessionStorage,
      dispatchEvent: () => {},
    });
    resetWelcomeRoomMemoryForTests();
  });

  it("schedules invitation after onboarding and shows once", () => {
    expect(shouldShowWelcomeRoomInvitation()).toBe(false);
    scheduleWelcomeRoomInvitation();
    expect(shouldShowWelcomeRoomInvitation()).toBe(true);
    dismissWelcomeRoomInvitation();
    expect(shouldShowWelcomeRoomInvitation()).toBe(false);
  });

  it("records visit and clears pending invitation", () => {
    scheduleWelcomeRoomInvitation();
    recordWelcomeRoomVisit();
    expect(hasVisitedWelcomeRoom()).toBe(true);
    expect(shouldShowWelcomeRoomInvitation()).toBe(false);
    expect(shouldShowWelcomeRoomLoginOffer()).toBe(false);
  });
});
