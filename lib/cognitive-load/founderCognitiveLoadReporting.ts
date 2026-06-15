/**
 * Founder-facing cognitive load reporting — aggregate, privacy-safe preview.
 */

import { getCognitiveLoadStore } from "./loadStore";
import type { CognitiveLoadSnapshot, FounderCognitiveLoadReport } from "./types";

export function buildFounderCognitiveLoadReport(
  now = new Date(),
): FounderCognitiveLoadReport {
  const store = getCognitiveLoadStore();
  const since7d = now.getTime() - 7 * 86_400_000;
  const recent = store.history.filter(
    (s) => new Date(s.createdAt).getTime() >= since7d,
  );

  const values = recent.map((s) => s.score);
  const averageLoad =
    values.length > 0
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;

  const overloadedUsers = recent.filter((s) => s.score >= 76).length;

  const contributorCounts = new Map<string, number>();
  for (const snap of store.history.slice(-30)) {
    for (const c of snap.contributors) {
      contributorCounts.set(c.id, (contributorCounts.get(c.id) ?? 0) + 1);
    }
  }

  const commonContributors = [...contributorCounts.entries()]
    .map(([id, count]) => ({
      id,
      label: contributorLabel(id),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const trend = computeLoadTrend(store.history);
  const topId = commonContributors[0]?.id;

  return {
    generatedAt: now.toISOString(),
    averageLoad,
    overloadedUsers,
    sampleSize: recent.length,
    loadTrend: trend,
    commonContributors,
    recommendedFounderAction: founderActionFor(topId),
    notes:
      "Local preview — connect anonymized server aggregates for org-wide load trends.",
  };
}

function contributorLabel(id: string): string {
  const labels: Record<string, string> = {
    active_projects: "Active projects",
    stalled_projects: "Stalled projects",
    overdue_tasks: "Overdue tasks",
    open_captures: "Open captures",
    too_many_open_ideas: "Too many open ideas",
    decision_load: "Decision load",
    overwhelm_conversations: "Overwhelm language",
    stuck_conversations: "Stuck patterns",
    rsd_loop: "RSD / loop patterns",
    shame_self_criticism: "Shame / self-criticism",
    repeated_help_requests: "Repeated help requests",
    recurring_stuck_pattern: "Recurring stuck pattern",
    day_overwhelm: "Day overwhelm check-in",
    current_overwhelm: "Current overwhelm",
    schedule_density: "Schedule density",
  };
  return labels[id] ?? id.replaceAll("_", " ");
}

function founderActionFor(topContributorId: string | undefined): string {
  switch (topContributorId) {
    case "active_projects":
    case "stalled_projects":
      return "Review project limits and pause flows — help users carry fewer active threads.";
    case "overdue_tasks":
    case "schedule_pressure":
      return "Surface gentler schedule recovery — not more tasks.";
    case "overwhelm_conversations":
    case "current_overwhelm":
    case "too_many_open_ideas":
      return "Promote brain dump + park workflows before new creation prompts.";
    case "decision_load":
    case "uncertainty":
      return "Add decision-narrowing prompts earlier in companion chat.";
    case "rsd_loop":
    case "shame_self_criticism":
      return "Ensure companion copy stays shame-free; add grounding-first paths.";
    case "repeated_help_requests":
    case "recurring_stuck_pattern":
      return "Wire Activation Intelligence offers earlier when stuck language repeats.";
    case "burnout_signals":
    case "low_energy_high_load":
      return "Default to recovery suggestions — avoid productivity nudges when energy is low.";
    default:
      return "Monitor load trends — no product change suggested until patterns clarify.";
  }
}

function computeLoadTrend(
  history: CognitiveLoadSnapshot[],
): "rising" | "stable" | "easing" {
  if (history.length < 2) return "stable";
  const recent = history.slice(-7);
  const first = recent.slice(0, Math.ceil(recent.length / 2));
  const second = recent.slice(Math.ceil(recent.length / 2));
  const avg = (arr: typeof recent) =>
    arr.reduce((s, h) => s + h.score, 0) / (arr.length || 1);
  const delta = avg(second) - avg(first);
  if (delta >= 8) return "rising";
  if (delta <= -8) return "easing";
  return "stable";
}
