/**
 * Fast intent + complexity classification (<100ms target).
 */

import type {
  ComplexityClass,
  ComplexityLevel,
  IntentLabel,
  ModuleActivation,
  PerformanceBudget,
} from "./types";

export function classifyIntentFast(message: string): IntentLabel {
  const lower = message.toLowerCase().trim();

  if (/^(open|go to|show|take me)\b/.test(lower)) return "navigation";
  if (/\b(overwhelmed|exhausted|stressed|anxious)\b/.test(lower)) return "support";
  if (/\b(what is|define|meaning of)\b/.test(lower)) return "definition";
  if (/\b(research|competitor|market study|look up)\b/.test(lower)) return "research";
  if (/\b(write|design|create|draft|landing page|book)\b/.test(lower)) return "creative";
  if (/\b(marketing|campaign|audience|traffic)\b/.test(lower)) return "marketing";
  if (/\b(strategy|position|grow|business model)\b/.test(lower)) return "strategy";
  if (/\b(do|send|finish|complete|implement)\b/.test(lower)) return "execution";
  return "general";
}

export function classifyComplexity(
  message: string,
  intent: IntentLabel,
): { level: ComplexityLevel; class: ComplexityClass } {
  const lower = message.toLowerCase();
  const len = message.trim().length;

  if (intent === "definition" || (intent === "execution" && len < 60)) {
    return { level: 1, class: "simple_answer" };
  }

  if (intent === "support" || (len < 24 && intent === "general")) {
    return { level: 1, class: "simple_answer" };
  }

  if (/\b(prepare|plan|help me)\b/.test(lower) && len >= 24) {
    return { level: 2, class: "business_guidance" };
  }

  if (intent === "research" || /\b(deep dive|comprehensive analysis)\b/.test(lower)) {
    return { level: 5, class: "deep_research" };
  }

  if (
    intent === "strategy" ||
    /\b(investor|executive|board|pivot|acquisition)\b/.test(lower)
  ) {
    return { level: 4, class: "executive_reasoning" };
  }

  if (intent === "creative" || /\b(launch|campaign|brand)\b/.test(lower)) {
    return { level: 3, class: "creative_collaboration" };
  }

  if (
    intent === "marketing" ||
    intent === "general" ||
    intent === "execution"
  ) {
    return { level: 2, class: "business_guidance" };
  }

  return { level: 2, class: "business_guidance" };
}

export function modulesForComplexity(
  intent: IntentLabel,
  level: ComplexityLevel,
): ModuleActivation {
  const none: ModuleActivation = {
    knowledgeEngine: false,
    cognitiveOrchestration: false,
    fullIntelligence: false,
    disciplines: [],
    observatory: false,
    creativeEngine: false,
  };

  if (level === 1) {
    if (intent === "support") {
      return {
        ...none,
        cognitiveOrchestration: true,
      };
    }
    return {
      ...none,
      knowledgeEngine: true,
    };
  }

  if (intent === "marketing" || (level === 2 && intent === "general")) {
    return {
      knowledgeEngine: true,
      cognitiveOrchestration: true,
      fullIntelligence: false,
      disciplines: ["marketing", "wordsmith"],
      observatory: false,
      creativeEngine: false,
    };
  }

  if (level === 4 || intent === "strategy") {
    return {
      knowledgeEngine: true,
      cognitiveOrchestration: true,
      fullIntelligence: true,
      disciplines: ["business-strategy", "finance", "leadership"],
      observatory: false,
      creativeEngine: false,
    };
  }

  if (level === 5 || intent === "research") {
    return {
      knowledgeEngine: true,
      cognitiveOrchestration: true,
      fullIntelligence: true,
      disciplines: ["research"],
      observatory: true,
      creativeEngine: false,
    };
  }

  if (level === 3 || intent === "creative") {
    return {
      knowledgeEngine: true,
      cognitiveOrchestration: true,
      fullIntelligence: true,
      disciplines: ["creative-direction", "wordsmith", "marketing"],
      observatory: false,
      creativeEngine: true,
    };
  }

  return {
    knowledgeEngine: true,
    cognitiveOrchestration: true,
    fullIntelligence: false,
    disciplines: ["business-strategy"],
    observatory: false,
    creativeEngine: false,
  };
}

export function performanceBudgetForLevel(level: ComplexityLevel): PerformanceBudget {
  switch (level) {
    case 1:
      return {
        intentDetectionMaxMs: 100,
        firstTokenTargetMs: 750,
        totalResponseTargetMs: 1000,
        streamRequired: false,
      };
    case 2:
      return {
        intentDetectionMaxMs: 100,
        firstTokenTargetMs: 750,
        totalResponseTargetMs: 3000,
        streamRequired: false,
      };
    case 3:
      return {
        intentDetectionMaxMs: 100,
        firstTokenTargetMs: 750,
        totalResponseTargetMs: 4000,
        streamRequired: false,
      };
    case 4:
      return {
        intentDetectionMaxMs: 100,
        firstTokenTargetMs: 750,
        totalResponseTargetMs: 5000,
        streamRequired: true,
      };
    case 5:
      return {
        intentDetectionMaxMs: 100,
        firstTokenTargetMs: 750,
        totalResponseTargetMs: 15000,
        streamRequired: true,
      };
    default:
      return {
        intentDetectionMaxMs: 100,
        firstTokenTargetMs: 750,
        totalResponseTargetMs: 3000,
        streamRequired: false,
      };
  }
}

/** Golden rule: reject over-activation for low complexity. */
export function passesGoldenRule(
  level: ComplexityLevel,
  modules: ModuleActivation,
): boolean {
  if (level === 1) {
    const extraDisciplines = modules.disciplines.length > 0;
    const heavy = modules.fullIntelligence || modules.observatory || modules.creativeEngine;
    return !extraDisciplines && !heavy;
  }
  if (level === 2) {
    return modules.disciplines.length <= 3;
  }
  return true;
}
