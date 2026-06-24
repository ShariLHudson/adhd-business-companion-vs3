/**
 * Continuity Phase 1 — short recovery receipts after hide/save/close.
 */

import type { AppSection } from "./companionUi";
import {
  buildContinuityManifest,
  type ContinuityItemType,
} from "./continuityManifest";

export type PanelCloseContext = {
  panel: AppSection | null;
  savedForLater?: boolean;
  savedToSavedWork?: boolean;
  avatarSaved?: boolean;
};

/** One friendly sentence — no modals. */
export function recoveryMessageAfterPanelHide(
  ctx: PanelCloseContext,
): string | null {
  if (ctx.savedForLater) {
    return (
      "Saved for later — your draft is in **Create** and **Resume Where You Left Off**."
    );
  }
  if (ctx.savedToSavedWork) {
    return "Your draft is saved in **Saved Work**.";
  }
  if (ctx.avatarSaved) {
    return "Your client avatar has been saved — open **Client Avatars** or **Resume Where You Left Off** anytime.";
  }

  const manifest = buildContinuityManifest();
  const panel = ctx.panel;

  if (panel === "content-generator") {
    const hasCreate = manifest.items.some(
      (i) => i.type === "create-draft" || i.type === "create-saved-for-later",
    );
    if (hasCreate) {
      return (
        "Your draft is still here — open **Create** or tap **Resume Where You Left Off** when you're ready."
      );
    }
  }

  if (panel === "projects" || panel === "playbook") {
    const hasSop = manifest.items.some((i) => i.type === "workspace-sop");
    const hasProject = manifest.items.some((i) => i.type === "project");
    if (hasSop) {
      return (
        "Your project workshop is saved — open **Projects** or **Resume Where You Left Off** to continue."
      );
    }
    if (hasProject) {
      return "Your project is in **Projects** — pick it up anytime from the menu.";
    }
  }

  if (panel === "client-avatars") {
    const hasAvatar = manifest.items.some((i) => i.type === "client-avatar");
    if (hasAvatar) {
      return (
        "Your client avatar is saved — open **Client Avatars** or **Resume Where You Left Off**."
      );
    }
  }

  if (manifest.latest) {
    return "Your work is available through **Resume Where You Left Off**.";
  }

  return null;
}

export function recoveryMessageForContinuityType(
  type: ContinuityItemType,
): string {
  switch (type) {
    case "create-draft":
    case "create-saved-for-later":
      return "Your draft is still here — open **Create** or **Resume Where You Left Off**.";
    case "workspace-sop":
      return "Your project workshop is available from **Projects**.";
    case "project":
      return "Your project is saved in **Projects**.";
    case "client-avatar":
      return "Your client avatar has been saved.";
    case "saved-work":
      return "Your draft is saved in **Saved Work**.";
    case "decision-compass":
      return "Your Decision Compass session is saved — open **Guided Exercises** or **Resume Where You Left Off**.";
    case "strategy-apply":
      return "Your Strategy Apply session is saved — open **Playbook** or **Resume Where You Left Off**.";
    default:
      return "Your work is available through **Resume Where You Left Off**.";
  }
}

/** One-line welcome-back receipt when restoring a session — no modals. */
export function resumeReceiptForContinuityType(
  type: ContinuityItemType,
  title?: string,
): string {
  switch (type) {
    case "decision-compass":
      return "Welcome back. We reopened your **Decision Compass**.";
    case "strategy-apply":
      return title
        ? `Welcome back. We restored your **Strategy Apply** session for **${title}**.`
        : "Welcome back. We restored your **Strategy Apply** session.";
    case "project":
      return title
        ? `You're back in **${title}** where you left off.`
        : "You're back in your project where you left off.";
    case "workspace-sop":
      return title
        ? `You're back in **${title}** where you left off.`
        : "You're back in your project workshop where you left off.";
    case "create-draft":
    case "create-saved-for-later":
      return "Welcome back. Your draft is beside you.";
    case "client-avatar":
      return "Welcome back. We reopened your **Client Avatar**.";
    case "saved-work":
      return "Welcome back. We reopened your work from **Saved Work**.";
    case "visual-focus-map":
      return title
        ? `Welcome back. We reopened your **${title}** visual map.`
        : "Welcome back. We reopened your visual map in **Visual Focus™**.";
    default:
      return "Welcome back. Picking up where you left off.";
  }
}

export const DISCARD_WORKSPACE_CONFIRM =
  "Discard this in-progress workspace? Saved projects and Saved Work stay on this device — only this session's unsaved panel progress is removed.";
