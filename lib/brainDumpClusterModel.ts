/**
 * Clear My Mind — visual cluster model.
 * Organize only. Reads BrainDumpEntry[] — no duplicate storage.
 */

import {
  BRAINDUMP_CATEGORY_GROUPS,
  normalizeCategory,
} from "./brainDumpCategories";
import type { ClusterOverrides } from "./brainDumpClusterPreferences";
import type { BrainDumpEntry } from "./companionStore";
import { isVisibleInMentalLandscape } from "./thoughtLifecycle";
import type { VisualThinkingTone } from "./visualThinkingColors";
import { truncateItem } from "./visualThinkingEngine";

export const MAX_MAJOR_CLUSTERS = 5;
export const MAX_VISIBLE_THOUGHTS = 3;
export const OVERWHELM_THRESHOLD = 8;
export const MAX_CLUSTER_DOT_WEIGHT = 8;
export const MIN_SHARED_TOKENS_FOR_THEME = 2;
export const MAX_RELATIONSHIPS = 24;

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
  return { dots: "●".repeat(MAX_CLUSTER_DOT_WEIGHT), suffix: "· · ·" };
}

export function clusterReliefAcknowledgement(count: number): string {
  if (count === 1) return "I've got this thought here. It's safe.";
  if (count > 1) return `I've got ${count} thoughts here. They're safe.`;
  return "I've got these thoughts here. They're safe.";
}

export const MORE_CLUSTER_FALLBACK =
  "Other thoughts are safely held here.";

/** Flatten visible thought previews for a major cluster (max per sub-cluster). */
export function getClusterVisibleThoughts(
  cluster: ThoughtCluster,
  showAll = false,
): ThoughtItem[] {
  if (showAll) {
    return cluster.subClusters.flatMap((sub) => sub.thoughts);
  }
  return cluster.subClusters.flatMap((sub) => sub.visibleThoughts);
}

export function getClusterEntryIds(cluster: ThoughtCluster): string[] {
  return cluster.subClusters.flatMap((sub) => sub.thoughts.map((t) => t.id));
}

/** Why thoughts landed in this cluster — shown when expanded. */
export function clusterGroupingExplanation(cluster: ThoughtCluster): string {
  if (cluster.id === "__more__") {
    return "Extra themes are held here so the main view stays calm — open any cluster to move or recategorize thoughts.";
  }
  if (cluster.id === "__worries__") {
    return "Grouped because these thoughts were marked urgent or emotional.";
  }
  const subLabels = cluster.subClusters.map((s) => s.label).filter(Boolean);
  if (subLabels.length === 1) {
    return `Grouped by category **${subLabels[0]}** — change a thought's category to move it.`;
  }
  if (subLabels.length > 1) {
    return `Grouped by shared area ${cluster.label} with sub-categories: ${subLabels.join(", ")}.`;
  }
  return `Grouped by theme ${cluster.label} — rename or merge clusters below to adjust.`;
}

/** Calm copy when a cluster has no thought list to reveal. */
export function clusterThoughtExpansionFallback(
  cluster: ThoughtCluster,
): string | null {
  if (cluster.id === "__more__") return MORE_CLUSTER_FALLBACK;
  if (getClusterVisibleThoughts(cluster).length === 0) {
    return MORE_CLUSTER_FALLBACK;
  }
  return null;
}

export function clusterOffersThoughtPreview(cluster: ThoughtCluster): boolean {
  if (cluster.id === "__more__") return true;
  return getClusterVisibleThoughts(cluster).length > 0;
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

export type RelationshipKind =
  | "same_project"
  | "same_goal"
  | "same_topic"
  | "same_category"
  | "same_deadline"
  | "same_person"
  | "shared_theme";

export type ThoughtRelationship = {
  fromId: string;
  toId: string;
  fromLabel: string;
  toLabel: string;
  kind: RelationshipKind;
  reason: string;
  whyLabel: string;
};

/** Connection groups for the Connections view — explicit WHY, no fabricated themes. */
export type ThoughtConnectionGroup = {
  kind: RelationshipKind;
  whyLabel: string;
  detail?: string;
  thoughtIds: string[];
  thoughts: string[];
};

/** @deprecated Use ThoughtConnectionGroup */
export type ThoughtThemeGroup = {
  reason: string;
  themeLabel: string;
  thoughts: string[];
  observation: string;
};

export type ClusterAlignmentAudit = {
  clusterCount: number;
  connectionGroupCount: number;
  hiddenClusterCount: number;
  summary: string;
  factors: string[];
};

export function relationshipWhyLabel(
  kind: RelationshipKind,
  detail?: string,
): string {
  switch (kind) {
    case "same_project":
      return "Same project";
    case "same_goal":
      return "Same goal";
    case "same_topic":
      return detail ? `Same theme: ${detail}` : "Same theme";
    case "same_category":
      return detail ? `Same category: ${detail}` : "Same category";
    case "same_deadline":
      return detail ? `Same timing: ${detail}` : "Same deadline";
    case "same_person":
      return detail ? `Same person: ${detail}` : "Same person";
    case "shared_theme":
      return detail ? `Shared focus: ${detail}` : "Shared theme";
    default:
      return "Connected";
  }
}

function themeLabelForReason(reason: string): string {
  const trimmed = reason.trim();
  if (!trimmed) return "Related thoughts";
  const lower = trimmed.toLowerCase();
  if (lower === "worries") return "Worries";
  if (/^(health|business|personal|family|work)$/i.test(trimmed)) {
    return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)} theme`;
  }
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)} theme`;
}

