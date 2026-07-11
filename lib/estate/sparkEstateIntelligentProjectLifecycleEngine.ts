/**
 * Spark Estate — intelligent project lifecycle engine (Phase 32).
 * Manages projects from first idea through completion and future reuse.
 *
 * @see docs/protocols/SPARK_ESTATE_INTELLIGENT_PROJECT_LIFECYCLE_ENGINE_SPECIFICATION_PHASE32.md
 */

import type { Project } from "@/lib/companionStore";
import { verifySparkEstateCompletionSystem } from "@/lib/universalCreation/sparkEstateCompletionSystem";
import {
  SPARK_ESTATE_CREATION_STEPS,
  verifySparkEstateCreationJourney,
} from "@/lib/universalCreation/sparkEstateCreationJourney";
import type { AppSection } from "@/lib/companionUi";
import {
  chamberProjectSummary,
  createChamberProject,
  suggestProjectBreakdown,
  type CreateChamberProjectInput,
} from "./chamberProjectEngine";
import {
  getChamberMemorySnapshot,
  type ChamberMemorySnapshot,
} from "./chamberOfMomentumMemory";
import type { ChamberProjectMeta, ChamberProjectMomentumState } from "./chamberProjectMeta";
import { getChamberProjectMeta } from "./chamberProjectMeta";
import {
  buildSparkEstateMomentumCard,
  buildSparkEstateProjectCard,
  buildSparkEstateWinCard,
  verifySparkEstateCardEcosystem,
} from "./sparkEstateCardEcosystem";
import { resolveSparkEstateWorkspaceRecommendation } from "./sparkEstateIntelligentWorkspaceRecommendationSystem";
import { verifySparkEstateUserJourneyAndMemberLifecycle } from "./sparkEstateUserJourneyAndMemberLifecycleArchitecture";

export const SPARK_ESTATE_PROJECT_LIFECYCLE_PRINCIPLE =
  "A project is an idea, outcome, plan, actions, decisions, assets, progress, completion, and learning — not just a task list.";

export const SPARK_ESTATE_PROJECT_LIFECYCLE_VISION =
  "Help members finish what they start — transform ideas into completed outcomes.";

export const SPARK_ESTATE_PROJECT_LIFECYCLE_SUCCESS_JOURNEY = {
  from: "I need to create something.",
  to: "I completed something valuable.",
} as const;

export const SPARK_ESTATE_PROJECT_LIFECYCLE_STAGES = [
  {
    id: "capture",
    label: "Capture",
    purpose: "Recognize when an idea can become a project.",
    examples: [
      "I need to create a course.",
      "I need a sales funnel.",
      "I need a marketing plan.",
      "I need a client process.",
    ],
  },
  {
    id: "clarify",
    label: "Clarify",
    purpose: "Define what is being created and why it matters.",
    questions: [
      "What is being created?",
      "Why does it matter?",
      "Who is it for?",
      "What does success look like?",
    ],
  },
  {
    id: "structure",
    label: "Structure",
    purpose: "Create the project foundation.",
    includes: [
      "project name",
      "purpose",
      "desired outcome",
      "milestones",
      "timeline",
      "resources needed",
    ],
  },
  {
    id: "build",
    label: "Build",
    purpose: "Guide creation of project assets.",
    mayInclude: [
      "documents",
      "templates",
      "emails",
      "strategies",
      "content",
      "tasks",
      "decisions",
    ],
  },
  {
    id: "track-progress",
    label: "Track Progress",
    purpose: "Remember stage, completed items, next action, and blockers.",
    tracks: ["current stage", "completed items", "next action", "blockers"],
  },
  {
    id: "review",
    label: "Review",
    purpose: "Check whether the work meets the goal.",
    questions: [
      "Is this meeting the goal?",
      "What needs improvement?",
      "What is missing?",
    ],
  },
  {
    id: "complete",
    label: "Complete",
    purpose: "Finish with output, saved assets, next steps, and recognition.",
    requires: [
      "final output",
      "saved assets",
      "clear next steps",
      "completion recognition",
    ],
  },
  {
    id: "learn",
    label: "Learn",
    purpose: "Capture what worked for future reuse.",
    captures: [
      "what worked",
      "preferences",
      "successful approaches",
      "reusable assets",
    ],
  },
] as const;

