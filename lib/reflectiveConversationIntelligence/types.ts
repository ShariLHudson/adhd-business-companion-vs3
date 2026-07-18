/**
 * Reflective Conversation Intelligence (RCI) — shared platform types.
 * Hidden Thinking Map + response selection for thinking companions.
 * Never expose the map to members.
 */

export type RciExperienceId =
  | "talk-it-out"
  | "journal-gazebo"
  | "decision-compass"
  | "founder-reflection"
  | "board-debrief"
  | "client-debrief"
  | "discovery"
  | "other";

export type RciConversationArchetype =
  | "business-decision"
  | "planning"
  | "creative-block"
  | "overwhelm"
  | "fear-avoidance"
  | "relationship"
  | "opportunity-evaluation"
  | "identity-confidence"
  | "reflection-after-event"
  | "other";

export type RciResponseKind =
  | "thoughtful-question"
  | "gentle-observation"
  | "tentative-pattern"
  | "connection"
  | "clarification"
  | "summary"
  | "invite-continue"
  | "future-feeling"
  | "completion-check";

export type RciMessage = {
  role: "user" | "assistant";
  content: string;
};

/** Internal only — never show to members. */
export type ThinkingMap = {
  situation: string | null;
  goal: string | null;
  facts: string[];
  optionsNamed: string[];
  assumptions: string[];
  constraints: string[];
  unknowns: string[];
  concerns: string[];
  values: string[];
  tradeOffs: string[];
  resources: string[];
  patterns: string[];
  questionsAnswered: string[];
  questionsWorthExploring: string[];
  emergingInsights: string[];
  archetype: RciConversationArchetype;
  turnCount: number;
  lastUserText: string | null;
};

export type RciCandidateQuestion = {
  id: string;
  text: string;
  /** Optional area tag for filtering. */
  area?: string;
};

export type RciTurnInput = {
  experienceId: RciExperienceId;
  messages: readonly RciMessage[];
  userText: string;
  previousMap?: ThinkingMap | null;
  usedQuestionIds?: readonly string[];
  candidateQuestions?: readonly RciCandidateQuestion[];
  futureFeelingAlreadyAsked?: boolean;
  /** When true, caller handles help offer — RCI stays reflective. */
  skipAdviceBoundary?: boolean;
};

export type RciTurnResult = {
  assistantText: string;
  responseKind: RciResponseKind;
  archetype: RciConversationArchetype;
  thinkingMap: ThinkingMap;
  questionId?: string;
  futureFeelingAsked: boolean;
  /** True when clarity check / soft completion was offered. */
  offeredCompletionCheck: boolean;
  meta: {
    deepenedUnderstanding: boolean;
    rejectedAsRepetition: boolean;
    rejectedAsAlreadyAnswered: boolean;
  };
};

export const RCI_COMPLETION_CHECK =
  "Do you feel like you understand this situation a little better now, or is there another part you'd like to explore?" as const;
