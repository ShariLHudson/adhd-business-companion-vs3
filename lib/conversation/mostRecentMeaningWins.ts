/**
 * Rule: The Most Recent Meaning Wins™
 *
 * Spark prioritizes the member's most recent meaningful intent over stale
 * pending actions, reminders, or previous suggestions.
 *
 * On "yes" — internally: "Yes… to what?" — bind to the last assistant offer,
 * not a sales reminder from twenty minutes ago.
 */

import { assistantOfferedConsent, inferConversationWorkflowFromAssistant } from "../conversationWorkflowContinuation";
import { matchesExperienceFollowUp } from "../companionAutoLaunch";
import { isBareGenericAcceptance } from "../pendingAcceptanceAuthority";
import type { PendingAction } from "../pendingAction";

export type FrictionlessPendingTopicInput = {
  type?: string;
  target?: string;
};

export const RECENT_MEANING_TURN_LIMIT = 3;

export const MOST_RECENT_MEANING_WINS_HINT = [
  "Most Recent Meaning Wins (mandatory):",
  "Prioritize the member's latest meaningful intent over stale pending offers.",
  'On "yes" — resolve to what Shari just offered, not an old reminder.',
  "If they changed direction, follow them — clear stale pendings.",
  "Never bind generic yes to an offer the last assistant message did not make.",
].join("\n");

export type MeaningTopic =
  | "clear_my_mind"
  | "my_thoughts"
  | "create"
  | "decision"
  | "focus_audio"
  | "focus_timer"
  | "breathe"
  | "plan_day"
  | "strategy"
  | "estate_menu"
  | "research"
  | "learning"
  | "projects"
  | "unknown";

const CREATE_IN_ASSISTANT_RE =
  /\b(?:create|draft|write|build|newsletter|email|sop|proposal|funnel|workshop|sales funnel|lead magnet|landing page)\b/i;

const RESTORATION_IN_ASSISTANT_RE =
  /\b(?:clear my mind|clear your mind|brain dump|get (?:it )?out of (?:your|my) head|breathe|breathing|decision compass|plan my day|focus audio|focus music|my thoughts)\b/i;

/** What the last assistant turn was actually offering. */
export function inferMeaningTopicFromAssistant(text: string): MeaningTopic {
  const t = text.trim();
  if (!t) return "unknown";

  const workflow = inferConversationWorkflowFromAssistant(t);
  if (workflow) {
    switch (workflow.kind) {
      case "open_clear_my_mind":
        return "clear_my_mind";
      case "open_my_thoughts":
        return "my_thoughts";
      case "open_decision_compass":
      case "guided_continue":
        return /\bdecision compass\b/i.test(t) ? "decision" : "unknown";
      case "open_breathe":
        return "breathe";
      case "open_plan_my_day":
        return "plan_day";
      case "open_focus_audio":
        return "focus_audio";
      case "open_focus_timer":
        return "focus_timer";
      case "project_list":
      case "project_sort":
        return "projects";
      default:
        break;
    }
  }

  if (/\b(?:clear my mind|clear your mind|brain dump)\b/i.test(t)) return "clear_my_mind";
  if (/\bmy thoughts\b/i.test(t)) return "my_thoughts";
  if (/\bdecision compass\b/i.test(t)) return "decision";
  if (/\b(?:focus audio|focus music)\b/i.test(t)) return "focus_audio";
  if (/\b(?:focus timer|pomodoro|\d+\s*min(?:ute)?s? focus)\b/i.test(t)) {
    return "focus_timer";
  }
  if (/\b(?:breathe|breathing|breath(?:ing)? reset)\b/i.test(t)) return "breathe";
  if (/\bplan my day\b/i.test(t)) return "plan_day";
  if (/\b(?:strateg(?:y|ies)|playbook)\b/i.test(t) && /\b(?:would you like|open)\b/i.test(t)) {
    return "strategy";
  }
  if (CREATE_IN_ASSISTANT_RE.test(t)) return "create";
  if (/\bresearch\b/i.test(t) && assistantOfferedConsent(t)) return "research";
  if (/\b(?:explore|learn about|types of images)\b/i.test(t) && assistantOfferedConsent(t)) {
    return "learning";
  }
  if (/\b(?:1\.|2\.|3\.|pick (?:a|one)|which (?:place|room))\b/i.test(t)) {
    return "estate_menu";
  }
  return "unknown";
}

export function inferMeaningTopicFromPendingAction(
  action: PendingAction,
): MeaningTopic {
  switch (action.kind) {
    case "workspace":
      switch (action.offer.section) {
        case "brain-dump":
          return "clear_my_mind";
        case "content-generator":
          return "create";
        case "decision-compass":
          return "decision";
        case "focus-audio":
          return "focus_audio";
        case "playbook":
          return "strategy";
        case "plan-my-day":
          return "plan_day";
        case "projects":
          return "projects";
        default:
          return "unknown";
      }
    case "tool":
      if (action.suggestion.action.type !== "tool") return "unknown";
      switch (action.suggestion.action.tool) {
        case "brain-dump":
          return "clear_my_mind";
        case "focus-audio":
          return "focus_audio";
        case "focus-timer":
          return "focus_timer";
        case "breathe":
          return "breathe";
        default:
          return "unknown";
      }
    case "assisted":
    case "make-bridge":
      return "create";
    default:
      return "unknown";
  }
}

