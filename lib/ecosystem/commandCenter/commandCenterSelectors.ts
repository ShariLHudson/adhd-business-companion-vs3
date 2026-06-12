// Founder Ecosystem — Phase 12 Command Center conversational selectors.
// All founder questions answer from the same CommandCenterState.

import type { CommandCenterState } from "./commandCenterTypes";

export function answerWhatShouldIWorkOn(state: CommandCenterState): string {
  const n = state.nextAction;
  return `**${n.title}**\n${n.reason}`;
}

export function answerWhatsMostImportant(state: CommandCenterState): string {
  if (state.today.topPriority) {
    return `**${state.today.topPriority}** is your top priority right now.`;
  }
  if (state.briefing.mostImportantGoal) {
    return `Your most important goal: **${state.briefing.mostImportantGoal}**.`;
  }
  return "Nothing urgent — pick what would move the needle most.";
}

export function answerWhatAmIForgetting(state: CommandCenterState): string {
  const lines: string[] = [];
  for (const d of state.decisions.slice(0, 2)) {
    lines.push(`Open decision: ${d.decision}`);
  }
  for (const p of state.projects.filter((p) => p.status === "stalled").slice(0, 2)) {
    lines.push(`${p.name} has gone quiet`);
  }
  for (const o of state.opportunities.filter((o) => o.impact === "high").slice(0, 1)) {
    lines.push(`Parked opportunity: ${o.text}`);
  }
  return lines.length
    ? lines.map((l) => `• ${l}`).join("\n")
    : "Nothing obvious slipping — you're tracking the essentials.";
}

export function answerWhatIsStuck(state: CommandCenterState): string {
  const stuck = state.projects.filter(
    (p) => p.status === "stalled" || p.status === "at-risk" || p.status === "blocked",
  );
  if (!stuck.length) return "Nothing flagged as stuck right now.";
  return stuck
    .map((p) => `**${p.name}** (${p.status}) — ${p.nextAction ?? "pick one tiny next step"}`)
    .join("\n");
}

export function answerWhatDeservesAttention(state: CommandCenterState): string {
  const lines: string[] = [];
  if (state.briefing.risks[0]) lines.push(`Risk: ${state.briefing.risks[0]}`);
  for (const p of state.briefing.projectsNeedingAttention.slice(0, 2)) {
    lines.push(`${p.name}: ${p.reason}`);
  }
  if (state.capacity.recommendation === "protect-focus") {
    lines.push(state.capacity.recommendationText);
  }
  return lines.length ? lines.join("\n") : state.briefing.headline;
}

export function parseCommandCenterQuestion(
  text: string,
):
  | "work-on"
  | "most-important"
  | "forgetting"
  | "stuck"
  | "attention"
  | null {
  const t = text.trim().toLowerCase();
  if (/\bwhat should i work on\b|\bwhat'?s next\b|\bnext action\b/.test(t)) {
    return "work-on";
  }
  if (/\bwhat'?s most important\b|\bmost important\b|\bwhat matters\b/.test(t)) {
    return "most-important";
  }
  if (/\bwhat am i forgetting\b|\bwhat did i forget\b|\bforgetting\b/.test(t)) {
    return "forgetting";
  }
  if (/\bwhat is stuck\b|\bwhat'?s stuck\b|\bstuck\b/.test(t)) {
    return "stuck";
  }
  if (/\bwhat deserves attention\b|\bneeds attention\b|\bwhat needs attention\b/.test(t)) {
    return "attention";
  }
  return null;
}

export function answerCommandCenterQuestion(
  text: string,
  state: CommandCenterState,
): string | null {
  const kind = parseCommandCenterQuestion(text);
  switch (kind) {
    case "work-on":
      return answerWhatShouldIWorkOn(state);
    case "most-important":
      return answerWhatsMostImportant(state);
    case "forgetting":
      return answerWhatAmIForgetting(state);
    case "stuck":
      return answerWhatIsStuck(state);
    case "attention":
      return answerWhatDeservesAttention(state);
    default:
      return null;
  }
}
