/**
 * Source integrity types — verification, content layers, lesson checklist.
 * No invented sources. Unverified candidates cannot teach final lessons.
 *
 * @see docs/SPARK_BUSINESS_BRAIN.md#source-integrity
 */

export const KNOWLEDGE_SOURCE_TYPE_IDS = [
  "book",
  "peer_reviewed_article",
  "journal_article",
  "report",
  "government_publication",
  "industry_publication",
  "course_material",
  "interview",
  "podcast",
  "video",
  "website",
  "internal_document",
  "file_reference",
  "curatorial_placeholder",
] as const;

export type KnowledgeSourceType = (typeof KNOWLEDGE_SOURCE_TYPE_IDS)[number];

export const SOURCE_VERIFICATION_STATUS_IDS = [
  "verified",
  "unverified_candidate",
  "rejected",
  "stale",
] as const;

export type SourceVerificationStatus =
  (typeof SOURCE_VERIFICATION_STATUS_IDS)[number];

/** Confidence in source accuracy and applicability — not member-facing gamification */
export const SOURCE_CONFIDENCE_LEVEL_IDS = [
  "high",
  "medium",
  "low",
] as const;

export type SourceConfidenceLevel =
  (typeof SOURCE_CONFIDENCE_LEVEL_IDS)[number];

export const KNOWLEDGE_CLAIM_KIND_IDS = [
  "fact",
  "principle",
  "spark_synthesis",
  "recommendation",
  "example",
  "opinion",
] as const;

export type KnowledgeClaimKind = (typeof KNOWLEDGE_CLAIM_KIND_IDS)[number];

export const KNOWLEDGE_CLAIM_KIND_LABELS: Record<KnowledgeClaimKind, string> = {
  fact: "Fact",
  principle: "Principle",
  spark_synthesis: "Spark Synthesis",
  recommendation: "Recommendation",
  example: "Example",
  opinion: "Opinion",
};

/**
 * A single claim within a Knowledge Card content layer.
 * Bodies resolve from CMS via bodyKey — not embedded in engine.
 */
export type KnowledgeContentClaim = {
  id: string;
  kind: KnowledgeClaimKind;
  /** CMS / content key — lesson body lives elsewhere */
  bodyKey?: string;
  /** Required for kind=fact when publishing lessons */
  sourceIds?: string[];
  /** Direct quotation — must be exact and tied to verified source */
  isQuote?: boolean;
  quoteExact?: boolean;
  /** Speculative content must be explicitly labeled */
  isSpeculative?: boolean;
  limitationNotes?: string;
};

/**
 * Knowledge Card content — strictly separated layers.
 * Spark synthesis must never be presented as a direct source quote.
 */
export type KnowledgeCardContentLayers = {
  facts: KnowledgeContentClaim[];
  principles: KnowledgeContentClaim[];
  sparkSynthesis: KnowledgeContentClaim[];
  recommendations: KnowledgeContentClaim[];
  examples: KnowledgeContentClaim[];
  opinions: KnowledgeContentClaim[];
};

export const EMPTY_KNOWLEDGE_CARD_CONTENT_LAYERS: KnowledgeCardContentLayers = {
  facts: [],
  principles: [],
  sparkSynthesis: [],
  recommendations: [],
  examples: [],
  opinions: [],
};

/** Source Integrity Checklist — required before any lesson ships */
export const SOURCE_INTEGRITY_CHECKLIST_IDS = [
  "all_facts_sourced",
  "quotes_exact",
  "source_is_real",
  "source_current_enough",
  "fact_opinion_synthesis_labeled",
  "limitations_noted",
  "speculative_labeled",
] as const;

export type SourceIntegrityChecklistId =
  (typeof SOURCE_INTEGRITY_CHECKLIST_IDS)[number];

export const SOURCE_INTEGRITY_CHECKLIST: ReadonlyArray<{
  id: SourceIntegrityChecklistId;
  order: number;
  question: string;
}> = [
  {
    id: "all_facts_sourced",
    order: 1,
    question: "Are all factual claims sourced?",
  },
  {
    id: "quotes_exact",
    order: 2,
    question: "Are quotes exact?",
  },
  {
    id: "source_is_real",
    order: 3,
    question: "Is the source real?",
  },
  {
    id: "source_current_enough",
    order: 4,
    question: "Is the source current enough?",
  },
  {
    id: "fact_opinion_synthesis_labeled",
    order: 5,
    question: "Is this fact, opinion, or Spark synthesis?",
  },
  {
    id: "limitations_noted",
    order: 6,
    question: "Are limitations noted?",
  },
  {
    id: "speculative_labeled",
    order: 7,
    question: "Is anything speculative clearly labeled?",
  },
];

export type SourceIntegrityChecklistAnswers = Record<
  SourceIntegrityChecklistId,
  boolean
>;

export type SourceIntegrityChecklistResult = {
  id: string;
  lessonId: string;
  knowledgeCardId: string;
  experienceId?: string;
  checkedAt: string;
  answers: SourceIntegrityChecklistAnswers;
  passed: boolean;
  reviewerNotes?: string;
};

export type SourceIntegrityValidationIssue = {
  code: string;
  message: string;
  claimId?: string;
  sourceId?: string;
};

export type SourceIntegrityValidationResult = {
  valid: boolean;
  issues: SourceIntegrityValidationIssue[];
};
