// When Shari drafts a deliverable in chat, hand off to the workspace — chat guides, workspace stores.

import {
  extractArtifactFromChat,
  looksLikeArtifactContent,
  type ChatTurn,
} from "./createInitialization";

const BUILD_INTENT_RE =
  /\b(?:write|draft|create|build|make|proposal|sop|plan|page|funnel|email|post|script|workshop|sequence|calendar|checklist|automation|offer|avatar)\b/i;

const APPLY_TO_CREATE_RE =
  /\b(?:apply|add (?:that|this|it)|update the draft|put (?:that|this|it) in(?:to)?(?: the)?(?: create)?|use (?:that|those|this)|revise|rewrite|change the draft|edit the draft|replace the draft|fill (?:in|out)|put it in create)\b/i;

const REVISE_DRAFT_RE =
  /\b(?:revise|rewrite|update|improve|expand|add .{0,40}section|fix the|tweak the|polish the)\b/i;

const AFFIRM_DRAFT_RE =
  /\b(?:yes|yeah|yep|sure|ok|okay|looks good|that works|use those|use these|go ahead|continue|sounds good)\b/i;

export function shouldHandoffChatArtifactToWorkspace(
  assistantText: string,
  userText: string,
): boolean {
  if (!looksLikeArtifactContent(assistantText)) return false;
  return BUILD_INTENT_RE.test(userText.trim());
}

/** Create is open — push assistant draft/revision into the panel. */
export function shouldSyncChatArtifactToCreate(
  assistantText: string,
  userText: string,
  createOpen: boolean,
): boolean {
  if (!createOpen) return false;
  if (!looksLikeArtifactContent(assistantText)) return false;
  const u = userText.trim();
  if (APPLY_TO_CREATE_RE.test(u)) return true;
  if (REVISE_DRAFT_RE.test(u)) return true;
  if (AFFIRM_DRAFT_RE.test(u)) return true;
  if (BUILD_INTENT_RE.test(u)) return true;
  return false;
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
