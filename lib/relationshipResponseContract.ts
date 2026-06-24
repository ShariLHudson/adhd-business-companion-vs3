/**
 * P0 Relationship Response Contract™
 * Mandatory 3-paragraph structure when observation confidence is forming or sufficient.
 */

import {
  assessRelationshipMemoryConfidence,
  type RelationshipMemoryConfidence,
} from "./relationshipIntelligencePrompt";
import {
  buildRelationshipObservations,
  type ObservationRankingContext,
  type RelationshipObservation,
} from "./relationshipObservationEngine";
import {
  recordUsedObservations,
  selectLeadObservation,
} from "./relationshipObservationRelevance";

const DEV_ENABLED =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

export const RELATIONSHIP_CONTRACT_BANNED_OPENERS = [
  /^it seems like\b/i,
  /^it sounds like\b/i,
  /^this is a common\b/i,
  /^this is common\b/i,
  /^this can often\b/i,
  /^this can happen\b/i,
  /^many people\b/i,
  /^many entrepreneurs\b/i,
  /^people with adhd\b/i,
  /^it's common for\b/i,
  /^research shows\b/i,
  /^studies show\b/i,
];

export const RELATIONSHIP_CONTRACT_REQUIRED_OPENERS = [
  /^i've noticed\b/i,
  /^one pattern i've seen\b/i,
  /^something that stands out\b/i,
  /^from our conversations\b/i,
];

export type RelationshipContractViolation = {
  reason: string;
  firstParagraph: string;
  paragraphCount: number;
  memoryConfidence: RelationshipMemoryConfidence;
};

export function isRelationshipResponseContractActive(
  confidence: RelationshipMemoryConfidence = assessRelationshipMemoryConfidence(),
): boolean {
  return confidence === "forming" || confidence === "sufficient";
}

function observationToLeadSentence(
  obs: RelationshipObservation,
  index: number,
): string {
  const trimmed = obs.text.trim();
  if (
    index === 0 &&
    /^(one thing that stands out|something that stands out|from our conversations|i've noticed)/i.test(
      trimmed,
    )
  ) {
    return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
  }

  const body = trimmed.endsWith(".") ? trimmed.slice(0, -1) : trimmed;
  const lc = body.charAt(0).toLowerCase() + body.slice(1);

  if (index === 0) return `I've noticed ${lc}.`;
  if (index === 1) return `I've also seen that ${lc}.`;
  return `Something that stands out: ${lc}.`;
}

/**
 * Draft opening paragraph from top 1–3 ranked observations.
 */
export function buildRelationshipLeadParagraph(
  userText?: string,
  now = new Date(),
  context?: Pick<ObservationRankingContext, "workspace"> & {
    suppressForRouting?: boolean;
  },
): string | null {
  if (context?.suppressForRouting) return null;
  const confidence = assessRelationshipMemoryConfidence();
  if (!isRelationshipResponseContractActive(confidence)) return null;

  const candidates = buildRelationshipObservations(now, {
    userText,
    workspace: context?.workspace,
    limit: 7,
  });
  if (!candidates.length) return null;

  const lead = selectLeadObservation(candidates, {
    userText,
    workspace: context?.workspace,
    now,
  });
  if (!lead) return null;

  const supporting = candidates
    .filter((observation) => observation.id !== lead.id)
    .slice(0, 2);

  const selected = [lead, ...supporting];
  recordUsedObservations(selected.map((observation) => observation.id), now);

  return selected
    .map((observation, index) => observationToLeadSentence(observation, index))
    .join(" ");
}

