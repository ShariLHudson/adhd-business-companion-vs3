/**
 * Completion Workflow™ — every creation ends the same way (Spec 110 + user polish).
 */

import type { CompletionWorkflowId } from "./types";

export type CompletionActionId =
  | "print"
  | "pdf"
  | "google-docs"
  | "microsoft-word"
  | "email"
  | "save-portfolio"
  | "save-template"
  | "share"
  | "export";

export type CompletionWorkflowStep = {
  id: "present" | "revise" | "offer_actions";
  memberFacing: string;
};

export type CompletionWorkflowDefinition = {
  id: CompletionWorkflowId;
  steps: readonly CompletionWorkflowStep[];
  actions: readonly { id: CompletionActionId; label: string }[];
};

export const STANDARD_CREATION_COMPLETION: CompletionWorkflowDefinition = {
  id: "standard_creation",
  steps: [
    {
      id: "present",
      memberFacing:
        "Here is what we built together. Take your time — tell me what you would like to adjust.",
    },
    {
      id: "revise",
      memberFacing:
        "Would you like any changes before we call this finished?",
    },
    {
      id: "offer_actions",
      memberFacing: "When this feels right, we can save, share, or export it.",
    },
  ],
  actions: [
    { id: "print", label: "Print" },
    { id: "pdf", label: "PDF" },
    { id: "google-docs", label: "Google Docs" },
    { id: "microsoft-word", label: "Microsoft Word" },
    { id: "email", label: "Email" },
    { id: "save-portfolio", label: "Save to Portfolio" },
    { id: "save-template", label: "Save as Template" },
    { id: "share", label: "Share" },
    { id: "export", label: "Export" },
  ],
};

const WORKFLOWS: Record<CompletionWorkflowId, CompletionWorkflowDefinition | null> =
  {
    standard_creation: STANDARD_CREATION_COMPLETION,
    research_summary: {
      id: "research_summary",
      steps: STANDARD_CREATION_COMPLETION.steps,
      actions: [
        { id: "save-portfolio", label: "Save to Knowledge Library" },
        { id: "pdf", label: "PDF summary" },
        { id: "export", label: "Export notes" },
      ],
    },
    focus_session: null,
    journal_entry: {
      id: "journal_entry",
      steps: [
        {
          id: "present",
          memberFacing: "Your reflection is saved. Would you like to keep writing?",
        },
        { id: "revise", memberFacing: "Anything you want to add or soften?" },
        {
          id: "offer_actions",
          memberFacing: "We can print, save to your portfolio, or start a project from this.",
        },
      ],
      actions: [
        { id: "print", label: "Print" },
        { id: "save-portfolio", label: "Save to Portfolio" },
        { id: "export", label: "Export" },
      ],
    },
    none: null,
  };

export function completionWorkflowFor(
  workflowId: CompletionWorkflowId,
): CompletionWorkflowDefinition | null {
  return WORKFLOWS[workflowId] ?? null;
}

export function formatCompletionOfferLine(
  workflowId: CompletionWorkflowId,
): string | null {
  const workflow = completionWorkflowFor(workflowId);
  if (!workflow?.actions.length) return null;
  const labels = workflow.actions.slice(0, 6).map((a) => a.label);
  return `When you're ready: ${labels.join(" · ")} — or we can keep refining.`;
}
