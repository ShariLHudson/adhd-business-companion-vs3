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
  BOARD_DIRECTOR_PRIMARY_ACCORDION_SECTION_IDS,
  BOARD_DIRECTOR_MORE_ACCORDION_SECTION_IDS,
  getDirectorAccordionSections,
  getDirectorPrimaryAccordionSections,
  getDirectorMoreAccordionSections,
  toggleDirectorAccordion,
  type BoardDirectorAccordionSection,
  type BoardDirectorAccordionSectionId,
} from "@/lib/board/directorAccordion";
export { BOARD_DIRECTOR_NARRATIVES } from "@/lib/board/directorProfileNarratives";
export {
  recommendBoardDirectorsForDecision,
  recommendationIncludesDevilsAdvocateAutomatically,
  coreBoardDirectorIds,
  recommendedMatchesCoreBoard,
} from "@/lib/board/recommendBoardDirectors";
export {
  DIRECTOR_RESPONSE_PROFILES,
  SHARED_PROHIBITED_BOARD_PHRASES,
  getDirectorResponseProfile,
  type DirectorResponseProfile,
} from "@/lib/board/directorResponseProfiles";
export { buildDirectorPerspectiveText } from "@/lib/board/buildDirectorPerspectiveText";
export {
  matterIdFromTopic,
  relatedWorkFromBoardDecision,
  type RelatedMatterReference,
  type RelatedMatterSourceType,
} from "@/lib/board/relatedMatter";
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
  acceptBoardRecommendation,
  buildBoardDiscussionTurns,
  buildChairOpeningAndSummary,
  buildDecisionRecordFromDiscussion,
  buildDirectorPerspectiveTurns,
  clearBoardIntakeDraft,
  createBoardDirectorDiscussion,
  createBoardDirectorDiscussionFromDraft,
  createEmptyBoardDirectorIntake,
  createEmptyBoardIntakeDraft,
  currentIntakePrompt,
  draftToAnswerRecord,
  draftToLegacyState,
  advanceDecisionToReview,
  canBeginBoardDiscussion,
  ensureChairInDraft,
  ensureChairInIntake,
  formatOptionalAnswerForDisplay,
  isIntakeComplete,
  skipBoardIntakeStep,
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
  type BoardDecisionRecord,
  type BoardDiscussionContext,
  type BoardDiscussionIntakeDraft,
  type BoardDirectorDiscussionIntakeState,
  type BoardDirectorDiscussionRecord,
  type BoardDirectorDiscussionTurn,
  type BoardDirectorIntakeStepId,
  type BoardIntakeStep,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
export {
  buildCallTheBoardContext,
  prepareCallTheBoard,
  peekCallTheBoard,
  consumeCallTheBoard,
  CALL_THE_BOARD_STORAGE_KEY,
  type CallTheBoardPayload,
} from "@/lib/board/callTheBoard";
export {
  boardMemberAddressPromptInstruction,
  boardPossessiveMatter,
  resolveAddressNameForBoard,
  resolveBoardAddressName,
  type BoardAddressNameSource,
  type BoardMatterKind,
  type BoardPersonalizationOptions,
} from "@/lib/board/resolveBoardAddressName";
export {
  BOARD_OUTCOME_PRIMARY,
  BOARD_OUTCOME_SECONDARY,
  BOARD_OUTCOME_VISIBLE_SECONDARY,
  BOARD_OUTCOME_NEXT_STEP_CHOICES,
  BOARD_OUTCOME_MORE,
  nextRevealCount,
  recommendNextStepDestination,
  visibleSecondaryOutcomeActions,
  type BoardOutcomePrimaryActionId,
  type BoardOutcomeNextStepChoiceId,
  type BoardOutcomeSecondaryActionId,
} from "@/lib/board/boardDiscussion/boardOutcomeActions";
export { synthesizeBoardDecisionRecord } from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
