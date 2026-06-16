// Personalized strategy architecture — FUTURE-READY, not yet automated.
// Built-in strategies live in strategySystem.ts (source: "system"). This store
// holds strategies the USER saves or that the Companion SUGGESTS and the user
// confirms. Nothing is auto-created here — a suggestion flow must call
// saveUserStrategy() only AFTER the user confirms (and may rename / recategorize).

import { STRATEGY_CATEGORIES, type StrategyGroupId } from "./strategySystem";

export type StrategySource = "system" | "user_generated" | "companion_suggested";

export type UserStrategy = {
  id: string;
  title: string;
  type: StrategyGroupId; // "personal" | "business" (mirrors group)
  category: string; // subcategory id, e.g. "overwhelm"
  source: StrategySource;
  description: string; // the problem / what this helps with
  whenToUse: string;
  steps: string[];
  whyItWorks: string;
  example?: string;
  actionButtons?: string[]; // e.g. ["focus-session", "time-block"]
  tags?: string[]; // future surfacing / "Recommended for me" matching
  /** Closing reflection lines — rotated on strategy detail pages. */
  reflections?: string[];
  createdAt: string;
  updatedAt: string;
};

const KEY = "companion-user-strategies-v1";

export function getUserStrategies(): UserStrategy[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as UserStrategy[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: UserStrategy[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

export function userStrategiesFor(subcatId: string): UserStrategy[] {
  return getUserStrategies().filter((s) => s.category === subcatId);
}

export type NewUserStrategy = Omit<UserStrategy, "id" | "createdAt" | "updatedAt">;

/** Draft shape for Companion-generated strategies (confirmed by user before save). */
export type CompanionStrategyDraft = {
  title: string;
  category: string;
  description: string;
  trigger?: string;
  whenToUse: string;
  steps: string[];
  whyItWorks: string;
  example?: string;
  reflections?: string[];
  tags?: string[];
};

/** Save a Companion-suggested strategy after the user confirms. */
export function saveCompanionSuggestedStrategy(
  draft: CompanionStrategyDraft,
): UserStrategy[] {
  const group =
    STRATEGY_CATEGORIES.find((c) => c.id === draft.category)?.group ?? "personal";
  return saveUserStrategy({
    title: draft.title,
    type: group,
    category: draft.category,
    source: "companion_suggested",
    description: draft.trigger?.trim() || draft.description,
    whenToUse: draft.whenToUse,
    steps: draft.steps,
    whyItWorks: draft.whyItWorks,
    example: draft.example,
    reflections: draft.reflections,
    tags: draft.tags,
  });
}

// Save a confirmed strategy. Returns the full list.
export function saveUserStrategy(input: NewUserStrategy): UserStrategy[] {
  const now = new Date().toISOString();
  const entry: UserStrategy = {
    ...input,
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };
  const next = [entry, ...getUserStrategies()];
  writeAll(next);
  return next;
}

export function updateUserStrategy(
  id: string,
  changes: Partial<Omit<UserStrategy, "id" | "createdAt">>,
): UserStrategy[] {
  const next = getUserStrategies().map((s) =>
    s.id === id ? { ...s, ...changes, updatedAt: new Date().toISOString() } : s,
  );
  writeAll(next);
  return next;
}

export function deleteUserStrategy(id: string): UserStrategy[] {
  const next = getUserStrategies().filter((s) => s.id !== id);
  writeAll(next);
  return next;
}

// Suggest the most appropriate { type, category } for a new strategy from its
// title/description. Keyword heuristic — the user always confirms and can change
// it. Returns a subcategory id + its group.
const KEYWORDS: { subcat: string; words: string[] }[] = [
  { subcat: "overwhelm", words: ["overwhelm", "too much", "reset", "everything at once", "flooded"] },
  { subcat: "focus", words: ["focus", "distract", "attention", "one thing", "concentrate", "deep work"] },
  { subcat: "procrastination", words: ["procrastinat", "avoid", "putting off", "can't start", "delay"] },
  { subcat: "perfectionism", words: ["perfect", "polish", "finish", "good enough", "ship"] },
  { subcat: "procrastination", words: ["motivat", "drive", "momentum", "stuck in a rut", "can't get going"] },
  { subcat: "burnout", words: ["burnout", "exhaust", "depleted", "rest", "empty", "tired"] },
  { subcat: "decision-making", words: ["decide", "decision", "choose", "choice", "stuck between"] },
  { subcat: "future-thinking", words: ["future me", "future self", "later", "tomorrow", "breadcrumb", "weekend when"] },
  { subcat: "visibility", words: ["visible", "reminder", "forget", "out of sight", "sticky", "landing strip"] },
  { subcat: "memory", words: ["remember", "memory", "notepad", "capture", "write it down", "storage"] },
  { subcat: "emotional-regulation", words: ["anxious", "fear", "imposter", "comparison", "feel", "shame", "overwhelmed emotionally"] },
  { subcat: "marketing", words: ["marketing", "audience", "reach", "visibility", "promote", "funnel", "ads"] },
  { subcat: "sales", words: ["sale", "sell", "close", "pitch", "follow up", "lead", "prospect", "fear builds"] },
  { subcat: "content", words: ["content", "post", "write", "video", "newsletter", "caption", "script", "talk first"] },
  { subcat: "customer-relations", words: ["client relationship", "customer", "retention", "check in", "complaint", "loyal"] },
  { subcat: "planning", words: ["plan", "weekly", "roadmap", "priorities", "schedule the week"] },
  { subcat: "productivity", words: ["productiv", "to-do", "task", "get done", "three task"] },
  { subcat: "systems", words: ["system", "process", "sop", "automate", "checklist", "repeatable"] },
  { subcat: "pricing", words: ["pricing", "price", "rates", "charge", "discount", "raise my rate"] },
  { subcat: "offers", words: ["offer", "package", "what you sell", "review offer"] },
  { subcat: "customer-relations", words: ["deliver", "scope", "client work", "onboarding", "client relationship", "retention"] },
  { subcat: "business-decisions", words: ["business decision", "which direction", "pivot", "should i"] },
];

export function suggestCategory(
  title: string,
  description = "",
): { type: StrategyGroupId; category: string } {
  const hay = `${title} ${description}`.toLowerCase();
  let best: string | null = null;
  for (const k of KEYWORDS) {
    if (k.words.some((w) => hay.includes(w))) {
      best = k.subcat;
      break;
    }
  }
  const subcat = best ?? "focus"; // sensible default
  const group =
    STRATEGY_CATEGORIES.find((c) => c.id === subcat)?.group ?? "personal";
  return { type: group, category: subcat };
}
