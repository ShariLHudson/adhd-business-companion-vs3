/**
 * Momentum Builder Framework — entrepreneurial practice experiences (T-012).
 * Not games; transformation through practice. 2–10 minutes; real business connection.
 *
 * @see docs/MOMENTUM_BUILDER_FRAMEWORK.md
 * @see lib/momentumBuilders/types.ts — V1 EF-focused catalog runtime
 */

import type { EntrepreneurialJourneyStage } from "@/lib/sparkFounderJourney/types";

/** Builder knowledge domain — eight categories from T-012 */
export type MomentumBuilderDomain =
  | "strategic_thinking"
  | "decision_making"
  | "marketing"
  | "sales"
  | "creativity"
  | "executive_function"
  | "leadership"
  | "ai_fluency";

export const MOMENTUM_BUILDER_DOMAIN_LABELS: Record<MomentumBuilderDomain, string> = {
  strategic_thinking: "Strategic Thinking",
  decision_making: "Decision Making",
  marketing: "Marketing",
  sales: "Sales",
  creativity: "Creativity",
  executive_function: "Executive Function",
  leadership: "Leadership",
  ai_fluency: "AI Fluency",
};

/** Growth levels — not Easy/Medium/Hard */
export type MomentumBuilderGrowthLevel =
  | "explore"
  | "practice"
  | "apply"
  | "master";

export const MOMENTUM_BUILDER_GROWTH_LEVEL_LABELS: Record<
  MomentumBuilderGrowthLevel,
  string
> = {
  explore: "Explore",
  practice: "Practice",
  apply: "Apply",
  master: "Master",
};

/** Standard flow — every Builder follows this rhythm */
export type MomentumBuilderFlowStage =
  | "arrival"
  | "context"
  | "challenge"
  | "practice"
  | "insight"
  | "reflection"
  | "business_application"
  | "capability_growth"
  | "connection";

export const MOMENTUM_BUILDER_FLOW_ORDER: readonly MomentumBuilderFlowStage[] = [
  "arrival",
  "context",
  "challenge",
  "practice",
  "insight",
  "reflection",
  "business_application",
  "capability_growth",
  "connection",
] as const;

/** At least one primary objective per Builder */
export type MomentumBuilderObjective =
  | "strengthen_thinking"
  | "increase_confidence"
  | "practice_decision_making"
  | "reduce_executive_function_load"
  | "improve_creativity"
  | "teach_entrepreneurial_principles"
  | "improve_business_assets"
  | "generate_insights"
  | "build_momentum";

/** Capability strengthened — Capability Graph tracks quietly */
export type MomentumBuilderCapability =
  | "decision_making"
  | "executive_function"
  | "communication"
  | "marketing"
  | "leadership"
  | "creativity"
  | "confidence"
  | "innovation"
  | "business_strategy"
  | "sales"
  | "strategic_thinking"
  | "ai_fluency"
  | "negotiation"
  | "pricing"
  | "storytelling";

/** EF support strategy — required per Builder spec */
export type MomentumBuilderEfSupportStrategy =
  | "immediate_structure"
  | "low_setup"
  | "pausable"
  | "no_interruption_penalty"
  | "progressive_disclosure"
  | "single_focus"
  | "optional_depth";

/** Real business anchor — never purely abstract */
export type MomentumBuilderBusinessAnchor =
  | "business_asset"
  | "goal"
  | "marketing_campaign"
  | "offer"
  | "workshop"
  | "client"
  | "sales_process"
  | "project";

/** T-012 authoring template — required before building a Builder */
export type MomentumBuilderSpec = {
  builderId: string;
  title: string;
  domain: MomentumBuilderDomain;
  primaryCapability: MomentumBuilderCapability;
  secondaryCapability?: MomentumBuilderCapability;
  journeyStages: EntrepreneurialJourneyStage[];
  growthLevel: MomentumBuilderGrowthLevel;
  objectives: MomentumBuilderObjective[];
  businessAssetConnection: string;
  businessAnchor: MomentumBuilderBusinessAnchor;
  sparkCardConnection?: string;
  guildConnection?: string;
  galleryOpportunity?: string;
  reflectionQuestion: string;
  practicalBusinessApplication: string;
  efSupportStrategy: MomentumBuilderEfSupportStrategy[];
  estimatedMinutesMin: number;
  estimatedMinutesMax: number;
};

/** Full Builder definition — content + ecosystem edges */
export type MomentumBuilderDefinition = {
  id: string;
  title: string;
  domain: MomentumBuilderDomain;
  primaryCapability: MomentumBuilderCapability;
  secondaryCapability?: MomentumBuilderCapability;
  journeyStages: EntrepreneurialJourneyStage[];
  growthLevel: MomentumBuilderGrowthLevel;
  objectives: MomentumBuilderObjective[];
  estimatedMinutesMin: number;
  estimatedMinutesMax: number;
  reflectionQuestion: string;
  practicalBusinessApplication: string;
  efSupportStrategy: MomentumBuilderEfSupportStrategy[];
  relatedBusinessAssetIds?: string[];
  relatedSparkCardIds?: string[];
  relatedGuildIds?: string[];
  relatedGalleryMemoryIds?: string[];
  allowsCommunityShare?: boolean;
  allowsEstateDiscovery?: boolean;
};

/** Outcomes — success = all three */
export type MomentumBuilderSuccessOutcomes = {
  immediateInsight: boolean;
  realWorldApplication: boolean;
  longTermCapability: boolean;
};

/** Momentum → Card → Asset → Gallery → Guidance */
export type MomentumBuilderLearningChain = {
  momentumBuilderId: string;
  sparkCardId?: string;
  businessAssetId?: string;
  galleryMemoryId?: string;
  guidanceFollowUp?: string;
};
