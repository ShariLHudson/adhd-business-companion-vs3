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
    desc: "A soft rainbow that shifts with your situation — alive, not loud.",
    explanation:
      "The Companion uses a warm soft rainbow — blue, purple, teal, sage, gold, coral, rose — that shifts with what you're doing. Clearly different from Minimal, never neon.",
    previewNote: "The whole workspace gently shifts color with your context.",
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

/** Companion modes — soft rainbow shifts with context (dynamic preview). */
export const DYNAMIC_MODE_SWATCHES = [
  { id: "support", label: "Blue", color: "#5B8FC9", tint: "#E8F0F8" },
  { id: "recovery", label: "Soft Purple", color: "#9B87C4", tint: "#F2EFF8" },
  { id: "focus", label: "Teal", color: "#4F9E9E", tint: "#EAF4F4" },
  { id: "sage", label: "Sage Green", color: "#7A9E7E", tint: "#EFF5F0" },
  { id: "celebration", label: "Warm Gold", color: "#C4A05A", tint: "#FAF5EB" },
  { id: "coral", label: "Coral", color: "#D4897A", tint: "#FBF0ED" },
  { id: "planning", label: "Dusty Rose", color: "#C48992", tint: "#FAF0F2" },
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
