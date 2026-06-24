/**
 * Companion Intelligence™ — permanent category themes for all visual map types.
 */

export type IntelligenceCategoryId =
  | "summary"
  | "key_relationships"
  | "patterns"
  | "risks"
  | "opportunities"
  | "recommendations"
  | "board_observations"
  | "what_if"
  | "next_steps";

export type IntelligenceCategoryTheme = {
  id: IntelligenceCategoryId;
  icon: string;
  title: string;
  subtitle: string;
  headerBg: string;
  headerText: string;
  border: string;
  accent: string;
};

export const INTELLIGENCE_CATEGORY_THEMES: Record<
  IntelligenceCategoryId,
  IntelligenceCategoryTheme
> = {
  summary: {
    id: "summary",
    icon: "📋",
    title: "Business Summary™",
    subtitle: "Quick overview of how the business currently fits together.",
    headerBg: "#eff6ff",
    headerText: "#1d4ed8",
    border: "#93c5fd",
    accent: "#2563eb",
  },
  key_relationships: {
    id: "key_relationships",
    icon: "🔗",
    title: "Key Relationships™",
    subtitle: "Important connections and dependencies discovered within the canvas.",
    headerBg: "#f5f3ff",
    headerText: "#6d28d9",
    border: "#c4b5fd",
    accent: "#7c3aed",
  },
  patterns: {
    id: "patterns",
    icon: "📈",
    title: "Patterns™",
    subtitle: "Themes, trends, and repeated observations identified by Companion Intelligence™.",
    headerBg: "#f0fdfa",
    headerText: "#0f766e",
    border: "#5eead4",
    accent: "#0d9488",
  },
  risks: {
    id: "risks",
    icon: "⚠️",
    title: "Risks™",
    subtitle: "Potential weaknesses, dependencies, gaps, or business concerns.",
    headerBg: "#fef2f2",
    headerText: "#b91c1c",
    border: "#fca5a5",
    accent: "#dc2626",
  },
  opportunities: {
    id: "opportunities",
    icon: "🚀",
    title: "Opportunities™",
    subtitle: "Growth opportunities, leverage points, and potential improvements.",
    headerBg: "#f0fdf4",
    headerText: "#15803d",
    border: "#86efac",
    accent: "#16a34a",
  },
  recommendations: {
    id: "recommendations",
    icon: "✅",
    title: "Recommendations™",
    subtitle: "Suggested next actions and priorities.",
    headerBg: "#fffbeb",
    headerText: "#b45309",
    border: "#fcd34d",
    accent: "#d97706",
  },
  board_observations: {
    id: "board_observations",
    icon: "🧠",
    title: "Board of Directors™ Observations",
    subtitle: "Strategic observations from the advisory layer.",
    headerBg: "#f0f4f4",
    headerText: "#1e4f4f",
    border: "#94a3b8",
    accent: "#334155",
  },
  what_if: {
    id: "what_if",
    icon: "🌊",
    title: "What-If Analysis™",
    subtitle: "Ripple effects and impact when exploring business changes.",
    headerBg: "#ecfeff",
    headerText: "#0e7490",
    border: "#67e8f9",
    accent: "#0891b2",
  },
  next_steps: {
    id: "next_steps",
    icon: "👣",
    title: "Suggested Next Steps™",
    subtitle: "Concrete moves to keep momentum after reviewing intelligence.",
    headerBg: "#fffbeb",
    headerText: "#a16207",
    border: "#fde68a",
    accent: "#ca8a04",
  },
};

/** Display order for intelligence cards. */
export const INTELLIGENCE_CATEGORY_ORDER: IntelligenceCategoryId[] = [
  "summary",
  "key_relationships",
  "patterns",
  "risks",
  "opportunities",
  "recommendations",
  "board_observations",
  "what_if",
  "next_steps",
];

export type IntelligenceViewMode =
  | "canvas-intelligence"
  | "canvas-only"
  | "intelligence-only";

export const INTELLIGENCE_VIEW_MODE_LABELS: Record<IntelligenceViewMode, string> = {
  "canvas-intelligence": "Canvas + Intelligence",
  "canvas-only": "Canvas Only",
  "intelligence-only": "Intelligence Only",
};
