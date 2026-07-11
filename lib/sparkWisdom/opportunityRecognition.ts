/**
 * Spec 126 — Opportunity Recognition
 */

import type { WorkspaceOpportunity, WorkspaceOpportunityId } from "./types";

const OPPORTUNITY_SIGNALS: readonly {
  pattern: RegExp;
  workspace: WorkspaceOpportunityId;
  label: string;
  signal: string;
}[] = [
  {
    pattern: /\b(audience|ideal client|who i serve|target market|avatar)\b/i,
    workspace: "client_avatar",
    label: "Client Avatar",
    signal: "Audience discussion",
  },
  {
    pattern: /\b(too many thoughts|scattered|brain dump|everything in my head|can't focus)\b/i,
    workspace: "clear_my_mind",
    label: "Clear My Mind",
    signal: "Scattered thoughts",
  },
  {
    pattern: /\b(big win|huge win|milestone|signed|celebrate|accomplished)\b/i,
    workspace: "gallery",
    label: "Gallery",
    signal: "Major accomplishment",
  },
  {
    pattern: /\b(can't decide|decision paralysis|stuck between|which option)\b/i,
    workspace: "decision_compass",
    label: "Decision Compass",
    signal: "Decision paralysis",
  },
  {
    pattern: /\b(project|organize these ideas|turn this into a plan|next steps for)\b/i,
    workspace: "project_workspace",
    label: "Project Workspace",
    signal: "Ideas becoming organized",
  },
  {
    pattern: /\b(journal|reflect|process this|what i'm feeling|debrief)\b/i,
    workspace: "journal",
    label: "Journal",
    signal: "Journal-worthy reflection",
  },
];

const INVITE_PHRASE =
  "I think we're at a point where something in your Estate could help. Would you like to go there together?";

export function recognizeWorkspaceOpportunity(
  message: string,
): WorkspaceOpportunity | null {
  for (const entry of OPPORTUNITY_SIGNALS) {
    if (!entry.pattern.test(message)) continue;
    return {
      workspace: entry.workspace,
      label: entry.label,
      signal: entry.signal,
      invitePhrase: INVITE_PHRASE,
    };
  }
  return null;
}
