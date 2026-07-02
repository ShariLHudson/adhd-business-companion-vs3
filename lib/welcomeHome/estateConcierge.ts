/**
 * Welcome Home Estate Concierge™ — universal front door orchestration.
 *
 * Flow: Understand → Memory (delegated) → Estate Intelligence → Router
 * Reuses existing engines — no duplicate routing logic.
 *
 * @see docs/WELCOME_HOME_ESTATE_CONCIERGE.md
 */

import { evaluateCompanionNeedsIntelligence } from "@/lib/companionNeedsIntelligence";
import type { EmotionalState } from "@/lib/companionEmotions";
import type { AppSection } from "@/lib/companionUi";
import {
  evaluateEstateIntelligence,
  estateIntelligenceHintForChat,
  latentJourneyHintForChat,
  latentJourneySteps,
  decideEstateRouterMode,
} from "@/lib/estateIntelligence";
import type { EstateIntelligenceEvaluation } from "@/lib/estateIntelligence/types";
import type { IntentCategory } from "@/lib/intentRoutingIntelligence";
import { CONVERSATION_FRONT_DOOR_PRINCIPLE } from "@/lib/sparkEstateRooms/types";

export type WelcomeHomeConciergeInput = {
  userText: string;
  activeSection?: AppSection | null;
  workspacePanel?: string | null;
  emotionalState?: EmotionalState | string | null;
  overwhelmed?: boolean;
  intentCategory?: IntentCategory | null;
  /** True when member has prior conversation in session. */
  hasConversationHistory?: boolean;
};

export type WelcomeHomeConciergeEvaluation = {
  estate: EstateIntelligenceEvaluation;
  needsSummary: string | null;
  routerMode: ReturnType<typeof decideEstateRouterMode>;
  evaluatedAt: string;
};

export function evaluateWelcomeHomeConcierge(
  input: WelcomeHomeConciergeInput,
): WelcomeHomeConciergeEvaluation {
  const needs = evaluateCompanionNeedsIntelligence({
    text: input.userText,
    emotionalState: input.emotionalState as EmotionalState | undefined,
    cognitiveLoadLevel: input.overwhelmed ? "overloaded" : undefined,
    recoveryGentle: input.overwhelmed ? true : undefined,
    userIntent: undefined,
  });

  const estate = evaluateEstateIntelligence({
    userText: input.userText,
    activeSection: input.activeSection ?? "home",
    workspacePanel: input.workspacePanel,
    emotionalState:
      typeof input.emotionalState === "string"
        ? input.emotionalState
        : input.emotionalState ?? null,
    overwhelmed: input.overwhelmed,
    intentCategory: input.intentCategory,
  });

  const routerMode = decideEstateRouterMode(estate);

  return {
    estate,
    needsSummary: needs.confidence !== "low" ? needs.summary : null,
    routerMode,
    evaluatedAt: new Date().toISOString(),
  };
}

/** Mandatory concierge hint — top of intentHint stack on Welcome Home. */
export function welcomeHomeConciergeHintForChat(
  evaluation: WelcomeHomeConciergeEvaluation | null | undefined,
  options?: { hasConversationHistory?: boolean },
): string | null {
  if (!evaluation) return null;

  const lines = [
    "WELCOME HOME ESTATE CONCIERGE (mandatory — not a generic chat page):",
    "You are the front door to the entire Spark Estate™. The member describes what they need; Spark knows where it belongs.",
    CONVERSATION_FRONT_DOOR_PRINCIPLE,
    "",
    "CONVERSATION FLOW (invisible to member):",
    "1. Understand intent, emotion, urgency — one thoughtful response.",
    "2. Memory and business context are already in this request — never make them repeat themselves.",
    "3. Estate capability first when the Registry matches — general AI knowledge is second.",
    "4. Route invisibly — invitation, never forced navigation.",
    "",
    "FORBIDDEN: menus, room directories, 'Open X', dictionary definitions of Estate capabilities.",
    "PREFERRED: \"I think I know exactly where we should go.\" · \"This is something [Place]™ was designed for.\" · \"Would you like me to take you there?\"",
  ];

  if (evaluation.needsSummary) {
    lines.push("", `Companion Needs (quiet): ${evaluation.needsSummary}`);
  }

  lines.push("", `Router mode: ${evaluation.routerMode.mode}`);

  const estateHint = estateIntelligenceHintForChat(evaluation.estate);
  if (estateHint) {
    lines.push("", estateHint);
  } else if (evaluation.routerMode.mode === "conversation_first") {
    lines.push(
      "",
      "No strong Estate match yet — stay in conversation. Understand before suggesting a destination.",
    );
  }

  const latent = latentJourneySteps(evaluation.estate.route);
  const journeyHint = latentJourneyHintForChat(latent);
  if (journeyHint) {
    lines.push("", journeyHint);
  }

  if (!options?.hasConversationHistory) {
    lines.push(
      "",
      "Continuity: acknowledge who they are building for if business context exists — never feel like a cold start.",
    );
  }

  return lines.join("\n");
}
