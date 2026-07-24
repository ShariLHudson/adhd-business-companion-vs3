/**
 * Companion / global Shari final-delivery adapter.
 *
 * Does not invent a second conversation engine. Wraps the shared
 * Certified Conversation Pipeline (CIE → HCV + TCAI + CQRI) for
 * chat-owned Companion drafts.
 *
 * Create, navigation, and out-of-scope owners must not call this.
 */

import { classifyTurnRecovery, shouldRepairOrResumeTask } from "@/lib/shariAnswerFirst/turnRecovery";
import { certifyConversationDelivery } from "./certifyConversationDelivery";
import {
  getGeneralChatCertifiedRuntime,
  saveGeneralChatCertifiedRuntime,
} from "./generalChatCertifiedState";
import type {
  CertifiedConversationMessage,
  CertifyConversationDeliveryResult,
} from "./types";

export type CompanionDeliveryKind =
  | "conversation"
  | "navigation"
  | "system"
  | "create_owned";

export type CertifyCompanionDeliveryInput = {
  conversationId: string;
  userText: string;
  draftText: string;
  messages: readonly CertifiedConversationMessage[];
  /** Authoritative response owner for this turn (never an advisory label). */
  owner: string;
  /** Advisory systems that contributed tone/offer copy — not the final speaker. */
  advisoryContributions?: readonly string[];
  repairActive?: boolean;
  wasClarification?: boolean;
};

export type CertifyCompanionDeliveryResult = CertifyConversationDeliveryResult & {
  finalResponseOwner: string;
  advisoryContributions: string[];
  certified: true;
};

const CREATE_OWNED_OWNER_RE =
  /^(?:create_|frictionless:universal_creation|continuity:universal_creation|intent_workflow:)/i;

const NAV_OR_SYSTEM_OWNER_RE =
  /^(?:my_day_opener|pending_choice|universal:|explicit_companion_action|hard_nav)/i;

/**
 * Whether this owner/kind should run the Companion certification spine.
 * Pure navigation, system copy, and Create-owned drafts stay untouched.
 */
export function shouldCertifyCompanionDelivery(input: {
  owner: string;
  deliveryKind?: CompanionDeliveryKind;
  bypassVoiceLayer?: boolean;
}): boolean {
  if (input.bypassVoiceLayer) return false;
  const kind = input.deliveryKind ?? "conversation";
  if (kind === "navigation" || kind === "system" || kind === "create_owned") {
    return false;
  }
  const owner = input.owner.trim();
  if (!owner) return true;
  if (CREATE_OWNED_OWNER_RE.test(owner)) return false;
  if (NAV_OR_SYSTEM_OWNER_RE.test(owner)) return false;
  // Legacy advisory:* labels must not skip certification — caller should
  // reassign final owner to the turn authority owner when posting.
  return true;
}

export function inferCompanionDeliveryKind(input: {
  owner: string;
  hasImmediateNavigation?: boolean;
  createOwned?: boolean;
}): CompanionDeliveryKind {
  if (input.createOwned || CREATE_OWNED_OWNER_RE.test(input.owner)) {
    return "create_owned";
  }
  if (input.hasImmediateNavigation || NAV_OR_SYSTEM_OWNER_RE.test(input.owner)) {
    return "navigation";
  }
  return "conversation";
}

/**
 * Certify a Companion-owned draft through the shared spine.
 * Preserves owner substance; returns exactly one final text.
 */
export function certifyCompanionDelivery(
  input: CertifyCompanionDeliveryInput,
): CertifyCompanionDeliveryResult {
  const recovery = classifyTurnRecovery(input.userText);
  const repairActive =
    Boolean(input.repairActive) || shouldRepairOrResumeTask(recovery);
  const prior = getGeneralChatCertifiedRuntime(input.conversationId);

  const certified = certifyConversationDelivery({
    experienceId: "general-chat",
    behaviorMode: "companion",
    conversationId: input.conversationId || "general-chat",
    userText: input.userText,
    draftText: input.draftText,
    messages: input.messages,
    priorTopicAnchor: prior?.topicAnchor ?? null,
    priorCieState: prior?.cieState ?? null,
    repairActive,
    wasClarification: Boolean(input.wasClarification) || recovery === "correction",
  });

  saveGeneralChatCertifiedRuntime({
    conversationId: input.conversationId || "general-chat",
    topicAnchor: certified.topicAnchor,
    cieState: certified.cieState,
  });

  const advisoryContributions = [...(input.advisoryContributions ?? [])];

  return {
    ...certified,
    finalResponseOwner: input.owner,
    advisoryContributions,
    certified: true,
  };
}
