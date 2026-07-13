/**
 * My Business Estate — Estate-level research (separate from approved profile facts).
 * Never auto-writes Business Estate or People I Help fields.
 */

import { getPrimaryAvatar } from "@/lib/companionStore";
import {
  collectApprovedBusinessEstateContext,
} from "@/lib/profile/guidedFieldHelp";
import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";

export const BUSINESS_ESTATE_RESEARCH_MAY_AUTO_UPDATE_PROFILE = false as const;
export const BUSINESS_ESTATE_RESEARCH_STORAGE_KEY =
  "companion-business-estate-research-notes-v1";
export const BUSINESS_ESTATE_RESEARCH_SESSION_KEY =
  "companion-business-estate-research-session-v1";
export const BUSINESS_ESTATE_RESEARCH_PROMPT_KEY =
  "companion-business-estate-research-prompt-v1";

/** Research notes store — NOT companion-business-profile-v1 */
export type BusinessEstateResearchNote = {
  id: string;
  createdAt: string;
  question: string;
  whatReviewed: string[];
  keyFindings: string[];
  interpretation: string;
  suggestedNextSteps: string[];
  sources: string[];
  possibleUpdates: { path: string; suggestion: string }[];
  /** Explicit member choice — never applied without approval */
  profileUpdatesApproved: false;
};

export type BusinessEstateResearchReturnContext = {
  sectionId: BusinessEstateSectionId | null;
  stageId?: string | null;
  entryMode?: string | null;
};

export type BusinessEstateResearchResult = {
  question: string;
  whatReviewed: string[];
  keyFindings: string[];
  interpretation: string;
  suggestedNextSteps: string[];
  sources: string[];
  possibleUpdates: { path: string; suggestion: string }[];
  clarificationNeeded: string | null;
  /** Labels for UI distinction */
  layers: {
    approvedContext: string[];
    researchFindings: string[];
    interpretation: string;
    suggestedUpdates: string[];
  };
};

export type ApprovedResearchContext = {
  approvedBusiness: Record<string, string>;
  peopleIHelpSummary: string | null;
  offersSummary: string | null;
  brandSummary: string | null;
  strategySummary: string | null;
  toolsSummary: string | null;
};

export function collectApprovedResearchContext(): ApprovedResearchContext {
  const approved = collectApprovedBusinessEstateContext();
  const avatar = getPrimaryAvatar();
  const peopleIHelpSummary = avatar
    ? [avatar.name, avatar.who, avatar.tagline, avatar.painPoints, avatar.goals]
        .filter(Boolean)
        .join(" · ") || null
    : null;

  const pick = (prefix: string) =>
    Object.entries(approved)
      .filter(([k]) => k.startsWith(prefix))
      .map(([k, v]) => `${k}: ${v}`);

  return {
    approvedBusiness: approved,
    peopleIHelpSummary,
    offersSummary: pick("offers.").join(" | ") || null,
    brandSummary: pick("brand.").join(" | ") || null,
    strategySummary: pick("direction.").join(" | ") || null,
    toolsSummary: pick("tools.").join(" | ") || null,
  };
}

/** Infer a gentle research direction from natural language — not a mandatory category picker. */
export function inferResearchDirection(request: string): string {
  const t = request.toLowerCase();
  if (/\b(pric|pricing|cost|fee|rate|charg(?:e|ing)|how much)\b/.test(t))
    return "pricing";
  if (/\b(competitor|competition|versus|vs\.?)\b/.test(t)) return "competitors";
  if (/\b(audience|client|customer|who (?:i|we) help)\b/.test(t))
    return "audience needs";
  if (/\b(message|copy|voice|wording|language)\b/.test(t))
    return "messaging / customer language";
  if (/\b(offer|product|service|program)\b/.test(t)) return "offers";
  if (/\b(tool|system|software|platform|crm)\b/.test(t)) return "tools and systems";
  if (/\b(trend|industry|market)\b/.test(t)) return "industry trends";
  if (/\b(regulat|legal|compliance|gdpr|hipaa)\b/.test(t))
    return "regulations / platform rules";
  if (/\b(idea|opportunit)\b/.test(t)) return "market opportunities / ideas";
  return "general business research";
}

