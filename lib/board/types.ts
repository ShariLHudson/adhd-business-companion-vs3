/**
 * Board of Directors — types for the Round Table Boardroom.
 * Completely separate from the Chamber of Momentum.
 * Do not import Chamber member types into Board definitions.
 */

/** Official destination / group naming (user-facing) */
export const BOARDROOM_DESTINATION_NAME = "Round Table Boardroom" as const;
export const BOARD_GROUP_NAME = "Board of Directors" as const;
export const BOARD_MEMBER_TITLE = "Director" as const;

export const BOARD_PRIMARY_ACTIONS = [
  "Meet the Directors",
  "Bring a Decision to the Board",
  "Review Past Board Discussions",
  "Add the Devil’s Advocate",
  "Return to the Estate",
] as const;

export type BoardPrimaryAction = (typeof BOARD_PRIMARY_ACTIONS)[number];

/**
 * Stable Board Director IDs — never reuse Chamber member IDs.
 */
export const BOARD_DIRECTOR_IDS = [
  "board-chair",
  "vice-chair",
  "founder-advocate",
  "strategy-director",
  "financial-stewardship",
  "operations-capacity",
  "customer-market",
  "growth-opportunity",
  "risk-resilience",
  "technology-future",
  "values-trust",
  "devils-advocate",
] as const;

export type BoardDirectorId = (typeof BOARD_DIRECTOR_IDS)[number];

/** Director response structure used in meetings (Slice 4+) */
export const BOARD_DIRECTOR_RESPONSE_SECTIONS = [
  "Perspective",
  "What I support",
  "What concerns me",
  "What I need to know",
  "My current recommendation",
] as const;

export type BoardDirectorResponseSection =
  (typeof BOARD_DIRECTOR_RESPONSE_SECTIONS)[number];

/**
 * Source of truth for one Director on the Board of Directors.
 * Never derived from Chamber member records.
 */
export type BoardDirectorDefinition = {
  id: BoardDirectorId;
  name: string;
  boardRole: string;
  shortRole: string;
  purpose: string;
  decisionLens: string[];
  questionsAsked: string[];
  tone: string[];
  openingMessage: string;
  responseStructure: BoardDirectorResponseSection[];
  aliases: string[];
  /** Board-only portrait path — never a Chamber asset */
  portraitPath?: string;
  /**
   * Compact Gallery Card art (layout A only) — full designed card image.
   * Never a 3-layout design sheet. Used by Meet the Directors gallery.
   */
  galleryCardPath?: string;
  isCoreDirector: boolean;
  isOptionalDirector: boolean;
  /**
   * How this Director differs from related Chamber specialists.
   * For product clarity — not shown as Chamber data.
   */
  chamberContrast: string;
  /** Example decision this Director would help review */
  exampleDecision: string;
  /** What they watch for in meetings */
  watchesFor: string[];
  /**
   * Profile card narrative — accordion + non-clickable panels.
   * Always registry-driven; never hardcode a Director by name in UI.
   */
  philosophy: string;
  signature: string;
  whatIProtect: string[];
  whenYoullWantMe: string;
  howIWorkWithFounders: string;
  youllEnjoyWorkingWithMeIf: string;
};

export type BoardDiscussionSourceType =
  | "business_estate"
  | "people_i_help"
  | "avatar"
  | "chat"
  | "boardroom";

export type BoardDiscussionContext = {
  sourceType: BoardDiscussionSourceType;
  sourceAreaId?: string;
  sourceStageId?: string;
  avatarId?: string;
  decisionText?: string;
  approvedContext: Record<string, unknown>;
  /** Draft fields must be clearly marked as draft when surfaced */
  draftContext?: Record<string, unknown>;
  returnDestination?: {
    type: string;
    areaId?: string;
    stageId?: string;
    avatarId?: string;
  };
};

/** Calm decision states — never Failed / Overdue / Bad Decision */
export const BOARD_DECISION_STATUSES = [
  "Considering",
  "More Information Needed",
  "Ready to Decide",
  "Decided",
  "Testing First",
  "Paused",
  "Ready for Review",
] as const;

export type BoardDecisionStatus = (typeof BOARD_DECISION_STATUSES)[number];

export const BOARD_DISCUSSIONS_STORAGE_KEY =
  "companion-board-discussions-v1" as const;

export const BOARD_MAY_AUTO_UPDATE_PROFILE = false as const;
export const BOARD_MAY_AUTO_UPDATE_AVATAR = false as const;
export const BOARD_MAY_AUTO_OPEN_CHAMBER = false as const;
export const BOARD_MAY_AUTO_ADD_DEVILS_ADVOCATE = false as const;

/** Core meeting group when user chooses “Use the Core Board” */
export const CORE_BOARD_DIRECTOR_IDS: readonly BoardDirectorId[] = [
  "board-chair",
  "vice-chair",
  "founder-advocate",
  "strategy-director",
  "financial-stewardship",
  "customer-market",
  "operations-capacity",
] as const;

export type BoardDirectorRecommendation = {
  directorIds: BoardDirectorId[];
  rationaleByDirector: Partial<Record<BoardDirectorId, string>>;
  offerDevilsAdvocate: boolean;
  offerDevilsAdvocateReason?: string;
};
