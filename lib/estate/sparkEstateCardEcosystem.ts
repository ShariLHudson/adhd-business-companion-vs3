/**
 * Spark Estate™ — card ecosystem (Phase 16).
 * Intelligent touchpoints: the right card at the right time, without clutter.
 *
 * @see docs/protocols/SPARK_ESTATE_CARD_ECOSYSTEM_SPECIFICATION_PHASE16.md
 */

import type { AppSection } from "@/lib/companionUi";
import { getSavedGrowthWins } from "@/lib/growthWinsStore";
import { resolveFallbackSparkCard } from "@/lib/sparkNote/runtimeIntegration";
import type { SparkNoteDailyCard } from "@/lib/sparkNote/types";
import {
  detectChamberEnergyLevel,
  type ChamberEnergyLevel,
} from "./chamberOfMomentumIntelligence";
import {
  getChamberMemorySnapshot,
  getTopChamberBlockerCategories,
  type ChamberMemorySnapshot,
} from "./chamberOfMomentumMemory";
import {
  buildChamberMomentumCard,
  CHAMBER_COMPLETION_REFLECTION_QUESTIONS,
  hasChamberMomentumCard,
  type ChamberMomentumCard,
} from "./chamber/chamberMemberJourney";
import {
  selectSparkEstateKnowledgeForCard,
} from "./sparkEstateKnowledgeAndAssetLibraryArchitecture";
import {
  buildSparkEstatePersonalizationContext,
  getSparkEstateMemberProfile,
  type SparkEstateMemberProfile,
} from "./sparkEstateMemberProfileEngine";

export const SPARK_ESTATE_CARD_MEMORY_KEY = "spark-estate-card-memory-v1";

export const SPARK_ESTATE_CARD_SUCCESS_TEST =
  "A helpful note from Spark.";

export const SPARK_ESTATE_CARD_PRIORITY_ORDER = [
  "personal-moment",
  "immediate-support",
  "active-progress",
  "encouragement",
  "learning",
  "discovery",
] as const;

export type SparkEstateCardKind =
  | "spark-card"
  | "momentum-card"
  | "project-card"
  | "knowledge-card"
  | "reflection-card"
  | "win-card";

export type SparkEstateCardLifecycle =
  | "created"
  | "displayed"
  | "interacted"
  | "saved"
  | "completed"
  | "dismissed";

export type SparkEstateCardAction =
  | "open"
  | "save"
  | "reflect"
  | "continue"
  | "connect"
  | "complete";

export type SparkEstateCardPlacement =
  | "estate"
  | "chamber-of-momentum"
  | "learning"
  | "evidence"
  | "companion";

export type SparkEstateSparkCard = {
  kind: "spark-card";
  title: string;
  teaser: string;
  purpose: string;
  spark: SparkNoteDailyCard;
  actions: SparkEstateCardAction[];
};

export type SparkEstateMomentumCardPayload = {
  kind: "momentum-card";
  headline: string;
  purpose: string;
  momentum: ChamberMomentumCard;
  actions: SparkEstateCardAction[];
};

export type SparkEstateProjectCard = {
  kind: "project-card";
  projectName: string;
  status: string;
  nextAction: string;
  progress: string | null;
  purpose: string;
  actions: SparkEstateCardAction[];
};

export type SparkEstateKnowledgeCard = {
  kind: "knowledge-card";
  concept: string;
  explanation: string;
  example: string;
  application: string;
  purpose: string;
  actions: SparkEstateCardAction[];
};

export type SparkEstateReflectionCard = {
  kind: "reflection-card";
  prompt: string;
  questions: readonly string[];
  purpose: string;
  actions: SparkEstateCardAction[];
};

export type SparkEstateWinCard = {
  kind: "win-card";
  accomplishment: string;
  milestone: string | null;
  evidenceLink: string;
  purpose: string;
  actions: SparkEstateCardAction[];
};

export type SparkEstateCardPayload =
  | SparkEstateSparkCard
  | SparkEstateMomentumCardPayload
  | SparkEstateProjectCard
  | SparkEstateKnowledgeCard
  | SparkEstateReflectionCard
  | SparkEstateWinCard;

export type SparkEstateCardCandidate = {
  kind: SparkEstateCardKind;
  priority: (typeof SPARK_ESTATE_CARD_PRIORITY_ORDER)[number];
  score: number;
  placement: SparkEstateCardPlacement;
  payload: SparkEstateCardPayload;
};

export type SparkEstateCardInteraction = {
  id: string;
  kind: SparkEstateCardKind;
  action: SparkEstateCardAction;
  at: string;
  helpful?: boolean;
};

const LEARN_RE =
  /\b(?:how do i|teach me|i need to (?:understand|learn)|help me learn|want to learn|need information|explain how|learn how)\b/i;

