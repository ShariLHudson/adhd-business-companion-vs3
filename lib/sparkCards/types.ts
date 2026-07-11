/**
 * Spark Card Framework — living entrepreneurial wisdom (T-011).
 * Not collectible rewards; every card must strengthen capability and enable application.
 *
 * @see docs/SPARK_CARD_FRAMEWORK.md
 */

import type { EntrepreneurialJourneyStage } from "@/lib/sparkFounderJourney/types";

/** Knowledge domain — extend as library grows */
export type SparkCardCategory =
  | "marketing"
  | "sales"
  | "leadership"
  | "communication"
  | "strategy"
  | "decision_making"
  | "innovation"
  | "finance"
  | "operations"
  | "ai"
  | "customer_psychology"
  | "behavioral_economics"
  | "negotiation"
  | "productivity"
  | "executive_function"
  | "business_history"
  | "mental_models"
  | "systems_thinking"
  | "branding"
  | "personal_growth";

export const SPARK_CARD_CATEGORY_LABELS: Record<SparkCardCategory, string> = {
  marketing: "Marketing",
  sales: "Sales",
  leadership: "Leadership",
  communication: "Communication",
  strategy: "Strategy",
  decision_making: "Decision Making",
  innovation: "Innovation",
  finance: "Finance",
  operations: "Operations",
  ai: "AI",
  customer_psychology: "Customer Psychology",
  behavioral_economics: "Behavioral Economics",
  negotiation: "Negotiation",
  productivity: "Productivity",
  executive_function: "Executive Function",
  business_history: "Business History",
  mental_models: "Mental Models",
  systems_thinking: "Systems Thinking",
  branding: "Branding",
  personal_growth: "Personal Growth",
};

/** Capability strengthened — no card without at least one */
export type SparkCardCapabilityDomain =
  | "decision_making"
  | "marketing"
  | "leadership"
  | "executive_function"
  | "pricing"
  | "storytelling"
  | "research"
  | "branding"
  | "innovation"
  | "ai_fluency"
  | "sales"
  | "communication"
  | "strategic_thinking"
  | "operations"
  | "financial_thinking"
  | "customer_understanding"
  | "negotiation"
  | "systems_thinking"
  | "reflection"
  | "teaching";

export type SparkCardDifficulty = "foundational" | "intermediate" | "advanced";

export type SparkCardDiscoveryKind =
  | "library"
  | "asset_context"
  | "momentum"
  | "estate"
  | "anniversary"
  | "reflection"
  | "community"
  | "historic_date"
  | "daily_discovery";

/** Five questions every card must answer */
export type SparkCardFiveQuestions = {
  whatIsIt: string;
  whyItMatters: string;
  howItAppliesGenerally: string;
  /** Business Brain personalizes at runtime */
  howItAppliesToThisBusiness: string;
  whatToDoNext: string;
};

/** How the Companion surfaces a card — never transactional */
export type SparkCardCompanionIntroduction =
  | "conversational_bridge"
  | "asset_building_context"
  | "guidance_follow_up"
  | "reflection_prompt"
  | "curiosity_discovery";

export const SPARK_CARD_COMPANION_INTRO_EXAMPLES: Record<
  SparkCardCompanionIntroduction,
  string
> = {
  conversational_bridge:
    "This idea reminds me of something that might help...",
  asset_building_context:
    "While you're shaping this, there's a principle worth keeping nearby...",
  guidance_follow_up:
    "One way entrepreneurs often handle this...",
  reflection_prompt:
    "Something you figured out before connects here...",
  curiosity_discovery:
    "I came across something you might enjoy exploring...",
};

/** Signals for Personalization — Brain supplies; card template stays stable */
export type SparkCardPersonalizationSignals = {
  businessAssetIds?: string[];
  audienceSummary?: string;
  activeProjectIds?: string[];
  recentConversationThemes?: string[];
  goalIds?: string[];
  experienceLevel?: "early" | "developing" | "experienced";
  journeyStages?: EntrepreneurialJourneyStage[];
};

/** Full card anatomy — content + ecosystem connections */
export type SparkCardDefinition = {
  id: string;
  title: string;
  category: SparkCardCategory;
  capabilityDomains: SparkCardCapabilityDomain[];
  difficulty: SparkCardDifficulty;
  /** Journey alignment — not a gate */
  journeyStages: EntrepreneurialJourneyStage[];
  estimatedReadingMinutes: number;
  fiveQuestions: SparkCardFiveQuestions;
  businessExamples: string[];
  reflectionQuestion?: string;
  suggestedNextStep: string;
  relatedCardIds?: string[];
  relatedMomentumBuilderIds?: string[];
  relatedBusinessAssetKinds?: string[];
  relatedGuildIds?: string[];
  relatedGalleryMemoryIds?: string[];
  relatedDailyDiscoveryIds?: string[];
  collectionIds?: string[];
  discoveryKind?: SparkCardDiscoveryKind;
  isRareDiscovery?: boolean;
};

/** T-011 authoring template — required before creating a card */
export type SparkCardSpec = {
  cardId: string;
  title: string;
  capabilityDomains: SparkCardCapabilityDomain[];
  journeyStages: EntrepreneurialJourneyStage[];
  businessAssetConnections: string;
  momentumBuilderConnections?: string;
  guildConnections?: string;
  galleryOpportunities?: string;
  companionIntroduction: SparkCardCompanionIntroduction;
  personalizationOpportunities: string;
  practicalImplementation: string;
};

/** Named collections — organize knowledge, not status */
export type SparkCardCollectionId =
  | "marketing_mastery"
  | "leadership_library"
  | "decision_toolkit"
  | "creative_thinking"
  | "workshop_builder"
  | "pricing"
  | "ai"
  | "brand"
  | "customer_experience";

export const SPARK_CARD_COLLECTION_LABELS: Record<SparkCardCollectionId, string> = {
  marketing_mastery: "Marketing Mastery",
  leadership_library: "Leadership Library",
  decision_toolkit: "Decision Toolkit",
  creative_thinking: "Creative Thinking",
  workshop_builder: "Workshop Builder",
  pricing: "Pricing",
  ai: "AI",
  brand: "Brand",
  customer_experience: "Customer Experience",
};

/** Momentum → Card → Asset → Gallery → Guidance chain */
export type SparkCardLearningChain = {
  momentumBuilderId?: string;
  sparkCardId: string;
  businessAssetId?: string;
  galleryMemoryId?: string;
  guidanceFollowUp?: string;
};
