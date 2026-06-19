/**
 * Chat → Create / Google Doc handoff — preserve generated content and route by intent.
 */

import { shouldLockArtifactType, normalizeArtifactType } from "./artifactType";
import { looksLikeDraftFragment } from "./collaborativeDrafting";
import {
  extractArtifactFromChat,
  extractTitleFromArtifact,
  inferArtifactTypeFromConversation,
  looksLikeArtifactContent,
  looksLikeEmailDraft,
  type ChatTurn,
  type ResolvedArtifact,
} from "./createInitialization";
import { lastUserTextFromChatTurns } from "./draftPermissionGate";

const SHARI_EMAIL_TOOL_OFFER_RE =
  /\b(?:email tool|create (?:the )?draft in (?:the )?email|put (?:this|it) in (?:the )?email(?: tool)?|move (?:this|it) to (?:the )?email|draft (?:this|it) in (?:the )?email)\b/i;

const SHARI_CREATE_DRAFT_OFFER_RE =
  /\b(?:would you like me to (?:create|draft)|want me to (?:create|draft)|shall i (?:create|draft)|ready for me to (?:create|draft)|create the draft|turn (?:that|this) into a draft|open create (?:and|to) draft)\b/i;

const SHARI_GOOGLE_DOC_OFFER_RE =
  /\b(?:google doc|put (?:this|it) in a doc|export to docs?|create a document)\b/i;

const USER_EMAIL_TOOL_RE =
  /\b(?:email tool|email draft|put (?:this|it) in (?:the )?email|create (?:the )?email draft|move (?:this|it) to (?:the )?email|in the email tool)\b/i;

const USER_GOOGLE_DOC_RE =
  /\b(?:google doc|google docs|put (?:this|it) in a doc|export to docs?|create a document|in a doc)\b/i;

const USER_HANDOFF_ACCEPT_RE =
  /^(?:yes|yeah|yep|yup|ok(?:ay)?|sure|sounds good|go ahead|please do|do it|that works|looks good|correct|right|good|let'?s do it|please|create it|draft it)\.?$/i;

const OFFER_ONLY_RE =
  /\b(?:would you like|want me to|shall i|i can open create)\b/i;

export type PendingChatArtifact = {
  itemType: string;
  title: string;
  draftContent: string;
  capturedAt: number;
};

export type HandoffDestination = "email" | "google-doc" | "create";

let pendingArtifact: PendingChatArtifact | null = null;

export function peekPendingChatArtifact(): PendingChatArtifact | null {
  return pendingArtifact;
}

export function clearPendingChatArtifact(): void {
  pendingArtifact = null;
}

export function resetPendingChatArtifactForTests(): void {
  pendingArtifact = null;
}

export function looksLikeHandoffableContent(
  assistantText: string,
  userText = "",
): boolean {
  return looksLikeHandoffableAssistantContent(assistantText, userText);
}

function looksLikeHandoffableAssistantContent(
  assistantText: string,
  userText = "",
): boolean {
  const t = assistantText.trim();
  if (!t) return false;
  if (looksLikeArtifactContent(t)) return true;
  if (looksLikeDraftFragment(t, userText)) return true;
  if (looksLikeEmailDraft(t)) return true;
  return t.length >= 120 && !OFFER_ONLY_RE.test(t);
}

export function rememberChatArtifactFromAssistant(
  assistantText: string,
  userText = "",
): void {
  const trimmed = assistantText.trim();
  if (!looksLikeHandoffableAssistantContent(trimmed, userText)) return;

  const itemType = inferArtifactTypeFromConversation(userText, trimmed);
  const title = extractTitleFromArtifact(trimmed, itemType);
  pendingArtifact = {
    itemType: normalizeArtifactType(itemType),
    title,
    draftContent: trimmed,
    capturedAt: Date.now(),
  };
}

export function shariOfferedEmailToolHandoff(lastAssistantText: string): boolean {
  return SHARI_EMAIL_TOOL_OFFER_RE.test(lastAssistantText.trim());
}

export function shariOfferedCreateHandoff(lastAssistantText: string): boolean {
  const t = lastAssistantText.trim();
  return (
    SHARI_CREATE_DRAFT_OFFER_RE.test(t) ||
    SHARI_EMAIL_TOOL_OFFER_RE.test(t) ||
    SHARI_GOOGLE_DOC_OFFER_RE.test(t)
  );
}

export function isEmailToolHandoffRequest(text: string): boolean {
  return USER_EMAIL_TOOL_RE.test(text.trim());
}

export function isGoogleDocHandoffRequest(text: string): boolean {
  return USER_GOOGLE_DOC_RE.test(text.trim());
}

export function userAcceptedCreateHandoff(
  text: string,
  lastAssistantText = "",
): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isEmailToolHandoffRequest(t) || isGoogleDocHandoffRequest(t)) return true;
  if (!lastAssistantText.trim()) return false;
  if (!shariOfferedCreateHandoff(lastAssistantText)) return false;
  return USER_HANDOFF_ACCEPT_RE.test(t);
}

