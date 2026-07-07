/**
 * Emergency stabilization — verb/goal-first classifier (before noun/room matching).
 */

import { isResearchIntent } from "@/lib/estateBrain/researchRouting";
import {
  isProjectCreationIntent,
  isMomentumForwardIntent,
} from "@/lib/createExperience/createExperienceRouting";
import { isKnowledgeQuestion } from "@/lib/knowledgeIntelligence";
import { shouldEnterUniversalCreation } from "@/lib/universalCreation";
import { isRegistryArtifactExecution } from "@/lib/artifactRegistry";
import { isSimpleCreateRequest } from "@/lib/universalCreation/createFastPath";
import type { CompanionActiveSession } from "@/lib/companionIntelligence/activeSession";

export type ConversationGoal =
  | "continue_session"
  | "explicit_navigation"
  | "capture"
  | "create"
  | "research"
  | "retrieve"
  | "plan_strategy"
  | "decision_support"
  | "help_how_to"
  | "discovery_estate"
  | "general_conversation";

const EXPLICIT_NAV_RE =
  /\b(?:take me(?: to)?|go to|bring me(?: to)?|head to|visit(?: the)?|show me(?: the)?|open(?: the)?)\b/i;

const RETRIEVE_CONTENT_RE =
  /\b(?:find(?: me)?(?: a)?|pull up|show me(?: my)?|look up(?: my)?|get me)\b.{0,48}\b(?:snippet|template|document|content|section|paragraph|quote|excerpt|passage|info(?:rmation)?|article)\b/i;

const TEMPLATE_INTENT_RE =
  /\b(?:need|want|looking for|find)\s+(?:a\s+)?template\b/i;

const PLAN_STRATEGY_RE =
  /\b(?:marketing strategy|business plan|roadmap|quarterly plan|action plan|prioriti[sz]e my)\b/i;

const DECISION_SUPPORT_RE = /\bhelp me decide\b/i;

const CAPTURE_TASK_RE =
  /^(?:make|call|email|text|schedule|book|buy|pick up|send|pay|cancel|reschedule)\b/i;

const UNCERTAINTY_RE =
  /^(?:i\s+)?(?:don'?t|do not)\s+know\b|^(?:not sure|no idea|unsure)\b/i;

export function isRetrieveIntent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (RETRIEVE_CONTENT_RE.test(t)) return true;
  if (
    /\bfind me\b/i.test(t) &&
    /\b(?:snippet|excerpt|passage|template|content|section)\b/i.test(t)
  ) {
    return true;
  }
  if (
    /\bfind me\b/i.test(t) &&
    /\babout\b/i.test(t) &&
    !/\b(?:place|room|somewhere|peaceful|quiet|spot)\b/i.test(t)
  ) {
    return true;
  }
  return false;
}

export function isTemplateIntent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (TEMPLATE_INTENT_RE.test(t)) return true;
  if (/\btemplate for\b/i.test(t)) return true;
  return false;
}

export function isExplicitNavigationIntent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isRetrieveIntent(t) || isTemplateIntent(t)) return false;
  if (isResearchIntent(t)) return false;
  if (
    /\b(?:show me something (?:i haven'?t|new)|what haven'?t i explored|something i haven'?t)\b/i.test(
      t,
    )
  ) {
    return false;
  }
  if (
    /\bopen\b/i.test(t) &&
    /\b(?:document|project|file|spreadsheet|email|draft|sop|template|reminders?|settings|clear my mind|my thoughts|guidebook|journal)\b/i.test(
      t,
    )
  ) {
    return false;
  }
  return EXPLICIT_NAV_RE.test(t);
}

export function isCaptureIntent(
  text: string,
  opts?: { activeWorkflow?: string | null; workspace?: string | null },
): boolean {
  const t = text.trim();
  if (!t) return false;
  const inBrainDump =
    opts?.activeWorkflow === "brain-dump" || opts?.workspace === "brain-dump";
  if (!inBrainDump) return false;
  if (isResearchIntent(t) || isProjectCreationIntent(t)) return false;
  if (shouldEnterUniversalCreation(t) || isSimpleCreateRequest(t)) return false;
  if (t.split(/\s+/).length > 18) return false;
  return CAPTURE_TASK_RE.test(t) || inBrainDump;
}

export function isProjectNamingContinuation(
  lastAssistantText?: string | null,
): boolean {
  const last = lastAssistantText?.trim() ?? "";
  if (!last) return false;
  return /what should we call it/i.test(last);
}

export function isCreationUncertainty(text: string): boolean {
  return UNCERTAINTY_RE.test(text.trim());
}

export function classifyConversationGoal(
  userText: string,
  context?: {
    lastAssistantText?: string | null;
    hasUniversalCreationSession?: boolean;
    hasConversationSession?: boolean;
    activeWorkflow?: string | null;
    workspace?: string | null;
    activeSession?: CompanionActiveSession;
    sessionLocked?: boolean;
    explicitDirectionChange?: boolean;
  },
): ConversationGoal {
  const t = userText.trim();
  if (!t) return "general_conversation";

  if (context?.sessionLocked && !context?.explicitDirectionChange) {
    if (context.activeSession === "brain_dump") return "capture";
    if (context.activeSession === "research") return "continue_session";
    if (
      context?.hasUniversalCreationSession ||
      context?.hasConversationSession ||
      isProjectNamingContinuation(context?.lastAssistantText) ||
      context.activeSession === "planning" ||
      context.activeSession === "decision" ||
      context.activeSession === "discovery"
    ) {
      return "continue_session";
    }
  }

  if (
    context?.hasUniversalCreationSession ||
    context?.hasConversationSession ||
    isProjectNamingContinuation(context?.lastAssistantText)
  ) {
    if (
      isProjectNamingContinuation(context?.lastAssistantText) ||
      context?.hasUniversalCreationSession
    ) {
      return "continue_session";
    }
  }

  if (isCreationUncertainty(t) && context?.hasUniversalCreationSession) {
    return "continue_session";
  }

  if (isExplicitNavigationIntent(t)) return "explicit_navigation";

  if (isCaptureIntent(t, context)) return "capture";

  if (
    isProjectCreationIntent(t) ||
    isRegistryArtifactExecution(t) ||
    shouldEnterUniversalCreation(t) ||
    isSimpleCreateRequest(t)
  ) {
    return "create";
  }

  if (isTemplateIntent(t)) return "create";

  if (isResearchIntent(t)) return "research";

  if (isRetrieveIntent(t)) return "retrieve";

  if (isMomentumForwardIntent(t) || PLAN_STRATEGY_RE.test(t)) {
    return "plan_strategy";
  }

  if (DECISION_SUPPORT_RE.test(t)) return "decision_support";

  if (isKnowledgeQuestion(t)) return "help_how_to";

  return "general_conversation";
}

/** Goals that must block estate recommendation / implied-need room suggestions. */
export const TASK_GOALS_BLOCKING_ESTATE: ReadonlySet<ConversationGoal> =
  new Set([
    "continue_session",
    "capture",
    "create",
    "research",
    "retrieve",
    "plan_strategy",
  ]);
