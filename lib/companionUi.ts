import type { CoachingMode } from "./companionPrompt";
import { COMPANION_LOGIN_BACKGROUND } from "./companionLoginPage";

export type AppSection =
  | "home"
  | "focus-timer"
  | "brain-dump"
  | "breathe"
  | "focus-audio"
  | "settings"
  | "projects"
  | "playbook"
  | "profile"
  | "energy"
  | "templates-library"
  | "saved-work"
  | "my-work"
  | "focus"
  | "progress"
  | "time-block"
  | "activities"
  | "guided-exercises"
  | "spin-wheel"
  | "games"
  | "quick-recharge"
  | "grow"
  | "momentum-builder"
  | "momentum-institute"
  | "chamber-of-momentum"
  | "chamber-project-entry"
  | "boardroom"
  /** Design prototype — Estate Project Homes (does not replace Projects) */
  | "project-homes"
  | "stables"
  | "grow-momentum-builders"
  | "grow-spark-cards"
  | "grow-guilds"
  | "grow-daily-discoveries"
  | "grow-business-history"
  | "grow-observatory"
  | "email-generator"
  | "snippets"
  | "content-types"
  | "content-generator"
  /** My Work → Create estate entrance (Universal Create opens from here). */
  | "create"
  | "google-workspace"
  | "business-profile"
  | "client-avatars"
  | "how-do-i"
  | "decision-compass"
  | "today"
  | "plan-my-day"
  /** Shared My Day window — Plan My Day / Adapt My Day. */
  | "adapt-plan-my-day"
  | "reminders"
  | "rhythms"
  /** Shared My Day window — Reminders / Rhythms. */
  | "reminders-rhythms"
  | "calendar"
  | "parking-lot"
  | "visual-focus"
  | "wins-this-week"
  | "evidence-bank"
  | "growth"
  | "growth-capture"
  | "growth-library"
  | "growth-reports"
  | "confidence-vault"
  | "my-journey"
  | "growth-journal"
  | "growth-greenhouse"
  | "growth-portfolio"
  | "user-memory"
  | "welcome-room"
  | "life-experience"
  | "the-gallery"
  /** Architecture 156 — Destination Gallery (outcome crystals). */
  | "destination-gallery";

export type SidebarNavId =
  | "chat"
  | "clear-my-mind"
  | "plan-my-day"
  | "focus"
  | "todays-reality"
  | "visual-thinking"
  | "create"
  | "grow"
  | "how-do-i"
  | "playbook"
  | "growth"
  | "journal"
  | "portfolio"
  | "evidence-bank"
  | "confidence-vault"
  | "welcome-room"
  | "fire-pit"
  | "butterfly-conservatory"
  | "rain-porch"
  | "pool"
  | "deck-balcony"
  /** @deprecated Use create / other group items */
  | "other"
  /** @deprecated */
  | "tools"
  /** @deprecated */
  | "progress"
  /** @deprecated */
  | "projects"
  /** @deprecated */
  | "templates"
  /** @deprecated */
  | "snippets"
  /** @deprecated */
  | "saved-work"
  /** @deprecated */
  | "my-work"
  /** @deprecated */
  | "client-avatars"
  /** @deprecated */
  | "settings"
  /** @deprecated */
  | "wins-this-week"
  /** @deprecated */
  | "my-journey";

export type SidebarToolId =
  | "voice"
  | "brain-dump"
  | "focus-timer"
  | "breathe"
  | "focus-audio"
  | "reset-day"
  | "new-chat"
  | "time-block"
  | "activities"
  | "guided-exercises"
  | "spin-wheel"
  | "games";

export const ASSETS = {
  background: "/images/companion-bg.jpg",
  logo: "/images/shari/shari-images/ssc-logo.svg",
  loginBackground: COMPANION_LOGIN_BACKGROUND,
  profile: "/shari.jpg",
} as const;

export const BRAND = {
  name: "Spark Studio Companions",
  tagline: "Your Coach & Companion",
} as const;

// Primary sidebar doors — see lib/companionPropertyNav.ts for grouped layout.
export const SIDEBAR_NAV: {
  id: SidebarNavId;
  label: string;
  objectId: string;
  mode?: CoachingMode;
}[] = [];

/** @deprecated More menu hidden — settings via profile / overlays only. */
export const MORE_NAV: {
  id: SidebarNavId;
  label: string;
  objectId: string;
  mode?: CoachingMode;
}[] = [];

// Top-level nav items that open their own section (a panel) rather than
// switching the chat into a coaching mode.
export const SECTION_NAV: Partial<Record<SidebarNavId, AppSection>> = {
  chat: "home",
  "clear-my-mind": "brain-dump",
  "plan-my-day": "plan-my-day",
  focus: "focus",
  "todays-reality": "energy",
  "visual-thinking": "visual-focus",
  create: "content-generator",
  grow: "grow",
  "how-do-i": "how-do-i",
  playbook: "playbook",
  growth: "growth",
  journal: "growth-journal",
  portfolio: "growth-portfolio",
  "evidence-bank": "evidence-bank",
  "confidence-vault": "confidence-vault",
  "welcome-room": "welcome-room",
  other: "my-work",
  "my-work": "my-work",
  projects: "projects",
  templates: "templates-library",
  snippets: "snippets",
  "wins-this-week": "wins-this-week",
  "my-journey": "my-journey",
};

