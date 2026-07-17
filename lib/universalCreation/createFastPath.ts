/**
 * CREATE fast path — simple creation requests bypass estate routing.
 */

import { isProjectCreationIntent } from "@/lib/createExperience/createExperienceRouting";
import { isEmailAutomationOrInboxHelpRequest } from "@/lib/estate/emailAutomationHelp";
import { isGoogleSheetWorthyRequest } from "@/lib/googleSheetsIntelligence";
import { isKnowledgeQuestion } from "@/lib/knowledgeIntelligence";
import { isVisualStructureExecution } from "@/lib/visualStructureRouting";
import { shouldOfferVisualThinkingRecommendation } from "@/lib/visualThinkingOverreach";
import { pluginById } from "./documentRegistry";
import type { UniversalDocumentType } from "./types";

export const SIMPLE_CREATE_VERB_RE =
  /\b(?:help me (?:write|create|build|draft|compose|design|outline|plan|develop|make|generate)|(?:write|create|build|draft|compose|design|outline|plan|develop|generate|make)\s+(?:a|an|my|the|new|our))\b/i;

/** Building/fixing the product — not a universal-creation artifact request. */
export const DEVELOPMENT_WORK_FRUSTRATION_RE =
  /\b(?:trying to (?:make|get)|make (?:the |this |my )?(?:new )?(?:app|chat|companion|spark|system|software)\b.*\b(?:respond|work(?:ing)?|behave|supposed to)|(?:app|chat|companion|spark|system)\b.*\b(?:respond(?:ing)?|not working|doesn'?t work|won'?t work|supposed to)|(?:respond(?:ing)?|behave)\s+(?:like\s+)?(?:it'?s|its)\s+supposed|getting (?:the )?(?:app|chat|companion|spark|estate|system) to (?:work|behave|respond)|i am creating (?:this|my|an|the) app|developing (?:this|my|the) app)\b/i;

export function isDevelopmentWorkFrustration(userText: string): boolean {
  return DEVELOPMENT_WORK_FRUSTRATION_RE.test(userText.trim());
}

const EXPLICIT_ROOM_NAV_RE =
  /\b(?:take me to|bring me to|go to|open|show me|step into)\b/i;

const ARTIFACT_INFERENCE: ReadonlyArray<{
  re: RegExp;
  type: UniversalDocumentType;
}> = [
  { re: /\b(?:sales funnel|marketing funnel|lead funnel|conversion funnel)\b/i, type: "sales_funnel" },
  { re: /\b(?:website copy|web copy|homepage|home page|landing page|site copy)\b/i, type: "website" },
  { re: /\bworkshop\b/i, type: "workshop" },
  { re: /\bwebinar\b/i, type: "webinar" },
  { re: /\bpresentation\b/i, type: "presentation" },
  { re: /\b(?:lead magnet|lead-magnet)\b/i, type: "guide" },
  { re: /\bclient avatar\b/i, type: "guide" },
  { re: /\bonboarding guide\b/i, type: "training_manual" },
  { re: /\b(?:social media campaign|social campaign)\b/i, type: "business_plan" },
  { re: /\blinkedin post\b/i, type: "social_post" },
  { re: /\bmarketing plan\b/i, type: "business_plan" },
  { re: /\bbusiness plan\b/i, type: "business_plan" },
  { re: /\bnewsletter\b/i, type: "newsletter" },
  { re: /\b(?:an? )?sop\b|standard operating procedure\b/i, type: "sop" },
  { re: /\bproposal\b/i, type: "proposal" },
  // Require writing intent — bare "email" / "email system" is NOT Create.
  {
    re: /\b(?:write|draft|compose|send|craft)\b.{0,48}\b(?:an?\s+)?e-?mails?\b|\b(?:an?\s+)?e-?mail\s+to\b|\bhelp me (?:write|draft|compose)\b.{0,36}\be-?mails?\b/i,
    type: "email",
  },
  { re: /\bcourse\b/i, type: "course" },
];

export function inferDocumentTypeFromCreateText(
  userText: string,
): UniversalDocumentType | null {
  const t = userText.trim();
  if (!t) return null;
  for (const { re, type } of ARTIFACT_INFERENCE) {
    if (re.test(t)) return type;
  }
  return null;
}

/** Strategy Library / strategy builder — not Universal Creation document. */
export function isStrategyCreateOrLibraryRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (!/\bstrateg(?:y|ies|ic)\b/i.test(t)) return false;
  // Explicit non-strategy documents that merely mention strategy language later.
  if (
    /\b(?:create|write|draft|compose)\b[\s\S]{0,36}\b(?:letter|proposal|newsletter|sop)\b/i.test(
      t,
    ) &&
    !/\bstrateg(?:y|ies)\b/i.test(t)
  ) {
    return false;
  }
  return true;
}

export function isSimpleCreateRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t || EXPLICIT_ROOM_NAV_RE.test(t)) return false;
  if (isEmailAutomationOrInboxHelpRequest(t)) return false;
  if (isKnowledgeQuestion(t)) return false;
  if (isProjectCreationIntent(t)) return false;
  if (isDevelopmentWorkFrustration(t)) return false;
  if (isVisualStructureExecution(t)) return false;
  if (isGoogleSheetWorthyRequest(t)) return false;
  // CB-022 addendum — strategy ≠ document create.
  if (isStrategyCreateOrLibraryRequest(t)) return false;
  if (SIMPLE_CREATE_VERB_RE.test(t)) return true;
  const inferred = inferDocumentTypeFromCreateText(t);
  if (
    inferred &&
    shouldOfferVisualThinkingRecommendation(t) &&
    !SIMPLE_CREATE_VERB_RE.test(t)
  ) {
    return false;
  }
  return inferred !== null;
}

export function createFastPathRecoveryLine(userText: string): string {
  const inferred = inferDocumentTypeFromCreateText(userText);
  const label = (inferred ? pluginById(inferred)?.label : null)?.toLowerCase();
  if (label && label !== "document") {
    return `Let's keep shaping this ${label} right here together. What part should we start with?`;
  }
  return "Let's keep going right here together. What's the first piece you want to figure out?";
}

export function isCreateFastPathRecoveryMessage(text: string): boolean {
  const t = text.trim();
  return (
    /\blet'?s keep shaping this .+ right here together\b/i.test(t) ||
    /\blet'?s keep going right here together\b/i.test(t) ||
    /\bran into a problem starting the .* builder\b/i.test(t)
  );
}

/** Member wants to continue after a create offer or recovery line. */
export const CREATE_FLOW_CONTINUATION_RE =
  /\b(?:how do (?:we|i) get started|let'?s start|where do we begin|what'?s (?:the )?first step|help me start|what do you need from me|yes let'?s|okay let'?s|ready when you are)\b/i;

export type CreateFastPathLogEntry = {
  turn?: number;
  userText: string;
  documentType: UniversalDocumentType | null;
};

declare global {
  interface Window {
    __sparkCreateFastPathLog?: CreateFastPathLogEntry[];
  }
}

export function logCreateFastPath(entry: CreateFastPathLogEntry): void {
  if (typeof window !== "undefined") {
    const log = window.__sparkCreateFastPathLog ?? [];
    log.push(entry);
    window.__sparkCreateFastPathLog = log.slice(-40);
  }
  if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info("[CREATE_FAST_PATH]", entry);
  }
}
