// Tool suggestion cards — local-only counts for founder testing.
// No conversation text is stored.

import type { ToolSuggestionKind } from "./companionToolSuggestions";

export type ToolSuggestionAction = "offered" | "accepted" | "dismissed";

export type ToolSuggestionCounts = Record<ToolSuggestionKind, number>;

export type ToolSuggestionAnalytics = {
  offered: ToolSuggestionCounts;
  accepted: ToolSuggestionCounts;
  dismissed: ToolSuggestionCounts;
};

const STORAGE_KEY = "companion-tool-suggestion-analytics-v1";

const KINDS: ToolSuggestionKind[] = [
  "clear-mind",
  "focus-session",
  "spin-wheel",
  "breathe",
  "get-unstuck",
];

function zeroCounts(): ToolSuggestionCounts {
  return {
    "clear-mind": 0,
    "focus-session": 0,
    "spin-wheel": 0,
    breathe: 0,
    "get-unstuck": 0,
  };
}

function normalizeCounts(raw: Partial<ToolSuggestionCounts> | undefined): ToolSuggestionCounts {
  const base = zeroCounts();
  if (!raw) return base;
  for (const k of KINDS) {
    base[k] = Number(raw[k]) || 0;
  }
  return base;
}

export function getToolSuggestionAnalytics(): ToolSuggestionAnalytics {
  const empty: ToolSuggestionAnalytics = {
    offered: zeroCounts(),
    accepted: zeroCounts(),
    dismissed: zeroCounts(),
  };
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<ToolSuggestionAnalytics>;
    return {
      offered: normalizeCounts(parsed.offered),
      accepted: normalizeCounts(parsed.accepted),
      dismissed: normalizeCounts(parsed.dismissed),
    };
  } catch {
    return empty;
  }
}

function persist(data: ToolSuggestionAnalytics): ToolSuggestionAnalytics {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* noop */
    }
  }
  return data;
}

function bump(
  action: ToolSuggestionAction,
  kind: ToolSuggestionKind,
): ToolSuggestionAnalytics {
  const data = getToolSuggestionAnalytics();
  data[action][kind] += 1;
  return persist(data);
}

export function trackToolSuggestionOffered(
  kind: ToolSuggestionKind,
): ToolSuggestionAnalytics {
  return bump("offered", kind);
}

export function trackToolSuggestionAccepted(
  kind: ToolSuggestionKind,
): ToolSuggestionAnalytics {
  return bump("accepted", kind);
}

export function trackToolSuggestionDismissed(
  kind: ToolSuggestionKind,
): ToolSuggestionAnalytics {
  return bump("dismissed", kind);
}

/** Dev / founder testing: read in browser console via getToolSuggestionAnalytics(). */
export function toolSuggestionSummary(
  data = getToolSuggestionAnalytics(),
): string {
  const lines: string[] = ["Tool suggestion analytics (local):"];
  for (const k of KINDS) {
    const o = data.offered[k];
    const a = data.accepted[k];
    const d = data.dismissed[k];
    if (o === 0 && a === 0 && d === 0) continue;
    const rate =
      o > 0 ? ` (${Math.round((a / o) * 100)}% accepted)` : "";
    lines.push(`  ${k}: offered ${o}, accepted ${a}, dismissed ${d}${rate}`);
  }
  if (lines.length === 1) return `${lines[0]} (no events yet)`;
  return lines.join("\n");
}
