/**
 * Phase 9 — Wisdom Intelligence
 * Earned insight from repeated experience — practical, not generic.
 */

import { getUserInterventionEffectiveness } from "./companionInterventionLearning";
import { isPhase7BusinessIntelligenceEcosystemActive } from "./businessIntelligenceEcosystem";
import { getPhase2DiscoveryState } from "./phase2ProgressiveDiscovery";
import { daysSinceRelationshipStart, getPhase3RelationshipState } from "./phase3AdaptiveRelationship";
import { getPhase5EcosystemState } from "./phase5CompanionIntelligenceEcosystem";

export type WisdomKind =
  | "lesson_learned"
  | "repeated_pattern"
  | "avoided_trap"
  | "future_self"
  | "hard_won_strength"
  | "recurring_advice";

export type WisdomConfidence = "early" | "growing" | "strong";

export type WisdomItem = {
  id: string;
  text: string;
  kind: WisdomKind;
  confidence: WisdomConfidence;
  recordedAt: string;
};

export type WisdomIntelligenceSummary = {
  items: WisdomItem[];
  patternWisdom: string[];
  lessonCount: number;
  narrative: string;
  updatedAt: string;
};

export type WisdomIntelligenceState = {
  items: WisdomItem[];
  reflectionsOffered: number;
  lastReflectionOfferAt?: string;
  updatedAt: string;
};

const STORAGE_KEY = "companion-phase9-wisdom-intelligence-v1";
const REFLECTION_COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000;
const MIN_WISDOM_DAYS = 60;
const MIN_WISDOM_SESSIONS = 15;
const MIN_STRONG_PATTERNS = 2;
const MIN_WISDOM_ITEMS = 3;
const MIN_GROWING_ITEMS = 1;

const PATTERN_WISDOM: {
  patternId: string;
  label: string;
  reflection: string;
}[] = [
  {
    patternId: "visibility_resistance",
    label: "Visibility resistance",
    reflection:
      "Posting rarely works when you wait for perfect — a smaller visible step has helped you before.",
  },
  {
    patternId: "follow_through_challenges",
    label: "Follow-through challenges",
    reflection:
      "You've been here before, and last time a smaller first step helped more than a bigger plan.",
  },
  {
    patternId: "overwhelm_cycles",
    label: "Overwhelm cycles",
    reflection:
      "You've learned that pushing harder usually backfires when your energy is low.",
  },
  {
    patternId: "pricing_anxiety",
    label: "Pricing anxiety",
    reflection:
      "This sounds like one of those moments where your past experience may already have the answer.",
  },
  {
    patternId: "launch_avoidance",
    label: "Launch avoidance",
    reflection:
      "A pattern I've noticed is that clarity often comes after you talk it out, not before.",
  },
  {
    patternId: "shiny_object_syndrome",
    label: "Shiny object syndrome",
    reflection:
      "New ideas feel energizing — but you've learned that finishing usually needs a smaller scope on what's already in motion.",
  },
];

function defaultState(): WisdomIntelligenceState {
  return {
    items: [],
    reflectionsOffered: 0,
    updatedAt: new Date().toISOString(),
  };
}

function readState(): WisdomIntelligenceState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as WisdomIntelligenceState;
    return { ...defaultState(), ...parsed, items: parsed.items ?? [] };
  } catch {
    return defaultState();
  }
}

function writeState(state: WisdomIntelligenceState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("companion-phase9-wisdom-updated"));
}

export function getWisdomIntelligenceState(): WisdomIntelligenceState {
  return readState();
}

