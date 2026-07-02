/**
 * Spark Competency Framework™ v1.0
 * The Four Pillars of Entrepreneurial Mastery.
 *
 * Everything in the Momentum Institute™ belongs to one pillar.
 * Capability growth — not gamification.
 *
 * @see lib/sparkCompetencyFramework/competencyFrameworkV1.ts
 */

export const COMPETENCY_FRAMEWORK_VERSION = "1.0.0" as const;

/** The Four Pillars of Entrepreneurial Mastery */
export const INSTITUTE_PILLAR_IDS = [
  "build_yourself",
  "build_your_business",
  "build_your_thinking",
  "build_your_legacy",
] as const;

export type InstitutePillarId = (typeof INSTITUTE_PILLAR_IDS)[number];

export const INSTITUTE_PILLAR_LABELS: Record<InstitutePillarId, string> = {
  build_yourself: "Build Yourself",
  build_your_business: "Build Your Business",
  build_your_thinking: "Build Your Thinking",
  build_your_legacy: "Build Your Legacy",
};

export const INSTITUTE_PILLAR_TAGLINES: Record<InstitutePillarId, string> = {
  build_yourself: "Become the entrepreneur your business needs.",
  build_your_business: "Create a business that works.",
  build_your_thinking: "Develop the way exceptional entrepreneurs think.",
  build_your_legacy: "Turn knowledge into lasting impact.",
};

export type InstitutePillarDefinition = {
  id: InstitutePillarId;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  departmentIds: string[];
  sortOrder: number;
  iconKey?: string;
};

/**
 * Competency levels v1.0 — capability progression, not points.
 * Suggested progression: Exploring → … → Mentoring
 */
export const GROWTH_COMPETENCY_LEVEL_IDS = [
  "exploring",
  "understanding",
  "practicing",
  "applying",
  "confident",
  "mastering",
  "mentoring",
] as const;

export type GrowthCompetencyLevel =
  (typeof GROWTH_COMPETENCY_LEVEL_IDS)[number];

export const GROWTH_COMPETENCY_LEVEL_LABELS: Record<
  GrowthCompetencyLevel,
  string
> = {
  exploring: "Exploring",
  understanding: "Understanding",
  practicing: "Practicing",
  applying: "Applying",
  confident: "Confident",
  mastering: "Mastering",
  mentoring: "Mentoring",
};

/** Legacy v0 levels — map to v1 for migrated profiles */
export const LEGACY_COMPETENCY_LEVEL_MAP: Record<string, GrowthCompetencyLevel> =
  {
    emerging: "exploring",
    developing: "understanding",
    capable: "practicing",
    confident: "confident",
    mastered: "mastering",
  };

export function normalizeCompetencyLevel(
  level: string,
): GrowthCompetencyLevel {
  if ((GROWTH_COMPETENCY_LEVEL_IDS as readonly string[]).includes(level)) {
    return level as GrowthCompetencyLevel;
  }
  return LEGACY_COMPETENCY_LEVEL_MAP[level] ?? "exploring";
}

export function nextCompetencyLevel(
  current: GrowthCompetencyLevel,
): GrowthCompetencyLevel {
  const idx = GROWTH_COMPETENCY_LEVEL_IDS.indexOf(current);
  if (idx < 0 || idx >= GROWTH_COMPETENCY_LEVEL_IDS.length - 1) {
    return current;
  }
  return GROWTH_COMPETENCY_LEVEL_IDS[idx + 1]!;
}

/**
 * Spark Knowledge Perspectives™ — disciplines that inform a topic.
 * Not organized around famous people; Spark's own voice.
 */
export type KnowledgePerspectiveDefinition = {
  id: string;
  slug: string;
  title: string;
  description: string;
};

/** Time-respecting experience offers */
export const LEARNING_TIME_SLOT_IDS = [
  "5_min",
  "15_min",
  "30_min",
  "60_plus",
  "multi_week",
] as const;

export type LearningTimeSlotId = (typeof LEARNING_TIME_SLOT_IDS)[number];

export const LEARNING_TIME_SLOT_LABELS: Record<LearningTimeSlotId, string> = {
  "5_min": "About 5 minutes",
  "15_min": "About 15 minutes",
  "30_min": "About 30 minutes",
  "60_plus": "An hour or more",
  multi_week: "Several weeks",
};

/**
 * Personal Learning Ecosystem™ — destinations learning connects to.
 * References only — no duplicate content.
 */
export const PERSONAL_LEARNING_ECOSYSTEM_DESTINATIONS = [
  "institute_cabinet",
  "journal",
  "make_it_mine",
  "evidence_vault",
  "growth_profile",
  "portfolio",
] as const;

export type PersonalLearningEcosystemDestination =
  (typeof PERSONAL_LEARNING_ECOSYSTEM_DESTINATIONS)[number];

export const PERSONAL_LEARNING_ECOSYSTEM_LABELS: Record<
  PersonalLearningEcosystemDestination,
  string
> = {
  institute_cabinet: "My Institute Cabinet™",
  journal: "Journal™",
  make_it_mine: "Make It Mine™",
  evidence_vault: "Evidence Vault™",
  growth_profile: "Growth Profile™",
  portfolio: "Portfolio™",
};

/** Standard drawer contents — every drawer can offer these experience types */
export const DRAWER_STANDARD_EXPERIENCE_KINDS = [
  "knowledge_card",
  "business_mastery_minute",
  "deep_lesson",
  "apprenticeship",
  "business_lab",
  "simulation",
  "strategy_collection",
  "thinking_gym",
  "challenge",
  "coaching_session",
  "reflection",
] as const;

export type DrawerStandardExperienceKind =
  (typeof DRAWER_STANDARD_EXPERIENCE_KINDS)[number];

export type CompetencyFrameworkDepartmentSeed = {
  id: string;
  pillarId: InstitutePillarId;
  slug: string;
  title: string;
  sortOrder: number;
};

export type CompetencyFrameworkDrawerSeed = {
  id: string;
  departmentId: string;
  pillarId: InstitutePillarId;
  slug: string;
  title: string;
  sortOrder: number;
};

export type SparkCompetencyFrameworkV1 = {
  version: typeof COMPETENCY_FRAMEWORK_VERSION;
  pillars: InstitutePillarDefinition[];
  departments: CompetencyFrameworkDepartmentSeed[];
  exampleDrawers: CompetencyFrameworkDrawerSeed[];
  perspectives: KnowledgePerspectiveDefinition[];
};