function themeObservation(reason: string, count: number): string {
  const label = themeLabelForReason(reason).replace(/ theme$/i, "").toLowerCase();
  if (count <= 1) {
    return "This thought stood out on its own — still safely held.";
  }
  if (count === 2) {
    return `These two thoughts connect — ${label}.`;
  }
  return `Several thoughts share ${label} — grouped so you can see the pattern without sorting everything now.`;
}

/** @deprecated Use buildConnectionGroups */
export function groupRelationshipsByTheme(
  relationships: ThoughtRelationship[],
): ThoughtThemeGroup[] {
  return buildConnectionGroups(relationships).map((g) => ({
    reason: g.detail ?? g.kind,
    themeLabel: g.whyLabel,
    thoughts: g.thoughts,
    observation: themeObservation(g.detail ?? g.whyLabel, g.thoughts.length),
  }));
}

/** Group relationships by meaningful connection kind — no single-token fabrications. */
export function buildConnectionGroups(
  relationships: ThoughtRelationship[],
): ThoughtConnectionGroup[] {
  const byKey = new Map<
    string,
    { kind: RelationshipKind; whyLabel: string; detail?: string; ids: Set<string>; labels: Set<string> }
  >();

  for (const rel of relationships) {
    const key = `${rel.kind}:${rel.reason}`;
    const bucket =
      byKey.get(key) ??
      {
        kind: rel.kind,
        whyLabel: rel.whyLabel,
        detail: rel.reason,
        ids: new Set<string>(),
        labels: new Set<string>(),
      };
    bucket.ids.add(rel.fromId);
    bucket.ids.add(rel.toId);
    bucket.labels.add(rel.fromLabel);
    bucket.labels.add(rel.toLabel);
    byKey.set(key, bucket);
  }

  return [...byKey.values()]
    .map((bucket) => ({
      kind: bucket.kind,
      whyLabel: bucket.whyLabel,
      detail: bucket.detail,
      thoughtIds: [...bucket.ids],
      thoughts: [...bucket.labels].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      ),
    }))
    .sort((a, b) => b.thoughts.length - a.thoughts.length);
}

export function auditClusterConnectionAlignment(
  graph: BrainDumpClusterGraph,
): ClusterAlignmentAudit {
  const major = graph.clusters.filter((c) => c.id !== "__more__");
  const connectionGroups = buildConnectionGroups(graph.relationships);
  const hidden = graph.clusters.find((c) => c.id === "__more__");

  const factors: string[] = [];

  if (major.length > connectionGroups.length) {
    factors.push(
      "Clusters group by topic or category area; Connections only appear when at least two thoughts share a specific link (project, goal, category, timing, or strong shared words).",
    );
  }
  if (hidden && hidden.count > 0) {
    factors.push(
      `${hidden.count} thought(s) sit in "More themes" because only ${MAX_MAJOR_CLUSTERS} major clusters show at once.`,
    );
  }
  if (graph.relationships.length >= MAX_RELATIONSHIPS) {
    factors.push(
      `Connection list is capped at ${MAX_RELATIONSHIPS} links — some weaker ties may be hidden.`,
    );
  }
  if (connectionGroups.length === 0 && graph.totalThoughts >= 2) {
    factors.push(
      "No strong pairwise links met the threshold — thoughts may still share a cluster without a specific connection reason.",
    );
  }

  const summary =
    major.length > connectionGroups.length
      ? `${major.length} clusters visible, ${connectionGroups.length} connection group${connectionGroups.length === 1 ? "" : "s"} found — clusters and connections use different rules.`
      : `${major.length} cluster${major.length === 1 ? "" : "s"}, ${connectionGroups.length} connection group${connectionGroups.length === 1 ? "" : "s"}.`;

  return {
    clusterCount: major.length,
    connectionGroupCount: connectionGroups.length,
    hiddenClusterCount: hidden?.count ?? 0,
    summary,
    factors,
  };
}

export type BrainDumpClusterGraph = {
  centerLabel: string;
  centerIcon: string;
  totalThoughts: number;
  clusters: ThoughtCluster[];
  overflowCount: number;
  relationships: ThoughtRelationship[];
  focusSuggestion: string | null;
  hasContent: boolean;
  alignmentAudit: ClusterAlignmentAudit;
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
  "call",
  "email",
  "text",
]);

const PERSON_CATEGORIES = new Set(["Family", "Networking", "Admin"]);

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

export function resolveClusterKey(
  entry: BrainDumpEntry,
  overrides?: ClusterOverrides,
): string {
  let key = clusterKeyForEntry(entry);
  if (overrides?.mergeInto[key]) {
    key = overrides.mergeInto[key]!;
  }
  return key;
}

