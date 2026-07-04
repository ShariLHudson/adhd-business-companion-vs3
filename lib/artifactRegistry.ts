/**
 * P0.9.1 — Business deliverable artifact registry.
 * Maps user language → artifact kind for Create routing and execute override.
 */

import { isCompanionFirstQuestion } from "./companionFirstWorkflow";
import { containsVisualStructurePhrase } from "./visualStructureRouting";

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

/** Verbs that signal the user wants to produce something now. */
export const ARTIFACT_EXECUTE_VERB_RE =
  /\b(?:create|build|develop|design|draft|write|generate|make|produce|put together|map out)\b/i;

export const ARTIFACT_NEED_VERB_RE =
  /\b(?:i need(?: a| to)?|want to|have to|need to|help me)\b/i;

const FUNNEL_PHRASE_RE =
  /\b(?:sales funnel|marketing funnel|lead generation funnel|lead funnel|email funnel|webinar funnel|workshop funnel|launch funnel|course funnel|membership funnel|automation funnel|customer journey|(?:lead magnet|product sale|membership|webinar|workshop)\s+funnel|funnel)\b/i;

const SEQUENCE_PHRASE_RE =
  /\b(?:follow-?up sequence|nurture sequence|sales sequence|email sequence|drip sequence)\b/i;

const REGISTRY_PATTERNS: { kind: RegistryArtifactKind; re: RegExp }[] = [
  { kind: "email_sequence", re: SEQUENCE_PHRASE_RE },
  { kind: "funnel", re: FUNNEL_PHRASE_RE },
  { kind: "client_avatar", re: /\b(?:client avatar|ideal client|buyer persona|icp)\b/i },
  { kind: "landing_page", re: /\b(?:landing page|lead capture page)\b/i },
  { kind: "lead_magnet", re: /\b(?:lead magnet|freebie|opt-?in)\b/i },
  { kind: "sales_page", re: /\b(?:sales page|sales letter)\b/i },
  { kind: "sales_script", re: /\b(?:sales script|call script|pitch script)\b/i },
  { kind: "social_post", re: /\b(?:social post|social media post|(?:facebook|linkedin|instagram) post|caption)\b/i },
  { kind: "content_plan", re: /\bcontent plan\b/i },
  { kind: "marketing_plan", re: /\bmarketing plan\b/i },
  { kind: "email", re: /\b(?:an? )?email\b/i },
  { kind: "sop", re: /\b(?:an? )?sop\b|standard operating procedure\b/i },
  { kind: "proposal", re: /\b(?:an? )?proposal\b/i },
  { kind: "checklist", re: /\b(?:an? )?checklist\b/i },
  { kind: "workflow", re: /\b(?:an? )?workflow\b/i },
  { kind: "offer", re: /\b(?:an? )?offer(?:\s+stack)?\b/i },
  {
    kind: "content",
    re: /\b(?:an? )?(?:content|blog post|newsletter|copy|article|video script)\b/i,
  },
];

/** All registered business deliverable phrases (for combined matching). */
export const BUSINESS_DELIVERABLE_RE = new RegExp(
  REGISTRY_PATTERNS.map(({ re }) => `(?:${re.source})`).join("|"),
  "i",
);

export function detectRegistryArtifact(text: string): RegistryArtifactKind | null {
  const t = text.trim();
  if (!t) return null;
  for (const { kind, re } of REGISTRY_PATTERNS) {
    if (re.test(t)) return kind;
  }
  return null;
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
  if (!detectRegistryArtifact(t)) return false;
  if (hasArtifactExecuteVerb(t)) return true;
  if (ARTIFACT_NEED_VERB_RE.test(t)) return true;
  return false;
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
