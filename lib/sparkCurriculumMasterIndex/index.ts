export type {
  CurriculumMasterIndex,
  CurriculumMasterIndexEntry,
  CurriculumExperienceKind,
  CurriculumIndexStats,
} from "./types";

export {
  CURRICULUM_INDEX_VERSION,
  CURRICULUM_EXPERIENCE_KINDS,
  CURRICULUM_EXPERIENCE_LABELS,
} from "./types";

export { CURRICULUM_COMPETENCY_SLUGS } from "./competencies";
export type { CurriculumCompetencySlug } from "./competencies";

export {
  buildCurriculumEntry,
  EXPERIENCE_BUNDLES,
} from "./buildEntry";
export type { BuildCurriculumEntryInput } from "./buildEntry";

export {
  SPARK_CURRICULUM_MASTER_INDEX,
  getAllCurriculumEntries,
  getCurriculumByPillar,
  getCurriculumByDepartment,
  getCurriculumByDrawer,
  getCurriculumEntryById,
  getCurriculumEntryBySlug,
  computeCurriculumStats,
  curriculumMasterIndexToJson,
  curriculumEntryToKnowledgeCardSeed,
} from "./masterIndex";

export { BUILD_YOURSELF_CURRICULUM } from "./curriculum/buildYourself";
export { BUILD_YOUR_BUSINESS_CURRICULUM } from "./curriculum/buildYourBusiness";
export { BUILD_YOUR_THINKING_CURRICULUM } from "./curriculum/buildYourThinking";
export { BUILD_YOUR_LEGACY_CURRICULUM } from "./curriculum/buildYourLegacy";
