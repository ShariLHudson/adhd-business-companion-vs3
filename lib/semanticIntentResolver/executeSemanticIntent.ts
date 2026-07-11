/**
 * Execute a resolved semantic intent into member-facing runtime material.
 */

import {
  formatFeatureHowToResponse,
  getFeatureHowToGuides,
  matchFeatureHowToGuide,
} from "@/lib/estateHelpDiscoveryIntelligence/featureHowTo";
import {
  choicesFromOptions,
  formatNavigationChoicesPrompt,
} from "@/lib/estateNavigationIntelligence/formatNavigationResponse";
import {
  filterValidatedNavigationTargets,
} from "@/lib/estateNavigationIntelligence/routeValidation";
import {
  resolveObjectIntent,
  isResolvedObjectIntent,
} from "@/lib/estateObjectIntelligence/resolveObjectIntent";
import { getEstateLocationById } from "@/lib/estateKnowledgeBase/estateLocations";
import {
  pickDiscoveryForMember,
  formatDiscoveryNoteResponse,
} from "@/lib/estateHelpDiscoveryIntelligence/discoveryLibraryBridge";
import type { EstateIntelligenceRuntimeResult } from "@/lib/estateIntelligenceRuntime/types";
import type { HelpDiscoveryContext } from "@/lib/estateHelpDiscoveryIntelligence";
import {
  experienceChoicesForTarget,
  navigationTargetFromSemantic,
} from "./resolveTarget";
import type { SemanticMemberIntent } from "./types";
import { isResolvedSemanticIntent } from "./types";

const COMPANION_VOICE_HINT =
  "One trusted companion voice. Never mention routing, systems, menus, or intelligence layers.";

function kbHint(detail: string): string {
  return [COMPANION_VOICE_HINT, detail].join("\n");
}

