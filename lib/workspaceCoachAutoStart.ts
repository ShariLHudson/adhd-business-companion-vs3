/**
 * Workspace coach auto-start — whatever panel is open beside chat becomes
 * Shari's context. Order of opening (workspace first vs chat first) must not matter.
 */

import type { CreationWorkspaceContext } from "./workspaceCreation";
import {
  buildProjectCoachAutoStart,
  projectCoachAutoStartHint,
} from "./projectCoachAutoStart";
import {
  buildProjectCoachHandoff,
  type ProjectCoachHandoff,
} from "./projectCoachHandoff";
import { workspaceTitle } from "./workspaceMode";
import type { AppSection } from "./companionUi";
import type { WorkspaceContext, WorkspaceFieldId } from "./workspaceAwareness";
import { suggestNextWorkspaceField } from "./workspaceAwareness";

export type WorkspaceCoachExtras = {
  creationContext?: CreationWorkspaceContext | null;
  /** Active Help Me Right Now activity title, if any. */
  activityTitle?: string | null;
  activityStep?: string | null;
  focusActive?: boolean;
  focusTitle?: string | null;
  focusMinutesLeft?: number | null;
};

export type WorkspaceCoachAutoStart = {
  content: string;
  focusField: WorkspaceFieldId | null;
  /** Show project topic picker (Title / Outcome / Goals / …) after handoff message. */
  showTopicPicker?: boolean;
};

function buildCreateCoachAutoStart(
  ctx: WorkspaceContext,
  extras?: WorkspaceCoachExtras,
): WorkspaceCoachAutoStart | null {
  const cc = extras?.creationContext;
  const type = cc?.itemType?.trim() || ctx.selectedItemName?.split(" — ")[0]?.trim();
  const topic = cc?.title?.trim() || cc?.brief?.trim();
  const hasDraft = Boolean(
    cc?.draftContent?.trim() || ctx.draftPreview?.trim(),
  );

  if (hasDraft) {
    const label = type || "draft";
    const title = cc?.title?.trim();
    return {
      content: title
        ? `I can see your **${label}** draft — **${title}** — beside us. What should we refine or add?`
        : `I can see your **${label}** draft beside us. What should we refine or add?`,
      focusField: null,
    };
  }

  if (ctx.stage?.includes("Generating")) {
    return {
      content: `Create is building your **${type || "piece"}** — I'll stay here while it generates. Anything you want to steer before it lands?`,
      focusField: null,
    };
  }

  if (!type) {
    return {
      content:
        "[[focus:create-topic]]I see Create is open beside us. What are you making — pick a type in the panel or tell me in one line.",
      focusField: "create-topic",
    };
  }

  if (!topic && !cc?.brief?.trim()) {
    return {
      content: `[[focus:create-topic]]I see you're working on a **${type}**. What's it about — one line in the topic field?`,
      focusField: "create-topic",
    };
  }

  return {
    content: `[[focus:create-brief]]Good — **${type}** is underway${topic ? ` (${topic})` : ""}. What's the brief or angle you want in the draft?`,
    focusField: "create-brief",
  };
}

function buildBrainDumpCoachAutoStart(ctx: WorkspaceContext): WorkspaceCoachAutoStart {
  if (ctx.stage?.includes("library")) {
    return {
      content:
        "Clear My Mind is open on your saved items. Want to sort one, or capture something new?",
      focusField: null,
    };
  }
  return {
    content:
      "Clear My Mind is beside us — **what is the first thing on your mind?** We'll capture one card at a time.",
    focusField: null,
  };
}

function buildPlaybookCoachAutoStart(): WorkspaceCoachAutoStart {
  return {
    content:
      "I see **Strategies** beside us. Which playbook are you in, or what decision are you working through?",
    focusField: null,
  };
}

function buildTemplatesCoachAutoStart(): WorkspaceCoachAutoStart {
  return {
    content:
      "Templates is open — browsing for a pattern, or ready to open one in Create?",
    focusField: null,
  };
}

function buildFocusTimerCoachAutoStart(
  extras?: WorkspaceCoachExtras,
): WorkspaceCoachAutoStart {
  if (extras?.focusActive) {
    const title = extras.focusTitle?.trim() || "your focus item";
    const mins =
      extras.focusMinutesLeft != null
        ? ` — about **${extras.focusMinutesLeft}** min left`
        : "";
    return {
      content: `Focus session is running on **${title}**${mins}. I'm here if you get stuck or want to adjust.`,
      focusField: null,
    };
  }
  return {
    content:
      "Focus Session is open — what are you working on, and how long do you want this block?",
    focusField: null,
  };
}

function buildActivitiesCoachAutoStart(
  extras?: WorkspaceCoachExtras,
): WorkspaceCoachAutoStart {
  const title = extras?.activityTitle?.trim();
  if (title) {
    return {
      content: `We're in **${title}** beside chat — I'll walk you one step at a time. ${extras?.activityStep ? `You're on: ${extras.activityStep}.` : "What's on screen right now?"}`,
      focusField: null,
    };
  }
  return {
    content:
      "Help Me Right Now is open — pick an exercise and I'll stay beside you, one step at a time.",
    focusField: null,
  };
}

function buildClientAvatarsCoachAutoStart(): WorkspaceCoachAutoStart {
  return {
    content:
      "Client Avatar is open — who are we defining today? Start with who they are in one sentence.",
    focusField: null,
  };
}

function buildTimeBlockCoachAutoStart(): WorkspaceCoachAutoStart {
  return {
    content:
      "Time Bank is beside us — placing a block on the calendar or pulling from the bank?",
    focusField: null,
  };
}

