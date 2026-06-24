/**
 * Goal → activity alignment — decision support, not task management.
 */

import type { OutcomeGoal } from "./outcomeGoals";
import { goalProgressPercent } from "./outcomeGoals";

const ACTIVITY_KEYWORDS: Record<string, RegExp> = {
  "follow-up emails": /\b(follow.?up|email|reply|reach out)\b/i,
  "discovery calls": /\b(call|discovery|conversation|chat with)\b/i,
  proposals: /\b(proposal|quote|offer|pitch)\b/i,
  networking: /\b(network|connect|intro|referral)\b/i,
  outreach: /\b(outreach|prospect|dm|message)\b/i,
  "writing drafts": /\b(write|draft|blog|article|newsletter)\b/i,
  "scheduling posts": /\b(schedule|post|publish|pin)\b/i,
  "repurposing content": /\b(repurpose|clip|carousel|snippet)\b/i,
  "engagement replies": /\b(reply|comment|engage|respond)\b/i,
  "outline modules": /\b(outline|module|lesson|curriculum)\b/i,
  "record lessons": /\b(record|video|film|teach)\b/i,
  "sales page updates": /\b(sales page|landing|copy)\b/i,
  "email announcements": /\b(announce|launch email|sequence)\b/i,
  "focused work blocks": /\b(focus|block|deep work)\b/i,
  "check-in reviews": /\b(review|check.?in|reflect)\b/i,
  "small next steps": /\b(next step|small|start|begin)\b/i,
};

function activityMatchesTitle(activity: string, title: string): boolean {
  const preset = ACTIVITY_KEYWORDS[activity.toLowerCase()];
  if (preset?.test(title)) return true;
  const words = activity.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const t = title.toLowerCase();
  return words.some((w) => t.includes(w));
}

export function planItemAlignsWithGoal(
  itemTitle: string,
  goal: OutcomeGoal,
): boolean {
  return goal.supportingActivities.some((act) =>
    activityMatchesTitle(act, itemTitle),
  );
}

export function goalsSupportedByPlanItem(
  itemTitle: string,
  goals: OutcomeGoal[],
): OutcomeGoal[] {
  return goals.filter((g) => planItemAlignsWithGoal(itemTitle, g));
}

export function alignmentSummaryForGoals(goals: OutcomeGoal[]): string | null {
  const active = goals.filter((g) => goalProgressPercent(g) < 100);
  if (active.length === 0) return null;
  if (active.length === 1) {
    return `Your active outcome: ${active[0]!.statement}`;
  }
  return `${active.length} active outcomes — choose work that moves one forward today.`;
}