const SKILL_GAP_RE =
  /\b(?:don'?t know how|need to learn how|skill gap|how does this work|how this works)\b/i;

const PERSONAL_MOMENT_RE =
  /\b(?:birthday|anniversary|milestone|meaningful|grateful|today is|celebrate)\b/i;

const REFLECTION_RE =
  /\b(?:what worked|what did you learn|look back|reflect on|review progress)\b/i;

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readCardMemory(): SparkEstateCardInteraction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SPARK_ESTATE_CARD_MEMORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is SparkEstateCardInteraction =>
        Boolean(entry) &&
        typeof (entry as SparkEstateCardInteraction).kind === "string",
    );
  } catch {
    return [];
  }
}

function writeCardMemory(entries: SparkEstateCardInteraction[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      SPARK_ESTATE_CARD_MEMORY_KEY,
      JSON.stringify(entries.slice(0, 80)),
    );
  } catch {
    /* quota */
  }
}

function cardAffinity(kind: SparkEstateCardKind): number {
  const memory = readCardMemory();
  const opens = memory.filter(
    (entry) => entry.kind === kind && entry.action === "open",
  ).length;
  const ignores = memory.filter(
    (entry) => entry.kind === kind && entry.action === "complete",
  ).length;
  return opens * 2 - ignores;
}

function activeFocusProject(snapshot: ChamberMemorySnapshot) {
  return snapshot.projects.find(
    (project) =>
      project.status !== "complete" &&
      project.status !== "archived" &&
      project.nextAction.trim().length > 0,
  );
}

export function buildSparkEstateSparkCard(
  spark: SparkNoteDailyCard = resolveFallbackSparkCard(),
): SparkEstateSparkCard {
  return {
    kind: "spark-card",
    title: spark.shortTitle ?? spark.title,
    teaser: spark.teaser,
    purpose: "Daily companion moment — curiosity, inspiration, and meaning.",
    spark,
    actions: ["open", "save", "reflect"],
  };
}

export function buildSparkEstateMomentumCard(
  snapshot: ChamberMemorySnapshot = getChamberMemorySnapshot(),
): SparkEstateMomentumCardPayload | null {
  const momentum = buildChamberMomentumCard(snapshot);
  if (!momentum) return null;

  const headline =
    momentum.activeProjectName && momentum.nextStep
      ? `Your next step for ${momentum.activeProjectName} is ${momentum.nextStep.charAt(0).toLowerCase()}${momentum.nextStep.slice(1)}.`
      : momentum.recommendedAction;

  return {
    kind: "momentum-card",
    headline,
    purpose: "Help you move forward with focus, next action, and encouragement.",
    momentum,
    actions: ["continue", "open", "connect"],
  };
}

export function buildSparkEstateProjectCard(
  snapshot: ChamberMemorySnapshot = getChamberMemorySnapshot(),
): SparkEstateProjectCard | null {
  const project = activeFocusProject(snapshot);
  if (!project) return null;

  const activeCount = snapshot.projects.filter(
    (entry) => entry.status !== "complete" && entry.status !== "archived",
  ).length;
  const completedCount = snapshot.projects.filter(
    (entry) => entry.status === "complete",
  ).length;

  return {
    kind: "project-card",
    projectName: project.name,
    status: project.status,
    nextAction: project.nextAction,
    progress:
      activeCount > 0 || completedCount > 0
        ? `${activeCount} active · ${completedCount} complete`
        : null,
    purpose: "Keep important work visible with status and next action.",
    actions: ["open", "continue", "complete"],
  };
}

export function buildSparkEstateKnowledgeCard(input?: {
  topic?: string;
  text?: string;
  section?: AppSection;
}): SparkEstateKnowledgeCard {
  const knowledge = selectSparkEstateKnowledgeForCard({
    topic: input?.topic,
    text: input?.text,
    section: input?.section,
  });
  const topic = input?.topic?.trim() || knowledge?.name || "your next skill";
  return {
    kind: "knowledge-card",
    concept: topic,
    explanation:
      knowledge?.purpose ??
      `Let's understand ${topic} in plain language — one idea at a time.`,
    example:
      knowledge?.examples ??
      "Here is a simple example you can adapt to your situation.",
    application:
      knowledge?.howToUse ??
      "What part of this would help your work right now?",
    purpose: "Deliver learning with concept, explanation, example, and application.",
    actions: ["open", "save", "continue"],
  };
}

export function buildSparkEstateReflectionCard(): SparkEstateReflectionCard {
  return {
    kind: "reflection-card",
    prompt: "Pause and capture what this moment taught you.",
    questions: CHAMBER_COMPLETION_REFLECTION_QUESTIONS,
    purpose: "Help you pause, learn, and remember what worked.",
    actions: ["reflect", "save", "connect"],
  };
}

