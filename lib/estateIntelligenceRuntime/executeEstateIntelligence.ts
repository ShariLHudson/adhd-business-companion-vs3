/**
 * Estate Intelligence Runtime™ — activate KB-backed intelligence on every turn.
 *
 * After goal detection and capability selection, query the appropriate
 * Estate Knowledge Base™ source and return member-facing copy grounded in canon.
 */

import type { IntentRoutingDecision } from "@/lib/intentRoutingIntelligence";
import type { HelpDiscoveryContext } from "@/lib/estateHelpDiscoveryIntelligence";
import {
  isResolvedHelpDiscovery,
  resolveHelpDiscoveryQuery,
} from "@/lib/estateHelpDiscoveryIntelligence";
import {
  formatFeatureHowToResponse,
  matchFeatureHowToGuide,
} from "@/lib/estateHelpDiscoveryIntelligence/featureHowTo";
import {
  formatNavigationDecision,
  formatDirectNavigationLine,
  resolveEstateNavigationIntent,
  shouldNavigateFromDecision,
} from "@/lib/estateNavigationIntelligence";
import { resolveLocationIntent } from "@/lib/estateKnowledgeBase/locationIntentResolution";
import {
  isResolvedObjectIntent,
  resolveObjectIntent,
} from "@/lib/estateObjectIntelligence";
import {
  isResolvedEstateRecommendation,
  resolveEstateRecommendation,
} from "@/lib/estateRecommendationIntelligence";
import {
  formatEstateGuideReply,
  isEstateGuideQuestion,
  resolveEstateGuideTurn,
} from "@/lib/sparkKnowledge/estateGuide";
import { estateGuideHint } from "@/lib/sparkKnowledge/shariKnowledge";
import { searchEstateBrain } from "@/lib/estateBrain/search";
import {
  isConversationStabilizationEnabled,
  shouldBlockEstateSubsystem,
  tryStabilizationFastPath,
  type RoutingPipelineResult,
} from "@/lib/conversationStabilization";
import type { EstateCapability } from "@/lib/conversationStabilization/capabilityTypes";
import type { EstateIntelligenceRuntimeResult } from "./types";
import {
  executeSemanticIntent,
} from "@/lib/semanticIntentResolver/executeSemanticIntent";
import { isResolvedSemanticIntent } from "@/lib/semanticIntentResolver/types";

const ESTATE_NAVIGATION_GOLDEN_RULE =
  "Offer at most three thoughtful choices from the Knowledge Base. Never guess. Navigate immediately only when destination is validated.";

const COMPANION_VOICE_HINT =
  "One trusted companion voice. Never mention routing, systems, menus, or intelligence layers.";

const KB_GROUNDING_HINT =
  "Use only validated Estate Knowledge Base facts. Never invent locations, features, objects, or routes.";

export type ExecuteEstateIntelligenceInput = {
  pipeline: RoutingPipelineResult;
  userText: string;
  lastAssistantText?: string | null;
  currentTurn?: number;
  activeWorkflow?: string | null;
  workspace?: string | null;
  helpContext: HelpDiscoveryContext;
  routing: IntentRoutingDecision;
};

function baseHint(capability: string, source: string, detail?: string): string {
  return [COMPANION_VOICE_HINT, `Source: ${source}`, KB_GROUNDING_HINT, detail]
    .filter(Boolean)
    .join("\n");
}

function executeNavigation(
  userText: string,
): EstateIntelligenceRuntimeResult | null {
  const decision = resolveEstateNavigationIntent(userText);
  if (decision.kind === "unresolved") return null;

  const localReply = formatNavigationDecision(decision);
  if (!localReply) return null;

  if (shouldNavigateFromDecision(decision)) {
    const displayName =
      decision.choices?.[0]?.officialDisplayName ?? "that place";
    const navigationLine = displayName
      ? `Taking you to ${displayName}.`
      : "Taking you there.";

    return {
      capability: "navigation",
      knowledgeSource: "estate-locations.json",
      category: "direct_action",
      localReply: navigationLine,
      responseHint: baseHint(
        "navigation",
        "estate-locations.json + estate-aliases.json",
        "Navigate immediately. No explanation. No unnecessary questions.",
      ),
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      immediateEstatePlaceNavigate: {
        placeId: decision.placeId!,
        navigationLine,
        userText,
      },
    };
  }

  return {
    capability: "navigation",
    knowledgeSource: "estate-locations.json",
    category: "direct_action",
    localReply,
    responseHint: baseHint(
      "navigation (choices)",
      "estate-locations.json",
      ESTATE_NAVIGATION_GOLDEN_RULE,
    ),
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
  };
}

