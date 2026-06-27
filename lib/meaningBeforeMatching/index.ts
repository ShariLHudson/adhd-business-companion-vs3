/**
 * Meaning Before Matching — understand intent before routing.
 * A word is not an intent.
 */

export {
  ROUTING_CONFIDENCE_THRESHOLD,
  evaluateIntegrationIntent,
  shouldRouteToConnectionsSettings,
  type IntegrationIntentResult,
} from "./integrationIntent";

export {
  PROBLEM_WORDS,
  containsProblemWord,
  isSingleProblemWordMessage,
  shouldBlockSingleKeywordWorkspaceRoute,
  type ProblemWord,
} from "./ambiguousWords";

import { evaluateIntegrationIntent } from "./integrationIntent";
import { shouldBlockSingleKeywordWorkspaceRoute } from "./ambiguousWords";

export function meaningBeforeMatchingHintForChat(text: string): string | undefined {
  const integration = evaluateIntegrationIntent(text);
  if (integration.clarification && !integration.isIntegration) {
    return [
      "MEANING BEFORE MATCHING (mandatory):",
      `Ambiguous routing — ask briefly: "${integration.clarification}"`,
      "Do NOT open Connections or Google integrations until intent is clear.",
      "Honor the door they walked through: teach how-to, create artifacts, or connect accounts — never hijack on one word.",
    ].join("\n");
  }
  return undefined;
}

/** Test helper — resolves settings connections section or null. */
export function resolveConnectionsRouteLabel(text: string): "connections" | null {
  return evaluateIntegrationIntent(text).isIntegration ? "connections" : null;
}

/** Guard workspace auto-routing from bare problem words. */
export function allowWorkspaceAutoRoute(text: string): boolean {
  return !shouldBlockSingleKeywordWorkspaceRoute(text);
}
