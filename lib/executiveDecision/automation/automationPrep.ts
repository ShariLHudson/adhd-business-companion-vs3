import type { ExecutiveDecision } from "../types";

export function prepareAutomationDrafts(decision: ExecutiveDecision): string[] {
  if (decision.category !== "automation" && decision.category !== "launch" && decision.category !== "marketing") {
    return [];
  }

  return [
    "GHL workflow draft — triggers disabled",
    "Reminder draft for monitoring checkpoints",
    "Reporting template draft for Executive Brief",
    "Follow-up task draft in Team Hub — not assigned",
  ];
}

export function automationGuardrails(): string[] {
  return [
    "Automate preparation — not execution.",
    "Automate organization — not deletion.",
    "Automate monitoring — not spending.",
    "Automate reminders — not sending without approval.",
    "Automate reporting — not publishing without approval.",
  ];
}
