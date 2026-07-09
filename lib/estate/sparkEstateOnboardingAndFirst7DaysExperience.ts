/**
 * Spark Estate™ — onboarding and first 7 days experience (Phase 23).
 * Help new members experience value quickly — confidence, connection, momentum.
 *
 * @see docs/protocols/SPARK_ESTATE_ONBOARDING_AND_FIRST_7_DAYS_EXPERIENCE_SPECIFICATION_PHASE23.md
 */

import type { AppSection } from "@/lib/companionUi";
import {
  type SparkEstateDailyArrival,
  type SparkEstateDailyFocusChoice,
  type SparkEstateDailyFocusOption,
  SPARK_ESTATE_DAILY_FOCUS_QUESTION,
} from "./sparkEstateDailyCompanionExperience";
import {
  buildSparkEstatePersonalizationContext,
  formatSparkEstatePersonalizedGreeting,
  getSparkEstateMemberProfile,
  type SparkEstateMemberProfile,
} from "./sparkEstateMemberProfileEngine";

export const SPARK_ESTATE_ONBOARDING_STORAGE_KEY = "spark-estate-onboarding-v1";

export const SPARK_ESTATE_ONBOARDING_PRINCIPLE =
  "Do not teach the entire system first — help the member experience the system.";

export const SPARK_ESTATE_ONBOARDING_SUCCESS_VISION =
  'Transform "I downloaded an app." into "I found a companion that helps me move forward."';

export const SPARK_ESTATE_ONBOARDING_WELCOME =
  "Welcome. I'm here to help you turn ideas into action, organize what matters, and keep moving forward.";

export const SPARK_ESTATE_ONBOARDING_STAGES = [
  {
    id: "welcome",
    title: "Welcome",
    goal: "Create connection.",
    introduces: ["who Spark is", "how Spark helps", "what the member can expect"],
  },
  {
    id: "learn-about-member",
    title: "Learn About the Member",
    goal: "Gather identity, goals, challenges, and preferences naturally.",
    introduces: ["name", "goals", "challenges", "guidance preferences"],
  },
  {
    id: "first-success",
    title: "First Success Moment",
    goal: "Complete something quickly to build trust.",
    introduces: ["capture an idea", "organize thoughts", "create a next step", "save a goal"],
  },
  {
    id: "introduce-estate",
    title: "Introduce the Estate",
    goal: "Introduce spaces gradually — not every room at once.",
    introduces: ["visit different spaces depending on what you are working on"],
  },
  {
    id: "first-spark-card",
    title: "First Spark Card™",
    goal: "Introduce the daily companion.",
    introduces: [
      "Spark Cards are little moments designed to encourage, inspire, or help you notice something useful",
    ],
  },
] as const;

export type SparkEstateOnboardingStageId =
  (typeof SPARK_ESTATE_ONBOARDING_STAGES)[number]["id"];

export const SPARK_ESTATE_FIRST_WEEK_DAYS = [
  {
    day: 1,
    theme: "connection",
    goal: "Understand the member.",
    experiences: ["welcome", "profile basics", "first small win"],
    focusChoices: ["work-important", "clear-mind", "explore"] as const,
    guidance:
      "Let's start simple — one small step is enough for today.",
  },
  {
    day: 2,
    theme: "clarity",
    goal: "Help organize thoughts.",
    experiences: ["idea capture", "priorities", "next step"],
    focusChoices: ["clear-mind", "decide", "work-important"] as const,
    guidance: "When everything feels mixed together, we can sort one piece at a time.",
  },
  {
    day: 3,
    theme: "creation",
    goal: "Help create something.",
    experiences: ["use universal creation journey"],
    focusChoices: ["create", "work-important"] as const,
    guidance: "We'll create something useful together — one question at a time.",
  },
  {
    day: 4,
    theme: "progress",
    goal: "Show movement.",
    experiences: ["Momentum Card", "progress review"],
    focusChoices: ["continue", "work-important"] as const,
    guidance: "Let's notice what already moved forward.",
  },
  {
    day: 5,
    theme: "personalization",
    goal: "Learn preferences.",
    experiences: ["adapt guidance"],
    focusChoices: ["explore", "learn", "work-important"] as const,
    guidance: "I'll adapt to how you like to work — examples, steps, or bigger picture.",
  },
  {
    day: 6,
    theme: "discovery",
    goal: "Show helpful rooms.",
    experiences: ["explore relevant capabilities"],
    focusChoices: ["explore", "learn", "create"] as const,
    guidance:
      "You can visit different spaces depending on what you are working on.",
  },
  {
    day: 7,
    theme: "reflection",
    goal: "Strengthen relationship.",
    experiences: [
      "What has been most helpful so far?",
      "What would make Spark better for you?",
    ],
    focusChoices: ["explore", "continue"] as const,
    guidance: "You've been building momentum this week. Let's reflect on what helped.",
  },
] as const;

