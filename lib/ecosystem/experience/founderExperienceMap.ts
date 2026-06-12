// Founder Ecosystem — Phase 19 Founder Experience Map (composer).
// Maps the full journey: first login → daily use → long-term adoption.

import type { FounderEvent } from "../events";
import type { ID } from "../models";
import { buildCompanionProfile } from "../companion/companionProfile";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import { currentDailyFlow, buildDailyJourney } from "./dailyJourney";
import { detectDelightMoments } from "./delightMoments";
import { detectEmotionalState, getEmotionalGuidance } from "./emotionalStateMap";
import { buildFirstRunExperience } from "./firstRunExperience";
import { buildOnboardingJourney, isOnboardingComplete } from "./onboardingJourney";
import type {
  OnboardingCapture,
  ExperienceFeatureLink,
  ExperiencePhase,
  FirstMonthSignals,
  FirstWeekMilestones,
  FounderExperienceMap,
  NinetyDaySignals,
} from "./experienceTypes";
import { buildWeeklyReview } from "./weeklyJourney";

const DAY = 86_400_000;

export function detectExperiencePhase(
  events: FounderEvent[],
  founderId: ID,
  onboarding?: OnboardingCapture | null,
  now: Date = new Date(),
): ExperiencePhase {
  const mine = events.filter((e) => e.founderId === founderId);
  if (mine.length === 0 && !isOnboardingComplete(onboarding ?? { businessStage: "idea", businessType: "other", currentGoals: [], biggestChallenges: [], currentProjects: [], preferredWorkStyle: "unknown" })) {
    return "first-day";
  }

  const firstTs = mine.length
    ? Math.min(...mine.map((e) => new Date(e.ts).getTime()))
    : now.getTime();
  const days = Math.floor((now.getTime() - firstTs) / DAY);

  if (days < 1) return "first-day";
  if (days < 7) return "first-week";
  if (days < 30) return "first-month";
  if (days < 90) return "ninety-day";
  return "established";
}

export function assessFirstWeek(events: FounderEvent[], founderId: ID): FirstWeekMilestones {
  const mine = events.filter((e) => e.founderId === founderId);
  const firstProject = mine.some((e) => e.type === "project.created");
  const firstTimeBlock = mine.some((e) => e.type === "timeblock.created");
  const firstFocusSession = mine.some((e) => e.type === "focus.completed");
  const firstDocument = mine.some((e) => e.type === "document.created");
  const firstWin =
    mine.some((e) => e.type === "task.completed") ||
    mine.some((e) => e.type === "action.completed");

  const completed = [firstProject, firstTimeBlock, firstFocusSession, firstDocument, firstWin].filter(
    Boolean,
  ).length;

  return {
    firstProject,
    firstTimeBlock,
    firstFocusSession,
    firstDocument,
    firstWin,
    completedCount: completed,
    successTest: "This is helping me move forward.",
    passesSuccessTest: completed >= 2,
  };
}

export function assessFirstMonth(events: FounderEvent[], founderId: ID): FirstMonthSignals {
  const mine = events.filter((e) => e.founderId === founderId);
  const profile = buildCompanionProfile(mine, founderId, { includePatterns: true });
  const remembersContext = profile.relationshipMemory.frequentProjects.length > 0;
  const connectsProjects =
    mine.some((e) => e.refs?.projectId && e.type === "task.completed") &&
    mine.filter((e) => e.type === "project.created").length >= 1;
  const makesRecommendations = mine.some((e) => e.type === "action.offered");
  const tracksWins =
    mine.some((e) => e.type === "task.completed" || e.type === "project.completed");

  return {
    remembersContext,
    connectsProjects,
    makesRecommendations,
    tracksWins,
    successTest: "It remembers things I forgot.",
    passesSuccessTest: remembersContext && (connectsProjects || tracksWins),
  };
}

export function assessNinetyDay(events: FounderEvent[], founderId: ID, now: Date = new Date()): NinetyDaySignals {
  const mine = events.filter((e) => e.founderId === founderId);
  const profile = buildCompanionProfile(mine, founderId, { includePatterns: true });
  const intel = getFounderIntelligence(mine, founderId, now.toISOString());
  const hasProjects = mine.some((e) => e.type === "project.created");
  const hasWins = mine.some(
    (e) => e.type === "task.completed" || e.type === "focus.completed",
  );

  return {
    understandsProjects: hasProjects,
    understandsPatterns: intel.patterns.length > 0,
    understandsStrengths: hasWins,
    understandsChallenges:
      (profile.overwhelmPatterns?.triggers.length ?? 0) > 0 || intel.risks.length > 0,
    understandsMomentum: profile.momentumPatterns !== null,
    understandsWorkStyle: profile.workStyles.length > 0,
    successTest: "I don't want to run my business without this.",
    passesSuccessTest:
      hasProjects &&
      profile.workStyles.length > 0 &&
      (profile.momentumPatterns !== null || intel.patterns.length > 0),
  };
}

