/**
 * Global Estate Menu — universal upper-right session controls.
 * Welcome Home / profile dropdown shows only working member controls.
 *
 * Visible menu:
 * 1. Conversations → New Chat · New Day Chat
 * 2. Settings
 * 3. Profile → My Business Estate · People I Help
 * 4. Logout
 *
 * Personalization and Account are hidden (not currently working).
 * Other action ids remain for programmatic routing only.
 *
 * @see docs/protocols/SPARK_ESTATE_TOP_NAVIGATION_AND_PROFILE_MENU_CORRECTION.md
 */

export const ESTATE_MENU_ACTION_IDS = [
  "memory-library",
  "estate-profile",
  "my-profile",
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
  id: "conversations" | "profile";
  emoji: string;
  label: string;
  children: readonly EstateMenuDropdownItem[];
};

export type EstateMenuDropdownEntry =
  | ({ kind: "item" } & EstateMenuDropdownItem)
  | EstateMenuDropdownGroup;

/**
 * Profile initials menu — working member-facing choices only.
 * Order: Conversations → Settings → Listen to Shari's Welcome → Profile → Logout.
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
        label: "New Day Chat",
      },
    ],
  },
  {
    kind: "item",
    id: "settings",
    emoji: "⚙️",
    label: "Settings",
  },
  {
    kind: "item",
    id: "replay-welcome",
    emoji: "🎧",
    label: "Listen to Shari's Welcome",
  },
  {
    kind: "group",
    id: "profile",
    emoji: "👤",
    label: "Profile",
    children: [
      {
        id: "my-profile",
        emoji: "🏡",
        label: "My Business Estate",
      },
      {
        id: "people-i-help",
        emoji: "🤝",
        label: "People I Help",
      },
    ],
  },
  {
    kind: "item",
    id: "log-out",
    emoji: "🚪",
    label: "Logout",
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
