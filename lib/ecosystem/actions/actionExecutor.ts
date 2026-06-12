// Founder Ecosystem — Phase 11 Action Executor bridge.
//
// Maps FounderAction → companion app handlers. The page wires real openers;
// this module stays pure and testable.

import type { AppSection } from "@/lib/companionUi";
import type { FounderAction, FounderActionStatus } from "./actionTypes";
import { workspaceLabel } from "./workspaceMapper";

export type ActionExecutionHandlers = {
  openSection: (section: AppSection, opts?: ActionOpenOptions) => void;
  onStatusChange?: (actionId: string, status: FounderActionStatus) => void;
};

export type ActionOpenOptions = {
  itemType?: string;
  title?: string;
  draftScaffold?: string;
  bootstrapProjects?: boolean;
  projectId?: string;
  projectTitle?: string;
  taskTitle?: string;
  durationMinutes?: number;
  focusAudioCategory?: string;
  silent?: boolean;
};

export type ActionExecutionResult = {
  ok: boolean;
  section?: AppSection;
  message: string;
};

/** Build open options from a FounderAction prefill + workspace. */
export function actionToOpenOptions(action: FounderAction): ActionOpenOptions {
  return {
    itemType: action.prefill.itemType ?? action.workspace.itemType,
    title: action.workspace.title ?? action.relatedProject?.title,
    draftScaffold:
      action.prefill.draftScaffold ?? action.workspace.draftScaffold,
    bootstrapProjects: action.workspace.bootstrapProjects,
    projectId: action.prefill.projectId ?? action.relatedProject?.id,
    projectTitle:
      action.prefill.projectTitle ?? action.relatedProject?.title,
    taskTitle: action.prefill.taskTitle,
    durationMinutes: action.prefill.durationMinutes,
    focusAudioCategory: action.workspace.focusAudioCategory,
    silent: true,
  };
}

/** Execute an action — opens workspace via injected handlers. */
export function executeFounderAction(
  action: FounderAction,
  handlers: ActionExecutionHandlers,
): ActionExecutionResult {
  const section = action.workspace.section;
  if (section === "home") {
    return {
      ok: true,
      message: `${action.title} — let's work through it here in chat.`,
    };
  }

  handlers.openSection(section, actionToOpenOptions(action));
  handlers.onStatusChange?.(action.id, "opened");

  const label = workspaceLabel(action.workspace);
  return {
    ok: true,
    section,
    message: `Opening **${label}** beside us — ${action.nextStep ?? action.description}`,
  };
}

/** Status transitions from action bar buttons. */
export function actionStatusForButton(
  button: "open" | "done" | "later" | "dismiss",
): FounderActionStatus {
  switch (button) {
    case "open":
      return "opened";
    case "done":
      return "completed";
    case "later":
      return "postponed";
    case "dismiss":
      return "dismissed";
  }
}
