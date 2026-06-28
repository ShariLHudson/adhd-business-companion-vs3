import type { CoachingMode } from "@/lib/companionPrompt";

export type NewConversationLens =
  | "new-chat"
  | "business"
  | "personal"
  | "adhd-coaching"
  | "creative"
  | "writing";

export type TopBarMenuItem = {
  id: string;
  label: string;
  objectId: string;
  description?: string;
};

export const CLEAR_MY_MIND_MENU_ITEMS = [
  { id: "recent-thoughts", label: "Recent thoughts", objectId: "my-thoughts" },
  { id: "brain-dump", label: "Brain Dump", objectId: "clear-my-mind" },
  { id: "journal", label: "Journal", objectId: "journal" },
  { id: "voice-note", label: "Voice Note", objectId: "clear-my-mind" },
] as const;

export type ClearMyMindMenuItemId =
  (typeof CLEAR_MY_MIND_MENU_ITEMS)[number]["id"];

export const PLAN_MY_DAY_MENU_ITEMS = [
  { id: "daily-planner", label: "Daily Planner", objectId: "plan-my-day" },
  { id: "priorities", label: "Priorities", objectId: "priorities" },
  { id: "calendar", label: "Calendar", objectId: "calendar" },
  {
    id: "energy-planning",
    label: "Energy Planning",
    objectId: "todays-reality",
  },
] as const;

export type PlanMyDayMenuItemId = (typeof PLAN_MY_DAY_MENU_ITEMS)[number]["id"];

export const NEW_CONVERSATION_MENU_ITEMS = [
  { id: "new-chat", label: "New Chat", objectId: "messages", lens: "new-chat" },
  { id: "business", label: "Business", objectId: "business", lens: "business" },
  { id: "personal", label: "Personal", objectId: "profile", lens: "personal" },
  {
    id: "adhd-coaching",
    label: "ADHD Coaching",
    objectId: "focus-my-brain",
    lens: "adhd-coaching",
  },
  { id: "creative", label: "Creative", objectId: "create", lens: "creative" },
  { id: "writing", label: "Writing", objectId: "create", lens: "writing" },
] as const;

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
