/**
 * Progressive Discovery Intelligence™ (P0.10.1)
 * Gather minimum viable context — one question at a time — then offer the right framework.
 */

import type { ChatTurn } from "./companionIntelligence";
import { countAssistantQuestions } from "./companionActionBias";
import type { DecisionComplexityLevel } from "./companionDecisionIntelligence/types";
import type { AppSection } from "./companionUi";

export const FRAMEWORK_OFFER_CONFIDENCE_THRESHOLD = 0.7;

export type ProgressiveFrameworkId =
  | "decision_compass"
  | "mind_map"
  | "plan_my_day"
  | "sop_builder"
  | "email_builder"
  | "funnel_builder"
  | "content_builder";

export type ProgressiveFrameworkTarget = {
  id: ProgressiveFrameworkId;
  label: string;
  section: AppSection;
  buttonLabel: string;
};

export const PROGRESSIVE_FRAMEWORKS: Record<
  ProgressiveFrameworkId,
  ProgressiveFrameworkTarget
> = {
  decision_compass: {
    id: "decision_compass",
    label: "Decision Compass",
    section: "decision-compass",
    buttonLabel: "Open Decision Compass",
  },
  mind_map: {
    id: "mind_map",
    label: "Mind Map",
    section: "brain-dump",
    buttonLabel: "Open Clear My Mind",
  },
  plan_my_day: {
    id: "plan_my_day",
    label: "Plan My Day",
    section: "plan-my-day",
    buttonLabel: "Open Plan My Day",
  },
  sop_builder: {
    id: "sop_builder",
    label: "SOP Builder",
    section: "content-generator",
    buttonLabel: "Open Create",
  },
  email_builder: {
    id: "email_builder",
    label: "Email Builder",
    section: "content-generator",
    buttonLabel: "Open Create",
  },
  funnel_builder: {
    id: "funnel_builder",
    label: "Funnel Builder",
    section: "content-generator",
    buttonLabel: "Open Create",
  },
  content_builder: {
    id: "content_builder",
    label: "Content Builder",
    section: "content-generator",
    buttonLabel: "Open Create",
  },
};

const PRODUCT_EXPANSION_RE =
  /\b(?:new product(?:\s+line)?|add(?:ing)? (?:a )?(?:new )?(?:product|offer|service|line)|should i add|expand(?:ing)? (?:my )?(?:product|offer|line))\b/i;

const REPLACEMENT_CONTEXT_RE =
  /\b(?:replac(?:e|ing)|alongside|in addition|keep both|both offers|completely different|instead of|on top of|add to what i have)\b/i;

const AUDIENCE_CONTEXT_RE =
  /\b(?:same audience|different audience|same customers?|different customers?|same people|new audience|existing clients?)\b/i;

/** Max discovery questions before offering a framework. */
export function maxDiscoveryQuestions(level: DecisionComplexityLevel): number {
  switch (level) {
    case "low":
      return 1;
    case "medium":
      return 2;
    case "high":
      return 3;
  }
}