export function buildSparkEstateWinCard(
  win = getSavedGrowthWins()[0],
): SparkEstateWinCard | null {
  if (!win) return null;
  return {
    kind: "win-card",
    accomplishment: win.whatHappened,
    milestone: win.classification?.label ?? null,
    evidenceLink: "Evidence Bank",
    purpose: "Capture progress and evidence of capability.",
    actions: ["open", "save", "connect"],
  };
}

export function placementForSection(section?: AppSection): SparkEstateCardPlacement {
  switch (section) {
    case "chamber-of-momentum":
    case "momentum-builder":
    case "chamber-project-entry":
      return "chamber-of-momentum";
    case "momentum-institute":
      return "learning";
    case "evidence-bank":
      return "evidence";
    default:
      return "estate";
  }
}

export function cardsForPlacement(
  placement: SparkEstateCardPlacement,
): SparkEstateCardKind[] {
  switch (placement) {
    case "estate":
      return ["spark-card"];
    case "chamber-of-momentum":
      return ["momentum-card", "project-card", "win-card"];
    case "learning":
      return ["knowledge-card"];
    case "evidence":
      return ["win-card", "reflection-card"];
    case "companion":
      return ["spark-card", "momentum-card", "knowledge-card"];
    default:
      return ["spark-card"];
  }
}

function scoreCandidate(
  priority: SparkEstateCardCandidate["priority"],
  kind: SparkEstateCardKind,
  boost = 0,
): number {
  const base = SPARK_ESTATE_CARD_PRIORITY_ORDER.indexOf(priority) * 10;
  return base - cardAffinity(kind) - boost;
}

export function selectSparkEstateCards(input?: {
  text?: string;
  section?: AppSection;
  snapshot?: ChamberMemorySnapshot;
  profile?: SparkEstateMemberProfile;
  energy?: ChamberEnergyLevel;
}): SparkEstateCardCandidate[] {
  const text = input?.text?.trim() ?? "";
  const snapshot = input?.snapshot ?? getChamberMemorySnapshot();
  const profile = input?.profile ?? getSparkEstateMemberProfile({ snapshot });
  const energy = input?.energy ?? (text ? detectChamberEnergyLevel(text) : "normal");
  const personalization = buildSparkEstatePersonalizationContext({
    text,
    snapshot,
    profile,
  });
  const placement = input?.section
    ? placementForSection(input.section)
    : text
      ? "companion"
      : "estate";
  const allowed = new Set(cardsForPlacement(placement));
  const focusProject = activeFocusProject(snapshot);
  if (focusProject) {
    allowed.add("project-card");
    allowed.add("momentum-card");
  }
  const candidates: SparkEstateCardCandidate[] = [];

  const wantsLearning = LEARN_RE.test(text) || SKILL_GAP_RE.test(text);
  const feelsStuck = /\bstuck\b/i.test(text);
  if (wantsLearning) allowed.add("knowledge-card");
  if (feelsStuck || energy === "low") allowed.add("momentum-card");

  const personalMoment =
    PERSONAL_MOMENT_RE.test(text) ||
    profile.goalsVision.importantOutcomes.some((outcome) =>
      /birthday|anniversary|milestone/i.test(outcome),
    );
  if (allowed.has("spark-card") && personalMoment) {
    candidates.push({
      kind: "spark-card",
      priority: "personal-moment",
      score: scoreCandidate("personal-moment", "spark-card", 5),
      placement,
      payload: buildSparkEstateSparkCard(),
    });
  }

  const needsSupport =
    feelsStuck ||
    energy === "low" ||
    getTopChamberBlockerCategories(1).length > 0 ||
    personalization.greetingTone === "low-energy";
  const momentum = buildSparkEstateMomentumCard(snapshot);
  if (allowed.has("momentum-card") && momentum && (needsSupport || hasChamberMomentumCard(snapshot))) {
    candidates.push({
      kind: "momentum-card",
      priority: needsSupport ? "immediate-support" : "active-progress",
      score: scoreCandidate(
        needsSupport ? "immediate-support" : "active-progress",
        "momentum-card",
        needsSupport ? 6 : 1,
      ),
      placement,
      payload: momentum,
    });
  }

  const project = buildSparkEstateProjectCard(snapshot);
  if (allowed.has("project-card") && project) {
    candidates.push({
      kind: "project-card",
      priority: "active-progress",
      score: scoreCandidate("active-progress", "project-card", 2),
      placement,
      payload: project,
    });
  }

  const win = buildSparkEstateWinCard();
  if (
    allowed.has("win-card") &&
    win &&
    (personalization.greetingTone === "celebration" || placement === "evidence")
  ) {
    candidates.push({
      kind: "win-card",
      priority: "encouragement",
      score: scoreCandidate("encouragement", "win-card", 2),
      placement,
      payload: win,
    });
  }

  if (
    allowed.has("knowledge-card") &&
    (wantsLearning || placement === "learning")
  ) {
    const topicMatch = text.match(
      /\b(?:learn|understand|teach me)\s+(?:about\s+)?(.+?)(?:[.?!]|$)/i,
    );
    candidates.push({
      kind: "knowledge-card",
      priority: "learning",
      score: scoreCandidate("learning", "knowledge-card", wantsLearning ? 30 : 1),
      placement,
      payload: buildSparkEstateKnowledgeCard({
        topic: topicMatch?.[1],
        text,
        section: input?.section,
      }),
    });
  }

  if (
    allowed.has("reflection-card") &&
    (REFLECTION_RE.test(text) || placement === "evidence")
  ) {
    candidates.push({
      kind: "reflection-card",
      priority: "encouragement",
      score: scoreCandidate("encouragement", "reflection-card"),
      placement,
      payload: buildSparkEstateReflectionCard(),
    });
  }

  if (allowed.has("spark-card")) {
    const hasHigherPriority = candidates.some(
      (entry) => entry.priority !== "discovery" && entry.priority !== "learning",
    );
    if (
      !hasHigherPriority ||
      /\bcurious|inspire|spark idea|daily spark\b/i.test(text) ||
      placement === "estate"
    ) {
      candidates.push({
        kind: "spark-card",
        priority: hasHigherPriority ? "discovery" : "encouragement",
        score: scoreCandidate(
          hasHigherPriority ? "discovery" : "encouragement",
          "spark-card",
        ),
        placement,
        payload: buildSparkEstateSparkCard(),
      });
    }
  }

  const seen = new Set<SparkEstateCardKind>();
  return candidates
    .sort((a, b) => a.score - b.score)
    .filter((entry) => {
      if (seen.has(entry.kind)) return false;
      seen.add(entry.kind);
      return true;
    });
}

