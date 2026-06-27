import { describe, expect, it } from "vitest";
import { evaluateLivingHome } from "@/lib/livingHome";
import { composeArrivalGreeting } from "./composeArrivalGreeting";

function baseInput(
  overrides: Partial<Parameters<typeof composeArrivalGreeting>[0]> = {},
) {
  return {
    livingHome: evaluateLivingHome({
      now: new Date("2026-06-15T07:30:00"),
      surface: "today",
    }),
    homeState: "QUIET_PRESENCE" as const,
    visitorKind: "returning" as const,
    firstName: "Shari",
    continue: { mode: "empty" as const, prompt: "What would help most right now?" },
    returnDays: null,
    isFirstMeeting: false,
    isFirstVisitOfDay: true,
    previousTopic: null,
    birthdayToday: false,
    ...overrides,
  };
}

describe("arrivalGreetingIntelligence", () => {
  it("uses complete sentences for first visit", () => {
    const greeting = composeArrivalGreeting(
      baseInput({
        isFirstMeeting: true,
        homeState: "FIRST_VISIT",
        visitorKind: "first_onboarding",
      }),
    );
    expect(greeting.headline).toMatch(/\.$/);
    expect(greeting.body).toMatch(/\.$/);
    expect(greeting.headline).not.toMatch(/—/);
  });

  it("matches morning scene without porch-light language", () => {
    const greeting = composeArrivalGreeting(baseInput());
    expect(greeting.headline).toMatch(/Good morning/i);
    expect(greeting.body).toMatch(/morning light/i);
    expect(greeting.body).not.toMatch(/porch light/i);
  });

  it("matches night scene with porch light language", () => {
    const greeting = composeArrivalGreeting(
      baseInput({
        livingHome: evaluateLivingHome({
          now: new Date("2026-06-15T21:30:00"),
          surface: "today",
        }),
      }),
    );
    expect(greeting.headline).toMatch(/Good evening/i);
    expect(greeting.body).toMatch(/porch light/i);
  });

  it("matches rainy weather in body copy", () => {
    const greeting = composeArrivalGreeting(
      baseInput({
        livingHome: evaluateLivingHome({
          now: new Date("2026-06-15T14:00:00"),
          surface: "today",
          weather: "rain",
        }),
      }),
    );
    expect(greeting.body).toMatch(/rainy day/i);
  });

  it("welcomes before memory on returning active threads", () => {
    const greeting = composeArrivalGreeting(
      baseInput({
        homeState: "RETURNING_ACTIVE",
        continue: {
          mode: "single",
          option: {
            id: "x",
            kind: "conversation",
            title: "your SOP",
          },
        },
      }),
    );
    expect(greeting.headline).toMatch(/Good morning|Welcome back/i);
    expect(greeting.body).toMatch(/good to see you again/i);
    expect(greeting.body).toMatch(/your SOP/i);
    expect(greeting.headline).not.toMatch(/SOP/i);
  });

  it("never uses internal fragment headlines", () => {
    const greeting = composeArrivalGreeting(
      baseInput({
        livingHome: evaluateLivingHome({
          now: new Date("2026-06-15T21:30:00"),
          surface: "today",
        }),
      }),
    );
    expect(greeting.headline).not.toMatch(/^Hi —/i);
    expect(greeting.body).not.toMatch(/^Rain today/i);
  });
});
