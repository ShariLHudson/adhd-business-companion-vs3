/**
 * Intent-First Estate Navigation — full decision pipeline.
 *
 * User Request → Intent → Capability → Environment → Tool → Conversation
 */

import {
  detectEstateIntent,
  capabilityCategoryForIntent,
  type EstateIntentCategory,
} from "./intentCategories";
import {
  ESTATE_ENVIRONMENTS,
  estateEnvironmentById,
  type EstateEnvironment,
} from "./environmentRegistry";
import { ESTATE_CAPABILITIES, estateCapabilityById } from "./capabilityRegistry";
import { estateExpertNames } from "./expertRegistry";
import { estateBrainEntryById } from "./knowledgeRegistry";
import {
  detectResearchLevel,
  isResearchIntent,
  researchCapabilityIdForLevel,
} from "./researchRouting";
import type {
  EstateIntelligenceConfidence,
  EstateIntelligenceRoute,
  EstateCapability,
  EstateEnvironmentChoice,
} from "./intelligenceTypes";
import { isProjectCreationIntent } from "@/lib/createExperience/createExperienceRouting";

export type { EstateEnvironmentChoice };

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function scoreEnvironment(
  userText: string,
  env: EstateEnvironment,
  intentCategory: EstateIntentCategory | null,
): { score: number; reasons: string[] } {
  const q = normalize(userText);
  let score = 0;
  const reasons: string[] = [];

  if (intentCategory && env.intentCategories.includes(intentCategory)) {
    score += 18;
    reasons.push(`intent: ${intentCategory}`);
  }

  for (const trigger of env.triggers) {
    const t = normalize(trigger);
    if (q.includes(t)) {
      score += t.split(" ").length > 1 ? 28 : 16;
      reasons.push(`env: ${trigger}`);
    }
  }

  for (const item of env.bestFor) {
    const b = normalize(item);
    if (q.includes(b)) {
      score += 12;
      reasons.push(`best for: ${item}`);
    }
  }

  return { score, reasons };
}

