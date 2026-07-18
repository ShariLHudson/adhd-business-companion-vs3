/**
 * Package 213 — Gold Standard Conversation Library Initial Build Plan.
 * Target corpus: 300–500 certified conversations.
 */

import { isFullyCertified } from "./qualityCert";
import { listGoldStandardConversations } from "./catalog";
import type { GscCategory } from "./types";

export type GoldBuildCategoryId =
  | "business-decisions"
  | "hiring"
  | "marketing"
  | "sales"
  | "adhd-overwhelm"
  | "prioritization"
  | "time-management"
  | "client-conversations"
  | "pricing"
  | "product-development"
  | "team-building"
  | "difficult-decisions"
  | "creative-blocks"
  | "planning"
  | "confidence"
  | "reflection"
  | "repairs"
  | "topic-continuity"
  | "conversation-endings";

export type GoldBuildCategory = {
  id: GoldBuildCategoryId;
  label: string;
  /** Maps into existing GscCategory when applicable */
  gscCategories: readonly GscCategory[];
  targetCount: number;
  tags: readonly string[];
};

/** Initial category plan — package 213. */
export const GOLD_BUILD_CATEGORIES: readonly GoldBuildCategory[] = [
  {
    id: "business-decisions",
    label: "Business decisions",
    gscCategories: ["business-decision"],
    targetCount: 40,
    tags: ["decision", "business"],
  },
  {
    id: "hiring",
    label: "Hiring",
    gscCategories: ["business-decision", "marketing-sales"],
    targetCount: 35,
    tags: ["hiring", "marketing", "sales"],
  },
  {
    id: "marketing",
    label: "Marketing",
    gscCategories: ["marketing-sales"],
    targetCount: 30,
    tags: ["marketing"],
  },
  {
    id: "sales",
    label: "Sales",
    gscCategories: ["marketing-sales"],
    targetCount: 25,
    tags: ["sales"],
  },
  {
    id: "adhd-overwhelm",
    label: "ADHD overwhelm",
    gscCategories: ["overwhelm"],
    targetCount: 35,
    tags: ["overwhelm", "adhd"],
  },
  {
    id: "prioritization",
    label: "Prioritization",
    gscCategories: ["overwhelm", "business-decision"],
    targetCount: 25,
    tags: ["prioritization"],
  },
  {
    id: "time-management",
    label: "Time management",
    gscCategories: ["personal-practical"],
    targetCount: 20,
    tags: ["time"],
  },
  {
    id: "client-conversations",
    label: "Client conversations",
    gscCategories: ["clients"],
    targetCount: 30,
    tags: ["client"],
  },
  {
    id: "pricing",
    label: "Pricing",
    gscCategories: ["business-decision", "clients"],
    targetCount: 20,
    tags: ["pricing"],
  },
  {
    id: "product-development",
    label: "Product development",
    gscCategories: ["creative-thinking", "business-decision"],
    targetCount: 20,
    tags: ["product"],
  },
  {
    id: "team-building",
    label: "Team building",
    gscCategories: ["business-decision"],
    targetCount: 15,
    tags: ["team"],
  },
  {
    id: "difficult-decisions",
    label: "Difficult decisions",
    gscCategories: ["business-decision", "confidence"],
    targetCount: 25,
    tags: ["difficult-decision"],
  },
  {
    id: "creative-blocks",
    label: "Creative blocks",
    gscCategories: ["creative-thinking"],
    targetCount: 20,
    tags: ["creative"],
  },
  {
    id: "planning",
    label: "Planning",
    gscCategories: ["personal-practical", "business-decision"],
    targetCount: 20,
    tags: ["planning"],
  },
  {
    id: "confidence",
    label: "Confidence",
    gscCategories: ["confidence"],
    targetCount: 20,
    tags: ["confidence"],
  },
  {
    id: "reflection",
    label: "Reflection",
    gscCategories: ["conversation-endings", "personal-practical"],
    targetCount: 20,
    tags: ["reflection"],
  },
  {
    id: "repairs",
    label: "Repairs / corrections",
    gscCategories: ["repairs"],
    targetCount: 25,
    tags: ["repair", "correction"],
  },
  {
    id: "topic-continuity",
    label: "Topic continuity",
    gscCategories: ["topic-continuity"],
    targetCount: 20,
    tags: ["topic"],
  },
  {
    id: "conversation-endings",
    label: "Conversation endings",
    gscCategories: ["conversation-endings"],
    targetCount: 15,
    tags: ["ending"],
  },
] as const;

export const GOLD_LIBRARY_TARGET_MIN = 300;
export const GOLD_LIBRARY_TARGET_MAX = 500;

export type GoldBuildProgress = {
  totalConversations: number;
  certifiedCount: number;
  targetMin: number;
  targetMax: number;
  percentOfMin: number;
  byCategory: {
    id: GoldBuildCategoryId;
    label: string;
    current: number;
    target: number;
  }[];
};

/**
 * Each conversation must include topic, intent, Topic Anchor, phases/moves,
 * blocked alternatives, Shari voice notes (whyItWorks/avoids), validation checklist.
 */
export const GOLD_CONVERSATION_REQUIRED_FIELDS = [
  "topic / topicAnchor",
  "intent / userIntent",
  "conversationGoal",
  "conversation phases (via turns + moves)",
  "approved moves",
  "blocked alternatives",
  "Shari voice notes (whyItWorks / avoids)",
  "validation checklist (quality cert)",
] as const;

export function getGoldBuildProgress(): GoldBuildProgress {
  const all = listGoldStandardConversations();
  const certifiedCount = all.filter((c) => isFullyCertified(c.quality)).length;

  const byCategory = GOLD_BUILD_CATEGORIES.map((cat) => {
    const current = all.filter((c) => {
      if (cat.gscCategories.includes(c.category)) return true;
      return cat.tags.some((t) =>
        c.runtimeTags.some((rt) => rt.toLowerCase().includes(t)),
      );
    }).length;
    return {
      id: cat.id,
      label: cat.label,
      current,
      target: cat.targetCount,
    };
  });

  return {
    totalConversations: all.length,
    certifiedCount,
    targetMin: GOLD_LIBRARY_TARGET_MIN,
    targetMax: GOLD_LIBRARY_TARGET_MAX,
    percentOfMin: Math.round((all.length / GOLD_LIBRARY_TARGET_MIN) * 100),
    byCategory,
  };
}

export function certifyReadyForRuntime(conversationId: string): boolean {
  const all = listGoldStandardConversations();
  const c = all.find((x) => x.id === conversationId);
  return Boolean(c && isFullyCertified(c.quality));
}
