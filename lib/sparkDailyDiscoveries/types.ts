/**
 * Daily Discoveries™ Framework (T-016).
 * Curated entrepreneurial insight — not daily tips.
 * V1 estate hospitality signals: lib/companionEnvironmentIntelligence/dailyDiscovery.ts (distinct).
 *
 * @see docs/DAILY_DISCOVERIES_FRAMEWORK.md
 */

import type { EntrepreneurialCapability } from "@/lib/sparkTransformationConstitution/types";

/** Discovery Principle™ — all three required */
export type DiscoveryPrinciple = "learn" | "connect" | "apply";

export const DISCOVERY_PRINCIPLES: readonly DiscoveryPrinciple[] = [
  "learn",
  "connect",
  "apply",
] as const;

export const DISCOVERY_PRINCIPLE_LABELS: Record<DiscoveryPrinciple, string> = {
  learn: "Learn",
  connect: "Connect",
  apply: "Apply",
};

/** Discovery Categories™ — rotate naturally */
export type DiscoveryCategory =
  | "entrepreneur_stories"
  | "this_day_in_business"
  | "mental_models"
  | "marketing_psychology"
  | "ai_technology"
  | "innovation"
  | "customer_understanding"
  | "leadership"
  | "research_spotlight"
  | "hidden_connections";

export const DISCOVERY_CATEGORIES: readonly DiscoveryCategory[] = [
  "entrepreneur_stories",
  "this_day_in_business",
  "mental_models",
  "marketing_psychology",
  "ai_technology",
  "innovation",
  "customer_understanding",
  "leadership",
  "research_spotlight",
  "hidden_connections",
] as const;

export const DISCOVERY_CATEGORY_LABELS: Record<DiscoveryCategory, string> = {
  entrepreneur_stories: "Entrepreneur Stories",
  this_day_in_business: "This Day in Business",
  mental_models: "Mental Models",
  marketing_psychology: "Marketing Psychology",
  ai_technology: "AI & Technology",
  innovation: "Innovation",
  customer_understanding: "Customer Understanding",
  leadership: "Leadership",
  research_spotlight: "Research Spotlight",
  hidden_connections: "Hidden Connections",
};

/** Discovery Structure™ — same rhythm every time */
export type DiscoveryStructureStage =
  | "remarkable_idea"
  | "why_it_matters"
  | "business_connection"
  | "personal_connection"
  | "suggested_action"
  | "related_experiences";

export const DISCOVERY_STRUCTURE_ORDER: readonly DiscoveryStructureStage[] = [
  "remarkable_idea",
  "why_it_matters",
  "business_connection",
  "personal_connection",
  "suggested_action",
  "related_experiences",
] as const;

/** Related experiences — Discovery never stands alone */
export type DiscoveryRelatedExperience =
  | "momentum_builder"
  | "spark_card"
  | "guild"
  | "business_asset"
  | "gallery"
  | "observatory";

export const DISCOVERY_RELATED_EXPERIENCES: readonly DiscoveryRelatedExperience[] = [
  "momentum_builder",
  "spark_card",
  "guild",
  "business_asset",
  "gallery",
  "observatory",
] as const;

/** Rotation dimensions — keep Discoveries surprising */
export type DiscoveryRotationDimension =
  | "business"
  | "history"
  | "psychology"
  | "innovation"
  | "ai"
  | "leadership"
  | "creativity"
  | "research"
  | "patterns";

export const DISCOVERY_ROTATION_DIMENSIONS: readonly DiscoveryRotationDimension[] = [
  "business",
  "history",
  "psychology",
  "innovation",
  "ai",
  "leadership",
  "creativity",
  "research",
  "patterns",
] as const;

/** Reflection™ — one thoughtful question per Discovery */
export const DISCOVERY_REFLECTION_PROMPT_EXAMPLES = [
  "How could this influence your business?",
  "Where have you seen this before?",
  "What assumption might this challenge?",
] as const;

export type DiscoveryReflectionPrompt =
  (typeof DISCOVERY_REFLECTION_PROMPT_EXAMPLES)[number];

/** Companion introduction — natural, never "today's tip" */
export const DISCOVERY_COMPANION_INTRO_EXAMPLES = [
  "Something fascinating came across the Observatory today…",
  "This reminded me of something relevant to your business…",
  "This business story has surprising similarities to your current project…",
] as const;

/** Success Standard — observable member thoughts */
export type DiscoverySuccessSignal =
  | "learned_something_remarkable"
  | "understand_why_it_matters"
  | "know_how_to_use_it"
  | "want_to_keep_exploring";

export const DISCOVERY_SUCCESS_SIGNALS: readonly DiscoverySuccessSignal[] = [
  "learned_something_remarkable",
  "understand_why_it_matters",
  "know_how_to_use_it",
  "want_to_keep_exploring",
] as const;

/** Daily Discovery spec template — required before publish */
export type SparkDailyDiscoverySpec = {
  category: DiscoveryCategory;
  capabilityStrengthened: EntrepreneurialCapability;
  businessBrainPersonalization: string;
  relatedBusinessAssetIds?: string[];
  relatedSparkCardIds?: string[];
  relatedMomentumBuilderIds?: string[];
  relatedGuildIds?: string[];
  galleryOpportunity?: string;
  reflectionQuestion: string;
  practicalBusinessApplication: string;
  relatedExperiences?: DiscoveryRelatedExperience[];
  /** Core gate — must satisfy Learn · Connect · Apply */
  principlesSatisfied: readonly DiscoveryPrinciple[];
};

/** Publication gate */
export const DISCOVERY_PUBLICATION_QUESTION =
  "How will this make me think differently about my business today?" as const;
