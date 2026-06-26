import { beforeEach, describe, expect, it, vi } from "vitest";
import { evaluateArrivalIntelligence } from "./arrivalIntelligence";
import { getLivingIntelligenceGraph } from "./livingIntelligenceGraph";
import {
  homeChromeForState,
  resolveCompanionHomeState,
} from "./homeState";
import { resetPhase1OnboardingForTests } from "@/lib/phase1Onboarding";

describe("arrivalIntelligence", () => {
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
    vi.stubGlobal("window", { localStorage, sessionStorage, dispatchEvent: () => {} });
    resetPhase1OnboardingForTests();
  });

  it("renders FIRST_VISIT for brand-new users", () => {
    const intel = evaluateArrivalIntelligence({ record: true });
    expect(intel.homeState).toBe("FIRST_VISIT");
    expect(intel.visitorKind).toBe("first_onboarding");
    expect(intel.chrome.navVisibility).toBe("hidden");
    expect(intel.chrome.autoFocusInput).toBe(false);
    expect(intel.welcomeLine).toMatch(/welcome|here for you/i);
    expect(intel.inviteQuestion).toMatch(/on your mind today/i);
    expect(intel.openingMessage).toMatch(/welcome|here for you/i);
    expect(intel.welcomePresence?.greetingCategory).toBe("day_one");
    expect(intel.livingRoom?.layer1.id).toBeTruthy();
    expect(intel.livingRoom?.layer4.greeting).toBe(intel.welcomePresence?.greeting);
    expect(intel.chatPlaceholder).toMatch(/listening/i);
    expect(intel.contextualButtonLabel).toBeNull();
    expect(intel.showContinueList).toBe(false);
    expect(intel.isFirstMeeting).toBe(true);
  });

  it("renders QUIET_PRESENCE when onboarding user returns without threads", () => {
    localStorage.setItem("companion-home-visit-count-v1", "2");
    const intel = evaluateArrivalIntelligence({ record: true });
    expect(intel.homeState).toBe("QUIET_PRESENCE");
    expect(intel.visitorKind).toBe("onboarding_return");
    expect(intel.chrome.navVisibility).toBe("calm");
    expect(intel.openingMessage.length).toBeGreaterThan(0);
    expect(intel.inviteQuestion).toMatch(
      /on your mind|arriving|important|begin|reset|story|help/i,
    );
    expect(intel.contextualButtonLabel).toBeNull();
    expect(intel.isFirstMeeting).toBe(false);
  });

  it("renders QUIET_PRESENCE for established users with no continue threads", () => {
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
    localStorage.setItem("companion-home-visit-count-v1", "12");
    localStorage.setItem(
      "companion-prefs-v1",
      JSON.stringify({ hasChatted: true, name: "Alex" }),
    );

    const intel = evaluateArrivalIntelligence({ record: true });
    expect(intel.homeState).toBe("QUIET_PRESENCE");
    expect(intel.visitorKind).toBe("returning");
    expect(intel.openingMessage.length).toBeGreaterThan(0);
    expect(intel.inviteQuestion).toMatch(
      /on your mind|arriving|important|begin|reset|story|help/i,
    );
    expect(intel.openingMessage).not.toMatch(/learn the app/i);
    expect(intel.isFirstMeeting).toBe(false);
  });

  it("renders RETURNING_ACTIVE when continue threads exist", () => {
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
    localStorage.setItem("companion-home-visit-count-v1", "8");
    localStorage.setItem(
      "companion-prefs-v1",
      JSON.stringify({ hasChatted: true, name: "Alex" }),
    );
    localStorage.setItem(
      "companion-last-activity-v1",
      JSON.stringify({
        kind: "chat",
        title: "newsletter launch",
        ts: "2026-06-24T10:00:00.000Z",
      }),
    );

    const intel = evaluateArrivalIntelligence({ record: true });
    expect(intel.homeState).toBe("RETURNING_ACTIVE");
    expect(intel.chrome.navVisibility).toBe("muted");
    expect(intel.chrome.layout).toBe("welcome-scene");
    expect(intel.livingRoom?.layer1.id).toBeTruthy();
    expect(intel.openingMessage).toMatch(/newsletter launch/i);
    expect(intel.inviteQuestion).toMatch(/pick up where we left off/i);
    expect(intel.contextualButtonLabel).toBe("Continue");
  });

  it("records arrivals in the living graph", () => {
    evaluateArrivalIntelligence({ record: true });
    expect(getLivingIntelligenceGraph().arrivals.length).toBe(1);
  });
});

describe("homeState", () => {
  it("maps chrome config per state", () => {
    expect(homeChromeForState("FIRST_VISIT").navVisibility).toBe("hidden");
    expect(homeChromeForState("RETURNING_ACTIVE").navVisibility).toBe("muted");
    expect(homeChromeForState("RETURNING_ACTIVE").layout).toBe("welcome-scene");
    expect(homeChromeForState("QUIET_PRESENCE").conversationInput).toBe(true);
  });

  it("resolves RETURNING_ACTIVE from continue threads", () => {
    expect(
      resolveCompanionHomeState({
        visitorKind: "returning",
        continue: {
          mode: "single",
          option: {
            id: "x",
            kind: "conversation",
            title: "Test",
            subtitle: "",
            priority: 1,
            lastTouchedAt: "2026-01-01",
          },
        },
      }),
    ).toBe("RETURNING_ACTIVE");
  });
});
