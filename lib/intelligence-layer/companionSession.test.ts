import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  COMPANION_SESSION_IDLE_MS,
  getCompanionSession,
  getOrCreateCompanionSession,
  initCompanionSession,
  resetCompanionSessionForTests,
  touchCompanionSession,
} from "./companionSession";

describe("companionSession", () => {
  beforeEach(() => {
    resetCompanionSessionForTests();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-22T12:00:00.000Z"));
  });

  afterEach(() => {
    resetCompanionSessionForTests();
    vi.useRealTimers();
  });

  it("initCompanionSession creates session with required fields", () => {
    const session = initCompanionSession();
    expect(session.sessionId).toBeTruthy();
    expect(session.productId).toBe("ecosystem");
    expect(session.startedAt).toBe("2026-06-22T12:00:00.000Z");
    expect(session.lastActivityAt).toBe("2026-06-22T12:00:00.000Z");
    expect(getCompanionSession()?.sessionId).toBe(session.sessionId);
  });

  it("initCompanionSession reuses session within idle window", () => {
    const first = initCompanionSession();
    vi.advanceTimersByTime(5 * 60 * 1000);
    const second = initCompanionSession();
    expect(second.sessionId).toBe(first.sessionId);
    expect(second.startedAt).toBe(first.startedAt);
  });

  it("creates new session after 30 minutes idle", () => {
    const first = initCompanionSession();
    vi.advanceTimersByTime(COMPANION_SESSION_IDLE_MS);
    const second = initCompanionSession();
    expect(second.sessionId).not.toBe(first.sessionId);
    expect(second.startedAt).toBe("2026-06-22T12:30:00.000Z");
  });

  it("touchCompanionSession updates lastActivityAt and preserves session", () => {
    const session = initCompanionSession();
    vi.advanceTimersByTime(10 * 60 * 1000);
    const touched = touchCompanionSession();
    expect(touched.sessionId).toBe(session.sessionId);
    expect(touched.lastActivityAt).toBe("2026-06-22T12:10:00.000Z");
  });

  it("touchCompanionSession after idle creates a new session", () => {
    initCompanionSession();
    vi.advanceTimersByTime(COMPANION_SESSION_IDLE_MS + 1);
    const next = touchCompanionSession();
    expect(next.startedAt).toBe("2026-06-22T12:30:00.001Z");
  });

  it("getOrCreateCompanionSession returns same session across workspace-style touches", () => {
    const session = getOrCreateCompanionSession();
    vi.advanceTimersByTime(2 * 60 * 1000);
    touchCompanionSession();
    const again = getOrCreateCompanionSession();
    expect(again.sessionId).toBe(session.sessionId);
  });
});
