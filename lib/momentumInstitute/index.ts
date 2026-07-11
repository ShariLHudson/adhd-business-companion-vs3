/**
 * Momentum Institute Engine — public API.
 */

export type {
  MemberLearningExperience,
  MakeItMineSession,
  InstituteCabinetItem,
  MemberGrowthProfile,
  MemberCompetencyRecord,
  EvidenceOpportunity,
  InstituteCoachingConversation,
  InstituteMemberState,
} from "./types";

export {
  setInstituteCatalogProvider,
  resetInstituteCatalogProvider,
  loadInstituteCatalog,
  getCatalogIndex,
  getInstituteDefinition,
  getDepartmentById,
  getDrawerById,
  getTopicById,
  getKnowledgeCardById,
  getExperienceDefinitionById,
  listDepartments,
  listDrawersForDepartment,
  listTopicsForDrawer,
  listKnowledgeCardsForTopic,
  listKnowledgeCardsForDrawer,
  listExperiencesForKnowledgeCard,
  listPillars,
  listDepartmentsForPillar,
  getPerspectiveById,
  EMPTY_INSTITUTE_CATALOG,
} from "./catalog/provider";

export {
  resolveExperiencesForKnowledgeCard,
  resolveExperiencesForTopic,
  resolveExperienceById,
  listAvailableExperienceTypesForTopic,
  countCatalogScale,
} from "./experienceResolver";
export type { ResolvedExperienceAvailability } from "./experienceResolver";

export {
  nextLifecycleStage,
  isPermissionGatedStage,
  isAutomaticStage,
  canAdvanceLifecycle,
  defaultLifecycleStagesForExperienceType,
} from "./lifecycle";

export {
  listCabinetItems,
  fileInCabinet,
  cabinetFilingPrompt,
  cabinetLocationLabel,
  clearCabinetForTests,
} from "./cabinetStore";

export {
  getGrowthProfile,
  recordLearningCompletion,
  clearGrowthProfileForTests,
} from "./growthProfileStore";

export {
  startLearningExperience,
  advanceLearningExperience,
  getLearningExperienceById,
  clearLearningExperiencesForTests,
} from "./learningExperienceStore";

export {
  startMakeItMineSession,
  resolveMakeItMineForExperience,
  makeItMineInvitationLine,
} from "./makeItMine";

export {
  createEvidenceOpportunity,
  returnClosingPrompt,
  evidencePermissionPrompt,
  saveEvidenceFromOpportunity,
  clearEvidenceOpportunitiesForTests,
} from "./evidenceBridge";

export {
  journalCapturePrompt,
  createInstituteJournalEntry,
} from "./journalBridge";

export {
  beginInstituteExperience,
  advanceInstituteExperience,
  offerCabinetFiling,
  acceptCabinetFiling,
  acceptJournalCapture,
  offerEvidenceSave,
  acceptEvidenceSave,
  instituteHintForChat,
} from "./instituteOrchestrator";
export type { InstituteOrchestratorTurn } from "./instituteOrchestrator";

export {
  MOMENTUM_INSTITUTE_OBJECT_ID,
  MOMENTUM_INSTITUTE_SECTION,
  getInstituteRegistryMeta,
  instituteEstateInvitation,
} from "./instituteRegistry";

export {
  MOMENTUM_INSTITUTE_ROOM_BG,
  MOMENTUM_INSTITUTE_ROOM_META,
  isMomentumInstituteSection,
} from "./room/instituteRoomRegistry";

export {
  MOMENTUM_INSTITUTE_ARRIVAL,
  MOMENTUM_INSTITUTE_COLLEGES,
  type InstituteCollege,
} from "./room/instituteColleges";

export * from "./drawerWall";

export { TEST_INSTITUTE_CATALOG } from "./catalog/testCatalog";

export * from "./curriculum";

export {
  DEFAULT_TIME_SLOT_EXPERIENCE_MAP,
  timeSlotExperienceTypes,
  timeSlotLabel,
  resolveExperiencesForTimeSlot,
  suggestTimeSlotsForTopic,
} from "./timeAvailability";

export {
  DEFAULT_ECOSYSTEM_LINKS,
  ecosystemDestinationsForExperience,
  experienceSupportsDestination,
  isAutomaticEcosystemDestination,
  isPermissionGatedEcosystemDestination,
} from "./ecosystemLinks";

export {
  SPARK_COMPETENCY_FRAMEWORK_V1,
  perspectivesForTopicSlug,
} from "@/lib/sparkCompetencyFramework/competencyFrameworkV1";

export {
  SPARK_CURRICULUM_MASTER_INDEX,
  getAllCurriculumEntries,
  computeCurriculumStats,
  curriculumMasterIndexToJson,
} from "@/lib/sparkCurriculumMasterIndex";

export {
  loadBusinessBrainCatalog,
  departmentSynthesisContext,
  getKnowledgeCouncil,
} from "@/lib/businessBrain";

export type {
  InstitutePillarId,
  GrowthCompetencyLevel,
  LearningTimeSlotId,
  PersonalLearningEcosystemDestination,
} from "@/lib/sparkCompetencyFramework/types";

export * from "./knowledgeArchitecture";
