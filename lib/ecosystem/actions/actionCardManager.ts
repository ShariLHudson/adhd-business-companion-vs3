// Founder Ecosystem — Phase 11 Action Card Manager.
//
// Pure, immutable state for the persistent ("sticky") action bar. It holds the
// queued FounderActions until they're completed or dismissed, prevents
// duplicate workspace opens, and enforces the confirmation guardrails:
//   • block auto-opening a workspace during a task dump,
//   • never overwrite an open draft without explicit confirmation.
// The page wires real openers (see actionExecutor); this stays testable.

import type { AppSection } from "@/lib/companionUi";
import type {
  FounderAction,
  FounderActionStatus,
} from "./actionTypes";
import { workspaceLabel } from "./workspaceMapper";
import { selectActiveActions, selectCurrentAction } from "./actionSelectors";

// ---- State --------------------------------------------------------------
export type ActionBarState = {
  /** All queued actions (any status). Sticky bar shows the active ones. */
  actions: FounderAction[];
  /** Which workspace panel is currently open (null = none). */
  openSection: AppSection | null;
  /** Identifies the draft currently loaded in the open workspace, if any. */
  openDraftKey: string | null;
  /** True while the founder is dumping tasks — suppress auto-opens. */
  taskDumpActive: boolean;
};

export function initActionBar(
  actions: FounderAction[] = [],
  opts: Partial<Pick<ActionBarState, "openSection" | "taskDumpActive">> = {},
): ActionBarState {
  return {
    actions: dedupe(actions),
    openSection: opts.openSection ?? null,
    openDraftKey: null,
    taskDumpActive: opts.taskDumpActive ?? false,
  };
}

const TERMINAL: FounderActionStatus[] = ["completed", "dismissed", "skipped"];

function dedupe(actions: FounderAction[]): FounderAction[] {
  const byId = new Map<string, FounderAction>();
  const byTitle = new Set<string>();
  for (const a of actions) {
    const key = a.title.toLowerCase().trim();
    if (byId.has(a.id) || byTitle.has(key)) continue;
    byId.set(a.id, a);
    byTitle.add(key);
  }
  return [...byId.values()];
}

/** A stable key for the draft an action would load — used to detect overwrites. */
export function actionDraftKey(a: FounderAction): string {
  const w = a.workspace;
  const parts = [
    w.section,
    a.prefill.projectId ?? a.relatedProject?.id ?? "",
    a.prefill.itemType ?? w.itemType ?? "",
    w.title ?? a.title,
  ];
  return parts.join("|").toLowerCase();
}

// ---- Queue mutations (immutable) ---------------------------------------
export function enqueueAction(
  state: ActionBarState,
  action: FounderAction,
): ActionBarState {
  const key = action.title.toLowerCase().trim();
  const exists = state.actions.some(
    (a) => a.id === action.id || a.title.toLowerCase().trim() === key,
  );
  if (exists) return state;
  return { ...state, actions: [...state.actions, action] };
}

export function enqueueActions(
  state: ActionBarState,
  actions: FounderAction[],
): ActionBarState {
  return actions.reduce(enqueueAction, state);
}

export function updateActionStatus(
  state: ActionBarState,
  id: string,
  status: FounderActionStatus,
): ActionBarState {
  return {
    ...state,
    actions: state.actions.map((a) =>
      a.id === id
        ? {
            ...a,
            status,
            completedAt: status === "completed" ? new Date().toISOString() : a.completedAt,
          }
        : a,
    ),
  };
}

export const completeAction = (s: ActionBarState, id: string) =>
  updateActionStatus(s, id, "completed");
export const dismissAction = (s: ActionBarState, id: string) =>
  updateActionStatus(s, id, "dismissed");
export const postponeAction = (s: ActionBarState, id: string) =>
  updateActionStatus(s, id, "postponed");

export function setTaskDumpActive(state: ActionBarState, active: boolean): ActionBarState {
  return { ...state, taskDumpActive: active };
}

/** Reflect that a workspace panel is now open with a given draft. */
export function setOpenWorkspace(
  state: ActionBarState,
  section: AppSection | null,
  draftKey: string | null = null,
): ActionBarState {
  return { ...state, openSection: section, openDraftKey: draftKey };
}

