/**
 * Relationship Intelligence — name and greeting subsystems.
 * Personal Without Performance — warmth through memory, not mechanical insertion.
 */

export const PERSONAL_WITHOUT_PERFORMANCE_PRINCIPLE =
  "Personal Without Performance — feel personal because meaningful things are remembered and spoken naturally, not because the name is inserted by rule.";

export type NameUseScenario =
  | "first_greeting_of_day"
  | "celebration"
  | "encouragement"
  | "reconnect_after_absence"
  | "important_personal"
  | "long_conversation_reconnect"
  | "ordinary";

export type NameLineContext =
  | "greeting"
  | "echo"
  | "invite"
  | "chat"
  | "instruction"
  | "research"
  | "list";

export type NameIntelligenceInput = {
  firstName?: string | null;
  scenario?: NameUseScenario;
  lineContext?: NameLineContext;
  isFirstGreetingOfDay?: boolean;
  returnIntervalDays?: number | null;
  celebrationActive?: boolean;
  projectRecentlyCompleted?: boolean;
  recoveryGentle?: boolean;
  messageCountInConversation?: number;
  namesUsedThisConversation?: number;
};

export type NameIntelligenceVerdict = {
  useName: boolean;
  principle: string;
  reason: string;
};

export type MorningGreetingInput = {
  now?: Date;
  firstName?: string | null;
  sessionVisitIndex?: number;
  returnIntervalDays?: number | null;
  previousTopic?: string | null;
  recentAccomplishment?: string | null;
  projectRecentlyCompleted?: boolean;
  celebrationActive?: boolean;
  recoveryGentle?: boolean;
  isFirstMeeting?: boolean;
};

export type MorningGreetingVerdict = {
  greeting: string;
  followUp: string | null;
  entryId: string;
  usedSpecificMemory: boolean;
  usedName: boolean;
  principle: string;
};
