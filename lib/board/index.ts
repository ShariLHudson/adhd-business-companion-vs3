/**
 * Board of Directors — public exports (Slice 1).
 * Separate from Chamber of Momentum and legacy advisory boardMembers.
 */

export * from "@/lib/board/types";
export {
  BOARD_DIRECTOR_ASSET_BASE,
  BOARD_DIRECTORS,
  ensureChairIncluded,
  getBoardDirectorById,
  getDevilsAdvocate,
  isBoardDirectorId,
  listBoardDirectors,
  listCoreBoardDirectors,
  listOptionalBoardDirectors,
  resolveBoardDirectorAlias,
  resolveBoardDirectorGalleryCardPath,
  resolveBoardDirectorPortraitPath,
} from "@/lib/board/boardDirectorRegistry";
export {
  BOARD_DIRECTOR_ACCORDION_SECTION_IDS,
  getDirectorAccordionSections,
  toggleDirectorAccordion,
  type BoardDirectorAccordionSection,
  type BoardDirectorAccordionSectionId,
} from "@/lib/board/directorAccordion";
export { BOARD_DIRECTOR_NARRATIVES } from "@/lib/board/directorProfileNarratives";
export {
  recommendBoardDirectorsForDecision,
  recommendationIncludesDevilsAdvocateAutomatically,
} from "@/lib/board/recommendBoardDirectors";
export * from "@/lib/board/meetDirector";
export * from "@/lib/board/boardReview";
export * from "@/lib/board/roundTable";
export * from "@/lib/board/relationships";
export {
  createEmptyDirectorSessionStore,
  getDirectorSessionView,
  getRememberedConversation,
  rememberDirectorConversation,
  setDirectorAccordionOpen,
  setDirectorPortraitEnlarged,
  type DirectorSessionStore,
  type DirectorSessionViewState,
} from "@/lib/board/directorSessionStore";
export {
  THOMAS_ELLISON_DIRECTOR_ID,
  SHARI_MENON_DIRECTOR_ID,
  MARCUS_WHITAKER_DIRECTOR_ID,
  DAVID_KIM_DIRECTOR_ID,
  MAYA_CHEN_DIRECTOR_ID,
  CARLOS_RIVERA_DIRECTOR_ID,
  MATEO_VARGAS_DIRECTOR_ID,
  VISIBLE_BOARD_DIRECTOR_IDS,
  getThomasEllison,
  getShariMenon,
  getMarcusWhitaker,
  getDavidKim,
  getMayaChen,
  getCarlosRivera,
  getMateoVargas,
  isVisibleBoardDirectorId,
  listAllRegisteredBoardDirectors,
  listVisibleBoardDirectors,
} from "@/lib/board/visibleDirectors";
export {
  BOARD_DIRECTOR_DISCUSSIONS_STORAGE_KEY,
  BOARD_DIRECTOR_INTAKE_DRAFT_STORAGE_KEY,
  BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS,
  BOARD_INTAKE_QUESTION_STEPS,
  answerBoardIntakeStep,
  answerIntakeStep,
  advanceDraftToReady,
  buildChairOpeningAndSummary,
  clearBoardIntakeDraft,
  createBoardDirectorDiscussion,
  createBoardDirectorDiscussionFromDraft,
  createEmptyBoardDirectorIntake,
  createEmptyBoardIntakeDraft,
  currentIntakePrompt,
  draftToAnswerRecord,
  draftToLegacyState,
  ensureChairInDraft,
  ensureChairInIntake,
  isIntakeComplete,
  isIntakeReadyForReview,
  isQuestionIntakeStep,
  legacyStateToDraft,
  loadBoardIntakeDraft,
  listBoardDirectorDiscussions,
  markDraftInDiscussion,
  parseOptionsAnswer,
  questionStepNumber,
  resolveInitialBoardIntakeDraft,
  saveBoardIntakeDraft,
  setDraftStep,
  updateDraftDirectors,
  upsertBoardDirectorDiscussion,
  type BoardDiscussionContext,
  type BoardDiscussionIntakeDraft,
  type BoardDirectorDiscussionIntakeState,
  type BoardDirectorDiscussionRecord,
  type BoardDirectorIntakeStepId,
  type BoardIntakeStep,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
