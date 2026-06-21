import type { AppSection } from "@/lib/companionUi";
import type { SettingsSection } from "@/components/companion/SettingsPanel";

export type HowDoIHelpCategoryId =
  | "getting-started"
  | "conversation"
  | "focus-momentum"
  | "planning"
  | "create"
  | "business-growth"
  | "workspace"
  | "personal-growth"
  | "adhd-support"
  | "decisions"
  | "personalization";

export type HowDoIHelpCategory = {
  id: HowDoIHelpCategoryId;
  label: string;
  emoji: string;
  description: string;
};

export type HowDoIHelpArticle = {
  id: string;
  categoryId: HowDoIHelpCategoryId;
  title: string;
  emoji: string;
  whatItIs: string;
  whenToUse: string;
  workflow: string[];
  tips: string[];
  keywords: string[];
  /** Shown in the default browse grid (not all 40+ at once). */
  featured?: boolean;
  openSection?: AppSection;
  openActivityId?: string;
  openSettingsSection?: SettingsSection;
  openLabel?: string;
  askPrompt?: string;
};

export const HOW_DO_I_COMPANION_PRINCIPLE =
  "The Companion helps you think. You stay in control. Nothing is added to your workspace unless you choose to add it.";

export const HOW_DO_I_CORE_WORKFLOW = {
  title: "ADHD Business Ecosystem Workflow",
  steps: [
    "Capture thoughts in Clear My Mind.",
    "Move important ideas into Projects.",
    "Use Create to build content.",
    "Use Plan My Day to schedule work.",
    "Save finished work in My Work.",
    "Track progress in 🌱 Growth — Wins, Evidence Bank, My Highlights, and My Journey.",
  ],
} as const;

export const HOW_DO_I_CATEGORIES: HowDoIHelpCategory[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    emoji: "🚀",
    description: "For brand-new users.",
  },
  {
    id: "conversation",
    label: "Conversation Companion",
    emoji: "💬",
    description: "One of the most important areas.",
  },
  {
    id: "focus-momentum",
    label: "Focus & Momentum",
    emoji: "🎯",
    description: "Start, sustain, and recover focus.",
  },
  {
    id: "planning",
    label: "Planning",
    emoji: "📅",
    description: "Shape your day without rigid pressure.",
  },
  {
    id: "create",
    label: "Create",
    emoji: "✍️",
    description: "Build business assets with guidance.",
  },
  {
    id: "business-growth",
    label: "Business Growth",
    emoji: "📈",
    description: "Marketing, sales, and visibility.",
  },
  {
    id: "workspace",
    label: "Workspace System",
    emoji: "💼",
    description: "Where your work lives and connects.",
  },
  {
    id: "personal-growth",
    label: "Personal Growth",
    emoji: "🌱",
    description: "Growth Center, wins, evidence, highlights, and journey.",
  },
  {
    id: "adhd-support",
    label: "ADHD Support",
    emoji: "🧠",
    description: "Strategies for how your brain works.",
  },
  {
    id: "decisions",
    label: "Decisions",
    emoji: "🧭",
    description: "Choose without spinning.",
  },
  {
    id: "personalization",
    label: "Personalization",
    emoji: "⚙️",
    description: "Make the ecosystem yours.",
  },
];
