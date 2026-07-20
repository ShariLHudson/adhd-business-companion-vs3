/**
 * Sprint 2 — One Creation Platform (permanent architecture rule).
 *
 * Every Event-domain creation request must resolve through:
 * Intent → 045 Entrypoint → 051 Engine → Existing Work → Canonical Record
 * → 060 Recommendations → 061 State Machine → Canonical Workspace
 *
 * Document CREATE_FAST_PATH must never claim Workshop / Webinar / Event.
 */

export const ONE_CREATION_PLATFORM_RULE =
  "There shall be only one Creation Platform in Spark Estate. Every Event-domain request resolves through 045 → 051 → Canonical Creation Record → Workspace. No legacy document workshop paths. No exceptions.";

/** Gathering / event language — never document Universal Creation. */
const EVENT_DOMAIN_RE =
  /\b(?:workshop|webinar|conference|seminar|training(?:\s+session)?|retreat|summit|meetup|networking\s+event|panel(?:\s+discussion)?|launch\s+event|product\s+launch\s+event|launch\s+party|event\s+plan|multi-?day\s+event)\b/i;

const GATHERING_VERB_RE =
  /\b(?:plan|planning|host|hosting|organize|organizing|run|running)\s+(?:a|an|my|the)\s+(?:product\s+)?(?:launch|event|gathering)\b/i;

/**
 * True when this request belongs to the Universal Creation Platform (Events).
 * Document fast-path / Content Generator must yield.
 */
export function isEventDomainCreationRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  // Pure GTM launch plan (no gathering language) stays Marketing document Create
  if (
    /\blaunch\s+plan\b/i.test(t) &&
    !EVENT_DOMAIN_RE.test(t) &&
    !/\bevent\b/i.test(t)
  ) {
    return false;
  }
  return EVENT_DOMAIN_RE.test(t) || GATHERING_VERB_RE.test(t);
}

/** Catalog / asset types that must never open Projects or Content Generator. */
export function isEventDomainCatalogType(type: string | null | undefined): boolean {
  if (!type) return false;
  const n = type.trim().toLowerCase();
  return (
    n === "workshop" ||
    n === "workshop plan" ||
    n === "event plan" ||
    n === "retreat" ||
    n === "webinar" ||
    n === "conference"
  );
}

/** Document plugin ids retired from Event domain. */
export const RETIRED_EVENT_DOCUMENT_PLUGIN_IDS = [
  "workshop",
  "webinar",
] as const;
