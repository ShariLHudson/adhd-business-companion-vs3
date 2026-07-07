/**
 * Companion Intelligence™ — active session detection and direction changes.
 * Session wins unless the member explicitly changes direction.
 */

import { loadConversationSession } from "@/lib/conversationSession";
import { loadUniversalCreationSession } from "@/lib/universalCreation";
import { loadDiscoverySession } from "@/lib/estateBrain/discoveryMode";
import { isExplicitNavigationIntent } from "@/lib/conversationStabilization/goalClassifier";
import {
  isProjectNamingContinuation,
  isRetrieveIntent,
  isTemplateIntent,
} from "@/lib/conversationStabilization/goalClassifier";
import { isResearchIntent } from "@/lib/estateBrain/researchRouting";
import {
  isProjectCreationIntent,
} from "@/lib/createExperience/createExperienceRouting";
import {
  shouldEnterUniversalCreation,
} from "@/lib/universalCreation";
import { isSimpleCreateRequest } from "@/lib/universalCreation/createFastPath";
import { isSemanticNavigationIntent } from "@/lib/semanticIntentResolver/intentSignals";

export type CompanionActiveSession =
  | "universal_creation"
  | "conversation_session"
  | "project_naming"
  | "brain_dump"
  | "discovery"
  | "research"
  | "planning"
  | "decision"
  | "none";

export type ActiveSessionInput = {
  userText: string;
  lastAssistantText?: string | null;
  activeWorkflow?: string | null;
  workspace?: string | null;
};

const DIRECTION_CHANGE_RE =
  /\b(?:instead|actually|never mind|forget that|start over|switch to|let'?s do something else|change (?:topic|direction)|stop (?:this|that)|different (?:thing|topic))\b/i;

export function detectCompanionActiveSession(
  input: ActiveSessionInput,
): CompanionActiveSession {
  if (loadUniversalCreationSession()) return "universal_creation";
  if (isProjectNamingContinuation(input.lastAssistantText)) {
    return "project_naming";
  }

  const spine = loadConversationSession();
  if (spine?.researchState?.status === "in_progress") return "research";
  if (spine?.activeArtifact?.status === "active") {
    return "conversation_session";
  }

  if (loadDiscoverySession()) return "discovery";

  const ws = input.workspace ?? undefined;
  const flow = input.activeWorkflow ?? undefined;

  if (ws === "brain-dump" || flow === "brain-dump") return "brain_dump";
  if (ws === "plan-my-day" || flow === "plan-my-day") return "planning";
  if (ws === "decision-compass" || flow === "decision-compass") {
    return "decision";
  }

  return "none";
}

/** Member explicitly pivots — session lock releases. */
export function isExplicitDirectionChange(
  userText: string,
  activeSession: CompanionActiveSession,
): boolean {
  const t = userText.trim();
  if (!t || activeSession === "none") return false;

  if (isExplicitNavigationIntent(t) || isSemanticNavigationIntent(t)) return true;
  if (isResearchIntent(t)) return true;
  if (isRetrieveIntent(t)) return true;
  if (isTemplateIntent(t)) return true;
  if (isProjectCreationIntent(t)) return true;
  if (shouldEnterUniversalCreation(t) || isSimpleCreateRequest(t)) return true;
  if (DIRECTION_CHANGE_RE.test(t)) return true;

  return false;
}

export function isCompanionSessionLocked(
  activeSession: CompanionActiveSession,
  explicitDirectionChange: boolean,
): boolean {
  return activeSession !== "none" && !explicitDirectionChange;
}

export function companionSessionContinueHint(
  activeSession: CompanionActiveSession,
): string {
  const base =
    "One companion voice only. Stay inside the active session. Do not suggest Estate rooms, menus, or workflows. Do not mention routing or systems.";

  switch (activeSession) {
    case "universal_creation":
    case "project_naming":
    case "conversation_session":
      return `${base} Active: Create — continue the document naturally.`;
    case "brain_dump":
      return `${base} Active: Clear My Mind — capture only. Never launch Create.`;
    case "research":
      return `${base} Active: Research — stay in research. Never suggest rooms first.`;
    case "planning":
      return `${base} Active: Planning — one step at a time.`;
    case "decision":
      return `${base} Active: Decision support — listen first.`;
    case "discovery":
      return `${base} Active: Discovery — gentle orientation only.`;
    default:
      return base;
  }
}
