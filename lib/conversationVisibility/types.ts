/**
 * Companion conversation visibility — user-controlled presentation preference.
 * Not navigation, New Day, or conversation deletion.
 */

export type CompanionVisibility = "on" | "off";

export type CompanionVisibilitySource =
  | "conversation_header"
  | "settings"
  | "empty_state"
  | "migration"
  | "new_chat_confirm";

export type ConversationDisplayPreference = {
  globalDefault: CompanionVisibility;
  /** Per-destination overrides — absent key uses globalDefault */
  destinationOverrides: Record<string, CompanionVisibility>;
  updatedAt: string;
  version: 1;
};

export type SetCompanionVisibilityAction = {
  type: "SET_COMPANION_VISIBILITY";
  visibility: CompanionVisibility;
  destinationId: string | null;
  source: CompanionVisibilitySource;
};

export type SetCompanionVisibilityResult = {
  visibility: CompanionVisibility;
  destinationId: string | null;
  preference: ConversationDisplayPreference;
  /** Abort in-flight assistant response when turning off */
  abortInFlightResponse: boolean;
  /** Never delete conversation / saved work / awaiting records */
  preserveConversation: true;
  preserveSavedWork: true;
};

/** Destination chat surface classification for Companion On/Off. */
export type DestinationChatClass =
  | "user_controllable"
  | "initially_hidden"
  | "no_chat_by_design"
  | "specialized_conversation";

export const CONVERSATION_DISPLAY_PREFS_KEY =
  "spark:conversation-display-prefs:v1" as const;
export const CONVERSATION_DISPLAY_CHANGE_EVENT =
  "spark:conversation-display-prefs-change" as const;
