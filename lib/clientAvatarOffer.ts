/**
 * Client Avatar Builder — deterministic exploratory offer.
 *
 * Regular-chat exploratory language about the ideal customer / audience creates
 * a structured workspace offer whose destination is the existing `client-avatars`
 * section. Acceptance ("yes" / "go" / "take me there" / "let's do it" / "that
 * sounds good") navigates through the existing workspaceOffer acceptance seam.
 *
 * This is a detector + offer builder for one existing destination — not a new
 * router. Explicit navigation commands are handled earlier by
 * detectUniversalCapabilityRequest (immediate open).
 */

import type { WorkspaceOffer } from "./workspaceMode";
import { isActiveQuestionAcceptance } from "./conversationConfirmationGate";

/**
 * Exploratory ideal-customer / audience phrasing. Multi-word anchored so bare
 * "customer" / "help" / "people" / "audience" never trigger the builder.
 */
const EXPLORATORY_AVATAR_RE =
  /\b(?:(?:client|customer) avatars?|ideal (?:client|customer)s?|(?:customer|buyer) personas?|target (?:audience|customer)|who (?:do|should) i (?:help|serve)|people i (?:help|serve))\b/i;

export function detectClientAvatarExploration(text: string): boolean {
  return EXPLORATORY_AVATAR_RE.test(text.trim());
}

export const CLIENT_AVATAR_OFFER_LINE =
  "That's exactly what the Client Avatar Builder is designed to help with. It will guide you one question at a time and save your answers in People I Help so you can use them throughout your Business Estate. Would you like me to take you there?";

export function buildClientAvatarWorkspaceOffer(): WorkspaceOffer {
  return {
    section: "client-avatars",
    buttonLabel: "Open the Client Avatar Builder",
    line: CLIENT_AVATAR_OFFER_LINE,
  };
}

/** Natural acceptance of the Client Avatar offer — "that sounds good" beyond B2. */
const EXTRA_AVATAR_ACCEPT_RE = /^(?:that )?sounds (?:good|great|perfect)\b/i;

/**
 * Acceptance of an active Client Avatar offer. Reuses the B2 active-question
 * vocabulary (yes / sure / okay / go / take me there / let's do it / go ahead /
 * continue …) plus "that sounds good". Scoped to the offer — never a global
 * acceptance rule.
 */
export function isClientAvatarOfferAcceptance(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isActiveQuestionAcceptance(t)) return true;
  return EXTRA_AVATAR_ACCEPT_RE.test(t);
}
