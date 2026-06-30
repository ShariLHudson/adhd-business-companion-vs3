/**
 * Gallery™ Framework (T-015).
 * Philosophy and architecture — preserves transformation, not activity.
 * Runtime wall frames: lib/gallery/types.ts (V1 hallway implementation).
 *
 * @see docs/GALLERY_FRAMEWORK.md
 */

/** Gallery Categories™ — seven preservation lenses */
export type GalleryCategory =
  | "milestones"
  | "breakthroughs"
  | "reflections"
  | "decisions"
  | "business_assets"
  | "discovery"
  | "seasons";

export const GALLERY_CATEGORIES: readonly GalleryCategory[] = [
  "milestones",
  "breakthroughs",
  "reflections",
  "decisions",
  "business_assets",
  "discovery",
  "seasons",
] as const;

export const GALLERY_CATEGORY_LABELS: Record<GalleryCategory, string> = {
  milestones: "Milestones",
  breakthroughs: "Breakthroughs",
  reflections: "Reflections",
  decisions: "Decisions",
  business_assets: "Business Assets",
  discovery: "Discovery",
  seasons: "Seasons",
};

/** Moments that may belong in Gallery — significance over quantity */
export type GalleryPreserveableMoment =
  | "business_asset"
  | "major_decision"
  | "momentum_breakthrough"
  | "guild_milestone"
  | "spark_card_discovery"
  | "business_anniversary"
  | "launch"
  | "pivot"
  | "recovery_moment"
  | "personal_reflection"
  | "business_lesson"
  | "founder_story"
  | "creative_breakthrough"
  | "rare_discovery"
  | "estate_memory"
  | "observatory_insight";

export const GALLERY_PRESERVEABLE_MOMENTS: readonly GalleryPreserveableMoment[] = [
  "business_asset",
  "major_decision",
  "momentum_breakthrough",
  "guild_milestone",
  "spark_card_discovery",
  "business_anniversary",
  "launch",
  "pivot",
  "recovery_moment",
  "personal_reflection",
  "business_lesson",
  "founder_story",
  "creative_breakthrough",
  "rare_discovery",
  "estate_memory",
  "observatory_insight",
] as const;

/** What should NOT be recorded in Gallery */
export type GalleryExcludedActivity =
  | "every_click"
  | "every_session"
  | "every_builder_completed"
  | "routine_navigation"
  | "minor_action";

export const GALLERY_EXCLUDED_ACTIVITIES: readonly GalleryExcludedActivity[] = [
  "every_click",
  "every_session",
  "every_builder_completed",
  "routine_navigation",
  "minor_action",
] as const;

/** Reflection Prompts™ — deepen memory without guilt */
export const GALLERY_REFLECTION_PROMPTS = [
  "What changed because of this?",
  "What did you learn?",
  "What would you tell your past self?",
  "What deserves remembering?",
] as const;

export type GalleryReflectionPrompt = (typeof GALLERY_REFLECTION_PROMPTS)[number];

/** Search & discovery dimensions */
export type GallerySearchDimension =
  | "business_assets"
  | "capabilities"
  | "journey_stages"
  | "years"
  | "categories"
  | "topics"
  | "people"
  | "projects";

export const GALLERY_SEARCH_DIMENSIONS: readonly GallerySearchDimension[] = [
  "business_assets",
  "capabilities",
  "journey_stages",
  "years",
  "categories",
  "topics",
  "people",
  "projects",
] as const;

/** Business Asset™ story preserved in Gallery */
export type GalleryBusinessAssetStory = {
  businessAssetId: string;
  createdAt: string;
  majorRevisionDates?: string[];
  launchDates?: string[];
  lessons?: string[];
  relatedSparkCardIds?: string[];
  relatedMomentumBuilderIds?: string[];
};

/** Gallery Preservation Gate™ — before writing any memory */
export const GALLERY_PRESERVATION_QUESTIONS = [
  "Should this become part of Gallery?",
  "What category?",
  "Why does it matter?",
  "How will it help the member in the future?",
  "How could future Guidance use this memory?",
] as const;

export type SparkGalleryPreservationGate = {
  shouldPreserve: boolean;
  category?: GalleryCategory;
  significanceRationale?: string;
  futureMemberBenefit?: string;
  guidanceReuseHook?: string;
};

/** Success Standard — observable member thoughts */
export type GallerySuccessSignal =
  | "forgot_id_done_that"
  | "actually_grown"
  | "learned_more_than_realized"
  | "building_something_meaningful";

export const GALLERY_SUCCESS_SIGNALS: readonly GallerySuccessSignal[] = [
  "forgot_id_done_that",
  "actually_grown",
  "learned_more_than_realized",
  "building_something_meaningful",
] as const;

/** Companion reference patterns — natural, never surveilled */
export const GALLERY_COMPANION_REFERENCE_EXAMPLES = [
  "Do you remember…",
  "You've actually solved something similar before.",
  "One of your favorite ideas came from…",
] as const;

/** Gallery spec template — design-time gate for features that may preserve memories */
export type SparkGallerySpec = {
  category: GalleryCategory;
  significanceRationale: string;
  transformationNarrative: string;
  relatedBusinessAssetId?: string;
  relatedSparkCardId?: string;
  relatedMomentumBuilderId?: string;
  reflectionPrompt?: GalleryReflectionPrompt;
  guidanceReuseHook?: string;
  executiveFunctionBenefit: string;
};
