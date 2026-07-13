/**
 * Shari help context for Guided Business Profile Slice 1.
 * Builds packets — never writes profile storage.
 */

import { getPrimaryAvatar } from "@/lib/companionStore";
import {
  getApprovedFieldValue,
  type BusinessEstateSectionId,
} from "@/lib/profile/businessEstateProfile";
import { getGuidedFieldDef } from "@/lib/profile/guidedFieldRegistry";
import {
  GUIDED_FIELD_HELP_EVENT,
  type AnswerConfidence,
  type BusinessEstateFieldHelpContext,
  type GuidanceHelpMode,
  type GuidedFieldHelpRequest,
  readSessionConfidence,
} from "@/lib/profile/guidedFieldTypes";
import { getPeopleIHelpGuidedField } from "@/lib/profile/peopleIHelpGuidedFields";
import { getFieldHelpEntry } from "@/lib/profile/fieldHelpRegistry";

const CONTEXT_PATHS = [
  "identity.businessName",
  "identity.businessStage",
  "identity.shortDescription",
  "identity.mission",
  "identity.vision",
  "identity.coreValues",
  "identity.whyBusinessMatters",
  "identity.whatInspiredYou",
  "identity.hopedImpact",
  "identity.whatHelpsYouContinue",
  "offers.mainOffer",
  "offers.problemsSolved",
  "offers.outcomesCreated",
  "brand.tone",
  "direction.currentPriority",
  "direction.successLooksLike",
  "work-style.decisionStyle",
  "work-style.restartHelpers",
  "work-style.overwhelmTriggers",
  "work-style.returnSupportTone",
  "work-style.returnOfferPreferences",
  "work-style.preferredTimeOfDay",
  "work-style.collaborationPreference",
] as const;

export function collectApprovedBusinessEstateContext(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const path of CONTEXT_PATHS) {
    const value = getApprovedFieldValue(path);
    if (value) out[path] = value;
  }
  return out;
}

function primaryPeopleIHelpContext():
  | BusinessEstateFieldHelpContext["primaryPeopleIHelpContext"]
  | undefined {
  const avatar = getPrimaryAvatar();
  if (!avatar) return undefined;
  const summaryParts = [
    avatar.tagline?.trim(),
    avatar.who?.trim(),
    avatar.painPoints?.trim()?.slice(0, 120),
    avatar.goals?.trim()?.slice(0, 120),
  ].filter(Boolean);
  return {
    id: avatar.id,
    name: avatar.name?.trim() || undefined,
    summary: summaryParts.length ? summaryParts.join(" · ") : undefined,
  };
}

export function buildBusinessEstateFieldHelpContext(input: {
  sectionId: BusinessEstateSectionId;
  fieldKey: string;
  helpMode: GuidanceHelpMode;
  currentValue?: string;
  confidence?: AnswerConfidence;
}): BusinessEstateFieldHelpContext | null {
  const def = getGuidedFieldDef(input.sectionId, input.fieldKey);
  if (!def) return null;

  const fieldPath = `${input.sectionId}.${input.fieldKey}`;
  const approvedBusinessContext = collectApprovedBusinessEstateContext();

  // Attach related approved paths when present
  for (const path of def.relatedFieldPaths ?? []) {
    if (approvedBusinessContext[path]) continue;
    const value = getApprovedFieldValue(path);
    if (value) approvedBusinessContext[path] = value;
  }

  return {
    sectionId: input.sectionId,
    fieldKey: input.fieldKey,
    helpMode: input.helpMode,
    currentValue: input.currentValue,
    approvedBusinessContext,
    primaryPeopleIHelpContext: primaryPeopleIHelpContext(),
    confidence:
      input.confidence ?? readSessionConfidence(fieldPath) ?? undefined,
    guidedQuestions: def.guidedQuestions,
    question: def.question,
    definition: def.definition,
  };
}

/** People I Help guided help — reuses Business Estate context; never auto-saves. */
export function buildPeopleIHelpFieldHelpContext(input: {
  fieldKey: string;
  helpMode: GuidanceHelpMode;
  currentValue?: string;
}): GuidedFieldHelpRequest {
  const meta = getPeopleIHelpGuidedField(input.fieldKey);
  const entry = getFieldHelpEntry(`people-i-help.${input.fieldKey}`);
  return {
    sectionId: "people-i-help",
    fieldKey: input.fieldKey,
    fieldPath: `people-i-help.${input.fieldKey}`,
    helpMode: input.helpMode,
    currentValue: input.currentValue,
    approvedBusinessContext: collectApprovedBusinessEstateContext(),
    primaryPeopleIHelpContext: primaryPeopleIHelpContext(),
    relatedFieldValues: {},
    question: meta?.question ?? entry?.question,
    definition: meta?.definition,
  };
}

