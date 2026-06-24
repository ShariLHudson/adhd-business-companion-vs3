/**
 * Ecosystem Intent Layer — map underlying needs to registered capabilities.
 * Never compete with built tools via generic chat advice.
 */

import type { AppSection } from "./companionUi";
import {
  companionEntryLayerHintForChat,
  shouldDeferKeywordWorkspaceOffer,
  explainFirstOfferForSection,
  formatExplainFirstOfferMessage,
} from "./companionEntry";
import {
  capabilityRoutingHintForChat,
  matchRegisteredCapabilityForText,
} from "./companionCapabilityRegistry";
import { strategyIntelligenceHintForChat } from "./strategyIntelligence";

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
  if (shouldDeferKeywordWorkspaceOffer(text)) return null;
  return matchRegisteredCapabilityForText(text);
}

export function ecosystemIntentToWorkspaceOffer(
  match: EcosystemIntentMatch,
): { section: AppSection; buttonLabel: string; line: string } {
  const explain = explainFirstOfferForSection(
    match.section,
    match.featureLabel,
    match.whyItHelps,
  );
  return {
    section: match.section,
    buttonLabel: `Open ${match.featureLabel}`,
    line: formatExplainFirstOfferMessage(explain),
  };
}

/** Injected when API handles a message that maps to an ecosystem feature. */
export function companionEcosystemRoutingHintForChat(text: string): string | null {
  const entryHint = companionEntryLayerHintForChat(text);
  if (entryHint) return entryHint;

  if (shouldDeferKeywordWorkspaceOffer(text)) return null;

  return [capabilityRoutingHintForChat(text), strategyIntelligenceHintForChat(text)]
    .filter(Boolean)
    .join("\n\n") || null;
}
