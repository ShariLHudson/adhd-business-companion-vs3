import type { ExecutiveDecision, ImplementationPlan, ImplementationTask } from "../types";

export function prepareImplementation(decision: ExecutiveDecision): ImplementationPlan {
  if (decision.implementation) return decision.implementation;

  const rec = decision.recommendation;
  const tasks: ImplementationTask[] = [
    {
      id: `impl-${decision.id}-cursor`,
      title: "Cursor implementation plan draft",
      owner: "cursor",
      status: "draft",
      module: "cursor",
      notes: "Architecture only — no production changes.",
    },
    {
      id: `impl-${decision.id}-vault`,
      title: "Decision Vault entry draft",
      owner: "founder",
      status: "draft",
      module: "founder",
      notes: "Awaiting approval.",
    },
  ];

  if (decision.category === "marketing" || decision.category === "launch") {
    tasks.push({
      id: `impl-${decision.id}-postcraft`,
      title: "PostCraft campaign drafts",
      owner: "postcraft",
      status: "draft",
      module: "postcraft",
      notes: "Nothing publishes without approval.",
    });
  }

  if (decision.category === "workshop") {
    tasks.push({
      id: `impl-${decision.id}-workshop`,
      title: "Workshop outline draft",
      owner: "founder",
      status: "draft",
      module: "founder",
      notes: "Outline only.",
    });
  }

  return {
    decisionId: decision.id,
    phases: [
      {
        id: "ph-prepare",
        name: "Prepare",
        summary: rec?.headline ?? "Prepare drafts for Founder review.",
        tasks,
      },
    ],
    cursorPlan: `Draft implementation plan for: ${decision.title}`,
    postCraftDrafts: decision.category === "marketing" ? ["Email draft 1", "Nurture draft 2"] : undefined,
    workshopOutline: decision.category === "workshop" ? `Workshop outline: ${decision.title}` : undefined,
    status: "awaiting_approval",
  };
}
