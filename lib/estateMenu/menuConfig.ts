/**
 * Global Estate Menu™ — universal upper-right session controls.
 * Available from every Estate room via the same ⋯ / avatar trigger.
 */

export const ESTATE_MENU_SECTION_IDS = [
  "personal",
  "conversation",
  "settings",
] as const;

export type EstateMenuSectionId = (typeof ESTATE_MENU_SECTION_IDS)[number];

export const ESTATE_MENU_ACTION_IDS = [
  "memory-library",
  "estate-profile",
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

export type EstateMenuItem = {
  id: EstateMenuActionId;
  section: EstateMenuSectionId;
  emoji: string;
  label: string;
  hint?: string;
};

export const ESTATE_MENU_SECTION_LABELS: Record<EstateMenuSectionId, string> = {
  personal: "Your Estate",
  conversation: "Conversation",
  settings: "Settings & Account",
};

/** Canonical menu — order preserved within each section */
export const ESTATE_MENU_ITEMS: readonly EstateMenuItem[] = [
  {
    id: "memory-library",
    section: "personal",
    emoji: "🧠",
    label: "Memory",
    hint: "Journal, portfolio, evidence — view and export",
  },
  {
    id: "estate-profile",
    section: "personal",
    emoji: "👤",
    label: "Estate Profile™",
    hint: "Your account and companion preferences",
  },
  {
    id: "growth-profile",
    section: "personal",
    emoji: "📈",
    label: "Growth Profile™",
    hint: "Capabilities and learning progress — updated quietly",
  },
  {
    id: "institute-cabinet",
    section: "personal",
    emoji: "🏛",
    label: "My Institute Cabinet™",
    hint: "Saved lessons and references from the Institute",
  },
  {
    id: "evidence-vault",
    section: "personal",
    emoji: "⭐",
    label: "Evidence Vault™",
    hint: "Proof of growth for harder days",
  },
  {
    id: "journal",
    section: "personal",
    emoji: "📖",
    label: "Journal™",
    hint: "Private reflections",
  },
  {
    id: "portfolio",
    section: "personal",
    emoji: "🛠",
    label: "Portfolio™",
    hint: "Creative work and projects",
  },
  {
    id: "seeds-planted",
    section: "personal",
    emoji: "🌱",
    label: "Seeds Planted™",
    hint: "Spark Cards and ideas taking root",
  },
  {
    id: "goals-projects",
    section: "personal",
    emoji: "🎯",
    label: "Goals & Projects™",
    hint: "What you are building toward",
  },
  {
    id: "progress-timeline",
    section: "personal",
    emoji: "📊",
    label: "Progress Timeline™",
    hint: "Your learning and growth over time",
  },
  {
    id: "start-new-conversation",
    section: "conversation",
    emoji: "💬",
    label: "Start New Conversation",
    hint: "Fresh chat — memory and saved work stay safe",
  },
  {
    id: "start-new-day-conversation",
    section: "conversation",
    emoji: "☀️",
    label: "Start New Day Conversation",
    hint: "Gentle daily reset — yesterday stays accessible",
  },
  {
    id: "settings",
    section: "settings",
    emoji: "⚙️",
    label: "Settings",
    hint: "Account, subscription, privacy, and data",
  },
  {
    id: "notifications",
    section: "settings",
    emoji: "🔔",
    label: "Notifications",
    hint: "Reminder and alert preferences",
  },
  {
    id: "voice-settings",
    section: "settings",
    emoji: "🎙",
    label: "Voice Settings",
    hint: "Voice availability, microphone, and audio",
  },
  {
    id: "log-out",
    section: "settings",
    emoji: "🚪",
    label: "Log Out",
    hint: "Sign out — your saved data stays on your account",
  },
];

export function estateMenuItemsForSection(
  section: EstateMenuSectionId,
): EstateMenuItem[] {
  return ESTATE_MENU_ITEMS.filter((item) => item.section === section);
}
