/**
 * Relevant user context for Shari — ranked, provenance-aware, not a full dump.
 */

import { getPrimaryAvatar, getBusinessProfile } from "@/lib/companionStore";
import { collectApprovedBusinessEstateContext } from "@/lib/profile/guidedFieldHelp";
import type { ShariPrimaryHelpMode } from "./types";
import type { ShariProfessionalRole } from "./professionalRoles";

export type ContextItemSource =
  | "profile"
  | "business_estate"
  | "conversation"
  | "project"
  | "calendar"
  | "research"
  | "creation"
  | "preference"
  | "inferred";

export type ShariContextItem = {
  key: string;
  value: string;
  source: ContextItemSource;
  confidence: number;
  lastConfirmedAt?: string;
  sensitive: boolean;
  allowedForResponse: boolean;
  relevant: boolean;
};

export type ResolvedShariContext = {
  items: ShariContextItem[];
  knownContextAvailable: boolean;
  relevantContextKeys: string[];
  contextConfidence: number;
  staleContextKeys: string[];
  assumptions: string[];
  /** Compact block for companion-chat hints */
  promptBlock: string;
  /** Product / offer strings useful for personalization */
  knownProducts: string[];
  knownAudience: string | null;
  businessName: string | null;
};

function item(
  key: string,
  value: string,
  source: ContextItemSource,
  confidence: number,
  relevant: boolean,
): ShariContextItem {
  return {
    key,
    value: value.trim(),
    source,
    confidence,
    sensitive: false,
    allowedForResponse: true,
    relevant,
  };
}

function relevanceForRequest(
  key: string,
  value: string,
  request: string,
  helpMode: ShariPrimaryHelpMode,
): boolean {
  const t = request.toLowerCase();
  const v = value.toLowerCase();
  if (!value.trim()) return false;

  if (/\b(?:booth|vendor|craft|fair|table|display)\b/.test(t)) {
    if (
      /product|offer|sell|journal|mug|pen|jewelry|craft|gift|booth|event/i.test(
        key + " " + v,
      )
    ) {
      return true;
    }
  }
  if (/\b(?:facebook|audience|market|group|loom|webinar|podcast)\b/.test(t)) {
    if (/audience|client|people|ideal|who|offer|business|name/i.test(key)) {
      return true;
    }
  }
  if (
    helpMode === "advice" ||
    helpMode === "how_to_guidance" ||
    helpMode === "simple_planning"
  ) {
    if (/business|offer|priority|audience|mission|role/i.test(key)) return true;
  }
  if (helpMode === "reflective_thinking" || helpMode === "simple_planning") {
    if (/priority|milestone|goal/i.test(key)) return true;
  }
  // Always allow compact identity when present for consulting tones
  if (/identity\.businessName|offers\.mainOffer|people/i.test(key)) return true;
  return false;
}

/**
 * Resolve ranked relevant context for this request. Client-safe (local storage).
 */
export function resolveRelevantUserContext(input: {
  request: string;
  helpMode: ShariPrimaryHelpMode;
  professionalRole?: ShariProfessionalRole;
}): ResolvedShariContext {
  const approved = collectApprovedBusinessEstateContext();
  const profile = getBusinessProfile();
  const avatar = getPrimaryAvatar();
  const items: ShariContextItem[] = [];

  for (const [key, value] of Object.entries(approved)) {
    if (!value?.trim()) continue;
    items.push(
      item(
        key,
        value,
        "business_estate",
        0.9,
        relevanceForRequest(key, value, input.request, input.helpMode),
      ),
    );
  }

  if (profile?.sells?.trim()) {
    items.push(
      item(
        "legacy.sells",
        profile.sells,
        "profile",
        0.75,
        relevanceForRequest(
          "legacy.sells",
          profile.sells,
          input.request,
          input.helpMode,
        ),
      ),
    );
  }
  if (profile?.idealClient?.trim()) {
    items.push(
      item(
        "legacy.idealClient",
        profile.idealClient,
        "profile",
        0.75,
        relevanceForRequest(
          "legacy.idealClient",
          profile.idealClient,
          input.request,
          input.helpMode,
        ),
      ),
    );
  }
  if (profile?.role?.trim()) {
    items.push(
      item(
        "legacy.role",
        profile.role,
        "profile",
        0.7,
        relevanceForRequest(
          "legacy.role",
          profile.role,
          input.request,
          input.helpMode,
        ),
      ),
    );
  }

  if (avatar) {
    const summary = [avatar.name, avatar.who, avatar.tagline]
      .filter(Boolean)
      .join(" · ");
    if (summary) {
      items.push(
        item(
          "peopleIHelp.primary",
          summary,
          "profile",
          0.85,
          relevanceForRequest(
            "peopleIHelp.primary",
            summary,
            input.request,
            input.helpMode,
          ),
        ),
      );
    }
  }

  const relevant = items.filter((i) => i.relevant && i.allowedForResponse);
  const knownContextAvailable = relevant.length > 0;
  const contextConfidence = knownContextAvailable
    ? relevant.reduce((s, i) => s + i.confidence, 0) / relevant.length
    : 0;

  const knownProducts: string[] = [];
  for (const i of items) {
    if (
      /sell|product|offer|journal|mug|pen|jewelry|gift/i.test(i.key + i.value)
    ) {
      knownProducts.push(i.value);
    }
  }

  const assumptions: string[] = [];
  if (
    /\b(?:booth|vendor|craft fair)\b/i.test(input.request) &&
    !/\b\d+\s*[x×]\s*\d+\b/i.test(input.request)
  ) {
    assumptions.push("Assuming a standard ~10×10 indoor booth unless told otherwise.");
  }

  const promptLines = relevant.slice(0, 12).map(
    (i) => `- ${i.key}: ${i.value} (source=${i.source}, confidence=${i.confidence.toFixed(2)})`,
  );

  const promptBlock = knownContextAvailable
    ? [
        "RELEVANT MEMBER CONTEXT (use to personalize; do not re-ask what is already known):",
        ...promptLines,
        assumptions.length
          ? `Reasonable assumptions you may state: ${assumptions.join(" ")}`
          : "",
        "If context may be stale, treat as a working assumption or confirm only when it would change the guidance.",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return {
    items,
    knownContextAvailable,
    relevantContextKeys: relevant.map((i) => i.key),
    contextConfidence,
    staleContextKeys: [],
    assumptions,
    promptBlock,
    knownProducts,
    knownAudience:
      relevant.find((i) => /idealClient|peopleIHelp|audience/i.test(i.key))
        ?.value ?? null,
    businessName:
      relevant.find((i) => /businessName/i.test(i.key))?.value ?? null,
  };
}

/**
 * Known-context-first guard — true when asking would re-request known facts.
 */
export function isUnnecessaryContextQuestion(
  questionOrAnswer: string,
  context: ResolvedShariContext,
): boolean {
  if (!context.knownContextAvailable) return false;
  const q = questionOrAnswer.toLowerCase();
  if (
    /\b(?:what (?:do|are) you sell|what type of products|what do you make|tell me about your (?:business|products)|who (?:do|are) you (?:help|serve))\b/i.test(
      q,
    )
  ) {
    if (
      context.knownProducts.length > 0 ||
      context.relevantContextKeys.some((k) =>
        /sell|offer|product|peopleIHelp/i.test(k),
      )
    ) {
      return true;
    }
  }
  if (
    /\b(?:tell me a bit about your business|what do you do and who)\b/i.test(q) &&
    (context.businessName || context.knownAudience)
  ) {
    return true;
  }
  return false;
}