export function inferHandoffDestination(
  lastAssistantText: string,
  userText: string,
): HandoffDestination | null {
  const u = userText.trim();
  const a = lastAssistantText.trim();
  if (isEmailToolHandoffRequest(u) || shariOfferedEmailToolHandoff(a)) {
    return "email";
  }
  if (isGoogleDocHandoffRequest(u) || SHARI_GOOGLE_DOC_OFFER_RE.test(a)) {
    return "google-doc";
  }
  if (shariOfferedCreateHandoff(a) && USER_HANDOFF_ACCEPT_RE.test(u)) {
    return "create";
  }
  if (/\b(?:create|draft|write)\b/i.test(u) && /\bemail\b/i.test(`${u}\n${a}`)) {
    return "email";
  }
  return null;
}

function hintTypeForDestination(dest: HandoffDestination | null): string | null {
  if (dest === "email") return "Email";
  if (dest === "google-doc") return "Document";
  return null;
}

function extractLenientAssistantDraft(
  messages: ChatTurn[],
  hintType?: string | null,
): Omit<ResolvedArtifact, "source" | "artifactTypeLocked"> | null {
  const recent = messages.slice(-14);
  for (let i = recent.length - 1; i >= 0; i--) {
    const m = recent[i];
    if (m?.role !== "assistant") continue;
    const content = m.content.trim();
    if (!content) continue;

    const userText = recent
      .slice(0, i + 1)
      .filter((t) => t.role === "user")
      .map((t) => t.content)
      .join("\n");

    const emailish = looksLikeEmailDraft(content);
    const fragment = looksLikeDraftFragment(content, userText);
    const artifactish = looksLikeArtifactContent(content);
    const minOk =
      emailish ||
      artifactish ||
      fragment ||
      (hintType === "Email" && content.length >= 80 && !OFFER_ONLY_RE.test(content));

    if (!minOk) continue;

    const itemType = normalizeArtifactType(
      hintType ?? inferArtifactTypeFromConversation(userText, content),
    );
    const title =
      itemType === "Email"
        ? "Email Draft"
        : extractTitleFromArtifact(content, itemType);

    return {
      itemType,
      title,
      draftContent: content,
    };
  }
  return null;
}

export function resolveChatHandoffArtifact(
  messages: ChatTurn[],
  opts?: {
    hintType?: string | null;
    userText?: string;
    lastAssistantText?: string;
    allowPending?: boolean;
  },
): ResolvedArtifact | null {
  const userText = opts?.userText ?? lastUserTextFromChatTurns(messages);
  const lastAssistant =
    opts?.lastAssistantText ??
    [...messages].reverse().find((m) => m.role === "assistant")?.content ??
    "";
  const dest = inferHandoffDestination(lastAssistant, userText);
  const hint =
    opts?.hintType ?? hintTypeForDestination(dest) ?? undefined;

  const fromChat = extractArtifactFromChat(messages, hint ?? null);
  if (fromChat?.draftContent?.trim()) {
    const itemType = normalizeArtifactType(hint ?? fromChat.itemType);
    return {
      ...fromChat,
      itemType,
      title:
        itemType === "Email" &&
        (!fromChat.title ||
          fromChat.title === "New Email" ||
          fromChat.title === "Email")
          ? "Email Draft"
          : fromChat.title,
      source: "chat",
      artifactTypeLocked: shouldLockArtifactType(itemType),
    };
  }

  const lenient = extractLenientAssistantDraft(messages, hint ?? null);
  if (lenient?.draftContent?.trim()) {
    const itemType = normalizeArtifactType(hint ?? lenient.itemType);
    return {
      ...lenient,
      itemType,
      title:
        itemType === "Email"
          ? lenient.title === "New Email"
            ? "Email Draft"
            : lenient.title
          : lenient.title,
      source: "chat",
      artifactTypeLocked: shouldLockArtifactType(itemType),
    };
  }

  if (opts?.allowPending !== false && pendingArtifact?.draftContent?.trim()) {
    const age = Date.now() - pendingArtifact.capturedAt;
    if (age < 30 * 60 * 1000) {
      const itemType = normalizeArtifactType(hint ?? pendingArtifact.itemType);
      return {
        itemType,
        title: pendingArtifact.title,
        draftContent: pendingArtifact.draftContent,
        source: "chat",
        artifactTypeLocked: shouldLockArtifactType(itemType),
      };
    }
  }

  return null;
}

export function buildChatHandoffAck(artifact: ResolvedArtifact): string {
  if (artifact.itemType === "Email") {
    return `Your email draft is in Create beside us — edit it, save it, or export when you're ready.`;
  }
  if (artifact.itemType === "Document") {
    return `Your document is in Create beside us — use Create Google Doc, Print, or Save above the draft.`;
  }
  return `Your ${artifact.itemType} is in Create beside us — "${artifact.title}" is ready to edit.`;
}
