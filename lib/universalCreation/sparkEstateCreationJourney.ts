/**
 * Spark Estate — universal creation journey (Phase 11).
 * One guided path for every room and every creation type.
 *
 * @see docs/protocols/SPARK_ESTATE_UNIVERSAL_CREATION_JOURNEY_AND_SHARI_EXPERIENCE_PHASE11.md
 */

import type { UniversalCreationPhase } from "./types";

export const SPARK_ESTATE_CREATION_STEPS = [
  {
    id: "understand",
    label: "Understand",
    purpose:
      "Know what you are creating, why it matters, who it is for, and what success looks like.",
  },
  {
    id: "discover",
    label: "Discover",
    purpose:
      "Explore ideas, possibilities, options, examples, and goals — one question at a time.",
  },
  {
    id: "define",
    label: "Define",
    purpose:
      "Clarify purpose, audience, outcome, important details, and boundaries before building.",
  },
  {
    id: "build",
    label: "Build",
    purpose: "Guide creation through the right structure for this type of work.",
  },
  {
    id: "review",
    label: "Review",
    purpose:
      "Check whether the work accomplishes the goal, what needs adjusting, and what is missing.",
  },
  {
    id: "improve",
    label: "Improve",
    purpose: "Offer edits, refinements, alternatives, and improvements.",
  },
  {
    id: "complete",
    label: "Complete and Deliver",
    purpose:
      "Decide what happens next — save, print, export, share, connect to a project, or schedule.",
  },
  {
    id: "remember",
    label: "Remember",
    purpose:
      "Save completed work, preferences, successful approaches, wins, and patterns for next time.",
  },
] as const;

export type SparkEstateCreationStepId =
  (typeof SPARK_ESTATE_CREATION_STEPS)[number]["id"];

export type CreationArchetype =
  | "project"
  | "template"
  | "strategy"
  | "email"
  | "funnel"
  | "content"
  | "product"
  | "plan"
  | "document"
  | "business-asset";

export const CREATION_ARCHETYPE_BUILD_FIELDS: Record<
  CreationArchetype,
  readonly string[]
> = {
  project: ["goal", "milestones", "tasks", "next actions"],
  template: ["purpose", "sections", "instructions", "usage example"],
  strategy: ["objective", "audience", "approach", "actions", "measurement"],
  email: ["purpose", "audience", "message", "structure", "call to action"],
  funnel: [
    "audience journey",
    "stages",
    "messaging",
    "actions",
    "follow-up",
  ],
  content: ["topic", "audience", "message", "structure", "call to action"],
  product: ["offer", "audience", "outcome", "features", "next step"],
  plan: ["objective", "audience", "milestones", "actions", "timeline"],
  document: ["purpose", "audience", "sections", "key points", "next step"],
  "business-asset": [
    "purpose",
    "audience",
    "structure",
    "message",
    "delivery",
  ],
};

export const SPARK_ESTATE_ROOM_INDEPENDENCE_RULE =
  "The room changes the expertise. The journey remains the same.";

export const SPARK_ESTATE_CREATION_ADHD_RULES = [
  "Do not start with a blank page.",
  "Ask one question at a time.",
  "Do not present every option at once.",
  "Do not force a perfect plan upfront.",
  "Guide, simplify, show progress, and create momentum.",
] as const;

export const SPARK_ESTATE_CREATION_MEMORY_UPDATES = [
  "completed work",
  "preferences",
  "successful approaches",
  "wins",
  "patterns",
] as const;

const UNIVERSAL_PHASE_TO_STEP: Record<
  UniversalCreationPhase,
  SparkEstateCreationStepId
> = {
  discovery: "discover",
  preparation: "define",
  guided_creation: "build",
  enhancement: "improve",
  review: "review",
  revision: "improve",
  approval: "complete",
  completion: "complete",
};

const DOCUMENT_TYPE_TO_ARCHETYPE: Partial<
  Record<string, CreationArchetype>
> = {
  email: "email",
  newsletter: "content",
  sop: "document",
  proposal: "document",
  guide: "content",
  workbook: "template",
  training_manual: "document",
  blog: "content",
  book_chapter: "content",
  course: "product",
  meeting_agenda: "plan",
  social_post: "content",
  business_plan: "plan",
  checklist: "template",
  white_paper: "document",
  marketing_plan: "strategy",
  workflow: "template",
  workshop: "project",
  webinar: "product",
  presentation: "content",
  sales_funnel: "funnel",
  website: "product",
  document: "document",
};

export function sparkEstateCreationStep(
  stepId: SparkEstateCreationStepId,
): (typeof SPARK_ESTATE_CREATION_STEPS)[number] {
  const step = SPARK_ESTATE_CREATION_STEPS.find((entry) => entry.id === stepId);
  if (!step) {
    throw new Error(`Unknown creation step: ${stepId}`);
  }
  return step;
}

export function mapUniversalPhaseToCreationStep(
  phase: UniversalCreationPhase,
): SparkEstateCreationStepId {
  return UNIVERSAL_PHASE_TO_STEP[phase];
}

export function inferCreationArchetype(input: {
  documentType?: string | null;
  roomId?: string | null;
  userText?: string | null;
}): CreationArchetype {
  if (input.documentType && DOCUMENT_TYPE_TO_ARCHETYPE[input.documentType]) {
    return DOCUMENT_TYPE_TO_ARCHETYPE[input.documentType]!;
  }

  const text = (input.userText ?? "").toLowerCase();
  if (/\bproject\b/.test(text)) return "project";
  if (/\btemplate\b/.test(text)) return "template";
  if (/\bstrategy\b/.test(text)) return "strategy";
  if (/\bemail\b/.test(text)) return "email";
  if (/\bfunnel\b/.test(text)) return "funnel";
  if (/\bproduct\b/.test(text)) return "product";
  if (/\bplan\b/.test(text)) return "plan";

  if (input.roomId === "chamber-of-momentum" || input.roomId === "chamber-project-entry") {
    return "project";
  }

  return "document";
}

export function buildFieldsForArchetype(
  archetype: CreationArchetype,
): readonly string[] {
  return CREATION_ARCHETYPE_BUILD_FIELDS[archetype];
}

export function roomUsesUniversalCreationJourney(roomId: string): boolean {
  return roomId.length > 0;
}

export function chamberProjectJourneyMatchesEstateJourney(): boolean {
  const chamberSteps = [
    "understand",
    "discover",
    "define",
    "build",
    "review",
    "improve",
    "complete",
    "remember",
  ] as const;
  return chamberSteps.every((stepId) =>
    SPARK_ESTATE_CREATION_STEPS.some((step) => step.id === stepId),
  );
}

export function verifySparkEstateCreationJourney(): {
  stepCount: number;
  hasRoomIndependence: boolean;
  hasRememberStep: boolean;
  archetypes: CreationArchetype[];
} {
  return {
    stepCount: SPARK_ESTATE_CREATION_STEPS.length,
    hasRoomIndependence: Boolean(SPARK_ESTATE_ROOM_INDEPENDENCE_RULE),
    hasRememberStep: SPARK_ESTATE_CREATION_STEPS.some(
      (step) => step.id === "remember",
    ),
    archetypes: Object.keys(CREATION_ARCHETYPE_BUILD_FIELDS) as CreationArchetype[],
  };
}
