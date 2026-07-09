/**
 * Spark Estate™ — daily companion experience (Phase 24).
 * Personal daily arrival, focus selection, and gentle progress rhythm.
 *
 * @see docs/protocols/SPARK_ESTATE_DAILY_COMPANION_EXPERIENCE_SPECIFICATION_PHASE24.md
 */

import type { AppSection } from "@/lib/companionUi";
import { getEstateMemory } from "@/lib/estateMemory/estateMemoryStore";
import { getSavedGrowthWins } from "@/lib/growthWinsStore";
import {
  getChamberMemorySnapshot,
  recordChamberPatternObservation,
  type ChamberMemorySnapshot,
} from "./chamberOfMomentumMemory";
import {
  selectSparkEstateCards,
  type SparkEstateCardCandidate,
  type SparkEstateCardKind,
} from "./sparkEstateCardEcosystem";
import {
  mergeSparkEstateOnboardingIntoDailyArrival,
  recordSparkEstateOnboardingVisit,
} from "./sparkEstateOnboardingAndFirst7DaysExperience";
import {
  buildSparkEstatePersonalizationContext,
  formatSparkEstatePersonalizedGreeting,
  getSparkEstateMemberProfile,
  observeSparkEstateEnergyFromText,
} from "./sparkEstateMemberProfileEngine";
import {
  resolveSparkEstateIntelligenceRoute,
  type SparkEstateIntelligenceRoute,
} from "./sparkEstateIntelligenceRoutingMap";

export const SPARK_ESTATE_DAILY_SESSION_KEY = "spark-estate-daily-session-v1";

export const SPARK_ESTATE_DAILY_SUCCESS_TEST =
  "Spark knows where I am. I know what to do next. I made progress today.";

export const SPARK_ESTATE_DAILY_FOCUS_QUESTION =
  "What would help you most today?";

export const SPARK_ESTATE_DAILY_COMPLETION_QUESTION =
  "What would you like to do next?";

export const SPARK_ESTATE_DAILY_COMPLETION_OPTIONS = [
  "save progress",
  "continue",
  "create next step",
  "review",
  "finish",
] as const;

export type SparkEstateDailyFocusChoice =
  | "clear-mind"
  | "work-important"
  | "continue"
  | "learn"
  | "create"
  | "decide"
  | "explore";

export type SparkEstateDailyArrivalKind =
  | "new-activity"
  | "returning-away"
  | "daily-check-in";

export type SparkEstateDailyFocusOption = {
  id: SparkEstateDailyFocusChoice;
  label: string;
  description: string;
};

export type SparkEstateDailyArrival = {
  kind: SparkEstateDailyArrivalKind;
  welcomeLine: string;
  focusQuestion: string;
  focusOptions: SparkEstateDailyFocusOption[];
  continuityLine: string | null;
  checkInQuestion: string | null;
  suggestedCards: SparkEstateCardKind[];
  avoidOverload: boolean;
};

export type SparkEstateDailyFocusPlan = {
  choice: SparkEstateDailyFocusChoice;
  label: string;
  goal: string;
  intelligence: string;
  section: AppSection | null;
  route: SparkEstateIntelligenceRoute | null;
  cards: SparkEstateCardCandidate[];
};

export type SparkEstateDailySession = {
  lastVisitAt: string;
  lastFocusChoice?: SparkEstateDailyFocusChoice;
  lastProjectName?: string;
  lastWelcomeLine?: string;
  visitCount: number;
};

const FOCUS_OPTIONS: SparkEstateDailyFocusOption[] = [
  {
    id: "clear-mind",
    label: "Clear my mind",
    description: "Reduce mental clutter with brain capture and organization.",
  },
  {
    id: "work-important",
    label: "Work on something important",
    description: "Move an active project forward with a clear next action.",
  },
  {
    id: "continue",
    label: "Continue where I left off",
    description: "Pick up previous work without restarting from scratch.",
  },
  {
    id: "learn",
    label: "Learn something",
    description: "Build capability with knowledge support.",
  },
  {
    id: "create",
    label: "Create something",
    description: "Start or continue the universal creation journey.",
  },
  {
    id: "decide",
    label: "Make a decision",
    description: "Get clarity between options.",
  },
  {
    id: "explore",
    label: "Just explore",
    description: "A gentle spark of curiosity — no pressure.",
  },
];

