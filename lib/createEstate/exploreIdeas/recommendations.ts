/**
 * Spec 133 — Recommended For Me (personal, not generic).
 * Uses Create suggestion context today; richer Chamber/Board/season hooks later.
 */

import type { CreateSuggestionContext } from "@/lib/createEstate/contextAwareSuggestions";
import type { ActiveCreationWorkspaceSummary } from "@/lib/createEstate/listActiveCreationWorkspaces";
import { listExploreIdeaResults } from "./search";
import type { ExploreIdeaRecommendation } from "./types";

const MAX_RECOMMENDATIONS = 3;

function seasonHint(now = new Date()): string {
  const month = now.getMonth();
  if (month >= 2 && month <= 4) return "spring planning energy";
  if (month >= 5 && month <= 7) return "summer momentum";
  if (month >= 8 && month <= 10) return "fall focus";
  return "a quieter season for grounding work";
}

/**
 * Build up to 3 personal recommendations from active work + suggestion context.
 * Empty when we have nothing honest to say — never pad with generic filler.
 */
export function buildExploreIdeaRecommendations(input: {
  workspaces?: readonly ActiveCreationWorkspaceSummary[];
  suggestionContext?: CreateSuggestionContext | null;
  now?: Date;
}): ExploreIdeaRecommendation[] {
  const workspaces = input.workspaces ?? [];
  const ctx = input.suggestionContext ?? {};
  const results = listExploreIdeaResults(ctx);
  if (results.length === 0) return [];

  const byLabel = new Map(results.map((r) => [r.label.toLowerCase(), r]));
  const out: ExploreIdeaRecommendation[] = [];
  const seen = new Set<string>();

  const push = (label: string, reason: string) => {
    if (out.length >= MAX_RECOMMENDATIONS) return;
    const hit = byLabel.get(label.toLowerCase());
    if (!hit || seen.has(hit.id)) return;
    seen.add(hit.id);
    out.push({ result: hit, reason });
  };

  const recent = workspaces[0];
  if (recent?.kindLabel?.trim()) {
    push(
      recent.kindLabel,
      `Fits the ${recent.kindLabel} you were just working on`,
    );
  }

  if (ctx.kindLabel?.trim() && ctx.kindLabel !== recent?.kindLabel) {
    push(
      ctx.kindLabel,
      "Matches what you’ve been creating lately",
    );
  }

  // Light context-aware defaults when marketing / event shaped.
  const label = (ctx.kindLabel ?? recent?.kindLabel ?? "").toLowerCase();
  if (/\b(marketing|media|content|campaign)\b/.test(label)) {
    push("Marketing Plan", "A natural next plan beside your marketing work");
    push("Content Calendar", "Keeps your marketing rhythm visible");
  } else if (/\b(event|workshop|retreat|webinar)\b/.test(label)) {
    push("Event Plan", "Keeps your gathering details in one place");
    push("Workshop", "Useful when the session itself needs shaping");
  } else if (/\b(client|relationship|referral)\b/.test(label)) {
    push("Client Check-In", "A gentle next step with people you serve");
    push("Follow-Up Email", "When a warm follow-up would help");
  }

  // Season-aware soft suggestion only if we still have room.
  if (out.length < MAX_RECOMMENDATIONS) {
    const season = seasonHint(input.now);
    const seasonal =
      byLabel.get("5-day plan") ??
      byLabel.get("checklist") ??
      byLabel.get("document");
    if (seasonal && !seen.has(seasonal.id)) {
      seen.add(seasonal.id);
      out.push({
        result: seasonal,
        reason: `A calm fit for ${season}`,
      });
    }
  }

  // First-time / empty context — three honest starters, still personal in tone.
  if (out.length === 0) {
    for (const label of ["Email", "Marketing Plan", "Checklist"] as const) {
      push(label, "A clear place many people begin");
    }
  }

  return out.slice(0, MAX_RECOMMENDATIONS);
}

/** Recent kind labels from active workspaces — for Recent source chip. */
export function recentLabelsFromWorkspaces(
  workspaces: readonly ActiveCreationWorkspaceSummary[],
): string[] {
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const w of workspaces) {
    const label = w.kindLabel?.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    labels.push(label);
  }
  return labels;
}
