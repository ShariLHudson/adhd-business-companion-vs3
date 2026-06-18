/**
 * Active workspace context lock — Shari must stay in the visible workspace
 * unless the user explicitly asks to switch.
 */

import type { AppSection } from "./companionUi";
import { workspaceTitle } from "./workspaceMode";
import type { WorkspaceContext } from "./workspaceAwareness";
import {
  isAnyWorkspaceOpen,
  isWorkspaceOpen,
  type WorkspaceOpenSnapshot,
} from "./workspaceExecution";
import { isExplicitWorkspaceOpenRequest } from "./conversationGating";

export const ACTIVE_WORKSPACE_FIRST_RULE = `ACTIVE WORKSPACE FIRST (mandatory when a panel is open beside chat):
Before answering, check in order:
1. What workspace is currently open on the right?
2. What item is selected there?
3. What mode or stage is active?
4. What did the user just ask?
The active workspace OVERRIDES generic chat, Create drafts, and unrelated tools.
Stay in this workspace unless the user explicitly asks to go elsewhere OR you ask permission and they agree.
When a workspace is open: auto-populate relevant information, confirm briefly, ask only for missing pieces — never ask permission to save each time.`;

export const WORKSPACE_CONTEXT_LOCK_RULE = `CONTEXT LOCK:
Do NOT route to another workspace while one is open.
Do NOT open Create, Projects, or other panels unless the user clearly asks.
Do NOT reference old drafts or sessions from a different workspace.
If the user asks about procrastination in Strategies — recommend strategies, not a document draft.
If the user asks for help in Projects — reference the current project.
If the user asks to write in Create — guide the selected item, one question at a time.`;

export const BUSINESS_FIRST_STRATEGY_RULE = `BUSINESS-FIRST STRATEGY LOGIC:
Users often start with a business problem, not an ADHD label.
1. Identify the business goal first (market, finish proposal, follow up leads, launch, too many ideas, avoid sales calls).
2. Detect the ADHD friction underneath (procrastination, overwhelm, perfectionism, shiny object, fear).
3. Recommend the right strategy or workflow IN the current workspace.
Do not force users to pick ADHD strategies manually before understanding the business goal.`;

export type WorkspaceAdvisorRole =
  | "marketing"
  | "operations"
  | "planning"
  | "mindset";

const ADVISOR_LABELS: Record<WorkspaceAdvisorRole, string> = {
  marketing:
    "Marketing Advisor — visibility, content, audience, lead generation, sales messaging",
  operations:
    "Operations Advisor — systems, SOPs, workflows, delivery, admin, delegation",
  planning:
    "Planning Advisor — goals, projects, roadmap, launch planning, priorities",
  mindset:
    "Mindset / ADHD Coach — procrastination, overwhelm, perfectionism, imposter syndrome, fear, shiny object syndrome",
};

const WORKSPACE_DEFAULT_ADVISOR: Partial<Record<AppSection, WorkspaceAdvisorRole>> =
  {
    playbook: "mindset",
    "content-generator": "marketing",
    projects: "planning",
    "client-avatars": "marketing",
    "focus-timer": "mindset",
    focus: "mindset",
    "time-block": "planning",
    "brain-dump": "mindset",
  };

const MARKETING_RE =
  /\b(market|marketing|visibility|content|audience|lead|sales page|funnel|post|email list|brand|promot)\b/i;
const OPERATIONS_RE =
  /\b(system|sop|workflow|process|deliver|admin|delegat|automat|operation)\b/i;
const PLANNING_RE =
  /\b(goal|project|roadmap|launch|priorit|plan|milestone|workshop|proposal)\b/i;
