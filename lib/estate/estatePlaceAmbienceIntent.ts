/**
 * Estate Place Ambience Intent™ — emotional purpose per canonical place.
 *
 * Ambience is hospitality, not background audio. Every place earns a unique
 * sonic identity. V1 may use one loop per place; layers document the target mix.
 *
 * @see docs/estate/ESTATE_AMBIENT_SOUND_SYSTEM.md
 */

import type {
  EstateAmbienceIntentLayer,
  EstateArrivalAmbienceProfile,
} from "./estateArrivalExperienceTypes";
import { resolveCanonicalPlaceId } from "./canonicalEstateRegistry";

export type EstatePlaceAmbienceIntent = {
  placeId: string;
  displayName: string;
  emotionalPurpose: string;
  layers: readonly EstateAmbienceIntentLayer[];
  hospitalityNote?: string;
};

/** Canonical hospitality intent — one entry per place with a defined sonic identity. */
export const ESTATE_PLACE_AMBIENCE_INTENT: Readonly<
  Record<string, EstatePlaceAmbienceIntent>
> = {
  "welcome-home": {
    placeId: "welcome-home",
    displayName: "Welcome Home",
    emotionalPurpose: "Belonging, porch arrival, unhurried welcome",
    layers: [
      { id: "breeze", label: "soft breeze", prominence: "subtle" },
      { id: "birds", label: "distant birds", prominence: "very-subtle" },
      { id: "porch", label: "porch ambience", prominence: "subtle" },
    ],
  },
  sunroom: {
    placeId: "sunroom",
    displayName: "Sunroom",
    emotionalPurpose: "Quiet welcome, same hearth as home",
    layers: [
      { id: "breeze", label: "soft breeze", prominence: "subtle" },
      { id: "birds", label: "distant birds", prominence: "very-subtle" },
      { id: "porch", label: "porch ambience", prominence: "subtle" },
    ],
  },
  journal: {
    placeId: "journal",
    displayName: "Journal Gazebo",
    emotionalPurpose: "Reflection, regulation, gentle release",
    layers: [
      { id: "water", label: "gentle water", prominence: "subtle" },
      { id: "birds", label: "birds", prominence: "very-subtle" },
      { id: "breeze", label: "breeze", prominence: "subtle" },
      {
        id: "page",
        label: "occasional page turn",
        prominence: "very-subtle",
      },
    ],
  },
  "apple-orchard": {
    placeId: "apple-orchard",
    displayName: "Apple Orchard",
    emotionalPurpose: "Patience, open air, ideas ripening slowly",
    layers: [
      { id: "orchard", label: "orchard ambience", prominence: "subtle" },
      { id: "leaves", label: "leaves moving", prominence: "subtle" },
      { id: "bees", label: "bees", prominence: "very-subtle" },
      { id: "birds", label: "distant birds", prominence: "very-subtle" },
      { id: "wind", label: "soft wind", prominence: "subtle" },
    ],
  },
  greenhouse: {
    placeId: "greenhouse",
    displayName: "Greenhouse",
    emotionalPurpose: "Growth, nurture, glasshouse calm",
    layers: [
      { id: "glass", label: "glasshouse atmosphere", prominence: "subtle" },
      { id: "water", label: "light water trickle", prominence: "very-subtle" },
      {
        id: "garden",
        label: "occasional gardening sounds",
        prominence: "very-subtle",
      },
    ],
  },
  "reading-nook": {
    placeId: "reading-nook",
    displayName: "Reading Nook",
    emotionalPurpose: "Unhurried thought, cozy focus",
    layers: [
      {
        id: "hearth",
        label: "fireplace or gentle room ambience",
        prominence: "subtle",
      },
      { id: "pages", label: "quiet page turns", prominence: "very-subtle" },
      { id: "clock", label: "clock very faint", prominence: "very-subtle" },
    ],
  },
  gardens: {
    placeId: "gardens",
    displayName: "Celebration Garden",
    emotionalPurpose: "Quiet triumph, living celebration",
    layers: [
      { id: "fountain", label: "water fountain", prominence: "subtle" },
      {
        id: "butterflies",
        label: "butterflies (visual)",
        prominence: "very-subtle",
      },
      { id: "birds", label: "light birds", prominence: "very-subtle" },
    ],
  },
  "celebration-room": {
    placeId: "celebration-room",
    displayName: "Celebration Room",
    emotionalPurpose: "Ritual celebration without performance pressure",
    layers: [
      { id: "fountain", label: "water fountain", prominence: "subtle" },
      {
        id: "butterflies",
        label: "butterflies (visual)",
        prominence: "very-subtle",
      },
      { id: "birds", label: "light birds", prominence: "very-subtle" },
    ],
  },
  library: {
    placeId: "library",
    displayName: "Achievement Library",
    emotionalPurpose: "Proof, reflection, earned stillness",
    layers: [
      { id: "library", label: "quiet library ambience", prominence: "subtle" },
      { id: "fireplace", label: "fireplace", prominence: "very-subtle" },
      { id: "room", label: "soft room tone", prominence: "subtle" },
    ],
  },
  "goals-projects": {
    placeId: "goals-projects",
    displayName: "Boardroom",
    emotionalPurpose: "Executive clarity without cold performance energy",
    layers: [
      { id: "silence", label: "silence", prominence: "present" },
      { id: "hvac", label: "HVAC room tone", prominence: "very-subtle" },
      {
        id: "office",
        label: "very subtle executive office ambience",
        prominence: "very-subtle",
      },
    ],
    hospitalityNote: "Never busy or motivational — room tone only.",
  },
};

export function resolveEstatePlaceAmbienceIntent(
  placeId: string,
): EstatePlaceAmbienceIntent | undefined {
  const id = resolveCanonicalPlaceId(placeId);
  return ESTATE_PLACE_AMBIENCE_INTENT[id];
}

export function formatAmbienceCharacterFromIntent(
  intent: EstatePlaceAmbienceIntent,
): string {
  const layerText = intent.layers
    .map((layer) => {
      if (layer.prominence === "very-subtle") {
        return `${layer.label} (very subtle)`;
      }
      return layer.label;
    })
    .join(", ");
  return `${intent.emotionalPurpose} — ${layerText}`;
}

/** Merge hospitality intent layers onto a resolved media profile. */
export function enrichAmbienceProfileWithIntent(
  placeId: string,
  profile: EstateArrivalAmbienceProfile,
): EstateArrivalAmbienceProfile {
  const intent = resolveEstatePlaceAmbienceIntent(placeId);
  if (!intent) return profile;

  const trackPool =
    profile.trackPool ??
    (profile.src ? [{ src: profile.src, weight: 1, character: profile.character }] : undefined);

  return {
    ...profile,
    layers: intent.layers,
    character: formatAmbienceCharacterFromIntent(intent),
    trackPool,
  };
}

/**
 * Pick the active loop for this visit.
 * V1: primary src. Future: weighted random from trackPool per visit seed.
 */
export function pickAmbienceTrackForVisit(
  profile: EstateArrivalAmbienceProfile,
  _visitSeed?: string,
): string {
  const pool = profile.trackPool;
  if (!pool?.length) return profile.src;
  if (pool.length === 1) return pool[0]!.src;
  // Future: gentle randomization — for now return primary to avoid behavior change.
  return profile.src;
}
