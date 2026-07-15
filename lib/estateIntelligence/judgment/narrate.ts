/**
 * Human-facing narrative for Estate Intelligence recommendations.
 * Rule of Gentle Guidance — recommend, never direct.
 */

import { getFeatureCatalog, getPlaceById } from "@/lib/estateKnowledge";
import { ESTATE_DISCOVERY_CATEGORIES } from "./discoveryCategories";
import {
  gentleFeatureLeadIn,
  gentleFeatureMightHelp,
  gentlePlaceAnotherOption,
  gentlePlaceLeadIn,
  gentlePlaceMightFit,
  gentleRoomStoryClosing,
  gentleStayHereOption,
  gentleSuggestionForPlace,
  gentleWanderInvitation,
  stripEstateTm,
} from "./gentleGuidance";
import { getPurposeProfile } from "./purposeProfiles";
import type {
  EstateContextSignals,
  EstateRecommendation,
  ScoredPlaceCandidate,
} from "./types";

function featureName(featureId: string): string {
  const feature = getFeatureCatalog().find((f) => f.id === featureId);
  return feature?.name ?? featureId;
}

export function buildRecommendationWhy(
  placeId: string,
  signals: EstateContextSignals,
): string {
  const profile = getPurposeProfile(placeId);
  const place = getPlaceById(placeId);

  if (signals.emotional === "overwhelmed" || signals.emotional === "burnout") {
    const curatedWhy: Record<string, string> = {
      "peaceful-places":
        "A quiet place to slow down and settle your thoughts.",
      "lakeside-hammock":
        "A gentle place to pause, rest, and let your mind ease.",
      conservatory:
        "A calming place for breathing room, reflection, and a sense of wonder.",
      "ocean-conservatory":
        "A calming place for breathing room, reflection, and a sense of wonder.",
    };
    const curated = curatedWhy[placeId] ?? curatedWhy[place?.id ?? ""];
    if (curated) return curated;
    return (
      place?.guidebook?.epigraph ??
      profile.purpose ??
      `${stripEstateTm(profile.displayName)} is a quiet place to slow down.`
    );
  }

  if (signals.wantsReading) {
    return `${stripEstateTm(profile.displayName)} is wonderful when you want ${profile.idealActivities[0]?.toLowerCase() ?? "quiet reading"} without rushing.`;
  }

  if (signals.wantsThink) {
    return `${stripEstateTm(profile.displayName)} gives you room to think — ${profile.purpose.toLowerCase()}.`;
  }

  if (signals.wantsFocus) {
    return `${stripEstateTm(profile.displayName)} supports focus with ${profile.primaryFeeling.toLowerCase()} energy and a calm atmosphere.`;
  }

  if (signals.wantsWater) {
    return `${stripEstateTm(profile.displayName)} sits among the Estate's peaceful water places — good for ${profile.primaryFeeling.toLowerCase()}.`;
  }

  if (place?.guidebook?.epigraph) {
    return place.guidebook.epigraph;
  }

  return profile.purpose.toLowerCase();
}

export function buildPlaceRecommendations(
  selected: ScoredPlaceCandidate[],
  signals: EstateContextSignals,
): EstateRecommendation[] {
  return selected.map((candidate) => {
    const place = getPlaceById(candidate.placeId);
    const profile = getPurposeProfile(candidate.placeId);
    return {
      kind: "place" as const,
      id: candidate.placeId,
      displayName: place?.displayName ?? profile.displayName,
      why: buildRecommendationWhy(candidate.placeId, signals),
      confidence: Math.min(1, candidate.score / 8),
    };
  });
}

export function buildFeatureRecommendations(
  signals: EstateContextSignals,
  featureIds: readonly string[],
): EstateRecommendation[] {
  const recs: EstateRecommendation[] = [];
  const max = signals.wantsFocus ? 2 : 1;

  for (const id of featureIds.slice(0, max)) {
    const name = featureName(id);
    recs.push({
      kind: id === "breathe" ? "breathing" : id === "focus-audio" ? "music" : "feature",
      id,
      displayName: name,
      why:
        id === "breathe"
          ? "A few steady breaths can help your nervous system settle before you choose what feels right."
          : id === "focus-audio"
            ? gentleFeatureMightHelp("Peaceful Places")
            : gentleFeatureMightHelp(name),
      confidence: 0.7,
    });
  }
  return recs;
}

