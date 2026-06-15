/**
 * Cognitive load summaries and recommendations — awareness, not judgment.
 */

import type {
  CognitiveLoadLevel,
  CognitiveLoadScore,
  LoadContributor,
  LoadDomain,
  LoadRecommendation,
} from "./types";

/** Canonical companion offer when load is heavy+. */
export const COGNITIVE_LOAD_COMPANION_OFFER =
  "It looks like you may be carrying a lot right now. Would it help to sort this into what matters today, what can wait, and what can be parked?";

const SUMMARY_BY_CONTRIBUTOR: Partial<Record<string, string>> = {
  active_projects:
    "You have several active projects competing for attention.",
  stalled_projects: "Some projects have stalled — that adds quiet weight.",
  overdue_tasks: "Overdue tasks may be adding pressure.",
  unresolved_next_actions: "There are repeated unresolved decisions.",
  open_captures: "Open brain-dump items are adding to what you're holding.",
  too_many_open_ideas: "The number of open items has increased this week.",
  decision_load: "Decision load appears high.",
  overwhelm_conversations: "You've mentioned overwhelm multiple times recently.",
  stuck_conversations: "You've sounded stuck in a few recent chats.",
  uncertainty: "There's some uncertainty about what to tackle next.",
  day_overwhelm: "You noted elevated overwhelm when checking in today.",
  low_energy_high_load: "Energy is low while the mental load feels high.",
  current_overwhelm: "You appear to be carrying a lot right now.",
  current_stuck: "Starting or moving forward seems heavy at the moment.",
  rsd_loop: "Emotional sensitivity may be amplifying what you're carrying.",
  shame_self_criticism:
    "Self-criticism is loud — that counts as load, not as failure.",
  repeated_help_requests:
    "You've asked for help getting unstuck more than once recently.",
  unresolved_topic_loop: "A topic keeps circling without resolution.",
  recurring_stuck_pattern: "Similar stuck themes keep surfacing.",
  schedule_density: "Today's schedule looks fairly full.",
  schedule_pressure: "Missed blocks may be adding schedule pressure.",
};

const LEVEL_SUMMARY: Record<CognitiveLoadLevel, string> = {
  light: "Your load looks fairly light right now.",
  moderate: "You're carrying a moderate amount — nothing alarming.",
  heavy: "You appear to be carrying a lot right now.",
  overloaded: "This looks like a heavy season — be gentle with yourself.",
};

const RECOMMENDATIONS: {
  id: string;
  domain: LoadDomain;
  when: (score: CognitiveLoadScore) => boolean;
  text: string;
}[] = [
  {
    id: "finish_before_start",
    domain: "business",
    when: (s) =>
      s.contributors.some((c) => c.id === "active_projects") &&
      s.domainTotals.business >= 12,
    text: "Finish before starting — close one loop before opening another.",
  },
  {
    id: "reduce_active_projects",
    domain: "business",
    when: (s) =>
      s.contributors.some(
        (c) => c.id === "active_projects" && c.detail.includes("competing"),
      ),
    text: "Reduce active projects — pause one that can wait.",
  },
  {
    id: "capture_and_park",
    domain: "business",
    when: (s) =>
      s.contributors.some(
        (c) => c.id === "open_captures" || c.id === "too_many_open_ideas",
      ),
    text: "Park new ideas — capture them, then set aside what doesn't need today.",
  },
  {
    id: "one_priority",
    domain: "business",
    when: (s) =>
      s.contributors.some(
        (c) => c.id === "decision_load" || c.id === "uncertainty",
      ),
    text: "Pick one priority for today — not everything.",
  },
  {
    id: "recovery_step",
    domain: "emotional",
    when: (s) =>
      s.contributors.some(
        (c) =>
          c.id === "burnout_signals" ||
          c.id === "low_energy_high_load" ||
          c.id === "day_overwhelm",
      ),
    text: "Take a recovery step before pushing for output.",
  },
  {
    id: "ask_companion_sort",
    domain: "companion",
    when: (s) =>
      s.domainTotals.companion >= 6 ||
      s.level === "heavy" ||
      s.level === "overloaded",
    text: "Ask Companion to sort the load — what matters, what waits, what parks.",
  },
  {
    id: "ground_first",
    domain: "emotional",
    when: (s) =>
      s.contributors.some(
        (c) => c.id === "rsd_loop" || c.id === "shame_self_criticism",
      ),
    text: "Ground first — separate facts from the story fear is telling.",
  },
  {
    id: "lighten_schedule",
    domain: "environmental",
    when: (s) => s.domainTotals.environmental >= 8,
    text: "If you can, leave one open pocket in today's schedule.",
  },
];

export function buildLoadSummaries(score: CognitiveLoadScore): string[] {
  const lines: string[] = [];
  const top = score.contributors.filter((c) => c.points > 0).slice(0, 3);

  if (score.level === "heavy" || score.level === "overloaded") {
    lines.push(LEVEL_SUMMARY[score.level]);
  } else if (top.length === 0) {
    lines.push(LEVEL_SUMMARY[score.level]);
  }

  for (const c of top) {
    const line = contributorSummary(c);
    if (line && !lines.includes(line)) lines.push(line);
  }

  return lines.slice(0, 3);
}

export function buildLoadSummaryText(score: CognitiveLoadScore): string {
  return buildLoadSummaries(score).join(" ");
}

function contributorSummary(c: LoadContributor): string | null {
  return SUMMARY_BY_CONTRIBUTOR[c.id] ?? null;
}

export function buildLoadRecommendations(
  score: CognitiveLoadScore,
): LoadRecommendation[] {
  const out: LoadRecommendation[] = [];
  for (const rec of RECOMMENDATIONS) {
    if (!rec.when(score)) continue;
    out.push({ id: rec.id, domain: rec.domain, text: rec.text });
    if (out.length >= 3) break;
  }
  if (out.length === 0 && score.level !== "light") {
    out.push({
      id: "one_small_step",
      domain: "mental",
      text: "One small step is enough for today.",
    });
  }
  return out;
}

/** Gentle companion offer — optional, never pushy. */
export function buildCompanionLoadOffer(
  level: CognitiveLoadLevel,
  dismissedRecently: boolean,
): string | null {
  if (dismissedRecently) return null;
  if (level !== "heavy" && level !== "overloaded") return null;
  return COGNITIVE_LOAD_COMPANION_OFFER;
}
