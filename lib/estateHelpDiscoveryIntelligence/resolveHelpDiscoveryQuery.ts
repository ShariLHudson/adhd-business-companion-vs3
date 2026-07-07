/**
 * Spark Estate™ Help & Discovery Intelligence Layer
 *
 * Orchestrates: Navigation · Recommendation · Object · How-To · Discovery Key · Progressive discovery
 */

import { getEstateLocationById } from "@/lib/estateKnowledgeBase/estateLocations";
import {
  resolveEstateNavigationIntent,
  shouldNavigateFromDecision,
} from "@/lib/estateNavigationIntelligence";
import {
  isResolvedObjectIntent,
  resolveObjectIntent,
} from "@/lib/estateObjectIntelligence";
import {
  isResolvedEstateRecommendation,
  resolveEstateRecommendation,
} from "@/lib/estateRecommendationIntelligence";
import {
  isResolvedAudioExperience,
  resolveAudioExperienceQuery,
} from "@/lib/estateAudioExperienceFoundation";
import { classifyHelpDiscoveryIntent } from "./classifyHelpDiscoveryIntent";
import {
  formatDiscoveryNoteResponse,
  pickDiscoveryForMember,
} from "./discoveryLibraryBridge";
import {
  createEmptyMemberJourneyProgress,
  formatJourneyDiscoveryResponse,
  pickJourneyDiscovery,
  buildDiscoveryMemberContextFromJourney,
} from "@/lib/estateProgressiveDiscoveryJourney";
import {
  formatFeatureHowToResponse,
  matchFeatureHowToGuide,
} from "./featureHowTo";
import {
  buildProgressiveDiscoveryItems,
  formatCapabilityOverviewResponse,
  formatProgressiveDiscoveryResponse,
} from "./progressiveDiscovery";
import type { HelpDiscoveryContext, HelpDiscoveryDecision } from "./types";

const SHOW_SOMETHING_NEW_RE =
  /\b(?:show me something new|what haven't i explored|something i haven't)\b/i;

/**
 * Route member help/discovery questions to the correct intelligence system.
 */
