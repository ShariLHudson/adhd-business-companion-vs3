import type { CoachingMode } from "@/lib/companionPrompt";

export type NewConversationMenuItemId = "new-chat" | "new-day-conversation";

export type TopBarMenuItem = {
  id: string;
  label: string;
  objectId: string;
  description?: string;
};

/** @deprecated Hub uses single-click — kept for legacy imports. */
export const CLEAR_MY_MIND_MENU_ITEMS = [
  { id: "brain-dump", label: "Brain Dump", objectId: "clear-my-mind" },
] as const;

export type ClearMyMindMenuItemId =
  (typeof CLEAR_MY_MIND_MENU_ITEMS)[number]["id"];

/** @deprecated Hub uses single-click — kept for legacy imports. */
export const PLAN_MY_DAY_MENU_ITEMS = [
  { id: "daily-planner", label: "Daily Planner", objectId: "plan-my-day" },
] as const;

export type PlanMyDayMenuItemId = (typeof PLAN_MY_DAY_MENU_ITEMS)[number]["id"];

export const NEW_CONVERSATION_MENU_ITEMS = [
  { id: "new-chat", label: "New Chat", objectId: "messages" },
  {
    id: "new-day-conversation",
    label: "New Day Conversation",
    objectId: "plan-my-day",
  },
] as const;

export type NewConversationMenuItem =
  (typeof NEW_CONVERSATION_MENU_ITEMS)[number];

/** @deprecated Lens routing removed from top bar — use menu item ids. */
export type NewConversationLens =
  | "new-chat"
  | "business"
  | "personal"
  | "adhd-coaching"
  | "creative"
  | "writing";

export function coachingModeForConversationLens(
  lens: NewConversationLens,
): CoachingMode {
  switch (lens) {
    case "business":
      return "playbook";
    case "adhd-coaching":
      return "focus";
    case "creative":
    case "writing":
    case "personal":
    case "new-chat":
    default:
      return "today";
  }
}
