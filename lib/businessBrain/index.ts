export type {
  BusinessBrainCatalog,
  BusinessBrainCatalogIndex,
  KnowledgeCouncil,
  KnowledgeSource,
  SchoolOfThought,
  ResearchDiscipline,
  BrainPillar,
  BrainDepartment,
  BrainDrawer,
  BrainCompetency,
  BrainCurriculumTopic,
  BrainKnowledgeCard,
  BrainLearningExperience,
  BrainLearningExperienceBase,
  BusinessMasteryMinute,
  BusinessLab,
  Simulation,
  Challenge,
  Apprenticeship,
  BrainExperienceKind,
} from "./types";

export { BUSINESS_BRAIN_VERSION, BRAIN_EXPERIENCE_KINDS } from "./types";

export {
  buildKnowledgeCouncil,
  RESEARCH_DISCIPLINES,
  KNOWLEDGE_SOURCES,
  SCHOOLS_OF_THOUGHT,
  DEPARTMENT_COUNCIL_SEEDS,
  buildVerifiedKnowledgeSource,
} from "./knowledgeCouncil";

export { buildBusinessBrainCatalog } from "./catalog/buildCatalog";
export { buildBusinessBrainIndex } from "./catalog/catalogIndex";

export {
  setBusinessBrainProvider,
  resetBusinessBrainProvider,
  loadBusinessBrainCatalog,
  getBusinessBrainIndex,
  getKnowledgeCouncil,
  getBrainDepartment,
  getBrainKnowledgeCard,
  listSchoolsForDepartment,
  listSourcesForDepartment,
  listTeachingSourcesForDepartment,
  departmentSynthesisContext,
} from "./catalog/provider";
export type { BusinessBrainProvider } from "./catalog/provider";

export * from "./sourceIntegrity";