export function needsClarification(request: string): string | null {
  const trimmed = request.trim();
  if (trimmed.length < 12) {
    return "Could you share a little more about what you want to understand?";
  }
  const vague =
    /^(help|research|look into|tell me about|business|market|stuff)\b/i.test(
      trimmed,
    ) && trimmed.split(/\s+/).length < 6;
  if (vague) {
    return "Should I focus more on audience demand, competitors, or pricing?";
  }
  return null;
}

/**
 * Build a calm structured research result from approved context + request.
 * Findings stay interpretive / directional — never written to profile.
 */
export function buildBusinessEstateResearchResult(
  request: string,
  clarificationAnswer?: string,
): BusinessEstateResearchResult {
  const ctx = collectApprovedResearchContext();
  const direction = inferResearchDirection(
    [request, clarificationAnswer].filter(Boolean).join(" "),
  );
  const reviewed: string[] = ["Your research question"];
  if (Object.keys(ctx.approvedBusiness).length) {
    reviewed.push("Approved My Business Estate context");
  }
  if (ctx.peopleIHelpSummary) reviewed.push("People I Help (primary avatar)");
  if (ctx.offersSummary) reviewed.push("Approved offers");
  if (ctx.brandSummary) reviewed.push("Approved brand information");
  if (ctx.strategySummary) reviewed.push("Current strategy information");
  if (ctx.toolsSummary) reviewed.push("Business tools / systems");

  const businessName =
    ctx.approvedBusiness["identity.businessName"] || "your business";
  const stage =
    ctx.approvedBusiness["identity.businessStage"] || "your current stage";
  const audience =
    ctx.peopleIHelpSummary ||
    "the people you help (add more in People I Help anytime)";

  const clarificationNeeded = clarificationAnswer
    ? null
    : needsClarification(request);

  const keyFindings = [
    `Direction sensed from your request: ${direction}.`,
    `Working from ${businessName} at ${stage}, with audience context: ${audience}.`,
    clarificationAnswer
      ? `You clarified: ${clarificationAnswer.trim()}`
      : "No profile fields were changed while researching.",
  ];

  const interpretation = [
    `For ${businessName}, this research is meant to inform decisions — not overwrite what you've already approved.`,
    `Treat findings as starting points. You decide what fits.`,
  ].join(" ");

  const suggestedNextSteps = [
    "Review the findings against what you already know is true for your business.",
    "If something feels useful, ask Shari to prepare suggested Business Estate updates — nothing applies until you approve.",
    "Return to the Business Area you were in whenever you're ready.",
  ];

  const sources = [
    "Approved My Business Estate fields (member-owned)",
    "People I Help avatar summary (when available)",
    "Member research question (this session)",
    "Note: Live web sources are not auto-attached in this Estate panel pass — ask Shari in conversation for deeper lookups.",
  ];

  const possibleUpdates: { path: string; suggestion: string }[] = [];
  if (direction.includes("audience") || direction.includes("messaging")) {
    possibleUpdates.push({
      path: "brand.keyMessages",
      suggestion:
        "Consider refining key messages after you approve — draft only when you ask.",
    });
  }
  if (direction.includes("offer") || direction.includes("pricing")) {
    possibleUpdates.push({
      path: "offers.mainOffer",
      suggestion:
        "Offer wording may benefit from a research-informed draft — only if you request updates.",
    });
  }
  if (direction.includes("competitor") || direction.includes("trend")) {
    possibleUpdates.push({
      path: "direction.currentChallenges",
      suggestion:
        "You may want to note a market insight under challenges or ideas — only with approval.",
    });
  }

  const approvedContextLines = Object.entries(ctx.approvedBusiness).map(
    ([k, v]) => `${k}: ${v}`,
  );
  if (ctx.peopleIHelpSummary) {
    approvedContextLines.push(`people-i-help: ${ctx.peopleIHelpSummary}`);
  }

  return {
    question: request.trim(),
    whatReviewed: reviewed,
    keyFindings,
    interpretation,
    suggestedNextSteps,
    sources,
    possibleUpdates,
    clarificationNeeded,
    layers: {
      approvedContext: approvedContextLines,
      researchFindings: keyFindings,
      interpretation,
      suggestedUpdates: possibleUpdates.map(
        (u) => `${u.path}: ${u.suggestion}`,
      ),
    },
  };
}

