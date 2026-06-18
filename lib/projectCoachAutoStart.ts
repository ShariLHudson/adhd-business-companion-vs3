/**
 * Auto-start coaching when Work With Shari opens beside an active project.
 * Order of opening (project first vs chat first) must not matter.
 */

import {
  groundedCoachReason,
  isProjectFieldVisible,
} from "./projectGrounding";
import type { WorkspaceContext, WorkspaceFieldId } from "./workspaceAwareness";
import { suggestNextWorkspaceField } from "./workspaceAwareness";

export type ProjectCoachAutoStart = {
  content: string;
  focusField: WorkspaceFieldId | null;
};

function isUntitledName(name: string | null | undefined): boolean {
  const n = name?.trim() ?? "";
  return !n || /^untitled/i.test(n);
}

/** Next-step coaching from visible project state — not a generic greeting. */
export function buildProjectCoachAutoStart(
  ctx: WorkspaceContext | null,
): ProjectCoachAutoStart | null {
  if (!ctx || ctx.section !== "projects") return null;

  if (ctx.view === "list" || !ctx.view) {
    return {
      content: "What project are we working on today?",
      focusField: null,
    };
  }

  if (ctx.view === "create") {
    const hasTitle = Boolean(ctx.selectedItemName?.trim());
    const onOutcome = Boolean(ctx.stage?.includes("outcome"));
    if (!hasTitle) {
      return {
        content:
          "[[focus:project-title]]I see this project doesn't have a title yet. What are you trying to build?",
        focusField: "project-title",
      };
    }
    if (onOutcome) {
      return {
        content:
          "[[focus:project-goal]]I see the title is set. Let's talk about what success looks like for this project — why does it matter right now?",
        focusField: "project-goal",
      };
    }
    return {
      content:
        "[[focus:project-title]]Let's name this project first — what should we call it?",
      focusField: "project-title",
    };
  }

  if (ctx.view === "detail") {
    const name = ctx.selectedItemName?.trim() ?? "";

    if (isUntitledName(name)) {
      return {
        content:
          "[[focus:project-title]]I see this project doesn't have a title yet. Want help creating one?",
        focusField: "project-title",
      };
    }

    if (
      isProjectFieldVisible("outcome", ctx) &&
      !ctx.selectedItemGoal?.trim()
    ) {
      return {
        content: `[[focus:project-goal]]I see the title is finished. Let's talk about what success looks like for this project.`,
        focusField: "project-goal",
      };
    }

    const taskCount = ctx.projectTaskCount ?? 0;
    if (taskCount === 0 && ctx.selectedItemGoal?.trim()) {
      return {
        content: `[[focus:project-next-action]]Let's figure out what needs to happen first — what's one task or small next move for **${name}**?`,
        focusField: "project-next-action",
      };
    }

    const next = suggestNextWorkspaceField(ctx, "");
    if (next) {
      return {
        content: `[[focus:${next.field}]]I'm with you on **${name}**. Next up: **${next.label}**. ${next.reason}`,
        focusField: next.field,
      };
    }

    const sectionHint = ctx.openDetailSections?.length
      ? ` You're viewing: ${ctx.openDetailSections.join(", ")}.`
      : "";
    return {
      content: `I'm with you on **${name}**.${sectionHint} What part should we work on next?`,
      focusField: null,
    };
  }

  return null;
}

export function projectCoachAutoStartHint(ctx: WorkspaceContext | null): string {
  if (!ctx || ctx.section !== "projects") return "";
  const lines = [
    "PROJECT COACH AUTO-START (mandatory when Projects is open beside chat):",
    "- The user already has a project workspace visible. Do NOT use a generic greeting.",
    "- Do NOT ask them to repeat information already on screen (name, outcome, status, next step).",
    "- Resume from the next logical empty or incomplete field — not from the beginning.",
    `- Active project: ${ctx.selectedItemName?.trim() || "(none selected)"}`,
    `- View: ${ctx.view ?? "unknown"}${ctx.stage ? ` — ${ctx.stage}` : ""}`,
  ];
  if (ctx.openDetailSections?.length) {
    lines.push(`- Open sections: ${ctx.openDetailSections.join(", ")}`);
  }
  if (ctx.projectTaskCount != null) {
    lines.push(`- Tasks on project: ${ctx.projectTaskCount}`);
  }
  const next = suggestNextWorkspaceField(ctx, "");
  if (next) {
    lines.push(
      `- Coach toward next: ${next.label} (${groundedCoachReason(
        next.field === "project-goal"
          ? "outcome"
          : next.field === "project-title"
            ? "name"
            : "nextStep",
        ctx,
      )})`,
    );
  }
  return lines.join("\n");
}

export function projectCoachSeedKey(ctx: WorkspaceContext | null): string | null {
  if (!ctx || ctx.section !== "projects") return null;
  if (ctx.selectedItemId) return `project:${ctx.selectedItemId}`;
  return `projects:${ctx.view ?? "list"}:${ctx.stage ?? ""}`;
}
