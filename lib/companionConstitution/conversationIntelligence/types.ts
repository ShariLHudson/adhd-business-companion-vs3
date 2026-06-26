import type { AppSection } from "@/lib/companionUi";

/** Layer 0 output — what is happening in the conversation right now. */
export type ConversationMode =
  | "chat"
  | "workspace-beside-chat"
  | "standalone-workspace"
  | "arrival"
  | "regulation";

export type ConversationState = {
  mode: ConversationMode;
  activeSection: AppSection | null;
  workspaceBesideChat: boolean;
  /** User is in a thread — not a one-off command */
  inConversationThread: boolean;
  /** Latest user text when available */
  userText: string | null;
};

export type ConversationIntelligenceInput = {
  activeSection?: AppSection | null;
  workspacePanel?: AppSection | null;
  workspaceBesideChat?: boolean;
  messageCount?: number;
  userText?: string | null;
  arrivalActive?: boolean;
};

export type ConversationIntelligenceVerdict = {
  state: ConversationState;
  dataAttributes: Record<string, string>;
};
