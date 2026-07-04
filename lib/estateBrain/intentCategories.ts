/**
 * Intent-First Estate Navigation™ — member goals, not room names.
 *
 * People think in goals. Spark chooses environment, tools, and experience.
 *
 * @see docs/estate/INTENT_FIRST_ESTATE_NAVIGATION.md
 */

export type EstateIntentCategory =
  | "create"
  | "learn"
  | "plan"
  | "reflect"
  | "focus"
  | "restore"
  | "celebrate"
  | "business"
  | "visual_thinking";

export type EstateIntentMatch = {
  category: EstateIntentCategory;
  score: number;
  reasons: string[];
};

export type EstateIntentDefinition = {
  category: EstateIntentCategory;
  /** Natural-language signals — not commands */
  triggers: readonly string[];
};

export const ESTATE_INTENT_DEFINITIONS: readonly EstateIntentDefinition[] = [
  {
    category: "create",
    triggers: [
      "write",
      "create",
      "draft",
      "design",
      "build",
      "generate",
      "compose",
      "make",
      "develop",
      "email",
      "newsletter",
      "sop",
      "proposal",
    ],
  },
  {
    category: "learn",
    triggers: [
      "research",
      "teach",
      "explain",
      "compare",
      "summarize",
      "analyze",
      "find",
      "discover",
      "study",
      "learn",
      "competitors",
    ],
  },
  {
    category: "plan",
    triggers: [
      "plan",
      "roadmap",
      "goal",
      "project",
      "strategy",
      "marketing strategy",
      "marketing plan",
      "launch",
      "organize",
      "prioritize",
      "quarter",
      "weekly",
    ],
  },
  {
    category: "reflect",
    triggers: [
      "journal",
      "gratitude",
      "pray",
      "prayer",
      "reflect",
      "remember",
      "capture",
      "process feelings",
    ],
  },
  {
    category: "focus",
    triggers: [
      "focus",
      "concentrate",
      "body double",
      "pomodoro",
      "finish",
      "work session",
      "deep work",
    ],
  },
  {
    category: "restore",
    triggers: [
      "relax",
      "breathe",
      "calm",
      "meditate",
      "reset",
      "quiet",
      "sleep",
      "music",
      "overwhelm",
      "anxious",
      "calm down",
    ],
  },
  {
    category: "celebrate",
    triggers: [
      "celebrate",
      "win",
      "achievement",
      "milestone",
      "accomplishment",
      "reward",
      "finished",
    ],
  },
  {
    category: "business",
    triggers: [
      "offer",
      "pricing",
      "client",
      "marketing",
      "sales",
      "business",
      "crm",
      "funnels",
      "avatar",
      "branding",
    ],
  },
  {
    category: "visual_thinking",
    triggers: [
      "too many ideas",
      "mind map",
      "brainstorm",
      "all over the place",
      "scattered ideas",
      "map this out",
      "visual thinking",
      "organize my thoughts",
    ],
  },
] as const;

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Detect primary member intent from natural language. */
export function detectEstateIntent(userText: string): EstateIntentMatch | null {
  const q = normalize(userText);
  if (!q) return null;

  let best: EstateIntentMatch | null = null;

  for (const def of ESTATE_INTENT_DEFINITIONS) {
    let score = 0;
    const reasons: string[] = [];
    for (const trigger of def.triggers) {
      const t = normalize(trigger);
      if (q.includes(t)) {
        score += t.split(" ").length > 1 ? 22 : 14;
        reasons.push(trigger);
      }
    }
    if (!best || score > best.score) {
      if (score > 0) best = { category: def.category, score, reasons };
    } else if (best && score === best.score && reasons.length > 0) {
      const bestLen = Math.max(...best.reasons.map((r) => normalize(r).length));
      const newLen = Math.max(...reasons.map((r) => normalize(r).length));
      if (newLen > bestLen) {
        best = { category: def.category, score, reasons };
      }
    }
  }

  return best && best.score >= 14 ? best : null;
}

/** Map intent category → capability registry category */
export function capabilityCategoryForIntent(
  intent: EstateIntentCategory,
): import("./intelligenceTypes").EstateCapabilityCategory {
  switch (intent) {
    case "learn":
      return "research";
    case "plan":
      return "momentum";
    case "reflect":
      return "journal";
    case "visual_thinking":
      return "create";
    case "celebrate":
      return "grow";
    default:
      return intent;
  }
}
