/**
 * P0.9.1 — Business deliverable artifact registry.
 * Maps user language → artifact kind for Create routing and execute override.
 */

import { isCompanionFirstQuestion } from "./companionFirstWorkflow";
import { containsVisualStructurePhrase } from "./visualStructureRouting";
import {
  ARTIFACT_EXECUTE_VERB_RE,
  ARTIFACT_NEED_VERB_RE,
  artifactTermExpressesCreation,
  hasArtifactReceiveLanguage,
  type ArtifactCollisionClass,
} from "./artifactIntent";

// Re-exported for compatibility — the canonical definitions now live in
// artifactIntent (the centralized artifact-intent policy).
export { ARTIFACT_EXECUTE_VERB_RE, ARTIFACT_NEED_VERB_RE };

export type RegistryArtifactKind =
  | "email"
  | "sop"
  | "marketing_plan"
  | "proposal"
  | "checklist"
  | "workflow"
  | "content"
  | "funnel"
  | "email_sequence"
  | "landing_page"
  | "lead_magnet"
  | "offer"
  | "sales_page"
  | "sales_script"
  | "social_post"
  | "client_avatar"
  | "content_plan";

const FUNNEL_PHRASE_RE =
  /\b(?:sales funnel|marketing funnel|lead generation funnel|lead funnel|email funnel|webinar funnel|workshop funnel|launch funnel|course funnel|membership funnel|automation funnel|customer journey|(?:lead magnet|product sale|membership|webinar|workshop)\s+funnel|funnel)\b/i;

const SEQUENCE_PHRASE_RE =
  /\b(?:follow-?up sequence|nurture sequence|sales sequence|email sequence|drip sequence)\b/i;

type RegistryPattern = {
  kind: RegistryArtifactKind;
  re: RegExp;
  collisionClass: ArtifactCollisionClass;
};

// Mixed kinds (content, social_post) are split so each grammatical sense carries
// its own collision class. First-match order (and thus the returned kind) is
// unchanged from the pre-split registry.
const REGISTRY_PATTERNS: RegistryPattern[] = [
  { kind: "email_sequence", re: SEQUENCE_PHRASE_RE, collisionClass: "unambiguous_deliverable" },
  { kind: "funnel", re: FUNNEL_PHRASE_RE, collisionClass: "unambiguous_deliverable" },
  { kind: "client_avatar", re: /\b(?:client avatar|ideal client|buyer persona|icp)\b/i, collisionClass: "unambiguous_deliverable" },
  { kind: "landing_page", re: /\b(?:landing page|lead capture page)\b/i, collisionClass: "unambiguous_deliverable" },
  { kind: "lead_magnet", re: /\b(?:lead magnet|freebie|opt-?in)\b/i, collisionClass: "unambiguous_deliverable" },
  { kind: "sales_page", re: /\b(?:sales page|sales letter)\b/i, collisionClass: "unambiguous_deliverable" },
  { kind: "sales_script", re: /\b(?:sales script|call script|pitch script)\b/i, collisionClass: "unambiguous_deliverable" },
  { kind: "social_post", re: /\b(?:social post|social media post|(?:facebook|linkedin|instagram) post)\b/i, collisionClass: "unambiguous_deliverable" },
  { kind: "social_post", re: /\bcaption\b/i, collisionClass: "receive_noun" },
  { kind: "content_plan", re: /\bcontent plan\b/i, collisionClass: "unambiguous_deliverable" },
  { kind: "marketing_plan", re: /\bmarketing plan\b/i, collisionClass: "unambiguous_deliverable" },
  { kind: "email", re: /\b(?:an? )?email\b/i, collisionClass: "verb_collision" },
  { kind: "sop", re: /\b(?:an? )?sop\b|standard operating procedure\b/i, collisionClass: "unambiguous_deliverable" },
  { kind: "proposal", re: /\b(?:an? )?proposal\b/i, collisionClass: "receive_noun" },
  { kind: "checklist", re: /\b(?:an? )?checklist\b/i, collisionClass: "receive_noun" },
  { kind: "workflow", re: /\b(?:an? )?workflow\b/i, collisionClass: "mention_requires_creation_signal" },
  { kind: "offer", re: /\b(?:an? )?offer(?:\s+stack)?\b/i, collisionClass: "verb_collision" },
  { kind: "content", re: /\b(?:blog post|newsletter|video script)\b/i, collisionClass: "unambiguous_deliverable" },
  { kind: "content", re: /\b(?:an? )?(?:content|copy|article)\b/i, collisionClass: "verb_collision" },
];

/** All registered business deliverable phrases (for combined matching). */
export const BUSINESS_DELIVERABLE_RE = new RegExp(
  REGISTRY_PATTERNS.map(({ re }) => `(?:${re.source})`).join("|"),
  "i",
);

