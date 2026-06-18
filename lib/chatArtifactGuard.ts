// When Shari drafts a deliverable in chat, hand off to the workspace — chat guides, workspace stores.
// Brainstorming stays chat-only — never hand off idea lists as artifacts.

import {
  shariOfferedToApplyDraft,
  userAffirmedApplyToDraft,
} from "./liveCreateWorkspace";
import {
  isContentBrainstorming,
  isExplicitCreationRequest,
} from "./messageClassification";
import { hasCreateIntent } from "./intentStabilizer";
import {
  shouldBlockDraftPanelFromChat,
} from "./draftPermissionGate";
import {
  isActiveWorkspaceAutoApplyMode,
  shouldBlockAutoApplyFromChat,
} from "./activeWorkspaceAutoApply";
import {
  looksLikeDraftFragment,
} from "./collaborativeDrafting";
import {
  extractArtifactFromChat,
  looksLikeArtifactContent,
  type ChatTurn,
} from "./createInitialization";

const APPLY_TO_CREATE_RE =
  /\b(?:apply|add (?:that|this|it)|update the draft|put (?:that|this|it) in(?:to)?(?: the)?(?: create)?|use (?:that|those|this)|revise|rewrite|change the draft|edit the draft|replace the draft|fill (?:in|out)|put it in create)\b/i;

const REVISE_DRAFT_RE =
  /\b(?:revise|rewrite|update|improve|expand|add .{0,40}section|fix the|tweak the|polish the)\b/i;

const AFFIRM_DRAFT_RE =
  /\b(?:yes|yeah|yep|sure|ok|okay|looks good|that works|use those|use these|go ahead|continue|sounds good)\b/i;

function userRequestedArtifactBuild(
  userText: string,
  lastAssistantText = "",
): boolean {
  const u = userText.trim();
  if (!u) return false;
  if (shouldBlockDraftPanelFromChat(u, lastAssistantText)) return false;
  if (isExplicitCreationRequest(u)) return true;
  return hasCreateIntent(u);
}

export function shouldHandoffChatArtifactToWorkspace(
  assistantText: string,
  userText: string,
  priorAssistantText = "",
): boolean {
  if (shouldBlockDraftPanelFromChat(userText, priorAssistantText)) return false;
  if (isContentBrainstorming(userText)) return false;
  if (!looksLikeArtifactContent(assistantText)) return false;
  return userRequestedArtifactBuild(userText, priorAssistantText);
}

/** Create is open — push assistant draft/revision into the panel. */
export function shouldSyncChatArtifactToCreate(
  assistantText: string,
  userText: string,
  createOpen: boolean,
  priorAssistantText = "",
): boolean {
  if (!createOpen) return false;
  const u = userText.trim();
  if (/^(?:thanks|thank you)[!.?]*$/i.test(u)) return false;
  if (looksLikeDraftFragment(assistantText, u)) return true;
  if (shouldBlockAutoApplyFromChat(u, priorAssistantText)) {
    if (
      userAffirmedApplyToDraft(u, priorAssistantText) ||
      (APPLY_TO_CREATE_RE.test(u) && shariOfferedToApplyDraft(priorAssistantText))
    ) {
      return true;
    }
    return false;
  }
  if (
    userAffirmedApplyToDraft(u, priorAssistantText) ||
    (APPLY_TO_CREATE_RE.test(u) && shariOfferedToApplyDraft(priorAssistantText))
  ) {
    return true;
  }
  if (isActiveWorkspaceAutoApplyMode("content-generator", u, priorAssistantText)) {
    if (looksLikeArtifactContent(assistantText)) return true;
    if (REVISE_DRAFT_RE.test(u) || APPLY_TO_CREATE_RE.test(u)) return true;
    return false;
  }
  if (!looksLikeArtifactContent(assistantText)) {
    if (REVISE_DRAFT_RE.test(u) || APPLY_TO_CREATE_RE.test(u)) return true;
    if (AFFIRM_DRAFT_RE.test(u) && priorAssistantText.trim()) return true;
    return false;
  }
  if (APPLY_TO_CREATE_RE.test(u)) return true;
  if (REVISE_DRAFT_RE.test(u)) return true;
  if (AFFIRM_DRAFT_RE.test(u)) return true;
  if (shouldBlockDraftPanelFromChat(userText, priorAssistantText)) return false;
  if (isContentBrainstorming(userText)) return false;
  return userRequestedArtifactBuild(u, priorAssistantText);
}

export function buildChatArtifactHandoffMessage(
  itemType: string,
  title: string,
): string {
  return (
    `Your **${itemType}** “${title}” is in **Create** beside us now — that's your workspace. ` +
    `Edit, **Save**, **Create Google Doc**, **Print**, or **Add to Project** from the header above the draft.`
  );
}

export function extractHandoffArtifact(messages: ChatTurn[]) {
  return extractArtifactFromChat(messages);
}