function selectEnvironments(
  userText: string,
  intentCategory: EstateIntentCategory | null,
): Array<EstateEnvironmentChoice & { reasons: string[] }> {
  return ESTATE_ENVIRONMENTS.map((env) => {
    const { score, reasons } = scoreEnvironment(userText, env, intentCategory);
    return {
      environmentId: env.id,
      environmentName: env.name,
      purpose: env.purpose,
      spaceId: env.spaceId,
      score,
      reasons,
    };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
}

function bestCapabilityForRoute(
  userText: string,
  environment: EstateEnvironment,
  intentCategory: EstateIntentCategory,
): EstateCapability | null {
  if (intentCategory === "learn" && isResearchIntent(userText)) {
    const level = detectResearchLevel(userText);
    return estateCapabilityById(researchCapabilityIdForLevel(level)) ?? null;
  }

  if (intentCategory === "visual_thinking") {
    return (
      estateCapabilityById("create.mindmap") ??
      estateCapabilityById("create.whiteboard") ??
      null
    );
  }

  const q = normalize(userText);
  let best: { cap: EstateCapability; score: number } | null = null;

  for (const cap of ESTATE_CAPABILITIES) {
    let score = 0;
    if (cap.spaceId === environment.spaceId) score += 12;
    if (environment.primarySection && cap.toolId === environment.primarySection) {
      score += 8;
    }
    for (const trigger of cap.triggers) {
      if (q.includes(normalize(trigger))) {
        score += trigger.split(" ").length > 1 ? 24 : 16;
      }
    }
    if (!best || score > best.score) {
      if (score > 0) best = { cap, score };
    }
  }

  return best?.cap ?? null;
}

/**
 * Primary intent-first router — capability and environment, never room-first.
 */
export function resolveIntentFirstRoute(
  userText: string,
): EstateIntelligenceRoute | null {
  const text = userText.trim();
  if (!text) return null;

  if (isProjectCreationIntent(text)) {
    const environment =
      estateEnvironmentById("create-studio") ??
      ESTATE_ENVIRONMENTS.find((e) => e.spaceId === "creative-studio")!;
    const capability = estateCapabilityById("create.general");
    const experience = estateBrainEntryById("create");
    return {
      userText: text,
      intentCategory: "create",
      environmentId: environment.id,
      environmentName: environment.name,
      capabilityId: capability?.id ?? "create.general",
      capabilityName: capability?.name ?? "Create",
      category: "create",
      expertIds: capability?.expertIds ?? [],
      expertNames: estateExpertNames(capability?.expertIds ?? []),
      experienceId: "create",
      experienceName: experience?.name ?? "Create",
      spaceId: environment.spaceId,
      toolId: "projects",
      confidence: "high",
      immediateNavigate: true,
      answerInConversation: false,
      followUpLine: "Let's bring that project to life.",
      nextExperienceSuggestions: environment.suggestedNextSpaceIds,
      matchScore: 40,
      matchReasons: ["new project creation → Create"],
    };
  }

  const intent = detectEstateIntent(text);
  const envChoices = selectEnvironments(text, intent?.category ?? null);
  const topEnv = envChoices[0];
  if (!topEnv || topEnv.score < 14) return null;

  const environment = ESTATE_ENVIRONMENTS.find(
    (e) => e.id === topEnv.environmentId,
  )!;
  const intentCategory = intent?.category ?? environment.intentCategories[0]!;

  const alternatives =
    envChoices.length >= 2 &&
    envChoices[1]!.score >= topEnv.score - 6 &&
    envChoices[1]!.score >= 18
      ? envChoices.slice(0, 3).map(({ reasons: _r, ...choice }) => choice)
      : undefined;

  const capability =
    bestCapabilityForRoute(text, environment, intentCategory) ??
    ESTATE_CAPABILITIES.find((c) => c.spaceId === environment.spaceId);

  const experienceId =
    capability?.experienceId ??
    estateBrainEntryById(environment.spaceId)?.experienceId ??
    "explore";

  const experience = estateBrainEntryById(experienceId);
  const researchLevel =
    capability?.category === "research"
      ? (capability.researchLevel ?? detectResearchLevel(text))
      : undefined;

  const confidence: EstateIntelligenceConfidence =
    topEnv.score >= 30 ? "high" : topEnv.score >= 20 ? "medium" : "low";

  const answerInConversation =
    intentCategory === "learn" && researchLevel === 1;

  const hasDisambiguation = alternatives != null && alternatives.length >= 2;

  const immediateNavigate =
    !hasDisambiguation &&
    !answerInConversation &&
    confidence === "high" &&
    capability?.immediateNavigate !== false;

  const expertIds = capability?.expertIds ?? [];
  const toolId =
    intentCategory === "visual_thinking"
      ? (environment.primarySection ?? "visual-focus")
      : (capability?.toolId ?? environment.primarySection);

  const followUpLine = hasDisambiguation
    ? formatEnvironmentChoiceIntro(alternatives)
    : followUpForRoute(environment, capability);

  return {
    userText: text,
    intentCategory,
    environmentId: environment.id,
    environmentName: environment.name,
    alternativeEnvironments: alternatives,
    capabilityId: capability?.id ?? environment.id,
    capabilityName: capability?.name ?? environment.name,
    category:
      capability?.category ?? capabilityCategoryForIntent(intentCategory),
    expertIds,
    expertNames: estateExpertNames(expertIds),
    experienceId,
    experienceName: experience?.name ?? environment.name,
    spaceId: environment.spaceId,
    toolId,
    researchLevel,
    confidence,
    immediateNavigate,
    answerInConversation,
    followUpLine,
    nextExperienceSuggestions: environment.suggestedNextSpaceIds,
    matchScore: topEnv.score,
    matchReasons: topEnv.reasons,
  };
}

function followUpForRoute(
  environment: EstateEnvironment,
  capability: EstateCapability | null | undefined,
): string {
  if (capability?.name) {
    return `Let's head to ${environment.name} — ${capability.name} is ready when you are.`;
  }
  return (
    estateBrainEntryById(environment.spaceId)?.defaultGreeting ??
    `Let's head to ${environment.name}.`
  );
}

/** Flexible environment suggestions — max 3 (T-003). */
export function formatEnvironmentChoiceIntro(
  choices: readonly EstateEnvironmentChoice[],
): string {
  const lines = choices
    .slice(0, 3)
    .map((c) => `• ${c.environmentName} — ${c.purpose}`);
  return [
    "I can help with that in a couple of ways.",
    "",
    ...lines,
    "",
    "Which sounds better?",
  ].join("\n");
}

export function parseEnvironmentChoiceReply(
  reply: string,
  choices: readonly EstateEnvironmentChoice[],
): EstateEnvironmentChoice | null {
  const t = normalize(reply);
  if (!t) return null;
  const num = /^[123]$/.test(t) ? Number(t) - 1 : -1;
  if (num >= 0 && num < choices.length) return choices[num] ?? null;
  for (const choice of choices) {
    if (t.includes(normalize(choice.environmentName))) return choice;
  }
  return null;
}
