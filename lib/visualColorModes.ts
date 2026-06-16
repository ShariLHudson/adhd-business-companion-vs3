import type { VisualMode } from "@/lib/companionStore";

/** User-facing labels for the three visual color modes. */
export const VISUAL_COLOR_OPTIONS: {
  id: VisualMode;
  label: string;
  desc: string;
  explanation: string;
  previewNote: string;
}[] = [
  {
    id: "decorative",
    label: "Adaptive Colors",
    desc: "Colors shift with your current situation.",
    explanation:
      "The Companion changes colors based on your current situation. For example, calm moments may appear differently than planning or focus moments.",
    previewNote: "The same workspace changes color depending on what is happening.",
  },
  {
    id: "meaning",
    label: "Category Colors",
    desc: "Each area keeps a consistent color so you can scan faster.",
    explanation:
      "Each area of the app always uses the same color so you can recognize sections quickly.",
    previewNote: "Colors stay attached to categories.",
  },
  {
    id: "off",
    label: "Minimal",
    desc: "Clean, simple, and consistent — no color coding.",
    explanation: "No color coding. Clean, simple, and consistent.",
    previewNote: "No color changes are applied.",
  },
];

/** Companion modes — colors shift with context (dynamic preview). */
export const DYNAMIC_MODE_SWATCHES = [
  { id: "support", label: "Support", color: "#7eb8da", tint: "#e8f2f8" },
  { id: "recovery", label: "Recovery", color: "#b8a8d8", tint: "#f0ebf8" },
  { id: "focus", label: "Focus", color: "#1e4f4f", tint: "#e6f0f0" },
  { id: "celebration", label: "Celebration", color: "#d4a574", tint: "#faf3ea" },
  { id: "planning", label: "Planning", color: "#6b8e23", tint: "#f0f5e8" },
] as const;

/** Fixed category colors — meaning stays constant (category preview). */
export const MEANING_CATEGORY_SWATCHES = [
  { label: "Projects", color: "#1e4f4f" },
  { label: "Focus", color: "#4a6fa5" },
  { label: "Recovery", color: "#9a6fb0" },
  { label: "Relationships", color: "#c08090" },
  { label: "Planning", color: "#6b8e23" },
] as const;

export function visualModeLabel(mode: VisualMode): string {
  return VISUAL_COLOR_OPTIONS.find((o) => o.id === mode)?.label ?? "Minimal";
}
