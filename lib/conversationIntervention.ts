/**
 * When Shari is asking a discovery question, intervention cards must wait.
 * Constitution: one conversation at a time — no blocker/coaching cards mid-discovery.
 */

import type { TurnArbiterDecision } from "./companionTurnArbiter";
import {
  classifyConversationalMode,
  shouldDeferToolCardOnFirstDistress,
  shouldRunEmotionalTriage,
  userExplicitlyRequestedInterventionHelp,
} from "./messageClassification";
import { STUCK_TRIGGER_RE } from "./activation/activationSignals";

const EXPLICIT_BLOCKER_RE =
  /\b(?:stuck|frozen|paralyz|can'?t start|don'?t know what to do|don'?t know where to start|help me (?:get )?unstuck|smallest next step|not sure what to do|no idea what to do|confus(?:ed|ion)|unclear what to|lost on what)\b/i;

const WORKLOAD_STRESS_RE =
  /\b(?:lots to do|lot to do|much to do|so much to do|many things|before .{0,48}launch|deadline|launch(?:ing)?|busy week|big week|pretty stressed|stressed about|feeling stressed)\b/i;

const STRESS_TONE_RE =
  /\b(?:stressed|stress(?:ed)?|anxious|worried|pressure|nervous|tense|overwhelm(?:ed)?)\b/i;

/** User explicitly named stuck/confusion — not mere workload or stress. */
export function userExpressedExplicitBlocker(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return STUCK_TRIGGER_RE.test(t) || EXPLICIT_BLOCKER_RE.test(t);
}

/** Stress + workload/deadline without stuck/confusion language. */
export function isWorkloadStressWithoutBlocker(text: string): boolean {
  const t = text.trim();
  if (!t || userExpressedExplicitBlocker(t)) return false;
  const stress = STRESS_TONE_RE.test(t);
  const workload = WORKLOAD_STRESS_RE.test(t) || /\blots to do\b/i.test(t);
  return stress && workload;
}

export function assistantEndsWithQuestion(text: string): boolean {
  const tail = text.trim();
  if (!tail) return false;
  const lines = tail.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const last = lines[lines.length - 1] ?? tail;
  return /\?["'”'')\]]*\s*$/.test(last);
}

/** Any direct question in the assistant reply — discovery is in progress. */
export function assistantContainsQuestion(text: string): boolean {
  return /\?/.test(text.trim());
}

function lastUnansweredAssistantContent(
  messages: { role: string; content: string }[],
): string | null {
  if (!messages.length) return null;
  let lastAssistantIdx = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]!.role === "assistant") {
      lastAssistantIdx = i;
      break;
    }
  }
  if (lastAssistantIdx < 0) return null;
  const hasUserReplyAfter = messages
    .slice(lastAssistantIdx + 1)
    .some((m) => m.role === "user" && m.content.trim());
  if (hasUserReplyAfter) return null;
  return messages[lastAssistantIdx]!.content;
}

/** True when the last assistant message asked something and the user has not replied yet. */
export function isAssistantAwaitingUserAnswer(
  messages: { role: string; content: string }[],
): boolean {
  const content = lastUnansweredAssistantContent(messages);
  if (!content) return false;
  return (
    assistantEndsWithQuestion(content) || assistantContainsQuestion(content)
  );
}

/** Block coaching / blocker / next-step cards while discovery is active. */
export function shouldSuppressSecondaryCards(opts: {
  messages: { role: string; content: string }[];
  userText?: string;
  splitCreateDiscovery?: boolean;
  userRequestedAction?: boolean;
}): boolean {
  if (opts.userRequestedAction) return false;
  if (opts.splitCreateDiscovery) return true;
  const userText = opts.userText?.trim() ?? "";
  if (userText && shouldSuppressActivationForTurn(userText)) return true;
  const lastAssistant = lastUnansweredAssistantContent(opts.messages);
  if (lastAssistant && assistantContainsQuestion(lastAssistant)) return true;
  if (isAssistantAwaitingUserAnswer(opts.messages)) return true;
  return false;
}

export type CompanionCardUiState = {
  showActivation: boolean;
  showPendingAction: boolean;
  showActionBridge: boolean;
  showToolCard: boolean;
};

/** Master gate — distress first turn, governor, discovery; allows explicit sort/priority asks. */
export function shouldSuppressInterventionSurfaces(input: {
  userText: string;
  messages: { role: string; content: string }[];
  governorSuppressesCards?: boolean;
  splitCreateDiscovery?: boolean;
  userRequestedAction?: boolean;
}): boolean {
  const t = input.userText.trim();
  if (!t) return false;
  if (userExplicitlyRequestedInterventionHelp(t)) return false;
  if (input.governorSuppressesCards) return true;
  if (shouldDeferToolCardOnFirstDistress(input.messages, t)) return true;
  return shouldSuppressSecondaryCards({
    messages: input.messages,
    userText: t,
    splitCreateDiscovery: input.splitCreateDiscovery,
    userRequestedAction: input.userRequestedAction,
  });
}

/** Pure gating for launch QA — mirrors page.tsx intervention rules. */
export function resolveCompanionCardUiState(input: {
  userText: string;
  messages: { role: string; content: string }[];
  activationOffer: string;
  pendingAction: boolean;
  actionBridge: boolean;
  toolCard: boolean;
  governorSuppressesCards?: boolean;
}): CompanionCardUiState {
  const suppress = shouldSuppressInterventionSurfaces({
    messages: input.messages,
    userText: input.userText,
    governorSuppressesCards: input.governorSuppressesCards,
  });
  return {
    showActivation: !suppress && Boolean(input.activationOffer.trim()),
    showPendingAction: !suppress && input.pendingAction,
    showActionBridge: !suppress && input.actionBridge,
    showToolCard: !suppress && input.toolCard,
  };
}

/** Suppress activation / coaching / blocker cards for this user turn. */
export function shouldSuppressActivationForTurn(
  userText: string,
  turnDecision?: TurnArbiterDecision,
): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (userExplicitlyRequestedInterventionHelp(t)) return false;
  if (isWorkloadStressWithoutBlocker(t)) return true;
  if (/\b(?:lots to do|much to do|before .{0,48}launch)\b/i.test(t) && STRESS_TONE_RE.test(t)) {
    return true;
  }
  if (userExpressedExplicitBlocker(t)) return false;

  const mode = classifyConversationalMode(t);
  if (
    mode === "prioritizing" ||
    mode === "thinking" ||
    mode === "deciding" ||
    mode === "brainstorming"
  ) {
    return true;
  }
  if (shouldRunEmotionalTriage(t)) return true;
  if (
    turnDecision === "triage" ||
    turnDecision === "discovery" ||
    turnDecision === "conversation"
  ) {
    return true;
  }
  return false;
}
