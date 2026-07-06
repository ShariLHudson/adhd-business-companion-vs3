import type { ApprovalStage, ExecutiveDecision } from "../types";

const BLOCKED = [
  "publish",
  "launch",
  "spend_money",
  "delete",
  "change_production_data",
  "modify_customer_information",
  "send_communications",
  "execute_automations",
];

export function prepareApproval(decision: ExecutiveDecision): ApprovalStage[] {
  return decision.approvalStages.length > 0
    ? decision.approvalStages
    : [
        {
          id: "ap-draft",
          label: "Draft review",
          status: "pending",
          requiresExplicitApproval: false,
          blockedActions: [],
          allowedActions: ["recommend", "compare", "prepare", "draft", "research", "simulate"],
          notes: "Preparation only.",
        },
        {
          id: "ap-founder",
          label: "Founder approval",
          status: "pending",
          requiresExplicitApproval: true,
          blockedActions: BLOCKED,
          allowedActions: ["approve", "decline", "defer"],
          notes: "Founder always makes the final business decision.",
        },
      ];
}

export function approvalBlocked(decision: ExecutiveDecision): boolean {
  const founderStage = prepareApproval(decision).find((s) => s.requiresExplicitApproval);
  return founderStage?.status !== "approved";
}

export function executiveControlSummary(): string[] {
  return [
    "Founder may: recommend, compare, prepare, organize, draft, research, simulate, prioritize.",
    "Founder may NOT: publish, launch, spend, delete, change production data, modify customer info, send communications, or execute automations without explicit approval.",
    "Automate preparation, organization, monitoring, follow-up, reminders, and reporting — never remove Founder authority.",
  ];
}
