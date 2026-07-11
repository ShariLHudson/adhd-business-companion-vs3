/**
 * Estate Concierge — best experience for what the member is trying to accomplish.
 *
 * Consults the capability registry first. Sometimes route, sometimes stay in chat,
 * sometimes recommend 2–4 paths — always the simplest helpful experience.
 */

import { consultEstateCapabilities, consultBestCapability } from "./consult";
import { capabilityById } from "./catalog";
import {
  formatRecommendationLine,
  recommendCapabilitiesForGoal,
} from "./goalRecommendations";
import {
  conversationStateHint,
  readConversationState,
  setActiveCapability,
  setConversationGoal,
} from "./conversationState";
import type {
  EstateCapabilityEntry,
  EstateConciergeDecision,
} from "./types";

const EXPLICIT_NAV_RE =
  /\b(?:take me to|bring me to|go to|open|show me the|step into)\b/i;

const CREATION_RE =
  /\b(?:help me (?:create|write|build|make|draft)|create|write|draft|build)\b/i;

export type EstateConciergeInput = {
  userText: string;
  currentRoomId?: string | null;
  /** Skip recommendations when member gave a direct command */
  isDirectCommand?: boolean;
};

function roomNeeded(
  capability: EstateCapabilityEntry,
  currentRoomId: string | null,
): boolean {
  /**
   * #183 Universal Access — requiredRoomId is recommendation context only.
   * Never treat a different room as a permission block.
   */
  void capability;
  void currentRoomId;
  return false;
}

function singleCapabilityLine(
  capability: EstateCapabilityEntry,
  launchDiscovery: boolean,
): string {
  if (launchDiscovery) {
    return `Let's create your ${capability.name} — I'll ask only what we need, one question at a time.`;
  }
  /** #183 — rooms recommend; never imply the member must go elsewhere first. */
  if (capability.requiredRoomId) {
    return `${capability.purpose} I can open ${capability.name} right here, or we can use the ${capability.requiredRoomId.replace(/-/g, " ")} atmosphere if you prefer.`;
  }
  return capability.purpose;
}

/** Core concierge decision — always after registry consult. */
export function resolveEstateConcierge(
  input: EstateConciergeInput,
): EstateConciergeDecision | null {
  const userText = input.userText.trim();
  if (!userText) return null;

  const state = readConversationState();
  const currentRoomId =
    input.currentRoomId ?? state.currentRoomId ?? null;

  if (input.isDirectCommand || EXPLICIT_NAV_RE.test(userText)) {
    const best = consultBestCapability(userText);
    if (!best) return null;
    return {
      kind: "single",
      capability: best,
      line: `I'll take you to ${best.name}.`,
      launchDiscovery: best.requiresDiscovery && CREATION_RE.test(userText),
    };
  }

  const goalRecs = recommendCapabilitiesForGoal(userText, { limit: 4 });
  if (goalRecs && goalRecs.options.length >= 2) {
    setConversationGoal(goalRecs.goalSummary);
    return {
      kind: "recommend",
      goalSummary: goalRecs.goalSummary,
      options: goalRecs.options,
      line: formatRecommendationLine(
        goalRecs.goalSummary,
        goalRecs.options,
      ),
    };
  }

  const matches = consultEstateCapabilities(userText, { minScore: 45, limit: 3 });
  if (!matches.length) return null;

  const [top, second] = matches;
  if (
    second &&
    top.score - second.score < 12 &&
    top.entry.canRecommend &&
    second.entry.canRecommend &&
    !CREATION_RE.test(userText)
  ) {
    const options = [top.entry, second.entry]
      .filter((e) => e.canRecommend)
      .slice(0, 4)
      .map((e) => ({
        capabilityId: e.id,
        name: e.name,
        reason: e.purpose,
        roomId: e.requiredRoomId,
      }));
    if (options.length >= 2) {
      return {
        kind: "recommend",
        goalSummary: "what you described",
        options,
        line: formatRecommendationLine("what you described", options),
      };
    }
  }

  const capability = top.entry;
  setActiveCapability(capability.id, {
    currentTask: capability.name,
    conversationGoal: capability.purpose,
  });

  const launchDiscovery =
    capability.requiresDiscovery && CREATION_RE.test(userText);

  if (
    !roomNeeded(capability, currentRoomId) &&
    !launchDiscovery &&
    capability.canLaunchDirectly
  ) {
    return {
      kind: "stay_in_chat",
      capability,
      line: `${capability.purpose} We can start right here.`,
    };
  }

  return {
    kind: "single",
    capability,
    line: singleCapabilityLine(capability, launchDiscovery),
    launchDiscovery,
  };
}

export function estateConciergeResponseHint(
  decision: EstateConciergeDecision,
): string {
  const continuity = conversationStateHint();
  const base =
    decision.kind === "recommend"
      ? "Offer 2–4 numbered choices. One question. Member chooses — never overwhelm."
      : decision.kind === "stay_in_chat"
        ? "Stay in conversation. Do not navigate unless member asks."
        : decision.launchDiscovery
          ? "Discovery Mode: one thoughtful question at a time. Stop when enough exists."
          : "Route to the best experience. Permission before showing drafts.";
  return [base, continuity].filter(Boolean).join("\n\n");
}

export function capabilityForConciergeChoice(
  choiceText: string,
): EstateCapabilityEntry | null {
  const trimmed = choiceText.trim();
  if (/^\d\b/.test(trimmed)) return null;
  return consultBestCapability(trimmed);
}

export function resolveCapabilityFromNumberedChoice(
  choiceIndex: number,
  options: { capabilityId: string }[],
): EstateCapabilityEntry | null {
  const pick = options[choiceIndex - 1];
  return pick ? capabilityById(pick.capabilityId) : null;
}