export function detectLikelyFramework(
  userText: string,
  messages: ChatTurn[] = [],
): ProgressiveFrameworkId {
  const thread = `${messages.map((m) => m.content).join("\n")}\n${userText}`.toLowerCase();

  if (PRODUCT_EXPANSION_RE.test(thread) || /\bshould i\b/i.test(userText)) {
    return "decision_compass";
  }
  if (/\b(?:too many ideas|lots of ideas|many ideas|mind map)\b/i.test(thread)) {
    return "mind_map";
  }
  if (/\b(?:overwhelm(?:ed)? today|plan my day|what should i work on today)\b/i.test(thread)) {
    return "plan_my_day";
  }
  if (/\b(?:\bsop\b|standard operating|operating procedure|need (?:a )?process)\b/i.test(thread)) {
    return "sop_builder";
  }
  if (/\b(?:write (?:an? )?email|email sequence|nurture sequence|sales sequence)\b/i.test(thread)) {
    return "email_builder";
  }
  if (/\b(?:sales funnel|marketing funnel|funnel|customer journey)\b/i.test(thread)) {
    return "funnel_builder";
  }
  if (/\b(?:blog post|social post|content plan|newsletter|caption)\b/i.test(thread)) {
    return "content_builder";
  }
  if (/\b(?:can'?t decide|stuck between|help me decide|which (?:offer|option))\b/i.test(thread)) {
    return "decision_compass";
  }
  return "decision_compass";
}

export function computeFrameworkConfidence(input: {
  frameworkId: ProgressiveFrameworkId;
  userText: string;
  messages: ChatTurn[];
  complexityLevel: DecisionComplexityLevel;
  contextSignals: number;
  questionsAsked: number;
}): number {
  let confidence = 0.35;
  const thread = input.messages.map((m) => m.content).join("\n") + "\n" + input.userText;

  if (input.frameworkId === "decision_compass" && PRODUCT_EXPANSION_RE.test(thread)) {
    confidence += 0.2;
    if (REPLACEMENT_CONTEXT_RE.test(thread)) confidence += 0.15;
    if (AUDIENCE_CONTEXT_RE.test(thread)) confidence += 0.15;
    if (input.questionsAsked >= 2) confidence += 0.1;
  }

  if (input.contextSignals >= 2) confidence += 0.1;
  if (input.contextSignals >= 3) confidence += 0.1;
  if (input.questionsAsked >= maxDiscoveryQuestions(input.complexityLevel)) {
    confidence += 0.15;
  }

  if (input.complexityLevel === "low") confidence += 0.15;

  return Math.max(0, Math.min(1, confidence));
}

export function shouldOfferFrameworkNow(confidence: number): boolean {
  return confidence >= FRAMEWORK_OFFER_CONFIDENCE_THRESHOLD;
}

export type ProgressiveDiscoveryStep = {
  framework: ProgressiveFrameworkTarget;
  confidence: number;
  questionsAsked: number;
  maxQuestions: number;
  readyToOffer: boolean;
  /** One question for this turn — empty when ready to offer framework. */
  nextQuestion: string | null;
  offerLine: string | null;
};

function productExpansionNextQuestion(thread: string): string | null {
  if (!REPLACEMENT_CONTEXT_RE.test(thread)) {
    return "Is this replacing your current offer, adding alongside it, or something completely different?";
  }
  if (!AUDIENCE_CONTEXT_RE.test(thread)) {
    return "Would this be for the same audience you serve now, or a different audience?";
  }
  return null;
}

export function resolveProgressiveDiscoveryStep(input: {
  userText: string;
  messages: ChatTurn[];
  complexityLevel: DecisionComplexityLevel;
  contextSignals?: number;
}): ProgressiveDiscoveryStep {
  const questionsAsked = countAssistantQuestions(input.messages);
  const maxQuestions = maxDiscoveryQuestions(input.complexityLevel);
  const frameworkId = detectLikelyFramework(input.userText, input.messages);
  const framework = PROGRESSIVE_FRAMEWORKS[frameworkId];
  const thread = input.messages.map((m) => m.content).join("\n") + "\n" + input.userText;
  const contextSignals = input.contextSignals ?? 0;

  const confidence = computeFrameworkConfidence({
    frameworkId,
    userText: input.userText,
    messages: input.messages,
    complexityLevel: input.complexityLevel,
    contextSignals,
    questionsAsked,
  });

  const atQuestionCap = questionsAsked >= maxQuestions;
  const readyToOffer =
    shouldOfferFrameworkNow(confidence) || (atQuestionCap && questionsAsked > 0);

  let nextQuestion: string | null = null;
  if (!readyToOffer && questionsAsked < maxQuestions) {
    if (PRODUCT_EXPANSION_RE.test(thread) && frameworkId === "decision_compass") {
      nextQuestion = productExpansionNextQuestion(thread);
    }
    if (!nextQuestion && questionsAsked === 0) {
      nextQuestion =
        "What's the one detail that would help most right now — who it's for, or what you're deciding between?";
    }
  }

  const offerLine = readyToOffer
    ? `We have enough to compare options in **${framework.label}**. Would you like me to open ${framework.label}?`
    : null;

  return {
    framework,
    confidence,
    questionsAsked,
    maxQuestions,
    readyToOffer,
    nextQuestion,
    offerLine,
  };
}

export function progressiveDiscoveryHintForChat(input: {
  userText: string;
  messages: ChatTurn[];
  complexityLevel: DecisionComplexityLevel;
  contextSignals?: number;
}): string {
  const step = resolveProgressiveDiscoveryStep(input);
  const lines = [
    "PROGRESSIVE DISCOVERY INTELLIGENCE™ (P0.10.1 — mandatory):",
    `Likely framework: ${step.framework.label} (${Math.round(step.confidence * 100)}% confidence).`,
    `Questions asked: ${step.questionsAsked} / ${step.maxQuestions} max before framework offer.`,
    "ADHD RULE: ONE question per turn. Wait for answer. Never numbered lists of 3–5 questions.",
    "FORBIDDEN: dumping multiple questions, consultant questionnaires, or 'here are a few things I need to know'.",
  ];

  if (step.readyToOffer) {
    lines.push(
      `FRAMEWORK READY (≥${Math.round(FRAMEWORK_OFFER_CONFIDENCE_THRESHOLD * 100)}% or cap reached): Offer ${step.framework.label} with permission.`,
      `Suggested line: "${step.offerLine}"`,
      "Do NOT ask more discovery questions — open the framework path.",
    );
  } else if (step.nextQuestion) {
    lines.push(
      `Ask ONLY this question (nothing else before it): "${step.nextQuestion}"`,
      "Keep reply to 1–2 sentences + that single question.",
    );
  } else {
    lines.push(
      "Ask ONE clarifying question that most improves framework selection.",
      "Gather only enough to choose the framework — not to solve the whole problem.",
    );
  }

  return lines.join("\n");
}
