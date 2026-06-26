import type { AppSection } from "@/lib/companionUi";
import type { CompanionPlaceId } from "./types";
import { placeById } from "./libraries/placeLibrary";

/**
 * Companion Layout System™
 *
 * The Companion Homestead™ is the environment — not the navigation.
 *
 * Navigation stays stable. The main content area becomes the room.
 * Users always know where menus are, but emotionally they walk from
 * room to room within Shari's home.
 *
 * Four independent layers evolve without breaking one another:
 * 1. Persistent UI — House Map + Toolbelt (never the room)
 * 2. Environmental Layer — place, light, weather, motion, objects
 * 3. Working Layer — tools, forms, planners, editors, conversations
 * 4. Relationship Layer — Shari's presence, greetings, stories, hospitality
 */
export const COMPANION_LAYOUT_SYSTEM = {
  title: "Companion Layout System™",
  subtitle: "The homestead is the environment — navigation is the architecture.",
  corePrinciple:
    "Navigation does not become the room. Navigation stays stable. The content area becomes the room.",
  environmentSupportsWork:
    "The environment should support the work, never compete with it.",
  homesteadIsNotNavigation:
    "The Companion Homestead™ is the environment, not the navigation.",
} as const;

export type LayoutLayerId =
  | "persistent-ui"
  | "environmental"
  | "working"
  | "relationship";

export type LayoutLayer = {
  id: LayoutLayerId;
  name: string;
  tagline: string;
  owns: readonly string[];
  mustNeverOwn: readonly string[];
};

/** Four layers — independent, composable, evolvable. */
export const LAYOUT_LAYERS: readonly LayoutLayer[] = [
  {
    id: "persistent-ui",
    name: "Persistent UI",
    tagline: "Familiar structure — always findable",
    owns: [
      "Top navigation (House Map)",
      "Left sidebar (Companion Toolbelt)",
      "Companion avatar access",
      "Notifications",
      "Search",
      "Account and settings entry",
    ],
    mustNeverOwn: [
      "Full-screen photograph as the only UI",
      "Room atmosphere replacing tool affordances",
      "Hiding navigation to force immersion",
    ],
  },
  {
    id: "environmental",
    name: "Environmental Layer",
    tagline: "Which room is active — prepared, not rebuilt",
    owns: [
      "Active Companion Place™",
      "Lighting and time of day",
      "Weather and season",
      "Motion and ambient sound",
      "Hospitality objects",
      "Room immersion level",
    ],
    mustNeverOwn: [
      "Primary form fields",
      "Data tables and dashboards as decoration",
      "Navigation chrome",
    ],
  },
  {
    id: "working",
    name: "Working Layer",
    tagline: "The actual work — always legible",
    owns: [
      "Tools, forms, cards, planners, editors",
      "Conversations and chat threads",
      "Lists, boards, timers, capture flows",
      "Business dashboards and create flows",
    ],
    mustNeverOwn: [
      "Replacing persistent navigation",
      "Full-screen photo with no work surface",
    ],
  },
  {
    id: "relationship",
    name: "Relationship Layer",
    tagline: "Shari's presence — host, not UI chrome",
    owns: [
      "Shari's still photograph",
      "Greetings and invites",
      "Conversation cadence",
      "Shari Stories™ and NGMTM sticky notes",
      "Hospitality moments and prepared lines",
    ],
    mustNeverOwn: [
      "Animated AI Shari",
      "Personalization voice ('we customized…')",
      "Guilt, streaks, or re-engagement pressure",
    ],
  },
] as const;

export type RoomImmersionLevel =
  | "full-arrival"
  | "environmental-header"
  | "warm-workspace"
  | "office-atmosphere"
  | "restrained-focus"
  | "creative-studio"
  | "subtle";

export type RoomImmersionProfile = {
  level: RoomImmersionLevel;
  /** 0–100 — how much of the viewport the environment may occupy. */
  environmentSharePercent: number;
  description: string;
  workingLayerDominant: boolean;
};

/**
 * Not every room is full-screen.
 * Living Room™ is special — arrival immersion.
 * Work rooms support the task first.
 */
export const ROOM_IMMERSION_BY_PLACE: Record<
  CompanionPlaceId,
  RoomImmersionProfile
