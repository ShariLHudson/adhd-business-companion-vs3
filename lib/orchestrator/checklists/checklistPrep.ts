import type { ExecutiveChecklist, ExecutiveInitiative } from "../types";

export function prepareChecklist(initiative: ExecutiveInitiative): ExecutiveChecklist {
  if (initiative.checklist) return initiative.checklist;

  const items = [
    { id: "cl-1", label: "Confirm goal and expected outcome", completed: true, requiresApproval: false },
    { id: "cl-2", label: "Review recommendation and options", completed: initiative.completedSteps.includes("decision"), requiresApproval: false },
    { id: "cl-3", label: "Implementation drafts prepared", completed: initiative.completedSteps.includes("prepare"), requiresApproval: false },
    { id: "cl-4", label: "Founder approval obtained", completed: false, requiresApproval: true },
    { id: "cl-5", label: "Monitoring plan active", completed: initiative.completedSteps.includes("monitor"), requiresApproval: false },
    { id: "cl-6", label: "Review scheduled", completed: false, requiresApproval: false },
  ];

  return {
    id: `checklist-${initiative.id}`,
    initiativeId: initiative.id,
    title: `${initiative.title} — Executive Checklist`,
    items,
  };
}
