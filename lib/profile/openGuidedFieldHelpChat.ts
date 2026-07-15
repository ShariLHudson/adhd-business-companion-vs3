/**
 * Bridge: Business Estate section help → isolated contextual help chat.
 * Keeps open/welcome/opener logic testable without mounting CompanionPageClient.
 */

import {
  guidedFieldHelpAssistantWelcome,
  guidedFieldHelpMemberOpener,
  type GuidedFieldHelpRequest,
} from "@/lib/profile/guidedFieldTypes";

export type GuidedFieldHelpChatBridge = {
  /**
   * Suspend the prior conversation and mint a fresh help session ID
   * before any welcome/opener messages are added.
   */
  beginFreshHelpSession: () => void;
  /** Show the Shari help chat surface (overlay / panel). */
  openChat: () => void;
  /** Ensure estate room chat visibility flag is on when applicable. */
  ensureEstateChatVisible?: () => void;
  /** Seed the fresh help thread (must not append onto prior messages). */
  appendAssistantWelcome: (text: string) => void;
  /** Send member opener through the shared handleSend pipeline. */
  sendMemberOpener: (text: string) => void;
  focusInput?: () => void;
};

/**
 * Opens a fresh contextual help conversation with field context.
 * Does not mutate profile answers or save progress.
 * Caller must implement beginFreshHelpSession so prior threads stay suspended.
 */
export function openGuidedFieldHelpChat(
  detail: GuidedFieldHelpRequest | null | undefined,
  bridge: GuidedFieldHelpChatBridge,
): boolean {
  if (!detail?.helpMode || !detail.fieldPath) return false;

  bridge.beginFreshHelpSession();
  bridge.openChat();
  bridge.ensureEstateChatVisible?.();

  const welcome = guidedFieldHelpAssistantWelcome(
    detail.helpMode,
    detail.question,
  );
  bridge.appendAssistantWelcome(welcome);

  const opener = guidedFieldHelpMemberOpener(detail.helpMode);
  bridge.sendMemberOpener(opener);
  bridge.focusInput?.();

  return true;
}
