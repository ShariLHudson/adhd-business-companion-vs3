import { getCanonicalEstatePlaceById } from "@/lib/estate/canonicalEstateRegistry";
import { isLiveEstatePlace } from "@/lib/estate/liveEstatePlace";
import { hasHardEstateNavigationIntent } from "@/lib/estate/estateMetaNavigationPhrases";
import { resolveEstatePlaceIdFromUserText } from "@/lib/estate/estateRoomAliasRegistry";
import type { CapabilityRecommendationOption } from "@/lib/estateCapabilityRegistry/types";
import type { EstateDestinationChoice } from "@/lib/estate/estateDestinationResolver";
import {
  extractPlaceIdsFromNumberedAssistantMenu,
} from "@/lib/estate/estatePlaceIdentityLock";
import {
  ackForPendingChoiceAction,
  pendingChoiceActionFromCapability,
  pendingChoicesFromConciergeOptions,
} from "./capabilityAction";
import {
  clearPendingChoice,
  loadPendingChoice,
  registerPendingChoice,
} from "./manager";
import {
  isLikelyMenuSelectionInput,
  parsePendingChoiceSelection,
} from "./parseSelection";
import {
  buildExpandedPlaceMenu,
  buildMenuAffirmationReply,
  buildMenuMetaReply,
  isCreateWorkflowContinuation,
  isPendingMenuAffirmation,
  isPendingMenuExpansionRequest,
  isPendingMenuMetaQuestion,
} from "./listContinuation";
import { loadUniversalCreationSession } from "@/lib/universalCreation";
import { isEmotionalSupportThread } from "@/lib/conversation/emotionalDistressRouting";
import {
  recentAssistantOfferOverridesPendingMenu,
} from "@/lib/conversation/mostRecentMeaningWins";
import type {
  PendingChoiceItem,
  PendingChoiceResolveResult,
  PendingChoiceState,
} from "./types";

