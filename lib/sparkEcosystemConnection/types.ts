/**
 * Ecosystem Connection Framework™ (T-014).
 * How experiences connect — one living ecosystem, no dead ends.
 *
 * @see docs/ECOSYSTEM_CONNECTION_FRAMEWORK.md
 */

/** Major Spark experiences in the connection graph */
export type SparkEcosystemExperience =
  | "companion"
  | "guidance"
  | "momentum_builder"
  | "spark_card"
  | "create"
  | "business_asset"
  | "gallery"
  | "estate"
  | "guild"
  | "community"
  | "daily_discoveries"
  | "observatory"
  | "reflection"
  | "business_history";

export const SPARK_ECOSYSTEM_EXPERIENCE_LABELS: Record<
  SparkEcosystemExperience,
  string
> = {
  companion: "Companion",
  guidance: "Guidance",
  momentum_builder: "Momentum Builder",
  spark_card: "Spark Card",
  create: "Create",
  business_asset: "Business Asset",
  gallery: "Gallery",
  estate: "Estate",
  guild: "Guild",
  community: "Community",
  daily_discoveries: "Daily Discoveries",
  observatory: "Observatory",
  reflection: "Reflection",
  business_history: "Business History",
};

/** Living cycle — every completion enriches the next */
export type SparkConnectedExperienceCycleStage =
  | "question"
  | "guidance"
  | "momentum_builder"
  | "spark_card"
  | "business_asset"
  | "gallery"
  | "reflection"
  | "capability_growth"
  | "smarter_guidance";

export const SPARK_CONNECTED_EXPERIENCE_CYCLE_ORDER: readonly SparkConnectedExperienceCycleStage[] =
  [
    "question",
    "guidance",
    "momentum_builder",
    "spark_card",
    "business_asset",
    "gallery",
    "reflection",
    "capability_growth",
    "smarter_guidance",
  ] as const;

/** When gentle guidance typically fires — never interruptive */
export type SparkGentleGuidanceMoment =
  | "after_momentum_builder"
  | "after_spark_card"
  | "after_create"
  | "after_gallery"
  | "after_guidance"
  | "after_daily_discovery"
  | "after_observatory"
  | "after_guild_session"
  | "after_reflection";

export const SPARK_GENTLE_GUIDANCE_BRIDGE_EXAMPLES: Record<
  SparkGentleGuidanceMoment,
  string
> = {
  after_momentum_builder: "You may enjoy this Spark Card.",
  after_spark_card: "A short Builder could help you practice this.",
  after_create: "Would you like to strengthen this with a short Momentum Builder?",
  after_gallery: "Would you like to reflect on what you've learned since then?",
  after_guidance: "Here's one way to put that into practice.",
  after_daily_discovery: "This might connect to something you're building.",
  after_observatory: "Want to explore how this applies to your business?",
  after_guild_session: "Your Guild progress connects here.",
  after_reflection: "When you're ready, we can take the next small step.",
};

/** Personalized connection signals — Brain + graphs supply quietly */
export type SparkEcosystemRecommendationSignals = {
  businessAssetIds?: string[];
  journeyStages?: string[];
  capabilityFocus?: string[];
  currentPriorities?: string[];
  recentConversationThemes?: string[];
  transformationThemes?: string[];
};

/** One primary next step — no dead ends, no five competing CTAs */
export type SparkEcosystemNextRecommendation = {
  fromExperience: SparkEcosystemExperience;
  toExperience: SparkEcosystemExperience;
  bridgeCopy: string;
  targetId?: string;
  businessAssetId?: string;
};

/** T-014 authoring template — required before shipping any feature */
export type SparkEcosystemConnectionSpec = {
  featureName: string;
  leadsFrom: SparkEcosystemExperience[];
  strengthens: SparkEcosystemExperience[];
  naturalNext: SparkEcosystemNextRecommendation;
  businessAssetConnection?: string;
  capabilityStrengthened: string;
  executiveFunctionReduction: string;
  cycleStage?: SparkConnectedExperienceCycleStage;
};

/** Documented edges per experience — reference map */
export const SPARK_ECOSYSTEM_CONNECTION_MAP: Partial<
  Record<SparkEcosystemExperience, readonly SparkEcosystemExperience[]>
> = {
  companion: [
    "guidance",
    "momentum_builder",
    "spark_card",
    "guild",
    "business_asset",
    "gallery",
    "community",
  ],
  momentum_builder: [
    "spark_card",
    "business_asset",
    "gallery",
    "guild",
    "reflection",
  ],
  spark_card: [
    "momentum_builder",
    "business_asset",
    "gallery",
    "guild",
    "community",
    "daily_discoveries",
  ],
  create: [
    "spark_card",
    "momentum_builder",
    "guidance",
    "gallery",
    "reflection",
    "business_history",
  ],
  gallery: ["guidance", "reflection", "momentum_builder", "estate"],
  guild: [
    "momentum_builder",
    "spark_card",
    "business_asset",
    "community",
    "gallery",
    "reflection",
  ],
  daily_discoveries: [
    "spark_card",
    "momentum_builder",
    "business_history",
    "business_asset",
    "reflection",
  ],
  observatory: [
    "create",
    "spark_card",
    "daily_discoveries",
    "momentum_builder",
    "business_asset",
  ],
};

/** Member success signals — ecosystem feels continuous */
export const SPARK_ECOSYSTEM_CONNECTION_SUCCESS_SIGNALS = [
  "always_know_next_step",
  "no_searching",
  "everything_connects",
  "spark_knows_where_im_going",
] as const;

export type SparkEcosystemConnectionSuccessSignal =
  (typeof SPARK_ECOSYSTEM_CONNECTION_SUCCESS_SIGNALS)[number];