/** @deprecated Prefer buildBusinessEstateFieldHelpContext */
export function buildGuidedFieldHelpRequest(input: {
  sectionId: BusinessEstateSectionId;
  fieldKey: string;
  helpMode: GuidanceHelpMode | string;
  currentValue: string;
  relatedValues?: Record<string, string>;
}): GuidedFieldHelpRequest | null {
  const mode = normalizeHelpMode(input.helpMode);
  const ctx = buildBusinessEstateFieldHelpContext({
    sectionId: input.sectionId,
    fieldKey: input.fieldKey,
    helpMode: mode,
    currentValue: input.currentValue,
  });
  if (!ctx) return null;
  return {
    ...ctx,
    fieldPath: `${input.sectionId}.${input.fieldKey}`,
    relatedFieldValues: input.relatedValues ?? {},
  };
}

function normalizeHelpMode(mode: string): GuidanceHelpMode {
  if (mode === "explain") return "explain_this";
  if (mode === "help_me_develop") return "help_me_develop";
  if (mode === "help_me_choose") return "help_me_choose";
  if (mode === "research_with_shari") return "research_with_shari";
  if (mode === "show_examples") return "show_examples";
  if (
    mode === "explain_this" ||
    mode === "show_examples" ||
    mode === "help_me_choose" ||
    mode === "help_me_develop" ||
    mode === "research_with_shari"
  ) {
    return mode;
  }
  return "explain_this";
}

export function formatGuidedFieldHelpPrompt(
  request: BusinessEstateFieldHelpContext | GuidedFieldHelpRequest,
): string {
  const modeLabel =
    request.helpMode === "explain_this"
      ? "Explain this field"
      : request.helpMode === "show_examples"
        ? "Show examples"
        : request.helpMode === "help_me_choose"
          ? "Help me choose"
          : request.helpMode === "help_me_develop"
            ? "Help me develop this"
            : "Research this with me";

  const lines = [
    request.sectionId === "people-i-help"
      ? `GUIDED PEOPLE I HELP (${modeLabel})`
      : `GUIDED BUSINESS PROFILE HELP (${modeLabel})`,
    `Field: ${request.sectionId}.${request.fieldKey}`,
    request.question ? `Question: ${request.question}` : "",
    request.definition ? `Definition: ${request.definition}` : "",
    `Current value: ${request.currentValue?.trim() || "(empty)"}`,
    request.confidence
      ? `Member confidence (session): ${request.confidence.replace(/_/g, " ")}`
      : "",
    "Ask guided questions one at a time when developing an answer.",
    "Offer two or three draft directions when helpful; explain differences.",
    "Do NOT save wording unless the member explicitly approves a draft.",
    "Use approved context below — do not ask them to repeat what Spark already knows.",
    "Values guide conversation — they must never automatically block member choices.",
  ].filter(Boolean);

  if (request.guidedQuestions?.length) {
    lines.push(`Guided questions: ${request.guidedQuestions.join(" · ")}`);
  }

  const people = request.primaryPeopleIHelpContext;
  if (people?.name || people?.summary) {
    lines.push(
      `Primary People I Help: ${[people.name, people.summary].filter(Boolean).join(" — ")}`,
    );
  }

  const ctxEntries = Object.entries(request.approvedBusinessContext);
  if (ctxEntries.length > 0) {
    lines.push("Approved Business Estate context:");
    for (const [path, value] of ctxEntries) {
      lines.push(`- ${path}: ${value}`);
    }
  }

  return lines.join("\n");
}

export function requestGuidedFieldHelp(
  request: BusinessEstateFieldHelpContext | GuidedFieldHelpRequest,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      "companion-business-estate-pending-help-v1",
      JSON.stringify(request),
    );
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent(GUIDED_FIELD_HELP_EVENT, { detail: request }),
  );
}

export function readPendingGuidedFieldHelp(): GuidedFieldHelpRequest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(
      "companion-business-estate-pending-help-v1",
    );
    if (!raw) return null;
    return JSON.parse(raw) as GuidedFieldHelpRequest;
  } catch {
    return null;
  }
}

export function clearPendingGuidedFieldHelp(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("companion-business-estate-pending-help-v1");
  } catch {
    /* ignore */
  }
}