function buildGenericWorkspaceCoachAutoStart(
  section: AppSection,
  ctx: WorkspaceContext,
): WorkspaceCoachAutoStart {
  const title = workspaceTitle(section);
  const next = suggestNextWorkspaceField(ctx, "");
  if (next) {
    return {
      content: `[[focus:${next.field}]]I'm beside your **${title}** workspace. Next up: **${next.label}**. ${next.reason}`,
      focusField: next.field,
    };
  }
  const stage = ctx.stage ? ` (${ctx.stage})` : "";
  return {
    content: `I'm beside **${title}**${stage}. Tell me what you see on screen and we'll take the next small step.`,
    focusField: null,
  };
}

/** Context-aware opening line — never a generic greeting when a workspace is visible. */
export function buildWorkspaceCoachAutoStart(
  ctx: WorkspaceContext | null,
  extras?: WorkspaceCoachExtras,
): WorkspaceCoachAutoStart | null {
  if (!ctx?.section) return null;

  switch (ctx.section) {
    case "projects":
      return buildProjectCoachHandoff(ctx);
    case "content-generator":
      return buildCreateCoachAutoStart(ctx, extras);
    case "brain-dump":
      return buildBrainDumpCoachAutoStart(ctx);
    case "playbook":
      return buildPlaybookCoachAutoStart();
    case "templates-library":
      return buildTemplatesCoachAutoStart();
    case "focus-timer":
      return buildFocusTimerCoachAutoStart(extras);
    case "activities":
      return buildActivitiesCoachAutoStart(extras);
    case "client-avatars":
      return buildClientAvatarsCoachAutoStart();
    case "time-block":
      return buildTimeBlockCoachAutoStart();
    default:
      return buildGenericWorkspaceCoachAutoStart(ctx.section, ctx);
  }
}

export function workspaceCoachSeedKey(
  ctx: WorkspaceContext | null,
  extras?: WorkspaceCoachExtras,
): string | null {
  if (!ctx?.section) return null;
  const base = ctx.selectedItemId
    ? `${ctx.section}:${ctx.selectedItemId}`
    : `${ctx.section}:${ctx.view ?? "default"}:${ctx.stage ?? ""}`;
  if (ctx.section === "content-generator") {
    const type = extras?.creationContext?.itemType ?? "";
    const draft = ctx.draftPreview ? "draft" : "nodraft";
    return `${base}:${type}:${draft}`;
  }
  if (ctx.section === "focus-timer") {
    return `${base}:${extras?.focusActive ? "active" : "idle"}:${extras?.focusTitle ?? ""}`;
  }
  if (ctx.section === "activities") {
    return `${base}:${extras?.activityTitle ?? ""}:${extras?.activityStep ?? ""}`;
  }
  if (ctx.section === "projects" && ctx.selectedItemId) {
    return `project:${ctx.selectedItemId}:${ctx.stage ?? ""}`;
  }
  return base;
}

export function workspaceCoachAutoStartHint(
  ctx: WorkspaceContext | null,
  extras?: WorkspaceCoachExtras,
): string {
  if (!ctx?.section) return "";

  const lines = [
    "WORKSPACE CONTEXT AWARENESS (mandatory — open panel beside chat):",
    "- The visible workspace IS your context. Do NOT greet generically.",
    "- Do NOT ask the user to repeat information already on screen.",
    "- Resume from the next logical step in THIS workspace — not from the beginning.",
    `- Active surface: ${workspaceTitle(ctx.section)}`,
  ];

  if (ctx.view) lines.push(`- View: ${ctx.view}`);
  if (ctx.stage) lines.push(`- Stage: ${ctx.stage}`);
  if (ctx.selectedItemName?.trim()) {
    lines.push(`- On screen: ${ctx.selectedItemName.trim()}`);
  }
  if (ctx.openDetailSections?.length) {
    lines.push(`- Open sections: ${ctx.openDetailSections.join(", ")}`);
  }

  if (ctx.section === "projects") {
    lines.push(projectCoachAutoStartHint(ctx));
  }

  if (ctx.section === "content-generator" && extras?.creationContext) {
    const cc = extras.creationContext;
    if (cc.itemType) lines.push(`- Create type: ${cc.itemType}`);
    if (cc.title?.trim()) lines.push(`- Create title: ${cc.title.trim()}`);
    if (cc.draftContent?.trim()) lines.push("- Draft: visible in panel");
  }

  if (ctx.section === "focus-timer" && extras?.focusActive) {
    lines.push(
      `- Focus session active: ${extras.focusTitle ?? "item"}${extras.focusMinutesLeft != null ? ` (${extras.focusMinutesLeft} min left)` : ""}`,
    );
  }

  if (ctx.section === "activities" && extras?.activityTitle) {
    lines.push(`- Activity: ${extras.activityTitle}`);
    if (extras.activityStep) lines.push(`- Activity step: ${extras.activityStep}`);
  }

  const next = suggestNextWorkspaceField(ctx, "");
  if (next) {
    lines.push(`- Coach toward: ${next.label} — ${next.reason}`);
  }

  return lines.join("\n");
}

export const WORKSPACE_CONTEXT_RULE = `WORKSPACE CONTEXT RULE
Whatever workspace is open beside chat becomes Shari's context automatically — Projects, Create, Strategies, Templates, Focus Session, Clear My Mind, Client Avatars, and every other panel.
Opening order does not matter: workspace first or chat first, load the visible workspace into context.
Never greet generically. Never ask unrelated questions. Resume from the next logical step on screen.`;
