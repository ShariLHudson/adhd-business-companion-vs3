import type { VisualMode } from "@/lib/companionStore";
import type { AdaptiveVisualContext } from "@/lib/adaptiveVisualContext";

/** Design tokens consumed by companion.css via CSS custom properties. */
export type CompanionThemeTokens = {
  background: string;
  canvas: string;
  card: string;
  border: string;
  accent: string;
  accentContrast: string;
  accentTint: string;
  text: string;
  muted: string;
  navActive: string;
  sidebarTint: string;
  headerBand: string;
};

export const MINIMAL_THEME_TOKENS: CompanionThemeTokens = {
  background: "#fafaf8",
  canvas: "#ffffff",
  card: "#ffffff",
  border: "#e5e5e0",
  accent: "#1e4f4f",
  accentContrast: "#ffffff",
  accentTint: "#f3f6f6",
  text: "#2d2926",
  muted: "#7a736c",
  navActive: "#1e4f4f",
  sidebarTint: "#6e6a66",
  headerBand: "transparent",
};

export const CATEGORY_THEME_TOKENS: CompanionThemeTokens = {
  background: "#f2f7f4",
  canvas: "#f8fbf9",
  card: "#ffffff",
  border: "#c5d9ce",
  accent: "#1e4f4f",
  accentContrast: "#ffffff",
  accentTint: "#e3f0ec",
  text: "#1a2e28",
  muted: "#5a6f66",
  navActive: "#1e4f4f",
  sidebarTint: "#3d5c52",
  headerBand: "rgba(30, 79, 79, 0.16)",
};

/** Soft rainbow — warm, distinct, never neon. */
export const SOFT_RAINBOW_SWATCHES = [
  { id: "blue", label: "Blue", color: "#5B8FC9", tint: "#E8F0F8" },
  { id: "purple", label: "Soft Purple", color: "#9B87C4", tint: "#F2EFF8" },
  { id: "teal", label: "Teal", color: "#4F9E9E", tint: "#EAF4F4" },
  { id: "sage", label: "Sage Green", color: "#7A9E7E", tint: "#EFF5F0" },
  { id: "gold", label: "Warm Gold", color: "#C4A05A", tint: "#FAF5EB" },
  { id: "coral", label: "Coral", color: "#D4897A", tint: "#FBF0ED" },
  { id: "rose", label: "Dusty Rose", color: "#C48992", tint: "#FAF0F2" },
] as const;

/** Adaptive palette — soft rainbow mapped to live contexts. */
export const ADAPTIVE_CONTEXT_TOKENS: Record<
  AdaptiveVisualContext,
  CompanionThemeTokens
> = {
  support: {
    background: "#E8F0F8",
    canvas: "#F2F7FB",
    card: "#ffffff",
    border: "#A8C4E8",
    accent: "#5B8FC9",
    accentContrast: "#ffffff",
    accentTint: "#D8E6F4",
    text: "#2A3D52",
    muted: "#5A6F85",
    navActive: "#4A7FB8",
    sidebarTint: "#5A7A9E",
    headerBand: "rgba(91, 143, 201, 0.22)",
  },
  recovery: {
    background: "#F2EFF8",
    canvas: "#F7F5FB",
    card: "#ffffff",
    border: "#D0C5E8",
    accent: "#9B87C4",
    accentContrast: "#ffffff",
    accentTint: "#E4DCF2",
    text: "#3D3450",
    muted: "#6B6080",
    navActive: "#8A75B8",
    sidebarTint: "#7A6A9E",
    headerBand: "rgba(155, 135, 196, 0.22)",
  },
  focus: {
    background: "#EAF4F4",
    canvas: "#F2F9F9",
    card: "#ffffff",
    border: "#A8D4D4",
    accent: "#4F9E9E",
    accentContrast: "#ffffff",
    accentTint: "#D4EAEA",
    text: "#2A4545",
    muted: "#5A7575",
    navActive: "#458F8F",
    sidebarTint: "#4A8585",
    headerBand: "rgba(79, 158, 158, 0.22)",
  },
  celebration: {
    background: "#FAF5EB",
    canvas: "#FDF9F2",
    card: "#ffffff",
    border: "#E5D4A8",
    accent: "#C4A05A",
    accentContrast: "#3D3018",
    accentTint: "#F2E8D4",
    text: "#3D3018",
    muted: "#7A6840",
    navActive: "#B08E4A",
    sidebarTint: "#9A7E45",
    headerBand: "rgba(196, 160, 90, 0.25)",
  },
  planning: {
    background: "#FAF0F2",
    canvas: "#FCF5F6",
    card: "#ffffff",
    border: "#E8C4CC",
    accent: "#C48992",
    accentContrast: "#ffffff",
    accentTint: "#F2DDE1",
    text: "#4A3238",
    muted: "#8A6068",
    navActive: "#B07882",
    sidebarTint: "#A07078",
    headerBand: "rgba(196, 137, 146, 0.22)",
  },
};

/** Fixed category accent colors (Category Colors mode). */
export const CATEGORY_AREA_COLORS: Record<string, string> = {
  projects: "#1e4f4f",
  create: "#4a6fa5",
  focus: "#4f9e9e",
  recovery: "#9b87c4",
  planning: "#7a9e7e",
  relationships: "#c48992",
  "my-work": "#d4897a",
  today: "#5b8fc9",
  snippets: "#c4a05a",
  templates: "#7a9e7e",
};

/** Screens that read theme tokens via CSS variables on the app shell. */
export const THEME_CONSUMING_SURFACES = [
  "App shell (page root)",
  "AppSidebar navigation",
  "TopBar",
  "IdentityBar",
  "WorkspaceLayout canvas",
  "Workspace panels (.companion-panel-surface)",
  "Chat input (.input-glass)",
  "Today",
  "Projects",
  "Create (content-generator)",
  "Focus / Focus timer",
  "My Work",
  "Snippets",
  "Templates",
  "Plan My Day",
  "Momentum Appointments (time-block)",
  "Brain Dump (contextColor per mode)",
] as const;

export function themeTokensForMode(
  mode: VisualMode,
  adaptiveContext: AdaptiveVisualContext = "support",
): CompanionThemeTokens {
  if (mode === "off") return MINIMAL_THEME_TOKENS;
  if (mode === "meaning") return CATEGORY_THEME_TOKENS;
  return ADAPTIVE_CONTEXT_TOKENS[adaptiveContext];
}

export function visualModeProofLabel(
  mode: VisualMode,
  adaptiveContext: AdaptiveVisualContext,
): string {
  if (mode === "off") return "Minimal";
  if (mode === "meaning") return "Category Colors";
  const ctx =
    adaptiveContext.charAt(0).toUpperCase() + adaptiveContext.slice(1);
  return `Adaptive · ${ctx}`;
}
