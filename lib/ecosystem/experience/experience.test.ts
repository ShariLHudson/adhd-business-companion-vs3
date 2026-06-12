// Founder Ecosystem — Phase 19 Experience Map tests.
// (Spec deliverable "experienceTests.ts"; named *.test.ts so vitest runs it.)

import { describe, expect, it } from "vitest";

import type { FounderEvent, NewEvent } from "../events";
import { ev } from "../events";
import { simulateMasterWorkflow } from "../fixtures/masterWorkflow";
import { detectDelightMoments } from "./delightMoments";
import { buildMorningFlow, currentDailyFlow } from "./dailyJourney";
import {
  detectEmotionalState,
  getEmotionalGuidance,
  workspaceForEmotionalState,
} from "./emotionalStateMap";
import {
  assessFirstMonth,
  assessFirstWeek,
  assessNinetyDay,
  buildFounderExperienceMap,
  detectExperiencePhase,
  EXPERIENCE_FEATURE_LINKS,
} from "./founderExperienceMap";
import { buildFirstRunExperience } from "./firstRunExperience";
import { buildOnboardingJourney, isOnboardingComplete, mergeOnboardingCapture } from "./onboardingJourney";
import { buildWeeklyReview } from "./weeklyJourney";

const FOUNDER = "founder-001";
const NOW = new Date("2026-06-09T12:00:00.000Z");

const onboarding = mergeOnboardingCapture(
  {
    businessStage: "building",
    businessType: "coaching",
    currentGoals: ["Launch group program"],
    biggestChallenges: ["Too many priorities"],
    currentProjects: ["Workshop Launch"],
    preferredWorkStyle: "creator",
  },
  { businessName: "Spark Studio" },
);

let seq = 0;
function asEvent(ne: NewEvent, t: string): FounderEvent {
  seq += 1;
  return { id: `x${seq}`, ts: t, ...ne };
}

describe("Phase 1 — first time experience", () => {
  it("defines what founder sees, feels, and accomplishes on day 1", () => {
    const first = buildFirstRunExperience(onboarding);
    expect(first.see.length).toBeGreaterThan(0);
    expect(first.feel).toContain("Seen — not judged.");
    expect(first.accomplish.some((a) => /win|project|focus/i.test(a))).toBe(true);
    expect(first.successTest).toBe("This understands me.");
  });

  it("onboarding passes 'This understands me' when complete", () => {
    expect(isOnboardingComplete(onboarding)).toBe(true);
    const journey = buildOnboardingJourney(onboarding);
    expect(journey.passesSuccessTest).toBe(true);
    expect(journey.personalizedWelcome).toMatch(/building/i);
    expect(journey.personalizedWelcome).toMatch(/Launch group/i);
  });
});

describe("Phase 2 — first week", () => {
  it("tracks first-week milestones and momentum success test", () => {
    const events = simulateMasterWorkflow(FOUNDER, NOW);
    const week = assessFirstWeek(events, FOUNDER);
    expect(week.firstProject).toBe(true);
    expect(week.successTest).toBe("This is helping me move forward.");
    expect(week.passesSuccessTest).toBe(true);
  });
});

describe("Phase 3 — first month", () => {
  it("assesses memory, connection, and trust signals", () => {
    const events = simulateMasterWorkflow(FOUNDER, NOW);
    const month = assessFirstMonth(events, FOUNDER);
    expect(month.successTest).toBe("It remembers things I forgot.");
    expect(month.remembersContext || month.tracksWins).toBe(true);
  });
});

describe("Phase 4 — 90 day", () => {
  it("assesses twin depth for indispensable companion", () => {
    const events = simulateMasterWorkflow(FOUNDER, NOW);
    const ninety = assessNinetyDay(events, FOUNDER, NOW);
    expect(ninety.successTest).toBe("I don't want to run my business without this.");
    expect(ninety.understandsWorkStyle).toBe(true);
  });
});

