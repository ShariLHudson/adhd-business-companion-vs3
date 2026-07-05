/**
 * Universal Creation Framework™ — one journey, every document type.
 *
 * Discover → Prepare → Create → Enhance → Review → Revise → Approve → Deliver
 * @see docs/estate/UNIVERSAL_CREATION_FRAMEWORK.md
 */

export type UniversalCreationPhase =
  | "discovery"
  | "preparation"
  | "guided_creation"
  | "enhancement"
  | "review"
  | "revision"
  | "approval"
  | "completion";

export type UniversalDocumentType =
  | "email"
  | "newsletter"
  | "sop"
  | "proposal"
  | "guide"
  | "workbook"
  | "training_manual"
  | "blog"
  | "book_chapter"
  | "course"
  | "meeting_agenda"
  | "social_post"
  | "business_plan"
  | "checklist"
  | "white_paper"
  | "marketing_plan"
  | "workflow"
  | "workshop"
  | "webinar"
  | "presentation"
  | "sales_funnel"
  | "website"
  | "document";

export type UniversalDiscoverySlot = "what" | "why" | "who" | "success";

export type UncertaintyPath = "teach" | "recommend" | "research" | "examples";

export type UniversalDiscoveryQuestion = {
  id: string;
  slot: UniversalDiscoverySlot;
  prompt: string;
  signalPatterns?: readonly RegExp[];
};

export type UniversalEnhancement = {
  id: string;
  label: string;
  description: string;
};

export type UniversalCompletionAction = {
  id: string;
  label: string;
};

export type UniversalDocumentPlugin = {
  id: UniversalDocumentType;
  label: string;
  createItemType: string;
  detectPatterns: readonly RegExp[];
  intro: string;
  discoveryQuestions: readonly UniversalDiscoveryQuestion[];
  enhancements: readonly UniversalEnhancement[];
  completionActions: readonly UniversalCompletionAction[];
  uncertaintyPaths: readonly UncertaintyPath[];
};

export type UniversalDiscoveryConfidence = {
  what: boolean;
  why: boolean;
  who: boolean;
  success: boolean;
  score: number;
};

export type UniversalCreationSession = {
  documentType: UniversalDocumentType;
  phase: UniversalCreationPhase;
  confidence: UniversalDiscoveryConfidence;
  answers: Record<string, string>;
  questionIndex: number;
  originalUserText: string;
  startedAtTurn: number;
  preparationReady: boolean;
  pendingEnhancements: string[];
  /** Composed draft shown during review — persisted for revision turns. */
  draftContent?: string;
};

export const UNIVERSAL_DISCOVERY_THRESHOLD = 90;

export const UNIVERSAL_SLOT_POINTS: Record<UniversalDiscoverySlot, number> = {
  what: 25,
  why: 25,
  who: 25,
  success: 25,
};

export function computeUniversalDiscoveryConfidence(
  flags: Omit<UniversalDiscoveryConfidence, "score">,
): UniversalDiscoveryConfidence {
  let score = 0;
  if (flags.what) score += UNIVERSAL_SLOT_POINTS.what;
  if (flags.why) score += UNIVERSAL_SLOT_POINTS.why;
  if (flags.who) score += UNIVERSAL_SLOT_POINTS.who;
  if (flags.success) score += UNIVERSAL_SLOT_POINTS.success;
  return { ...flags, score };
}

export function isUniversalDiscoveryComplete(
  confidence: UniversalDiscoveryConfidence,
): boolean {
  return confidence.score >= UNIVERSAL_DISCOVERY_THRESHOLD;
}

export type UniversalCreationTurnResult =
  | {
      kind: "question";
      intro?: string;
      question: string;
      session: UniversalCreationSession;
    }
  | {
      kind: "uncertainty";
      message: string;
      session: UniversalCreationSession;
    }
  | {
      kind: "ready";
      message: string;
      session: UniversalCreationSession;
      preparationLine: string;
      guidedCreationHint: string;
      enhancementOffers: string[];
    }
  | {
      kind: "draft";
      message: string;
      draftBody: string;
      session: UniversalCreationSession;
    }
  | {
      kind: "message";
      message: string;
      session: UniversalCreationSession;
    };

export type UniversalReviewChoice =
  | "show_complete"
  | "section_by_section"
  | "make_changes"
  | "summarize_first";

export type UniversalApprovalChoice =
  | "yes_ready"
  | "one_more_change"
  | "continue_later";
