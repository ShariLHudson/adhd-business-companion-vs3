/**
 * Semantic action signals — intent verbs and patterns (not exact phrase gates).
 */

import {
  classifyConversationGoal,
  isCaptureIntent,
  isExplicitNavigationIntent,
  isRetrieveIntent,
  type ConversationGoal,
} from "@/lib/conversationStabilization/goalClassifier";
import { isResearchIntent } from "@/lib/estateBrain/researchRouting";
import {
  isProjectCreationIntent,
} from "@/lib/createExperience/createExperienceRouting";
import { shouldEnterUniversalCreation } from "@/lib/universalCreation";
import { isSimpleCreateRequest } from "@/lib/universalCreation/createFastPath";
import { isTemplateIntent } from "@/lib/conversationStabilization/goalClassifier";
import type { SemanticIntentContext, SemanticMemberAction } from "./types";

/** Visit / go / see — meaning, not only “take me to”. */
export const SEMANTIC_NAVIGATE_SIGNAL_RE =
  /\b(?:take me(?: to)?|go to|head to|bring me(?: to)?|visit(?: the)?|show me(?: the)?|see(?: the)?|i'?d like to (?:see|visit|go(?: to)?)|can we (?:go|visit)|let'?s (?:go|visit)|wander to|explore(?: the)?|open(?: the)? (?:room|place|space))\b/i;

export const SEMANTIC_WHERE_SIGNAL_RE =
  /\b(?:where(?:'s| is| can i find)|where's that|find (?:me )?(?:the )?(?:place|room|spot))\b/i;

export const SEMANTIC_OPEN_FEATURE_SIGNAL_RE =
  /\bopen\s+(?:the\s+)?/i;

export const SEMANTIC_KNOWLEDGE_SIGNAL_RE =
  /\b(?:who is|what is|what's|tell me about|can you tell me about)\b/i;

export const SEMANTIC_HOW_TO_SIGNAL_RE =
  /\b(?:how do i|how can i|how does (?:this|that) work|where do i find|where are my)\b/i;

export const SEMANTIC_DISCOVERY_SIGNAL_RE =
  /\b(?:something (?:i haven't|new)|what haven't i explored|show me something i haven't|haven't discovered)\b/i;

export const SEMANTIC_RECOMMENDATION_SIGNAL_RE =
  /\b(?:somewhere (?:quiet|peaceful|calm)|need (?:a )?(?:peaceful|quiet|calm)|i want somewhere|i'd like somewhere|can we go somewhere)\b/i;

export type DetectedActionSignal = {
  action: SemanticMemberAction;
  strength: "strong" | "moderate" | "weak";
};

export function detectNavigateSignal(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (SEMANTIC_DISCOVERY_SIGNAL_RE.test(t)) return false;
  if (detectOpenFeatureSignal(t)) return false;
  if (isRetrieveIntent(t) || isTemplateIntent(t) || isResearchIntent(t)) {
    return false;
  }
  if (
    /\bopen\b/i.test(t) &&
    /\b(?:document|project|file|spreadsheet|email|draft|sop|template|reminders?|settings)\b/i.test(
      t,
    )
  ) {
    return false;
  }
  return SEMANTIC_NAVIGATE_SIGNAL_RE.test(t);
}

export function detectWhereSignal(text: string): boolean {
  return SEMANTIC_WHERE_SIGNAL_RE.test(text.trim());
}

export function detectOpenFeatureSignal(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (!SEMANTIC_OPEN_FEATURE_SIGNAL_RE.test(t)) return false;
  if (/\b(?:document|project|file|room|place|door|window)\b/i.test(t)) {
    return false;
  }
  return /\b(?:reminders?|settings|clear my mind|my thoughts|guidebook|journal)\b/i.test(
    t,
  );
}

export function tryRegexFastPathGoal(
  context: SemanticIntentContext,
): ConversationGoal | null {
  const trimmed = context.userText.trim();
  if (SEMANTIC_DISCOVERY_SIGNAL_RE.test(trimmed)) {
    return "discovery_estate";
  }
  if (detectOpenFeatureSignal(trimmed)) {
    return "help_how_to";
  }

  const goal = classifyConversationGoal(context.userText, {
    lastAssistantText: context.lastAssistantText,
    activeWorkflow: context.activeWorkflow,
    workspace: context.workspace,
    sessionLocked: context.sessionLocked,
    explicitDirectionChange: context.explicitDirectionChange,
    activeSession: context.activeSession as
      | import("@/lib/companionIntelligence/activeSession").CompanionActiveSession
      | undefined,
  });

  if (goal === "general_conversation") return null;

  if (goal === "explicit_navigation" && isExplicitNavigationIntent(context.userText)) {
    return goal;
  }

  const taskGoals: ConversationGoal[] = [
    "continue_session",
    "capture",
    "create",
    "research",
    "retrieve",
    "plan_strategy",
    "decision_support",
    "help_how_to",
    "discovery_estate",
  ];

  if (taskGoals.includes(goal)) return goal;
  return null;
}

export function inferActionFromSignals(
  text: string,
  context: SemanticIntentContext,
): DetectedActionSignal {
  const t = text.trim();

  if (context.sessionLocked && !context.explicitDirectionChange) {
    if (
      isCaptureIntent(t, {
        activeWorkflow: context.activeWorkflow,
        workspace: context.workspace,
      })
    ) {
      return { action: "capture", strength: "strong" };
    }
    return { action: "continue_session", strength: "strong" };
  }

  if (isResearchIntent(t)) return { action: "research", strength: "strong" };
  if (isRetrieveIntent(t)) return { action: "retrieve", strength: "strong" };

  if (SEMANTIC_DISCOVERY_SIGNAL_RE.test(t)) {
    return { action: "discovery", strength: "strong" };
  }

  if (detectOpenFeatureSignal(t)) {
    return { action: "open_feature", strength: "strong" };
  }
  if (
    isProjectCreationIntent(t) ||
    isTemplateIntent(t) ||
    shouldEnterUniversalCreation(t) ||
    isSimpleCreateRequest(t)
  ) {
    return { action: "create", strength: "strong" };
  }

  if (SEMANTIC_HOW_TO_SIGNAL_RE.test(t)) {
    return { action: "ask_how_to", strength: "moderate" };
  }

  if (detectWhereSignal(t)) {
    return { action: "ask_knowledge", strength: "moderate" };
  }

  if (detectNavigateSignal(t)) {
    return { action: "navigate", strength: "moderate" };
  }

  if (SEMANTIC_KNOWLEDGE_SIGNAL_RE.test(t)) {
    return { action: "ask_knowledge", strength: "moderate" };
  }

  if (SEMANTIC_RECOMMENDATION_SIGNAL_RE.test(t)) {
    return { action: "recommendation", strength: "moderate" };
  }

  return { action: "conversation", strength: "weak" };
}

export function isSemanticNavigationIntent(text: string): boolean {
  return detectNavigateSignal(text);
}
