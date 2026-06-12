// Resume workspace — open the exact workshop/project, not just the list.

import {
  getCurrentSopStep,
  getSopProgress,
  getStepValue,
  type SopStepId,
} from "./workspaceSop";
import type { WorkspaceSession } from "./workspaceSop";
import type { WorkspaceFieldId } from "./workspaceAwareness";
import { classifyWorkspaceIntent } from "./workspaceIntent";
import { titleOptions } from "./workspaceSopHelp";

export type WorkspaceResumeIntent =
  | { kind: "open-workshop" }
  | { kind: "continue" }
  | { kind: "review-title"; stepId: SopStepId; focusField: WorkspaceFieldId }
  | { kind: "review-step"; stepId: SopStepId; focusField: WorkspaceFieldId }
  | { kind: "review-field"; stepId: SopStepId; focusField: WorkspaceFieldId };

export function detectWorkspaceResumeIntent(
  text: string,
): WorkspaceResumeIntent | null {
  const classified = classifyWorkspaceIntent(text);
  if (classified.intent === "resumeRequest") {
    return { kind: "continue" };
  }
  if (classified.intent === "reviewRequest" && classified.reviewStepId) {
    const field = classified.reviewFieldId ?? "project-title";
    if (classified.reviewStepId === "workshop-title") {
      return {
        kind: "review-title",
        stepId: classified.reviewStepId,
        focusField: field,
      };
    }
    if (classified.reviewStepId === "workshop-outcome") {
      return {
        kind: "review-step",
        stepId: classified.reviewStepId,
        focusField: field,
      };
    }
    return {
      kind: "review-field",
      stepId: classified.reviewStepId,
      focusField: field,
    };
  }
  return null;
}

export function canResumeSession(session: WorkspaceSession | null): boolean {
  if (!session) return false;
  if (session.projectId && session.savedStatus === "saved") return true;
  if (session.workflowId === "workshop" || session.workflowId === "project") {
    return Boolean(
      session.projectTitle ||
        session.acceptedValues["workshop-title"] ||
        session.acceptedValues["project-name"],
    );
  }
  return false;
}

export function applyResumeIntent(
  session: WorkspaceSession,
  intent: WorkspaceResumeIntent,
): WorkspaceSession {
  if (
    intent.kind === "review-title" ||
    intent.kind === "review-step" ||
    intent.kind === "review-field"
  ) {
    return {
      ...session,
      currentStepId: intent.stepId,
      currentStepHint: `Shari is helping you review the ${getCurrentSopStep({ ...session, currentStepId: intent.stepId }).label.toLowerCase()}.`,
    };
  }
  return session;
}

function completedStepLabels(session: WorkspaceSession): string[] {
  return getSopProgress(session)
    .filter((p) => p.status === "done")
    .map((p) => p.label);
}

export function buildResumeOpenMessage(session: WorkspaceSession): string {
  const step = getCurrentSopStep(session);
  const title = session.projectTitle || "your workshop";
  const done = completedStepLabels(session);
  const progressLine =
    done.length > 0
      ? `You completed **${done.join("** and **")}**. Next is **${step.label}**.`
      : `We're on **${step.label}**.`;

  const location =
    session.savedStatus === "saved" && session.projectId
      ? `Opening **${title}** from your Projects list beside us now.`
      : `**${title}** is in the create flow beside us (not saved yet).`;

  return `[[focus:${step.fieldId}]]We were working on **${title}**. ${progressLine} ${location}`;
}

export function buildResumeReviewMessage(
  session: WorkspaceSession,
  intent: WorkspaceResumeIntent,
): string {
  const title = session.projectTitle || "your workshop";
  const step = getCurrentSopStep(session);

  if (intent.kind === "review-title") {
    const val =
      getStepValue(session, "workshop-title") ?? session.projectTitle ?? "";
    const options = titleOptions(session)
      .filter((o) => o.toLowerCase() !== val.toLowerCase())
      .slice(0, 3);
    const optionsBlock =
      options.length > 0
        ? `\n\nHere are ways we could make it stronger:\n${options.map((o, i) => `${i + 1}. ${o}`).join("\n")}\n\nSay **number 2**, pick one, or edit the title field beside us.`
        : " Edit it anytime in the title field beside us.";
    return `[[focus:project-title]]Your current title${val ? ` is **${val}**` : " is still blank"} for **${title}**.${optionsBlock}`;
  }

  if (intent.kind === "review-step") {
    const val = getStepValue(session, "workshop-outcome");
    return `[[focus:project-goal]]${val ? `Your outcome for **${title}**: **${val}**` : `Let's define the outcome for **${title}**.`} It's in the panel beside us — edit anytime or tell me how you'd like to refine it.`;
  }

  if (intent.kind !== "review-field") {
    return `[[focus:${step.fieldId}]]We were working on **${title}**. Pick it back up in the panel beside us.`;
  }

  const val = getStepValue(session, intent.stepId);
  if (intent.stepId === "workshop-audience" && val) {
    return `[[focus:${intent.focusField}]]Your audience for **${title}**: **${val}**. A few ways to sharpen it:\n1. ADHD entrepreneurs running solo businesses\n2. Business owners with ADHD who feel stuck in planning\n3. Coaches who support neurodivergent founders\n\nEdit the field beside us or tell me which direction feels closest.`;
  }
  return `[[focus:${intent.focusField}]]${val ? `Here's your **${step.label.toLowerCase()}**: **${val}**` : `Let's work on **${step.label.toLowerCase()}** for **${title}**.`} You can edit it in the field beside us.`;
}
