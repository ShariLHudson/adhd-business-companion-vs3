import type { VisualMode } from "@/lib/companionStore";

/** User-facing labels for the three visual color modes. */
export const VISUAL_COLOR_OPTIONS: {
  id: VisualMode;
  label: string;
  desc: string;
}[] = [
  {
    id: "decorative",
    label: "Dynamic Colors",
    desc: "Colors adapt to your current situation.",
  },
  {
    id: "meaning",
    label: "Meaning-Based Colors",
    desc: "Colors stay consistent and represent specific areas of the app.",
  },
  { id: "off", label: "None", desc: "Clean and minimal — no color coding." },
];

/** Companion modes — colors shift with context (dynamic preview). */
export const DYNAMIC_MODE_SWATCHES = [
  { id: "support", label: "Support", color: "#7eb8da", tint: "#e8f2f8" },
  { id: "recovery", label: "Recovery", color: "#b8a8d8", tint: "#f0ebf8" },
  { id: "focus", label: "Focus", color: "#1e4f4f", tint: "#e6f0f0" },
  { id: "celebration", label: "Celebration", color: "#d4a574", tint: "#faf3ea" },
  { id: "planning", label: "Planning", color: "#6b8e23", tint: "#f0f5e8" },
] as const;

/** Fixed category colors — meaning stays constant (meaning-based preview). */
export const MEANING_CATEGORY_SWATCHES = [
  { label: "Projects", color: "#1e4f4f" },
  { label: "Focus", color: "#4a6fa5" },
  { label: "Recovery", color: "#9a6fb0" },
  { label: "Relationships", color: "#c08090" },
  { label: "Planning", color: "#6b8e23" },
] as const;

export function visualModeLabel(mode: VisualMode): string {
  return VISUAL_COLOR_OPTIONS.find((o) => o.id === mode)?.label ?? "None";
}
