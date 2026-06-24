/**
 * Learning Path Menu — Quick Answer / Example / Apply / Deep Dive.
 * Single source of truth for chat teaching menus (P0.15 continuation + Deep Dive restore).
 */

export type LearningPathOptionKey =
  | "quick_answer"
  | "example"
  | "apply_to_business"
  | "deep_dive";

export type LearningPathMenuOption = {
  number: string;
  label: string;
  key: LearningPathOptionKey;
};

/** User-facing 4-path menu for learning questions. */
export const LEARNING_PATH_MENU: LearningPathMenuOption[] = [
  { number: "1", label: "Quick Answer", key: "quick_answer" },
  { number: "2", label: "Example", key: "example" },
  { number: "3", label: "Apply to My Business", key: "apply_to_business" },
  { number: "4", label: "Deep Dive", key: "deep_dive" },
];

export const LEARNING_PATH_MENU_OPTIONS: Record<string, LearningPathOptionKey> =
  Object.fromEntries(
    LEARNING_PATH_MENU.map((o) => [o.number, o.key]),
  ) as Record<string, LearningPathOptionKey>;

const MENU_OFFER_RE =
  /\b(?:would you like|which would you like|pick one|choose one|what sounds most helpful)\b/i;

const MENU_PATH_RE =
  /\b(?:quick answer|simple explanation|real[- ]world example|(?:^|\s)example\b|apply to my business|deep dive|build (?:one|it|your|my)?\s*together)\b/i;

const LEGACY_KEY_MAP: Record<string, LearningPathOptionKey> = {
  simple_explanation: "quick_answer",
  real_world_example: "example",
  build_together: "deep_dive",
};

/** Map legacy menuContinuation keys to learning path keys. */
export function normalizeLearningPathKey(
  key: string,
): LearningPathOptionKey | null {
  if (
    key === "quick_answer" ||
    key === "example" ||
    key === "apply_to_business" ||
    key === "deep_dive"
  ) {
    return key;
  }
  return LEGACY_KEY_MAP[key] ?? null;
}

export function learningPathMenuOfferBlock(): string {
  return LEARNING_PATH_MENU.map((o) => `${o.number}. ${o.label}`).join("\n");
}

export function learningPathMenuHintForChat(topic?: string | null): string {
  return [
    "LEARNING PATH MENU (mandatory for concept / learn questions):",
    topic ? `Topic: ${topic}.` : "",
    "Step 1: ONE plain-language sentence — the core idea (Quick Answer preview).",
    "Step 2: Offer exactly these numbered paths and wait:",
    learningPathMenuOfferBlock(),
    "Do NOT write a long article on the first turn.",
    "FORBIDDEN: relationship openers (I've noticed…, It sounds like…, You seem…).",
    "This is about the concept — NOT about the user's patterns unless they asked about themselves.",
    '"Deep Dive" = richer structured explanation (2–4 short sections), still about the topic — not relationship reflection.',
  ]
    .filter(Boolean)
    .join("\n");
}

export function isLearningPathMenuOffer(assistantText: string): boolean {
  const t = assistantText.trim();
  if (!t) return false;
  return MENU_OFFER_RE.test(t) && MENU_PATH_RE.test(t);
}

export function mapMenuLineLabelToKey(label: string): LearningPathOptionKey | null {
  const l = label.trim().toLowerCase();
  if (/quick answer|simple explanation/.test(l)) return "quick_answer";
  if (/real[- ]world example|^example\b/.test(l)) return "example";
  if (/apply/.test(l)) return "apply_to_business";
  if (/deep dive|build.*together/.test(l)) return "deep_dive";
  return null;
}

export function learningPathHintForSelection(
  key: LearningPathOptionKey,
  topic?: string,
): string {
  const subject = topic?.trim() || "this topic";
  switch (key) {
    case "quick_answer":
      return [
        "LEARNING PATH — QUICK ANSWER:",
        `Teach ONE small piece of ${subject} only (2–4 short sentences).`,
        "End with ONE check-in question or offer the next small piece.",
        "No relationship observations about the user.",
      ].join("\n");
    case "example":
      return [
        "LEARNING PATH — EXAMPLE:",
        `Give ONE concrete example for ${subject}.`,
        "Keep it short — a mini story, not a case study essay.",
        "End with ONE question about how it maps to them.",
        "No relationship observations about the user.",
      ].join("\n");
    case "apply_to_business":
      return [
        "LEARNING PATH — APPLY TO MY BUSINESS:",
        `Ask ONE question about their offer, audience, or setup before advising on ${subject}.`,
        "After they answer, give ONE applied insight — not a full strategy doc.",
        "No relationship observations about the user.",
      ].join("\n");
    case "deep_dive":
      return [
        "LEARNING PATH — DEEP DIVE (mandatory):",
        `Give a richer explanation of ${subject} for learning — 2 to 4 short sections with clear headings.`,
        "Cover: what it is, why it matters, how it works in practice, and one common mistake to avoid.",
        "Stay on the concept. This is NOT relationship reflection or ADHD pattern analysis about the user.",
        "FORBIDDEN openers: I've noticed…, It sounds like…, You seem to…, patterns you've shown…",
        "End with ONE question: what part they want to explore next, or offer to apply it to their business.",
      ].join("\n");
  }
}
