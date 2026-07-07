/**
 * Estate Knowledge Judgment Layer™ — reasoning over registry facts.
 *
 * User → Spark Intelligence → **Estate Judgment** → Estate Knowledge Registry → Answer
 *
 * The registry remembers. Spark thinks.
 */

import { getPlaceById } from "@/lib/estateKnowledge";
import { ESTATE_DISCOVERY_CATEGORIES } from "./discoveryCategories";
import {
  ESTATE_INTENT_FAMILIES,
  featureIdsForIntentFamilies,
} from "./intentFamilies";
import {
  buildFeatureRecommendations,
  buildPlaceRecommendations,
  buildRecommendationBody,
  buildRecommendationIntro,
  buildSuggestions,
} from "./narrate";
import { GENTLE_GUIDANCE_HINT } from "./gentleGuidance";
import { getPurposeProfile } from "./purposeProfiles";
import {
  scorePlaceCandidates,
  selectTopCandidates,
} from "./scoreCandidates";
import {
  extractEstateContextSignals,
  isEstateJudgmentQuery,
} from "./signals";
import type {
  EstateIntentFamily,
  EstateJudgmentInput,
  EstateJudgmentResult,
} from "./types";

export {
  extractEstateContextSignals,
  isEstateJudgmentQuery,
} from "./signals";
export { getPurposeProfile, getAllPurposeProfiles } from "./purposeProfiles";
export type {
  EstateJudgmentInput,
  EstateJudgmentResult,
  EstatePurposeProfile,
  EstateRecommendation,
  EstateContextSignals,
  EstateIntentFamily,
} from "./types";

function primaryIntentFamily(
  families: readonly EstateIntentFamily[],
): EstateIntentFamily | null {
  return families[0] ?? null;
}

function shouldAskClarifyingQuestion(
  signals: ReturnType<typeof extractEstateContextSignals>,
): boolean {
  if (signals.wantsCatalog || signals.wantsRoomStory) return false;
  if (signals.confidence >= 0.5) return false;
  if (
    signals.activityMode === "mixed" &&
    signals.intentFamilies.includes("create") &&
    signals.intentFamilies.includes("recover")
  ) {
    return true;
  }
  return signals.confidence < 0.25 && signals.intentFamilies.length === 0;
}

function buildResponseHint(
  result: Omit<EstateJudgmentResult, "responseHint">,
): string {
  return [
    "ESTATE INTELLIGENCE (mandatory):",
    GENTLE_GUIDANCE_HINT,
    result.intentFamily ? `Intent family: ${result.intentFamily}.` : "",
    `Emotional signal: ${result.signals.emotional}.`,
    "Speak as Shari — warm, natural, never a software menu.",
    "Every recommendation needs a brief WHY.",
    result.recommendations.length === 1
      ? "One primary place — do not force three choices."
      : "Offer up to three only when genuinely close fits.",
    "Never say I don't know — the registry has this place.",
    result.shouldAskQuestion && result.clarifyingQuestion
      ? `Ask first: ${result.clarifyingQuestion}`
      : "",
    result.stayInChat ? "Stay in chat is valid." : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Judgment entry — evaluates context and returns conversational guidance. */
export function evaluateEstateJudgment(
  input: EstateJudgmentInput,
): EstateJudgmentResult {
  const signals = extractEstateContextSignals(input.userText);

  if (!isEstateJudgmentQuery(input.userText)) {
    return {
      handled: false,
      intentFamily: null,
      signals,
      recommendations: [],
      intro: "",
      body: "",
      suggestions: [],
      shouldAskQuestion: false,
      stayInChat: false,
      candidatePlaceIds: [],
      responseHint: "",
    };
  }

  const intentFamily = primaryIntentFamily(signals.intentFamilies);
  const familySpec = intentFamily ? ESTATE_INTENT_FAMILIES[intentFamily] : null;

  if (shouldAskClarifyingQuestion(signals)) {
    const partial: Omit<EstateJudgmentResult, "responseHint"> = {
      handled: true,
      intentFamily,
      signals,
      recommendations: [],
      intro: "I want to point you somewhere that actually helps.",
      body: "Are you looking to rest and reset — or push something forward today?",
      suggestions: ["Rest and reset", "Push something forward", "Stay here"],
      shouldAskQuestion: true,
      clarifyingQuestion:
        "Are you looking to rest and reset — or push something forward today?",
      stayInChat: true,
      matchedPlaceId: signals.namedPlaceId ?? undefined,
      candidatePlaceIds: [],
    };
    return { ...partial, responseHint: buildResponseHint(partial) };
  }

  if (signals.wantsRoomStory && signals.namedPlaceId) {
    const namedId = signals.namedPlaceId;
    const selected = [{ placeId: namedId, score: 100, reasons: ["named_room_story"] }];
    const placeRecs = buildPlaceRecommendations(selected, signals);
    const partial: Omit<EstateJudgmentResult, "responseHint"> = {
      handled: true,
      intentFamily: "explore",
      signals,
      recommendations: placeRecs,
      intro: buildRecommendationIntro(signals),
      body: buildRecommendationBody(placeRecs, signals),
      suggestions: buildSuggestions(placeRecs, signals),
      shouldAskQuestion: false,
      stayInChat: false,
      matchedPlaceId: namedId,
      candidatePlaceIds: [namedId],
    };
    return { ...partial, responseHint: buildResponseHint(partial) };
  }

  const scored = scorePlaceCandidates(signals, input);
  const selected = selectTopCandidates(scored);
  const placeRecs = buildPlaceRecommendations(selected, signals);

  const featureIds = familySpec
    ? [
        ...featureIdsForIntentFamilies(signals.intentFamilies),
        ...(signals.wantsFocus ? familySpec.musicFeatureIds : []),
        ...(signals.wantsRecover ? familySpec.breathingFeatureIds : []),
      ]
    : [];

  const featureRecs =
    signals.wantsFocus || signals.wantsRecover
      ? buildFeatureRecommendations(signals, [...new Set(featureIds)])
      : [];

  const recommendations = [...placeRecs, ...featureRecs];
  const partial: Omit<EstateJudgmentResult, "responseHint"> = {
    handled: true,
    intentFamily,
    signals,
    recommendations,
    intro: buildRecommendationIntro(signals),
    body: buildRecommendationBody(recommendations, signals),
    suggestions: buildSuggestions(recommendations, signals),
    shouldAskQuestion: false,
    stayInChat: recommendations.length === 0,
    discoveryCategories: signals.wantsCatalog
      ? ESTATE_DISCOVERY_CATEGORIES.map((c) => c.label)
      : undefined,
    matchedPlaceId: signals.namedPlaceId ?? placeRecs[0]?.id ?? undefined,
    candidatePlaceIds: scored.map((s) => s.placeId),
  };

  return { ...partial, responseHint: buildResponseHint(partial) };
}

export function describeEstatePlace(placeId: string): string {
  const place = getPlaceById(placeId);
  if (!place) {
    return "That name isn't in the Estate registry yet — tell me another room and I'll find it.";
  }
  const profile = getPurposeProfile(placeId);
  const parts = [
    `${profile.displayName} — ${profile.purpose}`,
    "",
    `Feels like ${profile.primaryFeeling.toLowerCase()}.`,
  ];
  if (place.guidebook?.epigraph) {
    parts.push("", place.guidebook.epigraph);
  }
  if (profile.bestFor.length) {
    parts.push(
      "",
      `Best when you need ${profile.bestFor.slice(0, 3).join(", ").toLowerCase()}.`,
    );
  }
  return parts.join("\n");
}
