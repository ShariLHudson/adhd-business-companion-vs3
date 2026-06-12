// Founder Ecosystem — Phase 8 Briefing Engine.
// Turns the operating state into a human-readable briefing: morning, midday,
// end-of-day, or weekly. No new data — pure presentation of the OS state. Pure.

import type {
  Briefing,
  BriefingKind,
  BriefingSection,
  FounderOperatingState,
} from "./fosTypes";

const momentumLine = (s: FounderOperatingState): string => {
  const m = s.momentum;
  const dir =
    m.direction === "rising"
      ? "building"
      : m.direction === "falling"
        ? "cooling off"
        : "steady";
  return `Momentum is ${dir} — ${m.wins} wins and ${m.focusSessions} focus sessions this week.`;
};

const attentionProjects = (s: FounderOperatingState) =>
  s.projectHealth
    .filter((p) => p.rating === "needs-attention" || p.rating === "at-risk" || p.rating === "stalled")
    .map((p) => ({ projectId: p.projectId, name: p.name, reason: p.reasons[0] ?? p.rating }));

const HEADLINES: Record<BriefingKind, (s: FounderOperatingState) => string> = {
  morning: (s) =>
    s.currentFocus
      ? `Start here: ${s.currentFocus.action}.`
      : "A clear morning — choose what matters most to you.",
  midday: (s) =>
    `Midday check: capacity is ${s.capacity.level}, ${momentumLine(s).toLowerCase()}`,
  "end-of-day": (s) =>
    `Today: ${s.momentum.tasksCompleted} tasks done, ${s.momentum.focusSessions} focus sessions.`,
  weekly: (s) =>
    `This week: ${s.momentum.wins} wins, momentum ${s.momentum.direction}, ${s.risks.length} open risks.`,
};

export function generateBriefing(
  state: FounderOperatingState,
  kind: BriefingKind = "morning",
  now: Date = new Date(),
): Briefing {
  const needAttention = attentionProjects(state);
  const sections: BriefingSection[] = [];

  if (state.topGoal)
    sections.push({ title: "Today's most important goal", lines: [state.topGoal] });

  if (state.currentFocus)
    sections.push({
      title: "Recommended next action",
      lines: [`${state.currentFocus.action} — on ${state.currentFocus.name}`],
    });

  if (needAttention.length)
    sections.push({
      title: "Projects needing attention",
      lines: needAttention.map((p) => `${p.name} — ${p.reason}`),
    });

  if (state.risks.length)
    sections.push({
      title: "Current risks",
      lines: state.risks.map((r) => r.label),
    });

  if (state.opportunities.length)
    sections.push({
      title: "Current opportunities",
      lines: state.opportunities.map((o) => o.text),
    });

  sections.push({ title: "Momentum", lines: [momentumLine(state)] });

  if (kind === "midday" || kind === "weekly")
    sections.push({
      title: "Capacity & attention",
      lines: [
        `Capacity: ${state.capacity.level}${state.capacity.factors.length ? ` (${state.capacity.factors.join(", ")})` : ""}`,
        `Attention load: ${state.attention.level}${state.attention.competing.length ? ` — ${state.attention.competing.join("; ")}` : ""}`,
      ],
    });

  return {
    kind,
    generatedAt: now.toISOString(),
    headline: HEADLINES[kind](state),
    topGoal: state.topGoal,
    projectsNeedingAttention: needAttention,
    risks: state.risks.map((r) => r.label),
    opportunities: state.opportunities.map((o) => o.text),
    recommendedNextAction: state.nextAction?.action ?? null,
    momentumSummary: momentumLine(state),
    sections,
  };
}

export const morningBriefing = (s: FounderOperatingState, now?: Date) =>
  generateBriefing(s, "morning", now);
export const middayReview = (s: FounderOperatingState, now?: Date) =>
  generateBriefing(s, "midday", now);
export const endOfDaySummary = (s: FounderOperatingState, now?: Date) =>
  generateBriefing(s, "end-of-day", now);
export const weeklyReview = (s: FounderOperatingState, now?: Date) =>
  generateBriefing(s, "weekly", now);
