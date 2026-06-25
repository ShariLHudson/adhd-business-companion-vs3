import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  COMPANION_CONTINUE_BUTTON_LABEL,
  resolveCompanionContinue,
} from "./companionLedContinue";
import { resetPhase1OnboardingForTests } from "./phase1Onboarding";

describe("companionLedContinue", () => {
  beforeEach(() => {
    const localMem = new Map<string, string>();
    const sessionMem = new Map<string, string>();
    const localStorage = {
      getItem: (k: string) => localMem.get(k) ?? null,
      setItem: (k: string, v: string) => localMem.set(k, v),
      removeItem: (k: string) => localMem.delete(k),
      clear: () => localMem.clear(),
    };
    const sessionStorage = {
      getItem: (k: string) => sessionMem.get(k) ?? null,
      setItem: (k: string, v: string) => sessionMem.set(k, v),
      removeItem: (k: string) => sessionMem.delete(k),
      clear: () => sessionMem.clear(),
    };
    vi.stubGlobal("localStorage", localStorage);
    vi.stubGlobal("sessionStorage", sessionStorage);
    vi.stubGlobal("window", { localStorage, sessionStorage });
    resetPhase1OnboardingForTests();
  });

  it("uses onboarding mode during phase 1", () => {
    expect(resolveCompanionContinue()).toEqual({ mode: "onboarding" });
  });

  it("prefers conversation over workspace items", () => {
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
    localStorage.setItem(
      "companion-projects-v1",
      JSON.stringify([
        {
          id: "p1",
          name: "VIP Offer",
          goal: "",
          goals: [],
          horizon: "now",
          status: "in-progress",
          nextAction: "Outline pricing for the full offer",
          color: "#1e4f4f",
          createdAt: "2026-06-01T12:00:00.000Z",
          updatedAt: "2026-06-08T12:00:00.000Z",
        },
      ]),
    );
    localStorage.setItem(
      "companion-project-items-v1",
      JSON.stringify([
        {
          id: "t1",
          projectId: "p1",
          title: "Pricing outline",
          kind: "task",
          done: false,
          createdAt: "2026-06-01T12:00:00.000Z",
          updatedAt: "2026-06-08T12:00:00.000Z",
        },
      ]),
    );

    const result = resolveCompanionContinue();
    expect(result.mode).toBe("choose");
    if (result.mode === "choose") {
      expect(result.options[0]?.kind).toBe("conversation");
      expect(result.options[0]?.title).toBe("Marketing Plan");
    }
  });

  it("returns empty prompt when nothing meaningful exists", () => {
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
    const result = resolveCompanionContinue();
    expect(result).toEqual({
      mode: "empty",
      prompt: "What would help most right now?",
    });
  });

  it("exposes the continue button label", () => {
    expect(COMPANION_CONTINUE_BUTTON_LABEL).toBe("Continue Where I Left Off");
  });
});
