/**
 * Trust Sprint #1 — Phase C: Create open authority, consent, receipts.
 */

import {
  normalizeArtifactType,
  userExplicitlyChangesArtifactType,
} from "./artifactType";
import { matchCatalogFromText } from "./createCatalog";
import { isExplicitCreateResumeRequest } from "./createInitialization";
import {
  isExplicitCreationRequest,
  isContentBrainstorming,
  shouldBlockArtifactPipeline,
} from "./messageClassification";
import {
  isDraftDirectionSelectionOnly,
  shouldBlockDraftPanelFromChat,
  userGrantedDraftPermission,
} from "./draftPermissionGate";
import { hasCreateIntent } from "./intentStabilizer";
import type { AppSection } from "./companionUi";
import type { CreationWorkspaceInput } from "./workspaceCreation";
import type { ResolvedArtifact } from "./createInitialization";

export type CreateOpenSource =
  | "chat"
  | "governor"
  | "handoff"
  | "template"
  | "snippet"
  | "strategy"
  | "workspace_transition"
  | "artifact"
  | "ui_button"
  | "ui_nav"
  | "saved_work"
  | "companion_assist"
  | "founder"
  | "ensure_live_create"
  | "resume"
  | "hard_nav";

export type CreateReceiptKind =
  | "draft_created"
  | "draft_updated"
  | "template_applied"
  | "saved_for_later"
  | "artifact_linked"
  | "create_opened";

export type CreateOpenRequest = {
  source: CreateOpenSource;
  section: AppSection;
  input: CreationWorkspaceInput;
  artifact?: ResolvedArtifact;
  userInitiated?: boolean;
  userText?: string;
  lastAssistantText?: string;
  consentGranted?: boolean;
  skipConsentCheck?: boolean;
};

export type CreateOpenContext = {
  createPanelOpen: boolean;
  lockedType: string | null;
  currentDraftType: string | null;
  currentDraftContent: string;
  storedSessionType: string | null;
  userText: string;
  lastAssistantText: string;
};

export type PendingCreateOpenPayload = {
  source: CreateOpenSource;
  section: AppSection;
  input: CreationWorkspaceInput;
  artifact?: ResolvedArtifact;
};

export type CreateOpenDecision =
  | { action: "open"; receipt: CreateReceiptKind }
  | { action: "sync_draft"; receipt: CreateReceiptKind }
  | {
      action: "offer" | "draft_switch";
      message: string;
      pending: PendingCreateOpenPayload;
    }
  | { action: "artifact_lock" | "blocked"; message: string };

export const UI_INITIATED_SOURCES: ReadonlySet<CreateOpenSource> = new Set([
  "ui_button",
  "ui_nav",
  "hard_nav",
  "template",
  "snippet",
  "saved_work",
  "founder",
  "companion_assist",
  "strategy",
  "resume",
]);

export function createReceiptMessage(
  kind: CreateReceiptKind,
  detail?: { itemType?: string; title?: string },
): string {
  const type = detail?.itemType?.trim();
  switch (kind) {
    case "draft_created":
      return "I started a draft beside us.";
    case "draft_updated":
      return "I updated your draft.";
    case "template_applied":
      return type
        ? `I loaded that ${type} template into Create.`
        : "I loaded that template into Create.";
    case "saved_for_later":
      return "I saved this for later.";
    case "artifact_linked":
      return "I connected this to your draft.";
    case "create_opened":
      return type
        ? `Create is open with your ${type} beside us.`
        : "Create is open beside us.";
    default:
      return "Create is open beside us.";
  }
}

export function artifactLockUserMessage(
  lockedType: string,
  suggestedType?: string,
): string {
  const locked = normalizeArtifactType(lockedType);
  const suggested = suggestedType
    ? normalizeArtifactType(suggestedType)
    : null;
  if (suggested && suggested !== locked) {
    return `You already have a **${locked}** draft open. That action doesn't fit this draft type — finish or switch drafts before continuing.`;
  }
  return `You already have a **${locked}** draft open. Finish or switch drafts before continuing.`;
}

export function draftSwitchUserMessage(
  currentType: string,
  nextType?: string,
): string {
  const current = normalizeArtifactType(currentType);
  if (nextType && normalizeArtifactType(nextType) !== current) {
    return `You're already working on a **${current}**. Keep working on it or start fresh?`;
  }
  return "I found an unfinished draft. Continue it?";
}

export function buildCreateConsentOffer(
  userText: string,
  itemType?: string | null,
): string {
  const t = userText.trim();
  const catalog = itemType ?? matchCatalogFromText(t)?.type ?? null;
  if (
    isContentBrainstorming(t) ||
    /\bideas?\b/i.test(t) ||
    shouldBlockArtifactPipeline(t)
  ) {
    return "I can open Create for that.";
  }
  if (catalog && hasCreateIntent(t)) {
    return `I can help you build that **${catalog}** in Create.`;
  }
  if (/\b(?:write|draft|newsletter|post|email|document)\b/i.test(t)) {
    return "I can put that into a draft.";
  }
  return "I can help you build that in Create.";
}

