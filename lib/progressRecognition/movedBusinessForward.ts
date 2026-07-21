/**
 * 101 — “How this moved the business forward” from real relationships only.
 */

import { listWorkRelationships } from "@/lib/universalWorkEngine";

export type MovedBusinessForwardExplanation = {
  completed: string;
  supports: string | null;
  advances: string | null;
  created: string | null;
  next: string | null;
  unclear: boolean;
  unclearMessage: string | null;
  connectOffer: string | null;
};

export function explainHowMovedBusinessForward(input: {
  completedLabel: string;
  workId?: string | null;
  nextHint?: string | null;
  createdLabel?: string | null;
}): MovedBusinessForwardExplanation {
  const unclearMessage =
    "This progress is saved, but it is not yet connected to a business goal.";
  const connectOffer = "Connect it now";

  if (!input.workId?.trim()) {
    return {
      completed: input.completedLabel,
      supports: null,
      advances: null,
      created: input.createdLabel ?? null,
      next: input.nextHint ?? null,
      unclear: true,
      unclearMessage,
      connectOffer,
    };
  }

  const rels = listWorkRelationships(input.workId);
  const project = rels.find((r) => r.toRef.kind === "project");
  const goal = rels.find((r) => r.toRef.kind === "goal");

  if (!project && !goal) {
    return {
      completed: input.completedLabel,
      supports: null,
      advances: null,
      created: input.createdLabel ?? null,
      next: input.nextHint ?? null,
      unclear: true,
      unclearMessage,
      connectOffer,
    };
  }

  return {
    completed: input.completedLabel,
    supports: project
      ? project.note?.trim() || `Project ${project.toRef.id}`
      : null,
    advances: goal ? goal.note?.trim() || `Goal ${goal.toRef.id}` : null,
    created: input.createdLabel ?? null,
    next: input.nextHint ?? null,
    unclear: false,
    unclearMessage: null,
    connectOffer: null,
  };
}

export function formatMovedBusinessForward(
  explanation: MovedBusinessForwardExplanation,
): string {
  if (explanation.unclear) {
    return [
      "How this moved your business forward",
      "",
      `Completed: ${explanation.completed}`,
      explanation.unclearMessage,
      explanation.connectOffer,
    ]
      .filter(Boolean)
      .join("\n");
  }
  return [
    "How this moved your business forward",
    "",
    `Completed: ${explanation.completed}`,
    explanation.supports ? `Supports: ${explanation.supports}` : null,
    explanation.advances ? `Advances: ${explanation.advances}` : null,
    explanation.created ? `Created: ${explanation.created}` : null,
    explanation.next ? `Next: ${explanation.next}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