/** Map legacy or sub-area nav ids to a primary sidebar door. */
export function normalizeSidebarNav(nav: SidebarNavId): SidebarNavId {
  if (nav === "create" || nav === "my-work") return "other";
  if (
    nav === "how-do-i" ||
    nav === "playbook" ||
    nav === "visual-thinking" ||
    nav === "welcome-room"
  ) {
    return "other";
  }
  if (
    nav === "projects" ||
    nav === "templates" ||
    nav === "snippets" ||
    nav === "saved-work"
  ) {
    return "other";
  }
  if (
    nav === "wins-this-week" ||
    nav === "my-journey" ||
    nav === "journal" ||
    nav === "portfolio"
  ) {
    return "other";
  }
  if (nav === "growth") {
    return "other";
  }
  return nav;
}

/** Primary sidebar nav for an open workspace section. */
export function sidebarNavForSection(section: AppSection): SidebarNavId | null {
  switch (section) {
    case "my-work":
    case "projects":
    case "project-homes":
    case "templates-library":
    case "snippets":
    case "saved-work":
      return "other";
    case "content-generator":
    case "create":
      return "create";
    case "playbook":
    case "how-do-i":
    case "visual-focus":
    case "destination-gallery":
    case "welcome-room":
      return "other";
    case "brain-dump":
      return "clear-my-mind";
    case "plan-my-day":
    case "adapt-plan-my-day":
      return "plan-my-day";
    case "reminders":
    case "rhythms":
    case "reminders-rhythms":
    case "calendar":
    case "parking-lot":
      return "plan-my-day";
    case "energy":
      return "todays-reality";
    case "focus":
    case "focus-timer":
    case "focus-audio":
    case "activities":
    case "guided-exercises":
    case "spin-wheel":
    case "games":
    case "quick-recharge":
      return "focus";
    /** Breathe is a universal overlay — not a Focus nav destination. */
    case "breathe":
      return null;
    case "grow":
    case "momentum-builder":
    case "grow-momentum-builders":
    case "grow-spark-cards":
    case "grow-guilds":
    case "grow-daily-discoveries":
    case "grow-business-history":
    case "grow-observatory":
      return "grow";
    case "the-gallery":
      return "other";
    case "growth":
    case "growth-capture":
    case "growth-library":
    case "growth-reports":
      return "other";
    case "evidence-bank":
      return "evidence-bank";
    case "confidence-vault":
      return "confidence-vault";
    case "wins-this-week":
    case "my-journey":
    case "growth-journal":
    case "growth-greenhouse":
      return "journal";
    case "growth-portfolio":
      return "portfolio";
    case "life-experience":
      return "growth";
    case "home":
    case "today":
      return "chat";
    default:
      return null;
  }
}

export const SIDEBAR_TOOLS: {
  id: SidebarToolId;
  label: string;
  objectId: string;
}[] = [
  { id: "brain-dump", label: "Clear My Mind", objectId: "clear-my-mind" },
  { id: "focus-timer", label: "Pomodoro", objectId: "focus-timer" },
  { id: "reset-day", label: "New Chat", objectId: "messages" },
  { id: "breathe", label: "Breathe", objectId: "breathing" },
  { id: "voice", label: "Voice", objectId: "voice" },
];

// Nested sidebar menu structure. A leaf dispatches a tool action; a branch
// expands to reveal child nodes. Supports arbitrary nesting (currently 2 deep).
export type MenuLeaf = {
  kind: "leaf";
  id: string;
  label: string;
  objectId: string;
  tool: SidebarToolId;
};

export type MenuBranch = {
  kind: "branch";
  id: string;
  label: string;
  objectId: string;
  children: MenuNode[];
};

export type MenuNode = MenuLeaf | MenuBranch;

// Focus  (expands only — no dedicated page; focus is a chat state)
//  ├─ What's on your mind   → Brain Dump
//  └─ Focus Tools
//       ├─ Focus Audio      → focus-audio
//       └─ Pomodoro timer   → focus-timer
// Breathe is a universal capability overlay — not listed under Focus.
export const FOCUS_MENU: MenuNode[] = [
  {
    kind: "leaf",
    id: "whats-on-your-mind",
    label: "What's on your mind",
    objectId: "clear-my-mind",
    tool: "brain-dump",
  },
  {
    kind: "branch",
    id: "focus-tools",
    label: "Focus Tools",
    objectId: "focus-studio",
    children: [
      {
        kind: "leaf",
        id: "focus-audio",
        label: "Peaceful Places",
        objectId: "focus-audio",
        tool: "focus-audio",
      },
      {
        kind: "leaf",
        id: "pomodoro",
        label: "Pomodoro timer",
        objectId: "focus-timer",
        tool: "focus-timer",
      },
    ],
  },
];

// Maps a tool action to the AppSection it opens (null = no section switch).
// Breathe opens as a Universal Access overlay — not a section route.
export const TOOL_SECTION: Partial<Record<SidebarToolId, AppSection>> = {
  "brain-dump": "brain-dump",
  "focus-timer": "focus-timer",
  "focus-audio": "focus-audio",
  "time-block": "time-block",
  activities: "activities",
  "guided-exercises": "guided-exercises",
  "spin-wheel": "spin-wheel",
  games: "quick-recharge",
};

export const INPUT_PLACEHOLDER = "";

export const MODE_FEEDBACK: Record<CoachingMode, string> = {
  today: "Chat — I'm here with you.",
  focus: "Focus — let's take it one step at a time.",
  "how-do-i": "Let's walk through this together.",
  playbook: "Let's work on what you're creating.",
  progress: "Let's take one gentle step forward.",
};