export function executeSemanticIntent(
  intent: SemanticMemberIntent,
  userText: string,
  helpContext: HelpDiscoveryContext = {},
): EstateIntelligenceRuntimeResult | null {
  if (!isResolvedSemanticIntent(intent)) return null;

  if (intent.nextStep === "navigate" && intent.action === "navigate") {
    const navTarget = navigationTargetFromSemantic(intent.target);
    if (!navTarget?.placeId || !navTarget.locationId) return null;

    const location = getEstateLocationById(navTarget.locationId);
    const displayName =
      location?.officialDisplayName?.replace(/\u2122/g, "") ??
      navTarget.displayName ??
      "that place";

    return {
      capability: "navigation",
      knowledgeSource: "estate-aliases.json",
      category: "direct_action",
      localReply: `Taking you to ${displayName}.`,
      responseHint: kbHint(
        "Semantic navigation — member meaning clear. Navigate immediately.",
      ),
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      immediateEstatePlaceNavigate: {
        placeId: navTarget.placeId,
        navigationLine: `Taking you to ${displayName}.`,
        userText,
      },
    };
  }

  if (
    intent.nextStep === "answer_from_kb" &&
    intent.target.kind === "room" &&
    intent.action === "ask_knowledge"
  ) {
    const location = getEstateLocationById(intent.target.locationId!);
    if (!location) return null;
    const name = location.officialDisplayName.replace(/\u2122/g, "");
    const hint = location.memberFacingHint || location.description;
    const localReply = hint
      ? `${name} is here on the Estate — ${hint}. Would you like me to take you there?`
      : `That's ${name}. Would you like me to take you there?`;

    return {
      capability: "room",
      knowledgeSource: "estate-locations.json",
      category: "estate_concierge",
      localReply,
      responseHint: kbHint("Semantic where-is — describe room, offer navigation."),
      suppressRelationship: false,
      suppressRecap: true,
      suppressReflectionFirst: true,
    };
  }

  if (
    intent.target.kind === "object" &&
    (intent.action === "ask_knowledge" || intent.action === "navigate")
  ) {
    const resolution = resolveObjectIntent(userText, {
      currentLocationId: helpContext.currentLocationId,
    });
    if (!isResolvedObjectIntent(resolution)) return null;

    if (
      intent.action === "navigate" &&
      intent.target.parentLocationId &&
      intent.target.parentPlaceId
    ) {
      const parent = getEstateLocationById(intent.target.parentLocationId);
      const placeName =
        parent?.officialDisplayName?.replace(/\u2122/g, "") ?? "that room";
      return {
        capability: "navigation",
        knowledgeSource: "estate-objects.json",
        category: "direct_action",
        localReply: `The ${resolution.object.officialName} is in ${placeName}. I'll take you there.`,
        responseHint: kbHint("Object → parent room navigation."),
        suppressRelationship: true,
        suppressRecap: true,
        suppressReflectionFirst: true,
        immediateEstatePlaceNavigate: {
          placeId: intent.target.parentPlaceId,
          navigationLine: `Taking you to ${placeName}.`,
          userText,
        },
      };
    }

    return {
      capability: "object",
      knowledgeSource: "estate-objects.json",
      category: "estate_concierge",
      localReply: resolution.memberFacingAnswer,
      responseHint: kbHint("Semantic object knowledge from KB."),
      suppressRelationship: false,
      suppressRecap: true,
      suppressReflectionFirst: true,
    };
  }

  if (
    (intent.action === "ask_how_to" || intent.action === "open_feature") &&
    intent.target.kind === "feature"
  ) {
    let match = matchFeatureHowToGuide(userText);
    if (!match && intent.target.id) {
      const guide = getFeatureHowToGuides().find(
        (g) => g.guideId === intent.target.id,
      );
      if (guide) {
        match = {
          guide,
          matchedPhrase: intent.target.matchedPhrase ?? guide.aliases[0] ?? "",
        };
      }
    }
    if (!match) return null;

    const localReply = formatFeatureHowToResponse(match.guide);
    const result: EstateIntelligenceRuntimeResult = {
      capability: "feature",
      knowledgeSource: "feature-how-to-guides",
      category: "estate_concierge",
      localReply,
      responseHint: kbHint("Semantic feature how-to / open."),
      suppressRelationship: false,
      suppressRecap: true,
      suppressReflectionFirst: true,
    };

    if (
      intent.action === "open_feature" &&
      match.guide.offerNavigation &&
      match.guide.targetId
    ) {
      result.immediateEstatePlaceNavigate = {
        placeId: match.guide.targetId,
        navigationLine: localReply,
        userText,
      };
    }

    return result;
  }

  if (intent.nextStep === "offer_choices" && intent.target.kind === "experience") {
    const options = experienceChoicesForTarget(intent.target);
    if (options.length === 0) return null;

    const validated = filterValidatedNavigationTargets(
      options.map((o) => o.locationId),
    );
    if (validated.length === 0) return null;

    const placeIdMap = new Map(
      validated.map((t) => [t.locationId, t.placeId]),
    );
    const choices = choicesFromOptions(
      validated.map((t) => t.option),
      placeIdMap,
    );

    const intro = intent.target.displayName
      ? `I have a few ${intent.target.displayName.toLowerCase()} places you might enjoy:`
      : "I have a few places you might enjoy:";

    return {
      capability: "navigation",
      knowledgeSource: "estate-locations.json",
      category: "estate_concierge",
      localReply: formatNavigationChoicesPrompt(intro, choices),
      responseHint: kbHint("Semantic experience — offer 2–4 choices, never random."),
      suppressRelationship: false,
      suppressRecap: true,
      suppressReflectionFirst: true,
    };
  }

  if (intent.action === "discovery") {
    const note = pickDiscoveryForMember(helpContext.exploredDiscoveryIds);
    if (!note) return null;
    return {
      capability: "discovery",
      knowledgeSource: "discovery-library.json",
      category: "estate_concierge",
      localReply: formatDiscoveryNoteResponse(note),
      responseHint: kbHint("Semantic discovery — undiscovered content."),
      suppressRelationship: false,
      suppressRecap: true,
      suppressReflectionFirst: true,
    };
  }

  return null;
}
