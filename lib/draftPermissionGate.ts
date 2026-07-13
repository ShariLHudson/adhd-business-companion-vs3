/**
 * Draft pages are permission-gated — brainstorming and direction-picking stay in chat.
 * Create opens only after explicit user consent (write/draft/create it) or UI navigation.
 *
 * Default: deny. Allow only when companionIntentRouting says the turn is an explicit
 * creation request, or the member accepted a Create/draft handoff / UI open.
 */

import { shouldOpenCreateWorkspace } from "./companionIntentRouting";
import {
  classifyConversationalMode,
  isContentBrainstorming,
  isDecidingConversation,
  isExplicitCreationRequest,
  isExplicitProjectRequest,
  shouldBlockArtifactPipeline,
} from "./messageClassification";
import { isExplicitWorkspaceOpenRequest } from "./conversationGating";
import { shariOfferedToApplyDraft } from "./liveCreateWorkspace";
import {
  shariOfferedCreateHandoff,
  userAcceptedCreateHandoff,
} from "./chatCreateHandoff";
import {
  shouldBlockAutoApplyFromChat,
} from "./activeWorkspaceAutoApply";
import type { AppSection } from "./companionUi";

const SHARI_DRAFT_OFFER_RE =
  /\b(?:would you like me to draft|want me to draft|shall i draft|ready for me to draft|draft this for you|turn (?:that|this) into a draft|open create (?:and|to) draft)\b/i;

const USER_DRAFT_ACCEPT_RE =
  /\b(?:yes|yeah|yep|sure|ok|okay|go ahead|please draft|now draft|draft it|write it|create it|generate it|draft one|write one|create the post|generate the post|draft the post|write the post)\b/i;

/** User picked a direction — not permission to open Create yet. */
export function isDraftDirectionSelectionOnly(text: string): boolean {
  const t = text.trim();
  if (!t || isExplicitCreationRequest(t)) return false;
  if (USER_DRAFT_ACCEPT_RE.test(t) && /\b(?:draft|write|create|generate)\b/i.test(t)) {
    return false;
  }
  return /\b(?:i like|i love|let'?s (?:go with|use|try)|that one|sounds good|good idea|behind.the.scenes|angle \d|option \d|#\d|number \d|the .{0,48} idea)\b/i.test(
    t,
  );
}

export function shariOfferedToDraft(lastAssistantText: string): boolean {
  return SHARI_DRAFT_OFFER_RE.test(lastAssistantText.trim());
}

export function userAcceptedDraftOffer(text: string): boolean {
  return USER_DRAFT_ACCEPT_RE.test(text.trim());
}

/** User explicitly granted opening a draft panel from chat. */
export function userGrantedDraftPermission(
  text: string,
  lastAssistantText = "",
): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isDecidingConversation(t)) return false;
  // Deny-by-default create gate — information / advice / questions never grant.
  if (shouldOpenCreateWorkspace(t)) return true;
  if (isExplicitCreationRequest(t)) return true;
  if (isExplicitProjectRequest(t)) return true;
  if (isExplicitWorkspaceOpenRequest(t)) return true;
  if (lastAssistantText && shariOfferedToDraft(lastAssistantText) && userAcceptedDraftOffer(t)) {
    return true;
  }
  if (lastAssistantText && shariOfferedToApplyDraft(lastAssistantText) && userAcceptedDraftOffer(t)) {
    return true;
  }
  if (lastAssistantText && shariOfferedCreateHandoff(lastAssistantText) && userAcceptedCreateHandoff(t, lastAssistantText)) {
    return true;
  }
  if (userAcceptedCreateHandoff(t, lastAssistantText)) {
    return true;
  }
  return false;
}

export type DraftPermissionOpts = {
  /** Create panel is open — conversation feeds the live draft. */
  liveCreateOpen?: boolean;
  /** Any auto-apply workspace panel is open beside chat. */
  activeWorkspaceSection?: AppSection | null;
};

/**
 * Block opening Create / setting draftContent / artifacts from chat automation.
 * UI-initiated opens pass userInitiated: true to bypass.
 *
 * Default is deny. Allow only when the message is an explicit creation request
 * (shouldOpenCreateWorkspace) or the member granted draft/Create permission
 * (handoff accept, open Create, etc.). Having another workspace open is not
 * Create consent — use shouldBlockAutoApplyFromChat for those panels.
 */
export function shouldBlockDraftPanelFromChat(
  text: string,
  lastAssistantText = "",
  opts?: DraftPermissionOpts,
): boolean {
  // Live Create: conversation may feed the open draft unless deny-listed.
  if (opts?.liveCreateOpen) {
    if (shouldBlockAutoApplyFromChat(text, lastAssistantText)) return true;
    return false;
  }

  if (shouldBlockArtifactPipeline(text)) return true;
  if (isDraftDirectionSelectionOnly(text)) return true;
  if (classifyConversationalMode(text) === "brainstorming") return true;
  if (isContentBrainstorming(text) && !isExplicitCreationRequest(text)) return true;

  // Explicit create / draft / build — allow Create to open from chat.
  if (shouldOpenCreateWorkspace(text)) return false;
  if (userGrantedDraftPermission(text, lastAssistantText)) return false;

  // Default deny. Another open workspace is not Create consent —
  // avatars/projects/playbook use shouldBlockAutoApplyFromChat instead.
  return true;
}

export function lastUserTextFromChatTurns(
  messages: { role: string; content: string }[],
): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role === "user" && m.content.trim()) return m.content.trim();
  }
  return "";
}
