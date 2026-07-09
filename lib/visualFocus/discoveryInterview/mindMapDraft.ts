/**
 * Mind Map first draft — stronger grouping, duplicates, gaps, explanation (199).
 */

import type { VisualFocusNode } from "../types";
import type { VisualFocusDiscoveryInterview } from "./types";
import { MIND_MAP_DISCOVERY_QUESTIONS, parseIdeaLines } from "./mindMapDiscovery";

export type MindMapDraftResult = {
  title: string;
  root: VisualFocusNode;
  suggestedGaps: string[];
  suggestedBranches: string[];
  duplicates: string[];
  explanation: string;
};

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "to", "of", "in", "on", "for", "with",
  "my", "our", "is", "are", "be", "this", "that", "it", "i", "we", "you", "me",
  "need", "want", "get", "make", "also", "just", "about", "from", "into",
]);

const THEME_BUCKETS: { label: string; keywords: string[]; why: string }[] = [
  {
    label: "Audience & People",
    keywords: ["audience", "client", "customer", "people", "team", "partner", "member", "community", "follower"],
    why: "people and relationships",
  },
  {
    label: "Offer & Product",
    keywords: ["offer", "product", "course", "service", "workshop", "program", "pricing", "package", "deliverable"],
    why: "what you create and sell",
  },
  {
    label: "Marketing & Visibility",
    keywords: ["marketing", "content", "social", "email", "launch", "visibility", "brand", "post", "newsletter", "ads"],
    why: "how you get seen",
  },
  {
    label: "Operations & Systems",
    keywords: ["system", "process", "ops", "tool", "workflow", "sop", "admin", "automate", "software"],
    why: "how the work runs",
  },
  {
    label: "Money & Growth",
    keywords: ["revenue", "money", "sales", "growth", "profit", "price", "income", "budget", "cash"],
    why: "money and growth",
  },
  {
    label: "Timeline & Milestones",
    keywords: ["deadline", "timeline", "milestone", "schedule", "date", "week", "month", "quarter"],
    why: "when things happen",
  },
  {
    label: "Risks & Worries",
    keywords: ["risk", "worry", "afraid", "stuck", "block", "fear", "concern", "problem", "issue"],
    why: "friction and concerns",
  },
  {
    label: "Next Steps",
    keywords: ["next", "todo", "action", "start", "finish", "priority", "first", "then"],
    why: "what to do next",
  },
];