export function resolveHelpDiscoveryQuery(
  query: string,
  context: HelpDiscoveryContext = {},
): HelpDiscoveryDecision {
  const trimmed = query.trim();
  const unresolved: HelpDiscoveryDecision = {
    kind: "unresolved",
    query: trimmed,
    route: "capability_overview",
    reason: "not_help_discovery_query",
  };

  if (!trimmed) return unresolved;

  const classification = classifyHelpDiscoveryIntent(trimmed);
  if (!classification) return unresolved;

  const { route, matchedPhrase } = classification;

  if (route === "audio") {
    const audioDecision = resolveAudioExperienceQuery(trimmed, {
      currentLocationId: context.currentLocationId,
    });
    if (!isResolvedAudioExperience(audioDecision)) {
      return { ...unresolved, route, reason: "audio_unresolved" };
    }
    return {
      kind: "resolved",
      query: trimmed,
      route,
      matchedPhrase,
      audioExperiences: audioDecision.experiences,
      memberFacingResponse: audioDecision.memberFacingResponse,
      offerNavigation: audioDecision.offerNavigation,
      reason: audioDecision.reason,
    };
  }

  if (route === "object") {
    const objectResolution = resolveObjectIntent(trimmed, {
      currentLocationId: context.currentLocationId,
    });
    if (!isResolvedObjectIntent(objectResolution)) {
      return { ...unresolved, route, reason: "object_unresolved" };
    }
    return {
      kind: "resolved",
      query: trimmed,
      route,
      matchedPhrase,
      objectResolution,
      memberFacingResponse: objectResolution.memberFacingAnswer,
      reason: "object_intelligence",
    };
  }

  if (route === "feature_how_to") {
    const match = matchFeatureHowToGuide(trimmed);
    if (!match) {
      return {
        kind: "resolved",
        query: trimmed,
        route,
        memberFacingResponse:
          "Tell me what you're trying to do — settings, reminders, Clear My Mind, or something else — and I'll walk you through it.",
        reason: "how_to_clarification",
      };
    }
    return {
      kind: "resolved",
      query: trimmed,
      route,
      matchedPhrase: match.matchedPhrase,
      howToGuide: match.guide,
      memberFacingResponse: formatFeatureHowToResponse(match.guide),
      offerNavigation: match.guide.offerNavigation,
      navigationPlaceId: match.guide.targetId,
      reason: "feature_how_to",
    };
  }

  if (route === "location") {
    const navigation = resolveEstateNavigationIntent(trimmed);
    if (navigation.kind === "unresolved") {
      return { ...unresolved, route, reason: "location_unresolved" };
    }

    const whereOnly = /\bwhere is\b/i.test(trimmed);
    let memberFacingResponse: string | undefined;
    let offerNavigation = false;
    let navigationPlaceId: string | undefined;

    if (shouldNavigateFromDecision(navigation)) {
      const name =
        navigation.choices?.[0]?.officialDisplayName ?? "that place";
      const hint = navigation.choices?.[0]?.memberFacingHint;
      navigationPlaceId = navigation.placeId;
      offerNavigation = true;

      if (whereOnly) {
        memberFacingResponse = hint
          ? `${name} is here on the Estate — ${hint}. Would you like me to take you there?`
          : `That's ${name}. Would you like me to take you there?`;
      } else {
        memberFacingResponse = hint
          ? `I'll take you to ${name} — ${hint}.`
          : `I'll take you to ${name}.`;
      }
    } else if (navigation.memberFacingPrompt) {
      memberFacingResponse = navigation.memberFacingPrompt;
    } else if (navigation.clarificationQuestion) {
      memberFacingResponse = navigation.clarificationQuestion;
    }

    return {
      kind: "resolved",
      query: trimmed,
      route,
      matchedPhrase,
      navigation,
      memberFacingResponse,
      offerNavigation,
      navigationPlaceId,
      reason: whereOnly ? "location_where_is" : "navigation_intelligence",
    };
  }

  if (route === "discovery") {
    if (SHOW_SOMETHING_NEW_RE.test(trimmed)) {
      const progress =
        context.journeyProgress ??
        createEmptyMemberJourneyProgress(context.memberId ?? "anonymous");

      if (context.historyStore && context.memberId) {
        const journeyPick = pickJourneyDiscovery({
          progress,
          memberContext: buildDiscoveryMemberContextFromJourney(progress),
          historyStore: context.historyStore,
          currentRoomId: context.currentLocationId,
        });
        if (journeyPick) {
          return {
            kind: "resolved",
            query: trimmed,
            route,
            matchedPhrase,
            discoveryNote: {
              id: journeyPick.discoveryId,
              title: journeyPick.title,
              subtitle: null,
              discoveryText: journeyPick.discoveryText,
              whyItMatters: journeyPick.whyItMatters,
              targetId: journeyPick.discoveryId,
              destinationRoute: null,
            },
            memberFacingResponse: formatJourneyDiscoveryResponse(journeyPick),
            reason: "progressive_discovery_journey",
          };
        }
      }

      const note = pickDiscoveryForMember(context.exploredDiscoveryIds);
      if (note) {
        return {
          kind: "resolved",
          query: trimmed,
          route,
          matchedPhrase,
          discoveryNote: note,
          memberFacingResponse: formatDiscoveryNoteResponse(note),
          offerNavigation: Boolean(note.destinationRoute),
          navigationPlaceId: note.targetId,
          reason: "discovery_key",
        };
      }
    }

    const progressive = buildProgressiveDiscoveryItems(context);
    if (progressive) {
      return {
        kind: "resolved",
        query: trimmed,
        route,
        matchedPhrase,
        progressiveItems: progressive.items,
        memberFacingResponse: formatProgressiveDiscoveryResponse(
          progressive.intro,
          progressive.items,
        ),
        reason: "progressive_discovery",
      };
    }

    return {
      ...unresolved,
      route,
      reason: "discovery_empty",
    };
  }

  if (route === "experience") {
    const recommendation = resolveEstateRecommendation(trimmed, {
      currentLocationId: context.currentLocationId,
    });
    if (!isResolvedEstateRecommendation(recommendation)) {
      return { ...unresolved, route, reason: "experience_unresolved" };
    }
    return {
      kind: "resolved",
      query: trimmed,
      route,
      matchedPhrase,
      recommendation,
      memberFacingResponse: recommendation.memberFacingInvitation,
      reason: "recommendation_intelligence",
    };
  }

  if (route === "capability_overview") {
    const location = context.currentLocationId
      ? getEstateLocationById(context.currentLocationId)
      : null;
    const progressive = buildProgressiveDiscoveryItems(context);
    return {
      kind: "resolved",
      query: trimmed,
      route,
      matchedPhrase,
      progressiveItems: progressive?.items,
      memberFacingResponse: formatCapabilityOverviewResponse(
        context,
        location?.officialDisplayName,
      ),
      reason: "capability_overview",
    };
  }

  return unresolved;
}

export function isResolvedHelpDiscovery(
  decision: HelpDiscoveryDecision,
): decision is HelpDiscoveryDecision & {
  memberFacingResponse: string;
} {
  return decision.kind === "resolved" && Boolean(decision.memberFacingResponse);
}
