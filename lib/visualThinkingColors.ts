/**
 * Ecosystem-wide visual thinking color language.
 * Reusable across Decision Compass, Clear My Mind, Strategies, Projects, Create, Client Avatars.
 */

export type VisualThinkingTone =
  | "benefit"
  | "fact"
  | "idea"
  | "question"
  | "concern"
  | "insight"
  | "option-a"
  | "option-b"
  | "decision";

export type VisualThinkingPalette = {
  bg: string;
  bgGradient: string;
  border: string;
  text: string;
  shadow: string;
  connector: string;
};

export const VISUAL_THINKING_COLORS: Record<VisualThinkingTone, VisualThinkingPalette> = {
  benefit: {
    bg: "#ecfdf3",
    bgGradient: "linear-gradient(145deg, #ecfdf3 0%, #d1fae5 100%)",
    border: "#6ee7a0",
    text: "#14532d",
    shadow: "0 8px 24px rgba(34, 197, 94, 0.18)",
    connector: "#86efac",
  },
  fact: {
    bg: "#eff6ff",
    bgGradient: "linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)",
    border: "#93c5fd",
    text: "#1e3a5f",
    shadow: "0 8px 24px rgba(59, 130, 246, 0.16)",
    connector: "#93c5fd",
  },
  idea: {
    bg: "#f5f3ff",
    bgGradient: "linear-gradient(145deg, #f5f3ff 0%, #ede9fe 100%)",
    border: "#c4b5fd",
    text: "#4c1d95",
    shadow: "0 8px 24px rgba(139, 92, 246, 0.16)",
    connector: "#c4b5fd",
  },
  question: {
    bg: "#fff7ed",
    bgGradient: "linear-gradient(145deg, #fff7ed 0%, #ffedd5 100%)",
    border: "#fdba74",
    text: "#9a3412",
    shadow: "0 8px 24px rgba(249, 115, 22, 0.14)",
    connector: "#fdba74",
  },
  concern: {
    bg: "#fff1f2",
    bgGradient: "linear-gradient(145deg, #fff1f2 0%, #ffe4e6 100%)",
    border: "#fda4af",
    text: "#9f1239",
    shadow: "0 8px 24px rgba(244, 63, 94, 0.14)",
    connector: "#fda4af",
  },
  insight: {
    bg: "#fffbeb",
    bgGradient: "linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)",
    border: "#fcd34d",
    text: "#92400e",
    shadow: "0 8px 24px rgba(245, 158, 11, 0.22)",
    connector: "#fcd34d",
  },
  "option-a": {
    bg: "#ecfdf5",
    bgGradient: "linear-gradient(145deg, #ecfdf5 0%, #a7f3d0 100%)",
    border: "#34d399",
    text: "#064e3b",
    shadow: "0 12px 32px rgba(16, 185, 129, 0.22)",
    connector: "#6ee7b7",
  },
  "option-b": {
    bg: "#eff6ff",
    bgGradient: "linear-gradient(145deg, #eff6ff 0%, #bfdbfe 100%)",
    border: "#60a5fa",
    text: "#1e3a8a",
    shadow: "0 12px 32px rgba(59, 130, 246, 0.2)",
    connector: "#93c5fd",
  },
  decision: {
    bg: "#faf7f2",
    bgGradient: "linear-gradient(145deg, #ffffff 0%, #f0ebe3 100%)",
    border: "#1e4f4f",
    text: "#1f1c19",
    shadow: "0 16px 40px rgba(30, 79, 79, 0.2)",
    connector: "#1e4f4f",
  },
};

export const CHILD_NODE_META = {
  benefits: { icon: "✅", label: "Benefits", tone: "benefit" as const },
  concerns: { icon: "⚠", label: "Concerns", tone: "concern" as const },
  financial: { icon: "💰", label: "Financial", tone: "fact" as const },
  stress: { icon: "😌", label: "Stress", tone: "fact" as const },
  growth: { icon: "📈", label: "Growth", tone: "benefit" as const },
  longTerm: { icon: "🎯", label: "Long-Term", tone: "insight" as const },
} as const;