export type SparkEstateProjectLifecycleStageId =
  (typeof SPARK_ESTATE_PROJECT_LIFECYCLE_STAGES)[number]["id"];

export const SPARK_ESTATE_PROJECT_ENTRY_POINTS = [
  {
    id: "chamber",
    label: "Chamber of Momentum",
    recommendedFor: ["larger projects", "multiple steps", "planning needs"],
  },
  {
    id: "any-room",
    label: "Any Room",
    examples: [
      { room: "Marketing Room", prompt: "I need a funnel." },
      { room: "Content Room", prompt: "I need a blog series." },
      { room: "Conversation", prompt: "I have an idea." },
    ],
  },
] as const;

export const SPARK_ESTATE_PROJECT_INTELLIGENCE_SUPPORT = {
  example: "Sales Funnel Project",
  intelligences: [
    {
      id: "marketing",
      label: "Marketing Intelligence",
      supports: ["messaging", "customer journey"],
    },
    {
      id: "content",
      label: "Content Intelligence",
      supports: ["emails", "copy"],
    },
    {
      id: "project",
      label: "Project Intelligence",
      supports: ["milestones", "completion"],
    },
    {
      id: "momentum",
      label: "Momentum Intelligence",
      supports: ["progress"],
    },
  ],
} as const;

export const SPARK_ESTATE_PROJECT_LIFECYCLE_CARDS = [
  {
    kind: "project-card",
    label: "Project Card",
    shows: ["project name", "status", "next step"],
  },
  {
    kind: "momentum-card",
    label: "Momentum Card",
    shows: ["progress", "encouragement"],
  },
  {
    kind: "win-card",
    label: "Win Card",
    shows: ["completion", "achievement"],
  },
] as const;

export const SPARK_ESTATE_PROJECT_ADHD_RULES = [
  "reduce overwhelm",
  "show the next step",
  "avoid presenting the entire project at once",
  "celebrate progress",
] as const;

export const SPARK_ESTATE_PROJECT_NEXT_STEP_QUESTION = "What do I do next?";

export const SPARK_ESTATE_PROJECT_MEMORY_ITEMS = [
  "completed projects",
  "reusable assets",
  "successful methods",
  "preferences",
] as const;

const PROJECT_CAPTURE_RE =
  /\b(?:need to create|need a|i have an idea|marketing plan|sales funnel|client process|blog series|course|workshop plan)\b/i;

export type SparkEstateProjectCapture = {
  isProject: boolean;
  goal: string | null;
};

export type SparkEstateProjectLifecycleView = {
  currentStage: SparkEstateProjectLifecycleStageId;
  nextQuestion: string;
  milestones: string[];
  entryPoint: string;
  intelligenceSupport: string[];
  recommendedCards: Array<(typeof SPARK_ESTATE_PROJECT_LIFECYCLE_CARDS)[number]["kind"]>;
  adhdGuidance: string;
};

export function detectSparkEstateProjectCapture(text: string): SparkEstateProjectCapture {
  const normalized = text.trim();
  if (!normalized || !PROJECT_CAPTURE_RE.test(normalized)) {
    return { isProject: false, goal: null };
  }
  return { isProject: true, goal: normalized };
}

export function inferSparkEstateProjectLifecycleStage(input: {
  text?: string;
  project?: Project;
  meta?: ChamberProjectMeta | null;
}): SparkEstateProjectLifecycleStageId {
  const meta = input.meta ?? (input.project ? getChamberProjectMeta(input.project.id) : null);
  const summary = input.project ? chamberProjectSummary(input.project) : null;
  const state = meta?.momentumState ?? summary?.momentumState;
  const status = input.project?.status;

  if (meta?.completedLesson) return "learn";
  if (state === "complete" || status === "completed") return "complete";
  if (state === "blocked") return "track-progress";
  if (state === "idea") {
    return input.text && detectSparkEstateProjectCapture(input.text).isProject
      ? "capture"
      : "clarify";
  }
  if (state === "exploring") return "clarify";
  if (state === "active") {
    if (summary && !summary.hasSpecificNextAction) return "structure";
    if (meta?.currentStateNote?.toLowerCase().includes("review")) return "review";
    if (summary?.hasSpecificNextAction) return "build";
    return "track-progress";
  }
  if (input.text && detectSparkEstateProjectCapture(input.text).isProject) return "capture";
  return "capture";
}

