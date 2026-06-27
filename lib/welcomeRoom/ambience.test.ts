import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  WELCOME_ROOM_AMBIENCE_DUCK_VOLUME,
  WELCOME_ROOM_AMBIENCE_PAUSE_VOLUME,
  WELCOME_ROOM_AMBIENCE_SRC,
  WELCOME_ROOM_AMBIENCE_VOLUME,
} from "./ambience";
import {
  getWelcomeRoomAmbienceEnabled,
  getWelcomeRoomWelcomeMode,
  resetWelcomeRoomMemoryForTests,
  setWelcomeRoomAmbienceEnabled,
  setWelcomeRoomWelcomeMode,
} from "./persistence";

describe("welcomeRoom ambience", () => {
  beforeEach(() => {
    const localMem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => localMem.get(k) ?? null,
      setItem: (k: string, v: string) => localMem.set(k, v),
      removeItem: (k: string) => localMem.delete(k),
      clear: () => localMem.clear(),
    });
    vi.stubGlobal("sessionStorage", {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    });
    vi.stubGlobal("window", {
      localStorage,
      sessionStorage,
      dispatchEvent: () => {},
    });
    resetWelcomeRoomMemoryForTests();
  });

  it("points at the local public audio asset", () => {
    expect(WELCOME_ROOM_AMBIENCE_SRC).toBe(
      "/audio/welcome-room/welcome-room-ambience.mp3",
    );
  });

  it("remembers optional ambience preference", () => {
    expect(getWelcomeRoomAmbienceEnabled()).toBe(true);
    setWelcomeRoomAmbienceEnabled(false);
    expect(getWelcomeRoomAmbienceEnabled()).toBe(false);
    setWelcomeRoomAmbienceEnabled(true);
    expect(getWelcomeRoomAmbienceEnabled()).toBe(true);
  });

  it("uses room ambience levels for voice ducking and pause lift", () => {
    expect(WELCOME_ROOM_AMBIENCE_VOLUME).toBeGreaterThanOrEqual(0.15);
    expect(WELCOME_ROOM_AMBIENCE_VOLUME).toBeLessThanOrEqual(0.2);
    expect(WELCOME_ROOM_AMBIENCE_DUCK_VOLUME).toBe(0.05);
    expect(WELCOME_ROOM_AMBIENCE_PAUSE_VOLUME).toBeGreaterThan(
      WELCOME_ROOM_AMBIENCE_DUCK_VOLUME,
    );
  });

  it("remembers listen vs read preference", () => {
    expect(getWelcomeRoomWelcomeMode()).toBeUndefined();
    setWelcomeRoomWelcomeMode("listen");
    expect(getWelcomeRoomWelcomeMode()).toBe("listen");
    setWelcomeRoomWelcomeMode("read");
    expect(getWelcomeRoomWelcomeMode()).toBe("read");
  });
});
