import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCompanionPostLoginQuiet,
  COMPANION_LOGIN_FADE_MS,
  COMPANION_LOGIN_LOADING_DELAY_MS,
  COMPANION_LOGIN_SLOW_MESSAGES,
  consumeCompanionLoginArrival,
  isCompanionPostLoginQuiet,
  markCompanionLoginArrival,
  pickCompanionLoginSlowMessage,
} from "./companionLoginTransition";

describe("companionLoginTransition", () => {
  beforeEach(() => {
    const sessionMem = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => sessionMem.get(k) ?? null,
      setItem: (k: string, v: string) => sessionMem.set(k, v),
      removeItem: (k: string) => sessionMem.delete(k),
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
});