const FOCUS_GOALS: Record<SparkEstateDailyFocusChoice, string> = {
  "clear-mind": "Reduce mental clutter.",
  "work-important": "Move something forward.",
  continue: "Reduce restarting.",
  learn: "Build capability.",
  create: "Produce meaningful work.",
  decide: "Create clarity.",
  explore: "Discover without overwhelm.",
};

const FOCUS_INTELLIGENCE: Record<SparkEstateDailyFocusChoice, string> = {
  "clear-mind": "Clear My Mind",
  "work-important": "Momentum Builder™",
  continue: "Continue previous work",
  learn: "Momentum Institute™",
  create: "Universal Creation Journey",
  decide: "Decision Intelligence",
  explore: "Spark discovery",
};

const FOCUS_SECTION: Record<SparkEstateDailyFocusChoice, AppSection | null> = {
  "clear-mind": "brain-dump",
  "work-important": "momentum-builder",
  continue: "chamber-of-momentum",
  learn: "momentum-institute",
  create: "content-generator",
  decide: "decision-compass",
  explore: null,
};

const FOCUS_TEXT_RE: Array<[SparkEstateDailyFocusChoice, RegExp]> = [
  ["clear-mind", /\b(?:clear my mind|brain dump|too much in my head)\b/i],
  [
    "work-important",
    /\b(?:work on something important|important project|move (?:something|this) forward)\b/i,
  ],
  ["continue", /\b(?:continue where|pick up where|left off|keep going)\b/i],
  ["learn", /\b(?:learn something|teach me|want to learn)\b/i],
  ["create", /\b(?:create something|help me (?:write|create|build))\b/i],
  ["decide", /\b(?:make a decision|choose between|what should i do)\b/i],
  ["explore", /\b(?:just explore|look around|wander)\b/i],
];

const AWAY_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 3;

function readDailySession(): SparkEstateDailySession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SPARK_ESTATE_DAILY_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SparkEstateDailySession;
  } catch {
    return null;
  }
}

function writeDailySession(session: SparkEstateDailySession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SPARK_ESTATE_DAILY_SESSION_KEY, JSON.stringify(session));
  } catch {
    /* quota */
  }
}

function activeProjectName(snapshot: ChamberMemorySnapshot): string | null {
  const focus = snapshot.projects.find(
    (project) =>
      project.status !== "complete" &&
      project.status !== "archived" &&
      project.nextAction.trim().length > 0,
  );
  return focus?.name ?? null;
}

function inferArrivalKind(
  session: SparkEstateDailySession | null,
  snapshot: ChamberMemorySnapshot,
): SparkEstateDailyArrivalKind {
  const now = Date.now();
  const lastVisit = session?.lastVisitAt ? Date.parse(session.lastVisitAt) : 0;
  const away = lastVisit > 0 && now - lastVisit > AWAY_THRESHOLD_MS;
  const hasRecentProgress =
    snapshot.recentMomentum.length > 0 ||
    getSavedGrowthWins().length > 0 ||
    snapshot.projects.some((project) => project.status === "complete");

  if (away) return "returning-away";
  if (hasRecentProgress || activeProjectName(snapshot)) return "new-activity";
  return "daily-check-in";
}

export function parseSparkEstateDailyFocusChoice(
  text: string,
): SparkEstateDailyFocusChoice | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  for (const [choice, pattern] of FOCUS_TEXT_RE) {
    if (pattern.test(trimmed)) return choice;
  }
  const normalized = trimmed.toLowerCase();
  const option = FOCUS_OPTIONS.find(
    (entry) =>
      entry.label.toLowerCase() === normalized ||
      entry.id.replace(/-/g, " ") === normalized,
  );
  return option?.id ?? null;
}