export function formatEstateResearchChatPrompt(
  request: string,
  result: BusinessEstateResearchResult,
): string {
  const ctx = collectApprovedResearchContext();
  return [
    "BUSINESS ESTATE RESEARCH (Estate-level — not field-level)",
    `Member request: ${request}`,
    "Ask at most ONE clarification if needed.",
    "Reuse approved context below — do not re-ask known facts.",
    "Distinguish: approved user information · research findings · interpretation · suggested updates.",
    "Do NOT update My Business Estate or People I Help fields.",
    `Contract: autoUpdateProfile=${BUSINESS_ESTATE_RESEARCH_MAY_AUTO_UPDATE_PROFILE}`,
    "After findings, ask: Would you like me to prepare suggested updates for your Business Estate?",
    "",
    "Approved context:",
    ...Object.entries(ctx.approvedBusiness).map(([k, v]) => `- ${k}: ${v}`),
    ctx.peopleIHelpSummary
      ? `- people-i-help: ${ctx.peopleIHelpSummary}`
      : "- people-i-help: (none yet)",
    "",
    "Structured panel draft already shown to member:",
    `Question: ${result.question}`,
    `Findings: ${result.keyFindings.join(" · ")}`,
  ].join("\n");
}

export function writeResearchSessionPrompt(
  request: string,
  result: BusinessEstateResearchResult,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      BUSINESS_ESTATE_RESEARCH_PROMPT_KEY,
      formatEstateResearchChatPrompt(request, result),
    );
    sessionStorage.setItem(
      BUSINESS_ESTATE_RESEARCH_SESSION_KEY,
      JSON.stringify({ request, result, at: new Date().toISOString() }),
    );
  } catch {
    /* ignore */
  }
}

export function readResearchSessionPrompt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(BUSINESS_ESTATE_RESEARCH_PROMPT_KEY);
  } catch {
    return null;
  }
}

export function clearResearchSessionPrompt(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(BUSINESS_ESTATE_RESEARCH_PROMPT_KEY);
  } catch {
    /* ignore */
  }
}

/** Save research only — never touches companion-business-profile-v1 */
export function saveResearchNoteOnly(
  result: BusinessEstateResearchResult,
): BusinessEstateResearchNote {
  const note: BusinessEstateResearchNote = {
    id: `ber-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    question: result.question,
    whatReviewed: result.whatReviewed,
    keyFindings: result.keyFindings,
    interpretation: result.interpretation,
    suggestedNextSteps: result.suggestedNextSteps,
    sources: result.sources,
    possibleUpdates: result.possibleUpdates,
    profileUpdatesApproved: false,
  };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(BUSINESS_ESTATE_RESEARCH_STORAGE_KEY);
      const list = raw
        ? (JSON.parse(raw) as BusinessEstateResearchNote[])
        : [];
      list.unshift(note);
      localStorage.setItem(
        BUSINESS_ESTATE_RESEARCH_STORAGE_KEY,
        JSON.stringify(list.slice(0, 40)),
      );
    } catch {
      /* ignore */
    }
  }
  return note;
}

export function listSavedResearchNotes(): BusinessEstateResearchNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BUSINESS_ESTATE_RESEARCH_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BusinessEstateResearchNote[];
  } catch {
    return [];
  }
}

/** Guard: research storage key must never equal profile key */
export const BUSINESS_PROFILE_STORAGE_KEY = "companion-business-profile-v1";

export function researchStorageIsSeparateFromProfile(): boolean {
  return (
    BUSINESS_ESTATE_RESEARCH_STORAGE_KEY !== BUSINESS_PROFILE_STORAGE_KEY
  );
}
