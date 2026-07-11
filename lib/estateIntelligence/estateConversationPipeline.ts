/**
 * Estate Conversation Pipeline — single evaluation + hint path for all Estate rooms.
 * Welcome Home, Momentum Builder, Peaceful Places, and frosted-chat destinations
 * delegate here instead of parallel routing trees.
 */

import type { EmotionalState } from "@/lib/companionEmotions";
import type { AppSection } from "@/lib/companionUi";
import type { IntentCategory } from "@/lib/intentRoutingIntelligence";
import type { WorkspaceOffer } from "@/lib/workspaceMode";
import {
  evaluateWelcomeHomeConcierge,
  welcomeHomeConciergeHintForChat,
  type WelcomeHomeConciergeEvaluation,
} from "@/lib/welcomeHome/estateConcierge";
import { evaluateEstateIntelligence } from "./estateIntelligence";
import { estateIntelligenceHintForChat } from "./estateHintForChat";
import { latentJourneyHintForChat, latentJourneySteps } from "./estateJourneyHooks";
import { buildEstateInvitation } from "./estateRouter";
import { estateRegistryEntryById } from "./estateRegistry";
import {
  estateHighConfidenceRoutingActive,
  shouldSuppressGenericFeatureHints,
  workspaceOfferFromEstateEvaluation,
} from "./estateOffer";
import {
  ESTATE_BEHAVIORAL_RULES_BLOCK,
  ESTATE_ROOM_ENTRY_HINT,
  ESTATE_ROOM_EXIT_HINT,
} from "./estateRoomLifecycle";
import type { EstateIntelligenceEvaluation } from "./types";
import { directEstateNavigationHintForChat } from "./estateCommandRouter";
import { shariCompanionHintForChat } from "@/lib/conversation/shariCompanionEngine";

export type EstateConversationTurnInput = {
  userText: string;
  activeSection: AppSection | null;
  workspacePanel?: string | null;
  emotionalState?: EmotionalState | string | null;
  overwhelmed?: boolean;
  intentCategory?: IntentCategory | null;
  /** Welcome Home front door — wraps needs + estate concierge. */
  welcomeHomePrimary?: boolean;
  hasConversationHistory?: boolean;
  /** Frosted-chat estate context (no workspace panel / split). */
  frostedChatContext?: boolean;
};

export type EstateConversationTurnEvaluation = {
  concierge: WelcomeHomeConciergeEvaluation | null;
  estate: EstateIntelligenceEvaluation;
  estateRoutingActive: boolean;
  suppressGenericFeatureHints: boolean;
  workspaceOffer: WorkspaceOffer | null;
};

export function evaluateEstateConversationTurn(
  input: EstateConversationTurnInput,
): EstateConversationTurnEvaluation | null {
  if (!input.frostedChatContext && !input.welcomeHomePrimary) {
    return null;
  }

  const emotionalLabel =
    typeof input.emotionalState === "string"
      ? input.emotionalState
      : input.emotionalState ?? null;

  const concierge =
    input.welcomeHomePrimary
      ? evaluateWelcomeHomeConcierge({
          userText: input.userText,
          activeSection: input.activeSection ?? "home",
          workspacePanel: input.workspacePanel,
          emotionalState: input.emotionalState as EmotionalState | undefined,
          overwhelmed: input.overwhelmed,
          intentCategory: input.intentCategory,
        })
      : null;

  const estate =
    concierge?.estate ??
    evaluateEstateIntelligence({
      userText: input.userText,
      activeSection: input.activeSection,
      workspacePanel: input.workspacePanel,
      emotionalState: emotionalLabel,
      overwhelmed: input.overwhelmed,
      intentCategory: input.intentCategory,
    });

  return {
    concierge,
    estate,
    estateRoutingActive: estateHighConfidenceRoutingActive(estate),
    suppressGenericFeatureHints: shouldSuppressGenericFeatureHints(estate),
    workspaceOffer: workspaceOfferFromEstateEvaluation(estate),
  };
}

