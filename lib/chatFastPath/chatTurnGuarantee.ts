/**
 * Chat turn guarantee — every member message gets a reply; loading never sticks.
 */

import {
  buildContextualChatFallback,
  type RuntimeRecoveryInput,
} from "@/lib/sparkConversation/coachingFallback";
import { shouldRouteThroughEstateKernel } from "@/lib/estate/estateKernelGate";
import { isKnowledgeQuestion } from "@/lib/knowledgeIntelligence";
import { isHowToLearningQuestion } from "@/lib/howToLearningIntelligence";
import {
  formatEstateGuideReply,
  isEstateGuideQuestion,
  resolveEstateGuideTurn,
} from "@/lib/sparkKnowledge/estateGuide";
import { resolveInformationalKnowledgeLocalReply } from "@/lib/sparkKnowledge/informationalKnowledge";
import { conversationRecentlyShowedRecovery, messagesAlreadyHasRecoveryReply } from "./recoveryDedup";
import { sanitizeBridgeFromReply } from "@/lib/sparkConversation/bridgeResponderGuard";

/** Hard ceiling — fallback if API/stream does not finish in time. */
export const CHAT_COMPLETION_TIMEOUT_MS = 28_000;

const INFORMATIONAL_CHAT_RE =
  /\b(?:(?:what is|what's) the best way to (?:start|begin|write|create|build)|how do i (?:write|create|start|build|make|draft)|help me understand|help me (?:write|draft|create|build|plan)|how to (?:write|create|start|build|draft)|what is an? sop|how do i write a proposal|how should i (?:start|write|create))\b/i;

const PLAN_DAY_INFORMATIONAL_RE =
  /\bhelp me plan my day\b/i;

/**
 * Coaching / SOP / how-to questions — chat only; skip estate kernel and heavy routing.
 */
export function isInformationalChatTurn(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (shouldRouteThroughEstateKernel(t)) return false;
  if (isEstateGuideQuestion(t)) return true;
  if (PLAN_DAY_INFORMATIONAL_RE.test(t)) return true;
  if (INFORMATIONAL_CHAT_RE.test(t)) return true;
  if (isHowToLearningQuestion(t)) return true;
  if (isKnowledgeQuestion(t)) return true;
  return false;
}

export function buildFailSafeChatReply(
  userText: string,
  memory?: Pick<RuntimeRecoveryInput, "lastAssistantText" | "priorUserText">,
  messages?: ReadonlyArray<{ role: string; content: string }>,
): string | null {
  const trimmed = userText.trim();
  if (messages && messagesAlreadyHasRecoveryReply(messages)) {
    return null;
  }
  if (!trimmed) {
    return "I'm here — what would help most right now?";
  }
  if (isEstateGuideQuestion(trimmed)) {
    return formatEstateGuideReply(resolveEstateGuideTurn(trimmed));
  }
  const knowledgeReply = resolveInformationalKnowledgeLocalReply(trimmed);
  if (knowledgeReply) return knowledgeReply;
  const input: RuntimeRecoveryInput = {
    userText: trimmed,
    lastAssistantText: memory?.lastAssistantText,
    priorUserText: memory?.priorUserText,
  };
  if (messages && conversationRecentlyShowedRecovery(messages)) {
    return sanitizeBridgeFromReply(buildContextualChatFallback(input), trimmed);
  }
  return sanitizeBridgeFromReply(buildContextualChatFallback(input), trimmed);
}

export async function fetchCompanionChatWithTimeout(
  body: Record<string, unknown>,
  timeoutMs = CHAT_COMPLETION_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch("/api/companion-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("companion-chat-timeout");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
