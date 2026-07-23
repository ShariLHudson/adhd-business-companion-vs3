/**
 * Global Estate Menu — SH profile session controls.
 * Welcome Home (room menu) = where to go.
 * This menu = profile destinations + Experience Controls (look / sound / behave).
 *
 * @see lib/estate/welcomeHomeNavigationStructure.ts
 */

export const ESTATE_MENU_ACTION_IDS = [
  "memory-library",
  "estate-profile",
  "my-profile",
  "my-business-estate",
  "people-i-help",
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
  "toggle-companion-visibility",
  "experience-controls",
  "settings",
  "replay-welcome",
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

export type EstateMenuDropdownGroup = {
  kind: "group";
  id: "conversations" | "my-spark-estate" | "profile";
  emoji: string;
  label: string;
  children: readonly EstateMenuDropdownItem[];
};

export type EstateMenuDropdownEntry =
  | ({ kind: "item" } & EstateMenuDropdownItem)
  | EstateMenuDropdownGroup;

/**
 * SH profile menu — Conversations, My Spark Estate, Experience Controls, Settings, Sign Out.
 * My Spark Estate children: My Business Estate + My Profile.
 * People I Help lives inside My Business Estate (action id kept for direct links).
 */
export const ESTATE_MENU_DROPDOWN_ENTRIES: readonly EstateMenuDropdownEntry[] = [
  {
    kind: "group",
    id: "conversations",
    emoji: "💬",
    label: "Conversations",
    children: [
      {
        id: "start-new-conversation",
        emoji: "✨",
        label: "New Chat",
      },
      {
        id: "start-new-day-conversation",
        emoji: "🌅",
        label: "New Day",
      },
      {
        id: "toggle-companion-visibility",
        emoji: "💬",
        label: "Companion: On",
      },
    ],
  },
  {
    kind: "group",
    id: "my-spark-estate",
    emoji: "🏡",
    label: "My Spark Estate",
    children: [
      {
        id: "my-business-estate",
        emoji: "🏡",
        label: "My Business Estate",
      },
      {
        id: "my-profile",
        emoji: "👤",
        label: "My Profile",
      },
    ],
  },
  {
    kind: "item",
    id: "experience-controls",
    emoji: "🎛",
    label: "Experience Controls",
  },
  {
    kind: "item",
    id: "settings",
    emoji: "⚙️",
    label: "Settings",
  },
  {
    kind: "item",
    id: "log-out",
    emoji: "🚪",
    label: "Sign Out",
  },
];

/** Flat clickable actions currently shown in the dropdown (excludes group headers). */
export const ESTATE_MENU_DROPDOWN_ITEMS: readonly EstateMenuDropdownItem[] =
  ESTATE_MENU_DROPDOWN_ENTRIES.flatMap((entry) =>
    entry.kind === "group" ? [...entry.children] : [entry],
  );

export function estateMenuDropdownItems(): EstateMenuDropdownItem[] {
  return [...ESTATE_MENU_DROPDOWN_ITEMS];
}

export function estateMenuDropdownEntries(): EstateMenuDropdownEntry[] {
  return [...ESTATE_MENU_DROPDOWN_ENTRIES];
}
