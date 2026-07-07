/**
 * Pass 1 — Conversation Priority Engine
 *
 * Resolves what wins this turn before pending-choice, frictionless yes-continuation,
 * or stale pending handlers run. The most recent meaningful user intent wins.
 */

import type { PendingAction } from "@/lib/pendingAction";
import {
  affirmationAlignsWithRecentMeaning,
  inferMeaningTopicFromAssistant,
  inferMeaningTopicFromFrictionlessPending,
  recentAssistantOfferOverridesPendingMenu,
} from "@/lib/conversation/mostRecentMeaningWins";
import { isEmotionalSupportThread } from "@/lib/conversation/emotionalDistressRouting";
import { hasHardEstateNavigationIntent } from "@/lib/estate/estateMetaNavigationPhrases";
import { isBareGenericAcceptance } from "@/lib/pendingAcceptanceAuthority";
import type { FrictionlessPendingAction } from "@/lib/frictionlessActionLayer";
import {
  isCreateWorkflowContinuation,
  isPendingMenuMetaQuestion,
} from "@/lib/pendingChoice/listContinuation";
import {
  isLikelyMenuSelectionInput,
  parsePendingChoiceSelection,
} from "@/lib/pendingChoice/parseSelection";
import type {
  ConversationPriorityInput,
  ConversationPriorityVerdict,
  ContinuationKind,
  StalePendingKind,
} from "./types";

