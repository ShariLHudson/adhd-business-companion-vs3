/**
 * Project coach session — guided title / outcome / goals / tasks coaching in chat.
 */

import { getProjects, saveProject, saveProjectItem } from "./companionStore";
import type { ProjectCoachTopic } from "./projectCoachHandoff";
import { projectCoachTopicLabel } from "./projectCoachHandoff";
import type { WorkspaceContext } from "./workspaceAwareness";
import type { WorkspaceFieldId } from "./workspaceAwareness";
import { isWorkspaceDiscoveryRequest } from "./messageClassification";
import { isFieldContentIntent } from "./workspaceIntent";

export type ProjectCoachSession = {
  topic: ProjectCoachTopic;
  projectId: string;
  projectName: string;
  /** awaiting user answer | offered next topic | finished this round */
  phase: "coaching" | "offer-next" | "goals-another";
  pendingGoal?: boolean;
};

export type ProjectCoachTurn = {
  reply: string;
  focusField?: WorkspaceFieldId | null;
  fill?: { field: WorkspaceFieldId; value: string };
  session: ProjectCoachSession | null;
};

function hasOutcome(ctx: WorkspaceContext | null): boolean {
  return Boolean(ctx?.selectedItemGoal?.trim());
}

function hasTitle(ctx: WorkspaceContext | null): boolean {
  const n = ctx?.selectedItemName?.trim() ?? "";
  return Boolean(n && !/^untitled/i.test(n));
}

export function startProjectCoachSession(
  topic: ProjectCoachTopic,
  ctx: WorkspaceContext,
): ProjectCoachSession {
  return {
    topic,
    projectId: ctx.selectedItemId!,
    projectName: ctx.selectedItemName?.trim() || "this project",
    phase: "coaching",
  };
}

export function resolveProjectCoachTurn(
  session: ProjectCoachSession,
  userText: string,
  ctx: WorkspaceContext | null,
  lastAssistantText = "",
): ProjectCoachTurn | null {
  const trimmed = userText.trim();
  if (!trimmed) return null;

  if (
    isWorkspaceDiscoveryRequest(trimmed, lastAssistantText) ||
    !isFieldContentIntent(trimmed, lastAssistantText)
  ) {
    return null;
  }

  const lower = trimmed.toLowerCase();

  if (session.phase === "offer-next") {
    if (/^(yes|yeah|yep|sure|outcome|next)/i.test(trimmed)) {
      return {
        reply: `[[focus:project-goal]]What does success look like for **${session.projectName}**?`,
        focusField: "project-goal",
        session: { ...session, topic: "outcome", phase: "coaching" },
      };
    }
    return {
      reply: "No problem — pick another topic anytime, or tell me what you want to work on.",
      session: null,
    };
  }

  if (session.phase === "goals-another") {
    if (/^(yes|yeah|another|one more|yep)/i.test(trimmed)) {
      return {
        reply: `[[focus:project-goals]]What's the next goal?`,
        focusField: "project-goals",
        session: { ...session, phase: "coaching" },
      };
    }
    return {
      reply: "Got it. Goals are saved — say **Tasks** when you're ready to break them into steps.",
      session: null,
    };
  }

  switch (session.topic) {
    case "title": {
      saveProject({ id: session.projectId, name: trimmed });
      return {
        reply: `[[focus:project-title]]**${trimmed}** is in the title field beside you.\n\nWould you like to work on **Outcome** next?`,
        focusField: "project-title",
        fill: { field: "project-title", value: trimmed },
        session: { ...session, projectName: trimmed, phase: "offer-next" },
      };
    }
    case "outcome": {
      saveProject({ id: session.projectId, goal: trimmed });
      return {
        reply: `[[focus:project-goal]]Outcome saved: ${trimmed.slice(0, 120)}${trimmed.length > 120 ? "…" : ""}.\n\nWant to add a **Goal** next, or jump to **Tasks**?`,
        focusField: "project-goal",
        fill: { field: "project-goal", value: trimmed },
        session: null,
      };
    }
    case "goals": {
      const projects = saveProject({
        id: session.projectId,
        goals: appendGoal(session.projectId, trimmed),
      });
      const p = projects.find((x) => x.id === session.projectId);
      return {
        reply: `Goal saved: **${trimmed}**.\n\nReady for another goal?`,
        focusField: "project-goals",
        fill: { field: "project-goals", value: trimmed },
        session: { ...session, phase: "goals-another" },
      };
    }
    case "tasks": {
      saveProjectItem({
        projectId: session.projectId,
        kind: "task",
        title: trimmed,
      });
      return {
        reply: `[[focus:project-tasks]]Task added: **${trimmed}**. Want a subtask or another task?`,
        focusField: "project-tasks",
        session: { ...session, phase: "coaching" },
      };
    }
    case "planning":
      return {
        reply: `Good — **${trimmed}** is the milestone. What's one small step toward it this week?`,
        session: null,
      };
    case "roadblocks":
      return {
        reply: `I hear the block: ${trimmed.slice(0, 100)}. What's the smallest step that doesn't require solving the whole block?`,
        session: null,
      };
    default:
      return {
        reply: `Got it. I'll stay with you on **${projectCoachTopicLabel(session.topic)}** — what should we do next?`,
        session,
      };
  }
}

function appendGoal(projectId: string, goal: string): string[] {
  const p = getProjects().find((x) => x.id === projectId);
  const existing = p?.goals ?? [];
  const trimmed = goal.trim();
  if (!trimmed || existing.includes(trimmed)) return existing;
  return [...existing, trimmed];
}

/** Trust rule hints for API — only cite fields with real data. */
export function projectCoachTrustHint(ctx: WorkspaceContext | null): string {
  if (!ctx || ctx.section !== "projects") return "";
  const lines = [
    "PROJECT TRUST RULE (mandatory):",
    "- NEVER claim outcome, goals, or tasks exist unless visible data confirms it.",
  ];
  if (hasTitle(ctx)) {
    lines.push(`- Project name on screen: ${ctx.selectedItemName!.trim()}`);
  } else {
    lines.push("- Project name: not set yet");
  }
  if (hasOutcome(ctx)) {
    lines.push(`- Outcome on screen: ${ctx.selectedItemGoal!.trim()}`);
  } else {
    lines.push("- Outcome: empty — do NOT say they have one");
  }
  const goalCount = ctx.projectGoalCount ?? 0;
  lines.push(
    goalCount > 0
      ? `- Goals on screen: ${goalCount}`
      : "- Goals: none yet — do NOT say they have goals",
  );
  const taskCount = ctx.projectTaskCount ?? 0;
  lines.push(
    taskCount > 0
      ? `- Tasks on screen: ${taskCount}`
      : "- Tasks: none yet — do NOT say they have tasks",
  );
  return lines.join("\n");
}
