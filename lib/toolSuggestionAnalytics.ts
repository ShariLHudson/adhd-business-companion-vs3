// Tool suggestion cards — local-only counts for founder testing.
// No conversation text is stored.

import type { ToolSuggestionKind } from "./companionToolSuggestions";
import { recordTrustEvidence } from "./intelligence-layer/trustSignals";
import type { TrustSignalCategory } from "./intelligence-layer/trustSignals";

export type ToolSuggestionAction = "offered" | "accepted" | "dismissed";

export type ToolSuggestionCounts = Record<ToolSuggestionKind, number>;

export type ToolSuggestionAnalytics = {
  offered: ToolSuggestionCounts;
  accepted: ToolSuggestionCounts;
  dismissed: ToolSuggestionCounts;
};

const STORAGE_KEY = "companion-tool-suggestion-analytics-v1";

const TRUST_EMITTER = "toolSuggestionAnalytics";

const KINDS: ToolSuggestionKind[] = [
  "clear-mind",
  "focus-session",
  "spin-wheel",
  "breathe",
  "get-unstuck",
];

/** Approved PR 6 mapping: UI kind → intervention registry offerKey. */
const TOOL_KIND_OFFER_KEYS: Record<ToolSuggestionKind, string> = {
  "clear-mind": "clear-mind",
  breathe: "breathe",
  "get-unstuck": "get-unstuck",
  "focus-session": "focus-session",
  "spin-wheel": "spin-wheel",
};

const ACTION_TRUST_CATEGORY: Record<
  ToolSuggestionAction,
  TrustSignalCategory
> = {
  offered: "trust.offer_rendered",
  accepted: "trust.suggestion_accepted",
  dismissed: "trust.suggestion_dismissed",
};

export function toolKindToOfferKey(kind: ToolSuggestionKind): string {
  return TOOL_KIND_OFFER_KEYS[kind];
}

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

function recordTrustForToolSuggestion(
  action: ToolSuggestionAction,
  kind: ToolSuggestionKind,
): void {
  try {
    recordTrustEvidence({
      category: ACTION_TRUST_CATEGORY[action],
      offerKey: toolKindToOfferKey(kind),
      source: `tool-suggestion:${action}:${kind}`,
      emitter: TRUST_EMITTER,
      causationType: "user_action",
    });
  } catch {
    /* trust collection must never affect analytics or UI */
  }
}

function bump(
  action: ToolSuggestionAction,
  kind: ToolSuggestionKind,
): ToolSuggestionAnalytics {
  const data = getToolSuggestionAnalytics();
  data[action][kind] += 1;
  const result = persist(data);
  recordTrustForToolSuggestion(action, kind);
  return result;
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