> = {
  "living-room": {
    level: "full-arrival",
    environmentSharePercent: 95,
    description: "Arrival experience — greeting, invite, conversation entry",
    workingLayerDominant: false,
  },
  "window-seat": {
    level: "environmental-header",
    environmentSharePercent: 35,
    description: "Window Seat™ header — Clear My Mind™ capture below",
    workingLayerDominant: true,
  },
  "kitchen-table": {
    level: "environmental-header",
    environmentSharePercent: 30,
    description: "Today's Reality — gentle morning table, work below",
    workingLayerDominant: true,
  },
  "planning-table": {
    level: "warm-workspace",
    environmentSharePercent: 25,
    description: "Warm tabletop surface behind the planner",
    workingLayerDominant: true,
  },
  "business-office": {
    level: "office-atmosphere",
    environmentSharePercent: 20,
    description: "Office atmosphere — dashboard remains the focus",
    workingLayerDominant: true,
  },
  "focus-studio": {
    level: "restrained-focus",
    environmentSharePercent: 10,
    description: "Very restrained — concentration is sacred",
    workingLayerDominant: true,
  },
  "creative-studio": {
    level: "creative-studio",
    environmentSharePercent: 30,
    description: "Create — color and permission without clutter",
    workingLayerDominant: true,
  },
  "reading-nook": {
    level: "warm-workspace",
    environmentSharePercent: 25,
    description: "Learn — reading light and quiet shelf",
    workingLayerDominant: true,
  },
  library: {
    level: "warm-workspace",
    environmentSharePercent: 25,
    description: "Learn — books as quiet companions",
    workingLayerDominant: true,
  },
  workshop: {
    level: "warm-workspace",
    environmentSharePercent: 25,
    description: "Hands-on projects with practical warmth",
    workingLayerDominant: true,
  },
  garden: {
    level: "environmental-header",
    environmentSharePercent: 40,
    description: "Outdoor breath — gentle header",
    workingLayerDominant: true,
  },
  "garden-path": {
    level: "environmental-header",
    environmentSharePercent: 35,
    description: "Walking meditation between tasks",
    workingLayerDominant: true,
  },
  greenhouse: {
    level: "environmental-header",
    environmentSharePercent: 35,
    description: "Growing ideas — soft greenhouse light",
    workingLayerDominant: true,
  },
  "back-deck": {
    level: "environmental-header",
    environmentSharePercent: 35,
    description: "Pause and perspective",
    workingLayerDominant: true,
  },
  "fire-circle": {
    level: "warm-workspace",
    environmentSharePercent: 30,
    description: "Evening reflection circle",
    workingLayerDominant: true,
  },
  "front-porch": {
    level: "environmental-header",
    environmentSharePercent: 35,
    description: "Transition space — arriving or leaving",
    workingLayerDominant: true,
  },
  barn: {
    level: "office-atmosphere",
    environmentSharePercent: 20,
    description: "Practical work storage",
    workingLayerDominant: true,
  },
  "outlook-point": {
    level: "environmental-header",
    environmentSharePercent: 40,
    description: "Big picture — horizon without overwhelm",
    workingLayerDominant: true,
  },
  "adventure-room": {
    level: "creative-studio",
    environmentSharePercent: 35,
    description: "Travel and adventure planning",
    workingLayerDominant: true,
  },
  "future-wings": {
    level: "subtle",
    environmentSharePercent: 15,
    description: "Reserved — not yet built",
    workingLayerDominant: true,
  },
};

export type HouseMapNavId =
  | "home"
  | "clear-my-mind"
  | "todays-reality"
  | "plan-my-day"
  | "focus"
  | "create"
  | "business"
  | "learn";

export type HouseMapNavItem = {
  id: HouseMapNavId;
  label: string;
  objectId: string;
  placeId: CompanionPlaceId;
  /** App section or route target when user intentionally moves rooms. */
  section?: AppSection;
  /** Top bar action key when implemented via header actions today. */
  topBarAction?: "clear-my-mind" | "plan-my-day" | "todays-reality";
  status: "production" | "partial" | "planned";
};

/**
 * Top Navigation = The House Map™
 * Moving from room to room — not a generic software menu.
 */
export const HOUSE_MAP_NAV: readonly HouseMapNavItem[] = [
  {
    id: "home",
    label: "Home",
    objectId: "nav-home",
    placeId: "living-room",
    section: "home",
    status: "production",
  },
  {
    id: "clear-my-mind",
    label: "Clear My Mind",
    objectId: "clear-my-mind",
    placeId: "window-seat",
    section: "brain-dump",
    topBarAction: "clear-my-mind",
    status: "partial",
  },
  {
    id: "todays-reality",
    label: "Today's Reality",
    objectId: "todays-reality",
    placeId: "kitchen-table",
    topBarAction: "todays-reality",
    status: "partial",
  },
  {
    id: "plan-my-day",
    label: "Plan My Day",
    objectId: "plan-my-day",
    placeId: "planning-table",
    section: "plan-my-day",
    topBarAction: "plan-my-day",
    status: "production",
  },
  {
    id: "focus",
    label: "Focus",
    objectId: "focus-studio",
    placeId: "focus-studio",
    section: "focus",
    status: "partial",
  },
  {
    id: "create",
    label: "Create",
    objectId: "create",
    placeId: "creative-studio",
    section: "content-generator",
    status: "partial",
  },
  {
    id: "business",
    label: "Business",
    objectId: "business",
    placeId: "business-office",
    section: "business-profile",
    status: "planned",
  },
  {
    id: "learn",
    label: "Learn",
    objectId: "learning",
    placeId: "library",
    section: "how-do-i",
    status: "partial",
  },
] as const;

export type ToolbeltItemId =
  | "new-conversation"
  | "search"
  | "my-thoughts"
  | "parking-lot"
  | "projects"
  | "templates"
  | "settings"
  | "saved-work"
  | "snippets";

