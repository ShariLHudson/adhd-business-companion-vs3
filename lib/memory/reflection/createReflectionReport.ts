/**
 * createReflectionReport™ — pure memory analysis, no chat / no UI.
 */

import { queryMemoryEntries } from "../queryMemory";
import type { MemoryDateRange, UserMemoryEntry } from "../types";
import {
  BEHAVIOR_CYCLE_SIGNALS,
  CHALLENGE_SIGNALS,
  EMOTIONAL_SIGNALS,
  entryText,
  INSIGHT_RULES,
  matchBuckets,
  THEME_SIGNALS,
  tokenizeForCluster,
  WIN_SIGNAL,
  type InsightContext,
} from "./patternSignals";
import {
  REFLECTION_INSUFFICIENT_SUMMARY,
  REFLECTION_MIN_ENTRIES,
  type ReflectionReport,
  type ReflectionTimeRange,
} from "./types";

export type CreateReflectionReportInput = {
  timeRange: ReflectionTimeRange;
  /** Test hook — supply entries instead of reading live store */
  entries?: UserMemoryEntry[];
};

function countBucketMatches(
  entries: UserMemoryEntry[],
  buckets: { id: string; label: string; pattern: RegExp }[],
): Map<string, { label: string; count: number }> {
  const counts = new Map<string, { label: string; count: number }>();
  for (const entry of entries) {
    const text = entryText(entry);
    for (const bucket of matchBuckets(text, buckets)) {
      const prev = counts.get(bucket.id) ?? { label: bucket.label, count: 0 };
      prev.count += 1;
      counts.set(bucket.id, prev);
    }
  }
  return counts;
}

function labelsAboveThreshold(
  counts: Map<string, { label: string; count: number }>,
  minCount = 2,
): string[] {
  return [...counts.values()]
    .filter((v) => v.count >= minCount)
    .sort((a, b) => b.count - a.count)
    .map((v) => v.label);
}

function detectBehaviorCycles(entries: UserMemoryEntry[]): string[] {
  const corpus = entries.map(entryText).join("\n");
  const found: string[] = [];
  for (const cycle of BEHAVIOR_CYCLE_SIGNALS) {
    if (cycle.requires.every((re) => re.test(corpus))) {
      found.push(cycle.label);
    }
  }
  return found;
}

