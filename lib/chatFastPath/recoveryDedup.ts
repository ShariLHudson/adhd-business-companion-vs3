import {
  COACHING_FALLBACK_LEAD,
  GENERIC_RECOVERY_BRIDGE,
} from "@/lib/sparkConversation/coachingFallback";
import { SHARI_ERROR_RECOVERY_LINE } from "@/lib/conversation/shariCompanionEngine";
import { STUCK_TURN_RECOVERY_MESSAGE } from "@/lib/conversation/conversationTurnWatchdog";

export function isRecoveryAssistantLine(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith(COACHING_FALLBACK_LEAD) ||
    trimmed.startsWith(SHARI_ERROR_RECOVERY_LINE) ||
    trimmed.startsWith(STUCK_TURN_RECOVERY_MESSAGE) ||
    trimmed.startsWith(GENERIC_RECOVERY_BRIDGE) ||
    /\bsomething got tangled\b/i.test(trimmed) ||
    /\bsomething got stuck behind the scenes\b/i.test(trimmed)
  );
}

export function messagesAlreadyHasRecoveryReply(
  messages: ReadonlyArray<{ role: string; content: string }>,
): boolean {
  const last = messages[messages.length - 1];
  return last?.role === "assistant" && isRecoveryAssistantLine(last.content);
}

/** True when a recovery line appeared on a recent assistant turn — avoid stacking. */
export function conversationRecentlyShowedRecovery(
  messages: ReadonlyArray<{ role: string; content: string }>,
): boolean {
  const recentAssistants = messages
    .filter((m) => m.role === "assistant")
    .slice(-2);
  return recentAssistants.some((m) => isRecoveryAssistantLine(m.content));
}