export function buildRelationshipResponseContractBlock(
  userText?: string,
  now = new Date(),
  context?: Pick<ObservationRankingContext, "workspace"> & {
    suppressForRouting?: boolean;
  },
): string | null {
  const confidence = assessRelationshipMemoryConfidence();
  if (!isRelationshipResponseContractActive(confidence)) return null;

  const leadParagraph = buildRelationshipLeadParagraph(userText, now, context);
  if (!leadParagraph) return null;

  return [
    "# RELATIONSHIP RESPONSE CONTRACT — MANDATORY",
    `Observation confidence: ${confidence}. This contract OVERRIDES generic coaching structure below.`,
    "",
    "REQUIRED OPENING PARAGRAPH (use these observations directly — do not substitute generic advice):",
    leadParagraph,
    "",
    "MANDATORY RESPONSE STRUCTURE:",
    "Paragraph 1 — Observed behavior: USE the REQUIRED OPENING PARAGRAPH above (light edits for flow only; keep the observations).",
    "Paragraph 2 — Reflection: what this pattern means without judgment — tension, care, or tradeoff, not diagnosis.",
    "Paragraph 3 — Guidance: one concrete, scoped next step tied to their history.",
    "Optional final sentence — one question maximum (e.g. 'Does that feel accurate?').",
    "",
    "FORBIDDEN to begin Paragraph 1 with:",
    "It seems like; This is common; This can happen; Many people; Many entrepreneurs; People with ADHD; Research shows; Studies show",
    "",
    "REQUIRED to begin Paragraph 1 with one of:",
    "I've noticed...; One pattern I've seen...; Something that stands out...; From our conversations...",
    "",
    "FORBIDDEN in Paragraph 1:",
    "Trait labels ('You have shiny object syndrome', 'You have decision overload', 'You have creative energy')",
    "Generic ADHD or entrepreneur explanations before citing their specific observation.",
  ].join("\n");
}

export function splitResponseParagraphs(response: string): string[] {
  const normalized = response.trim();
  if (!normalized) return [];

  const byBlank = normalized.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (byBlank.length >= 2) return byBlank;

  const sentences = normalized.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [normalized];
  if (sentences.length < 3) return [normalized];

  const chunkSize = Math.max(1, Math.ceil(sentences.length / 3));
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += chunkSize) {
    paragraphs.push(sentences.slice(i, i + chunkSize).join(" ").trim());
  }
  return paragraphs.filter(Boolean);
}

export function extractFirstParagraph(response: string): string {
  const paragraphs = splitResponseParagraphs(response);
  return paragraphs[0] ?? response.trim().split(/\n/)[0]?.trim() ?? "";
}

export function detectBannedRelationshipOpener(text: string): string | null {
  const firstLine = extractFirstParagraph(text).trim();
  for (const pattern of RELATIONSHIP_CONTRACT_BANNED_OPENERS) {
    if (pattern.test(firstLine)) {
      return pattern.source;
    }
  }
  return null;
}

export function isRelationshipRewriteEligible(
  memoryConfidence: RelationshipMemoryConfidence,
  relationshipLeadParagraph: string | null | undefined,
): boolean {
  return (
    (memoryConfidence === "forming" || memoryConfidence === "sufficient") &&
    Boolean(relationshipLeadParagraph?.trim())
  );
}

export function detectRelationshipContractViolation(
  response: string,
  confidence: RelationshipMemoryConfidence = assessRelationshipMemoryConfidence(),
): RelationshipContractViolation | null {
  if (!isRelationshipResponseContractActive(confidence)) return null;

  const trimmed = response.trim();
  if (!trimmed) return null;

  const firstParagraph = extractFirstParagraph(trimmed);
  const paragraphs = splitResponseParagraphs(trimmed);
  const firstLine = firstParagraph.trim();

  const bannedOpener = detectBannedRelationshipOpener(trimmed);
  if (bannedOpener) {
    return {
      reason: `Banned opener: ${bannedOpener}`,
      firstParagraph,
      paragraphCount: paragraphs.length,
      memoryConfidence: confidence,
    };
  }

  const hasRequiredOpener = RELATIONSHIP_CONTRACT_REQUIRED_OPENERS.some((p) =>
    p.test(firstLine),
  );
  if (!hasRequiredOpener) {
    return {
      reason: "Paragraph 1 does not begin with required observation opener",
      firstParagraph,
      paragraphCount: paragraphs.length,
      memoryConfidence: confidence,
    };
  }

  if (paragraphs.length < 3) {
    return {
      reason: `Expected 3+ paragraphs (observation → reflection → guidance); got ${paragraphs.length}`,
      firstParagraph,
      paragraphCount: paragraphs.length,
      memoryConfidence: confidence,
    };
  }

  if (/^you have (?:shiny object|decision overload|creative energy)/i.test(firstLine)) {
    return {
      reason: "Paragraph 1 uses trait label instead of observed behavior",
      firstParagraph,
      paragraphCount: paragraphs.length,
      memoryConfidence: confidence,
    };
  }

  return null;
}

