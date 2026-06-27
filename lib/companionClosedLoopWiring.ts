/**
 * Client wiring helpers for Closed Loop Learning — thin API for CompanionPageClient.
 */

import type { EmotionalState } from "./companionEmotions";
import { getOutcomeThread } from "./companionOutcomeThread";
import type { WorkspaceOffer } from "./workspaceMode";
import type { ToolSuggestionKind } from "./companionToolSuggestions";
import {
  captureBehaviorEvent,
  SECTION_TO_CAPABILITY,
  TOOL_KIND_TO_CAPABILITY,
  type ClosedLoopCaptureContext,
} from "./closedLoopLearning";
import type { AppSection } from "./companionUi";
import {
  recordBehavioralMistakeSignal,
  storeLastInterventionForMistake,
} from "./companionMistakeRecovery";

export function buildClosedLoopContext(input?: {
  emotionalState?: EmotionalState | null;
  actualNeed?: string | null;
  activePattern?: string | null;
  routingReason?: string;
  confidence?: number;
}): ClosedLoopCaptureContext {
  const thread = getOutcomeThread();
  return {
    actualNeed: input?.actualNeed ?? null,
    userState: input?.emotionalState ?? null,
    activePattern: input?.activePattern ?? null,
    outcomeThread:
      thread?.currentProblem ?? thread?.currentGoal ?? thread?.desiredOutcome ?? null,
    routingReason: input?.routingReason,
    confidence: input?.confidence,
  };
}

export function captureOfferShown(
  offer: WorkspaceOffer,
  context?: ClosedLoopCaptureContext,
): void {
  const capability = SECTION_TO_CAPABILITY[offer.section] ?? offer.section;
  storeLastInterventionForMistake(capability);
  captureBehaviorEvent({
    capability,
    eventType: "offer_shown",
    context: { ...context, routingReason: context?.routingReason ?? offer.section },
  });
}

export function captureOfferAccepted(
  offer: WorkspaceOffer,
  context?: ClosedLoopCaptureContext,
): void {
  captureBehaviorEvent({
    capability: SECTION_TO_CAPABILITY[offer.section] ?? offer.section,
    eventType: "offer_accepted",
    context,
  });
}

export function captureOfferDismissed(
  offer: WorkspaceOffer,
  context?: ClosedLoopCaptureContext,
): void {
  const capability = SECTION_TO_CAPABILITY[offer.section] ?? offer.section;
  captureBehaviorEvent({
    capability,
    eventType: "offer_dismissed",
    context,
  });
  recordBehavioralMistakeSignal({
    interventionId: capability,
    kind: "dismissed",
  });
}

export function captureWorkspaceOpened(
  section: AppSection,
  context?: ClosedLoopCaptureContext,
): void {
  captureBehaviorEvent({
    capability: SECTION_TO_CAPABILITY[section] ?? section,
    eventType: "workspace_opened",
    context: { ...context, routingReason: context?.routingReason ?? section },
  });
}

export function captureWorkspaceUsed(
  section: AppSection,
  metadata?: Record<string, string | number | boolean>,
  context?: ClosedLoopCaptureContext,
): void {
  captureBehaviorEvent({
    capability: SECTION_TO_CAPABILITY[section] ?? section,
    eventType: "workspace_used",
    context,
    metadata,
  });
}

export function captureWorkspaceCompleted(
  section: AppSection,
  context?: ClosedLoopCaptureContext,
): void {
  captureBehaviorEvent({
    capability: SECTION_TO_CAPABILITY[section] ?? section,
    eventType: "workspace_completed",
    context,
  });
}

export function captureWorkspaceAbandoned(
  section: AppSection,
  context?: ClosedLoopCaptureContext,
): void {
  const capability = SECTION_TO_CAPABILITY[section] ?? section;
  captureBehaviorEvent({
    capability,
    eventType: "workspace_abandoned",
    context,
  });
  recordBehavioralMistakeSignal({
    interventionId: capability,
    kind: "abandoned",
  });
}

export function captureWorkspaceReturned(
  section: AppSection,
  context?: ClosedLoopCaptureContext,
): void {
  captureBehaviorEvent({
    capability: SECTION_TO_CAPABILITY[section] ?? section,
    eventType: "workspace_returned",
    context,
  });
}

export function captureToolOfferShown(
  kind: ToolSuggestionKind,
  context?: ClosedLoopCaptureContext,
): void {
  const cap = TOOL_KIND_TO_CAPABILITY[kind] ?? "conversation_coaching";
  captureBehaviorEvent({
    capability: cap,
    eventType: "offer_shown",
    context,
  });
}

export function captureToolOfferAccepted(
  kind: ToolSuggestionKind,
  context?: ClosedLoopCaptureContext,
): void {
  const cap = TOOL_KIND_TO_CAPABILITY[kind] ?? "conversation_coaching";
  captureBehaviorEvent({
    capability: cap,
    eventType: "offer_accepted",
    context,
  });
}

export function captureToolOfferDismissed(
  kind: ToolSuggestionKind,
  context?: ClosedLoopCaptureContext,
): void {
  const cap = TOOL_KIND_TO_CAPABILITY[kind] ?? "conversation_coaching";
  captureBehaviorEvent({
    capability: cap,
    eventType: "offer_dismissed",
    context,
  });
  recordBehavioralMistakeSignal({
    interventionId: cap,
    kind: "dismissed",
  });
}

export { SECTION_TO_CAPABILITY, resolveCapabilityId } from "./closedLoopLearning";