export const EXPERIENCE_FEATURE_LINKS: ExperienceFeatureLink[] = [
  {
    feature: "Founder Workspace",
    need: "direction",
    emotion: "oriented",
    outcome: "business-advanced",
  },
  {
    feature: "Morning Briefing",
    need: "clarity",
    emotion: "calm",
    outcome: "habit-formed",
  },
  {
    feature: "Time Block",
    need: "focus",
    emotion: "capable",
    outcome: "habit-formed",
  },
  {
    feature: "Clear My Mind",
    need: "relief",
    emotion: "lighter",
    outcome: "overwhelm-reduced",
  },
  {
    feature: "Founder Memory",
    need: "memory",
    emotion: "seen",
    outcome: "trust-built",
  },
  {
    feature: "Celebrations",
    need: "celebration",
    emotion: "proud",
    outcome: "first-win",
  },
  {
    feature: "Recommendations",
    need: "momentum",
    emotion: "guided",
    outcome: "decision-made",
  },
  {
    feature: "Digital Twin",
    need: "connection",
    emotion: "understood",
    outcome: "trust-built",
  },
];

function phaseHeadline(phase: ExperiencePhase, emotional: string): string {
  switch (phase) {
    case "first-day":
      return "Day 1 — meet your business companion.";
    case "first-week":
      return "First week — build momentum with small wins.";
    case "first-month":
      return "First month — trust through memory and connection.";
    case "ninety-day":
      return "90 days — your companion knows how you work.";
    case "established":
      return `Daily rhythm — ${emotional} energy, one next step.`;
  }
}

export function buildFounderExperienceMap(
  events: FounderEvent[],
  founderId: ID,
  opts: {
    onboarding?: OnboardingCapture | null;
    recentMessage?: string;
    now?: Date;
  } = {},
): FounderExperienceMap {
  const now = opts.now ?? new Date();
  const mine = events.filter((e) => e.founderId === founderId);
  const firstTs = mine.length
    ? Math.min(...mine.map((e) => new Date(e.ts).getTime()))
    : now.getTime();
  const daysInEcosystem = Math.max(0, Math.floor((now.getTime() - firstTs) / DAY));

  const phase = detectExperiencePhase(mine, founderId, opts.onboarding, now);
  const emotionalState = detectEmotionalState(mine, founderId, opts.recentMessage, now);
  const emotionalGuidance = getEmotionalGuidance(emotionalState);
  const onboarding = opts.onboarding
    ? buildOnboardingJourney(opts.onboarding)
    : null;

  return {
    founderId,
    generatedAt: now.toISOString(),
    phase,
    daysInEcosystem,
    firstRun: buildFirstRunExperience(opts.onboarding),
    onboarding,
    firstWeek: assessFirstWeek(mine, founderId),
    firstMonth: assessFirstMonth(mine, founderId),
    ninetyDay: assessNinetyDay(mine, founderId, now),
    daily: buildDailyJourney(mine, founderId, opts.onboarding, now),
    weekly: daysInEcosystem >= 7 ? buildWeeklyReview(mine, founderId, now) : null,
    emotionalState,
    emotionalGuidance,
    delightMoments: detectDelightMoments(mine, founderId, now),
    featureLinks: EXPERIENCE_FEATURE_LINKS,
    headline: phaseHeadline(phase, emotionalState),
  };
}

export function currentExperienceMoment(
  events: FounderEvent[],
  founderId: ID,
  opts: {
    onboarding?: OnboardingCapture | null;
    now?: Date;
  } = {},
) {
  const map = buildFounderExperienceMap(events, founderId, opts);
  return {
    phase: map.phase,
    headline: map.headline,
    dailyFlow: currentDailyFlow(events, founderId, opts.onboarding, opts.now),
    emotionalGuidance: map.emotionalGuidance,
    delight: map.delightMoments[0] ?? null,
  };
}