function wisdomId(): string {
  return `wisdom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function addWisdomItem(
  items: WisdomItem[],
  text: string,
  kind: WisdomKind,
  confidence: WisdomConfidence,
): WisdomItem[] {
  const trimmed = text.trim().slice(0, 200);
  if (!trimmed || items.some((w) => w.text === trimmed)) return items;
  return [
    {
      id: wisdomId(),
      text: trimmed,
      kind,
      confidence,
      recordedAt: new Date().toISOString(),
    },
    ...items,
  ].slice(0, 30);
}

function countStrongPatterns(now = new Date()): number {
  const p2 = getPhase2DiscoveryState();
  const p3 = getPhase3RelationshipState();
  const adhd = p2.adhdPatterns.filter((p) => p.count >= 2).length;
  const predictive = p3.predictivePatterns.filter((p) => p.count >= 2).length;
  return adhd + predictive;
}

function mergePhase5Wisdom(items: WisdomItem[]): WisdomItem[] {
  const p5 = getPhase5EcosystemState();
  let next = [...items];
  for (const w of p5.wisdomInsights) {
    const kind: WisdomKind =
      w.source === "lesson"
        ? "lesson_learned"
        : w.source === "pattern"
          ? "repeated_pattern"
          : w.source === "intervention"
            ? "recurring_advice"
            : "hard_won_strength";
    next = addWisdomItem(next, w.text, kind, w.confidence);
  }
  for (const m of p5.multiYearMemory.filter((e) => e.kind === "lesson")) {
    next = addWisdomItem(next, m.text, "lesson_learned", "growing");
  }
  return next;
}

function mergeInterventionWisdom(items: WisdomItem[]): WisdomItem[] {
  let next = [...items];
  const effective = getUserInterventionEffectiveness()
    .filter((e) => e.rates.adaptiveWeight >= 65 && e.counts.completed >= 2)
    .slice(0, 4);
  for (const e of effective) {
    next = addWisdomItem(
      next,
      `${e.label} tends to help you move forward when you're stuck.`,
      "recurring_advice",
      e.counts.completed >= 4 ? "strong" : "growing",
    );
  }
  return next;
}

function inferPatternWisdom(now = new Date()): string[] {
  const p2 = getPhase2DiscoveryState();
  const lines: string[] = [];
  for (const { patternId, label, reflection } of PATTERN_WISDOM) {
    const adhd = p2.adhdPatterns.find((p) => p.id === patternId);
    if (adhd && adhd.count >= 2) {
      lines.push(`${label}: ${reflection}`);
    }
  }
  const p3 = getPhase3RelationshipState();
  if (p3.predictivePatterns.some((p) => /monday/i.test(p.label) && p.count >= 2)) {
    lines.push(
      "Monday friction: You've learned that a gentler start beats forcing productivity early in the week.",
    );
  }
  const peak = p2.energy.peakWindow;
  const low = p2.energy.lowWindow;
  if (peak && low && p2.sessionCount >= MIN_WISDOM_SESSIONS) {
    lines.push(
      `Energy rhythm: Hard pushes in your ${low} window cost more than wins in your ${peak} window.`,
    );
  }
  return lines.slice(0, 6);
}

export function buildWisdomIntelligenceSummary(now = new Date()): WisdomIntelligenceSummary {
  const stored = readState();
  let items = mergeInterventionWisdom(mergePhase5Wisdom(stored.items));
  const patternWisdom = inferPatternWisdom(now);

  for (const line of patternWisdom) {
    const text = line.includes(":") ? line.split(":").slice(1).join(":").trim() : line;
    items = addWisdomItem(items, text, "repeated_pattern", "growing");
  }

  const lessonCount = items.filter((i) => i.kind === "lesson_learned").length;
  const narrative =
    items.length >= MIN_WISDOM_ITEMS
      ? "Practical wisdom earned from your patterns, lessons, and what actually helped."
      : "Personal wisdom is still forming from your experience here.";

  return {
    items,
    patternWisdom,
    lessonCount,
    narrative,
    updatedAt: now.toISOString(),
  };
}

export function isPhase9WisdomIntelligenceActive(now = new Date()): boolean {
  if (!isPhase7BusinessIntelligenceEcosystemActive(now)) return false;

  const p2 = getPhase2DiscoveryState();
  const days = daysSinceRelationshipStart(now);
  if (days < MIN_WISDOM_DAYS && p2.sessionCount < MIN_WISDOM_SESSIONS) return false;
  if (countStrongPatterns(now) < MIN_STRONG_PATTERNS) return false;

  const summary = buildWisdomIntelligenceSummary(now);
  const growingPlus = summary.items.filter((i) => i.confidence !== "early").length;
  return summary.items.length >= MIN_WISDOM_ITEMS && growingPlus >= MIN_GROWING_ITEMS;
}

function cooldownClear(lastAt: string | undefined, now: Date): boolean {
  if (!lastAt) return true;
  return now.getTime() - new Date(lastAt).getTime() >= REFLECTION_COOLDOWN_MS;
}

