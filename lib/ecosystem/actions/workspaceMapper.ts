// Founder Ecosystem — Phase 11 Workspace Mapping Engine.
//
// Maps recommendation / action text → workspace section + smart prefill.
// Reuses create catalog + scaffold conventions from the companion app.

import type { AppSection } from "@/lib/companionUi";
import { matchCatalogFromText } from "@/lib/createCatalog";
import { blankScaffoldForType } from "@/lib/createInitialization";
import type { GoogleFileKind } from "@/lib/googleWorkspace";
import type { WorkspaceKind } from "../events";
import type { ID } from "../models";
import type {
  ActionPrefill,
  FounderActionType,
  WorkspaceTarget,
} from "./actionTypes";

export type MapWorkspaceInput = {
  text: string;
  reason?: string;
  projectId?: ID;
  projectTitle?: string;
  taskId?: ID;
  taskTitle?: string;
  documentId?: ID;
  documentTitle?: string;
  goalId?: ID;
  durationMinutes?: number;
};

export type MappedWorkspace = {
  actionType: FounderActionType;
  workspace: WorkspaceTarget;
  prefill: ActionPrefill;
  title: string;
  description: string;
  nextStep?: string;
  emoji?: string;
};

const FOCUS_RE =
  /\b(?:focus (?:time|session)|deep work|pomodoro|concentrat|get in the zone)\b/i;
const SCHEDULE_RE =
  /\b(?:schedule|time block|block time|calendar|book time|set aside)\b/i;
const PROJECT_RE =
  /\b(?:project|workshop|launch plan|roadmap)\b/i;
const TEMPLATE_RE = /\b(?:template|swipe file|framework)\b/i;
const SNIPPET_RE = /\b(?:snippet|reusable|copy block)\b/i;
const RESEARCH_RE = /\b(?:research|look up|investigate|learn about)\b/i;
const DECISION_RE = /\b(?:decide|decision|choose between|pick between)\b/i;
const OPPORTUNITY_RE = /\b(?:opportunity|lead|prospect|deal)\b/i;
const TASK_RE = /\b(?:task|to-?do|next step|action item)\b/i;
const REVIEW_GOAL_RE = /\b(?:goal|objective|north star|quarterly)\b/i;
const REVIEW_PROJECT_RE = /\b(?:review (?:the )?project|check (?:on )?project|project status)\b/i;

function ecosystemKindForSection(section: AppSection): WorkspaceKind {
  switch (section) {
    case "content-generator":
      return "create";
    case "projects":
      return "projects";
    case "time-block":
      return "time-block";
    case "templates-library":
      return "templates";
    case "brain-dump":
      return "clear-my-mind";
    case "playbook":
      return "strategies";
    case "focus-audio":
      return "focus-audio";
    case "breathe":
      return "breathe";
    case "client-avatars":
      return "create";
    case "snippets":
      return "create";
    default:
      return "create";
  }
}

function googleKindFromText(text: string): GoogleFileKind | undefined {
  const t = text.toLowerCase();
  if (/\b(?:google )?forms?\b|\bquestionnaire\b|\bsurvey\b/.test(t)) return "form";
  if (/\b(?:google )?sheets?\b|\bspreadsheet\b|\btracker\b/.test(t)) return "sheet";
  if (/\b(?:google )?docs?\b/.test(t)) return "doc";
  return undefined;
}

function inferCreateItemType(text: string): string | undefined {
  const catalog = matchCatalogFromText(text);
  if (catalog?.type) return catalog.type;
  if (/\bsop\b|standard operating procedure/.test(text.toLowerCase())) return "SOP";
  if (/\bproposal\b/.test(text.toLowerCase())) return "Proposal";
  if (/\bmarketing plan\b/.test(text.toLowerCase())) return "Marketing Plan";
  if (/\bsales page\b|landing page/.test(text.toLowerCase())) return "Sales Page";
  if (/\bfunnel\b/.test(text.toLowerCase())) return "Funnel";
  if (/\bquestionnaire\b|\bform\b/.test(text.toLowerCase())) return "questionnaire";
  return undefined;
}