function executeRoom(
  userText: string,
): EstateIntelligenceRuntimeResult | null {
  const navigation = resolveEstateNavigationIntent(userText);
  if (navigation.kind !== "unresolved") {
    if (
      navigation.kind === "offer_choices" ||
      navigation.kind === "need_clarification"
    ) {
      const localReply = formatNavigationDecision(navigation);
      if (!localReply) return null;
      return {
        capability: "room",
        knowledgeSource: "estate-locations.json",
        category: "estate_concierge",
        localReply,
        responseHint: baseHint(
          "room (disambiguation)",
          "estate-locations.json",
          ESTATE_NAVIGATION_GOLDEN_RULE,
        ),
        suppressRelationship: false,
        suppressRecap: true,
        suppressReflectionFirst: true,
      };
    }

    const name = navigation.choices?.[0]?.officialDisplayName ?? "that place";
    const hint = navigation.choices?.[0]?.memberFacingHint;
    const localReply = hint
      ? `${name} is here on the Estate — ${hint}. Would you like me to take you there?`
      : `That's ${name}. Would you like me to take you there?`;

    return {
      capability: "room",
      knowledgeSource: "estate-locations.json",
      category: "estate_concierge",
      localReply,
      responseHint: baseHint(
        "room",
        "estate-locations.json",
        "Describe the validated room only. Offer navigation — do not auto-navigate on where-is questions.",
      ),
      suppressRelationship: false,
      suppressRecap: true,
      suppressReflectionFirst: true,
    };
  }

  const location = resolveLocationIntent(userText);
  if (location.kind === "experience_options" && location.memberFacingPrompt) {
    return {
      capability: "room",
      knowledgeSource: "estate-locations.json",
      category: "estate_concierge",
      localReply: location.memberFacingPrompt,
      responseHint: baseHint(
        "room (experience options)",
        "estate-locations.json + experience-groups",
        ESTATE_NAVIGATION_GOLDEN_RULE,
      ),
      suppressRelationship: false,
      suppressRecap: true,
      suppressReflectionFirst: true,
    };
  }

  if (location.kind === "direct" && location.directLocation) {
    const { officialDisplayName, memberFacingHint } = location.directLocation;
    const localReply = memberFacingHint
      ? `${officialDisplayName} is here on the Estate — ${memberFacingHint}. Would you like me to take you there?`
      : `That's ${officialDisplayName}. Would you like me to take you there?`;

    return {
      capability: "room",
      knowledgeSource: "estate-locations.json",
      category: "estate_concierge",
      localReply,
      responseHint: baseHint("room", "estate-locations.json"),
      suppressRelationship: false,
      suppressRecap: true,
      suppressReflectionFirst: true,
    };
  }

  return null;
}

function executeFeature(
  userText: string,
): EstateIntelligenceRuntimeResult | null {
  const match = matchFeatureHowToGuide(userText);
  const localReply = match
    ? formatFeatureHowToResponse(match.guide)
    : "Tell me what you're trying to do — settings, reminders, Clear My Mind, or something else — and I'll walk you through it.";

  const result: EstateIntelligenceRuntimeResult = {
    capability: "feature",
    knowledgeSource: "feature-how-to-guides",
    category: "estate_concierge",
    localReply,
    responseHint: baseHint("feature", "feature-how-to-guides"),
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: true,
  };

  if (
    match?.guide.offerNavigation &&
    match.guide.targetId &&
    !/\bwhere is\b/i.test(userText)
  ) {
    result.immediateEstatePlaceNavigate = {
      placeId: match.guide.targetId,
      navigationLine: localReply,
      userText,
    };
  }

  return result;
}