export type ToolbeltItem = {
  id: ToolbeltItemId;
  label: string;
  objectId: string;
  /** Visual priority — toolbelt is always secondary to the room. */
  visualWeight: "primary" | "secondary" | "utility";
  section?: AppSection;
  sidebarNavId?: string;
  status: "production" | "partial" | "planned";
};

/**
 * Left Sidebar = The Companion Toolbelt™
 * Built-in cabinetry — quiet access to tools, never competing with the room.
 */
export const COMPANION_TOOLBELT: readonly ToolbeltItem[] = [
  {
    id: "new-conversation",
    label: "New Conversation",
    objectId: "messages",
    visualWeight: "primary",
    sidebarNavId: "chat",
    status: "production",
  },
  {
    id: "search",
    label: "Search",
    objectId: "search",
    visualWeight: "utility",
    section: "how-do-i",
    status: "partial",
  },
  {
    id: "my-thoughts",
    label: "My Thoughts",
    objectId: "toolbelt-my-thoughts",
    visualWeight: "secondary",
    section: "brain-dump",
    status: "partial",
  },
  {
    id: "parking-lot",
    label: "Parking Lot",
    objectId: "parking-lot",
    visualWeight: "secondary",
    status: "planned",
  },
  {
    id: "projects",
    label: "Projects",
    objectId: "projects",
    visualWeight: "secondary",
    section: "projects",
    sidebarNavId: "other",
    status: "production",
  },
  {
    id: "templates",
    label: "Templates",
    objectId: "toolbelt-templates",
    visualWeight: "secondary",
    section: "templates-library",
    status: "production",
  },
  {
    id: "settings",
    label: "Settings",
    objectId: "settings",
    visualWeight: "utility",
    section: "settings",
    status: "production",
  },
  {
    id: "saved-work",
    label: "Saved Work",
    objectId: "toolbelt-saved-work",
    visualWeight: "secondary",
    section: "saved-work",
    status: "production",
  },
  {
    id: "snippets",
    label: "Snippets",
    objectId: "toolbelt-snippets",
    visualWeight: "secondary",
    section: "snippets",
    status: "production",
  },
] as const;

export type ResolvedCompanionLayout = {
  placeId: CompanionPlaceId;
  placeName: string;
  immersion: RoomImmersionProfile;
  houseMapItem: HouseMapNavItem | null;
  layers: typeof LAYOUT_LAYERS;
};

export function houseMapForPlace(
  placeId: CompanionPlaceId,
): HouseMapNavItem | null {
  return HOUSE_MAP_NAV.find((item) => item.placeId === placeId) ?? null;
}

export function placeForSection(section: AppSection): CompanionPlaceId {
  const match = HOUSE_MAP_NAV.find((item) => item.section === section);
  if (match) return match.placeId;

  switch (section) {
    case "today":
    case "home":
      return "living-room";
    case "brain-dump":
      return "window-seat";
    case "plan-my-day":
      return "planning-table";
    case "visual-focus":
      return "focus-studio";
    case "content-generator":
    case "my-work":
      return "creative-studio";
    case "projects":
    case "templates-library":
    case "snippets":
    case "saved-work":
      return "workshop";
    case "how-do-i":
      return "library";
    case "growth":
    case "my-journey":
      return "reading-nook";
    default:
      return "living-room";
  }
}

export function resolveCompanionLayout(input: {
  section?: AppSection;
  placeId?: CompanionPlaceId;
}): ResolvedCompanionLayout {
  const placeId = input.placeId ?? placeForSection(input.section ?? "home");
  const place = placeById(placeId);
  const immersion =
    ROOM_IMMERSION_BY_PLACE[placeId] ??
    ROOM_IMMERSION_BY_PLACE["living-room"];

  return {
    placeId,
    placeName: place.name,
    immersion,
    houseMapItem: houseMapForPlace(placeId),
    layers: LAYOUT_LAYERS,
  };
}

export type LayoutSeparationCheck = {
  id: string;
  passed: boolean;
  reason?: string;
};

/**
 * Validates that navigation and room remain separate concerns.
 * Used in tests and Director's Studio diagnostics.
 */
export function evaluateLayoutSeparation(input: {
  navigationHidden: boolean;
  environmentReplacesAllChrome: boolean;
  workingLayerVisible: boolean;
  isArrivalRoom: boolean;
}): LayoutSeparationCheck[] {
  return [
    {
      id: "navigation-persistent",
      passed: !input.navigationHidden,
      reason: input.navigationHidden
        ? "House Map and Toolbelt must remain findable"
        : undefined,
    },
    {
      id: "environment-not-navigation",
      passed: !input.environmentReplacesAllChrome,
      reason: input.environmentReplacesAllChrome
        ? "The photograph is not the application shell"
        : undefined,
    },
    {
      id: "working-layer-present",
      passed: input.isArrivalRoom || input.workingLayerVisible,
      reason:
        !input.isArrivalRoom && !input.workingLayerVisible
          ? "Work rooms need a visible working layer"
          : undefined,
    },
  ];
}

export function layoutSeparationPassed(
  checks: LayoutSeparationCheck[],
): boolean {
  return checks.every((check) => check.passed);
}
