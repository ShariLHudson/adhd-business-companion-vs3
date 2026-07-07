/**
 * Estate Navigation Intelligence™ — resolve member intent to Estate destinations.
 *
 * Connects: Estate Knowledge Base™, aliases, experience groups, route validation.
 */

import { resolveLocationIntent } from "@/lib/estateKnowledgeBase/locationIntentResolution";
import type { LocationOption } from "@/lib/estateKnowledgeBase/types";
import { matchAmbiguousLocationTerm } from "./ambiguousLocations";
import {
  choicesFromOptions,
  formatNavigationChoicesPrompt,
  toNavigationChoice,
} from "./formatNavigationResponse";
import {
  filterValidatedNavigationTargets,
  validateEstateNavigationTarget,
} from "./routeValidation";
import type {
  EstateNavigationDecision,
  EstateNavigationIntentKind,
  EstateNavigationPreferences,
} from "./types";
import { SEMANTIC_DISCOVERY_SIGNAL_RE } from "@/lib/semanticIntentResolver/intentSignals";

const ESTATE_NAVIGATION_RE =
  /\b(?:take me to|go to|let(?:'s| us) go to|show me|visit|head to|bring me to|where can i|find me|i want somewhere|i need somewhere|somewhere (?:quiet|peaceful|still)|place to (?:think|reflect)|listen to music)\b/i;

/** Content retrieval — not Estate place navigation. */
const RETRIEVE_NOT_NAVIGATION_RE =
  /\bfind(?: me)?(?: a)?\s+(?:snippet|template|info(?:rmation)?|content|document|section|paragraph|quote|excerpt|passage|article)\b/i;

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function isEstateNavigationQuery(query: string): boolean {
  const normalized = normalize(query);
  if (!normalized) return false;
  if (SEMANTIC_DISCOVERY_SIGNAL_RE.test(normalized)) return false;
  if (/\bopen\s+(?:the\s+)?(?:reminders?|settings)\b/i.test(normalized)) {
    return false;
  }
  if (RETRIEVE_NOT_NAVIGATION_RE.test(normalized)) return false;
  if (
    /\bfind me\b/i.test(normalized) &&
    !/\b(?:place|room|somewhere|peaceful|quiet|spot)\b/i.test(normalized)
  ) {
    return false;
  }
  return ESTATE_NAVIGATION_RE.test(normalized);
}

function buildChoicesDecision(
  query: string,
  intentKind: EstateNavigationIntentKind,
  options: LocationOption[],
  opts: {
    matchedPhrase?: string;
    experienceGroup?: string;
    experienceGroupId?: string;
    intro: string;
    clarificationQuestion?: string;
  },
): EstateNavigationDecision {
  const validated = filterValidatedNavigationTargets(
    options.map((option) => option.locationId),
  );

  if (validated.length === 0) {
    return {
      kind: "need_clarification",
      query,
      intentKind,
      matchedPhrase: opts.matchedPhrase,
      clarificationQuestion:
        opts.clarificationQuestion ??
        "I want to make sure I take you to the right place — which part of the Estate did you have in mind?",
      reason: "no_validated_targets",
    };
  }

  const placeIdMap = new Map(
    validated.map((target) => [target.locationId, target.placeId]),
  );
  const choices = choicesFromOptions(
    validated.map((target) => target.option),
    placeIdMap,
  );

  if (choices.length === 1) {
    const only = validated[0]!;
    return {
      kind: "navigate_direct",
      query,
      intentKind,
      matchedPhrase: opts.matchedPhrase,
      experienceGroup: opts.experienceGroup,
      experienceGroupId: opts.experienceGroupId,
      placeId: only.placeId,
      locationId: only.locationId,
      choices: [toNavigationChoice(only)],
      memberFacingPrompt: undefined,
      reason: "single_validated_choice",
    };
  }

  return {
    kind: "offer_choices",
    query,
    intentKind,
    matchedPhrase: opts.matchedPhrase,
    experienceGroup: opts.experienceGroup,
    experienceGroupId: opts.experienceGroupId,
    choices,
    memberFacingPrompt: formatNavigationChoicesPrompt(opts.intro, choices),
    clarificationQuestion: opts.clarificationQuestion,
  };
}

function resolveFromKnowledgeBaseIntent(
  query: string,
): EstateNavigationDecision | null {
  const intent = resolveLocationIntent(query);

  if (intent.kind === "direct" && intent.directLocation) {
    const validation = validateEstateNavigationTarget(
      intent.directLocation.locationId,
    );
    if (!validation.ok) {
      return {
        kind: "need_clarification",
        query,
        intentKind: intent.matchedPhrase ? "alias_match" : "specific_location",
        matchedPhrase: intent.matchedPhrase,
        clarificationQuestion:
          "I want to take you there, but that space isn't quite ready yet. Would you like to stay here, or explore somewhere else on the Estate?",
        reason: validation.code,
      };
    }

    return {
      kind: "navigate_direct",
      query,
      intentKind: intent.matchedPhrase ? "alias_match" : "specific_location",
      matchedPhrase: intent.matchedPhrase,
      experienceGroup: intent.experienceGroup,
      experienceGroupId: intent.experienceGroupId,
      placeId: validation.target.placeId,
      locationId: validation.target.locationId,
      choices: [toNavigationChoice(validation.target)],
      reason: "knowledge_base_direct",
    };
  }

  if (intent.kind === "experience_options" && intent.options?.length) {
    return buildChoicesDecision(query, "experience_request", intent.options, {
      matchedPhrase: intent.matchedPhrase,
      experienceGroup: intent.experienceGroup,
      experienceGroupId: intent.experienceGroupId,
      intro: intent.experienceGroup
        ? `I have a few ${intent.experienceGroup.toLowerCase()} places you might enjoy:`
        : "I have a few places you might enjoy:",
    });
  }

  return null;
}

/**
 * Resolve natural language to a navigation decision.
 * Returns unresolved when the message is not an Estate navigation request.
 */
export function resolveEstateNavigationIntent(
  query: string,
  preferences?: EstateNavigationPreferences & { bypassIntentGate?: boolean },
): EstateNavigationDecision {
  const trimmed = query.trim();
  const base: EstateNavigationDecision = {
    kind: "unresolved",
    query: trimmed,
    intentKind: "unresolved",
    reason: "not_navigation_intent",
  };

  if (!trimmed) return base;

  if (!preferences?.bypassIntentGate && !isEstateNavigationQuery(trimmed)) {
    return base;
  }

  const ambiguous = matchAmbiguousLocationTerm(trimmed);
  if (ambiguous) {
    return buildChoicesDecision(
      trimmed,
      "ambiguous_location",
      ambiguous.options,
      {
        matchedPhrase: ambiguous.matchedPhrase,
        intro: ambiguous.term.memberFacingIntro,
        clarificationQuestion: ambiguous.term.clarificationQuestion,
      },
    );
  }

  const kb = resolveFromKnowledgeBaseIntent(trimmed);
  if (kb) return kb;

  return {
    kind: "need_clarification",
    query: trimmed,
    intentKind: "unresolved",
    clarificationQuestion:
      "I want to make sure I take you to the right place — what kind of space are you looking for?",
    reason: "no_match",
  };
}

/** True when navigation should execute immediately via goToPlace. */
export function shouldNavigateFromDecision(
  decision: EstateNavigationDecision,
): decision is EstateNavigationDecision & { placeId: string } {
  return decision.kind === "navigate_direct" && Boolean(decision.placeId);
}