function executeObject(
  userText: string,
  helpContext: HelpDiscoveryContext,
): EstateIntelligenceRuntimeResult | null {
  const resolution = resolveObjectIntent(userText, {
    currentLocationId: helpContext.currentLocationId,
  });
  if (!isResolvedObjectIntent(resolution)) return null;

  return {
    capability: "object",
    knowledgeSource: "estate-objects.json",
    category: "estate_concierge",
    localReply: resolution.memberFacingAnswer,
    responseHint: baseHint("object", "estate-objects.json + object-aliases.json"),
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: true,
  };
}

function executeExperience(
  userText: string,
  helpContext: HelpDiscoveryContext,
  pipeline: RoutingPipelineResult,
): EstateIntelligenceRuntimeResult | null {
  if (
    isConversationStabilizationEnabled() &&
    shouldBlockEstateSubsystem(pipeline.arbitration, "recommendation")
  ) {
    return null;
  }

  const recommendation = resolveEstateRecommendation(userText, {
    currentLocationId: helpContext.currentLocationId,
  });
  if (!isResolvedEstateRecommendation(recommendation)) return null;
  if (!recommendation.memberFacingInvitation) return null;

  return {
    capability: "experience",
    knowledgeSource: "recommendation-signals",
    category: "estate_concierge",
    localReply: recommendation.memberFacingInvitation,
    responseHint: baseHint(
      "experience",
      "recommendation-signals + estate-locations.json",
      "Why-now invitation only — never force navigation.",
    ),
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: true,
  };
}

function executeDiscovery(
  userText: string,
  helpContext: HelpDiscoveryContext,
): EstateIntelligenceRuntimeResult | null {
  const decision = resolveHelpDiscoveryQuery(userText, helpContext);
  if (!isResolvedHelpDiscovery(decision)) return null;
  if (
    decision.route !== "discovery" &&
    decision.route !== "capability_overview"
  ) {
    return null;
  }

  return {
    capability: "discovery",
    knowledgeSource:
      decision.route === "discovery"
        ? "discovery-library.json"
        : "progressive-discovery.json",
    category: "estate_concierge",
    localReply: decision.memberFacingResponse,
    responseHint: baseHint(
      "discovery",
      decision.route === "discovery"
        ? "discovery-library.json"
        : "progressive-discovery.json",
    ),
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: true,
  };
}

function executeHelp(
  userText: string,
  lastAssistantText: string | null | undefined,
  helpContext: HelpDiscoveryContext,
): EstateIntelligenceRuntimeResult | null {
  if (isEstateGuideQuestion(userText, lastAssistantText)) {
    const turn = resolveEstateGuideTurn(userText, {
      currentPlaceId: helpContext.currentLocationId ?? undefined,
    });
    return {
      capability: "help",
      knowledgeSource: "estate-guide",
      category: "estate_guide",
      localReply: formatEstateGuideReply(turn),
      responseHint: [estateGuideHint(), turn.responseHint, KB_GROUNDING_HINT]
        .filter(Boolean)
        .join("\n\n"),
      suppressRelationship: false,
      suppressRecap: true,
      suppressReflectionFirst: true,
    };
  }

  const decision = resolveHelpDiscoveryQuery(userText, helpContext);
  if (
    !isResolvedHelpDiscovery(decision) ||
    decision.route !== "capability_overview"
  ) {
    return null;
  }

  return {
    capability: "help",
    knowledgeSource: "estate-knowledge-base",
    category: "estate_concierge",
    localReply: decision.memberFacingResponse,
    responseHint: baseHint("help", "estate-knowledge-base"),
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: true,
  };
}

function executeRetrieval(userText: string): EstateIntelligenceRuntimeResult | null {
  const topic = userText.trim();
  const search = searchEstateBrain(topic);
  const top = search.best ?? search.matches[0];
  const hint = top
    ? `I found something on "${top.entry.name}" that might be close.`
    : `I'll search for anything we have on "${topic}".`;

  return {
    capability: "retrieval",
    knowledgeSource: "estate-brain",
    category: "direct_action",
    localReply: `${hint}\n\nWhat would you use this for — so I pull the right piece?`,
    responseHint: baseHint("retrieval", "estate-brain"),
    suppressRelationship: true,
    suppressRecap: true,
    suppressReflectionFirst: true,
  };
}

