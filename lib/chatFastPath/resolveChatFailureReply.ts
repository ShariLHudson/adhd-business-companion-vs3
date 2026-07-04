import { routeCompanionFailure } from "@/lib/companionContextRouting";
import type { CompanionFailureSurface } from "@/lib/companionContextRouting/types";
import {
  buildContextualChatFallback,
  buildRuntimeRecoveryResponse,
} from "@/lib/sparkConversation/coachingFallback";
import { conversationRecentlyShowedRecovery } from "./recoveryDedup";
import {
  isBridgeContinuationResponse,
  responseOwnershipBlocksBridge,
  sanitizeBridgeFromReply,
} from "@/lib/sparkConversation/bridgeResponderGuard";

export type ChatMessageLike = { role: string; content: string };

export type ResolveChatFailureReplyInput = {
  err: unknown;
  userText: string;
  messages: ReadonlyArray<ChatMessageLike>;
  surface?: CompanionFailureSurface;
};

function memoryFromMessages(messages: ReadonlyArray<ChatMessageLike>): {
  lastAssistantText?: string;
  priorUserText?: string;
} {
  const userLines = messages.filter((m) => m.role === "user").map((m) => m.content);
  const lastAssistantText = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")?.content;
  const priorUserText =
    userLines.length >= 2 ? userLines[userLines.length - 2] : userLines[0];
  return { lastAssistantText, priorUserText };
}

function isSoftRecoverableError(err: unknown): boolean {
  if (err instanceof Error) {
    if (err.name === "AbortError") return true;
    if (err.message === "companion-chat-timeout") return true;
    if (err.message.startsWith("companion-chat-stream-timeout:")) return true;
    if (err.message.includes("-timeout:")) return true;
  }
  return false;
}

/**
 * One failure reply per turn — never stack the runtime recovery lead twice in a row.
 */
export function resolveChatFailureReply(
  input: ResolveChatFailureReplyInput,
): string | null {
  const trimmed = input.userText.trim();
  const memory = memoryFromMessages(input.messages);

  const lastAssistant = [...input.messages]
    .reverse()
    .find((m) => m.role === "assistant");
  if (responseOwnershipBlocksBridge(lastAssistant?.content)) {
    return null;
  }

  if (conversationRecentlyShowedRecovery(input.messages)) {
    const reply = buildContextualChatFallback({
      userText: trimmed,
      ...memory,
    });
    return sanitizeBridgeFromReply(reply, trimmed);
  }

  if (isSoftRecoverableError(input.err)) {
    const reply = buildContextualChatFallback({
      userText: trimmed,
      ...memory,
    });
    return sanitizeBridgeFromReply(reply, trimmed);
  }

  const routed = routeCompanionFailure(input.err, {
    surface: input.surface ?? "chat",
    userText: trimmed,
  });
  if (routed.channel === "estate") {
    return routed.message;
  }

  if (!trimmed) {
    return "I'm here — what would help most right now?";
  }

  const reply = buildRuntimeRecoveryResponse({
    userText: trimmed,
    ...memory,
  });
  if (isBridgeContinuationResponse(reply)) {
    return sanitizeBridgeFromReply(reply, trimmed);
  }
  return reply;
}