// ---- The sticky bar -----------------------------------------------------
/** Actions that stay visible until completed or dismissed, most urgent first. */
export function stickyBarActions(state: ActionBarState): FounderAction[] {
  return selectActiveActions(state.actions);
}

export function stickyBarCount(state: ActionBarState): number {
  return stickyBarActions(state).length;
}

export function currentAction(state: ActionBarState): FounderAction | null {
  return selectCurrentAction(state.actions);
}

export function completedActions(state: ActionBarState): FounderAction[] {
  return state.actions.filter((a) => a.status === "completed");
}

export function isActionTerminal(a: FounderAction): boolean {
  return TERMINAL.includes(a.status);
}

// ---- Workspace-open planning (dedup + confirmation guardrails) ----------
export type OpenDecision = "open" | "confirm" | "already-open" | "chat-only";

export type OpenPlan = {
  decision: OpenDecision;
  section: AppSection;
  draftKey: string;
  /** Why confirmation is needed (only when decision === "confirm"). */
  reason?: "task-dump" | "would-overwrite";
  message: string;
  /** The confirmation prompt to show the founder when decision === "confirm". */
  confirmPrompt?: string;
};

export function isWorkspaceOpen(state: ActionBarState, section: AppSection): boolean {
  return state.openSection === section;
}

/**
 * Decide how to open the workspace for an action WITHOUT opening it. The page
 * uses this to avoid duplicate opens and to ask before overwriting fields.
 */
export function planWorkspaceOpen(
  state: ActionBarState,
  action: FounderAction,
): OpenPlan {
  const section = action.workspace.section;
  const draftKey = actionDraftKey(action);
  const label = workspaceLabel(action.workspace);

  // Pure-chat actions never open a panel.
  if (section === "home") {
    return {
      decision: "chat-only",
      section,
      draftKey,
      message: `${action.title} — let's work through it here in chat.`,
    };
  }

  // Already showing exactly this draft → don't reopen.
  if (state.openSection === section && state.openDraftKey === draftKey) {
    return {
      decision: "already-open",
      section,
      draftKey,
      message: `**${label}** is already open with this — pick up where you left off.`,
    };
  }

  // Guardrail 1: during a task dump, never auto-open. Ask first.
  if (state.taskDumpActive) {
    return {
      decision: "confirm",
      section,
      draftKey,
      reason: "task-dump",
      message: `Captured. When you're ready, I can open **${label}** for "${action.title}".`,
      confirmPrompt: `Open **${label}** now for "${action.title}"?`,
    };
  }

  // Guardrail 2: a DIFFERENT draft is open in that panel → confirm before
  // replacing it, so we never overwrite the founder's fields silently.
  if (
    state.openSection === section &&
    state.openDraftKey &&
    state.openDraftKey !== draftKey
  ) {
    return {
      decision: "confirm",
      section,
      draftKey,
      reason: "would-overwrite",
      message: `**${label}** already has something open.`,
      confirmPrompt: `Replace what's open in **${label}** with "${action.title}"?`,
    };
  }

  return {
    decision: "open",
    section,
    draftKey,
    message: `Opening **${label}** beside us — ${action.nextStep ?? action.description}`,
  };
}

/** True when the action can open immediately (no confirmation needed). */
export function canOpenImmediately(state: ActionBarState, action: FounderAction): boolean {
  return planWorkspaceOpen(state, action).decision === "open";
}

/**
 * Apply an open (after a confirmation, if one was required): marks the action
 * "opened" and records the now-open workspace + draft. Returns the new state.
 */
export function applyWorkspaceOpen(
  state: ActionBarState,
  action: FounderAction,
): ActionBarState {
  if (action.workspace.section === "home") {
    return updateActionStatus(state, action.id, "started");
  }
  const opened = updateActionStatus(state, action.id, "opened");
  return setOpenWorkspace(opened, action.workspace.section, actionDraftKey(action));
}

/** Close the workspace panel (clears overwrite tracking). */
export function closeWorkspace(state: ActionBarState): ActionBarState {
  return setOpenWorkspace(state, null, null);
}