const RESTORATION_USER_RE =
  /\b(?:too many ideas|brain dump|clear my mind|overwhelm(?:ed|ing)?|scattered thoughts|everything in my head|racing thoughts|can'?t focus|mind feels full)\b/i;

const CREATE_TOPIC_USER_RE =
  /\b(?:need help(?:\s+(?:writing|creating|drafting|building|with|to\b)|\b)|help me (?:create|write|writing|draft|build|make|plan)|write (?:a|an|my)|create (?:a|an|my)|draft (?:a|an|my))\b/i;

function uniqueKinds(kinds: StalePendingKind[]): StalePendingKind[] {
  return [...new Set(kinds)];
}

function baseVerdict(
  partial: Omit<ConversationPriorityVerdict, "stalePendingsToClear"> & {
    stalePendingsToClear?: StalePendingKind[];
  },
  accumulated: StalePendingKind[],
): ConversationPriorityVerdict {
  return {
    ...partial,
    stalePendingsToClear: uniqueKinds([
      ...accumulated,
      ...(partial.stalePendingsToClear ?? []),
    ]),
  };
}

export function detectContinuationKind(
  userText: string,
): ContinuationKind | null {
  const t = userText.trim();
  if (!t) return null;
  if (isCreateWorkflowContinuation(t)) {
    if (/\badd\s+more\b/i.test(t)) return "add_more";
    if (/^continue\b/i.test(t)) return "continue";
    return "add_more";
  }
  if (isBareGenericAcceptance(t)) return "yes";
  return null;
}

export function isRestorationUserTurn(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (RESTORATION_USER_RE.test(t)) return true;
  return inferMeaningTopicFromAssistant(t) === "clear_my_mind";
}

export function isCreateTopicUserTurn(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (CREATE_TOPIC_USER_RE.test(t)) return true;
  return inferMeaningTopicFromAssistant(t) === "create";
}

/** Topic shift clears stale create pendings — warm-leads must not survive brain dump. */
export function stalePendingsToClearOnTopicShift(
  input: ConversationPriorityInput,
): StalePendingKind[] {
  const userText = input.userText.trim();
  if (!userText) return [];
  if (isBareGenericAcceptance(userText) || isCreateWorkflowContinuation(userText)) {
    return [];
  }

  const toClear: StalePendingKind[] = [];
  const restoration = isRestorationUserTurn(userText);
  const createShift = isCreateTopicUserTurn(userText);

  const roomRequest = hasHardEstateNavigationIntent(userText);
  const newTaskShift = restoration || createShift || roomRequest;

  if (input.frictionlessPending) {
    const pendingTopic = inferMeaningTopicFromFrictionlessPending(
      input.frictionlessPending,
    );
    if (pendingTopic === "create" && newTaskShift) {
      toClear.push("frictionless");
    }
  }

  if (input.pendingChoiceState?.choices.length && newTaskShift) {
    toClear.push("pending_choice");
  }

  return toClear;
}

function pendingActionFromFrictionless(
  pending: FrictionlessPendingAction,
): PendingAction | null {
  switch (pending.target) {
    case "brain-dump":
      return {
        kind: "tool",
        suggestion: {
          kind: "focus-session",
          line: pending.offerSummary ?? "Clear My Mind",
          toolLabel: "Clear My Mind",
          toolObjectId: "brain-dump",
          keepTalkingLabel: "Keep Talking",
          action: { type: "tool", tool: "brain-dump" },
        },
      };
    case "content-generator":
      return {
        kind: "workspace",
        offer: {
          section: "content-generator",
          buttonLabel: pending.label ?? "Create",
          line: pending.offerSummary ?? pending.initialPrompt ?? "Create",
        },
      };
    case "decision-compass":
      return {
        kind: "workspace",
        offer: {
          section: "decision-compass",
          buttonLabel: "Decision Compass",
          line: pending.offerSummary ?? "Decision Compass",
        },
      };
    case "focus-audio":
      return {
        kind: "tool",
        suggestion: {
          kind: "focus-session",
          line: pending.offerSummary ?? "Focus Audio",
          toolLabel: "Focus Audio",
          toolObjectId: "focus-audio",
          keepTalkingLabel: "Keep Talking",
          action: { type: "tool", tool: "focus-audio" },
        },
      };
    case "plan-my-day":
      return {
        kind: "workspace",
        offer: {
          section: "plan-my-day",
          buttonLabel: "Plan My Day",
          line: pending.offerSummary ?? "Plan My Day",
        },
      };
    case "playbook":
      return {
        kind: "workspace",
        offer: {
          section: "playbook",
          buttonLabel: "Strategy",
          line: pending.offerSummary ?? "Strategy",
        },
      };
    default:
      return null;
  }
}

function yesAlignsWithFrictionlessPending(
  input: ConversationPriorityInput,
): boolean {
  if (!input.frictionlessPending) return false;
  const pendingAction = pendingActionFromFrictionless(input.frictionlessPending);
  if (!pendingAction) return false;
  return affirmationAlignsWithRecentMeaning({
    userText: input.userText,
    lastAssistantText: input.lastAssistantText,
    pendingAction,
    pendingOfferSummary:
      input.frictionlessPending.offerSummary ??
      input.frictionlessPending.initialPrompt ??
      input.frictionlessPending.target ??
      "",
    pendingOfferedAtTurn: input.frictionlessPending.offeredAtTurn,
    currentTurn: input.currentTurn,
  });
}

function isClearMenuSelection(input: ConversationPriorityInput): boolean {
  const state = input.pendingChoiceState;
  if (!state?.choices.length) return false;
  const trimmed = input.userText.trim();
  if (isPendingMenuMetaQuestion(trimmed)) return false;
  if (parsePendingChoiceSelection(trimmed, state.choices)) return true;
  if (
    isLikelyMenuSelectionInput(trimmed, state.choices.length) &&
    !isBareGenericAcceptance(trimmed)
  ) {
    return true;
  }
  return false;
}

/**
 * Single priority verdict for this turn — call before pending-choice or frictionless yes.
 */
export function resolveConversationPriority(
  input: ConversationPriorityInput,
): ConversationPriorityVerdict {
  const userText = input.userText.trim();
  const lastAssistant = input.lastAssistantText.trim();
  const topicShiftClears = stalePendingsToClearOnTopicShift(input);
  const continuationKind = detectContinuationKind(userText);

  if (
    input.hasUniversalCreationSession &&
    continuationKind &&
    isCreateWorkflowContinuation(userText)
  ) {
    const clears: StalePendingKind[] = [...topicShiftClears];
    if (input.pendingChoiceState?.choices.length) {
      clears.push("pending_choice");
    }
    return baseVerdict(
      {
        winner: "continue_creation",
        continuationKind,
        bindAffirmationTo: "active_session",
        deferPendingChoice: true,
        deferFrictionlessYes: true,
        reason: "active_universal_creation_continuation",
      },
      clears,
    );
  }

  if (
    input.hasUniversalCreationSession &&
    continuationKind === "yes" &&
    lastAssistant &&
    (inferMeaningTopicFromAssistant(lastAssistant) === "create" ||
      /\?\s*$/.test(lastAssistant))
  ) {
    const clears: StalePendingKind[] = [...topicShiftClears];
    if (input.pendingChoiceState?.choices.length) {
      clears.push("pending_choice");
    }
    return baseVerdict(
      {
        winner: "continue_creation",
        continuationKind: "yes",
        bindAffirmationTo: "active_session",
        deferPendingChoice: true,
        deferFrictionlessYes: true,
        reason: "active_universal_creation_yes",
      },
      clears,
    );
  }

  if (
    isEmotionalSupportThread(userText, lastAssistant) &&
    !(input.hasUniversalCreationSession && continuationKind)
  ) {
    const clears: StalePendingKind[] = [...topicShiftClears];
    if (input.frictionlessPending) clears.push("frictionless");
    if (input.pendingChoiceState?.choices.length) clears.push("pending_choice");
    return baseVerdict(
      {
        winner: "emotional_support",
        bindAffirmationTo: "last_assistant",
        deferPendingChoice: true,
        deferFrictionlessYes: true,
        reason: "emotional_need_outranks_unrelated_tasks",
      },
      clears,
    );
  }

  if (isClearMenuSelection(input)) {
    return baseVerdict(
      {
        winner: "pending_choice",
        bindAffirmationTo: "none",
        deferPendingChoice: false,
        deferFrictionlessYes: false,
        reason: "clear_menu_selection",
      },
      topicShiftClears,
    );
  }

  if (isBareGenericAcceptance(userText) && lastAssistant) {
    if (
      input.pendingChoiceState?.choices.length &&
      recentAssistantOfferOverridesPendingMenu({
        userText,
        lastAssistantText: lastAssistant,
        menuOfferedAtTurn: input.pendingChoiceState.offeredAtTurn,
        currentTurn: input.currentTurn,
      })
    ) {
      return baseVerdict(
        {
          winner: "accept_last_assistant",
          continuationKind: "yes",
          bindAffirmationTo: "last_assistant",
          stalePendingsToClear: ["pending_choice"],
          deferPendingChoice: true,
          deferFrictionlessYes: true,
          reason: "recent_assistant_overrides_stale_menu",
        },
        topicShiftClears,
      );
    }

    if (input.frictionlessPending && !yesAlignsWithFrictionlessPending(input)) {
      return baseVerdict(
        {
          winner: "accept_last_assistant",
          continuationKind: "yes",
          bindAffirmationTo: "last_assistant",
          stalePendingsToClear: ["frictionless"],
          deferPendingChoice: Boolean(input.pendingChoiceState?.choices.length),
          deferFrictionlessYes: true,
          reason: "yes_binds_last_assistant_not_stale_frictionless",
        },
        topicShiftClears,
      );
    }

    if (input.frictionlessPending && yesAlignsWithFrictionlessPending(input)) {
      return baseVerdict(
        {
          winner: "frictionless_pending",
          continuationKind: "yes",
          bindAffirmationTo: "pending",
          deferPendingChoice: Boolean(input.pendingChoiceState?.choices.length),
          deferFrictionlessYes: false,
          reason: "frictionless_pending_aligned_with_assistant",
        },
        topicShiftClears,
      );
    }
  }

  if (topicShiftClears.length > 0) {
    return baseVerdict(
      {
        winner: "conversation",
        bindAffirmationTo: "none",
        deferPendingChoice: false,
        deferFrictionlessYes: false,
        reason: "topic_shift_clears_stale_pendings",
      },
      topicShiftClears,
    );
  }

  return baseVerdict(
    {
      winner: "none",
      bindAffirmationTo: "none",
      deferPendingChoice: false,
      deferFrictionlessYes: false,
      reason: "no_priority_override",
    },
    [],
  );
}