/** The first matching registry entry (kind + collision class). */
function detectRegistryArtifactEntry(text: string): RegistryPattern | null {
  const t = text.trim();
  if (!t) return null;
  for (const entry of REGISTRY_PATTERNS) {
    if (entry.re.test(t)) return entry;
  }
  return null;
}

export function detectRegistryArtifact(text: string): RegistryArtifactKind | null {
  return detectRegistryArtifactEntry(text)?.kind ?? null;
}

export function hasArtifactExecuteVerb(text: string): boolean {
  return ARTIFACT_EXECUTE_VERB_RE.test(text.trim());
}

const FEATURE_DISCOVERY_RE =
  /\b(?:is there a feature|does this app|can this app|where (?:do|can) i (?:find|save|access))\b/i;

/** User wants to build/produce a registered business deliverable now. */
export function isRegistryArtifactExecution(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (containsVisualStructurePhrase(t)) return false;
  if (
    isCompanionFirstQuestion(t) &&
    !ARTIFACT_NEED_VERB_RE.test(t) &&
    !hasArtifactExecuteVerb(t)
  ) {
    return false;
  }
  if (FEATURE_DISCOVERY_RE.test(t)) return false;
  const entry = detectRegistryArtifactEntry(t);
  if (!entry) return false;
  // Centralized artifact-intent policy: verb-collision / mention terms require an
  // explicit creation verb; receive-nouns exclude "from someone" language; only
  // unambiguous deliverables keep the bare need-verb shorthand.
  return artifactTermExpressesCreation({
    text: t,
    collisionClass: entry.collisionClass,
  });
}

/**
 * True when the text NAMES a deliverable in the artifact-NOUN sense — distinct
 * from `isRegistryArtifactExecution` ("requests creation"). Verb-collision terms
 * used as errands ("email the client", "offer a refund", "copy the files") do NOT
 * count; receive constructions ("a proposal from the vendor") do NOT count;
 * genuine deliverable nouns (packing checklist, client proposal, caption,
 * marketing plan) DO. Reuses the centralized collision classification — no new
 * vocabulary. Consumed by the (currently unwired) conversation-boundary
 * expansion signal.
 */
export function namesDeliverableTerm(text: string): boolean {
  const entry = detectRegistryArtifactEntry(text);
  if (!entry) return false;
  switch (entry.collisionClass) {
    case "unambiguous_deliverable":
      return true;
    case "receive_noun":
      // A named deliverable noun, unless it is expected FROM someone else.
      return !hasArtifactReceiveLanguage(text);
    case "verb_collision":
    case "mention_requires_creation_signal":
      // email/offer/copy (verb errands) and bare workflow mentions are not
      // deliverable additions on their own.
      return false;
    default: {
      const _exhaustive: never = entry.collisionClass;
      return _exhaustive;
    }
  }
}

export function registryArtifactLabel(kind: RegistryArtifactKind): string {
  switch (kind) {
    case "email":
      return "email";
    case "sop":
      return "SOP";
    case "marketing_plan":
      return "marketing plan";
    case "content_plan":
      return "content plan";
    case "proposal":
      return "proposal";
    case "checklist":
      return "checklist";
    case "workflow":
      return "workflow";
    case "content":
      return "content";
    case "funnel":
      return "funnel";
    case "email_sequence":
      return "email sequence";
    case "landing_page":
      return "landing page";
    case "lead_magnet":
      return "lead magnet";
    case "offer":
      return "offer";
    case "sales_page":
      return "sales page";
    case "sales_script":
      return "sales script";
    case "social_post":
      return "social post";
    case "client_avatar":
      return "client avatar";
  }
}

/** Canonical Create catalog label for registry artifact kinds (P0.10.2). */
export function registryArtifactKindToCreateItemType(
  kind: RegistryArtifactKind,
): string {
  switch (kind) {
    case "email":
      return "Email";
    case "sop":
      return "SOP";
    case "marketing_plan":
      return "Marketing Plan";
    case "content_plan":
      return "Content Plan";
    case "proposal":
      return "Proposal";
    case "checklist":
      return "Checklist";
    case "workflow":
      return "Workflow";
    case "content":
      return "Document";
    case "funnel":
      return "Sales Funnel";
    case "email_sequence":
      return "Email Sequence";
    case "landing_page":
      return "Landing Page";
    case "lead_magnet":
      return "Lead Magnet";
    case "offer":
      return "Offer";
    case "sales_page":
      return "Sales Page";
    case "sales_script":
      return "Sales Script";
    case "social_post":
      return "Social Post";
    case "client_avatar":
      return "Client Avatar";
    default:
      return registryArtifactLabel(kind);
  }
}