export const SPARK_ESTATE_ONBOARDING_RULES = [
  "be welcoming",
  "reduce overwhelm",
  "celebrate progress",
  "guide gently",
  "adapt to the person",
] as const;

export const SPARK_ESTATE_ONBOARDING_AVOID = [
  "feature tours",
  "complicated explanations",
  "forcing setup completion",
  "long questionnaires",
  "overwhelming setup screens",
] as const;

export const SPARK_ESTATE_FIRST_WEEK_SUCCESS_MEASURES = [
  "returns",
  "creates something",
  "experiences progress",
  "understands the value",
  "feels supported",
] as const;

export type SparkEstateOnboardingState = {
  startedAt: string;
  stagesCompleted: SparkEstateOnboardingStageId[];
  firstWinCaptured: boolean;
  estateIntroduced: boolean;
  sparkCardIntroduced: boolean;
  reflectionCompleted: boolean;
  visitDates: string[];
  updatedAt: string;
};

const FOCUS_OPTION_COPY: Record<
  SparkEstateDailyFocusChoice,
  SparkEstateDailyFocusOption
> = {
  "clear-mind": {
    id: "clear-mind",
    label: "Clear my mind",
    description: "Capture and organize what is in your head.",
  },
  "work-important": {
    id: "work-important",
    label: "Take one small step",
    description: "Move something important forward without overwhelm.",
  },
  continue: {
    id: "continue",
    label: "Continue where I left off",
    description: "Pick up previous work without starting over.",
  },
  learn: {
    id: "learn",
    label: "Learn something",
    description: "Build capability with gentle guidance.",
  },
  create: {
    id: "create",
    label: "Create something",
    description: "Use the universal creation journey.",
  },
  decide: {
    id: "decide",
    label: "Get clarity",
    description: "Sort priorities or choose a direction.",
  },
  explore: {
    id: "explore",
    label: "Explore gently",
    description: "Discover without pressure.",
  },
};

const DAY_SECTION_HINTS: Record<number, AppSection | null> = {
  1: "chamber-of-momentum",
  2: "brain-dump",
  3: "content-generator",
  4: "chamber-of-momentum",
  5: "chamber-of-momentum",
  6: "momentum-institute",
  7: null,
};

function emptyOnboardingState(now = new Date()): SparkEstateOnboardingState {
  const iso = now.toISOString();
  return {
    startedAt: iso,
    stagesCompleted: [],
    firstWinCaptured: false,
    estateIntroduced: false,
    sparkCardIntroduced: false,
    reflectionCompleted: false,
    visitDates: [iso.slice(0, 10)],
    updatedAt: iso,
  };
}

function readOnboardingState(): SparkEstateOnboardingState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SPARK_ESTATE_ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SparkEstateOnboardingState;
  } catch {
    return null;
  }
}

function writeOnboardingState(state: SparkEstateOnboardingState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      SPARK_ESTATE_ONBOARDING_STORAGE_KEY,
      JSON.stringify({ ...state, updatedAt: new Date().toISOString() }),
    );
  } catch {
    /* quota */
  }
}

export function getSparkEstateOnboardingState(
  now = new Date(),
): SparkEstateOnboardingState {
  return readOnboardingState() ?? emptyOnboardingState(now);
}

export function resolveSparkEstateOnboardingDay(
  state: SparkEstateOnboardingState = getSparkEstateOnboardingState(),
  now = new Date(),
): number {
  const start = new Date(state.startedAt);
  const diffMs = now.getTime() - start.getTime();
  const day = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(Math.max(day, 1), 7);
}

export function isSparkEstateFirstWeekActive(
  state: SparkEstateOnboardingState = getSparkEstateOnboardingState(),
  now = new Date(),
): boolean {
  return resolveSparkEstateOnboardingDay(state, now) <= 7;
}

export function hasSparkEstateOnboardingStarted(): boolean {
  return readOnboardingState() !== null;
}

export function shouldApplySparkEstateOnboarding(input?: {
  profile?: SparkEstateMemberProfile;
  state?: SparkEstateOnboardingState;
  now?: Date;
  requireStarted?: boolean;
}): boolean {
  const profile = input?.profile ?? getSparkEstateMemberProfile();
  const persisted = readOnboardingState();
  if (input?.requireStarted && !persisted) return false;
  const state =
    input?.state ?? persisted ?? emptyOnboardingState(input?.now ?? new Date());
  return profile.isNewMember && isSparkEstateFirstWeekActive(state, input?.now);
}

export function getSparkEstateFirstWeekDayPlan(day = resolveSparkEstateOnboardingDay()) {
  return (
    SPARK_ESTATE_FIRST_WEEK_DAYS.find((entry) => entry.day === day) ??
    SPARK_ESTATE_FIRST_WEEK_DAYS[0]
  );
}