export function buildSparkEstateDailyArrival(input?: {
  snapshot?: ChamberMemorySnapshot;
  now?: Date;
}): SparkEstateDailyArrival {
  const snapshot = input?.snapshot ?? getChamberMemorySnapshot();
  const session = readDailySession();
  const kind = inferArrivalKind(session, snapshot);
  const personalization = buildSparkEstatePersonalizationContext({ snapshot });
  const projectName = activeProjectName(snapshot);
  const continuityLine =
    personalization.continuityLine ??
    (projectName ? `We were working on ${projectName}.` : null);

  let welcomeLine: string;
  switch (kind) {
    case "new-activity":
      welcomeLine = projectName
        ? `Welcome back. You made progress on your ${projectName} project last time. Would you like to continue?`
        : formatSparkEstatePersonalizedGreeting(personalization);
      break;
    case "returning-away":
      welcomeLine =
        "Welcome back. You do not need to catch up. Let's see what would help today.";
      break;
    case "daily-check-in":
    default:
      welcomeLine = personalization.preferredName
        ? `How are you feeling today, ${personalization.preferredName}?`
        : "How are you feeling today?";
      break;
  }

  const cardCandidates = selectSparkEstateCards({ snapshot, section: "companion" });
  const suggestedCards = cardCandidates
    .slice(0, 2)
    .map((entry) => entry.kind)
    .filter(
      (kind, index, list) =>
        list.indexOf(kind) === index &&
        (kind === "spark-card" ||
          kind === "momentum-card" ||
          kind === "win-card"),
    )
    .slice(0, 1);

  return mergeSparkEstateOnboardingIntoDailyArrival({
    kind,
    welcomeLine,
    focusQuestion: SPARK_ESTATE_DAILY_FOCUS_QUESTION,
    focusOptions: FOCUS_OPTIONS,
    continuityLine,
    checkInQuestion: kind === "daily-check-in" ? "How are you feeling today?" : null,
    suggestedCards,
    avoidOverload: true,
  }, { now: input?.now });
}

export function formatSparkEstateReturnToWorkLine(
  snapshot: ChamberMemorySnapshot = getChamberMemorySnapshot(),
): string | null {
  const projectName = activeProjectName(snapshot);
  if (projectName) {
    return `We were working on ${projectName}. Would you like to continue?`;
  }
  const estateTask = getEstateMemory().momentumState.lastAction;
  if (estateTask?.trim()) {
    return `We were working on ${estateTask}.`;
  }
  return null;
}

const FOCUS_ROUTE_TEXT: Record<SparkEstateDailyFocusChoice, string> = {
  "clear-mind": "I have too much in my head",
  "work-important": "I need help getting started on something important",
  continue: "Continue where I left off",
  learn: "Teach me something useful",
  create: "Help me create something",
  decide: "I have two choices",
  explore: "I want to explore",
};

export function resolveSparkEstateDailyFocusPlan(input: {
  choice: SparkEstateDailyFocusChoice;
  text?: string;
  snapshot?: ChamberMemorySnapshot;
}): SparkEstateDailyFocusPlan {
  const snapshot = input.snapshot ?? getChamberMemorySnapshot();
  const option =
    FOCUS_OPTIONS.find((entry) => entry.id === input.choice) ?? FOCUS_OPTIONS[0];
  const routeText =
    input.text?.trim() ||
    (input.choice === "continue"
      ? formatSparkEstateReturnToWorkLine(snapshot) ?? FOCUS_ROUTE_TEXT.continue
      : FOCUS_ROUTE_TEXT[input.choice]);
  if (input.text) observeSparkEstateEnergyFromText(input.text);

  const route = resolveSparkEstateIntelligenceRoute({
    text: routeText,
    snapshot,
    currentSection: FOCUS_SECTION[input.choice] ?? undefined,
  });

  const cards = selectSparkEstateCards({
    text: routeText,
    snapshot,
    section: FOCUS_SECTION[input.choice] ?? "companion",
  }).slice(0, 1);

  return {
    choice: input.choice,
    label: option.label,
    goal: FOCUS_GOALS[input.choice],
    intelligence: route?.intelligence ?? FOCUS_INTELLIGENCE[input.choice],
    section: FOCUS_SECTION[input.choice],
    route,
    cards,
  };
}

