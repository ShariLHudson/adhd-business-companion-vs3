/**
 * 045 — Universal Intent Detection
 * KNOW | DECIDE | CREATE | IMPROVE | CONTINUE — before answering.
 */

import { resolveBlueprintFromText } from "./blueprintRegistry";
import type {
  CreateBlueprint,
  PlatformIntentClassification,
  PlatformIntentType,
} from "./types";

const CONTINUE_RE =
  /\b(?:continue|resume|finish|pick up|open my|let'?s finish|where we left off|back to my)\b/i;

const IMPROVE_RE =
  /\b(?:improve|rewrite|re-?write|expand|update|fix|edit|polish|revise|tighten)\b/i;

const CREATE_RE =
  /\b(?:help me (?:create|plan|build|make|write|design|organize)|i (?:want|need) (?:to )?(?:create|plan|build|make|write|design)|let'?s (?:create|build|make|plan|write)|i(?:'m| am) (?:creating|planning|building|writing)|create (?:a|an|my|the)|plan (?:a|an|my|the)|build (?:a|an|my|the)|make (?:a|an|my|the)|write (?:a|an|my|the)|organize (?:a|an|my|the))\b/i;

const DECIDE_RE =
  /\b(?:which (?:option|one|path|approach)|should i|help me choose|help me decide|compare|trade-?off|what(?:'s| is) better|or .+ or )\b/i;

const KNOW_RE =
  /\b(?:what (?:is|are|should|do|does|would)|how (?:do|does|can|should|to)|why (?:do|does|is|are|should)|explain|tell me about|what(?:'s| is) the best way|what should i consider|what do i need to know|can you explain)\b/i;

const FIGURE_OUT_RE =
  /\b(?:help(?:\s+me)?\s+figur(?:e|ing)\s+out|not sure what (?:to|i should) create|what should i create|i don'?t know what to (?:make|create|build))\b/i;

/**
 * Knowledge questions about a domain must not launch Create
 * even when they mention retreat/event/marketing.
 */
export function looksLikeKnowledgeQuestion(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (CREATE_RE.test(t) && !KNOW_RE.test(t)) return false;
  if (/\?/.test(t) && KNOW_RE.test(t)) return true;
  if (KNOW_RE.test(t) && !CREATE_RE.test(t)) return true;
  return false;
}

export function classifyPlatformIntent(
  userText: string,
): PlatformIntentClassification {
  const t = userText.trim();
  if (!t) {
    return {
      intent: "know",
      confidence: "low",
      blueprint: null,
      reason: "empty",
    };
  }

  if (FIGURE_OUT_RE.test(t)) {
    return {
      intent: "create",
      confidence: "medium",
      blueprint: null,
      reason: "help_figure_out",
    };
  }

  // CONTINUE before CREATE so "continue my retreat plan" resumes
  if (CONTINUE_RE.test(t)) {
    const blueprint = resolveBlueprintFromText(t);
    return {
      intent: "continue",
      confidence: "high",
      blueprint,
      reason: "continue_signal",
    };
  }

  if (IMPROVE_RE.test(t) && !looksLikeKnowledgeQuestion(t)) {
    const blueprint = resolveBlueprintFromText(t);
    return {
      intent: "improve",
      confidence: "high",
      blueprint,
      reason: "improve_signal",
    };
  }

  // KNOW wins over blueprint alias mentions ("what should I consider for a retreat?")
  if (looksLikeKnowledgeQuestion(t) && !CREATE_RE.test(t)) {
    return {
      intent: "know",
      confidence: "high",
      blueprint: null,
      reason: "knowledge_question",
    };
  }

  if (DECIDE_RE.test(t) && !CREATE_RE.test(t)) {
    return {
      intent: "decide",
      confidence: "high",
      blueprint: null,
      reason: "decision_question",
    };
  }

  if (CREATE_RE.test(t) || (resolveBlueprintFromText(t) && /\b(?:plan|create|build|make|write|organize|need help)\b/i.test(t))) {
    const blueprint = resolveBlueprintFromText(t);
    return {
      intent: "create",
      confidence: blueprint ? "high" : "medium",
      blueprint,
      reason: blueprint ? "create_with_blueprint" : "create_without_blueprint",
    };
  }

  const softBlueprint = resolveBlueprintFromText(t);
  if (softBlueprint && /\b(?:help|need|want|plan)\b/i.test(t)) {
    return {
      intent: "create",
      confidence: "medium",
      blueprint: softBlueprint,
      reason: "soft_create_with_blueprint",
    };
  }

  return {
    intent: "know",
    confidence: "low",
    blueprint: null,
    reason: "default_conversation",
  };
}

export function intentLaunchesCreate(intent: PlatformIntentType): boolean {
  return intent === "create" || intent === "improve" || intent === "continue";
}

export function intentStaysInConversation(
  intent: PlatformIntentType,
): boolean {
  return intent === "know" || intent === "decide";
}

export type { CreateBlueprint };
