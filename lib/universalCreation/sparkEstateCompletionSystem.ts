/**
 * Spark Estate — universal completion and output system (Phase 12).
 * Create → Review → Improve → Finalize → Output → Remember
 *
 * @see docs/protocols/SPARK_ESTATE_UNIVERSAL_COMPLETION_AND_OUTPUT_SYSTEM_SPECIFICATION_PHASE12.md
 */

import type { UniversalCompletionAction, UniversalCreationPhase } from "./types";
import {
  type CreationArchetype,
  inferCreationArchetype,
} from "./sparkEstateCreationJourney";

export const SPARK_ESTATE_COMPLETION_PRINCIPLE =
  "Creation is a journey, not a single answer — Spark helps members move from an idea to something useful.";

export const SPARK_ESTATE_COMPLETION_JOURNEY_HEADLINE =
  "Create → Review → Improve → Finalize → Save → Share → Remember";

export const SPARK_ESTATE_SUPPORTED_COMPLETION_WORK_TYPES = [
  "projects",
  "templates",
  "strategies",
  "emails",
  "funnels",
  "documents",
  "content",
  "plans",
  "business assets",
] as const;

export const SPARK_ESTATE_UNIVERSAL_ROOM_COMPLETION_RULE =
  "Every room uses the same completion system — create, review, improve, finalize, output, remember.";

export const SPARK_ESTATE_UNIVERSAL_ROOM_COMPLETION_EXAMPLES = [
  {
    room: "Marketing Room",
    flow: ["create campaign", "review", "finalize", "save"],
  },
  {
    room: "Content Room",
    flow: ["create article", "review", "edit", "publish/export"],
  },
  {
    room: "Chamber of Momentum",
    flow: ["create project", "review", "complete", "capture win"],
  },
] as const;

export const SPARK_ESTATE_COMPLETION_STEPS = [
  {
    id: "create",
    label: "Create",
    purpose: "Organize thoughts, provide structure, and develop the first version.",
  },
  {
    id: "review",
    label: "Review",
    purpose: "Improve with care — not criticism.",
  },
  {
    id: "improve",
    label: "Improve",
    purpose: "Refine wording, structure, clarity, and effectiveness.",
  },
  {
    id: "finalize",
    label: "Finalize",
    purpose: "Mark the work ready with title, date, version, and purpose.",
  },
  {
    id: "output",
    label: "Output",
    purpose: "Save, export, print, share, or continue the work.",
  },
  {
    id: "remember",
    label: "Remember",
    purpose: "Store wins, preferences, and successful approaches for next time.",
  },
] as const;

export type SparkEstateCompletionStepId =
  (typeof SPARK_ESTATE_COMPLETION_STEPS)[number]["id"];

export const SPARK_ESTATE_REVIEW_QUESTIONS = [
  "Does this accomplish what you wanted?",
  "Does this sound like you?",
  "Is anything missing?",
  "Would your audience understand it?",
  "What would make this better?",
] as const;

export const SPARK_ESTATE_FINALIZE_READY_PROMPT = "This is ready.";

export type SparkEstateOutputOptionId =
  | "save"
  | "export"
  | "print"
  | "share"
  | "continue";

export type SparkEstateOutputOption = {
  id: SparkEstateOutputOptionId;
  label: string;
  description: string;
  examples?: string;
};

export const SPARK_ESTATE_OUTPUT_OPTIONS: readonly SparkEstateOutputOption[] = [
  {
    id: "save",
    label: "Save",
    description: "Save inside Spark Estate.",
    examples: "My Projects, My Templates, My Strategies, My Content Library, My Sparks",
  },
  {
    id: "export",
    label: "Export",
    description: "Export when available.",
    examples: "PDF, document, spreadsheet, presentation",
  },
  {
    id: "print",
    label: "Print",
    description: "Create a print-friendly version.",
    examples: "Planning, reviewing, sharing, physical organization",
  },
  {
    id: "share",
    label: "Share",
    description: "Share with collaborators, clients, or team members.",
  },
  {
    id: "continue",
    label: "Continue",
    description: "Keep improving or build the next related piece.",
    examples:
      "Create the next email, turn this strategy into a plan, create tasks from this project",
  },
] as const;

export const COMPLETION_CONNECTION_TARGETS: Record<
  CreationArchetype,
  readonly string[]
> = {
  email: ["campaign", "client", "marketing project"],
  funnel: ["strategy", "campaign", "project"],
  template: ["template library", "future creations"],
  project: ["tasks", "milestones", "wins"],
  strategy: ["campaign", "project", "content library"],
  content: ["content library", "campaign", "project"],
  product: ["project", "content library", "campaign"],
  plan: ["project", "tasks", "milestones"],
  document: ["content library", "project", "template library"],
  "business-asset": ["project", "content library", "template library"],
};

export const SPARK_ESTATE_COMPLETION_MEMORY_UPDATES = [
  "completed work",
  "successful approaches",
  "preferences",
  "important decisions",
  "wins",
] as const;