function executeTaskCapability(
  capability: EstateCapability,
  input: ExecuteEstateIntelligenceInput,
): EstateIntelligenceRuntimeResult | null {
  const fast = tryStabilizationFastPath(
    {
      userText: input.userText.trim(),
      lastAssistantText: input.lastAssistantText,
      currentTurn: input.currentTurn,
      activeWorkflow: input.activeWorkflow,
      workspace: input.workspace,
      arbitration: input.pipeline.arbitration,
    },
    input.routing,
  );
  if (!fast) {
    if (capability === "retrieval") {
      return executeRetrieval(input.userText);
    }
    return null;
  }

  return {
    capability,
    knowledgeSource:
      capability === "retrieval" ? "estate-brain" : "estate-knowledge-base",
    category:
      fast.category === "universal_creation"
        ? "universal_creation"
        : "direct_action",
    localReply: fast.localReply,
    responseHint: fast.responseHint,
    suppressRelationship: fast.suppressRelationship,
    suppressRecap: fast.suppressRecap,
    suppressReflectionFirst: fast.suppressReflectionFirst,
    immediateResearchOpen: fast.immediateResearchOpen,
    immediateCreateProjectOpen: fast.immediateCreateProjectOpen,
    universalCreationCategory: fast.category === "universal_creation",
  };
}

function resolveCapabilityExecutor(
  capability: EstateCapability,
  input: ExecuteEstateIntelligenceInput,
): EstateIntelligenceRuntimeResult | null {
  const userText = input.userText.trim();

  switch (capability) {
    case "navigation":
      return executeNavigation(userText);
    case "room":
      return executeRoom(userText);
    case "feature":
      return executeFeature(userText);
    case "object":
      return executeObject(userText, input.helpContext);
    case "experience":
      return executeExperience(userText, input.helpContext, input.pipeline);
    case "discovery":
      return executeDiscovery(userText, input.helpContext);
    case "help":
      return executeHelp(userText, input.lastAssistantText, input.helpContext);
    case "research":
    case "create":
    case "capture":
    case "retrieval":
    case "session_continue":
      return executeTaskCapability(capability, input);
    default:
      return null;
  }
}

/**
 * Query the winning Estate Intelligence source and return grounded response material.
 */
export function executeEstateIntelligence(
  input: ExecuteEstateIntelligenceInput,
): EstateIntelligenceRuntimeResult | null {
  const { pipeline } = input;

  if (
    pipeline.semanticIntent &&
    isResolvedSemanticIntent(pipeline.semanticIntent)
  ) {
    const semanticResult = executeSemanticIntent(
      pipeline.semanticIntent,
      input.userText.trim(),
      input.helpContext,
    );
    if (semanticResult) return semanticResult;
  }

  const winning = pipeline.winningCapability;
  if (!winning) return null;

  const taskCapabilities: EstateCapability[] = [
    "session_continue",
    "research",
    "create",
    "capture",
    "retrieval",
  ];

  if (taskCapabilities.includes(winning)) {
    if (
      pipeline.arbitration.sessionLocked &&
      winning !== "capture" &&
      winning !== "session_continue" &&
      !pipeline.arbitration.explicitDirectionChange
    ) {
      return null;
    }
    return executeTaskCapability(winning, input);
  }

  if (pipeline.arbitration.sessionLocked) {
    if (
      pipeline.arbitration.explicitDirectionChange &&
      winning === "navigation"
    ) {
      return resolveCapabilityExecutor("navigation", input);
    }
    return null;
  }

  if (!pipeline.arbitration.estateIntelligenceNeeded) {
    return null;
  }

  const result = resolveCapabilityExecutor(winning, input);
  if (result) return result;

  if (winning === "feature" || winning === "object") {
    const helpDecision = resolveHelpDiscoveryQuery(input.userText, input.helpContext);
    if (isResolvedHelpDiscovery(helpDecision)) {
      return {
        capability: winning,
        knowledgeSource: "estate-knowledge-base",
        category: "estate_concierge",
        localReply: helpDecision.memberFacingResponse,
        responseHint: baseHint(winning, "estate-knowledge-base"),
        suppressRelationship: false,
        suppressRecap: true,
        suppressReflectionFirst: true,
      };
    }
  }

  return null;
}

export function isEstateIntelligenceRuntimeEnabled(): boolean {
  if (typeof process === "undefined") return true;
  return process.env.NEXT_PUBLIC_ESTATE_INTELLIGENCE_RUNTIME !== "0";
}
