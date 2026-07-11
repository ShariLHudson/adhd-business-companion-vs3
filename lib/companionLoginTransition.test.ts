import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCompanionPostLoginQuiet,
  COMPANION_AUTH_SESSION_PERSISTENCE_ERROR,
  COMPANION_LOGIN_FADE_MS,
  COMPANION_LOGIN_LOADING_DELAY_MS,
  COMPANION_LOGIN_SLOW_MESSAGES,
  consumeCompanionLoginArrival,
  hasCompanionAuthStorageHint,
  isCompanionPostLoginQuiet,
  markCompanionLoginArrival,
  pickCompanionLoginSlowMessage,
} from "./companionLoginTransition";
import { COMPANION_AUTH_STORAGE_KEY } from "./companionStorageRecovery";

describe("companionLoginTransition", () => {
  beforeEach(() => {
    const sessionMem = new Map<string, string>();
    const localMem = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => sessionMem.get(k) ?? null,
      setItem: (k: string, v: string) => sessionMem.set(k, v),
      removeItem: (k: string) => sessionMem.delete(k),
    });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => localMem.get(k) ?? null,
      setItem: (k: string, v: string) => localMem.set(k, v),
      removeItem: (k: string) => localMem.delete(k),
    });
    vi.stubGlobal("window", {
      localStorage,
      setTimeout: (fn: () => void) => {
        fn();
        return 0;
      },
    });
  });

  it("uses immediate navigation after auth", () => {
    expect(COMPANION_LOGIN_FADE_MS).toBe(0);
  });

  it("waits before showing slow loading copy", () => {
    expect(COMPANION_LOGIN_LOADING_DELAY_MS).toBe(1500);
  });

  it("offers calm slow-loading messages without spinners", () => {
    const message = pickCompanionLoginSlowMessage();
    expect(COMPANION_LOGIN_SLOW_MESSAGES).toContain(message);
  });

  it("marks and consumes a one-time home arrival handoff", () => {
    expect(consumeCompanionLoginArrival()).toBe(false);
    markCompanionLoginArrival();
    expect(isCompanionPostLoginQuiet()).toBe(true);
    expect(consumeCompanionLoginArrival()).toBe(true);
    expect(isCompanionPostLoginQuiet()).toBe(false);
  });

  it("exposes a member-facing persistence error message", () => {
    expect(COMPANION_AUTH_SESSION_PERSISTENCE_ERROR).toContain(
      "could not save your session",
    );
  });

  it("hasCompanionAuthStorageHint ignores corrupted auth payloads", () => {
    localStorage.setItem(COMPANION_AUTH_STORAGE_KEY, "not-json{{{");
    expect(hasCompanionAuthStorageHint()).toBe(false);
    localStorage.setItem(COMPANION_AUTH_STORAGE_KEY, '{"user":{}}');
    expect(hasCompanionAuthStorageHint()).toBe(false);
    localStorage.setItem(
      COMPANION_AUTH_STORAGE_KEY,
      JSON.stringify({ access_token: "live-token", refresh_token: "r" }),
    );
    expect(hasCompanionAuthStorageHint()).toBe(true);
  });
});