function basePrefill(input: MapWorkspaceInput): ActionPrefill {
  return {
    projectId: input.projectId,
    projectTitle: input.projectTitle,
    taskId: input.taskId,
    taskTitle: input.taskTitle,
    documentId: input.documentId,
    documentTitle: input.documentTitle,
    goalId: input.goalId,
    durationMinutes: input.durationMinutes,
  };
}

function createTarget(
  section: AppSection,
  itemType?: string,
  title?: string,
  googleExportKind?: GoogleFileKind,
  bootstrapProjects?: boolean,
): WorkspaceTarget {
  return {
    section,
    ecosystemKind: ecosystemKindForSection(section),
    itemType,
    title: title ?? (itemType ? `New ${itemType}` : undefined),
    draftScaffold: itemType ? blankScaffoldForType(itemType) : undefined,
    bootstrapProjects,
    googleExportKind,
  };
}

/** Determine workspace + action type from recommendation text. */
export function mapTextToWorkspace(input: MapWorkspaceInput): MappedWorkspace {
  const text = input.text.trim();
  const t = text.toLowerCase();
  const prefill = basePrefill(input);
  const reason = input.reason?.trim();

  // Catalog-routed assets (Client Avatar, Workshop → Projects, etc.)
  const catalog = matchCatalogFromText(text);
  if (catalog?.route === "client-avatars") {
    return {
      actionType: "open-create",
      workspace: createTarget("client-avatars", "Client Avatar", "New Client Avatar"),
      prefill: { ...prefill, itemType: "Client Avatar" },
      title: text,
      description: reason ?? "Build your ideal client profile beside chat.",
      nextStep: "Fill in demographics, pain points, and goals.",
      emoji: "👤",
    };
  }
  if (catalog?.route === "projects" || (PROJECT_RE.test(t) && /\bworkshop\b/.test(t))) {
    return {
      actionType: "open-project",
      workspace: createTarget("projects", undefined, input.projectTitle, undefined, true),
      prefill,
      title: text,
      description: reason ?? "Open the project workspace beside chat.",
      nextStep: input.projectTitle
        ? `Continue **${input.projectTitle}** in Projects.`
        : "Pick or create the project this work belongs to.",
      emoji: "📁",
    };
  }

  if (FOCUS_RE.test(t)) {
    const mins = input.durationMinutes ?? (/\b25\b/.test(t) ? 25 : 45);
    return {
      actionType: "start-focus-session",
      workspace: {
        section: "focus-audio",
        ecosystemKind: "focus-audio",
        focusAudioCategory: /\benergiz|motivat|pep\b/i.test(t)
          ? "motivation-boost"
          : "deep-work",
      },
      prefill: { ...prefill, durationMinutes: mins },
      title: text,
      description: reason ?? "Start a focus session with audio support.",
      nextStep: `Block ${mins} minutes${input.projectTitle ? ` for **${input.projectTitle}**` : ""}.`,
      emoji: "🎧",
    };
  }

  if (SCHEDULE_RE.test(t)) {
    const mins = input.durationMinutes ?? 60;
    return {
      actionType: "open-time-block",
      workspace: createTarget("time-block"),
      prefill: { ...prefill, durationMinutes: mins },
      title: text,
      description: reason ?? "Schedule protected time on your calendar.",
      nextStep: input.taskTitle
        ? `Block time for: **${input.taskTitle}**`
        : "Pick a slot and what you'll work on.",
      emoji: "📅",
    };
  }

  const itemType = catalog?.type ?? inferCreateItemType(text);
  const googleKind = googleKindFromText(text);

  if (itemType) {
    const actionType: FounderActionType =
      googleKind === "form"
        ? "open-google-form"
        : googleKind === "sheet"
          ? "open-google-sheet"
          : googleKind === "doc"
            ? "open-google-doc"
            : "open-create";
    return {
      actionType,
      workspace: createTarget("content-generator", itemType, `New ${itemType}`, googleKind),
      prefill: {
        ...prefill,
        itemType,
        draftScaffold: blankScaffoldForType(itemType),
      },
      title: text,
      description: reason ?? `Draft your ${itemType} in Create beside chat.`,
      nextStep: googleKind
        ? `Build the draft, then export to **Google ${googleKind === "form" ? "Forms" : googleKind === "sheet" ? "Sheets" : "Docs"}**.`
        : "Tell me what to fill in — the draft updates beside us.",
      emoji: catalog?.type ? "✨" : "📝",
    };
  }

  if (TEMPLATE_RE.test(t)) {
    return {
      actionType: "open-template",
      workspace: createTarget("templates-library"),
      prefill,
      title: text,
      description: reason ?? "Browse templates beside chat.",
      emoji: "📚",
    };
  }

  if (SNIPPET_RE.test(t)) {
    return {
      actionType: "open-snippet",
      workspace: createTarget("snippets"),
      prefill,
      title: text,
      description: reason ?? "Open your snippet library.",
      emoji: "📝",
    };
  }

  if (RESEARCH_RE.test(t)) {
    return {
      actionType: "research-topic",
      workspace: createTarget("home"),
      prefill,
      title: text,
      description: reason ?? "Research stays in chat — I'll summarize findings.",
      nextStep: "Tell me what to look up.",
      emoji: "🔍",
    };
  }

  if (DECISION_RE.test(t)) {
    return {
      actionType: "create-decision",
      workspace: createTarget("projects"),
      prefill,
      title: text,
      description: reason ?? "Capture the decision beside your project work.",
      emoji: "⚖️",
    };
  }

  if (OPPORTUNITY_RE.test(t)) {
    return {
      actionType: "create-opportunity",
      workspace: createTarget("projects"),
      prefill,
      title: text,
      description: reason ?? "Log the opportunity in your project context.",
      emoji: "💡",
    };
  }

  if (TASK_RE.test(t)) {
    return {
      actionType: "create-task",
      workspace: createTarget("projects"),
      prefill,
      title: text,
      description: reason ?? "Add a task to the right project.",
      emoji: "✅",
    };
  }

  if (REVIEW_GOAL_RE.test(t)) {
    return {
      actionType: "review-goal",
      workspace: createTarget("business-profile"),
      prefill,
      title: text,
      description: reason ?? "Review goals in your business profile.",
      emoji: "🎯",
    };
  }

  if (REVIEW_PROJECT_RE.test(t) || (PROJECT_RE.test(t) && /\breview\b/.test(t))) {
    return {
      actionType: "open-project",
      workspace: createTarget("projects", undefined, input.projectTitle, undefined, false),
      prefill,
      title: text,
      description: reason ?? "Review project progress beside chat.",
      emoji: "📁",
    };
  }

  if (PROJECT_RE.test(t)) {
    return {
      actionType: "open-project",
      workspace: createTarget("projects", undefined, input.projectTitle, undefined, false),
      prefill,
      title: text,
      description: reason ?? "Open Projects beside chat.",
      nextStep: input.projectTitle
        ? `Work on **${input.projectTitle}**.`
        : "Pick the project this belongs to.",
      emoji: "📁",
    };
  }

  // Default: review recommendation in chat, offer Create if content-ish
  if (/\b(?:write|draft|document|content|copy|page|plan)\b/i.test(text)) {
    return {
      actionType: "open-create",
      workspace: createTarget("content-generator", "Document", "Untitled draft"),
      prefill: { ...prefill, itemType: "Document" },
      title: text,
      description: reason ?? "Start drafting in Create beside chat.",
      emoji: "✨",
    };
  }

  return {
    actionType: "review-recommendation",
    workspace: createTarget("home"),
    prefill,
    title: text,
    description: reason ?? "Let's talk through the next step together.",
    emoji: "💬",
  };
}

export function workspaceLabel(target: WorkspaceTarget): string {
  switch (target.section) {
    case "content-generator":
      return "Create";
    case "client-avatars":
      return "Client Avatar";
    case "projects":
      return "Projects";
    case "time-block":
      return "Time Block";
    case "templates-library":
      return "Templates";
    case "snippets":
      return "Snippets";
    case "focus-audio":
      return "Focus Audio";
    case "business-profile":
      return "Business Profile";
    case "google-workspace":
      return "Google Workspace";
    default:
      return "Workspace";
  }
}
