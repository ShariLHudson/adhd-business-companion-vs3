/**
 * Chamber of Momentum — end-to-end member journey and intelligence flow (Phase 10).
 * Guided arrival → need → intelligence → work → completion → review → save.
 * Project creation follows the Spark Estate universal journey (Phase 11).
 *
 * @see docs/protocols/CHAMBER_OF_MOMENTUM_END_TO_END_MEMBER_JOURNEY_AND_INTELLIGENCE_FLOW_PHASE10.md
 * @see docs/protocols/SPARK_ESTATE_UNIVERSAL_CREATION_JOURNEY_AND_SHARI_EXPERIENCE_PHASE11.md
 * @see docs/protocols/SPARK_ESTATE_UNIVERSAL_COMPLETION_AND_OUTPUT_SYSTEM_SPECIFICATION_PHASE12.md
 */

import type { AppSection } from "@/lib/companionUi";
import { getSavedGrowthWins } from "@/lib/growthWinsStore";
import { chamberProjectJourneyMatchesEstateJourney } from "@/lib/universalCreation/sparkEstateCreationJourney";
import {
  chamberProjectCompletionMatchesEstateSystem,
  getChamberCompletionOutputOptions,
  SPARK_ESTATE_REVIEW_QUESTIONS,
} from "@/lib/universalCreation/sparkEstateCompletionSystem";
import {
  assessChamberMomentum,
  type ChamberIntelligenceAssessment,
} from "../chamberOfMomentumIntelligence";
import {
  getChamberMemorySnapshot,
  type ChamberMemorySnapshot,
} from "../chamberOfMomentumMemory";
import { buildSparkEstatePersonalizationContext } from "../sparkEstateMemberProfileEngine";
import type { ChamberMomentumIntent } from "../chamberOfMomentumRouting";

export const CHAMBER_JOURNEY_SESSION_KEY = "chamber-momentum-journey-v1";

/** Chamber project creation uses the same Spark Estate journey as every other room. */
export const CHAMBER_USES_UNIVERSAL_ESTATE_CREATION_JOURNEY =
  chamberProjectJourneyMatchesEstateJourney();

/** Chamber project completion uses the estate completion and output system. */
export const CHAMBER_USES_UNIVERSAL_ESTATE_COMPLETION_SYSTEM =
  chamberProjectCompletionMatchesEstateSystem();

export const CHAMBER_COMPLETION_REVIEW_QUESTIONS = SPARK_ESTATE_REVIEW_QUESTIONS;

export const CHAMBER_JOURNEY_STAGES = [
  "understanding",
  "planning",
  "creating",
  "completing",
  "reviewing",
  "saving",
] as const;

export type ChamberJourneyStage =
  | "arrival"
  | (typeof CHAMBER_JOURNEY_STAGES)[number];

export type ChamberMemberNeed =
  | "clarity"
  | "planning"
  | "learning"
  | "execution"
  | "review"
  | "decision";

export type ChamberIntelligenceKind =
  | "momentum-builder"
  | "momentum-institute"
  | "goals-projects"
  | "decision-support"
  | "brain-dump"
  | "idea-capture"
  | "progress-review";

export type ChamberIntelligenceTarget = {
  kind: ChamberIntelligenceKind;
  section: AppSection;
  purpose: string;
};

export type ChamberMomentumCard = {
  currentFocus: string | null;
  activeProjectName: string | null;
  nextStep: string | null;
  progressSummary: string | null;
  recentWin: string | null;
  recommendedAction: string;
  recommendedNeed: ChamberMemberNeed;
};

export type ChamberArrivalContext = {
  summaries: string[];
  whereLeftOff: string | null;
  suggestedNeed: ChamberMemberNeed | null;
};

export type ChamberJourneySelection = {
  need: ChamberMemberNeed;
  target: ChamberIntelligenceTarget;
  source: "explicit-text" | "context" | "entry-intent";
  journeyStage: ChamberJourneyStage;
  memberQuestion: string | null;
  assessment: ChamberIntelligenceAssessment | null;
};

