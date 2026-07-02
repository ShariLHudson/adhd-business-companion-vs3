/**
 * Momentum Institute™ — Curriculum Development types.
 *
 * Shari and ChatGPT author content; this system delivers it.
 * Educational content is proprietary IP of Visual Spark Studios.
 *
 * @see docs/momentum-institute/curriculum/README.md
 */

import type { KnowledgeDifficultyLevel } from "@/lib/sparkMomentumInstitute/types";

export const CURRICULUM_ASSET_KINDS = [
  "knowledge-card",
  "business-mastery-minute",
  "apprenticeship",
  "business-lab",
  "simulation",
  "challenge",
  "worksheet",
] as const;

export type CurriculumAssetKind = (typeof CURRICULUM_ASSET_KINDS)[number];

export const CURRICULUM_CARD_STATUSES = [
  "draft",
  "review",
  "published",
  "archived",
] as const;

export type CurriculumCardStatus = (typeof CURRICULUM_CARD_STATUSES)[number];

/** Frontmatter metadata — one Knowledge Card™ markdown file. */
export type CurriculumKnowledgeCardMetadata = {
  id: string;
  title: string;
  college?: string;
  department: string;
  drawer: string;
  competencies: string[];
  difficulty: KnowledgeDifficultyLevel;
  estimated_time: number;
  related_cards?: string[];
  related_apprenticeships?: string[];
  related_business_labs?: string[];
  related_simulations?: string[];
  related_challenges?: string[];
  status: CurriculumCardStatus;
  author: string;
  version: string;
  last_updated: string;
};

/** Fifteen-section Knowledge Card™ body (authored in markdown). */
export type CurriculumKnowledgeCardBody = {
  essentialQuestion: string;
  whyThisMatters: string;
  corePrinciple: string;
  keyIdeas: string[];
  realBusinessExample: string;
  reflectionQuestions: string[];
  makeItMine: string[];
  tryItThisWeek: string;
  commonMistakes: string[];
  relatedCompetencies: string[];
  relatedKnowledgeCards: CurriculumRelatedCardRef[];
  relatedApprenticeships: string[];
};

export type CurriculumRelatedCardRef = {
  id: string;
  relationship?: string;
};

/** Parsed Knowledge Card™ document — metadata + body + source path. */
export type CurriculumKnowledgeCardDocument = {
  kind: "knowledge-card";
  metadata: CurriculumKnowledgeCardMetadata;
  body: CurriculumKnowledgeCardBody;
  /** Relative path from curriculum root — e.g. knowledge-cards/marketing/KC-001.md */
  sourcePath: string;
  rawMarkdown?: string;
};

export type CurriculumRegistryEntry = {
  kind: CurriculumAssetKind;
  id: string;
  /** Path relative to docs/momentum-institute/curriculum/ */
  path: string;
  department?: string;
  drawer?: string;
  status: CurriculumCardStatus;
};

export type CurriculumRegistry = {
  version: string;
  updated_at: string;
  knowledge_cards: CurriculumRegistryEntry[];
  business_mastery_minutes: CurriculumRegistryEntry[];
  apprenticeships: CurriculumRegistryEntry[];
  business_labs: CurriculumRegistryEntry[];
  simulations: CurriculumRegistryEntry[];
  challenges: CurriculumRegistryEntry[];
  worksheets: CurriculumRegistryEntry[];
};

export type CurriculumRegistryStats = {
  total: number;
  published: number;
  draft: number;
  byDepartment: Record<string, number>;
};

/** View model for curriculum delivery components. */
export type KnowledgeCardViewerModel = {
  metadata: CurriculumKnowledgeCardMetadata;
  body: CurriculumKnowledgeCardBody;
  drawerLabel: string;
  departmentLabel: string;
  competencyLabels: string[];
  estimatedMinutes: number;
  difficultyLabel: string;
};

export type BusinessMasteryMinuteModel = {
  title: string;
  essentialQuestion: string;
  corePrinciple: string;
  keyIdeas: string[];
  estimatedMinutes: number;
};

export const CURRICULUM_ROOT_SEGMENT = "docs/momentum-institute/curriculum";
