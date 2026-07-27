/**
 * Business Estate research configuration — the business-specific *config* of the
 * shared contextual-research core. It supplies persona/prompts/labels/prior
 * context and the field→thread mapping; the panel, engine, and mechanics are the
 * shared ones, unchanged. Mirrors the Client Avatar research configuration.
 */

import {
  getBusinessEstateEnvelope,
  getBusinessEstateSections,
  type BusinessEstateSectionId,
} from "@/lib/profile/businessEstateProfile";
import {
  BUSINESS_ESTATE_SECTION_FIELDS,
  fieldDisplayLabel,
} from "@/lib/profile/businessEstateSectionFields";
import {
  buildResearchAutoPrompt,
  buildResearchSystemPrompt,
  researchThreadKey,
  type ResearchContext,
  type ResearchPersonaConfig,
} from "@/lib/research/contextualResearchCore";

/** The business voice/guardrails — parallel to AVATAR_RESEARCH_CONFIG. */
export const BUSINESS_ESTATE_RESEARCH_CONFIG: ResearchPersonaConfig = {
  intro: [
    "You are Shari, helping an ADHD founder think through ONE part of their",
    "business so they can write their own answer, in their own words.",
  ],
  nameLinePrefix: "Business: ",
  priorsHeader: "What they've already shared about their business:",
  draftLabel: "Their current draft answer:",
  emptyDraftText: "(empty so far)",
  guidance: [
    "Help them explore and think it through: offer a few concrete angles,",
    "examples, and possible wording they could adapt. Keep replies short, warm,",
    "and concrete. Do NOT write the whole answer for them or call it final — they",
    "decide what to keep. Never mention menus, tools, the Chamber, or the Board.",
    "Stay entirely on this one question.",
  ],
};

/** Member-facing labels for the shared panel in the Business Estate context. */
export const BUSINESS_ESTATE_RESEARCH_LABELS = {
  toggleLabel: "Research this with Shari",
  helperText:
    "Shari thinks this through with you. Read along, keep asking, and add anything useful to your answer.",
  addLabel: "Add to This Answer",
  addAllLabel: "Add Entire Research Session",
  addedLabel: "Added to your answer ✓",
} as const;

/** Thread key for a room field: research:<sectionId>.<fieldKey>. */
export function businessEstateResearchThreadKey(
  sectionId: BusinessEstateSectionId,
  fieldKey: string,
): string {
  return researchThreadKey(`${sectionId}.${fieldKey}`);
}

/** A few approved estate values as prior context (never unapproved drafts). */
function approvedResearchPriors(
  excludePath: string,
): Array<{ label: string; value: string }> {
  const envelope = getBusinessEstateEnvelope();
  const sections = envelope.sections;
  const picks: Array<[BusinessEstateSectionId, string, string]> = [
    ["identity", "shortDescription", "What the business does"],
    ["identity", "businessStage", "Business stage"],
    ["offers", "mainOffer", "Main offer"],
    ["brand", "tone", "Brand tone"],
    ["direction", "currentPriority", "Current priority"],
  ];
  const out: Array<{ label: string; value: string }> = [];
  for (const [sid, fk, label] of picks) {
    const path = `${sid}.${fk}`;
    if (path === excludePath) continue;
    if (envelope.approval[path] !== true) continue;
    const storageKey = sid === "work-style" ? "workStyle" : sid;
    const value = (
      sections[storageKey as keyof typeof sections] as Record<string, string>
    )[fk];
    if (value && value.trim()) out.push({ label, value: value.trim() });
  }
  return out;
}

export function buildBusinessEstateResearchContext(
  sectionId: BusinessEstateSectionId,
  fieldKey: string,
  currentValue: string,
): ResearchContext {
  const field = BUSINESS_ESTATE_SECTION_FIELDS[sectionId].find(
    (f) => f.key === fieldKey,
  );
  const questionLabel = field
    ? fieldDisplayLabel(sectionId, field)
    : fieldKey;
  const businessName =
    getBusinessEstateSections().identity.businessName?.trim() || undefined;
  return {
    questionLabel,
    currentAnswer: currentValue,
    priorAnswers: approvedResearchPriors(`${sectionId}.${fieldKey}`),
    entityName: businessName,
  };
}

export function buildBusinessEstateResearchSystemPrompt(
  sectionId: BusinessEstateSectionId,
  fieldKey: string,
  currentValue: string,
): string {
  return buildResearchSystemPrompt(
    BUSINESS_ESTATE_RESEARCH_CONFIG,
    buildBusinessEstateResearchContext(sectionId, fieldKey, currentValue),
  );
}

export function buildBusinessEstateResearchAutoPrompt(
  sectionId: BusinessEstateSectionId,
  fieldKey: string,
  currentValue: string,
): string {
  return buildResearchAutoPrompt(
    buildBusinessEstateResearchContext(sectionId, fieldKey, currentValue),
  );
}
