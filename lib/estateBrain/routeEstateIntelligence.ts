/**
 * Estate Intelligence Router — capability-first decision tree.
 *
 * User Message → Intent → Capability → Expert → Experience → Tool → Conversation
 */

import { ESTATE_CAPABILITIES, estateCapabilityById } from "./capabilityRegistry";
import { consultBestCapability } from "@/lib/estateCapabilityRegistry";
import { estateExpertNames } from "./expertRegistry";
import { estateBrainEntryById } from "./knowledgeRegistry";
import {
  detectResearchLevel,
  isResearchIntent,
  researchCapabilityIdForLevel,
} from "./researchRouting";
import { resolveIntentFirstRoute } from "./routeIntentFirstNavigation";
import { shouldEnterDiscoveryMode } from "./discoveryMode";
import { shouldEnterUniversalCreation } from "@/lib/universalCreation";
import { shouldCoachBeforeNavigate } from "./estateCoaching";
import type {
  EstateCapability,
  EstateIntelligenceConfidence,
  EstateIntelligenceRoute,
  EstateResearchLevel,
  ImmediateResearchOpenPayload,
} from "./intelligenceTypes";
import {
  resolveImmediateCreateAction,
  resolveImmediateCreateProjectAction,
  resolveImmediateMomentumAction,
  isProjectCreationIntent,
} from "@/lib/createExperience/createExperienceRouting";
import type { AppSection } from "@/lib/companionUi";

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

type ScoreAcc = {
  capability: EstateCapability;
  score: number;
  reasons: string[];
};

function scoreCapability(
  userText: string,
  capability: EstateCapability,
  map: Map<string, ScoreAcc>,
) {
  const q = normalize(userText);

  for (const trigger of capability.triggers) {
    const t = normalize(trigger);
    if (q.includes(t)) {
      const points = t.split(" ").length > 1 ? 30 : 20;
      bump(map, capability, points, `trigger: ${trigger}`);
    }
  }

  if (capability.category === "research" && isResearchIntent(userText)) {
    bump(map, capability, 15, "research intent");
  }
}

function bump(
  map: Map<string, ScoreAcc>,
  capability: EstateCapability,
  points: number,
  reason: string,
) {
  const existing = map.get(capability.id) ?? {
    capability,
    score: 0,
    reasons: [],
  };
  existing.score += points;
  if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
  map.set(capability.id, existing);
}

function confidenceFromScore(score: number): EstateIntelligenceConfidence {
  if (score >= 28) return "high";
  if (score >= 18) return "medium";
  return "low";
}

function followUpForCapability(
  capability: EstateCapability,
  researchLevel?: EstateResearchLevel,
): string {
  if (capability.category === "research" && researchLevel) {
    switch (researchLevel) {
      case 1:
        return "I can explain that right here — what would be most helpful to understand first?";
      case 2:
        return "Study Hall is the right place for this. I'll gather what's current — what should we focus on?";
      case 3:
        return "Let's do proper research on this in Study Hall. What's the main question we're answering?";
      case 4:
        return "I can help you set that up — what should I keep an eye on for you?";
    }
  }
  if (capability.category === "create") {
    return `Let's head to Create — ${capability.name} is ready when you are.`;
  }
  if (capability.category === "momentum") {
    return "Momentum is the right place for this. What are we moving forward first?";
  }
  if (capability.category === "focus") {
    return "What would help you concentrate right now?";
  }
  if (capability.category === "business") {
    return "What part of the business needs you today?";
  }
  const experience = estateBrainEntryById(capability.experienceId);
  return experience?.defaultGreeting ?? "What would help most right now?";
}

/**
 * Resolve full intelligence route from member message.
 * Intent-first environment selection wins; capability registry fills gaps.
 */
export function resolveEstateIntelligenceRoute(
  userText: string,
): EstateIntelligenceRoute | null {
  const intentFirst = resolveIntentFirstRoute(userText);
  if (intentFirst) return intentFirst;

  const text = userText.trim();
  if (!text) return null;

  const map = new Map<string, ScoreAcc>();

  const registryMatch = consultBestCapability(text);
  if (registryMatch) {
    const brainCap = estateCapabilityById(registryMatch.id);
    if (brainCap) {
      bump(map, brainCap, 42, `estate capability registry: ${registryMatch.id}`);
    }
  }

  if (isResearchIntent(text)) {
    const level = detectResearchLevel(text);
    const capId = researchCapabilityIdForLevel(level);
    const researchCap = estateCapabilityById(capId);
    if (researchCap) {
      bump(map, researchCap, 35, `research level ${level}`);
    }
  }

  for (const capability of ESTATE_CAPABILITIES) {
    scoreCapability(text, capability, map);
  }

  const ranked = [...map.values()].sort((a, b) => b.score - a.score);
  const best = ranked[0];
  if (!best || best.score < 14) return null;

  const capability = best.capability;
  const experience = estateBrainEntryById(capability.experienceId);
  const researchLevel =
    capability.category === "research"
      ? (capability.researchLevel ?? detectResearchLevel(text))
      : undefined;

  const confidence = confidenceFromScore(best.score);
  const answerInConversation =
    capability.category === "research" && researchLevel === 1;

  const immediateNavigate =
    !answerInConversation &&
    capability.immediateNavigate !== false &&
    confidence === "high";

  const expertNames = estateExpertNames(capability.expertIds);

  return {
    userText: text,
    capabilityId: capability.id,
    capabilityName: capability.name,
    category: capability.category,
    expertIds: capability.expertIds,
    expertNames,
    experienceId: capability.experienceId,
    experienceName: experience?.name ?? capability.experienceId,
    spaceId: capability.spaceId,
    toolId: capability.toolId,
    researchLevel,
    confidence,
    immediateNavigate,
    answerInConversation,
    followUpLine: followUpForCapability(capability, researchLevel),
    nextExperienceSuggestions: experience?.nextSuggestions ?? [],
    matchScore: best.score,
    matchReasons: best.reasons,
  };
}

