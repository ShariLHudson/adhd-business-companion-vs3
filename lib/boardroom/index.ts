export type * from "./types";

export {
  BOARDROOM_STORAGE_KEY,
  loadBoardroomDiscussions,
  listBoardroomDiscussions,
  getBoardroomDiscussion,
  upsertBoardroomDiscussion,
  deleteBoardroomDiscussion,
  recentBoardroomDiscussions,
} from "./store";

export {
  recommendBestBoard,
  resolveBoardMembers,
  listAllBoardMembers,
  memberPerspectiveLabel,
} from "./recommendBoard";

export {
  titleFromSituation,
  generateOpeningDiscussion,
  generateDecisionBrief,
  appendMemberContext,
  askBoardMemberTurn,
  challengeViewTurn,
  exploreOptionTurn,
  emptyBrief,
} from "./generateDiscussion";

export const BOARDROOM_ROOM_BG =
  "/backgrounds/round-table-boardroom-background.png";

export const BOARDROOM_PURPOSE =
  "Explore an important decision, problem, opportunity, or idea through several selected perspectives — without anyone choosing for you.";

export {
  BOARDROOM_WELCOME_MESSAGE,
  BOARDROOM_HOME_PRIMARY_CHOICES,
  BOARDROOM_HOW_TO_USE_POINTS,
  BOARDROOM_HOW_TO_SUMMARY_LABEL,
  BOARDROOM_CHAMBER_CONTRAST_BLURB,
  resolveBoardroomEntryIntent,
  boardroomViewFromEntryIntent,
  shouldOpenThomasFromEntry,
  shouldOpenShariFromEntry,
  shouldOpenMarcusFromEntry,
  shouldOpenDavidFromEntry,
  shouldOpenMayaFromEntry,
  shouldOpenCarlosFromEntry,
  shouldOpenMateoFromEntry,
  type BoardroomEntryIntent,
  type BoardroomHomePrimaryChoiceId,
} from "./boardroomEntry";

export const DISCUSSION_STYLE_META = {
  "quick-review": {
    label: "Quick Review",
    description: "A few clear lenses — enough to see the shape of the decision.",
  },
  "full-discussion": {
    label: "Full Discussion",
    description: "Distinct perspectives, agreements, disagreements, and open questions.",
  },
  "challenge-thinking": {
    label: "Challenge My Thinking",
    description: "Pressure-test assumptions kindly — find the weak spots before you commit.",
  },
} as const;
