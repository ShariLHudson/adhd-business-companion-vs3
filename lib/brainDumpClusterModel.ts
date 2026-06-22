/**
 * Clear My Mind — visual cluster model.
 * Organize only. Reads BrainDumpEntry[] — no duplicate storage.
 */

import {
  BRAINDUMP_CATEGORY_GROUPS,
  normalizeCategory,
} from "./brainDumpCategories";
import type { BrainDumpEntry } from "./companionStore";
import type { VisualThinkingTone } from "./visualThinkingColors";
import { truncateItem } from "./visualThinkingEngine";

export const MAX_MAJOR_CLUSTERS = 5;
export const MAX_VISIBLE_THOUGHTS = 3;
export const OVERWHELM_THRESHOLD = 8;
export const MAX_CLUSTER_DOT_WEIGHT = 8;

/** Visual dot weight for relief clusters — no dominant numeric counts. */
export function formatClusterDotWeight(count: number): {
  dots: string;
  suffix: string | null;
} {
  const n = Math.max(0, Math.floor(count));
  if (n === 0) return { dots: "", suffix: null };
  if (n <= MAX_CLUSTER_DOT_WEIGHT) {
    return { dots: "●".repeat(n), suffix: null };
  }
  return { dots: "●".repeat(MAX_CLUSTER_DOT_WEIGHT), suffix: "+ more" };
}

export function clusterReliefAcknowledgement(count: number): string {
  if (count === 1) return "I've got this thought here. It's safe.";
  if (count > 1) return `I've got ${count} thoughts here. They're safe.`;
  return "I've got these thoughts here. They're safe.";
}

export type ThoughtItem = {
  id: string;
  text: string;
  tone: VisualThinkingTone;
};

export type ThoughtSubCluster = {
  id: string;
  label: string;
  thoughts: ThoughtItem[];
  visibleThoughts: ThoughtItem[];
  moreCount: number;
  overwhelm: boolean;
};

export type ThoughtCluster = {
  id: string;
  label: string;
  icon: string;
  tone: VisualThinkingTone;
  count: number;
  overwhelm: boolean;
  subClusters: ThoughtSubCluster[];
  collapsed: boolean;
};

export type ThoughtRelationship = {
  fromId: string;
  toId: string;
  fromLabel: string;
  toLabel: string;
  reason: string;
};

export type BrainDumpClusterGraph = {
  centerLabel: string;
  centerIcon: string;
  totalThoughts: number;
  clusters: ThoughtCluster[];
  overflowCount: number;
  relationships: ThoughtRelationship[];
  focusSuggestion: string | null;
  hasContent: boolean;
};

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "for",
  "my",
  "i",
  "need",
  "want",
  "get",
  "do",
  "on",
  "in",
  "at",
  "it",
  "is",
  "be",
]);

function categoryGroupName(category: string): string | null {
  const cat = normalizeCategory(category);
  for (const g of BRAINDUMP_CATEGORY_GROUPS) {
    if (g.categories.some((c) => c.toLowerCase() === cat.toLowerCase())) {
      return g.group;
    }
  }
  return null;
}

function groupMeta(groupName: string): { icon: string; tone: VisualThinkingTone } {
  const hit = BRAINDUMP_CATEGORY_GROUPS.find((g) => g.group === groupName);
  if (!hit) return { icon: "🧠", tone: "fact" };
  if (groupName === "Business") return { icon: hit.emoji, tone: "fact" };
  if (groupName === "Personal") return { icon: hit.emoji, tone: "benefit" };
  return { icon: hit.emoji, tone: "idea" };
}

export function toneForEntry(entry: BrainDumpEntry): VisualThinkingTone {
  if (entry.contextType === "urgent" || entry.contextType === "emotional") {
    return "concern";
  }
  if (entry.contextType === "task" || entry.actionType === "task") {
    return "benefit";
  }
  if (
    entry.contextType === "thought" ||
    normalizeCategory(entry.category) === "Ideas" ||
    normalizeCategory(entry.category) === "Brainstorm"
  ) {
    return "idea";
  }
  if (entry.contextType === "reminder") return "question";
  if (entry.suggestion === "timeblock") return "benefit";
  return "fact";
}

function clusterKeyForEntry(entry: BrainDumpEntry): string {
  if (entry.contextType === "urgent" || entry.contextType === "emotional") {
    return "__worries__";
  }
  if (entry.topic?.trim()) return entry.topic.trim();
  const group = categoryGroupName(entry.category ?? "");
  if (group) return group;
  return normalizeCategory(entry.category);
}

