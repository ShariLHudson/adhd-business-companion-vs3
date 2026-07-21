/**
 * 051 — Intent classification for the Universal Creation Engine.
 * Extends 045 KNOW/DECIDE/CREATE/IMPROVE/CONTINUE with plan/review/etc.
 */

import {
  classifyPlatformIntent,
  looksLikeKnowledgeQuestion,
} from "@/lib/platformIntent/classifyPlatformIntent";
import type { CreateBlueprint } from "@/lib/platformIntent/types";
import type { UniversalCreationIntent } from "./types";

export type UniversalIntentClassification = {
  intent: UniversalCreationIntent;
  confidence: "high" | "medium" | "low";
  blueprint: CreateBlueprint | null;
  reason: string;
  /** True when this must not open Create / Events workspace */
  stayInConversation: boolean;
};

const ORGANIZE_RE =
  /\b(?:organize|sort|connect|link|put (?:this|these) (?:with|into)|attach (?:to|this))\b/i;
const PLAN_RE =
  /\b(?:plan (?:my|the|a|an)|planning|timeline|milestones?|schedule)\b/i;
const REVIEW_RE =
  /\b(?:review|assess|check (?:my|the)|how complete|what(?:'s| is) missing)\b/i;
const COMPARE_RE =
  /\b(?:compare|versus|vs\.?|which (?:is|option)|trade-?off)\b/i;
const ADAPT_RE =
  /\b(?:adapt|adjust|pivot|changed|change of (?:plans?|date)|new constraint)\b/i;
const COMPLETE_RE =
  /\b(?:mark (?:as )?complete|finish (?:this|it)|we(?:'re| are) done|wrap (?:this|it) up)\b/i;
const ARCHIVE_RE = /\b(?:archive|retire|close out|put away)\b/i;
const REUSE_RE =
  /\b(?:reuse|duplicate as|start from|based on (?:last|my|the)|template from)\b/i;

/**
 * Classify the turn for the Universal Creation Engine.
 * Knowledge questions never open Create.
 */
export function resolveUniversalCreationIntent(
  userText: string,
): UniversalIntentClassification {
  const t = userText.trim();
  if (!t) {
    return {
      intent: "know",
      confidence: "low",
      blueprint: null,
      reason: "empty",
      stayInConversation: true,
    };
  }

  if (looksLikeKnowledgeQuestion(t)) {
    const base = classifyPlatformIntent(t);
    return {
      intent: "know",
      confidence: base.confidence,
      blueprint: null,
      reason: "knowledge_question",
      stayInConversation: true,
    };
  }

  if (REUSE_RE.test(t)) {
    const base = classifyPlatformIntent(t);
    return {
      intent: "reuse",
      confidence: "medium",
      blueprint: base.blueprint,
      reason: "reuse_signal",
      stayInConversation: false,
    };
  }

  if (ARCHIVE_RE.test(t)) {
    return {
      intent: "archive",
      confidence: "medium",
      blueprint: classifyPlatformIntent(t).blueprint,
      reason: "archive_signal",
      stayInConversation: false,
    };
  }

  if (COMPLETE_RE.test(t)) {
    return {
      intent: "complete",
      confidence: "medium",
      blueprint: classifyPlatformIntent(t).blueprint,
      reason: "complete_signal",
      stayInConversation: false,
    };
  }

  if (ADAPT_RE.test(t)) {
    return {
      intent: "adapt",
      confidence: "medium",
      blueprint: classifyPlatformIntent(t).blueprint,
      reason: "adapt_signal",
      stayInConversation: false,
    };
  }

  if (COMPARE_RE.test(t) || DECIDE_LIKE(t)) {
    const base = classifyPlatformIntent(t);
    return {
      intent: base.intent === "decide" ? "decide" : "compare",
      confidence: base.confidence,
      blueprint: base.blueprint,
      reason: "compare_or_decide",
      stayInConversation: true,
    };
  }

  if (REVIEW_RE.test(t)) {
    return {
      intent: "review",
      confidence: "medium",
      blueprint: classifyPlatformIntent(t).blueprint,
      reason: "review_signal",
      stayInConversation: false,
    };
  }

  if (ORGANIZE_RE.test(t) && !CREATE_LIKE(t)) {
    return {
      intent: "organize",
      confidence: "medium",
      blueprint: classifyPlatformIntent(t).blueprint,
      reason: "organize_signal",
      stayInConversation: false,
    };
  }

  if (PLAN_RE.test(t) && CREATE_LIKE(t)) {
    const base = classifyPlatformIntent(t);
    return {
      intent: "plan",
      confidence: base.confidence === "low" ? "medium" : base.confidence,
      blueprint: base.blueprint,
      reason: "plan_creation",
      stayInConversation: false,
    };
  }

  const base = classifyPlatformIntent(t);
  return {
    intent: base.intent,
    confidence: base.confidence,
    blueprint: base.blueprint,
    reason: base.reason,
    stayInConversation:
      base.intent === "know" || base.intent === "decide",
  };
}

function CREATE_LIKE(t: string): boolean {
  return /\b(?:create|plan|build|organize|host|run|design)\b/i.test(t);
}

function DECIDE_LIKE(t: string): boolean {
  return /\b(?:should i|help me (?:choose|decide)|which (?:option|one))\b/i.test(
    t,
  );
}
