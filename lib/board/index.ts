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
  VISIBLE_BOARD_DIRECTOR_IDS,
  getThomasEllison,
  isVisibleBoardDirectorId,
  listAllRegisteredBoardDirectors,
  listVisibleBoardDirectors,
} from "@/lib/board/visibleDirectors";
export {
  BOARD_DIRECTOR_DISCUSSIONS_STORAGE_KEY,
  BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS,
  answerIntakeStep,
  buildChairOpeningAndSummary,
  createBoardDirectorDiscussion,
  createEmptyBoardDirectorIntake,
  currentIntakePrompt,
  ensureChairInIntake,
  isIntakeComplete,
  listBoardDirectorDiscussions,
  upsertBoardDirectorDiscussion,
  type BoardDirectorDiscussionIntakeState,
  type BoardDirectorDiscussionRecord,
  type BoardDirectorIntakeStepId,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
