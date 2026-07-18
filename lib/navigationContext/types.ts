/**
 * Universal Navigation Context & Return Standard — frame + stack types.
 */

export type NavigationFrameKind =
  | "destination"
  | "nested"
  | "living-place"
  | "overlay";

export type NavigationFrame = {
  id: string;
  /** Machine destination id (settings, chamber-of-momentum, project-homes, …). */
  destinationId: string;
  /** Human label for breadcrumb / Back to X. */
  label: string;
  kind: NavigationFrameKind;
  tab?: string;
  section?: string;
  accordion?: string;
  step?: string;
  /** Selected card / member / record / project / task id. */
  selectedId?: string;
  scrollY?: number;
  editingFieldId?: string;
  /** Opaque draft key — adapters know how to reload. */
  draftKey?: string;
  filters?: string;
  sort?: string;
  search?: string;
  /** Extra restore payload (JSON-serializable). */
  meta?: Record<string, string | number | boolean | null | undefined>;
  openedAt: string;
  expiresAt: string;
};

export type NavigationBreadcrumbCrumb = {
  id: string;
  label: string;
  /** Stack index this crumb restores (all segments clickable in V1). */
  stackIndex: number;
  clickable: boolean;
};

export type NavigationStackState = {
  frames: NavigationFrame[];
  /** Current surface (not on stack until nested leave). */
  current?: {
    destinationId: string;
    label: string;
    kind: NavigationFrameKind;
  };
};

/** Stable labels for Settings sections + known destinations. */
export const DESTINATION_LABELS: Record<string, string> = {
  "profile-personal": "My Profile",
  "my-business-estate": "My Business Estate",
  "people-i-help": "People I Help",
  "growth-profile": "Growth Profile",
  settings: "Settings",
  "experience-controls": "Accessibility & display",
  "chamber-of-momentum": "Chamber of Momentum",
  boardroom: "Boardroom",
  "evidence-bank": "Evidence Vault",
  "evidence-vault": "Evidence Vault",
  "growth-journal": "Journal Gazebo",
  journal: "Journal Gazebo",
  projects: "Projects",
  "project-homes": "Projects",
  "talk-it-out": "Talk It Out",
  "welcome-home": "Welcome Home",
  pattern: "Pattern Awareness",
  notifications: "Notifications",
  tone: "Communication preferences",
  help: "Help style",
  support: "Support style",
  curiosity: "Curiosity",
  language: "Language",
  appearance: "Appearance",
  "estate-audio": "Estate audio",
  planning: "Planning",
  celebrations: "Celebrations",
  plan: "Plan & voice",
  advanced: "Advanced AI tools",
  connections: "Integrations",
  account: "Account",
  privacy: "Privacy",
  accessibility: "Accessibility",
  reminders: "Reminder Settings",
  calendar: "Calendar Settings",
};

export const SETTINGS_SAVED_MESSAGE = "Settings saved" as const;

export const NAVIGATION_STACK_STORAGE_KEY = "spark:navigation-stack:v1" as const;
export const NAVIGATION_STACK_CHANGE_EVENT =
  "spark:navigation-stack-change" as const;
export const NAVIGATION_STACK_MAX_DEPTH = 12;
export const NAVIGATION_STACK_TTL_MS = 2 * 60 * 60 * 1000;
