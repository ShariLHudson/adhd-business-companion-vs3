import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  hasSeenWelcomeIntro,
  markWelcomeIntroSeen,
  resetWelcomeHomeFirstLaunchForTests,
} from "./firstLaunchPersistence";
import {
  clearWelcomeHomeReplayRequest,
  peekWelcomeHomeReplayRequested,
  requestWelcomeHomeReplay,
} from "./replay";

function stubBrowserStorage() {
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
}

describe("welcomeHome intro persistence", () => {
  beforeEach(() => {
    stubBrowserStorage();
    resetWelcomeHomeFirstLaunchForTests();
    clearWelcomeHomeReplayRequest();
  });

  it("starts unseen and records hasSeenWelcomeIntro", () => {
    expect(hasSeenWelcomeIntro()).toBe(false);
    markWelcomeIntroSeen();
    expect(hasSeenWelcomeIntro()).toBe(true);
  });
});

describe("welcomeHome replay", () => {
  beforeEach(() => {
    stubBrowserStorage();
    clearWelcomeHomeReplayRequest();
  });

  it("queues a session replay request", () => {
    expect(peekWelcomeHomeReplayRequested()).toBe(false);
    requestWelcomeHomeReplay();
    expect(peekWelcomeHomeReplayRequested()).toBe(true);
    clearWelcomeHomeReplayRequest();
    expect(peekWelcomeHomeReplayRequested()).toBe(false);
  });
});