export function assessSparkEstateProjectIntelligenceNeeds(
  text: string,
): string[] {
  const needs = new Set<string>();
  if (/\b(?:funnel|marketing|messaging|campaign)\b/i.test(text)) {
    needs.add("Marketing Intelligence");
  }
  if (/\b(?:email|copy|blog|content)\b/i.test(text)) {
    needs.add("Content Intelligence");
  }
  if (/\b(?:milestone|project|plan|task)\b/i.test(text)) {
    needs.add("Project Intelligence");
  }
  if (/\b(?:progress|next step|momentum|stuck)\b/i.test(text)) {
    needs.add("Momentum Intelligence");
  }
  if (/\bsales funnel\b/i.test(text)) {
    return SPARK_ESTATE_PROJECT_INTELLIGENCE_SUPPORT.intelligences.map(
      (entry) => entry.label,
    );
  }
  return [...needs];
}

export function resolveSparkEstateProjectEntryPoint(input: {
  text: string;
  currentSection?: AppSection;
}): string {
  const workspace = resolveSparkEstateWorkspaceRecommendation({
    text: input.text,
    currentSection: input.currentSection,
  });
  if (workspace.recommendedWorkspace?.id === "chamber") {
    return SPARK_ESTATE_PROJECT_ENTRY_POINTS[0].label;
  }
  if (input.currentSection) {
    return `Current room (${input.currentSection})`;
  }
  return "Conversation";
}

export function buildSparkEstateProjectLifecycleCards(
  snapshot: ChamberMemorySnapshot = getChamberMemorySnapshot(),
  stage: SparkEstateProjectLifecycleStageId = "build",
): Array<(typeof SPARK_ESTATE_PROJECT_LIFECYCLE_CARDS)[number]["kind"]> {
  const cards: Array<(typeof SPARK_ESTATE_PROJECT_LIFECYCLE_CARDS)[number]["kind"]> =
    [];
  if (buildSparkEstateProjectCard(snapshot)) cards.push("project-card");
  if (buildSparkEstateMomentumCard(snapshot)) cards.push("momentum-card");
  if (stage === "complete" || stage === "learn") {
    if (buildSparkEstateWinCard()) cards.push("win-card");
  }
  return cards;
}

export function buildSparkEstateProjectLifecycleView(input: {
  text?: string;
  project?: Project;
  currentSection?: AppSection;
}): SparkEstateProjectLifecycleView {
  const text = input.text?.trim() ?? "";
  const capture = detectSparkEstateProjectCapture(text);
  const meta = input.project ? getChamberProjectMeta(input.project.id) : null;
  const currentStage = inferSparkEstateProjectLifecycleStage({
    text,
    project: input.project,
    meta,
  });
  const milestones = capture.goal
    ? suggestProjectBreakdown(capture.goal)
    : input.project
      ? suggestProjectBreakdown(input.project.goal || input.project.name)
      : [];

  const stageConfig = SPARK_ESTATE_PROJECT_LIFECYCLE_STAGES.find(
    (stage) => stage.id === currentStage,
  );
  const nextQuestion =
    currentStage === "clarify"
      ? (stageConfig && "questions" in stageConfig
          ? stageConfig.questions[0]
          : SPARK_ESTATE_PROJECT_NEXT_STEP_QUESTION)
      : SPARK_ESTATE_PROJECT_NEXT_STEP_QUESTION;

  return {
    currentStage,
    nextQuestion,
    milestones,
    entryPoint: resolveSparkEstateProjectEntryPoint({
      text: text || input.project?.name || "",
      currentSection: input.currentSection,
    }),
    intelligenceSupport: assessSparkEstateProjectIntelligenceNeeds(
      text || input.project?.goal || input.project?.name || "",
    ),
    recommendedCards: buildSparkEstateProjectLifecycleCards(
      getChamberMemorySnapshot(),
      currentStage,
    ),
    adhdGuidance:
      "Show one next step, celebrate progress, and avoid presenting the entire project at once.",
  };
}