const CANCEL_RE =
  /\b(?:never\s*mind|nevermind|cancel|forget it|not anymore|don'?t worry|skip it|actually no)\b/i;

const TOPIC_CHANGE_RE =
  /\b(?:need help(?:\s+(?:writing|creating|drafting|building|with|to\b)|\b)|help me (?:create|write|writing|draft|build|make|plan)|help (?:writing|creating|drafting)|write (?:a|an|my)|create (?:a|an|my)|draft (?:a|an|my)|take me to|go to|open the|research|explain|what is|how do)\b/i;

const UNRECOGNIZED_REPLY =
  "I'm not sure which option you meant.";

function formatMenuReplay(state: PendingChoiceState): string {
  if (state.menuText?.trim()) return state.menuText.trim();
  return state.choices
    .map((choice, index) => `${index + 1}. ${choice.label}`)
    .join("\n");
}

function placeChoicesFromIds(placeIds: readonly string[]): PendingChoiceItem[] {
  return placeIds
    .filter((placeId) => isLiveEstatePlace(placeId))
    .map((placeId) => {
    const place = getCanonicalEstatePlaceById(placeId);
    const label = place?.officialName.replace(/\u2122/g, "") ?? placeId.replace(/-/g, " ");
    return {
      id: placeId,
      label,
      destination: placeId,
      callback: {
        kind: "navigate_place",
        placeId,
      },
      confidence: "high" as const,
    };
  });
}

export function registerPendingChoiceFromConcierge(input: {
  goalSummary: string;
  options: readonly CapabilityRecommendationOption[];
  menuText: string;
  offeredAtTurn?: number;
  activeIntent?: string;
}): PendingChoiceState {
  return registerPendingChoice({
    type: "capability_concierge",
    choices: pendingChoicesFromConciergeOptions(input.options),
    menuText: input.menuText,
    activeIntent: input.activeIntent ?? input.goalSummary,
    offeredAtTurn: input.offeredAtTurn,
  });
}

export function registerPendingChoiceFromPlaceIds(input: {
  placeIds: readonly string[];
  menuText: string;
  offeredAtTurn?: number;
}): PendingChoiceState | null {
  const choices = placeChoicesFromIds(input.placeIds);
  if (choices.length < 2) return null;
  return registerPendingChoice({
    type: "estate_place",
    choices,
    menuText: input.menuText,
    offeredAtTurn: input.offeredAtTurn,
  });
}

export function registerPendingChoiceFromNavigation(input: {
  choices: readonly EstateDestinationChoice[];
  menuText: string;
  queryPhrase?: string;
  offeredAtTurn?: number;
}): PendingChoiceState {
  const items: PendingChoiceItem[] = input.choices.map((choice) => ({
    id: choice.destinationId,
    label: choice.displayName,
    description: choice.shortDescription,
    destination: choice.destinationId,
    callback: {
      kind: "navigate_place",
      placeId: choice.destinationId,
    },
    confidence: choice.confidence,
  }));
  return registerPendingChoice({
    type: "estate_navigation",
    choices: items,
    menuText: input.menuText,
    activeIntent: input.queryPhrase,
    offeredAtTurn: input.offeredAtTurn,
  });
}

export function registerPendingChoiceFromAssistantText(
  assistantText: string,
  offeredAtTurn?: number,
): PendingChoiceState | null {
  const placeIds = extractPlaceIdsFromNumberedAssistantMenu(assistantText);
  if (placeIds.length >= 2) {
    return registerPendingChoiceFromPlaceIds({
      placeIds,
      menuText: assistantText,
      offeredAtTurn,
    });
  }
  return null;
}

export function shouldClearPendingChoiceForTopicChange(userText: string): boolean {
  const trimmed = userText.trim();
  if (!trimmed) return false;
  if (CANCEL_RE.test(trimmed)) return true;
  if (TOPIC_CHANGE_RE.test(trimmed)) return true;
  if (isEmotionalSupportThread(trimmed)) return true;
  if (trimmed.split(/\s+/).length >= 8 && !isLikelyMenuSelectionInput(trimmed, 4)) {
    return true;
  }
  return false;
}

export function resolvePendingChoiceTurn(
  userText: string,
  context?: {
    lastAssistantText?: string;
    currentTurn?: number;
  },
): PendingChoiceResolveResult {
  const state = loadPendingChoice();
  if (!state?.choices.length) return { kind: "none" };

  const trimmed = userText.trim();
  if (!trimmed) return { kind: "none" };

  if (CANCEL_RE.test(trimmed)) {
    clearPendingChoice();
    return { kind: "cancelled", reply: "No problem — we can stay right here." };
  }

  if (isCreateWorkflowContinuation(trimmed) && loadUniversalCreationSession()) {
    clearPendingChoice();
    return { kind: "topic_change" };
  }

  if (hasHardEstateNavigationIntent(trimmed)) {
    clearPendingChoice();
    return { kind: "topic_change" };
  }

  if (isPendingMenuMetaQuestion(trimmed)) {
    return {
      kind: "continued",
      reply: buildMenuMetaReply(state),
      menuText: state.menuText,
    };
  }

  if (isPendingMenuExpansionRequest(trimmed)) {
    const expanded = buildExpandedPlaceMenu(state);
    if (expanded) {
      if (expanded.placeIds.length >= 2 && expanded.menuText !== state.menuText) {
        registerPendingChoiceFromPlaceIds({
          placeIds: expanded.placeIds,
          menuText: expanded.menuText,
          offeredAtTurn: state.offeredAtTurn,
        });
        return {
          kind: "expanded",
          reply: expanded.reply,
          menuText: expanded.menuText,
        };
      }
      return {
        kind: "continued",
        reply: expanded.reply,
        menuText: state.menuText,
      };
    }
  }

  if (isPendingMenuAffirmation(trimmed)) {
    if (
      context?.lastAssistantText &&
      recentAssistantOfferOverridesPendingMenu({
        userText: trimmed,
        lastAssistantText: context.lastAssistantText,
        menuOfferedAtTurn: state.offeredAtTurn,
        currentTurn: context.currentTurn,
      })
    ) {
      clearPendingChoice();
      return { kind: "topic_change" };
    }
    return {
      kind: "continued",
      reply: buildMenuAffirmationReply(state),
      menuText: state.menuText,
    };
  }

  const selected = parsePendingChoiceSelection(trimmed, state.choices);
  if (selected) {
    clearPendingChoice();
    return {
      kind: "resolved",
      choice: selected,
      action: selected.callback,
      reply: ackForPendingChoiceAction(selected.callback),
    };
  }

  // Named place outside the menu (or alias) — leave pending and route as navigation.
  const namedPlaceId = resolveEstatePlaceIdFromUserText(trimmed);
  if (namedPlaceId) {
    const inMenu = state.choices.find(
      (choice) =>
        choice.destination === namedPlaceId ||
        choice.id === namedPlaceId ||
        choice.callback.placeId === namedPlaceId,
    );
    if (inMenu) {
      clearPendingChoice();
      return {
        kind: "resolved",
        choice: inMenu,
        action: inMenu.callback,
        reply: ackForPendingChoiceAction(inMenu.callback),
      };
    }
    clearPendingChoice();
    return { kind: "topic_change" };
  }

  if (shouldClearPendingChoiceForTopicChange(trimmed)) {
    clearPendingChoice();
    return { kind: "topic_change" };
  }

  if (isLikelyMenuSelectionInput(trimmed, state.choices.length)) {
    const menuText = formatMenuReplay(state);
    return {
      kind: "unrecognized",
      reply: `${UNRECOGNIZED_REPLY}\n\n${menuText}`,
      menuText,
    };
  }

  clearPendingChoice();
  return { kind: "topic_change" };
}

export function pendingChoiceHintForChat(state: PendingChoiceState): string {
  return [
    "PENDING CHOICE (mandatory): Member is answering a numbered menu — NOT a new conversation.",
    `Menu type: ${state.pendingChoiceType}.`,
    `Options: ${state.choices.map((c) => c.label).join(" · ")}.`,
    "Resolve the selection and execute — do not re-route through discovery or home.",
  ].join("\n");
}

export {
  clearPendingChoice,
  hasActivePendingChoice,
  loadPendingChoice,
} from "./manager";

export { parsePendingChoiceSelection, isLikelyMenuSelectionInput } from "./parseSelection";

export { pendingChoiceActionFromCapability, ackForPendingChoiceAction } from "./capabilityAction";
