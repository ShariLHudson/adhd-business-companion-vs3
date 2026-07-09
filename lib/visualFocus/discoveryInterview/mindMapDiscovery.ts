/**
 * Mind Map Discovery Interview™ (197 / 199).
 * Conversational questions → Spark first draft — never a blank canvas.
 */

import type { VisualFocusNode } from "../types";
import type { VisualFocusDiscoveryInterview } from "./types";

export type MindMapDiscoveryQuestionId =
  | "main-topic"
  | "everything"
  | "anything-else";

export type MindMapDiscoveryQuestion = {
  id: MindMapDiscoveryQuestionId;
  prompt: string;
  placeholder: string;
  /** Soft hint under the question. */
  hint?: string;
  allowSkip: boolean;
};

export const MIND_MAP_DISCOVERY_QUESTIONS: readonly MindMapDiscoveryQuestion[] = [
  {
    id: "main-topic",
    prompt: "What is the main topic?",
    placeholder: "The center of this map…",
    hint: "One clear focus — Spark will build outward from here.",
    allowSkip: false,
  },
  {
    id: "everything",
    prompt: "Tell me everything that comes to mind.",
    placeholder: "Ideas, worries, pieces, people, next steps — dump it all…",
    hint: "Lists, bullets, or rough thoughts are perfect. Spark will group them.",
    allowSkip: false,
  },
  {
    id: "anything-else",
    prompt: "Anything else?",
    placeholder: "Optional — anything you almost forgot…",
    allowSkip: true,
  },
] as const;

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "my",
  "our",
  "is",
  "are",
  "be",
  "this",
  "that",
  "it",
  "i",
  "we",
  "you",
]);

const THEME_BUCKETS: { label: string; keywords: string[] }[] = [
  {
    label: "Audience & People",
    keywords: ["audience", "client", "customer", "people", "team", "partner", "member"],
  },
  {
    label: "Offer & Product",
    keywords: ["offer", "product", "course", "service", "workshop", "program", "pricing"],
  },
  {
    label: "Marketing & Visibility",
    keywords: ["marketing", "content", "social", "email", "launch", "visibility", "brand"],
  },
  {
    label: "Operations & Systems",
    keywords: ["system", "process", "ops", "tool", "workflow", "sop", "admin"],
  },
  {
    label: "Money & Growth",
    keywords: ["revenue", "money", "sales", "growth", "profit", "price", "income"],
  },
  {
    label: "Next Steps",
    keywords: ["next", "todo", "action", "start", "finish", "deadline", "priority"],
  },
];

function newNodeId(): string {
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function node(label: string, children: VisualFocusNode[] = []): VisualFocusNode {
  return { id: newNodeId(), label, children };
}

/** Split freeform dump into idea lines. */
export function parseIdeaLines(raw: string): string[] {
  const chunks = raw
    .split(/[\n;•·]+|(?:,\s+(?=[A-Z]))/)
    .flatMap((part) => part.split(/(?:^|\s)[-*]\s+/))
    .map((s) => s.replace(/^[\d]+[.)]\s*/, "").trim())
    .filter((s) => s.length > 1);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of chunks) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

function themeForIdea(idea: string): string | null {
  const lower = idea.toLowerCase();
  for (const bucket of THEME_BUCKETS) {
    if (bucket.keywords.some((k) => lower.includes(k))) return bucket.label;
  }
  return null;
}

function significantTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

/** Group unthemed ideas by shared significant tokens. */
function clusterUnthemed(ideas: string[]): Map<string, string[]> {
  const clusters = new Map<string, string[]>();
  const assigned = new Set<string>();

  for (let i = 0; i < ideas.length; i++) {
    const a = ideas[i]!;
    if (assigned.has(a)) continue;
    const tokensA = new Set(significantTokens(a));
    const group = [a];
    assigned.add(a);
    for (let j = i + 1; j < ideas.length; j++) {
      const b = ideas[j]!;
      if (assigned.has(b)) continue;
      const tokensB = significantTokens(b);
      if (tokensB.some((t) => tokensA.has(t))) {
        group.push(b);
        assigned.add(b);
      }
    }
    const label =
      group.length > 1
        ? significantTokens(group[0]!).slice(0, 2).join(" ") || "Related ideas"
        : "More ideas";
    const existing = clusters.get(label) ?? [];
    clusters.set(label, [...existing, ...group]);
  }
  return clusters;
}

const SUGGESTED_GAPS = [
  "Open questions",
  "What success looks like",
  "Constraints",
];

/**
 * Build Mind Map first draft from Discovery Interview answers (199).
 * Groups similar ideas, creates branches, suggests missing topics.
 */
export function buildMindMapDraftFromDiscovery(input: {
  topic: string;
  everything: string;
  anythingElse?: string;
}): { title: string; root: VisualFocusNode; suggestedGaps: string[] } {
  const topic = input.topic.trim() || "Central idea";
  const lines = [
    ...parseIdeaLines(input.everything),
    ...parseIdeaLines(input.anythingElse ?? ""),
  ].filter((line) => line.toLowerCase() !== topic.toLowerCase());

  const themed = new Map<string, string[]>();
  const unthemed: string[] = [];

  for (const idea of lines) {
    const theme = themeForIdea(idea);
    if (theme) {
      const list = themed.get(theme) ?? [];
      list.push(idea);
      themed.set(theme, list);
    } else {
      unthemed.push(idea);
    }
  }

  const children: VisualFocusNode[] = [];

  for (const [label, ideas] of themed) {
    children.push(node(label, ideas.map((idea) => node(idea))));
  }

  for (const [label, ideas] of clusterUnthemed(unthemed)) {
    if (ideas.length === 1) {
      children.push(node(ideas[0]!));
    } else {
      children.push(node(label, ideas.map((idea) => node(idea))));
    }
  }

  if (children.length === 0) {
    children.push(
      node("First thoughts", [node("Add what comes to mind")]),
      node("Open questions"),
    );
  }

  const presentLabels = new Set(
    children.map((c) => c.label.toLowerCase()),
  );
  const suggestedGaps = SUGGESTED_GAPS.filter(
    (g) => !presentLabels.has(g.toLowerCase()),
  );
  for (const gap of suggestedGaps.slice(0, 2)) {
    children.push(node(gap));
  }

  return {
    title: topic.length > 60 ? `${topic.slice(0, 57)}…` : topic,
    root: node(topic, children),
    suggestedGaps,
  };
}

export function buildMindMapDiscoveryInterview(answers: {
  topic: string;
  everything: string;
  anythingElse?: string;
}): VisualFocusDiscoveryInterview {
  const now = new Date().toISOString();
  return {
    mapKind: "mind-map",
    completedAt: now,
    answers: [
      {
        questionId: "main-topic",
        question: MIND_MAP_DISCOVERY_QUESTIONS[0]!.prompt,
        answer: answers.topic.trim(),
      },
      {
        questionId: "everything",
        question: MIND_MAP_DISCOVERY_QUESTIONS[1]!.prompt,
        answer: answers.everything.trim(),
      },
      {
        questionId: "anything-else",
        question: MIND_MAP_DISCOVERY_QUESTIONS[2]!.prompt,
        answer: (answers.anythingElse ?? "").trim(),
      },
    ],
  };
}
