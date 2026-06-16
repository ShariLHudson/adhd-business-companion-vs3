import type { AppSection } from "./companionUi";

/** Exercises that need one-item-at-a-time capture with a visible workspace. */
export const MULTI_ITEM_WORKSPACE_SECTIONS: AppSection[] = [
  "brain-dump",
  "activities",
  "projects",
  "spin-wheel",
  "content-generator",
];

export function isMultiItemWorkspaceSection(section: AppSection): boolean {
  return MULTI_ITEM_WORKSPACE_SECTIONS.includes(section);
}

/** Permission line before opening a multi-item workspace beside chat. */
export function multiItemWorkspaceOfferLine(section: AppSection): string {
  const labels: Partial<Record<AppSection, string>> = {
    "brain-dump":
      "This works best with **Clear My Mind** beside us so we can see each thought separately — one at a time.",
    activities:
      "This exercise works best with the workspace beside us so you can see each item on its own.",
    projects:
      "Project planning works best side-by-side — one field at a time in the workspace.",
    "spin-wheel":
      "Let's sort your options visually — open the workspace beside us?",
    "content-generator":
      "Create works best with the draft beside us — one piece at a time.",
  };
  return (
    labels[section] ??
    "This works best with a workspace beside us so we can see each item separately. Open workspace?"
  );
}

export const MULTI_ITEM_WORKSPACE_ACCEPT = "Open Workspace";
export const MULTI_ITEM_WORKSPACE_DECLINE = "Not Now";