export function startSparkEstateProjectFromCapture(
  input: CreateChamberProjectInput,
): Project {
  return createChamberProject(input);
}

export function assessSparkEstateProjectLifecycleCompliance(): {
  stagesReady: boolean;
  principleReady: boolean;
  entryPointsReady: boolean;
  intelligenceSupportReady: boolean;
  lifecycleCardsReady: boolean;
  adhdRulesReady: boolean;
  memoryItemsReady: boolean;
  chamberEngineBridgeReady: boolean;
  cardEcosystemBridgeReady: boolean;
  creationJourneyBridgeReady: boolean;
  completionBridgeReady: boolean;
  workspaceBridgeReady: boolean;
  memberLifecycleBridgeReady: boolean;
} {
  const cards = verifySparkEstateCardEcosystem();
  const journey = verifySparkEstateCreationJourney();
  const completion = verifySparkEstateCompletionSystem();
  const lifecycle = verifySparkEstateUserJourneyAndMemberLifecycle();
  const funnelNeeds = assessSparkEstateProjectIntelligenceNeeds(
    "I need a sales funnel.",
  );

  return {
    stagesReady: SPARK_ESTATE_PROJECT_LIFECYCLE_STAGES.length === 8,
    principleReady: SPARK_ESTATE_PROJECT_LIFECYCLE_PRINCIPLE.includes("not just a task list"),
    entryPointsReady: SPARK_ESTATE_PROJECT_ENTRY_POINTS.length === 2,
    intelligenceSupportReady:
      SPARK_ESTATE_PROJECT_INTELLIGENCE_SUPPORT.intelligences.length === 4 &&
      funnelNeeds.length === 4,
    lifecycleCardsReady: SPARK_ESTATE_PROJECT_LIFECYCLE_CARDS.length === 3,
    adhdRulesReady: SPARK_ESTATE_PROJECT_ADHD_RULES.length === 4,
    memoryItemsReady: SPARK_ESTATE_PROJECT_MEMORY_ITEMS.length === 4,
    chamberEngineBridgeReady: suggestProjectBreakdown("course").length >= 3,
    cardEcosystemBridgeReady: cards.selectionWorks,
    creationJourneyBridgeReady: journey.stepCount === SPARK_ESTATE_CREATION_STEPS.length,
    completionBridgeReady: completion.chamberAligned,
    workspaceBridgeReady: Boolean(resolveSparkEstateProjectEntryPoint({
      text: "I need to plan my workshop.",
    }).includes("Chamber")),
    memberLifecycleBridgeReady: lifecycle.lifecycleResolutionReady,
  };
}

export function verifySparkEstateIntelligentProjectLifecycleEngine(): {
  stages: number;
  lifecycleReady: boolean;
  captureReady: boolean;
  completionPathReady: boolean;
} {
  const captureExamples = SPARK_ESTATE_PROJECT_LIFECYCLE_STAGES[0].examples.every(
    (example) => detectSparkEstateProjectCapture(example).isProject,
  );
  const compliance = assessSparkEstateProjectLifecycleCompliance();
  const lifecycleReady = Object.values(compliance).every(Boolean);

  const project = startSparkEstateProjectFromCapture({
    name: "Sales funnel",
    desiredOutcome: "Launch a simple sales funnel",
    whyItMatters: "Grow my offer",
    nextAction: "Draft the welcome email headline",
  });
  const activeStage = inferSparkEstateProjectLifecycleStage({ project });
  const completionPathReady =
    activeStage === "build" && project.status === "active-focus";

  return {
    stages: SPARK_ESTATE_PROJECT_LIFECYCLE_STAGES.length,
    lifecycleReady,
    captureReady: captureExamples,
    completionPathReady,
  };
}