/** Map intelligence route → frictionless immediate actions (no permission). */
export function resolveImmediateResearchOpen(
  userText: string,
): ImmediateResearchOpenPayload | null {
  const route = resolveEstateIntelligenceRoute(userText);
  if (!route || route.category !== "research") return null;
  if (route.answerInConversation || !route.immediateNavigate) return null;
  if (!route.researchLevel || route.researchLevel < 2) return null;

  const section = (route.toolId ?? "momentum-institute") as AppSection;

  return {
    userText,
    capabilityId: route.capabilityId,
    researchLevel: route.researchLevel,
    estatePlaceId: route.spaceId,
    section,
    expertIds: route.expertIds,
    followUpLine: route.followUpLine ?? "Let's research this together.",
  };
}

/**
 * Unified immediate action resolver — capability registry drives create/momentum/research.
 */
export function resolveEstateIntelligenceImmediateAction(
  userText: string,
): {
  kind:
    | "create"
    | "create-project"
    | "momentum"
    | "research"
    | "visual"
    | "conversation";
  route: EstateIntelligenceRoute;
  researchPayload?: ImmediateResearchOpenPayload;
} | null {
  if (
    shouldCoachBeforeNavigate(userText) ||
    shouldEnterDiscoveryMode(userText) ||
    shouldEnterUniversalCreation(userText)
  ) {
    return null;
  }

  if (isProjectCreationIntent(userText)) {
    const project = resolveImmediateCreateProjectAction(userText);
    const route = resolveEstateIntelligenceRoute(userText);
    if (project && route) {
      return { kind: "create-project", route };
    }
  }

  const route = resolveEstateIntelligenceRoute(userText);
  if (!route) return null;

  if (route.alternativeEnvironments && route.alternativeEnvironments.length >= 2) {
    return { kind: "conversation", route };
  }

  if (route.answerInConversation) {
    return { kind: "conversation", route };
  }

  if (route.category === "research" && route.immediateNavigate) {
    const researchPayload = resolveImmediateResearchOpen(userText);
    if (researchPayload) {
      return { kind: "research", route, researchPayload };
    }
  }

  if (route.category === "create" || route.category === "momentum") {
    if (isProjectCreationIntent(userText)) {
      const project = resolveImmediateCreateProjectAction(userText);
      if (project) return { kind: "create-project", route };
    }
    const momentum = resolveImmediateMomentumAction(userText);
    if (momentum && route.category === "momentum") {
      return { kind: "momentum", route };
    }
    const create = resolveImmediateCreateAction(userText);
    if (create && route.category === "create") {
      return { kind: "create", route };
    }
  }

  if (
    route.intentCategory === "visual_thinking" &&
    route.immediateNavigate &&
    route.toolId === "visual-focus"
  ) {
    return { kind: "visual", route };
  }

  if (route.immediateNavigate && route.confidence === "high") {
    if (route.category === "momentum") {
      const momentum = resolveImmediateMomentumAction(userText);
      if (momentum) return { kind: "momentum", route };
    }
    if (route.category === "create") {
      const create = resolveImmediateCreateAction(userText);
      if (create) return { kind: "create", route };
    }
  }

  return null;
}

export function formatEstateIntelligenceHint(
  route: EstateIntelligenceRoute,
): string {
  const experts =
    route.expertNames.length > 0
      ? `Experts: ${route.expertNames.join(", ")}. `
      : "";
  const research =
    route.researchLevel != null
      ? `Research level ${route.researchLevel}. `
      : "";
  return (
    `ESTATE INTELLIGENCE: Capability=${route.capabilityName} · ` +
    `Experience=${route.experienceName} · ` +
    `${experts}${research}` +
    `Tool=${route.toolId ?? "conversation"}. ` +
    `No permission ask on high confidence.`
  );
}