export function warnIfRelationshipContractViolation(input: {
  response: string;
  relationshipPriorityBlockLength: number;
  userText?: string;
  memoryConfidence?: RelationshipMemoryConfidence;
}): RelationshipContractViolation | null {
  const confidence = input.memoryConfidence ?? assessRelationshipMemoryConfidence();
  if (!isRelationshipResponseContractActive(confidence)) return null;
  if (input.relationshipPriorityBlockLength <= 0) return null;

  const violation = detectRelationshipContractViolation(input.response, confidence);
  if (!violation) return null;

  const logFn = DEV_ENABLED ? console.warn : () => {};
  logFn("RELATIONSHIP_CONTRACT_VIOLATION", {
    userText: input.userText?.slice(0, 120),
    memoryConfidence: violation.memoryConfidence,
    relationshipPriorityBlockLength: input.relationshipPriorityBlockLength,
    reason: violation.reason,
    firstParagraph: violation.firstParagraph,
    paragraphCount: violation.paragraphCount,
    responseOpening: input.response.trim().slice(0, 300),
  });

  return violation;
}

export type RelationshipResponseEnforcementResult = {
  message: string;
  rewritten: boolean;
  enforcementRan: boolean;
  skipReason?: string;
  violation?: RelationshipContractViolation;
  originalFirstParagraph?: string;
};

/**
 * Replace paragraph 1 with the relationship lead paragraph when the model violates contract.
 * Rewrite runs when memoryConfidence is forming or sufficient and lead paragraph exists.
 */
export function replaceFirstResponseParagraph(
  response: string,
  newFirstParagraph: string,
): string {
  const trimmed = response.trim();
  const lead = newFirstParagraph.trim();
  if (!trimmed) return lead;

  const byBlankLine = trimmed.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (byBlankLine.length >= 2) {
    return [lead, ...byBlankLine.slice(1)].join("\n\n");
  }

  const split = splitResponseParagraphs(trimmed);
  if (split.length >= 2) {
    return [lead, ...split.slice(1)].join("\n\n");
  }

  const tailMatch = trimmed.match(/^[^.!?]+[.!?]+\s+([\s\S]+)$/);
  if (tailMatch?.[1]?.trim()) {
    return `${lead}\n\n${tailMatch[1].trim()}`;
  }

  return lead;
}

export function enforceRelationshipResponse(input: {
  response: string;
  relationshipLeadParagraph: string | null | undefined;
  memoryConfidence: RelationshipMemoryConfidence;
  userText?: string;
}): RelationshipResponseEnforcementResult {
  const lead = input.relationshipLeadParagraph?.trim() ?? "";
  const response = input.response;

  if (!isRelationshipResponseContractActive(input.memoryConfidence)) {
    return {
      message: response,
      rewritten: false,
      enforcementRan: false,
      skipReason: `inactive confidence: ${input.memoryConfidence}`,
    };
  }

  if (!lead) {
    return {
      message: response,
      rewritten: false,
      enforcementRan: true,
      skipReason: "missing relationshipLeadParagraph",
    };
  }

  if (!isRelationshipRewriteEligible(input.memoryConfidence, lead)) {
    return {
      message: response,
      rewritten: false,
      enforcementRan: true,
      skipReason: `not eligible: confidence=${input.memoryConfidence}`,
    };
  }

  const violation = detectRelationshipContractViolation(
    response,
    input.memoryConfidence,
  );
  if (!violation) {
    return {
      message: response,
      rewritten: false,
      enforcementRan: true,
      skipReason: "no contract violation detected",
    };
  }

  const message = replaceFirstResponseParagraph(response, lead);

  console.warn("RELATIONSHIP_RESPONSE_REWRITTEN", {
    userText: input.userText?.slice(0, 120),
    memoryConfidence: input.memoryConfidence,
    violationReason: violation.reason,
    originalFirstParagraph: violation.firstParagraph,
    rewrittenFirstParagraph: lead,
    paragraphCountBefore: violation.paragraphCount,
    responseReturnedToClient: message.slice(0, 300),
  });

  return {
    message,
    rewritten: true,
    enforcementRan: true,
    violation,
    originalFirstParagraph: violation.firstParagraph,
  };
}
