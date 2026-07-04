/**
 * CREATE fast path — simple creation requests bypass estate routing.
 */

import { isProjectCreationIntent } from "@/lib/createExperience/createExperienceRouting";
import { pluginById } from "./documentRegistry";
import type { UniversalDocumentType } from "./types";

export const SIMPLE_CREATE_VERB_RE =
  /\b(?:help me (?:write|create|build|draft|compose|design|outline|plan|develop|make|generate)|(?:write|create|build|draft|compose|design|outline|plan|develop|generate|make)\s+(?:a|an|my|the|new|our))\b/i;

const EXPLICIT_ROOM_NAV_RE =
  /\b(?:take me to|bring me to|go to|open|show me|step into)\b/i;

const ARTIFACT_INFERENCE: ReadonlyArray<{
  re: RegExp;
  type: UniversalDocumentType;
}> = [
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
  { re: /\b(?:an? )?email\b/i, type: "email" },
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

export function isSimpleCreateRequest(userText: string): boolean {
  const t = userText.trim();
  if (!t || EXPLICIT_ROOM_NAV_RE.test(t)) return false;
  if (isProjectCreationIntent(t)) return false;
  if (SIMPLE_CREATE_VERB_RE.test(t)) return true;
  return inferDocumentTypeFromCreateText(t) !== null;
}

export function createFastPathRecoveryLine(userText: string): string {
  const inferred = inferDocumentTypeFromCreateText(userText);
  const label =
    (inferred ? pluginById(inferred)?.label : null)?.toLowerCase() ??
    "document";
  return `I ran into a problem starting the ${label} builder, but we can absolutely build it together right here.`;
}

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
