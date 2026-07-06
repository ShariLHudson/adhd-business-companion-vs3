/**
 * Global Estate Menu™ — universal upper-right session controls.
 * Dropdown shows five calm choices; other action ids remain for routing.
 */

export const ESTATE_MENU_ACTION_IDS = [
  "memory-library",
  "estate-profile",
  "my-profile",
  "growth-profile",
  "institute-cabinet",
  "evidence-vault",
  "journal",
  "portfolio",
  "seeds-planted",
  "goals-projects",
  "progress-timeline",
  "start-new-conversation",
  "start-new-day-conversation",
  "settings",
  "notifications",
  "voice-settings",
  "log-out",
] as const;

export type EstateMenuActionId = (typeof ESTATE_MENU_ACTION_IDS)[number];

export type EstateMenuDropdownItem = {
  id: EstateMenuActionId;
  emoji: string;
  label: string;
};

/** Flat account menu — five choices only. */
export const ESTATE_MENU_DROPDOWN_ITEMS: readonly EstateMenuDropdownItem[] = [
  {
    id: "start-new-day-conversation",
    emoji: "🌅",
    label: "Start a New Day",
  },
  {
    id: "start-new-conversation",
    emoji: "💬",
    label: "Start a New Conversation",
  },
  {
    id: "settings",
    emoji: "⚙️",
    label: "Settings",
  },
  {
    id: "my-profile",
    emoji: "👤",
    label: "My Profile",
  },
  {
    id: "log-out",
    emoji: "🚪",
    label: "Log Out",
  },
];

export function estateMenuDropdownItems(): EstateMenuDropdownItem[] {
  return [...ESTATE_MENU_DROPDOWN_ITEMS];
}
