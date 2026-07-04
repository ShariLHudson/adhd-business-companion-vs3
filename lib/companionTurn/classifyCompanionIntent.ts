/**
 * Step 1 — classify member input into exactly one routing kind.
 */

import { shouldRouteThroughEstateKernel } from "@/lib/estate/estateKernelGate";
import { isInformationalChatTurn } from "@/lib/chatFastPath/chatTurnGuarantee";
import {
  planEstateActionExecution,
  resolveEstateAction,
  type EstateActionExecutionPlan,
} from "@/lib/estate/decisionKernel";
import type {
  ClassifiedCompanionIntent,
  ClassifyCompanionIntentInput,
  CompanionIntentKind,
} from "./types";

function kindFromPlan(plan: EstateActionExecutionPlan): CompanionIntentKind {
  switch (plan.type) {
    case "navigate-place":
    case "navigate-memory":
      return "NAVIGATE";
    case "capture-write":
      return "CAPTURE";
    case "soundscape":
      return "AUDIO";
    case "chat":
    case "chat-local-reply":
    case "place-menu":
    case "capture-menu":
    case "room-action":
    case "noop":
      return "CHAT";
    default: {
      const _exhaustive: never = plan;
      return _exhaustive;
    }
  }
}

/**
 * Classify input → CHAT | NAVIGATE | CAPTURE | AUDIO (one label only).
 */
export function classifyCompanionIntent(
  input: ClassifyCompanionIntentInput,
): ClassifiedCompanionIntent {
  const userText = input.userText.trim();

  if (!userText) {
    return {
      kind: "CHAT",
      userText: "",
      plan: { type: "chat", userText: "" },
    };
  }

  const estateKernelRequired = shouldRouteThroughEstateKernel(userText);
  const forceChat =
    (input.forceChat || isInformationalChatTurn(userText)) && !estateKernelRequired;

  if (forceChat) {
    return {
      kind: "CHAT",
      userText,
      plan: { type: "chat", userText },
    };
  }

  const decision = resolveEstateAction({
    userText,
    lastAssistantText: input.lastAssistantText,
    currentPlaceId: input.currentPlaceId,
    soundscapeCategoryId: input.soundscapeCategoryId,
  });
  const plan = planEstateActionExecution(decision);

  return {
    kind: kindFromPlan(plan),
    userText,
    plan,
  };
}

/** True when this classification must not fall through to the chat API. */
export function companionIntentHandledByKernel(
  classified: ClassifiedCompanionIntent,
): boolean {
  if (classified.kind !== "CHAT") return true;
  return classified.plan.type !== "chat";
}