export function maybeWisdomReflection(input: {
  userText: string;
  now?: Date;
}): string | null {
  if (!isPhase7BusinessIntelligenceEcosystemActive(input.now)) return null;

  const now = input.now ?? new Date();
  const cur = readState();
  if (isPhase9WisdomIntelligenceActive(now) && !cooldownClear(cur.lastReflectionOfferAt, now)) {
    return null;
  }

  const text = input.userText.trim();
  if (!text) return null;

  const p2 = getPhase2DiscoveryState();
  const summary = buildWisdomIntelligenceSummary(now);

  if (/\b(?:work harder|hustle more|just push)\b/i.test(text)) {
    const energy = p2.challenges.some((c) => /tired|burn|exhaust|low energy/i.test(c.label));
    if (energy || p2.adhdPatterns.some((p) => p.id === "overwhelm_cycles" && p.count >= 2)) {
      return "You've learned that pushing harder usually backfires when your energy is low. (Only if that still fits — you can correct me.)";
    }
  }

  if (/\b(?:stuck|can't decide|which one|not sure)\b/i.test(text)) {
    const compass = p2.resources.find((r) => r.id === "decision_compass" && r.helpfulScore >= 50);
    if (compass) {
      return "A pattern I've noticed is that clarity comes after you talk it out, not before. Want to think it through together?";
    }
  }

  if (/\b(?:overwhelm|too much|falling behind)\b/i.test(text)) {
    const follow = p2.adhdPatterns.find((p) => p.id === "follow_through_challenges" && p.count >= 2);
    if (follow) {
      return "You've been here before, and last time a smaller first step helped. (Optional — only if that resonates.)";
    }
  }

  if (/\b(?:learned|lesson|realized|now i know)\b/i.test(text)) {
    const lesson = summary.items.find((i) => i.kind === "lesson_learned");
    if (lesson) {
      return `That fits a thread I've seen — ${lesson.text.slice(0, 120)}. Worth keeping.`;
    }
  }

  if (/\b(?:visibility|posting|marketing)\b/i.test(text)) {
    const vis = p2.adhdPatterns.find((p) => p.id === "visibility_resistance" && p.count >= 2);
    if (vis) {
      return "Posting rarely works when you wait for perfect — a smaller visible step has helped you before. Want one now?";
    }
  }

  if (
    /\b(?:new (?:things|projects|ideas)|building new|instead of finishing|finish what|half.?finished|abandon|keep starting|never finish)\b/i.test(
      text,
    )
  ) {
    const shiny = p2.adhdPatterns.find((p) => p.id === "shiny_object_syndrome" && p.count >= 2);
    const follow = p2.adhdPatterns.find((p) => p.id === "follow_through_challenges" && p.count >= 2);
    if (shiny || follow) {
      return "New ideas feel energizing — but a pattern I've noticed is that finishing usually needs a smaller scope on what's already in motion, not another fresh start. (Only if that fits — correct me if not.)";
    }
  }

  if (
    /\b(?:patterns?|noticed|observe).*(?:decision|decide|choos)/i.test(text) ||
    /\bhow i make decisions?\b/i.test(text)
  ) {
    const compass = p2.resources.find((r) => r.id === "decision_compass" && r.helpfulScore >= 50);
    const overload = p2.adhdPatterns.find(
      (p) => p.id === "shiny_object_syndrome" && p.count >= 2,
    );
    const parts: string[] = [];
    if (compass) parts.push("clarity often comes after you talk it out or map options visually");
    if (overload) parts.push("too many options at once creates friction — especially after idea bursts");
    if (p2.learningStyle.primary === "visual") {
      parts.push("seeing choices side-by-side tends to help more than holding them in your head");
    }
    if (parts.length) {
      return `From our conversations, I've noticed: ${parts.join("; ")}. (Correct me if that's shifted.)`;
    }
  }

  const recurring = summary.items.find(
    (i) => i.kind === "recurring_advice" && i.confidence !== "early",
  );
  if (recurring && /\b(?:help|what should|advice)\b/i.test(text)) {
    return `${recurring.text} (Only if that still fits today.)`;
  }

  return null;
}

export function recordWisdomReflectionShown(now = new Date()): void {
  const cur = readState();
  writeState({
    ...cur,
    reflectionsOffered: cur.reflectionsOffered + 1,
    lastReflectionOfferAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });
}

export function observeWisdomIntelligenceTurn(input: {
  userText: string;
  now?: Date;
}): WisdomIntelligenceState {
  if (!isPhase7BusinessIntelligenceEcosystemActive(input.now)) return readState();

  const t = input.userText.trim();
  if (!t) return readState();

  const cur = readState();
  let items = [...cur.items];

  if (/\b(?:learned|lesson|realized|now i know|figured out)\b/i.test(t)) {
    items = addWisdomItem(items, t.slice(0, 160), "lesson_learned", "early");
  }
  if (/\b(?:won't|will not|never again|avoid)\b/i.test(t) && /\b(?:again|mistake|trap)\b/i.test(t)) {
    items = addWisdomItem(items, t.slice(0, 160), "avoided_trap", "growing");
  }
  if (/\b(?:future me|next time|remember to)\b/i.test(t)) {
    items = addWisdomItem(items, t.slice(0, 160), "future_self", "early");
  }
  if (/\b(?:strength|proud|good at|naturally)\b/i.test(t)) {
    items = addWisdomItem(items, t.slice(0, 160), "hard_won_strength", "growing");
  }

  const next = { ...cur, items, updatedAt: (input.now ?? new Date()).toISOString() };
  writeState(next);
  return next;
}

export function formatWisdomIntelligenceForPanel(
  summary = buildWisdomIntelligenceSummary(),
): string {
  if (!summary.items.length) {
    return "## Personal Wisdom\n\nPractical wisdom is still forming from your patterns and experience.";
  }

  const lines = [
    "## Personal Wisdom",
    "",
    "_Earned insight — specific to you, not generic advice._",
    "",
    summary.narrative,
    "",
  ];

  const grouped: Record<WisdomKind, WisdomItem[]> = {
    lesson_learned: [],
    repeated_pattern: [],
    avoided_trap: [],
    future_self: [],
    hard_won_strength: [],
    recurring_advice: [],
  };
  for (const item of summary.items.slice(0, 12)) {
    grouped[item.kind].push(item);
  }

  if (grouped.lesson_learned.length) {
    lines.push("### Lessons Learned");
    lines.push(...grouped.lesson_learned.map((w) => `• ${w.text}`));
    lines.push("");
  }
  if (grouped.repeated_pattern.length || summary.patternWisdom.length) {
    lines.push("### Patterns You've Outgrown or Learned From");
    lines.push(...grouped.repeated_pattern.map((w) => `• ${w.text}`));
    lines.push("");
  }
  if (grouped.recurring_advice.length) {
    lines.push("### What Tends to Help You");
    lines.push(...grouped.recurring_advice.map((w) => `• ${w.text}`));
    lines.push("");
  }
  if (grouped.hard_won_strength.length) {
    lines.push("### Hard-Won Strengths");
    lines.push(...grouped.hard_won_strength.map((w) => `• ${w.text}`));
    lines.push("");
  }

  return lines.join("\n").trim();
}

export function phase9WisdomIntelligenceHintForChat(input?: {
  userText?: string;
  reflection?: string | null;
  now?: Date;
}): string | null {
  const now = input?.now;
  const phase9Active = isPhase9WisdomIntelligenceActive(now);
  const phase7Active = isPhase7BusinessIntelligenceEcosystemActive(now);
  if (!phase9Active && !phase7Active) return null;

  const summary = phase9Active ? buildWisdomIntelligenceSummary(now) : null;
  const p2 = getPhase2DiscoveryState();
  const reflection =
    input?.reflection ??
    (input?.userText ? maybeWisdomReflection({ userText: input.userText, now }) : null);

  const patternLines = PATTERN_WISDOM.filter((p) =>
    p2.adhdPatterns.some((ap) => ap.id === p.patternId && ap.count >= 2),
  ).map((p) => p.reflection);

  const parts = phase9Active
    ? [
        "PHASE 9 WISDOM INTELLIGENCE (earned insight — practical, human, never preachy):",
        "Sound like a friend who remembers what worked — not a coach lecturing.",
        "NEVER: mystical, clinical, 'you always/never', phase names, intelligence jargon.",
        "MAY: gentle pattern reflections with permission to correct.",
        `Wisdom items: ${summary!.items.length}. Lessons: ${summary!.lessonCount}.`,
        summary!
          .items.filter((i) => i.confidence !== "early")
          .slice(0, 3)
          .map((i) => i.text)
          .join(" | ") || "Still forming",
        "Examples: pushing harder backfires on low energy; clarity after talking it out; smaller first steps.",
      ]
    : [
        "RELATIONSHIP WISDOM (forming — use known patterns, not generic discovery):",
        "Reflect observed ADHD patterns and challenges BEFORE asking what drives the urge.",
        patternLines.slice(0, 3).join(" | ") || "Patterns still forming from conversation.",
      ];

  if (reflection) {
    parts.push("WISDOM REFLECTION (optional — user may correct):", `"${reflection}"`);
  }

  return parts.join("\n");
}

export function resetWisdomIntelligenceForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
