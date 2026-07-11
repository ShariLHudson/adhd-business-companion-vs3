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
import { primaryTurnAllowsKernel } from "@/lib/conversation/primaryTurnClassifier";
import type {
  ClassifiedCompanionIntent,
  ClassifyCompanionIntentInput,
  CompanionIntentKind,
} from "./types";

/**
 * Fix C — explicit "help me here / stay here" overrides.
 * The member is telling us to help in place, not to be sent to a room.
 */
const DIRECT_HELP_OVERRIDE_RE =
  /\b(?:just\s+help\s+me|help\s+me\s+here|write\s+it\s+here|do\s+it\s+here|keep\s+me\s+here|(?:just\s+)?stay\s+(?:right\s+)?here)\b/i;

export function isDirectHelpOverrideRequest(userText: string): boolean {
  return DIRECT_HELP_OVERRIDE_RE.test(userText.trim());
}

/**
 * Fix D — brain-dump / Clear My Mind capture must always open immediately.
 * A navigate-place plan into Clear My Mind is exempt from the Fix A suppression.
 */
function planOpensClearMyMindCapture(plan: EstateActionExecutionPlan): boolean {
  if (plan.type !== "navigate-place") return false;
  const { command } = plan;
  return (
    command.section === "brain-dump" ||
    command.roomId === "clear-my-mind" ||
    command.entryId === "clear-my-mind"
  );
}

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
    return { kind: "CHAT", userText: "", plan: { type: "chat", userText: "" } };
  }

  const estateKernelRequired = shouldRouteThroughEstateKernel(userText);

  // Fix C — explicit "help me here / stay here" overrides keep the turn in chat,
  // unless the estate kernel is strictly required for this input.
  const forceChat =
    (input.forceChat ||
      isDirectHelpOverrideRequest(userText) ||
      isInformationalChatTurn(userText)) &&
    !estateKernelRequired;

  if (forceChat) {
    return { kind: "CHAT", userText, plan: { type: "chat", userText } };
  }

  const decision = resolveEstateAction({
    userText,
    lastAssistantText: input.lastAssistantText,
    currentPlaceId: input.currentPlaceId,
    activeSection: input.activeSection,
    soundscapeCategoryId: input.soundscapeCategoryId,
  });
  const plan = planEstateActionExecution(decision);

  // Fix A — when the primary-turn verdict says this is a clear goal/help turn,
  // do not let the estate kernel divert it into room menus or room navigation.
  // Fix D — Clear My Mind capture is exempt and always opens.
  if (
    input.primaryTurn &&
    !primaryTurnAllowsKernel(input.primaryTurn) &&
    (plan.type === "place-menu" ||
      (plan.type === "navigate-place" && !planOpensClearMyMindCapture(plan)))
  ) {
    return { kind: "CHAT", userText, plan: { type: "chat", userText } };
  }

  return { kind: kindFromPlan(plan), userText, plan };
}

/** True when this classification must not fall through to the chat API. */
export function companionIntentHandledByKernel(
  classified: ClassifiedCompanionIntent,
): boolean {
  if (classified.kind !== "CHAT") return true;
  return classified.plan.type !== "chat";
}