export function buildRecommendationIntro(signals: EstateContextSignals): string {
  if (signals.emotional === "overwhelmed") {
    return "Since you're feeling overwhelmed, a few places come to mind — no rush to choose.";
  }
  if (signals.emotional === "burnout") {
    return "You've been carrying a lot. A few gentle places come to mind.";
  }
  if (signals.wantsReading) {
    return "For reading, a few places come to mind.";
  }
  if (signals.wantsThink) {
    return "When you need to think, I usually look toward the quieter corners of the Estate.";
  }
  if (signals.wantsFocus) {
    return "For focus, we might settle into a room — or start with something simple right here.";
  }
  if (signals.wantsWater) {
    return "A few peaceful spots by the water come to mind.";
  }
  if (signals.wantsCatalog) {
    return "The Estate unfolds in gentle categories — not one long list.";
  }
  if (signals.wantsRoomStory) {
    return "Ah — one of my favorite places to talk about.";
  }
  return "A few places come to mind.";
}

function bodyForSingleRecommendation(rec: EstateRecommendation): string {
  if (rec.kind === "place") {
    return [
      gentlePlaceLeadIn(rec.displayName),
      "",
      rec.why,
      "",
      gentleWanderInvitation(),
      gentleStayHereOption(),
    ].join("\n");
  }

  return [
    gentleFeatureLeadIn(rec.displayName),
    "",
    rec.why,
    "",
    gentleStayHereOption(),
  ].join("\n");
}

function bodyForMultipleRecommendations(
  placeRecs: EstateRecommendation[],
  otherRecs: EstateRecommendation[],
): string {
  const lines: string[] = ["There are a few places I think might fit:"];

  if (placeRecs[0]) {
    lines.push("", gentlePlaceMightFit(placeRecs[0].displayName), placeRecs[0].why);
  }
  for (const rec of placeRecs.slice(1)) {
    lines.push("", gentlePlaceAnotherOption(rec.displayName), rec.why);
  }

  if (otherRecs.length > 0) {
    lines.push("", "You might also consider:");
    for (const rec of otherRecs) {
      lines.push(
        rec.kind === "feature" || rec.kind === "breathing"
          ? gentleFeatureLeadIn(rec.displayName)
          : gentleFeatureMightHelp(rec.displayName),
      );
      lines.push(rec.why);
    }
  }

  lines.push("", gentleWanderInvitation(), gentleStayHereOption());
  return lines.join("\n");
}

export function buildRecommendationBody(
  recommendations: readonly EstateRecommendation[],
  signals: EstateContextSignals,
): string {
  if (signals.wantsCatalog) {
    const lines = ESTATE_DISCOVERY_CATEGORIES.map(
      (c) => `${c.label} — ${c.description}`,
    );
    return [
      "You'll find places grouped by feeling, not by feature name:",
      "",
      ...lines.map((l) => `• ${l}`),
      "",
      "Would you like to explore one of those?",
    ].join("\n");
  }

  if (signals.wantsRoomStory && recommendations[0]?.kind === "place") {
    const place = getPlaceById(recommendations[0].id);
    const profile = getPurposeProfile(recommendations[0].id);
    const parts = [
      `${stripEstateTm(profile.displayName)} is ${profile.purpose.toLowerCase()}.`,
      "",
      `It feels like ${profile.primaryFeeling.toLowerCase()}${profile.secondaryFeelings.length ? ` — ${profile.secondaryFeelings.join(", ").toLowerCase()}` : ""}.`,
    ];
    if (place?.guidebook?.openingLine) {
      parts.push("", place.guidebook.openingLine);
    }
    parts.push("", recommendations[0].why);
    parts.push("", gentleRoomStoryClosing(place?.walkable ?? false));
    return parts.join("\n");
  }

  if (recommendations.length === 1) {
    return bodyForSingleRecommendation(recommendations[0]!);
  }

  const placeRecs = recommendations.filter((r) => r.kind === "place");
  const otherRecs = recommendations.filter((r) => r.kind !== "place");
  return bodyForMultipleRecommendations(placeRecs, otherRecs);
}

export function buildSuggestions(
  recommendations: readonly EstateRecommendation[],
  signals: EstateContextSignals,
): string[] {
  if (signals.wantsCatalog) {
    return ["Reading spaces", "Water spaces", "Stay here"];
  }
  const suggestions = recommendations
    .filter((r) => r.kind === "place")
    .slice(0, 2)
    .map((r) => gentleSuggestionForPlace(r.displayName));
  suggestions.push("Stay here");
  return suggestions.slice(0, 3);
}
