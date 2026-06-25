import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildPostLoginContinueResolution,
  consumePostLoginContinue,
  storePostLoginContinueFromResolution,
} from "./postLoginContinue";
import { resetPhase1OnboardingForTests } from "./phase1Onboarding";

describe("postLoginContinue", () => {
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
      clear: () => localMem.clear(),
    });
    vi.stubGlobal("window", { sessionStorage, localStorage });
    resetPhase1OnboardingForTests();
  });

  it("stores auto-resume only for a single meaningful activity", () => {
    localStorage.setItem(
      "companion-phase1-onboarding-v1",
      JSON.stringify({
        complete: true,
        phase: "complete",
        profile: {},
        memorySeedConfirmed: true,
        assistantQuestionsAsked: 0,
        startedAt: "2026-06-01T12:00:00.000Z",
        updatedAt: "2026-06-12T12:00:00.000Z",
      }),
    );
    localStorage.setItem(
      "companion-last-activity-v1",
      JSON.stringify({
        kind: "chat",
        title: "Marketing Plan",
        ts: "2026-06-12T12:00:00.000Z",
      }),
    );

    const resolution = buildPostLoginContinueResolution();
    storePostLoginContinueFromResolution(resolution);
    const intent = consumePostLoginContinue();
    expect(intent?.action).toBe("resume");
    expect(intent?.option.title).toBe("Marketing Plan");
    expect(consumePostLoginContinue()).toBeNull();
  });

  it("does not store intent when nothing meaningful exists", () => {
    localStorage.setItem(
      "companion-phase1-onboarding-v1",
      JSON.stringify({
        complete: true,
        phase: "complete",
        profile: {},
        memorySeedConfirmed: true,
        assistantQuestionsAsked: 0,
        startedAt: "2026-06-01T12:00:00.000Z",
        updatedAt: "2026-06-12T12:00:00.000Z",
      }),
    );
    const resolution = buildPostLoginContinueResolution();
    expect(resolution.mode).toBe("empty");
    storePostLoginContinueFromResolution(resolution);
    expect(consumePostLoginContinue()).toBeNull();
  });
});
