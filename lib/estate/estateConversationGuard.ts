/**
 * PATH A — Conversation protection. When unsure, stay in conversation.
 */

import { isPhysicalQuietPlaceRequest } from "./resolveEstatePlace";

const HARD_NAV_RE =
  /\b(?:take me to|go to|let(?:'s| us) go to|visit|head to|bring me to)\b/i;

/** Business / coaching topics without Estate place intent → conversation only. */
const CONVERSATION_TOPIC_RE =
  /\b(?:pricing|newsletter|subject line|launch plan|revenue|profit|margin|email sequence|sales page|copywriting|business model|value proposition|funnel|webinar)\b/i;

/** PATH A — coaching, learning, emotional support without place intent. */
const PATH_A_SUPPORT_RE =
  /\b(?:help me think|talk (?:this|it) through|coaching|coach me|learn about|want to learn|need to learn|how do i|what should i|feeling (?:anxious|sad|down|low)|emotional support)\b/i;

const PLACE_SIGNAL_RE =
  /\b(?:take me|go to|visit|somewhere|some place|quiet place|peaceful place|reading nook|greenhouse|conservatory|estate|soundscape|music|audio)\b/i;

/** PATH A — normal chat must not enter Estate navigation. */
export function isConversationOnlyTurn(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (HARD_NAV_RE.test(t)) return false;
  if (isPhysicalQuietPlaceRequest(t)) return false;
  if (PLACE_SIGNAL_RE.test(t)) return false;
  if (CONVERSATION_TOPIC_RE.test(t)) return true;
  if (PATH_A_SUPPORT_RE.test(t)) return true;
  return false;
}
