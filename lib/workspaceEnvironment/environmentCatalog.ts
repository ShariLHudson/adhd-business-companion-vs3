import type {
  WorkspaceEnvironmentDefinition,
  WorkspaceEnvironmentId,
  WorkspaceThemeDefinition,
  WorkspaceThemeId,
} from "./types";

export const WORKSPACE_ENVIRONMENT_CATALOG: Record<
  WorkspaceEnvironmentId,
  WorkspaceEnvironmentDefinition
> = {
  "creative-marketing-studio": {
    id: "creative-marketing-studio",
    title: "Creative Marketing Studio",
    kind: "estate_place",
    estatePlaceId: "creative-studio",
    description: "Warm studio light for campaigns, messaging, and creative planning.",
  },
  "executive-strategy-office": {
    id: "executive-strategy-office",
    title: "Executive Strategy Office",
    kind: "estate_place",
    estatePlaceId: "strategy-studio",
    description: "Calm executive space for strategic thinking and decisions.",
  },
  "modern-project-studio": {
    id: "modern-project-studio",
    title: "Modern Project Studio",
    kind: "estate_place",
    estatePlaceId: "goals-projects",
    description: "Clear project boards and focused execution energy.",
  },
  "authors-library": {
    id: "authors-library",
    title: "Author's Library",
    kind: "estate_place",
    estatePlaceId: "library",
    description: "Quiet shelves for writing and long-form thought.",
  },
  "teaching-studio": {
    id: "teaching-studio",
    title: "Teaching Studio",
    kind: "professional_extension",
    estatePlaceId: "study-hall",
    description: "Teaching-ready space for courses and learning design.",
  },
  "recording-studio": {
    id: "recording-studio",
    title: "Recording Studio",
    kind: "estate_place",
    estatePlaceId: "music-room",
    description: "Focused acoustic calm for podcast and audio work.",
  },
  "executive-financial-office": {
    id: "executive-financial-office",
    title: "Executive Financial Office",
    kind: "professional_extension",
    estatePlaceId: "study-hall",
    description: "Orderly office atmosphere for numbers and stewardship.",
  },
  "innovation-lab": {
    id: "innovation-lab",
    title: "Innovation Lab",
    kind: "estate_place",
    estatePlaceId: "observatory",
    description: "Curious, open space for research and exploration.",
  },
  "university-reading-room": {
    id: "university-reading-room",
    title: "University Reading Room",
    kind: "estate_place",
    estatePlaceId: "momentum-institute",
    description: "Scholarly calm for learning and study.",
  },
  "event-planning-studio": {
    id: "event-planning-studio",
    title: "Event Planning Studio",
    kind: "professional_extension",
    estatePlaceId: "creative-studio",
    description: "Studio energy for run-of-show, guests, and event logistics.",
  },
  "professional-meeting-suite": {
    id: "professional-meeting-suite",
    title: "Professional Meeting Suite",
    kind: "professional_extension",
    estatePlaceId: "round-table",
    description: "Client-ready meeting atmosphere for relationship planning.",
  },
  "executive-planning-office": {
    id: "executive-planning-office",
    title: "Executive Planning Office",
    kind: "estate_place",
    estatePlaceId: "strategy-studio",
    description: "Settled planning space for business operating systems.",
  },
  "modern-office": {
    id: "modern-office",
    title: "Modern Office",
    kind: "professional_extension",
    description: "Clean contemporary office for general focused work.",
  },
  "mountain-cabin": {
    id: "mountain-cabin",
    title: "Mountain Cabin",
    kind: "professional_extension",
    description: "Quiet retreat atmosphere for deep thinking.",
  },
  "beach-house": {
    id: "beach-house",
    title: "Beach House",
    kind: "professional_extension",
    description: "Open, airy light for spacious creative work.",
  },
  "coffee-shop": {
    id: "coffee-shop",
    title: "Coffee Shop",
    kind: "estate_place",
    estatePlaceId: "coffee-house",
    description: "Gentle ambient presence without blank-screen loneliness.",
  },
  library: {
    id: "library",
    title: "Library",
    kind: "estate_place",
    estatePlaceId: "library",
    description: "Classic library calm for reading and writing.",
  },
  "creative-loft": {
    id: "creative-loft",
    title: "Creative Loft",
    kind: "estate_place",
    estatePlaceId: "art-studio",
    description: "Loft light for making and inventing.",
  },
  "garden-studio": {
    id: "garden-studio",
    title: "Garden Studio",
    kind: "estate_place",
    estatePlaceId: "greenhouse",
    description: "Living greenery for restorative creative sessions.",
  },
  "minimal-workspace": {
    id: "minimal-workspace",
    title: "Minimal Workspace",
    kind: "professional_extension",
    description: "Low-stimulation surface for high cognitive load days.",
  },
  "executive-office": {
    id: "executive-office",
    title: "Executive Office",
    kind: "professional_extension",
    estatePlaceId: "strategy-studio",
    description: "Formal calm for leadership and planning.",
  },
  "glass-conservatory": {
    id: "glass-conservatory",
    title: "Glass Conservatory",
    kind: "estate_place",
    estatePlaceId: "conservatory",
    description: "Light-filled glass for conversation and gentle work.",
  },
};

export const WORKSPACE_THEME_CATALOG: Record<
  WorkspaceThemeId,
  WorkspaceThemeDefinition
> = {
  default: {
    id: "default",
    title: "Default",
    description: "Natural atmosphere for the chosen workspace.",
  },
  "morning-light": {
    id: "morning-light",
    title: "Morning Light",
    description: "Soft early light for beginning the day.",
  },
  "golden-hour": {
    id: "golden-hour",
    title: "Golden Hour",
    description: "Warm late-day glow for reflective work.",
  },
  "rainy-day": {
    id: "rainy-day",
    title: "Rainy Day",
    description: "Gentle rain atmosphere for inward focus.",
  },
  snowfall: {
    id: "snowfall",
    title: "Snowfall",
    description: "Quiet winter stillness.",
  },
  autumn: {
    id: "autumn",
    title: "Autumn",
    description: "Seasonal warmth and softer contrast.",
  },
  spring: {
    id: "spring",
    title: "Spring",
    description: "Fresh light and renewal.",
  },
  night: {
    id: "night",
    title: "Night",
    description: "Low evening light for calm late work.",
  },
  fireplace: {
    id: "fireplace",
    title: "Fireplace",
    description: "Warm hearth presence without distraction.",
  },
  "ocean-view": {
    id: "ocean-view",
    title: "Ocean View",
    description: "Open horizon calm.",
  },
  christmas: {
    id: "christmas",
    title: "Christmas",
    description: "Seasonal holiday atmosphere — optional and never forced.",
  },
};

export function getWorkspaceEnvironment(
  id: WorkspaceEnvironmentId,
): WorkspaceEnvironmentDefinition {
  return WORKSPACE_ENVIRONMENT_CATALOG[id];
}

export function getWorkspaceTheme(id: WorkspaceThemeId): WorkspaceThemeDefinition {
  return WORKSPACE_THEME_CATALOG[id];
}