export function formatSparkEstateDailyCompletionPrompt(): string {
  return `${SPARK_ESTATE_DAILY_COMPLETION_QUESTION}\n\n${SPARK_ESTATE_DAILY_COMPLETION_OPTIONS.map((option) => `• ${option}`).join("\n")}`;
}

export function recordSparkEstateDailySessionUpdate(input?: {
  focusChoice?: SparkEstateDailyFocusChoice;
  projectName?: string;
  welcomeLine?: string;
  energyText?: string;
}): SparkEstateDailySession {
  const previous = readDailySession();
  const snapshot = getChamberMemorySnapshot();
  const session: SparkEstateDailySession = {
    lastVisitAt: new Date().toISOString(),
    lastFocusChoice: input?.focusChoice ?? previous?.lastFocusChoice,
    lastProjectName:
      input?.projectName ?? activeProjectName(snapshot) ?? previous?.lastProjectName,
    lastWelcomeLine: input?.welcomeLine ?? previous?.lastWelcomeLine,
    visitCount: (previous?.visitCount ?? 0) + 1,
  };
  writeDailySession(session);

  recordSparkEstateOnboardingVisit({
    firstWin:
      input?.focusChoice === "work-important" ||
      input?.focusChoice === "clear-mind" ||
      input?.focusChoice === "create",
  });

  if (input?.energyText) observeSparkEstateEnergyFromText(input.energyText);
  if (input?.focusChoice === "work-important" || input?.focusChoice === "continue") {
    recordChamberPatternObservation("small-first-step", "daily companion focus");
  }

  return session;
}

export function buildSparkEstateDailyCompanionReply(input: {
  choice?: SparkEstateDailyFocusChoice;
  text?: string;
}): string {
  const arrival = buildSparkEstateDailyArrival();
  if (!input.choice && !input.text?.trim()) {
    return [arrival.welcomeLine, "", arrival.focusQuestion].join("\n");
  }

  const choice =
    input.choice ??
    parseSparkEstateDailyFocusChoice(input.text ?? "") ??
    "work-important";
  const plan = resolveSparkEstateDailyFocusPlan({
    choice,
    text: input.text,
  });
  recordSparkEstateDailySessionUpdate({
    focusChoice: choice,
    projectName: activeProjectName(getChamberMemorySnapshot()) ?? undefined,
    welcomeLine: arrival.welcomeLine,
    energyText: input.text,
  });

  const lines = [
    arrival.continuityLine ?? arrival.welcomeLine,
    `${plan.label} — ${plan.goal}`,
    plan.route?.memberQuestion
      ? plan.route.memberQuestion
      : `Let's use ${plan.intelligence} for this.`,
  ];
  return lines.join("\n\n");
}

export function sparkEstateDailyCompanionHint(): string {
  return (
    "SPARK ESTATE DAILY COMPANION: Answer how Spark can help today — " +
    "personal welcome, one focus question, one helpful card, no overload."
  );
}

export function verifySparkEstateDailyCompanionExperience(): {
  focusOptions: number;
  arrivalReady: boolean;
  routingReady: boolean;
  completionReady: boolean;
} {
  const arrival = buildSparkEstateDailyArrival();
  const clearMind = resolveSparkEstateDailyFocusPlan({ choice: "clear-mind" });
  const learn = resolveSparkEstateDailyFocusPlan({
    choice: "learn",
    text: "Teach me pricing",
  });
  const completion = formatSparkEstateDailyCompletionPrompt();

  return {
    focusOptions: FOCUS_OPTIONS.length,
    arrivalReady:
      arrival.focusQuestion === SPARK_ESTATE_DAILY_FOCUS_QUESTION &&
      arrival.focusOptions.length === 7 &&
      arrival.avoidOverload === true,
    routingReady:
      clearMind.section === "brain-dump" &&
      /institute|learn/i.test(learn.intelligence),
    completionReady: completion.includes("save progress"),
  };
}
