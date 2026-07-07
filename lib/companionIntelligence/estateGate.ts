/**
 * Estate Intelligence gate — secondary to active work.
 * Only query Estate KB when genuinely needed.
 */

import type { ArbitrationResult } from "@/lib/conversationStabilization/arbitration";
import { isExplicitNavigationIntent } from "@/lib/conversationStabilization/goalClassifier";
import { classifyHelpDiscoveryIntent } from "@/lib/estateHelpDiscoveryIntelligence/classifyHelpDiscoveryIntent";
import { isEstateGuideQuestion } from "@/lib/sparkKnowledge/estateGuide";
import { isSemanticNavigationIntent } from "@/lib/semanticIntentResolver/intentSignals";
import { semanticNeedsEstateIntelligence } from "@/lib/semanticIntentResolver/mapToRouting";

const ENVIRONMENT_NEED_RE =
  /\b(?:somewhere (?:quiet|peaceful)|need (?:a )?place|peaceful place|environment|atmosphere|setting)\b/i;

/**
 * True when Estate Knowledge Base should be queried this turn.
 */
export function shouldUseEstateIntelligence(
  arbitration: ArbitrationResult,
  userText: string,
  lastAssistantText?: string | null,
): boolean {
  if (semanticNeedsEstateIntelligence(arbitration.semanticIntent)) {
    return true;
  }

  if (arbitration.sessionLocked) {
    if (
      arbitration.explicitDirectionChange &&
      (isExplicitNavigationIntent(userText) || isSemanticNavigationIntent(userText))
    ) {
      return true;
    }
    return false;
  }

  const goal = arbitration.goal;

  if (goal === "explicit_navigation") return true;
  if (goal === "help_how_to" || goal === "discovery_estate") return true;
  if (/\bwhere(?:'s| is)\b/i.test(userText.trim())) return true;

  if (isEstateGuideQuestion(userText, lastAssistantText)) return true;

  const helpClass = classifyHelpDiscoveryIntent(userText);
  if (helpClass) return true;

  if (ENVIRONMENT_NEED_RE.test(userText)) return true;

  if (isSemanticNavigationIntent(userText)) return true;

  if (
    goal === "general_conversation" &&
    arbitration.activeSession === "none"
  ) {
    return false;
  }

  return false;
}

/** Estate suggestion flows (recommendation, implied need) — never during locked work. */
export function shouldAllowEstateSuggestions(
  arbitration: ArbitrationResult,
): boolean {
  if (arbitration.sessionLocked) return false;
  if (arbitration.goal === "research" || arbitration.goal === "retrieve") {
    return false;
  }
  if (arbitration.goal === "create" || arbitration.goal === "capture") {
    return false;
  }
  if (arbitration.goal === "continue_session") return false;
  return true;
}