export function draftPermissionBlockMessage(
  userText: string,
  lastAssistantText = "",
): string {
  if (isDraftDirectionSelectionOnly(userText)) {
    return "Got it — say when you want me to turn that into a draft.";
  }
  if (isContentBrainstorming(userText)) {
    return "I can open Create for that when you're ready.";
  }
  if (lastAssistantText && !userGrantedDraftPermission(userText, lastAssistantText)) {
    return buildCreateConsentOffer(userText);
  }
  return "I can help you build that in Create when you're ready.";
}

export function userAcceptedCreateConsent(
  text: string,
  lastAssistantText = "",
): boolean {
  return userGrantedDraftPermission(text, lastAssistantText);
}

export function createOpenBypassesConsent(
  req: CreateOpenRequest,
  ctx: CreateOpenContext,
): boolean {
  if (req.skipConsentCheck || req.consentGranted) return true;
  if (req.userInitiated) return true;
  if (UI_INITIATED_SOURCES.has(req.source)) return true;
  const text = req.userText ?? ctx.userText;
  if (isExplicitCreationRequest(text)) return true;
  if (isExplicitCreateResumeRequest(text)) return true;
  if (req.source === "handoff" && userGrantedDraftPermission(text, ctx.lastAssistantText)) {
    return true;
  }
  if (req.source === "resume") return true;
  return false;
}

export function needsDraftSwitchAck(
  currentType: string | null,
  currentDraft: string,
  nextType: string,
  userText: string,
): boolean {
  if (!currentDraft.trim()) return false;
  if (!currentType?.trim()) return false;
  if (normalizeArtifactType(currentType) === normalizeArtifactType(nextType)) {
    return false;
  }
  if (isExplicitCreateResumeRequest(userText)) return false;
  if (userExplicitlyChangesArtifactType(userText)) return false;
  return true;
}

function openReceiptForSource(source: CreateOpenSource): CreateReceiptKind {
  switch (source) {
    case "template":
      return "template_applied";
    case "snippet":
      return "artifact_linked";
    case "saved_work":
      return "saved_for_later";
    case "handoff":
    case "artifact":
      return "draft_created";
    default:
      return "create_opened";
  }
}

export function toPendingCreatePayload(
  req: CreateOpenRequest,
): PendingCreateOpenPayload {
  return {
    source: req.source,
    section: req.section,
    input: req.input,
    artifact: req.artifact,
  };
}

export function evaluateCreateOpen(
  req: CreateOpenRequest,
  ctx: CreateOpenContext,
): CreateOpenDecision {
  const userText = req.userText ?? ctx.userText;
  const lastAssistantText = req.lastAssistantText ?? ctx.lastAssistantText;
  const itemType =
    req.input.itemType ||
    req.artifact?.itemType ||
    matchCatalogFromText(userText)?.type ||
    "";

  if (
    ctx.lockedType &&
    itemType &&
    normalizeArtifactType(ctx.lockedType) !==
      normalizeArtifactType(itemType) &&
    !userExplicitlyChangesArtifactType(userText)
  ) {
    return {
      action: "artifact_lock",
      message: artifactLockUserMessage(ctx.lockedType, itemType),
    };
  }

  const bypass = createOpenBypassesConsent(req, { ...ctx, userText, lastAssistantText });

  if (
    needsDraftSwitchAck(
      ctx.currentDraftType,
      ctx.currentDraftContent,
      itemType,
      userText,
    ) &&
    !bypass
  ) {
    return {
      action: "draft_switch",
      message: draftSwitchUserMessage(ctx.currentDraftType!, itemType),
      pending: toPendingCreatePayload(req),
    };
  }

  if (!bypass && !ctx.createPanelOpen) {
    return {
      action: "offer",
      message: buildCreateConsentOffer(userText, itemType),
      pending: toPendingCreatePayload(req),
    };
  }

  if (
    !bypass &&
    shouldBlockDraftPanelFromChat(userText, lastAssistantText, {
      liveCreateOpen: ctx.createPanelOpen,
      activeWorkspaceSection: ctx.createPanelOpen
        ? "content-generator"
        : null,
    })
  ) {
    return {
      action: "blocked",
      message: draftPermissionBlockMessage(userText, lastAssistantText),
    };
  }

  if (
    ctx.createPanelOpen &&
    Boolean(req.input.draftContent?.trim() || req.artifact?.draftContent?.trim())
  ) {
    return { action: "sync_draft", receipt: "draft_updated" };
  }

  return { action: "open", receipt: openReceiptForSource(req.source) };
}

export function shouldSilentlyOpenCreate(
  userText: string,
  opts?: { explicit?: boolean; panelOpen?: boolean },
): boolean {
  if (opts?.explicit) return true;
  if (opts?.panelOpen) return false;
  if (isExplicitCreationRequest(userText)) return true;
  if (shouldBlockArtifactPipeline(userText)) return false;
  if (isContentBrainstorming(userText)) return false;
  return false;
}
