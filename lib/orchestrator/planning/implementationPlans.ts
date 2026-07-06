import type { ExecutiveInitiative, ExecutivePlan, ExecutiveTask, ImplementationPlans } from "../types";
import { sampleImplementationPlans } from "../sample";

export function prepareImplementationPlans(initiative: ExecutiveInitiative): ImplementationPlans {
  const base = sampleImplementationPlans({});

  switch (initiative.category) {
    case "mission":
    case "product":
      return sampleImplementationPlans({
        developmentPlan: ["Cursor implementation draft", "QA checklist", "Spec regression list"],
        researchPlan: ["Review Institutional Memory", "Check Intelligence Graph connections"],
        measurementPlan: ["Mission progress", "Customer feedback watch"],
        reviewPlan: ["Executive review after milestone"],
      });
    case "workshop":
    case "course":
      return sampleImplementationPlans({
        researchPlan: ["Member quote collection"],
        contentPlan: ["Workshop outline", "Slide draft"],
        marketingPlan: ["Nurture sequence draft"],
        trainingPlan: ["Facilitation notes for Shari"],
        teamPlan: ["Ops calendar hold"],
        measurementPlan: ["Attendance", "Post-workshop sentiment"],
      });
    case "marketing":
    case "launch":
      return sampleImplementationPlans({
        contentPlan: ["PostCraft drafts"],
        marketingPlan: ["Campaign calendar draft", "Pin/asset batch"],
        launchPlan: ["Hold publish until approval"],
        automationPlan: ["GHL workflow draft — triggers off"],
        measurementPlan: ["Traffic", "Conversion", "Retention"],
      });
    case "automation":
      return sampleImplementationPlans({
        automationPlan: ["GHL draft", "Approval gates per step"],
        measurementPlan: ["Pilot cohort metrics"],
        teamPlan: ["Ops review draft"],
      });
    case "executive":
      return sampleImplementationPlans({
        contentPlan: ["Executive Brief sections"],
        measurementPlan: ["Time-to-first-decision", "Brief review rate"],
        reviewPlan: ["Weekly executive review"],
      });
    default:
      return base;
  }
}

export function buildExecutivePlan(initiative: ExecutiveInitiative): ExecutivePlan {
  if (initiative.plan) return initiative.plan;

  const plans = prepareImplementationPlans(initiative);
  const phaseId = `ph-${initiative.id}-1`;
  const tasks: ExecutiveTask[] = [
    {
      id: `task-${initiative.id}-prep`,
      title: "Prepare implementation drafts",
      summary: "All artifacts remain draft until Founder approval.",
      phaseId,
      status: "draft",
      estimatedHours: 4,
      assigneeKind: "founder_product",
      delegationMode: "prepare",
      requiresFounderApproval: false,
      checklistItemIds: [],
    },
    {
      id: `task-${initiative.id}-approve`,
      title: "Founder approval gate",
      summary: "Explicit approval before any execution.",
      phaseId,
      status: "awaiting_approval",
      estimatedHours: 1,
      assigneeKind: "founder",
      delegationMode: "manual",
      requiresFounderApproval: true,
      checklistItemIds: [],
    },
  ];

  return {
    initiativeId: initiative.id,
    phases: [{ id: phaseId, name: "Prepare", summary: initiative.goal, order: 1, taskIds: tasks.map((t) => t.id), milestoneIds: [] }],
    milestones: [],
    tasks,
    dependencies: [],
    plans,
    status: "draft",
  };
}
