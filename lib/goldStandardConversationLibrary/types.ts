/**
 * Talk It Out Gold Standard Conversation Library — package 194.
 * Reference corpus for reflective conversation quality — not rigid scripts.
 */

export type GscCategory =
  | "business-decision"
  | "marketing-sales"
  | "overwhelm"
  | "confidence"
  | "clients"
  | "creative-thinking"
  | "repairs"
  | "topic-continuity"
  | "conversation-endings"
  | "personal-practical";

export type GscConversationalMove =
  | "clarify_why_now"
  | "clarify_desired_outcome"
  | "identify_concern"
  | "distinguish_two_uncertainties"
  | "summarize_emerging_picture"
  | "check_understanding"
  | "repair_misunderstanding"
  | "return_to_topic"
  | "reflect_a_tension"
  | "narrow_the_decision"
  | "explore_success_looks_like"
  | "identify_what_is_known"
  | "close_with_useful_summary"
  | "accept_correction"
  | "grounded_opening_question"
  | "role_clarity"
  | "other";

export type GscTurnRole = "user" | "assistant";

export type GscTurn = {
  role: GscTurnRole;
  content: string;
  /** Primary move for assistant turns */
  move?: GscConversationalMove;
  /** Why this turn works (authoring / QA) */
  whyItWorks?: string;
  /** What this turn avoids */
  avoids?: string[];
  /** Internal state updates (never shown to members) */
  stateUpdates?: string[];
};

export type GscQualityCert = {
  topicAnchorExplicit: boolean;
  firstResponseGrounded: boolean;
  noUnsupportedHiddenMeaning: boolean;
  questionsFollowUserTurns: boolean;
  noRepeatedAnsweredInfo: boolean;
  acknowledgementsNameSubject: boolean;
  userNotGivenAnswer: boolean;
  increasingClarity: boolean;
  notScripted: boolean;
  rhythmVaries: boolean;
  repairsAccountable: boolean;
  shortRepliesDoNotOverwriteTopic: boolean;
  endingUsefulAndOptional: boolean;
  meetsTwelveOfTen: boolean;
};

export type GoldStandardConversation = {
  id: string;
  title: string;
  category: GscCategory;
  categoryPath: string;
  userIntent: string;
  conversationGoal: string;
  topicAnchor: string;
  initialKnown: string[];
  initialUnknown: string[];
  risks: string[];
  turns: GscTurn[];
  blockedAlternatives: { text: string; reason: string }[];
  runtimeTags: string[];
  quality: GscQualityCert;
  batch?: number;
};

export type GscRetrievalInput = {
  topicAnchor?: string | null;
  userText: string;
  conversationPhase?: string;
  knownConcerns?: string[];
  rejectedInterpretations?: string[];
  previousAssistantText?: string | null;
  clarificationOrRepair?: boolean;
  tags?: string[];
};

export type GscRetrievalHit = {
  conversation: GoldStandardConversation;
  score: number;
  matchedTags: string[];
};

export type GscRetrievalResult = {
  hits: GscRetrievalHit[];
  suggestedMove: GscConversationalMove | null;
  blockedFailurePatterns: string[];
  likelyNextQuestionType: string | null;
  responseLengthGuidance: "brief" | "medium" | "expanded";
  confidence: number;
  /** Structural hints only — never copy full example text verbatim */
  structureHints: string[];
};

export const ALL_QUALITY_PASS: GscQualityCert = {
  topicAnchorExplicit: true,
  firstResponseGrounded: true,
  noUnsupportedHiddenMeaning: true,
  questionsFollowUserTurns: true,
  noRepeatedAnsweredInfo: true,
  acknowledgementsNameSubject: true,
  userNotGivenAnswer: true,
  increasingClarity: true,
  notScripted: true,
  rhythmVaries: true,
  repairsAccountable: true,
  shortRepliesDoNotOverwriteTopic: true,
  endingUsefulAndOptional: true,
  meetsTwelveOfTen: true,
};
