/**
 * Accepted Intent Lock — continue accepted workflows; never reset on yes.
 */

import type { OutcomeThread } from "../companionOutcomeThread";
import { isBareGenericAcceptance } from "../pendingAcceptanceAuthority";
import { continuationReplyForAssistantQuestion } from "../workspaceOpeningRule";
import type { AcceptedIntentResolution, EcosystemResourceId } from "./types";

const FORBIDDEN_RESET_RE =
  /\b(?:what would you like (?:help with|to do)|how can i help|what(?:'s| is) next\?|what next)\b/i;

const DECISION_COMPASS_OFFER_RE =
  /\bdecision compass\b/i;

const BUSINESS_CANVAS_OFFER_RE = /\bbusiness canvas\b/i;

const CLEAR_MIND_OFFER_RE = /\b(?:clear my mind|brain dump)\b/i;

const WALK_THROUGH_RE =
  /\b(?:walk through|work through|go through|figure out|compare|structured)\b/i;

function inferAcceptedResource(
  assistantText: string,
): EcosystemResourceId | null {
  if (DECISION_COMPASS_OFFER_RE.test(assistantText)) return "decision_compass";
  if (BUSINESS_CANVAS_OFFER_RE.test(assistantText)) return "business_canvas";
  if (CLEAR_MIND_OFFER_RE.test(assistantText)) return "clear_my_mind";
  return null;
}

function nextStepForResource(
  resource: EcosystemResourceId,
  thread: OutcomeThread | null | undefined,
): string {
  switch (resource) {
    case "decision_compass":
      return thread?.pendingDecision
        ? `Perfect — opening **Decision Compass** to work through: ${thread.pendingDecision}. We'll compare your options step by step.`
        : "Perfect — I'll open **Decision Compass** beside us. First, name the decision in one line: keep current, replace, offer both, or phase in?";
    case "business_canvas":
      return "Great — let's map your current business in **Business Canvas** first, then we'll layer in the proposed change.";
    case "clear_my_mind":
      return "Opening **Clear My Mind** — dump everything competing for attention, then we'll sort one piece.";
    default:
      return thread?.pendingAction
        ? `Continuing **${thread.pendingAction}** — here's the next step.`
        : "Continuing where we left off.";
  }
}

function nextStepForGuidedContinue(
  assistantText: string,
  thread: OutcomeThread | null | undefined,
): string {
  if (thread?.pendingDecision) {
    return `Let's keep going on **${thread.pendingDecision}**. Based on what you shared, the three paths are: keep your current offer, replace it, or run both. Which feels closest to what you want — even if you're not sure yet?`;
  }
  if (thread?.currentProblem) {
    const fromQuestion = continuationReplyForAssistantQuestion(assistantText);
    if (fromQuestion) return fromQuestion;
    return "Great — let's keep going. What's the piece that feels most uncertain right now?";
  }
  if (/\b(?:expansion|product line|new offer|group program)\b/i.test(assistantText)) {
    return "Let's keep going — who buys your current offer today, and who would the new line serve?";
  }
  if (WALK_THROUGH_RE.test(assistantText)) {
    return "Great — let's work through this together. What's the one variable that worries you most: existing customers, pricing, or adoption?";
  }
  return "Great — let's keep going. What's the piece that feels most uncertain right now?";
}

export function resolveAcceptedIntent(input: {
  userText: string;
  lastAssistantText: string;
  outcomeThread?: OutcomeThread | null;
}): AcceptedIntentResolution | null {
  const t = input.userText.trim();
  if (!t || !isBareGenericAcceptance(t)) return null;

  const resource = inferAcceptedResource(input.lastAssistantText);
  const offerKind = resource
    ? "resource"
    : WALK_THROUGH_RE.test(input.lastAssistantText)
      ? "guided_continue"
      : /\b(?:strategy|explore|recommendation)\b/i.test(input.lastAssistantText)
        ? "strategy"
        : "decision_support";

  const pendingOutcome =
    input.outcomeThread?.pendingAction ??
    input.outcomeThread?.pendingDecision ??
    input.outcomeThread?.currentProblem ??
    null;

  const nextStep = resource
    ? nextStepForResource(resource, input.outcomeThread)
    : nextStepForGuidedContinue(input.lastAssistantText, input.outcomeThread);

  return {
    accepted: true,
    offerKind: resource ? "resource" : offerKind,
    acceptedResource: resource,
    pendingOutcome,
    nextStep,
    forbiddenReset: true,
  };
}

export function isForbiddenResetMessage(text: string): boolean {
  return FORBIDDEN_RESET_RE.test(text.trim());
}

export function acceptedIntentLockHintForChat(
  resolution: AcceptedIntentResolution,
): string {
  return [
    "ACCEPTED INTENT LOCK (mandatory):",
    "User accepted your offer. DO NOT reset the conversation.",
    "FORBIDDEN: 'What would you like help with?', 'How can I help?', 'What's next?' before the workflow completes.",
    `Accepted: ${resolution.acceptedResource ?? resolution.offerKind}.`,
    resolution.pendingOutcome
      ? `Pending outcome: ${resolution.pendingOutcome}`
      : null,
    `REQUIRED next step: ${resolution.nextStep}`,
    "Continue the accepted thread until recommendation or workspace handoff.",
  ]
    .filter(Boolean)
    .join("\n");
}
