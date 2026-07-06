import type { AssigneeKind, DelegationMode, ExecutiveAssignment, ExecutiveAutomationCandidate, ExecutiveInitiative } from "../types";

function assignment(
  initiativeId: string,
  taskId: string,
  assigneeKind: AssigneeKind,
  assigneeLabel: string,
  mode: DelegationMode,
): ExecutiveAssignment {
  return {
    id: `asgn-${initiativeId}-${taskId}`,
    taskId,
    assigneeKind,
    assigneeLabel,
    mode,
    status: "draft",
    notes: "Proposed — not executed.",
  };
}

export function prepareAssignments(initiative: ExecutiveInitiative): ExecutiveAssignment[] {
  if (initiative.assignments.length > 0) return initiative.assignments;

  const taskPrep = `task-${initiative.id}-prep`;
  const taskApprove = `task-${initiative.id}-approve`;

  return [
    assignment(initiative.id, taskPrep, "founder_product", "Founder Studio", "prepare"),
    assignment(initiative.id, taskPrep, "cursor", "Cursor", "prepare"),
    assignment(initiative.id, taskApprove, "founder", "Shari Hudson", "manual"),
  ];
}

export function prepareAutomationCandidates(initiative: ExecutiveInitiative): ExecutiveAutomationCandidate[] {
  if (initiative.automationCandidates.length > 0) return initiative.automationCandidates;

  const candidates: ExecutiveAutomationCandidate[] = [
    {
      id: `auto-${initiative.id}-brief`,
      taskId: `task-${initiative.id}-prep`,
      label: "Daily progress summary for Executive Brief",
      mode: "semi_automate",
      canAutomate: true,
      canDelegate: true,
      mustShariDo: false,
      iznaCandidate: true,
      founderCanPrepare: true,
      sparkProduct: "founder_product",
      rationale: "Founder can prepare; Izna can review draft.",
    },
    {
      id: `auto-${initiative.id}-approve`,
      taskId: `task-${initiative.id}-approve`,
      label: "Publish / launch / send",
      mode: "manual",
      canAutomate: false,
      canDelegate: false,
      mustShariDo: true,
      iznaCandidate: false,
      founderCanPrepare: true,
      rationale: "Executive Control Principle — Shari approves meaningful actions.",
    },
  ];

  if (initiative.category === "marketing" || initiative.category === "launch") {
    candidates.push({
      id: `auto-${initiative.id}-postcraft`,
      taskId: `task-${initiative.id}-prep`,
      label: "PostCraft content batch draft",
      mode: "prepare",
      canAutomate: false,
      canDelegate: true,
      mustShariDo: false,
      iznaCandidate: true,
      founderCanPrepare: true,
      sparkProduct: "postcraft",
      rationale: "Prepare drafts — never publish without approval.",
    });
  }

  if (initiative.estimatedAutomationPotential >= 60) {
    candidates.push({
      id: `auto-${initiative.id}-future`,
      taskId: `task-${initiative.id}-prep`,
      label: "Future full automation candidate",
      mode: "future_automation",
      canAutomate: true,
      canDelegate: true,
      mustShariDo: false,
      iznaCandidate: true,
      founderCanPrepare: true,
      sparkProduct: "future_automation",
      rationale: `Automation potential ${initiative.estimatedAutomationPotential}% — prepare first.`,
    });
  }

  return candidates;
}

export function delegationSummary(candidates: ExecutiveAutomationCandidate[]) {
  return {
    manual: candidates.filter((c) => c.mode === "manual").length,
    delegate: candidates.filter((c) => c.mode === "delegate").length,
    prepare: candidates.filter((c) => c.mode === "prepare").length,
    semiAutomate: candidates.filter((c) => c.mode === "semi_automate").length,
    fullyAutomate: candidates.filter((c) => c.mode === "fully_automate").length,
    futureAutomation: candidates.filter((c) => c.mode === "future_automation").length,
    shariRequired: candidates.filter((c) => c.mustShariDo).length,
    iznaCandidates: candidates.filter((c) => c.iznaCandidate).length,
  };
}