function onboardingFocusOptions(day: number): SparkEstateDailyFocusOption[] {
  const plan = getSparkEstateFirstWeekDayPlan(day);
  return plan.focusChoices.map((choice) => FOCUS_OPTION_COPY[choice]);
}

function onboardingFocusQuestion(day: number): string {
  if (day === 7) {
    return "What has been most helpful so far?";
  }
  if (day === 1) {
    return "What would you like help with first?";
  }
  return SPARK_ESTATE_DAILY_FOCUS_QUESTION;
}

function onboardingWelcomeLine(
  day: number,
  profile: SparkEstateMemberProfile,
): string {
  const plan = getSparkEstateFirstWeekDayPlan(day);
  const personalization = buildSparkEstatePersonalizationContext({ profile });

  if (day === 1) {
    return profile.isNewMember
      ? SPARK_ESTATE_ONBOARDING_WELCOME
      : formatSparkEstatePersonalizedGreeting(personalization);
  }

  const name = personalization.preferredName ? `, ${personalization.preferredName}` : "";
  return `Day ${day} — ${plan.goal}${name}. ${plan.guidance}`;
}

function inferCompletedStages(state: SparkEstateOnboardingState, day: number): SparkEstateOnboardingStageId[] {
  const completed = new Set(state.stagesCompleted);
  completed.add("welcome");
  if (day >= 1) completed.add("learn-about-member");
  if (state.firstWinCaptured) completed.add("first-success");
  if (state.estateIntroduced || day >= 6) completed.add("introduce-estate");
  if (state.sparkCardIntroduced || day >= 5) completed.add("first-spark-card");
  return [...completed];
}

export function recordSparkEstateOnboardingVisit(input?: {
  firstWin?: boolean;
  estateIntroduced?: boolean;
  sparkCardIntroduced?: boolean;
  reflectionCompleted?: boolean;
  now?: Date;
}): SparkEstateOnboardingState {
  const now = input?.now ?? new Date();
  const previous = getSparkEstateOnboardingState(now);
  const today = now.toISOString().slice(0, 10);
  const visitDates = previous.visitDates.includes(today)
    ? previous.visitDates
    : [...previous.visitDates, today].slice(-7);

  const next: SparkEstateOnboardingState = {
    ...previous,
    firstWinCaptured: previous.firstWinCaptured || Boolean(input?.firstWin),
    estateIntroduced:
      previous.estateIntroduced || Boolean(input?.estateIntroduced),
    sparkCardIntroduced:
      previous.sparkCardIntroduced || Boolean(input?.sparkCardIntroduced),
    reflectionCompleted:
      previous.reflectionCompleted || Boolean(input?.reflectionCompleted),
    visitDates,
    updatedAt: now.toISOString(),
  };
  next.stagesCompleted = inferCompletedStages(
    next,
    resolveSparkEstateOnboardingDay(next, now),
  );

  writeOnboardingState(next);
  return next;
}

export function buildSparkEstateOnboardingArrival(input?: {
  profile?: SparkEstateMemberProfile;
  now?: Date;
  requireStarted?: boolean;
}): SparkEstateDailyArrival | null {
  const now = input?.now ?? new Date();
  const profile = input?.profile ?? getSparkEstateMemberProfile();
  if (
    !shouldApplySparkEstateOnboarding({
      profile,
      now,
      requireStarted: input?.requireStarted,
    })
  ) {
    return null;
  }

  const state = getSparkEstateOnboardingState(now);
  const day = resolveSparkEstateOnboardingDay(state, now);
  const plan = getSparkEstateFirstWeekDayPlan(day);
  const welcomeLine = onboardingWelcomeLine(day, profile);
  const focusOptions = onboardingFocusOptions(day);

  recordSparkEstateOnboardingVisit({
    estateIntroduced: day >= 6,
    sparkCardIntroduced: day >= 5,
    reflectionCompleted: day === 7,
    now,
  });

  return {
    kind: day === 1 ? "daily-check-in" : "new-activity",
    welcomeLine,
    focusQuestion: onboardingFocusQuestion(day),
    focusOptions,
    continuityLine:
      day > 1
        ? `You're on day ${day} of your first week — ${plan.theme}.`
        : null,
    checkInQuestion: day === 1 ? "What would you like help with first?" : null,
    suggestedCards:
      day >= 5 ? ["spark-card"] : day >= 4 ? ["momentum-card"] : [],
    avoidOverload: true,
  };
}