export function estateEmotionalAlignmentHint(
  evaluation: EstateIntelligenceEvaluation | null | undefined,
  input?: { overwhelmed?: boolean; emotionalState?: string | null },
): string | null {
  const overwhelmed =
    input?.overwhelmed ||
    input?.emotionalState === "overwhelmed" ||
    /\boverwhelm/i.test(evaluation?.userText ?? "");
  const calm =
    input?.emotionalState === "calm" ||
    /\b(?:calm|peace|quiet|breathe)\b/i.test(evaluation?.userText ?? "");
  const curious =
    /\b(?:research|learn|curious|explore)\b/i.test(evaluation?.userText ?? "");

  if (overwhelmed) {
    return [
      "EMOTIONAL ALIGNMENT: overwhelmed — simplify, one step, reduce choices.",
      "Prefer Momentum Builder or Clear My Mind when Estate matches.",
    ].join("\n");
  }
  if (calm) {
    return "EMOTIONAL ALIGNMENT: calm — exploration allowed; gentle invitations only.";
  }
  if (curious) {
    return "EMOTIONAL ALIGNMENT: curious — Observatory / Library when Estate matches.";
  }
  return null;
}

export function estateInRoomBehaviorHint(
  evaluation: EstateIntelligenceEvaluation,
): string {
  const entry = evaluation.bestMatch?.entry;
  const lines = [
    "ESTATE IN-ROOM (mandatory):",
    entry
      ? `Member is already in ${entry.name}. Never explain what this room is.`
      : "Member is in an Estate room. Never explain what this room is.",
    ESTATE_ROOM_ENTRY_HINT,
    ESTATE_ROOM_EXIT_HINT,
  ];

  const route =
    evaluation.route ??
    (entry
      ? {
          primaryEntry: entry,
          invitation: buildEstateInvitation(entry),
          primarySection: entry.primarySection ?? null,
          suppressGenericDefinition: false,
        }
      : null);
  const journey = latentJourneyHintForChat(latentJourneySteps(route));
  if (journey) lines.push(journey);

  return lines.join("\n\n");
}

export type EstateConversationHintOptions = {
  hasConversationHistory?: boolean;
  /** Room-specific coaching hint (Momentum Builder, etc.) — merged when in-room. */
  inRoomHint?: string | null;
  overwhelmed?: boolean;
  emotionalState?: string | null;
  /** Current user message — when explicit go-to-room, overrides invitation hints. */
  userText?: string | null;
  /** Quiet memory — member dislikes conflict */
  memberDislikesConflict?: boolean;
};

/**
 * Unified per-turn hint — replaces parallel welcome/estate/room hint branches.
 */
export function estateConversationHintForChat(
  turn: EstateConversationTurnEvaluation | null | undefined,
  options?: EstateConversationHintOptions,
): string | null {
  if (!turn) return null;

  const directNavHint = options?.userText
    ? directEstateNavigationHintForChat(options.userText)
    : null;
  if (directNavHint) {
    return [ESTATE_BEHAVIORAL_RULES_BLOCK, directNavHint].join("\n\n");
  }

  const parts: string[] = [ESTATE_BEHAVIORAL_RULES_BLOCK];

  const shariHint = options?.userText?.trim()
    ? shariCompanionHintForChat({
        userText: options.userText,
        memberDislikesConflict: options.memberDislikesConflict,
      })
    : null;

  const emotional = estateEmotionalAlignmentHint(turn.estate, {
    overwhelmed: options?.overwhelmed,
    emotionalState: options?.emotionalState,
  });
  if (emotional) parts.push(emotional);

  if (turn.concierge) {
    const conciergeHint = welcomeHomeConciergeHintForChat(turn.concierge, {
      hasConversationHistory: options?.hasConversationHistory,
    });
    if (shariHint) parts.push(shariHint);
    if (conciergeHint) parts.push(conciergeHint);
    return parts.join("\n\n");
  }

  if (turn.estate.suppressed && turn.estate.bestMatch) {
    parts.push(estateInRoomBehaviorHint(turn.estate));
    if (shariHint) parts.push(shariHint);
    if (options?.inRoomHint) parts.push(options.inRoomHint);
    return parts.join("\n\n");
  }

  const estateHint = estateIntelligenceHintForChat(turn.estate, {
    userText: options?.userText,
    memberDislikesConflict: options?.memberDislikesConflict,
  });
  if (estateHint) parts.push(estateHint);
  if (options?.inRoomHint) parts.push(options.inRoomHint);

  return parts.filter(Boolean).join("\n\n");
}
