export type FreshStartKind = "clear-context" | "begin-new-day" | "reset-day";

export type FreshStartCopy = {
  menuEmoji: string;
  menuLabel: string;
  menuHint: string;
  title: string;
  intro: string;
  willDo: string[];
  willNot: string[];
  confirmLabel: string;
};

/** Top bar — primary fresh-conversation action. */
export const TOP_BAR_NEW_CONVERSATION_LABEL = "New Conversation";

/** @deprecated Chat Workspace dropdown removed — use TOP_BAR_NEW_CONVERSATION_LABEL */
export const CHAT_WORKSPACE_MENU_LABEL = "Chat Workspace";

export const TOP_BAR_NEW_CHAT_LABEL = TOP_BAR_NEW_CONVERSATION_LABEL;
export const TOP_BAR_NEW_DAYS_CHAT_LABEL = "New Day's Chat";

/** @deprecated Use CHAT_WORKSPACE_MENU_LABEL */
export const PLAN_DAY_OPTIONS_MENU_LABEL = CHAT_WORKSPACE_MENU_LABEL;

/** @deprecated Use TOP_BAR_NEW_DAYS_CHAT_LABEL */
export const TOP_BAR_NEW_DAY_LABEL = TOP_BAR_NEW_DAYS_CHAT_LABEL;

/** @deprecated Reset Day removed from top bar; kept for plan-only reset flows */
export const TOP_BAR_RESET_DAY_LABEL = "Reset Day";

/** New Conversation — clears chat only; all saved work stays. */
export const CLEAR_TODAY_CONTEXT_COPY: FreshStartCopy = {
  menuEmoji: "💬",
  menuLabel: TOP_BAR_NEW_CONVERSATION_LABEL,
  menuHint:
    "Start a fresh conversation. Your saved work, projects, goals, and memories stay available.",
  title: "Start a New Conversation?",
  intro:
    "Your saved work, projects, goals, and memories will remain available. Only this conversation will be cleared.",
  willDo: ["Clear the current conversation", "Start a fresh companion chat"],
  willNot: [
    "Delete projects or saved work",
    "Delete goals or templates",
    "Delete strategies or maps",
    "Delete business canvases",
    "Delete profile information",
    "Delete memory or learning",
  ],
  confirmLabel: "Start New Conversation",
};

export const BEGIN_NEW_DAY_COPY: FreshStartCopy = {
  menuEmoji: "🌅",
  menuLabel: "New Day's Chat",
  menuHint:
    "Start a fresh day with the companion — today's plan resets while history and learning stay safe.",
  title: "New Day's Chat",
  intro:
    "A fresh daily conversation — your long-term memory, projects, and goals stay safe.",
  willDo: [
    "Archive today's chat session",
    "Start a fresh daily conversation",
    "Reset Plan My Day workspace",
    "Clear completed daily planning items",
  ],
  willNot: [
    "Delete memory or learning",
    "Delete Founder Intelligence",
    "Delete projects or goals",
    "Delete your user history",
  ],
  confirmLabel: "New Day's Chat",
};

export const RESET_DAY_COPY: FreshStartCopy = {
  menuEmoji: "🔄",
  menuLabel: "Reset Day",
  menuHint:
    "Clear today's Plan My Day setup and begin again — useful when the plan got messy.",
  title: "Reset Day",
  intro:
    "Restart today's plan when the day changed, things got crowded, or you want a clean slate for today.",
  willDo: [
    "Clear your current Plan My Day setup",
    "Let you begin today's plan again",
  ],
  willNot: [
    "Delete completion history or analytics",
    "Delete projects, memories, or saved work",
    "Clear your conversation or other workspaces",
  ],
  confirmLabel: "Reset Day",
};

export function freshStartCopy(kind: FreshStartKind): FreshStartCopy {
  if (kind === "reset-day") return RESET_DAY_COPY;
  if (kind === "clear-context") return CLEAR_TODAY_CONTEXT_COPY;
  return BEGIN_NEW_DAY_COPY;
}

export const BEGIN_NEW_DAY_GREETING =
  "New day — fresh start. What feels most important right now?";
