/**
 * Ecosystem Intent Layer — map underlying needs to registered capabilities.
 * Never compete with built tools via generic chat advice.
 */

import type { AppSection } from "./companionUi";
import {
  capabilityRoutingHintForChat,
  matchRegisteredCapabilityForText,
} from "./companionCapabilityRegistry";

export type EcosystemIntentMatch = {
  section: AppSection;
  featureLabel: string;
  userProblem: string;
  whyItHelps: string;
  offerLine: string;
  workflowKind:
    | "open_clear_my_mind"
    | "open_decision_compass"
    | "open_plan_my_day"
    | "open_adjust_my_day"
    | "open_workspace";
};

/**
 * Detect problem-state intents via capability registry (permission-first).
 */
export function detectEcosystemProblemIntent(
  text: string,
): EcosystemIntentMatch | null {
  return matchRegisteredCapabilityForText(text);
}

export function ecosystemIntentToWorkspaceOffer(
  match: EcosystemIntentMatch,
): { section: AppSection; buttonLabel: string; line: string } {
  return {
    section: match.section,
    buttonLabel: `Open ${match.featureLabel}`,
    line: match.offerLine,
  };
}

/** Injected when API handles a message that maps to an ecosystem feature. */
export function companionEcosystemRoutingHintForChat(text: string): string | null {
  return capabilityRoutingHintForChat(text);
}