function clusterLabel(
  key: string,
  overrides?: ClusterOverrides,
): { label: string; icon: string; tone: VisualThinkingTone } {
  if (overrides?.rename[key]?.trim()) {
    const base = clusterLabelBase(key);
    return { ...base, label: overrides.rename[key]!.trim() };
  }
  return clusterLabelBase(key);
}

function clusterLabelBase(key: string): {
  label: string;
  icon: string;
  tone: VisualThinkingTone;
} {
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

function extractPersonHint(text: string): string | null {
  const match = text.match(
    /\b(?:call|email|text|meet|contact)\s+([A-Z][a-z]{2,})\b/,
  );
  return match?.[1] ?? null;
}

function detectRelationship(
  a: BrainDumpEntry,
  b: BrainDumpEntry,
): { kind: RelationshipKind; reason: string } | null {
  if (a.projectId && b.projectId && a.projectId === b.projectId) {
    return { kind: "same_project", reason: a.projectId };
  }
  if (a.outcomeGoalId && b.outcomeGoalId && a.outcomeGoalId === b.outcomeGoalId) {
    return { kind: "same_goal", reason: a.outcomeGoalId };
  }
  if (a.topic && b.topic && a.topic === b.topic && a.topic !== "Other") {
    return { kind: "same_topic", reason: a.topic };
  }
  const catA = normalizeCategory(a.category);
  const catB = normalizeCategory(b.category);
  if (catA === catB && catA !== "Other") {
    return { kind: "same_category", reason: catA };
  }
  if (
    a.schedulingIntent &&
    b.schedulingIntent &&
    a.schedulingIntent === b.schedulingIntent
  ) {
    return { kind: "same_deadline", reason: a.schedulingIntent };
  }
  const personA = extractPersonHint(a.text);
  const personB = extractPersonHint(b.text);
  if (
    personA &&
    personB &&
    personA === personB &&
    (PERSON_CATEGORIES.has(catA) || PERSON_CATEGORIES.has(catB))
  ) {
    return { kind: "same_person", reason: personA };
  }
  const ta = new Set(tokenize(a.text));
  const shared = tokenize(b.text).filter((w) => ta.has(w));
  if (shared.length >= MIN_SHARED_TOKENS_FOR_THEME) {
    return { kind: "shared_theme", reason: shared.slice(0, 3).join(", ") };
  }
  return null;
}

function buildRelationships(entries: BrainDumpEntry[]): ThoughtRelationship[] {
  const rels: ThoughtRelationship[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i]!;
      const b = entries[j]!;
      const hit = detectRelationship(a, b);
      if (!hit) continue;

      const key = [a.id, b.id].sort().join(":");
      if (seen.has(key)) continue;
      seen.add(key);

      rels.push({
        fromId: a.id,
        toId: b.id,
        fromLabel: truncateItem(a.text, 40),
        toLabel: truncateItem(b.text, 40),
        kind: hit.kind,
        reason: hit.reason,
        whyLabel: relationshipWhyLabel(hit.kind, hit.reason),
      });
    }
  }

  const priority: Record<RelationshipKind, number> = {
    same_project: 0,
    same_goal: 1,
    same_topic: 2,
    same_category: 3,
    same_deadline: 4,
    same_person: 5,
    shared_theme: 6,
  };

  return rels
    .sort((x, y) => priority[x.kind] - priority[y.kind])
    .slice(0, MAX_RELATIONSHIPS);
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
  overrides?: ClusterOverrides,
): BrainDumpClusterGraph {
  const active = entries.filter(isVisibleInMentalLandscape);
  if (!active.length) {
    const emptyAudit: ClusterAlignmentAudit = {
      clusterCount: 0,
      connectionGroupCount: 0,
      hiddenClusterCount: 0,
      summary: "No active thoughts.",
      factors: [],
    };
    return {
      centerLabel: "My Thoughts",
      centerIcon: "🧠",
      totalThoughts: 0,
      clusters: [],
      overflowCount: 0,
      relationships: [],
      focusSuggestion: null,
      hasContent: false,
      alignmentAudit: emptyAudit,
    };
  }

  const byCluster = new Map<string, BrainDumpEntry[]>();
  for (const e of active) {
    const key = resolveClusterKey(e, overrides);
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
    const { label, icon, tone } = clusterLabel(key, overrides);
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

  const relationships = buildRelationships(active);
  const graph: BrainDumpClusterGraph = {
    centerLabel: "My Thoughts",
    centerIcon: "🧠",
    totalThoughts: active.length,
    clusters,
    overflowCount,
    relationships,
    focusSuggestion: focusSuggestionFromGraph(subCounts),
    hasContent: true,
    alignmentAudit: {
      clusterCount: 0,
      connectionGroupCount: 0,
      hiddenClusterCount: 0,
      summary: "",
      factors: [],
    },
  };
  graph.alignmentAudit = auditClusterConnectionAlignment(graph);
  return graph;
}
