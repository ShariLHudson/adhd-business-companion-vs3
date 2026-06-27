/**
 * Global Workspace Opening Rule — constitutional.
 * If the Companion says it opens something beside chat, the side workspace must be visible.
 */

import type { AppSection } from "./companionUi";
import {
  buildAffirmativeWorkspaceTransition,
  buildWorkspaceOpenedTransition,
} from "./humanConversation/actionTransition";
import { workspaceTitle } from "./workspaceMode";
import {
  isWorkspaceOpen,
  workspaceOpenFailureAck,
  type WorkspaceOpenSnapshot,
} from "./workspaceExecution";

export type ClearMyMindPanelView = "capture" | "my-thoughts";

export const MY_THOUGHTS_TITLE = "My Thoughts";

export const WORKSPACE_OPENING_CONSTITUTION =
  "If the Companion says it is opening a workspace beside the user, the side workspace must actually open visibly beside chat." as const;

/** Default layout when promising "beside us" — chat stays visible on desktop. */
export const DEFAULT_BESIDE_CHAT_LAYOUT = "split" as const;

export function inferClearMyMindViewFromText(text: string): ClearMyMindPanelView {
  const t = text.trim();
  if (!t) return "capture";
  if (
    /\b(?:my thoughts|see what(?:'s| is) in (?:clear my mind|my thoughts)|pick (?:a |one )?(?:task|thing)|choose one small task|from my thoughts)\b/i.test(
      t,
    )
  ) {
    return "my-thoughts";
  }
  return "capture";
}

export function displayTitleForWorkspaceOpen(
  section: AppSection,
  view?: ClearMyMindPanelView,
): string {
  if (section === "brain-dump" && view === "my-thoughts") {
    return MY_THOUGHTS_TITLE;
  }
  return workspaceTitle(section);
}

/** Copy when split workspace is verified open beside chat. */
export function workspaceOpenBesideSuccessCopy(
  section: AppSection,
  opts?: {
    view?: ClearMyMindPanelView;
    mobile?: boolean;
    isAffirmative?: boolean;
  },
): string {
  const ctx = {
    view: opts?.view,
    mobile: opts?.mobile,
    isAffirmative: opts?.isAffirmative,
  };
  if (opts?.isAffirmative) {
    return buildAffirmativeWorkspaceTransition(section, ctx);
  }
  return buildWorkspaceOpenedTransition(section, ctx);
}

/** Never claim "beside us" unless verified — constitutional language rule. */
export function workspaceOpenCopyVerified(
  section: AppSection,
  snap: WorkspaceOpenSnapshot,
  opts?: { view?: ClearMyMindPanelView; mobile?: boolean; successOverride?: string },
): string {
  if (!isWorkspaceOpen(section, snap)) {
    return workspaceOpenFailureAck(section);
  }
  return (
    opts?.successOverride ??
    workspaceOpenBesideSuccessCopy(section, {
      view: opts?.view,
      mobile: opts?.mobile,
    })
  );
}

export function shouldClaimBesideUsCopy(
  section: AppSection,
  snap: WorkspaceOpenSnapshot,
): boolean {
  return isWorkspaceOpen(section, snap);
}

export function workspaceOpeningHintForChat(
  snap: WorkspaceOpenSnapshot,
): string {
  return [
    "GLOBAL WORKSPACE OPENING RULE:",
    WORKSPACE_OPENING_CONSTITUTION,
    'Only say a workspace is ready when the split panel is verified open with chat visible (split layout).',
    "Never use mechanical system copy ('is open beside us', 'Workspace launched', 'Redirecting', 'Loading').",
    "Use Action Transition — reassure presence, then a gentle next question.",
    snap.panel && isWorkspaceOpen(snap.panel, snap)
      ? `Verified open: ${workspaceTitle(snap.panel)}.`
      : "No workspace verified beside chat this turn.",
  ].join("\n");
}

/** Chat invitation → section mapping for tests and routing. */
export function sectionForWorkspaceInvitation(text: string): AppSection | null {
  const t = text.trim();
  if (!t) return null;
  if (/\b(?:clear my mind|brain dump|my thoughts)\b/i.test(t)) return "brain-dump";
  if (/\bplan my day\b/i.test(t)) return "plan-my-day";
  if (/\b(?:create|documents?|content generator)\b/i.test(t)) return "content-generator";
  if (/\bprojects?\b/i.test(t)) return "projects";
  if (/\bsaved work\b/i.test(t)) return "saved-work";
  if (/\btemplates?\b/i.test(t)) return "templates-library";
  return null;
}

export function continuationReplyForAssistantQuestion(
  assistantQuestion: string,
): string | null {
  const t = assistantQuestion.trim();
  if (!t) return null;
  if (
    /\b(?:choose|pick|select)\s+(?:one\s+)?(?:small\s+)?task\b/i.test(t) ||
    /\bmy thoughts\b/i.test(t)
  ) {
    return "Okay. What's one thing that's been sitting in the back of your mind today?";
  }
  if (/\b(?:small|tiny|next)\s+step\b/i.test(t)) {
    return "Let's start small. What's the very first move that feels doable?";
  }
  return null;
}
