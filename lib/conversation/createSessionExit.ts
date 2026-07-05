/**
 * Exit / continue gates for active Universal Creation — no orchestrator imports.
 */

import {
  isMomentumForwardIntent,
  isProjectCreationIntent,
} from "@/lib/createExperience/createExperienceRouting";
import { detectEstateCoachingSituation } from "@/lib/estateBrain/estateCoaching";
import {
  resolveEstateNavigationDisambiguation,
  resolveEstateNavigationDiscovery,
} from "@/lib/estateExperiences/resolveEstateNavigation";
import { resolveInformationalKnowledgeLocalReply } from "@/lib/sparkKnowledge/informationalKnowledge";
import { isEstateGuideQuestion } from "@/lib/sparkKnowledge/estateGuide";
import {
  CREATE_FLOW_CONTINUATION_RE,
  isDevelopmentWorkFrustration,
  isSimpleCreateRequest,
} from "@/lib/universalCreation/createFastPath";
import { isCreateFlowAssistantContext } from "@/lib/universalCreation/createFlowContext";
import { UNIVERSAL_DOCUMENT_PLUGINS } from "@/lib/universalCreation/documentRegistry";
import type { PrimaryTurnDecision } from "./primaryTurnClassifier";
import {
  isEmotionalSupportThread,
} from "./emotionalDistressRouting";
import { shouldUseEmotionalFirstSequence } from "./emotionalFirstResponseSequence";
import { isOverwhelmProblem } from "@/lib/visualThinkingGuards";
import {
  isGenuineEmotionalDistress,
  shouldSuppressEmotionalTools,
} from "@/lib/messageClassification";

const KNOWLEDGE_QUESTION_RE =
  /\b(?:what|how|why|when|where|symptoms?|signs?|tell me|explain|define)\b/i;

function isFreshCreateRequest(text: string): boolean {
  const t = text.trim();
  if (!t || isDevelopmentWorkFrustration(t)) return false;
  if (isSimpleCreateRequest(t)) return isSimpleCreateRequest(t);
  for (const plugin of UNIVERSAL_DOCUMENT_PLUGINS) {
    if (plugin.id === "document") continue;
    if (plugin.detectPatterns.some((re) => re.test(t))) return true;
  }
  return false;
}

function fallbackPrimaryTurn(): PrimaryTurnDecision {
  return {
    type: "RELATIONSHIP_CHAT",
    confidence: "low",
    owner: "chat",
    reason: "create session exit",
    blockKernelNavigation: false,
    blockBridgeResponder: false,
    blockCollectionOffer: false,
    blockSecondaryResponders: false,
  };
}

function isEmotionalExitTurn(
  userText: string,
  lastAssistantText?: string | null,
): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (isEmotionalSupportThread(t, lastAssistantText)) return true;
  if (shouldUseEmotionalFirstSequence(t)) return true;
  if (isOverwhelmProblem(t)) return true;
  if (isGenuineEmotionalDistress(t) && !shouldSuppressEmotionalTools(t)) {
    return true;
  }
  return false;
}

export function shouldExitActiveCreateSession(
  userText: string,
  lastAssistantText?: string | null,
  primaryTurn?: PrimaryTurnDecision | null,
): boolean {
  const t = userText.trim();
  if (!t) return false;

  void (primaryTurn ?? fallbackPrimaryTurn());

  const last = lastAssistantText?.trim() ?? "";

  if (isProjectCreationIntent(t) || isMomentumForwardIntent(t)) return true;
  if (detectEstateCoachingSituation(t)) return true;

  /** Discovery answers may include conflict, fear, or stress — still content for the draft. */
  if (last && isCreateFlowAssistantContext(last)) {
    if (isFreshCreateRequest(t)) return false;
    if (CREATE_FLOW_CONTINUATION_RE.test(t)) return false;
    if (resolveInformationalKnowledgeLocalReply(t, lastAssistantText)) return true;
    if (isEstateGuideQuestion(t, lastAssistantText)) return true;
    if (/\?/.test(t) && KNOWLEDGE_QUESTION_RE.test(t)) return true;
    return false;
  }

  if (isEmotionalExitTurn(t, lastAssistantText)) return true;
  if (resolveInformationalKnowledgeLocalReply(t, lastAssistantText)) return true;
  if (isEstateGuideQuestion(t, lastAssistantText)) return true;

  if (
    resolveEstateNavigationDisambiguation(t) ||
    resolveEstateNavigationDiscovery(t)
  ) {
    return true;
  }

  if (isFreshCreateRequest(t)) return false;
  if (CREATE_FLOW_CONTINUATION_RE.test(t)) return false;

  if (/\?/.test(t) && KNOWLEDGE_QUESTION_RE.test(t)) {
    return true;
  }

  if (last && !isCreateFlowAssistantContext(last)) {
    return true;
  }

  return false;
}

export function shouldContinueActiveCreateSession(
  userText: string,
  lastAssistantText?: string | null,
  primaryTurn?: PrimaryTurnDecision | null,
): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (shouldExitActiveCreateSession(t, lastAssistantText, primaryTurn)) {
    return false;
  }
  return isCreateFlowAssistantContext(lastAssistantText);
}
