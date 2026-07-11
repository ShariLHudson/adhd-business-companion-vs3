/**
 * Score place candidates using purpose profiles + context signals.
 */

import { filterPlacesForAudioContext } from "@/lib/estate/estateNonAudioPlaces";
import { getPlaceById } from "@/lib/estateKnowledge";
import { placeIdsForIntentFamilies } from "./intentFamilies";
import { getPurposeProfile } from "./purposeProfiles";
import type {
  EstateContextSignals,
  EstateJudgmentInput,
  ScoredPlaceCandidate,
} from "./types";

function scorePlaceForSignals(
  placeId: string,
  signals: EstateContextSignals,
  input: EstateJudgmentInput,
): ScoredPlaceCandidate {
  const place = getPlaceById(placeId);
  const profile = getPurposeProfile(placeId);
  const reasons: string[] = [];
  let score = 0;

  if (!place) {
    return { placeId, score: -100, reasons: ["unknown_place"] };
  }

  if (place.walkable) {
    score += 2;
    reasons.push("walkable");
  } else if (place.guidebook) {
    score += 0.5;
    reasons.push("guidebook_only");
  } else {
    score -= 1;
  }

  if (input.currentPlaceId === placeId) {
    score -= 2;
    reasons.push("already_here");
  }

  if (input.visitedPlaceIds?.includes(placeId)) {
    score -= 0.5;
    reasons.push("visited_before");
  } else {
    score += 0.5;
    reasons.push("discovery_opportunity");
  }

  if (signals.wantsRecover) {
    if (profile.energyLevel === "low") {
      score += 3;
      reasons.push("low_energy_restore");
    }
    for (const need of ["Overwhelm", "Stress", "Burnout", "Mental reset"]) {
      if (profile.bestFor.some((b) => b.toLowerCase().includes(need.toLowerCase()))) {
        score += 2;
        reasons.push(`best_for_${need.toLowerCase().replace(/\s+/g, "_")}`);
      }
    }
  }

  if (signals.wantsReading) {
    if (
      profile.idealActivities.some((a) => /read/i.test(a)) ||
      place.groups.includes("reading")
    ) {
      score += 4;
      reasons.push("reading_fit");
    }
  }

  if (signals.wantsWater && place.groups.includes("water")) {
    score += 4;
    reasons.push("water_atmosphere");
  }

  if (signals.wantsThink) {
    if (
      profile.idealActivities.some((a) =>
        /think|decision|reflect/i.test(a),
      ) ||
      place.groups.includes("think")
    ) {
      score += 3;
      reasons.push("thinking_fit");
    }
  }

  if (signals.wantsFocus) {
    if (profile.energyLevel === "medium") {
      score += 1;
    }
    if (
      profile.idealActivities.some((a) =>
        /focus|listen|work/i.test(a),
      ) ||
      place.groups.includes("listening")
    ) {
      score += 3;
      reasons.push("focus_fit");
    }
  }

  if (signals.emotional === "overwhelmed" || signals.emotional === "burnout") {
    if (profile.notRecommendedFor.some((n) => /urgent|high-energy/i.test(n))) {
      score -= 3;
      reasons.push("not_for_overwhelm");
    }
  }

  if (signals.activityMode === "creation") {
    if (profile.energyLevel === "high") score += 2;
    if (profile.energyLevel === "low") score -= 1;
  }

  if (signals.activityMode === "reflection") {
    if (profile.energyLevel === "low") score += 2;
  }

  if (place.chatCanDescribe) {
    score += 0.5;
  }

  if (profile.discoveryLevel === "featured") {
    score += 0.5;
  }

  return { placeId, score, reasons };
}

export function scorePlaceCandidates(
  signals: EstateContextSignals,
  input: EstateJudgmentInput,
  extraPlaceIds: readonly string[] = [],
): ScoredPlaceCandidate[] {
  const candidateIds = new Set<string>([
    ...placeIdsForIntentFamilies(signals.intentFamilies),
    ...extraPlaceIds,
  ]);

  if (signals.namedPlaceId) {
    candidateIds.add(signals.namedPlaceId);
  }

  if (signals.wantsWater) {
    for (const id of ["conservatory", "reflection-pond", "journal", "seat-at-pond"]) {
      candidateIds.add(id);
    }
  }

  if (signals.wantsReading) {
    for (const id of ["library", "reading-nook", "conservatory", "greenhouse", "journal"]) {
      candidateIds.add(id);
    }
  }

  let ids = [...candidateIds];
  if (signals.wantsFocus) {
    ids = filterPlacesForAudioContext(ids);
  }

  return ids
    .map((id) => scorePlaceForSignals(id, signals, input))
    .filter((c) => c.score > -50)
    .sort((a, b) => b.score - a.score);
}

/** Pick 1–3 recommendations based on score spread — not always three. */
export function selectTopCandidates(
  scored: ScoredPlaceCandidate[],
): ScoredPlaceCandidate[] {
  if (scored.length === 0) return [];
  if (scored.length === 1) return scored;

  const top = scored[0]!;
  const second = scored[1]!;

  if (top.score - second.score >= 2.5) {
    return [top];
  }

  const third = scored[2];
  const selected = [top, second];
  if (third && top.score - third.score < 4) {
    selected.push(third);
  }
  return selected;
}