export const SPARK_ESTATE_COMPLETION_ADHD_RULES = [
  "Do not lose completed work.",
  "Do not force immediate organization.",
  "Do not require many decisions at once.",
  "Offer simple choices and clear next steps.",
  "Provide reassurance and visible progress.",
] as const;

export const SPARK_ESTATE_COMPLETION_FEELING =
  "I created something valuable." as const;

export const SPARK_ESTATE_COMPLETION_VISION_END =
  "I know where it is. I can come back and continue. Spark remembers what matters.";

export const SPARK_ESTATE_REVIEW_HISTORY_KEY = "spark-estate-review-history-v1";

export type SparkEstateCompletionMetadata = {
  title: string;
  finalizedAt: string;
  version: number;
  purpose: string;
  relatedProjectId?: string;
  archetype: CreationArchetype;
};

export type SparkEstateReviewHistoryEntry = {
  version: number;
  savedAt: string;
  summary: string;
  changeNote?: string;
};

export type SparkEstateReviewHistory = {
  creationId: string;
  title: string;
  archetype: CreationArchetype;
  entries: SparkEstateReviewHistoryEntry[];
};

const UNIVERSAL_PHASE_TO_COMPLETION_STEP: Record<
  UniversalCreationPhase,
  SparkEstateCompletionStepId
> = {
  guided_creation: "create",
  discovery: "create",
  preparation: "create",
  review: "review",
  enhancement: "improve",
  revision: "improve",
  approval: "finalize",
  completion: "output",
};

export function mapUniversalPhaseToCompletionStep(
  phase: UniversalCreationPhase,
): SparkEstateCompletionStepId {
  return UNIVERSAL_PHASE_TO_COMPLETION_STEP[phase];
}

export function formatSparkEstateReviewPrompt(): string {
  return [
    "Take a look — the goal is improvement, not criticism.",
    "",
    ...SPARK_ESTATE_REVIEW_QUESTIONS.map((question) => `• ${question}`),
    "",
    "Tell me what you'd change, or say it feels ready.",
  ].join("\n");
}

export function buildSparkEstateCompletionMetadata(input: {
  title: string;
  purpose: string;
  archetype?: CreationArchetype;
  relatedProjectId?: string;
  version?: number;
  finalizedAt?: string;
}): SparkEstateCompletionMetadata {
  return {
    title: input.title.trim(),
    purpose: input.purpose.trim(),
    archetype: input.archetype ?? "document",
    relatedProjectId: input.relatedProjectId,
    version: input.version ?? 1,
    finalizedAt: input.finalizedAt ?? new Date().toISOString(),
  };
}

export function connectionTargetsForArchetype(
  archetype: CreationArchetype,
): readonly string[] {
  return COMPLETION_CONNECTION_TARGETS[archetype];
}

export function formatSparkEstateOutputMenu(input?: {
  archetype?: CreationArchetype;
  pluginActions?: readonly UniversalCompletionAction[];
}): string {
  const archetype =
    input?.archetype ??
    inferCreationArchetype({ documentType: input?.pluginActions?.[0]?.id });
  const connections = connectionTargetsForArchetype(archetype);
  const lines = SPARK_ESTATE_OUTPUT_OPTIONS.map(
    (option, index) => `${index + 1}. ${option.label} — ${option.description}`,
  );

  const pluginLines =
    input?.pluginActions?.map(
      (action, index) =>
        `${SPARK_ESTATE_OUTPUT_OPTIONS.length + index + 1}. ${action.label}`,
    ) ?? [];

  const parts = [
    "What would you like to do with it?",
    "",
    ...lines,
    ...pluginLines,
  ];

  if (connections.length > 0) {
    parts.push(
      "",
      `This can connect to: ${connections.join(", ")}.`,
    );
  }

  return parts.join("\n");
}

function readReviewHistories(): SparkEstateReviewHistory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SPARK_ESTATE_REVIEW_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is SparkEstateReviewHistory =>
        Boolean(entry) &&
        typeof (entry as SparkEstateReviewHistory).creationId === "string",
    );
  } catch {
    return [];
  }
}

function writeReviewHistories(entries: SparkEstateReviewHistory[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SPARK_ESTATE_REVIEW_HISTORY_KEY, JSON.stringify(entries));
  } catch {
    /* quota */
  }
}

export function recordSparkEstateReviewVersion(input: {
  creationId: string;
  title: string;
  archetype: CreationArchetype;
  summary: string;
  changeNote?: string;
}): SparkEstateReviewHistoryEntry {
  const histories = readReviewHistories();
  const existing = histories.find(
    (history) => history.creationId === input.creationId,
  );
  const version = (existing?.entries[0]?.version ?? 0) + 1;
  const entry: SparkEstateReviewHistoryEntry = {
    version,
    savedAt: new Date().toISOString(),
    summary: input.summary.trim(),
    changeNote: input.changeNote?.trim() || undefined,
  };

  const nextHistory: SparkEstateReviewHistory = existing
    ? {
        ...existing,
        title: input.title,
        archetype: input.archetype,
        entries: [entry, ...existing.entries].slice(0, 12),
      }
    : {
        creationId: input.creationId,
        title: input.title,
        archetype: input.archetype,
        entries: [entry],
      };

  writeReviewHistories([
    nextHistory,
    ...histories.filter((history) => history.creationId !== input.creationId),
  ]);

  return entry;
}

