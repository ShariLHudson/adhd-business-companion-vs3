// Founder Ecosystem — Phase 11 Action selectors + recovery commands.

import type { FounderEvent } from "../events";
import type { FounderAction, FounderActionStatus } from "./actionTypes";
import { filterPostponedActions, filterStalledActions } from "./actionHistory";

const RECOVERY_RE =
  /\b(?:what should i work on|show my next action|where is my draft|show my project|open my recommendation|what did i postpone|my next step|what'?s next)\b/i;

const OPEN_DRAFT_RE =
  /\b(?:where is (?:my )?draft|show (?:my )?draft|open (?:my )?draft|continue (?:my )?draft)\b/i;

const SHOW_PROJECT_RE =
  /\b(?:show (?:my )?project|open (?:my )?project|where is (?:my )?project)\b/i;

const SHOW_RECOMMENDATION_RE =
  /\b(?:open my recommendation|show (?:my )?recommendation|current recommendation)\b/i;

const POSTPONE_RE =
  /\b(?:what did i postpone|postponed actions?|what i postponed)\b/i;

const ACCEPT_ACTION_RE =
  /^(?:yes|yeah|yep|sure|ok|okay|open it|let'?s do it|let'?s go|do it|start it|open that|go ahead)\b/i;

const PRIORITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const ACTIVE_STATUSES: FounderActionStatus[] = [
  "offered",
  "opened",
  "started",
  "postponed",
];

export function isActionRecoveryCommand(text: string): boolean {
  return RECOVERY_RE.test(text.trim());
}

export function isActionAcceptance(text: string): boolean {
  return ACCEPT_ACTION_RE.test(text.trim());
}

export function selectActiveActions(actions: FounderAction[]): FounderAction[] {
  return actions
    .filter((a) => ACTIVE_STATUSES.includes(a.status))
    .sort(
      (a, b) =>
        (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2),
    );
}

export function selectCurrentAction(actions: FounderAction[]): FounderAction | null {
  const active = selectActiveActions(actions);
  return active[0] ?? null;
}

export function selectRecommendedActions(
  actions: FounderAction[],
  limit = 5,
): FounderAction[] {
  return selectActiveActions(actions).slice(0, limit);
}

export function findActionById(
  actions: FounderAction[],
  id: string,
): FounderAction | undefined {
  return actions.find((a) => a.id === id);
}

export type RecoveryResult =
  | { kind: "next-action"; action: FounderAction; message: string }
  | { kind: "draft-hint"; message: string }
  | { kind: "project-hint"; message: string }
  | { kind: "postponed-list"; actions: FounderAction[]; message: string }
  | { kind: "recommendation"; action: FounderAction; message: string }
  | { kind: "none"; message: string };

export function parseActionRecoveryCommand(
  text: string,
  actions: FounderAction[],
  events: FounderEvent[] = [],
): RecoveryResult {
  const t = text.trim();
  if (!t) return { kind: "none", message: "Tell me what you'd like to work on." };

  if (POSTPONE_RE.test(t)) {
    const postponed = filterPostponedActions(actions, events);
    return {
      kind: "postponed-list",
      actions: postponed,
      message:
        postponed.length > 0
          ? `You postponed ${postponed.length} action${postponed.length === 1 ? "" : "s"}: ${postponed.map((a) => a.title).join("; ")}.`
          : "Nothing postponed right now — want to pick a fresh next step?",
    };
  }

  if (OPEN_DRAFT_RE.test(t)) {
    const createAction = actions.find((a) => a.workspace.section === "content-generator");
    return {
      kind: "draft-hint",
      message: createAction
        ? `Your draft work is **${createAction.title}** — I'll open **Create** beside us.`
        : "I don't see an active draft — tell me what you'd like to build and I'll open Create.",
    };
  }

  if (SHOW_PROJECT_RE.test(t)) {
    const projectAction = actions.find((a) => a.workspace.section === "projects");
    return {
      kind: "project-hint",
      message: projectAction?.relatedProject?.title
        ? `Opening **Projects** for **${projectAction.relatedProject.title}**.`
        : "I'll open **Projects** beside us — which project should we focus on?",
    };
  }

  if (SHOW_RECOMMENDATION_RE.test(t)) {
    const current = selectCurrentAction(actions);
    if (!current) {
      return { kind: "none", message: "No active recommendation right now — what's on your mind?" };
    }
    return {
      kind: "recommendation",
      action: current,
      message: `**${current.title}** — ${current.description}`,
    };
  }

  const current = selectCurrentAction(actions);
  if (!current) {
    return {
      kind: "none",
      message:
        "I don't have a queued action yet. Tell me what you're working on and I'll line up the next step.",
    };
  }

  return {
    kind: "next-action",
    action: current,
    message: `**${current.title}** — ${current.nextStep ?? current.description}`,
  };
}

export function formatActionCard(action: FounderAction): string {
  const ws = action.workspace.section;
  const label =
    ws === "content-generator"
      ? "Create"
      : ws === "projects"
        ? "Projects"
        : ws === "time-block"
          ? "Time Block"
          : ws === "client-avatars"
            ? "Client Avatar"
            : "Workspace";
  return (
    `**${action.emoji ?? "📋"} ${action.title}**\n` +
    `${action.description}\n` +
    (action.nextStep ? `Next: ${action.nextStep}\n` : "") +
    `Opens: **${label}**`
  );
}

export function selectStalledActions(actions: FounderAction[]): FounderAction[] {
  return filterStalledActions(actions);
}
