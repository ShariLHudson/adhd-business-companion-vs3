import type { ExecutiveInitiative } from "../types";

const BLOCKED = ["publish", "launch", "send_email", "spend_money", "execute_automation", "change_production"];

export function approvalStatus(initiative: ExecutiveInitiative) {
  const founder = initiative.approvals.find((a) => a.requiresExplicitApproval);
  return {
    blocked: founder?.status !== "approved",
    pendingLabel: founder?.label ?? "Founder approval",
    blockedActions: founder?.blockedActions ?? BLOCKED,
  };
}

export function executiveControlPrinciples(): string[] {
  return [
    "Founder always prepares.",
    "Founder never takes meaningful business action without explicit approval.",
    "Maximum automation of preparation, organization, monitoring, follow-up, and reporting.",
    "Maximum Founder control over decisions that matter.",
  ];
}
