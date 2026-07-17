import type { CompanionJudgmentResult } from "@/lib/companionBrain";

export const MORNING_CAPTURE_PLACEHOLDER = "What's on your mind today?" as const;

export const MORNING_CAPTURE_COPY = {
  title: "Plan My Day",
  question: "What deserves your attention today?",
  helper:
    "Don't worry about organizing anything. Just tell me what's on your mind, and we'll figure it out together.",
  submit: "Help Me Figure It Out",
  directionQuestion: "Does this feel like the right direction for today?",
  yesFeelsRight: "Yes — This feels right",
  adaptMyDay: "Adapt My Day",
  notRightNow: "Not Right Now",
  previousScreen: "Previous Screen",
} as const;

export const MORNING_THINKING_LINES = [
  "Give me just a moment...",
  "I'm looking for what matters most today.",
] as const;

export const MORNING_ADAPT_PROMPTS = [
  "What's missing?",
  "What feels too ambitious?",
  "Is there something else that's weighing on you?",
] as const;

export type MorningPriority = {
  label: string;
  stars: 1 | 2 | 3;
};

export type MorningResultsPresentation = {
  introLines: string[];
  priorities: MorningPriority[];
  laterThisWeek: string[];
  canWait: string[];
  directionQuestion: string;
  mindCount: number;
};

/** Parse a focused morning capture — not a brain dump stream. */
/**
 * Split a capture into candidate tasks.
 * Preserves wording; splits on newlines, bullets, semicolons, and comma lists.
 */
export function parseMindCapture(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks = normalized
    .split(/\n+/)
    .flatMap((line) =>
      line
        .split(/(?:^|\n)\s*[-•*]\s+/)
        .flatMap((part) => part.split(/\s*;\s*/))
        .flatMap((part) => part.split(/,\s+/)),
    )
    .map((part) => part.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);

  const out: string[] = [];
  const seen = new Set<string>();
  for (const chunk of chunks) {
    const key = chunk.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(chunk);
  }
  return out;
}

function starsForIndex(index: number): 1 | 2 | 3 {
  if (index <= 0) return 3;
  if (index === 1) return 2;
  return 1;
}

function labelsMatch(a: string, b: string): boolean {
  const left = a.trim().toLowerCase();
  const right = b.trim().toLowerCase();
  return left === right || left.includes(right) || right.includes(left);
}

export function buildMorningResultsPresentation(
  judgment: CompanionJudgmentResult,
  mindText: string,
): MorningResultsPresentation {
  const mindItems = parseMindCapture(mindText);
  const mindCount = mindItems.length;

  let priorities: MorningPriority[] = judgment.proposals
    .slice(0, 3)
    .map((proposal, index) => ({
      label: proposal.label,
      stars: starsForIndex(index),
    }));

  if (!priorities.length && mindItems.length) {
    priorities = mindItems.slice(0, 3).map((label, index) => ({
      label,
      stars: starsForIndex(index),
    }));
  }

  const consumed = new Set<string>();
  for (const priority of priorities) {
    consumed.add(priority.label.trim().toLowerCase());
  }

  const remainder = mindItems.filter(
    (item) =>
      !priorities.some((priority) => labelsMatch(priority.label, item)) &&
      !consumed.has(item.trim().toLowerCase()),
  );

  const laterSplit = Math.max(1, Math.ceil(remainder.length / 2));
  const laterThisWeek = remainder.slice(0, laterSplit);
  const canWait = remainder.slice(laterSplit);

  const introLines = buildMorningIntroLines(mindCount, priorities.length);

  return {
    introLines,
    priorities,
    laterThisWeek,
    canWait,
    directionQuestion: MORNING_CAPTURE_COPY.directionQuestion,
    mindCount,
  };
}

export function buildMorningIntroLines(
  mindCount: number,
  priorityCount: number,
): string[] {
  if (mindCount === 0 && priorityCount === 0) {
    return [
      "Let's keep today gentle.",
      "We can shape it as the day unfolds.",
    ];
  }

  if (mindCount === 0) {
    return [
      "I noticed a few themes.",
      "Here's what I would focus on first.",
    ];
  }

  if (mindCount === 1) {
    return [
      "I noticed one thing on your mind.",
      "Here's what I would focus on first.",
    ];
  }

  const lines = [
    "I noticed a few themes.",
    `You have ${mindCount} things on your mind, but I don't think they all need your attention today.`,
    "Here's what I would focus on first.",
  ];

  if (priorityCount === 0) {
    lines[2] = "Let's start with one honest place.";
  }

  return lines;
}

export function formatPriorityStars(stars: MorningPriority["stars"]): string {
  return "⭐".repeat(stars);
}

export const MORNING_THINKING_MS = 2400 as const;