const GAP_PROMPTS: { label: string; whenMissing: (labels: string[], ideas: string[]) => boolean }[] = [
  {
    label: "Open questions",
    whenMissing: (labels) => !labels.some((l) => /question|unknown|unclear/i.test(l)),
  },
  {
    label: "What success looks like",
    whenMissing: (labels, ideas) =>
      !labels.some((l) => /success|outcome|goal/i.test(l)) &&
      !ideas.some((i) => /success|done when|outcome/i.test(i)),
  },
  {
    label: "Constraints",
    whenMissing: (labels, ideas) =>
      !labels.some((l) => /constraint|limit|budget|time/i.test(l)) &&
      !ideas.some((i) => /can't|cannot|limit|budget|only/i.test(i)),
  },
  {
    label: "Who is involved",
    whenMissing: (labels) => !labels.some((l) => /audience|people|who/i.test(l)),
  },
];

function newNodeId(): string {
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function node(label: string, children: VisualFocusNode[] = [], notes?: string): VisualFocusNode {
  return { id: newNodeId(), label, children, notes };
}

function significantTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

function normalizeIdea(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** Detect near-duplicates; keep first, report merged. */
export function dedupeIdeas(ideas: string[]): {
  unique: string[];
  duplicates: string[];
} {
  const unique: string[] = [];
  const duplicates: string[] = [];
  const norms: string[] = [];

  for (const idea of ideas) {
    const norm = normalizeIdea(idea);
    if (!norm) continue;
    const tokens = new Set(significantTokens(idea));
    let dupOf: string | null = null;
    for (let i = 0; i < unique.length; i++) {
      const otherNorm = norms[i]!;
      if (norm === otherNorm || otherNorm.includes(norm) || norm.includes(otherNorm)) {
        dupOf = unique[i]!;
        break;
      }
      const otherTokens = significantTokens(unique[i]!);
      const overlap = otherTokens.filter((t) => tokens.has(t)).length;
      if (
        tokens.size > 0 &&
        otherTokens.length > 0 &&
        overlap / Math.min(tokens.size, otherTokens.length) >= 0.75
      ) {
        dupOf = unique[i]!;
        break;
      }
    }
    if (dupOf) {
      duplicates.push(`“${idea}” ≈ “${dupOf}”`);
    } else {
      unique.push(idea);
      norms.push(norm);
    }
  }
  return { unique, duplicates };
}

function themeForIdea(idea: string): { label: string; why: string } | null {
  const lower = idea.toLowerCase();
  for (const bucket of THEME_BUCKETS) {
    if (bucket.keywords.some((k) => lower.includes(k))) {
      return { label: bucket.label, why: bucket.why };
    }
  }
  return null;
}

function clusterUnthemed(ideas: string[]): { label: string; ideas: string[]; why: string }[] {
  const clusters: { label: string; ideas: string[]; why: string }[] = [];
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
    if (group.length === 1) {
      clusters.push({
        label: group[0]!,
        ideas: [],
        why: "stood on its own",
      });
    } else {
      const label =
        significantTokens(group[0]!).slice(0, 2).map(capitalize).join(" ") ||
        "Related ideas";
      clusters.push({
        label,
        ideas: group,
        why: `shared language around “${significantTokens(group[0]!)[0] ?? "these ideas"}”`,
      });
    }
  }
  return clusters;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function buildMindMapDraftFromDiscovery(input: {
  topic: string;
  everything: string;
  anythingElse?: string;
}): MindMapDraftResult {
  const topic = input.topic.trim() || "Central idea";
  const rawLines = [
    ...parseIdeaLines(input.everything),
    ...parseIdeaLines(input.anythingElse ?? ""),
  ].filter((line) => normalizeIdea(line) !== normalizeIdea(topic));

  const { unique: lines, duplicates } = dedupeIdeas(rawLines);

  const themed = new Map<string, { ideas: string[]; why: string }>();
  const unthemed: string[] = [];
  const groupReasons: string[] = [];

  for (const idea of lines) {
    const theme = themeForIdea(idea);
    if (theme) {
      const existing = themed.get(theme.label) ?? { ideas: [], why: theme.why };
      existing.ideas.push(idea);
      themed.set(theme.label, existing);
    } else {
      unthemed.push(idea);
    }
  }

  const children: VisualFocusNode[] = [];

  for (const [label, { ideas, why }] of themed) {
    children.push(node(label, ideas.map((idea) => node(idea))));
    groupReasons.push(`${label} — ${why} (${ideas.length})`);
  }

  for (const cluster of clusterUnthemed(unthemed)) {
    if (cluster.ideas.length === 0) {
      children.push(node(cluster.label));
    } else {
      children.push(node(cluster.label, cluster.ideas.map((idea) => node(idea))));
      groupReasons.push(`${cluster.label} — ${cluster.why}`);
    }
  }

  if (children.length === 0) {
    children.push(
      node("First thoughts", [node("Add what comes to mind")]),
      node("Open questions"),
    );
    groupReasons.push("Started with gentle prompts because the dump was empty.");
  }

  const branchLabels = children.map((c) => c.label);
  const suggestedGaps: string[] = [];
  for (const gap of GAP_PROMPTS) {
    if (gap.whenMissing(branchLabels, lines)) {
      suggestedGaps.push(gap.label);
    }
  }

  const suggestedBranches = suggestedGaps.slice(0, 3);
  for (const gap of suggestedBranches) {
    if (!branchLabels.some((l) => l.toLowerCase() === gap.toLowerCase())) {
      children.push(
        node(gap, [], "Spark suggested this branch — fill or remove as you like."),
      );
    }
  }

  const explanationParts = [
    `I centered the map on “${topic}.”`,
    groupReasons.length > 0
      ? `I grouped your ideas into: ${groupReasons.slice(0, 5).join("; ")}.`
      : "I kept your ideas close to the center so you can reshape freely.",
  ];
  if (duplicates.length > 0) {
    explanationParts.push(
      `I folded ${duplicates.length} near-duplicate${duplicates.length === 1 ? "" : "s"} so the map stays clear.`,
    );
  }
  if (suggestedBranches.length > 0) {
    explanationParts.push(
      `I left soft prompts for: ${suggestedBranches.join(", ")}.`,
    );
  }

  return {
    title: topic.length > 60 ? `${topic.slice(0, 57)}…` : topic,
    root: node(topic, children),
    suggestedGaps,
    suggestedBranches,
    duplicates,
    explanation: explanationParts.join(" "),
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