export const CHAMBER_COMPLETION_REFLECTION_QUESTIONS = [
  "What did you accomplish?",
  "What did you learn?",
  "What would you like to remember?",
] as const;

export type ChamberOutputOption = {
  id: "save" | "print" | "continue";
  label: string;
  description: string;
};

export const CHAMBER_OUTPUT_OPTIONS: readonly ChamberOutputOption[] =
  getChamberCompletionOutputOptions().map((option) => ({
    id: option.id as ChamberOutputOption["id"],
    label: option.label,
    description: option.description,
  }));

export const CHAMBER_ADHD_FRIENDLY_RULES = [
  "Show one next step at a time.",
  "Avoid overwhelming menus.",
  "Remember previous work.",
  "Reduce repeated explanations.",
  "Celebrate progress.",
  "Allow returning later without starting over.",
] as const;

const DECISION_NEED_RE =
  /\b(?:can(?:not|'t) decide|decide between|which (?:option|path|direction|one)|help me choose|stuck choosing|not sure which|should i choose|pick between|weigh(?:ing)? (?:my )?options)\b/i;

const REVIEW_NEED_RE =
  /\b(?:review (?:my|what)|look back|see (?:my )?progress|show me (?:my )?progress|what (?:have i|did i) (?:done|accomplish)|reflect on|show me my wins|what changed)\b/i;

const WORKSHOP_PROJECT_RE = /\bworkshop\b/i;

const INTELLIGENCE_BY_NEED: Record<ChamberMemberNeed, ChamberIntelligenceTarget> = {
  clarity: {
    kind: "momentum-builder",
    section: "momentum-builder",
    purpose: "Help clarify and reduce overwhelm.",
  },
  planning: {
    kind: "momentum-builder",
    section: "momentum-builder",
    purpose: "Create structure and a workable plan.",
  },
  learning: {
    kind: "momentum-institute",
    section: "momentum-institute",
    purpose: "Provide knowledge and skill development.",
  },
  execution: {
    kind: "goals-projects",
    section: "chamber-project-entry",
    purpose: "Move work into action.",
  },
  review: {
    kind: "progress-review",
    section: "evidence-bank",
    purpose: "Review decisions, progress, and lessons.",
  },
  decision: {
    kind: "decision-support",
    section: "decision-compass",
    purpose: "Help evaluate options and choose a direction.",
  },
};

const INTENT_TO_NEED: Record<ChamberMomentumIntent, ChamberMemberNeed> = {
  build: "clarity",
  plan: "planning",
  learn: "learning",
  execute: "execution",
  idea: "clarity",
};

const NEED_TO_STAGE: Record<ChamberMemberNeed, ChamberJourneyStage> = {
  clarity: "understanding",
  planning: "planning",
  learning: "understanding",
  execution: "creating",
  review: "reviewing",
  decision: "understanding",
};

function activeFocusProject(snapshot: ChamberMemorySnapshot) {
  return (
    snapshot.projects.find(
      (project) =>
        project.status === "active" &&
        project.nextAction.trim().length > 0,
    ) ??
    snapshot.projects.find(
      (project) =>
        project.status !== "complete" &&
        project.status !== "archived" &&
        project.nextAction.trim().length > 0,
    ) ??
    null
  );
}

export function detectDecisionNeed(text: string): boolean {
  return DECISION_NEED_RE.test(text.trim());
}

export function detectReviewNeed(text: string): boolean {
  return REVIEW_NEED_RE.test(text.trim());
}

export function intelligenceTargetForNeed(
  need: ChamberMemberNeed,
): ChamberIntelligenceTarget {
  return INTELLIGENCE_BY_NEED[need];
}

export function journeyStageForNeed(need: ChamberMemberNeed): ChamberJourneyStage {
  return NEED_TO_STAGE[need];
}

function selectionFromNeed(
  need: ChamberMemberNeed,
  source: ChamberJourneySelection["source"],
  memberQuestion: string | null = null,
  assessment: ChamberIntelligenceAssessment | null = null,
  sectionOverride?: AppSection,
): ChamberJourneySelection {
  const target = intelligenceTargetForNeed(need);
  return {
    need,
    target: sectionOverride
      ? { ...target, section: sectionOverride }
      : target,
    source,
    journeyStage: journeyStageForNeed(need),
    memberQuestion,
    assessment,
  };
}

function assessmentToNeed(
  assessment: ChamberIntelligenceAssessment,
): ChamberMemberNeed {
  switch (assessment.state) {
    case "overwhelmed":
    case "too-many-ideas":
    case "stuck":
      return "clarity";
    case "needs-plan":
      return "planning";
    case "ready-to-execute":
      return "execution";
    case "wants-to-learn":
      return "learning";
    default:
      return "clarity";
  }
}

function assessmentToSelection(
  assessment: ChamberIntelligenceAssessment,
  source: ChamberJourneySelection["source"],
): ChamberJourneySelection {
  const need = assessmentToNeed(assessment);
  return selectionFromNeed(
    need,
    source,
    assessment.memberQuestion,
    assessment,
    assessment.section,
  );
}

function intentToSelection(intent: ChamberMomentumIntent): ChamberJourneySelection {
  const need = INTENT_TO_NEED[intent];
  return selectionFromNeed(need, "entry-intent");
}

export function inferChamberNeedFromContext(
  snapshot: ChamberMemorySnapshot = getChamberMemorySnapshot(),
): ChamberMemberNeed | null {
  const focus = activeFocusProject(snapshot);
  if (focus?.status === "blocked") return "clarity";
  if (focus?.nextAction) return "execution";

  const completed = snapshot.projects.filter(
    (project) => project.status === "complete",
  );
  if (completed.length > 0 && snapshot.recentMomentum.length === 0) {
    return "review";
  }

  if (snapshot.recentBlockers.some((entry) => entry.category === "overwhelm")) {
    return "clarity";
  }

  if (snapshot.projects.length === 0 && snapshot.recentMomentum.length === 0) {
    return null;
  }

  return "clarity";
}

export function buildChamberArrivalContext(
  snapshot: ChamberMemorySnapshot = getChamberMemorySnapshot(),
): ChamberArrivalContext {
  const summaries: string[] = [];
  const focus = activeFocusProject(snapshot);
  const suggestedNeed = inferChamberNeedFromContext(snapshot);

  if (focus) {
    summaries.push(`Active project: ${focus.name}`);
  }

  const wins = getSavedGrowthWins();
  if (wins.length > 0) {
    summaries.push(`${wins.length} win${wins.length === 1 ? "" : "s"} captured`);
  }

  if (snapshot.recentMomentum.length > 0) {
    summaries.push("Recent movement in your momentum history");
  }

  let whereLeftOff: string | null = null;
  if (focus?.nextAction) {
    whereLeftOff = `Last focus: ${focus.nextAction}`;
  } else if (wins[0]) {
    whereLeftOff = `Last win: ${wins[0].whatHappened}`;
  }

  const personalization = buildSparkEstatePersonalizationContext({ snapshot });
  if (personalization.continuityLine) {
    whereLeftOff = personalization.continuityLine;
  }

  return { summaries, whereLeftOff, suggestedNeed };
}

export function buildChamberMomentumCard(
  snapshot: ChamberMemorySnapshot = getChamberMemorySnapshot(),
): ChamberMomentumCard | null {
  const focus = activeFocusProject(snapshot);
  const wins = getSavedGrowthWins();
  const suggestedNeed = inferChamberNeedFromContext(snapshot);
  const arrival = buildChamberArrivalContext(snapshot);

  if (!focus && wins.length === 0 && snapshot.recentMomentum.length === 0) {
    return null;
  }

  const recommendedNeed = suggestedNeed ?? "clarity";
  const target = intelligenceTargetForNeed(recommendedNeed);

  let recommendedAction = "Choose what would help you move forward today.";
  if (focus?.nextAction) {
    recommendedAction = `Continue: ${focus.nextAction}`;
  } else if (recommendedNeed === "review" && wins[0]) {
    recommendedAction = "Review your recent wins and lessons.";
  } else {
    recommendedAction = target.purpose;
  }

  const activeCount = snapshot.projects.filter(
    (project) =>
      project.status !== "complete" && project.status !== "archived",
  ).length;
  const completedCount = snapshot.projects.filter(
    (project) => project.status === "complete",
  ).length;

  let progressSummary: string | null = null;
  if (activeCount > 0 || completedCount > 0) {
    progressSummary = `${activeCount} active · ${completedCount} complete`;
  } else if (snapshot.recentMomentum.length > 0) {
    progressSummary = `${snapshot.recentMomentum.length} recent momentum moment${
      snapshot.recentMomentum.length === 1 ? "" : "s"
    }`;
  }

  return {
    currentFocus: arrival.whereLeftOff,
    activeProjectName: focus?.name ?? null,
    nextStep: focus?.nextAction ?? null,
    progressSummary,
    recentWin: wins[0]?.whatHappened ?? null,
    recommendedAction,
    recommendedNeed,
  };
}

export function selectChamberJourneySupport(input?: {
  text?: string;
  intent?: ChamberMomentumIntent;
  snapshot?: ChamberMemorySnapshot;
}): ChamberJourneySelection | null {
  const trimmed = input?.text?.trim() ?? "";
  const snapshot = input?.snapshot ?? getChamberMemorySnapshot();

  if (trimmed) {
    if (detectDecisionNeed(trimmed)) {
      return selectionFromNeed(
        "decision",
        "explicit-text",
        "What are you deciding between?",
      );
    }
    if (detectReviewNeed(trimmed)) {
      return selectionFromNeed(
        "review",
        "explicit-text",
        "What would you like to look back on?",
      );
    }
    const assessment = assessChamberMomentum(trimmed);
    if (assessment) {
      return assessmentToSelection(assessment, "explicit-text");
    }
    return null;
  }

  if (input?.intent) {
    return intentToSelection(input.intent);
  }

  const inferred = inferChamberNeedFromContext(snapshot);
  if (!inferred) return null;
  return selectionFromNeed(inferred, "context");
}

export function hasChamberMomentumCard(
  snapshot: ChamberMemorySnapshot = getChamberMemorySnapshot(),
): boolean {
  return buildChamberMomentumCard(snapshot) !== null;
}

/** Workshop journey capture fields from the Phase 10 project example. */
export function workshopProjectCaptureFields(): {
  purpose: string;
  audience: string;
  outcome: string;
} {
  return {
    purpose: "Share knowledge that helps your audience move forward.",
    audience: "Who is this workshop for?",
    outcome: "What will participants walk away able to do?",
  };
}

export function isWorkshopProjectGoal(goal: string): boolean {
  return WORKSHOP_PROJECT_RE.test(goal.trim());
}

export function suggestWorkshopProjectMilestones(): string[] {
  return [
    "Define workshop purpose",
    "Identify audience",
    "Outline outcomes",
    "Draft session flow",
    "Create first exercise",
    "Review and improve",
  ];
}

export function stageChamberJourneySelection(
  selection: ChamberJourneySelection,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      CHAMBER_JOURNEY_SESSION_KEY,
      JSON.stringify(selection),
    );
  } catch {
    /* quota */
  }
}

export function consumeChamberJourneySelection(): ChamberJourneySelection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHAMBER_JOURNEY_SESSION_KEY);
    sessionStorage.removeItem(CHAMBER_JOURNEY_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChamberJourneySelection;
    if (!parsed?.need || !parsed?.target?.section) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function peekChamberJourneySelection(): ChamberJourneySelection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHAMBER_JOURNEY_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ChamberJourneySelection;
  } catch {
    return null;
  }
}

/** Memory categories updated after completion (Phase 10). */
export const CHAMBER_COMPLETION_MEMORY_UPDATES = [
  "wins",
  "evidence bank",
  "progress history",
  "learned preferences",
] as const;