function semanticThemeClusters(entries: UserMemoryEntry[]): string[] {
  const freq = new Map<string, number>();
  for (const entry of entries) {
    const tokens = new Set(tokenizeForCluster(entryText(entry)));
    for (const token of tokens) {
      freq.set(token, (freq.get(token) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => `recurring focus: ${word} (${count} entries)`);
}

function extractWins(entries: UserMemoryEntry[]): string[] {
  const wins: string[] = [];
  for (const entry of entries) {
    const isWinType = entry.type === "portfolio" || entry.type === "evidence";
    const text = entryText(entry);
    if (isWinType || WIN_SIGNAL.test(text)) {
      const line = text.split(/\n/)[0]?.trim().slice(0, 160);
      if (line) wins.push(line);
    }
  }
  return [...new Set(wins)].slice(0, 12);
}

function extractChallenges(entries: UserMemoryEntry[]): string[] {
  const labels = labelsAboveThreshold(
    countBucketMatches(entries, CHALLENGE_SIGNALS),
    1,
  );
  const extra: string[] = [];
  for (const entry of entries) {
    const text = entryText(entry);
    if (/\b(?:struggle|hard day|difficult|rough)\b/i.test(text)) {
      const line = text.split(/\n/)[0]?.trim().slice(0, 120);
      if (line) extra.push(line);
    }
  }
  return [...new Set([...labels, ...extra])].slice(0, 8);
}

function buildInsightContext(
  entries: UserMemoryEntry[],
  themeCounts: Map<string, { label: string; count: number }>,
  emotionCounts: Map<string, { label: string; count: number }>,
  behaviorLabels: string[],
): InsightContext {
  const emotionalIds = new Set<string>();
  for (const [id, v] of emotionCounts) {
    if (v.count > 0) emotionalIds.add(id);
  }
  const behaviorIds = new Set(
    BEHAVIOR_CYCLE_SIGNALS.filter((c) => behaviorLabels.includes(c.label)).map(
      (c) => c.id,
    ),
  );
  const winTypes = new Set(
    entries.filter((e) => {
      const isWinType = e.type === "portfolio" || e.type === "evidence";
      return isWinType || WIN_SIGNAL.test(entryText(e));
    }).map((e) => e.type),
  );

  const themeCountMap = new Map<string, number>();
  for (const [id, v] of themeCounts) {
    themeCountMap.set(id, v.count);
  }
  const emotionCountMap = new Map<string, number>();
  for (const [id, v] of emotionCounts) {
    emotionCountMap.set(id, v.count);
  }

  return {
    emotionalIds,
    behaviorIds,
    themeCounts: themeCountMap,
    emotionCounts: emotionCountMap,
    winTypes,
  };
}

function buildSummary(
  entries: UserMemoryEntry[],
  themes: string[],
  emotions: string[],
): string {
  const parts = [
    `Analysis of ${entries.length} memory entries.`,
    themes.length
      ? `Dominant themes: ${themes.slice(0, 3).join("; ")}.`
      : "No dominant themes crossed the recurrence threshold.",
    emotions.length
      ? `Emotional signals: ${emotions.slice(0, 3).join("; ")}.`
      : "Emotional pattern density was low in this period.",
  ];
  return parts.join(" ");
}

function emptyReport(): ReflectionReport {
  return {
    themes: [],
    emotionalPatterns: [],
    behaviorPatterns: [],
    wins: [],
    challenges: [],
    insights: [],
    summary: REFLECTION_INSUFFICIENT_SUMMARY,
    generatedAt: new Date().toISOString(),
    entryCount: 0,
    insufficientData: true,
  };
}

/**
 * Analyze UserMemoryStore entries and produce a structured reflection report.
 * Does not call chat, navigation, or LLM APIs.
 */
export function createReflectionReport(
  input: CreateReflectionReportInput,
): ReflectionReport {
  const dateRange: MemoryDateRange = input.timeRange;
  const entries =
    input.entries ??
    queryMemoryEntries({
      typeFilter: "all",
      dateRange,
    });

  if (entries.length < REFLECTION_MIN_ENTRIES) {
    return {
      ...emptyReport(),
      entryCount: entries.length,
    };
  }

  const themeCounts = countBucketMatches(entries, THEME_SIGNALS);
  const emotionCounts = countBucketMatches(entries, EMOTIONAL_SIGNALS);

  const themes = [
    ...labelsAboveThreshold(themeCounts),
    ...semanticThemeClusters(entries),
  ].slice(0, 8);

  const emotionalPatterns = labelsAboveThreshold(emotionCounts, 1).slice(0, 8);
  const behaviorPatterns = detectBehaviorCycles(entries);
  const wins = extractWins(entries);
  const challenges = extractChallenges(entries);

  const ctx = buildInsightContext(
    entries,
    themeCounts,
    emotionCounts,
    behaviorPatterns,
  );
  const insights = INSIGHT_RULES.filter((r) => r.when(ctx)).map((r) => r.label);

  return {
    themes,
    emotionalPatterns,
    behaviorPatterns,
    wins,
    challenges,
    insights,
    summary: buildSummary(entries, themes, emotionalPatterns),
    generatedAt: new Date().toISOString(),
    entryCount: entries.length,
    insufficientData: false,
  };
}

/** Detect member request for reflection — not a chat turn. */
export function isReflectionRequest(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  return (
    /\bweekly reflection\b/.test(t) ||
    /\b(?:my|generate|show|run|open)\s+reflection\b/.test(t) ||
    /\breflection report\b/.test(t)
  );
}
