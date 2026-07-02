/**
 * Gate split workspace open — chat-first facilitation.
 */

import type {
  CreateOpenContext,
  CreateOpenDecision,
  CreateOpenRequest,
} from "@/lib/createOpenAuthority";
import { UI_INITIATED_SOURCES, toPendingCreatePayload } from "@/lib/createOpenAuthority";
import { matchCatalogFromText } from "@/lib/createCatalog";
import {
  hasStructuredBuildIntent,
  shouldStayInChatForCreation,
} from "./intent";
import {
  buildWorkspaceOpenConsentOffer,
  facilitationStayInChatMessage,
  userGrantedWorkspaceOpen,
} from "./workspaceConsent";

const CHAT_ROUTED_SOURCES = new Set<CreateOpenRequest["source"]>([
  "chat",
  "governor",
  "handoff",
  "artifact",
  "ensure_live_create",
  "workspace_transition",
  "strategy",
]);

/** Sources that may open workspace immediately (empty blueprint). */
function mayOpenWorkspaceImmediately(req: CreateOpenRequest): boolean {
  if (req.workspaceConsentGranted) return true;
  if (req.skipConsentCheck || req.consentGranted) return true;
  if (UI_INITIATED_SOURCES.has(req.source) && req.userInitiated) return true;
  if (req.source === "resume" || req.source === "saved_work") return true;
  return false;
}

/**
 * Returns a create-open decision when facilitated flow applies;
 * null → fall through to standard evaluateCreateOpen.
 */
export function evaluateFacilitatedCreateOpen(
  req: CreateOpenRequest,
  ctx: CreateOpenContext,
): CreateOpenDecision | null {
  if (req.section !== "content-generator") return null;
  if (ctx.createPanelOpen) return null;

  const userText = req.userText ?? ctx.userText;
  const lastAssistant = req.lastAssistantText ?? ctx.lastAssistantText;

  if (mayOpenWorkspaceImmediately(req)) return null;
  if (!CHAT_ROUTED_SOURCES.has(req.source) && !req.userInitiated) return null;

  if (userGrantedWorkspaceOpen(userText, lastAssistant)) return null;

  const itemType =
    req.input.itemType ||
    req.artifact?.itemType ||
    matchCatalogFromText(userText)?.type ||
    "";

  if (shouldStayInChatForCreation(userText)) {
    return {
      action: "blocked",
      message: facilitationStayInChatMessage(userText),
    };
  }

  if (hasStructuredBuildIntent(userText)) {
    return {
      action: "offer",
      message: buildWorkspaceOpenConsentOffer(itemType || null),
      pending: toPendingCreatePayload(req),
    };
  }

  return null;
}
