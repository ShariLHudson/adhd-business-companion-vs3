// Verify workspace opens before the assistant claims success.

import type { AppSection } from "./companionUi";
import { workspaceTitle } from "./workspaceMode";

export type WorkspaceOpenSnapshot = {
  panel: AppSection | null;
  activeSection: AppSection;
  revealSeq: number;
};

/** True only when the expected panel is mounted in split view. */
export function isWorkspaceOpen(
  section: AppSection,
  snap: WorkspaceOpenSnapshot,
): boolean {
  return (
    snap.panel === section &&
    snap.activeSection === "home" &&
    snap.revealSeq > 0
  );
}

export function isAnyWorkspaceOpen(snap: WorkspaceOpenSnapshot): boolean {
  return Boolean(snap.panel) && snap.activeSection === "home" && snap.revealSeq > 0;
}

/** Split workspace panel is on screen beside chat (verified). */
export function isWorkspaceVisibleBesideChat(
  snap: WorkspaceOpenSnapshot,
): boolean {
  return isAnyWorkspaceOpen(snap);
}

/** Single source of truth for API co-guide visibility — use live snapshot, not stale turn state. */
export function coGuideActiveFromSnapshot(
  snap: WorkspaceOpenSnapshot,
): boolean {
  return isWorkspaceVisibleBesideChat(snap);
}

/** Panel mounted in split view — use for context lock (lenient vs isWorkspaceOpen). */
export function isWorkspaceBesideChat(snap: WorkspaceOpenSnapshot): boolean {
  return Boolean(snap.panel) && snap.activeSection === "home";
}

export function workspaceOpenSuccessAck(section: AppSection): string {
  const title = workspaceTitle(section);
  return `**${title}** is open beside us — chat stays right here.`;
}

export function workspaceOpenFailureAck(section: AppSection): string {
  const title = workspaceTitle(section);
  return (
    `I tried to open **${title}** but it didn't appear on screen. ` +
    `Tap **${title}** in the menu, or tell me to try again.`
  );
}

/** Pick success or failure copy based on verified state — never claim open when false. */
export function workspaceOpenAckVerified(
  section: AppSection,
  snap: WorkspaceOpenSnapshot,
  successMessage?: string,
): string {
  if (isWorkspaceOpen(section, snap)) {
    return successMessage ?? workspaceOpenSuccessAck(section);
  }
  return workspaceOpenFailureAck(section);
}

/** API hint — only tell the model a workspace is visible when verified. */
const GOOGLE_OPEN_CLAIM_RE =
  /\*\*Google (?:Docs?|Sheets?|Forms?)\*\* is open beside us[^\n]*/gi;

/** Drop assistant lines that claim a workspace is open when it is not verified. */
export function scrubFalseWorkspaceClaims(
  text: string,
  snap: WorkspaceOpenSnapshot,
): string {
  let result = text.trim();
  if (!result) return result;

  if (!isWorkspaceOpen("google-workspace", snap)) {
    result = result.replace(GOOGLE_OPEN_CLAIM_RE, "").trim();
  }

  const panelClaims: { section: AppSection; re: RegExp }[] = [
    {
      section: "content-generator",
      re: /\*\*Create\*\* is open beside us[^\n]*/gi,
    },
    {
      section: "client-avatars",
      re: /\*\*Client Avatar\*\* is open beside us[^\n]*/gi,
    },
  ];

  for (const { section, re } of panelClaims) {
    if (!isWorkspaceOpen(section, snap)) {
      result = result.replace(re, "").trim();
    }
  }

  return result.replace(/\n{3,}/g, "\n\n").trim() || text.trim();
}

export function workspaceVerificationHint(
  snap: WorkspaceOpenSnapshot,
): string | undefined {
  if (!snap.panel) {
    return (
      "WORKSPACE STATE: NO panel is visible beside chat. " +
      "Do NOT say Create, Projects, Time Block, Clear My Mind, or any workspace is open. " +
      "If you are opening one, say you are trying — do not claim it is already on screen."
    );
  }
  if (!isAnyWorkspaceOpen(snap)) {
    return (
      "WORKSPACE STATE: A workspace may be loading but is NOT confirmed visible. " +
      "Do NOT claim it is open beside the user yet."
    );
  }
  return (
    `WORKSPACE STATE: **${workspaceTitle(snap.panel)}** is verified open beside chat. ` +
    "You may reference what is on screen in that panel."
  );
}
