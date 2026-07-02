/**
 * Classify create posture — explore in chat vs. open workspace to build.
 */

import { matchCatalogFromText } from "@/lib/createCatalog";
import {
  isContentBrainstorming,
  isExplicitCreationRequest,
  shouldBlockArtifactPipeline,
} from "@/lib/messageClassification";

const SOFT_CREATE_RE =
  /\b(?:might want|thinking about|considering|maybe|possibly|not sure yet|exploring|what would|what is possible|what's possible|examples of|how would i|could i create|wondering if i should|toying with)\b/i;

const STRUCTURED_ARTIFACT_RE =
  /\b(?:newsletter|workshop|offer|sales page|sop|content plan|business plan|client avatar|email sequence|pricing plan|course outline|presentation|lead magnet|landing page|4-part offer|four-part offer|workshop outline|marketing plan|proposal)\b/i;

const BUILD_VERB_RE =
  /\b(?:create|build|make|write|draft|develop|put together|shape|outline)\b/i;

const LEARN_BEFORE_CREATE_RE =
  /\b(?:research|learn|read|study)\b.*\b(?:first|before)\b/i;

const CHANGE_DIRECTION_RE =
  /\b(?:change direction|different idea|actually|instead|never mind|start over)\b/i;

/** Stay in normal chat — exploring, unsure, brainstorming, learning first. */
export function isSoftCreateExploration(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isExplicitCreationRequest(t)) return false;
  if (isContentBrainstorming(t)) return true;
  if (shouldBlockArtifactPipeline(t)) return true;
  if (SOFT_CREATE_RE.test(t) && BUILD_VERB_RE.test(t)) return true;
  if (/\b(?:what is possible|show me examples|give me examples)\b/i.test(t)) {
    return true;
  }
  if (
    /\b(?:don't know|not sure|unsure)\b/i.test(t) &&
    /\b(?:what|how|which|whether)\b/i.test(t)
  ) {
    return true;
  }
  if (LEARN_BEFORE_CREATE_RE.test(t)) return true;
  if (CHANGE_DIRECTION_RE.test(t)) return true;
  if (/\b(?:ask|asking)\b.*\b(?:general|question)\b/i.test(t)) return true;
  return false;
}

/** Clear structured build intent — still may need facilitation before workspace. */
export function hasStructuredBuildIntent(text: string): boolean {
  const t = text.trim();
  if (!t || isSoftCreateExploration(t)) return false;
  if (!STRUCTURED_ARTIFACT_RE.test(t) && !matchCatalogFromText(t)?.type) {
    return false;
  }
  return BUILD_VERB_RE.test(t) || isExplicitCreationRequest(t);
}

export function shouldStayInChatForCreation(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isSoftCreateExploration(t)) return true;
  if (BUILD_VERB_RE.test(t) && !hasStructuredBuildIntent(t)) return true;
  return false;
}

export function resolveArtifactTypeFromText(text: string): string | null {
  return matchCatalogFromText(text)?.type ?? null;
}