export function selectPrimarySparkEstateCard(input?: {
  text?: string;
  section?: AppSection;
  snapshot?: ChamberMemorySnapshot;
}): SparkEstateCardKind | null {
  return selectSparkEstateCards(input)[0]?.kind ?? null;
}

export function recordSparkEstateCardInteraction(input: {
  kind: SparkEstateCardKind;
  action: SparkEstateCardAction;
  helpful?: boolean;
}): SparkEstateCardInteraction {
  const entry: SparkEstateCardInteraction = {
    id: newId("card"),
    kind: input.kind,
    action: input.action,
    at: new Date().toISOString(),
    helpful: input.helpful,
  };
  writeCardMemory([entry, ...readCardMemory()]);
  return entry;
}

export function getSparkEstateCardMemoryInsights(): {
  opened: SparkEstateCardKind[];
  saved: SparkEstateCardKind[];
  ignored: SparkEstateCardKind[];
} {
  const memory = readCardMemory();
  return {
    opened: [...new Set(memory.filter((e) => e.action === "open").map((e) => e.kind))],
    saved: [...new Set(memory.filter((e) => e.action === "save").map((e) => e.kind))],
    ignored: [
      ...new Set(memory.filter((e) => e.action === "complete").map((e) => e.kind)),
    ],
  };
}

export function sparkEstateCardEcosystemHint(): string {
  return (
    "SPARK ESTATE CARD ECOSYSTEM: Show the right card at the right time — " +
    "simple, purposeful, personalized. Not notifications or clutter."
  );
}

export function verifySparkEstateCardEcosystem(): {
  cardKinds: SparkEstateCardKind[];
  priorityOrder: readonly string[];
  selectionWorks: boolean;
  lifecycleReady: boolean;
} {
  const kinds: SparkEstateCardKind[] = [
    "spark-card",
    "momentum-card",
    "project-card",
    "knowledge-card",
    "reflection-card",
    "win-card",
  ];

  const learnSelection = selectSparkEstateCards({
    text: "Teach me pricing",
    section: "momentum-institute",
  });
  const learnByText = selectSparkEstateCards({
    text: "I need to learn how this works",
  });
  const sparkSelection = selectSparkEstateCards({
    section: "companion",
  });

  return {
    cardKinds: kinds,
    priorityOrder: SPARK_ESTATE_CARD_PRIORITY_ORDER,
    selectionWorks:
      learnSelection.some((entry) => entry.kind === "knowledge-card") &&
      learnByText[0]?.kind === "knowledge-card" &&
      sparkSelection.some((entry) => entry.kind === "spark-card") &&
      buildSparkEstateKnowledgeCard().actions.length <= 4,
    lifecycleReady:
      typeof recordSparkEstateCardInteraction === "function" &&
      buildSparkEstateReflectionCard().actions.includes("reflect"),
  };
}