export function mergeSparkEstateOnboardingIntoDailyArrival(
  arrival: SparkEstateDailyArrival,
  input?: { profile?: SparkEstateMemberProfile; now?: Date },
): SparkEstateDailyArrival {
  const onboarding = buildSparkEstateOnboardingArrival({
    ...input,
    requireStarted: true,
  });
  if (!onboarding) return arrival;

  return {
    ...arrival,
    welcomeLine: onboarding.welcomeLine,
    focusQuestion: onboarding.focusQuestion,
    focusOptions: onboarding.focusOptions,
    continuityLine: onboarding.continuityLine ?? arrival.continuityLine,
    checkInQuestion: onboarding.checkInQuestion ?? arrival.checkInQuestion,
    suggestedCards:
      onboarding.suggestedCards.length > 0
        ? onboarding.suggestedCards
        : arrival.suggestedCards,
    avoidOverload: true,
  };
}

export function sparkEstateOnboardingCompanionHint(input?: {
  profile?: SparkEstateMemberProfile;
  now?: Date;
}): string | null {
  const now = input?.now ?? new Date();
  if (!shouldApplySparkEstateOnboarding({ profile: input?.profile, now })) {
    return null;
  }

  const state = getSparkEstateOnboardingState(now);
  const day = resolveSparkEstateOnboardingDay(state, now);
  const plan = getSparkEstateFirstWeekDayPlan(day);
  const section = DAY_SECTION_HINTS[day];

  return (
    `SPARK ESTATE ONBOARDING (day ${day}/7): ${SPARK_ESTATE_ONBOARDING_PRINCIPLE} ` +
    `Focus: ${plan.goal} — ${plan.guidance} ` +
    `Avoid feature tours and questionnaires.${section ? ` Suggested section: ${section}.` : ""}`
  );
}

export function clearSparkEstateOnboardingState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SPARK_ESTATE_ONBOARDING_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function seedSparkEstateOnboardingState(
  state: SparkEstateOnboardingState,
): SparkEstateOnboardingState {
  writeOnboardingState(state);
  return state;
}

export function verifySparkEstateOnboardingAndFirst7Days(): {
  stages: number;
  days: number;
  firstWeekReady: boolean;
  rulesReady: boolean;
  successMeasuresReady: boolean;
  arrivalReady: boolean;
} {
  const newMemberProfile: SparkEstateMemberProfile = {
    ...getSparkEstateMemberProfile(),
    isNewMember: true,
    progressHistory: [],
    frictionPatterns: [],
    successfulStrategies: [],
  };
  const arrival = buildSparkEstateOnboardingArrival({
    now: new Date(),
    profile: newMemberProfile,
  });

  return {
    stages: SPARK_ESTATE_ONBOARDING_STAGES.length,
    days: SPARK_ESTATE_FIRST_WEEK_DAYS.length,
    firstWeekReady:
      SPARK_ESTATE_ONBOARDING_STAGES.length === 5 &&
      SPARK_ESTATE_FIRST_WEEK_DAYS.length === 7,
    rulesReady:
      SPARK_ESTATE_ONBOARDING_RULES.length >= 5 &&
      SPARK_ESTATE_ONBOARDING_AVOID.length >= 4,
    successMeasuresReady: SPARK_ESTATE_FIRST_WEEK_SUCCESS_MEASURES.length === 5,
    arrivalReady:
      Boolean(arrival?.welcomeLine.includes("Welcome")) &&
      (arrival?.focusOptions.length ?? 0) <= 4 &&
      arrival?.avoidOverload === true,
  };
}

export function formatSparkEstateOnboardingReport(
  verification: ReturnType<typeof verifySparkEstateOnboardingAndFirst7Days> = verifySparkEstateOnboardingAndFirst7Days(),
): string {
  const lines: string[] = [
    `Spark Estate™ onboarding: ${verification.firstWeekReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_ONBOARDING_PRINCIPLE,
    SPARK_ESTATE_ONBOARDING_SUCCESS_VISION,
    "",
    "Onboarding stages:",
  ];

  for (const stage of SPARK_ESTATE_ONBOARDING_STAGES) {
    lines.push(`  ${stage.title} — ${stage.goal}`);
  }

  lines.push("", "First week journey:");
  for (const day of SPARK_ESTATE_FIRST_WEEK_DAYS) {
    lines.push(
      `  Day ${day.day}: ${day.theme} — ${day.goal}`,
      `    ${day.experiences.join(" · ")}`,
    );
  }

  lines.push("", "Onboarding rules:");
  for (const rule of SPARK_ESTATE_ONBOARDING_RULES) {
    lines.push(`  • ${rule}`);
  }

  lines.push("", "Success measures:");
  for (const measure of SPARK_ESTATE_FIRST_WEEK_SUCCESS_MEASURES) {
    lines.push(`  ✓ ${measure}`);
  }

  lines.push("", "Integration checks:");
  lines.push(`  Stages: ${verification.stages}`);
  lines.push(`  Days: ${verification.days}`);
  lines.push(`  Arrival: ${verification.arrivalReady ? "pass" : "fail"}`);

  return lines.join("\n");
}
