/**
 * Global Estate Menu™ — universal upper-right session controls.
 * Dropdown shows five calm choices; other action ids remain for routing.
 *
 * @see docs/protocols/SPARK_ESTATE_TOP_NAVIGATION_AND_PROFILE_MENU_CORRECTION.md
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

/** Profile initials menu — five member-facing choices (separate from room navigation). */
export const ESTATE_MENU_DROPDOWN_ITEMS: readonly EstateMenuDropdownItem[] = [
  {
    id: "my-profile",
    emoji: "👤",
    label: "Profile",
  },
  {
    id: "settings",
    emoji: "⚙️",
    label: "Settings",
  },
  {
    id: "memory-library",
    emoji: "💬",
    label: "Conversations",
  },
  {
    id: "growth-profile",
    emoji: "✨",
    label: "Personalization",
  },
  {
    id: "estate-profile",
    emoji: "🏡",
    label: "Account",
  },
];

export function estateMenuDropdownItems(): EstateMenuDropdownItem[] {
  return [...ESTATE_MENU_DROPDOWN_ITEMS];
}
