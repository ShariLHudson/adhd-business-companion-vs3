/**
 * Bridge: Business Estate section help → existing companion chat.
 * Keeps open/welcome/opener logic testable without mounting CompanionPageClient.
 */

import {
  guidedFieldHelpAssistantWelcome,
  guidedFieldHelpMemberOpener,
  type GuidedFieldHelpRequest,
} from "@/lib/profile/guidedFieldTypes";

export type GuidedFieldHelpChatBridge = {
  /** Show the existing Shari chat surface (overlay / panel). */
  openChat: () => void;
  /** Ensure estate room chat visibility flag is on when applicable. */
  ensureEstateChatVisible?: () => void;
  appendAssistantWelcome: (text: string) => void;
  /** Send member opener through the shared handleSend pipeline. */
  sendMemberOpener: (text: string) => void;
  focusInput?: () => void;
};

/**
 * Opens one existing chat experience with field context.
 * Does not mutate profile answers or save progress.
 */
export function openGuidedFieldHelpChat(
  detail: GuidedFieldHelpRequest | null | undefined,
  bridge: GuidedFieldHelpChatBridge,
): boolean {
  if (!detail?.helpMode || !detail.fieldPath) return false;

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