describe("daily experience map", () => {
  it("builds morning flow with focus, project, decisions, next step", () => {
    const events = simulateMasterWorkflow(FOUNDER, NOW);
    const morning = buildMorningFlow(events, FOUNDER, onboarding, NOW);
    expect(morning.steps.some((s) => /Good morning/i.test(s.label))).toBe(true);
    expect(morning.steps.some((s) => /focus/i.test(s.label))).toBe(true);
    expect(morning.steps.some((s) => /next step/i.test(s.label))).toBe(true);
  });

  it("returns current flow by time of day", () => {
    const events = simulateMasterWorkflow(FOUNDER, NOW);
    const flow = currentDailyFlow(events, FOUNDER, onboarding, NOW);
    expect(flow.period).toBe("midday");
  });
});

describe("weekly review", () => {
  it("summarizes projects, wins, challenges, patterns", () => {
    const events = simulateMasterWorkflow(FOUNDER, NOW);
    const review = buildWeeklyReview(events, FOUNDER, NOW);
    expect(review.summary.length).toBeGreaterThan(0);
    expect(Array.isArray(review.wins)).toBe(true);
    expect(Array.isArray(review.patterns)).toBe(true);
  });
});

describe("emotional state map", () => {
  it("detects overwhelmed state and returns guidance", () => {
    const events = [
      asEvent(ev.chatCoaching(FOUNDER, "I am so overwhelmed with too much to do"), NOW.toISOString()),
    ];
    const state = detectEmotionalState(events, FOUNDER, "overwhelmed", NOW);
    expect(state).toBe("overwhelmed");
    const guidance = getEmotionalGuidance(state);
    expect(guidance.shariShould.length).toBeGreaterThan(0);
    expect(guidance.shariShouldAvoid.length).toBeGreaterThan(0);
    expect(guidance.workspace).toBe(workspaceForEmotionalState("overwhelmed"));
    expect(guidance.recommendation.length).toBeGreaterThan(0);
  });

  it("covers all emotional states with workspace + recommendation", () => {
    const states = [
      "overwhelmed",
      "stuck",
      "motivated",
      "distracted",
      "excited",
      "burned-out",
    ] as const;
    for (const s of states) {
      const g = getEmotionalGuidance(s);
      expect(g.workspace).toBeTruthy();
      expect(g.recommendation).toBeTruthy();
    }
  });
});

describe("delight moments", () => {
  it("detects trust, relief, and momentum moments", () => {
    const events = simulateMasterWorkflow(FOUNDER, NOW);
    const delights = detectDelightMoments(events, FOUNDER, NOW);
    expect(delights.length).toBeGreaterThan(0);
    expect(delights.some((d) => ["trust", "relief", "momentum", "confidence", "wow"].includes(d.kind))).toBe(
      true,
    );
  });
});

describe("founder experience map composer", () => {
  it("maps every feature to need, emotion, and outcome", () => {
    expect(EXPERIENCE_FEATURE_LINKS.length).toBeGreaterThanOrEqual(6);
    for (const link of EXPERIENCE_FEATURE_LINKS) {
      expect(link.feature).toBeTruthy();
      expect(link.need).toBeTruthy();
      expect(link.emotion).toBeTruthy();
      expect(link.outcome).toBeTruthy();
    }
  });

  it("composes full experience map", () => {
    const events = simulateMasterWorkflow(FOUNDER, NOW);
    const map = buildFounderExperienceMap(events, FOUNDER, { onboarding, now: NOW });
    expect(map.phase).toBeTruthy();
    expect(map.daily.length).toBe(4);
    expect(map.featureLinks.length).toBeGreaterThan(0);
    expect(map.headline.length).toBeGreaterThan(0);
  });

  it("detects phase from ecosystem age", () => {
    expect(detectExperiencePhase([], FOUNDER, null, NOW)).toBe("first-day");
    const events = simulateMasterWorkflow(FOUNDER, NOW);
    expect(detectExperiencePhase(events, FOUNDER, onboarding, NOW)).toBe("first-day");
  });
});