export function inferMeaningTopicFromFrictionlessPending(
  pending: FrictionlessPendingTopicInput,
): MeaningTopic {
  if (pending.type === "strategy_offer") return "strategy";
  if (pending.target === "brain-dump") return "clear_my_mind";
  if (pending.target === "content-generator") return "create";
  if (pending.target === "decision-compass") return "decision";
  if (pending.target === "focus-audio") return "focus_audio";
  if (pending.target === "breathe") return "breathe";
  if (pending.target === "plan-my-day") return "plan_day";
  if (pending.target === "playbook") return "strategy";
  return "unknown";
}

function topicsCompatible(assistant: MeaningTopic, pending: MeaningTopic): boolean {
  if (assistant === "unknown" || pending === "unknown") return true;
  if (assistant === pending) return true;
  if (assistant === "my_thoughts" && pending === "clear_my_mind") return true;
  if (assistant === "clear_my_mind" && pending === "clear_my_mind") return true;
  return false;
}

/** Generic yes/sure must bind to what the last assistant offered — not stale pending. */
export function affirmationAlignsWithRecentMeaning(input: {
  userText: string;
  lastAssistantText: string;
  pendingAction?: PendingAction | null;
  pendingOfferSummary?: string;
  pendingOfferedAtTurn?: number;
  currentTurn?: number;
}): boolean {
  const t = input.userText.trim();
  if (!isBareGenericAcceptance(t)) return true;

  const assistant = input.lastAssistantText.trim();
  const currentTurn = input.currentTurn ?? 0;
  const offeredAt = input.pendingOfferedAtTurn ?? 0;

  if (input.pendingAction && assistant) {
    if (matchesExperienceFollowUp(t, assistant, input.pendingAction)) {
      return true;
    }
  }

  if (!assistant) {
    if (offeredAt && currentTurn - offeredAt > RECENT_MEANING_TURN_LIMIT) {
      return false;
    }
    return true;
  }

  if (!assistantOfferedConsent(assistant) && !RESTORATION_IN_ASSISTANT_RE.test(assistant)) {
    if (offeredAt && currentTurn - offeredAt > RECENT_MEANING_TURN_LIMIT) {
      return false;
    }
    return true;
  }

  const assistantTopic = inferMeaningTopicFromAssistant(assistant);

  if (input.pendingAction) {
    const pendingTopic = inferMeaningTopicFromPendingAction(input.pendingAction);
    if (!topicsCompatible(assistantTopic, pendingTopic)) {
      return false;
    }
  }

  if (
    offeredAt &&
    currentTurn - offeredAt > 1 &&
    assistantTopic !== "unknown" &&
    input.pendingOfferSummary
  ) {
    const summary = input.pendingOfferSummary.toLowerCase();
    const assistantLower = assistant.toLowerCase();
    if (
      !summary.split(/\s+/).some((w) => w.length > 4 && assistantLower.includes(w)) &&
      !topicsCompatible(
        assistantTopic,
        inferMeaningTopicFromSummary(input.pendingOfferSummary),
      )
    ) {
      return false;
    }
  }

  if (assistantTopic === "create" && RESTORATION_IN_ASSISTANT_RE.test(assistant)) {
    if (!CREATE_IN_ASSISTANT_RE.test(assistant)) {
      if (input.pendingAction && inferMeaningTopicFromPendingAction(input.pendingAction) === "create") {
        return false;
      }
    }
  }

  return true;
}

function inferMeaningTopicFromSummary(summary: string): MeaningTopic {
  const s = summary.toLowerCase();
  if (/clear my mind|brain dump/.test(s)) return "clear_my_mind";
  if (/sales funnel|newsletter|email|sop|proposal|create|draft/.test(s)) return "create";
  if (/decision compass/.test(s)) return "decision";
  if (/focus audio/.test(s)) return "focus_audio";
  return "unknown";
}

/** Last assistant made a fresh offer — stale menu / pending should defer. */
export function recentAssistantOfferOverridesPendingMenu(input: {
  userText: string;
  lastAssistantText: string;
  menuOfferedAtTurn?: number;
  currentTurn?: number;
}): boolean {
  if (!isBareGenericAcceptance(input.userText.trim())) return false;
  const assistant = input.lastAssistantText.trim();
  if (!assistant || !assistantOfferedConsent(assistant)) return false;

  const topic = inferMeaningTopicFromAssistant(assistant);
  if (topic === "estate_menu" || topic === "unknown") return false;

  const currentTurn = input.currentTurn ?? 0;
  const menuTurn = input.menuOfferedAtTurn ?? 0;
  if (menuTurn && currentTurn - menuTurn > 0) return true;
  return true;
}