function clusterLabel(key: string): { label: string; icon: string; tone: VisualThinkingTone } {
  if (key === "__worries__") {
    return { label: "Worries", icon: "🔴", tone: "concern" };
  }
  const group = BRAINDUMP_CATEGORY_GROUPS.find((g) => g.group === key);
  if (group) {
    const meta = groupMeta(key);
    return { label: key, icon: meta.icon, tone: meta.tone };
  }
  return { label: key, icon: "💭", tone: "idea" };
}

function subClusterKey(entry: BrainDumpEntry): string {
  return normalizeCategory(entry.category);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function buildRelationships(entries: BrainDumpEntry[]): ThoughtRelationship[] {
  const rels: ThoughtRelationship[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i]!;
      const b = entries[j]!;
      let reason: string | null = null;

      if (a.topic && b.topic && a.topic === b.topic) {
        reason = a.topic;
      } else if (
        normalizeCategory(a.category) === normalizeCategory(b.category) &&
        normalizeCategory(a.category) !== "Other"
      ) {
        reason = normalizeCategory(a.category);
      } else {
        const ta = new Set(tokenize(a.text));
        const shared = tokenize(b.text).filter((w) => ta.has(w));
        if (shared.length >= 1) {
          reason = shared[0]!;
        }
      }

      if (reason) {
        const key = [a.id, b.id].sort().join(":");
        if (!seen.has(key)) {
          seen.add(key);
          rels.push({
            fromId: a.id,
            toId: b.id,
            fromLabel: truncateItem(a.text, 40),
            toLabel: truncateItem(b.text, 40),
            reason,
          });
        }
      }
    }
  }

  return rels.slice(0, 12);
}

function focusSuggestionFromGraph(
  subCounts: Map<string, number>,
): string | null {
  if (subCounts.size === 0) return null;
  const top = [...subCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top || top[1] < 3) return null;
  return `There appears to be a common theme around **${top[0]}**.`;
}

export function buildBrainDumpClusterGraph(
  entries: BrainDumpEntry[],
): BrainDumpClusterGraph {
  const active = entries.filter((e) => !e.done);
  if (!active.length) {
    return {
      centerLabel: "My Thoughts",
      centerIcon: "🧠",
      totalThoughts: 0,
      clusters: [],
      overflowCount: 0,
      relationships: [],
      focusSuggestion: null,
      hasContent: false,
    };
  }

  const byCluster = new Map<string, BrainDumpEntry[]>();
  for (const e of active) {
    const key = clusterKeyForEntry(e);
    const list = byCluster.get(key) ?? [];
    list.push(e);
    byCluster.set(key, list);
  }

  const subCounts = new Map<string, number>();
  for (const e of active) {
    const sub = subClusterKey(e);
    subCounts.set(sub, (subCounts.get(sub) ?? 0) + 1);
  }

  const clusterEntries = [...byCluster.entries()].sort(
    (a, b) => b[1].length - a[1].length,
  );

  const major = clusterEntries.slice(0, MAX_MAJOR_CLUSTERS);
  const overflow = clusterEntries.slice(MAX_MAJOR_CLUSTERS);
  const overflowCount = overflow.reduce((n, [, list]) => n + list.length, 0);

  const clusters: ThoughtCluster[] = major.map(([key, list]) => {
    const { label, icon, tone } = clusterLabel(key);
    const bySub = new Map<string, BrainDumpEntry[]>();
    for (const e of list) {
      const sk = subClusterKey(e);
      const sl = bySub.get(sk) ?? [];
      sl.push(e);
      bySub.set(sk, sl);
    }

    const subClusters: ThoughtSubCluster[] = [...bySub.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([subLabel, thoughts]) => {
        const items: ThoughtItem[] = thoughts.map((t) => ({
          id: t.id,
          text: truncateItem(t.text, 72),
          tone: toneForEntry(t),
        }));
        return {
          id: `${key}:${subLabel}`,
          label: subLabel,
          thoughts: items,
          visibleThoughts: items.slice(0, MAX_VISIBLE_THOUGHTS),
          moreCount: Math.max(0, items.length - MAX_VISIBLE_THOUGHTS),
          overwhelm: items.length >= 5,
        };
      });

    const count = list.length;
    return {
      id: key,
      label,
      icon,
      tone,
      count,
      overwhelm: count >= OVERWHELM_THRESHOLD,
      subClusters,
      collapsed: false,
    };
  });

  if (overflowCount > 0) {
    clusters.push({
      id: "__more__",
      label: "More themes",
      icon: "📂",
      tone: "question",
      count: overflowCount,
      overwhelm: false,
      subClusters: [],
      collapsed: true,
    });
  }

  return {
    centerLabel: "My Thoughts",
    centerIcon: "🧠",
    totalThoughts: active.length,
    clusters,
    overflowCount,
    relationships: buildRelationships(active),
    focusSuggestion: focusSuggestionFromGraph(subCounts),
    hasContent: true,
  };
}
