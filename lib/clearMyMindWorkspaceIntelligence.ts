/**
 * Clear My Mind workspace intelligence — analysis that drives the action surface.
 * Buttons launch workflows; Spark shows what it noticed first.
 */

import {
  buildBrainDumpClusterGraph,
  type BrainDumpClusterGraph,
} from "@/lib/brainDumpClusterModel";
import {
  groupEntriesIntoResultBuckets,
  type ClearMyMindResultBucket,
} from "@/lib/clearMyMindResultBuckets";
import {
  CLEAR_MY_MIND_VISIBLE_THINKING_LINES,
} from "@/lib/clearMyMindCopy";
import type { BrainDumpEntry } from "@/lib/companionStore";

export type ClearMyMindWorkflowId =
  | "organize"
  | "visualize"
  | "prioritize"
  | "create"
  | "save"
  | "filter";

export type ClearMyMindWorkflowOffer = {
  id: ClearMyMindWorkflowId;
  label: string;
  reason: string;
  primary?: boolean;
};

export type ClearMyMindWorkspaceAnalysis = {
  thoughtCount: number;
  thinkingLine: string;
  insight: string;
  focusSuggestion: string | null;
  topBucketLabel: string | null;
  topBucketCount: number;
  recommended: ClearMyMindWorkflowOffer[];
  buckets: ClearMyMindResultBucket[];
  graph: BrainDumpClusterGraph;
  /** Ordered entry ids Spark suggests attending first. */
  priorityOrder: string[];
  priorityHeadline: string;
};

const PRIORITY_BUCKET_RANK: Record<string, number> = {
  "do-now": 0,
  today: 1,
  "this-week": 2,
  appointments: 3,
  "follow-up": 4,
  waiting: 5,
  tasks: 6,
  projects: 7,
  questions: 8,
  people: 9,
  health: 10,
  business: 11,
  personal: 12,
  research: 13,
  shopping: 14,
  learning: 15,
  ideas: 16,
  someday: 17,
};

function thinkingLineFor(count: number): string {
  const lines = CLEAR_MY_MIND_VISIBLE_THINKING_LINES;
  return lines[Math.abs(count) % lines.length]!;
}

function insightFrom(
  count: number,
  buckets: ClearMyMindResultBucket[],
  focusSuggestion: string | null,
): string {
  if (count === 0) {
    return "Whenever you're ready, share what's on your mind — we'll sit with it together.";
  }
  if (focusSuggestion) return focusSuggestion;
  const top = buckets[0];
  if (top && top.entries.length >= 2) {
    return `A few of these seem to gather around “${top.label}” — about ${top.entries.length} of them.`;
  }
  if (buckets.length >= 3) {
    return `There are ${count} thoughts here, and they seem to stretch across a few different themes.`;
  }
  if (count === 1) {
    return "There's one clear thought on the table. We can sit with it or shape it into something useful.";
  }
  return `There are ${count} thoughts here. We can make them easier to hold whenever you're ready.`;
}

function priorityOrderFrom(
  entries: BrainDumpEntry[],
  buckets: ClearMyMindResultBucket[],
): string[] {
  const bucketRank = new Map<string, number>();
  for (const bucket of buckets) {
    const rank = PRIORITY_BUCKET_RANK[bucket.id] ?? 50;
    for (const entry of bucket.entries) {
      bucketRank.set(entry.id, rank);
    }
  }
  return [...entries]
    .sort((a, b) => {
      const ra = bucketRank.get(a.id) ?? 40;
      const rb = bucketRank.get(b.id) ?? 40;
      if (ra !== rb) return ra - rb;
      const sa = (a.suggestion ?? a.contextType ?? "").length;
      const sb = (b.suggestion ?? b.contextType ?? "").length;
      return sb - sa;
    })
    .map((e) => e.id);
}

function priorityHeadline(
  entries: BrainDumpEntry[],
  order: string[],
  buckets: ClearMyMindResultBucket[],
): string {
  const firstId = order[0];
  const first = entries.find((e) => e.id === firstId);
  const doNow = buckets.find((b) => b.id === "do-now");
  if (doNow && doNow.entries.length > 0) {
    const sample = doNow.entries[0]!.text.trim().slice(0, 72);
    const ellipsis = doNow.entries[0]!.text.length > 72 ? "…" : "";
    return doNow.entries.length === 1
      ? `One may want attention first: “${sample}${ellipsis}”`
      : `A few feel pressing — one of them begins: “${sample}${ellipsis}”`;
  }
  if (first) {
    const sample = first.text.trim().slice(0, 72);
    return `If we paused on one, I might begin with: “${sample}${first.text.length > 72 ? "…" : ""}”`;
  }
  return "Nothing needs ranking yet — we can keep gathering first.";
}

function buildOffers(
  buckets: ClearMyMindResultBucket[],
  count: number,
  focusSuggestion: string | null,
): ClearMyMindWorkflowOffer[] {
  if (count === 0) {
    return [
      {
        id: "organize",
        label: "Group similar thoughts",
        reason: "We can gather themes after a few more lines.",
        primary: true,
      },
    ];
  }

  const hasPressure =
    buckets.some((b) => b.id === "do-now" || b.id === "today") ||
    Boolean(focusSuggestion);
  const hasManyThemes = buckets.length >= 3;
  const hasProjects = buckets.some((b) => b.id === "projects" || b.id === "tasks");

  /** Calm suggestions — same workflows, quieter presentation language. */
  const offers: ClearMyMindWorkflowOffer[] = [
    {
      id: "prioritize",
      label: "Help me decide what deserves attention first",
      reason: hasPressure
        ? "A few feel more pressing than the rest."
        : "We can sense what wants the next quiet step.",
      primary: hasPressure,
    },
    {
      id: "organize",
      label: "Group similar thoughts",
      reason: hasManyThemes
        ? `There seem to be about ${buckets.length} themes here.`
        : "Related thoughts can sit together.",
      primary: !hasPressure,
    },
    {
      id: "create",
      label: "Turn these into projects",
      reason: hasProjects
        ? "Some already sound like work we can place gently."
        : "When you're ready, we can shape them into next steps.",
    },
    {
      id: "visualize",
      label: "Create a visual map",
      reason: "Sometimes seeing it helps more than listing it.",
    },
    {
      id: "save",
      label: "Save these for later",
      reason: "We can set them down safely and return when you wish.",
    },
  ];

  return offers.sort((a, b) => Number(Boolean(b.primary)) - Number(Boolean(a.primary)));
}

/** Analyze session thoughts and produce workflow offers. */
export function analyzeClearMyMindWorkspace(
  entries: BrainDumpEntry[],
): ClearMyMindWorkspaceAnalysis {
  const buckets = groupEntriesIntoResultBuckets(entries);
  const graph = buildBrainDumpClusterGraph(entries);
  const focusSuggestion = graph.focusSuggestion ?? null;
  const order = priorityOrderFrom(entries, buckets);
  const top = buckets[0] ?? null;

  return {
    thoughtCount: entries.length,
    thinkingLine: thinkingLineFor(entries.length),
    insight: insightFrom(entries.length, buckets, focusSuggestion),
    focusSuggestion,
    topBucketLabel: top?.label ?? null,
    topBucketCount: top?.entries.length ?? 0,
    recommended: buildOffers(buckets, entries.length, focusSuggestion),
    buckets,
    graph,
    priorityOrder: order,
    priorityHeadline: priorityHeadline(entries, order, buckets),
  };
}
