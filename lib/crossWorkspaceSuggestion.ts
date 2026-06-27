import type { AppSection } from "./companionUi";
import { workspaceObjectId, workspaceTitle, WORKSPACE_TITLES } from "./workspaceMode";

/** Sections the global beside-this rule applies to. */
export const CROSS_WORKSPACE_SECTIONS: AppSection[] = [
  "brain-dump",
  "projects",
  "content-generator",
  "time-block",
  "playbook",
  "templates-library",
  "how-do-i",
  "focus-timer",
  "breathe",
  "focus-audio",
  "focus",
  "google-workspace",
  "activities",
  "saved-work",
  "email-generator",
  "snippets",
  "client-avatars",
];

export function isCrossWorkspaceSection(section: AppSection): boolean {
  return CROSS_WORKSPACE_SECTIONS.includes(section);
}

export function crossWorkspaceSectionLabel(section: AppSection): string {
  return WORKSPACE_TITLES[section] ?? workspaceTitle(section);
}

export function crossWorkspaceSectionObjectId(section: AppSection): string {
  return workspaceObjectId(section);
}

/** @deprecated Use crossWorkspaceSectionObjectId */
export function crossWorkspaceSectionEmoji(_section: AppSection): string {
  return "";
}

/** Permission prompt shown before opening a suggested section. */
export function crossWorkspaceBesideLine(
  targetSection: AppSection,
  hint?: string,
): string {
  const label = crossWorkspaceSectionLabel(targetSection);
  if (hint?.trim()) {
    return `${hint.trim()} Would you like to open ${label} beside this?`;
  }
  return `Would you like to open ${label} beside this?`;
}

export function crossWorkspaceAcceptLabel(targetSection: AppSection): string {
  return `Yes, open ${crossWorkspaceSectionLabel(targetSection)}`;
}

/** Context banner for the opened tool when launched from another guide. */
export function crossWorkspaceContextMessage(
  sourceTitle: string,
  targetSection: AppSection,
): string {
  const target = crossWorkspaceSectionLabel(targetSection);
  switch (targetSection) {
    case "brain-dump":
      if (/brain parking lot/i.test(sourceTitle)) {
        return "Park this idea in Clear My Mind (Later / Someday) — then return to your task.";
      }
      return `Capture one thought at a time in Clear My Mind — each on its own card.`;
    case "time-block":
      return `Block time for what you're working on in ${sourceTitle}.`;
    case "projects":
      return `Save or organize what came up during ${sourceTitle}.`;
    case "content-generator":
      return `Turn what you're shaping in ${sourceTitle} into something you can use.`;
    case "playbook":
      return `Pick a strategy that fits what you're doing in ${sourceTitle}.`;
    case "templates-library":
      return `Find a template that supports ${sourceTitle}.`;
    case "focus-timer":
      return `Use a timed block while you continue ${sourceTitle}.`;
    case "breathe":
      return `Take a breath, then return to ${sourceTitle} when you're ready.`;
    case "how-do-i":
      return `Look up how-to steps while keeping ${sourceTitle} visible.`;
    case "client-avatars":
      return (
        `Build your ideal client here while keeping **${sourceTitle}** in context — ` +
        `chat stays visible and I'll prefill what we already know.`
      );
    default:
      return `Use ${target} alongside ${sourceTitle} — your place here is saved.`;
  }
}

export type CrossWorkspaceBesideOffer = {
  sourceSection: AppSection;
  targetSection: AppSection;
  line: string;
  contextMessage?: string;
  sourceTitle?: string;
  /** Client Avatar handoff — return to source workflow when avatar is saved. */
  clientAvatarHandoff?: boolean;
};