export function sparkEstateProjectLifecycleCompanionHint(input?: {
  text?: string;
  currentSection?: AppSection;
}): string | null {
  const text = input?.text?.trim() ?? "";
  if (
    !text ||
    !/(?:project|funnel|course|marketing plan|client process|blog series|milestone|next step|finish what i start)/i.test(
      text,
    )
  ) {
    return null;
  }

  const capture = detectSparkEstateProjectCapture(text);
  if (!capture.isProject) return null;

  const view = buildSparkEstateProjectLifecycleView({
    text,
    currentSection: input?.currentSection,
  });

  return (
    `SPARK ESTATE PROJECT LIFECYCLE: ${SPARK_ESTATE_PROJECT_LIFECYCLE_PRINCIPLE} ` +
    `Stage: ${view.currentStage}. ${view.nextQuestion} ` +
    `Entry: ${view.entryPoint}. Cards: ${view.recommendedCards.join(", ") || "gathering context"}. ` +
    `${view.adhdGuidance}`
  );
}

export function formatSparkEstateProjectLifecycleReport(
  verification: ReturnType<
    typeof verifySparkEstateIntelligentProjectLifecycleEngine
  > = verifySparkEstateIntelligentProjectLifecycleEngine(),
  compliance: ReturnType<typeof assessSparkEstateProjectLifecycleCompliance> = assessSparkEstateProjectLifecycleCompliance(),
): string {
  const lines: string[] = [
    `Spark Estate project lifecycle: ${verification.lifecycleReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_PROJECT_LIFECYCLE_PRINCIPLE,
    SPARK_ESTATE_PROJECT_LIFECYCLE_VISION,
    `Journey: ${SPARK_ESTATE_PROJECT_LIFECYCLE_SUCCESS_JOURNEY.from} → ${SPARK_ESTATE_PROJECT_LIFECYCLE_SUCCESS_JOURNEY.to}`,
    "",
    "Lifecycle stages:",
  ];

  for (const stage of SPARK_ESTATE_PROJECT_LIFECYCLE_STAGES) {
    lines.push(`  ${stage.label}: ${stage.purpose}`);
  }

  lines.push("", "Entry points:");
  for (const entry of SPARK_ESTATE_PROJECT_ENTRY_POINTS) {
    lines.push(`  ${entry.label}`);
  }

  lines.push("", "Project intelligence support:");
  lines.push(`  ${SPARK_ESTATE_PROJECT_INTELLIGENCE_SUPPORT.example}`);
  for (const intelligence of SPARK_ESTATE_PROJECT_INTELLIGENCE_SUPPORT.intelligences) {
    lines.push(`    ${intelligence.label}: ${intelligence.supports.join(", ")}`);
  }

  lines.push("", "Project cards:");
  for (const card of SPARK_ESTATE_PROJECT_LIFECYCLE_CARDS) {
    lines.push(`  ${card.label}: ${card.shows.join(", ")}`);
  }

  lines.push("", "ADHD-friendly rules:");
  for (const rule of SPARK_ESTATE_PROJECT_ADHD_RULES) {
    lines.push(`  • ${rule}`);
  }
  lines.push(`  Member question: ${SPARK_ESTATE_PROJECT_NEXT_STEP_QUESTION}`);

  lines.push("", "Project memory:");
  for (const item of SPARK_ESTATE_PROJECT_MEMORY_ITEMS) {
    lines.push(`  • ${item}`);
  }

  lines.push("", "Compliance checks:");
  lines.push(`  Stages: ${compliance.stagesReady ? "pass" : "fail"}`);
  lines.push(`  Chamber engine bridge: ${compliance.chamberEngineBridgeReady ? "pass" : "fail"}`);
  lines.push(`  Card ecosystem bridge: ${compliance.cardEcosystemBridgeReady ? "pass" : "fail"}`);
  lines.push(`  Creation journey bridge: ${compliance.creationJourneyBridgeReady ? "pass" : "fail"}`);
  lines.push(`  Completion bridge: ${compliance.completionBridgeReady ? "pass" : "fail"}`);
  lines.push(`  Capture examples: ${verification.captureReady ? "pass" : "fail"}`);
  lines.push(`  Completion path: ${verification.completionPathReady ? "pass" : "fail"}`);

  return lines.join("\n");
}