export function getSparkEstateReviewHistory(
  creationId: string,
): SparkEstateReviewHistory | null {
  return readReviewHistories().find((history) => history.creationId === creationId) ?? null;
}

export function chamberProjectCompletionMatchesEstateSystem(): boolean {
  const chamberSteps = ["review", "finalize", "output", "remember"] as const;
  return chamberSteps.every((stepId) =>
    SPARK_ESTATE_COMPLETION_STEPS.some((step) => step.id === stepId),
  );
}

export function getChamberCompletionOutputOptions(): readonly SparkEstateOutputOption[] {
  return SPARK_ESTATE_OUTPUT_OPTIONS.filter((option) =>
    ["save", "print", "continue"].includes(option.id),
  );
}

export function sparkEstateCompletionCompanionHint(input?: {
  text?: string;
}): string | null {
  const text = input?.text?.trim().toLowerCase() ?? "";
  if (
    text &&
    /\b(?:finish|finalize|complete|review|save|export|print|share|done with|ready to save)\b/.test(
      text,
    )
  ) {
    return (
      `SPARK ESTATE COMPLETION: ${SPARK_ESTATE_COMPLETION_PRINCIPLE} ` +
      `Guide: ${SPARK_ESTATE_COMPLETION_JOURNEY_HEADLINE}. ` +
      `Offer simple output choices — save, export, print, share, or continue — without overwhelming.`
    );
  }
  return null;
}

export function verifySparkEstateCompletionSystem(): {
  stepCount: number;
  outputOptionCount: number;
  hasRememberStep: boolean;
  chamberAligned: boolean;
  reviewQuestionsReady: boolean;
  connectionRulesReady: boolean;
  adhdRulesReady: boolean;
  universalRoomRuleReady: boolean;
  journeyReady: boolean;
} {
  const archetypes = Object.keys(COMPLETION_CONNECTION_TARGETS);
  return {
    stepCount: SPARK_ESTATE_COMPLETION_STEPS.length,
    outputOptionCount: SPARK_ESTATE_OUTPUT_OPTIONS.length,
    hasRememberStep: SPARK_ESTATE_COMPLETION_STEPS.some(
      (step) => step.id === "remember",
    ),
    chamberAligned: chamberProjectCompletionMatchesEstateSystem(),
    reviewQuestionsReady: SPARK_ESTATE_REVIEW_QUESTIONS.length === 5,
    connectionRulesReady:
      archetypes.length >= 10 &&
      connectionTargetsForArchetype("email").includes("campaign"),
    adhdRulesReady: SPARK_ESTATE_COMPLETION_ADHD_RULES.length >= 5,
    universalRoomRuleReady:
      SPARK_ESTATE_UNIVERSAL_ROOM_COMPLETION_EXAMPLES.length === 3,
    journeyReady: SPARK_ESTATE_COMPLETION_STEPS[0]?.id === "create",
  };
}

export function formatSparkEstateCompletionReport(
  verification: ReturnType<typeof verifySparkEstateCompletionSystem> = verifySparkEstateCompletionSystem(),
): string {
  const lines: string[] = [
    `Spark Estate completion system: ${verification.journeyReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_COMPLETION_PRINCIPLE,
    SPARK_ESTATE_COMPLETION_JOURNEY_HEADLINE,
    "",
    "Completion steps:",
  ];

  for (const step of SPARK_ESTATE_COMPLETION_STEPS) {
    lines.push(`  ${step.label} — ${step.purpose}`);
  }

  lines.push("", "Review questions:");
  for (const question of SPARK_ESTATE_REVIEW_QUESTIONS) {
    lines.push(`  • ${question}`);
  }

  lines.push("", "Output options:");
  for (const option of SPARK_ESTATE_OUTPUT_OPTIONS) {
    lines.push(`  ${option.label} — ${option.description}`);
  }

  lines.push("", "Universal room examples:");
  for (const example of SPARK_ESTATE_UNIVERSAL_ROOM_COMPLETION_EXAMPLES) {
    lines.push(`  ${example.room}: ${example.flow.join(" → ")}`);
  }

  lines.push("", "ADHD-friendly rules:");
  for (const rule of SPARK_ESTATE_COMPLETION_ADHD_RULES) {
    lines.push(`  • ${rule}`);
  }

  lines.push("", "Integration checks:");
  lines.push(`  Steps: ${verification.stepCount}`);
  lines.push(`  Output options: ${verification.outputOptionCount}`);
  lines.push(`  Remember step: ${verification.hasRememberStep ? "pass" : "fail"}`);
  lines.push(`  Chamber aligned: ${verification.chamberAligned ? "pass" : "fail"}`);
  lines.push(`  Review questions: ${verification.reviewQuestionsReady ? "pass" : "fail"}`);
  lines.push(`  Connection rules: ${verification.connectionRulesReady ? "pass" : "fail"}`);
  lines.push(`  Universal room rule: ${verification.universalRoomRuleReady ? "pass" : "fail"}`);

  return lines.join("\n");
}