const MINDSET_RE =
  /\b(procrastinat\w*|overwhelm\w*|perfection\w*|imposter|fear|stuck|avoid\w*|shiny object|can'?t start|dragging)\b/i;

/** User explicitly wants to leave the current workspace. */
export function isExplicitWorkspaceSwitchRequest(
  userText: string,
  targetSection?: AppSection,
): boolean {
  const t = userText.trim().toLowerCase();
  if (isExplicitWorkspaceOpenRequest(userText)) return true;
  if (
    /\b(?:switch to|go to|open|take me to|move to|let'?s use)\b/.test(t) &&
    /\b(?:create|projects?|strateg|focus|clear my mind|brain dump|templates?|time block|client avatar)\b/.test(
      t,
    )
  ) {
    return true;
  }
  if (targetSection) {
    const title = workspaceTitle(targetSection).toLowerCase();
    if (t.includes(title)) return true;
  }
  return false;
}

export function isActiveWorkspaceLocked(
  activePanel: AppSection | null,
  snap: WorkspaceOpenSnapshot,
): boolean {
  return Boolean(activePanel && isAnyWorkspaceOpen(snap));
}

/** Block auto-navigation to a different workspace while one is verified open. */
export function shouldSuppressCrossWorkspaceNavigation(
  activePanel: AppSection | null,
  targetSection: AppSection,
  userText: string,
  snap: WorkspaceOpenSnapshot,
): boolean {
  if (!activePanel || !isWorkspaceOpen(activePanel, snap)) return false;
  if (activePanel === targetSection) return false;
  return !isExplicitWorkspaceSwitchRequest(userText, targetSection);
}

export function resolveWorkspaceAdvisorRole(
  userText: string,
  section?: AppSection | null,
): WorkspaceAdvisorRole {
  if (MINDSET_RE.test(userText)) return "mindset";
  if (MARKETING_RE.test(userText)) return "marketing";
  if (OPERATIONS_RE.test(userText)) return "operations";
  if (PLANNING_RE.test(userText)) return "planning";
  if (section && WORKSPACE_DEFAULT_ADVISOR[section]) {
    return WORKSPACE_DEFAULT_ADVISOR[section]!;
  }
  return "planning";
}

export function buildWorkspaceBoardAdvisorHint(
  userText: string,
  section?: AppSection | null,
): string {
  const role = resolveWorkspaceAdvisorRole(userText, section);
  const label = ADVISOR_LABELS[role];
  return `BOARD ADVISOR (invisible — one voice): Lean on ${label} for this reply. Support the business goal AND any ADHD friction underneath.`;
}

export function buildActiveWorkspacePriorityHint(
  ctx: WorkspaceContext | null,
  userText: string,
  snap: WorkspaceOpenSnapshot,
): string | undefined {
  if (!ctx?.section || !isWorkspaceOpen(ctx.section, snap)) return undefined;

  const lines = [
    ACTIVE_WORKSPACE_FIRST_RULE,
    WORKSPACE_CONTEXT_LOCK_RULE,
    BUSINESS_FIRST_STRATEGY_RULE,
    buildWorkspaceBoardAdvisorHint(userText, ctx.section),
    `LOCKED WORKSPACE: **${ctx.title}** is verified open beside chat.`,
  ];

  if (ctx.selectedItemName?.trim()) {
    lines.push(`Selected on screen: ${ctx.selectedItemName.trim()}`);
  }
  if (ctx.stage) lines.push(`Stage: ${ctx.stage}`);

  if (ctx.section === "playbook") {
    lines.push(
      "STRATEGIES MODE: Recommend from the Strategy library (ADHD apply or Business create). Do NOT open Create or start unrelated drafts.",
    );
  }
  if (ctx.section === "content-generator") {
    lines.push(
      "CREATE MODE: Guide the selected item one question at a time. Do NOT switch to an old session or unrelated draft.",
    );
  }
  if (ctx.section === "projects") {
    lines.push(
      "PROJECTS MODE: Reference the current project. Offer help with outcome, goals, tasks, or planning — not generic productivity advice.",
    );
  }
  if (ctx.section === "client-avatars") {
    lines.push(
      "CLIENT AVATAR MODE: Audience research, demographics, pain points, and ICP details auto-apply to the avatar. Do NOT ask permission. Do NOT jump to sales page drafts.",
    );
  }
  if (ctx.section === "focus-timer" || ctx.section === "focus") {
    lines.push(
      "FOCUS MODE: Help define the focus session and connect to the selected project or task.",
    );
  }

  return lines.join("\n");
}

/** Deterministic strategy replies while Strategies workspace is open. */
export function tryStrategyWorkspaceLocalReply(
  ctx: WorkspaceContext,
  userText: string,
): string | null {
  if (ctx.section !== "playbook") return null;
  const t = userText.trim();
  if (!t) return null;

  if (/\bprocrastinat/i.test(t)) {
    return (
      "Procrastination is the worst — I get it. Tell me **Start Ugly**, **Shrink the First Step**, or **Body Double** — I'll open it and walk you through it one question at a time."
    );
  }
  if (/\b(?:market|marketing|visibility|content|audience|lead)\b/i.test(t)) {
    return (
      "I see **Strategies** is open. For marketing, open **Business Strategies** and we'll build a plan one question at a time — or pick an ADHD strategy like **Shrink the World** if overwhelm is the blocker."
    );
  }
  if (/\bhelp me with this\b/i.test(t) && ctx.selectedItemName?.trim()) {
    return `I see you're working through **${ctx.selectedItemName.trim()}** in Strategies. Tell me what's happening in your real situation and we'll apply it step by step.`;
  }
  if (/\bhelp me with this\b/i.test(t)) {
    return (
      "I see **Strategies** is open. What are you trying to work through — procrastination, focus, deciding, getting started, or a business plan?"
    );
  }

  return null;
}
