import {
  composeLivingCompanionRoom,
  evaluateCompanionEnvironmentIntelligence,
} from "@/lib/companionEnvironmentIntelligence";
import { resolveSceneIntegrity } from "@/lib/companionHospitalityPrototype";
import { evaluateWelcomePresenceIntelligence } from "@/lib/welcomePresenceIntelligence";
import { resolveWelcomeAtmosphere } from "@/lib/welcomeLivingRoom";
import {
  constitutionPassed,
  evaluateConstitution,
} from "../constitution";
import {
  evaluateHospitalityPrinciple,
  hospitalityPrinciplePassed,
} from "../hospitalityPrinciple";
import { placeById } from "../libraries/placeLibrary";
import { conversationStyleForPlace } from "../libraries/conversationLibrary";
import { resolveHospitalityLayers } from "../resolveHospitalityLayers";
import { evaluateCompanionPresenceEngine } from "../companionPresenceEngine";
import type { PresenceActivityModifier } from "../companionPresenceEngine";
import { evaluateCompanionNeedsIntelligence } from "@/lib/companionNeedsIntelligence";
import type { CompanionNeedsIntelligence } from "@/lib/companionNeedsIntelligence";
import type {
  CompanionLibraryId,
  CompanionPlace,
  CompanionPlaceId,
  UniverseOrchestrationInput,
  UniverseOrchestrationResult,
} from "../types";
import type { ResolvedHospitalityScene } from "@/lib/companionHospitalityPrototype";
import type { CompanionHospitalityProfile } from "../libraries/hospitalityProfileLibrary";

const MAX_FOREGROUND_OBJECTS = 5;

function hospitalityLabel(id: string): string {
  return id.replace(/-/g, " ");
}

function finalizeOrchestration(input: {
  placeId: CompanionPlaceId;
  place: CompanionPlace;
  librariesUsed: CompanionLibraryId[];
  constitution: ReturnType<typeof evaluateConstitution>;
  resolvedScene?: ResolvedHospitalityScene;
  livingRoom?: UniverseOrchestrationResult["livingRoom"];
  greeting?: string;
  invite?: string;
  atmosphere?: string;
  preparedItems: string[];
  profile?: CompanionHospitalityProfile;
  now: Date;
  presenceModifiers?: PresenceActivityModifier[];
  needs?: CompanionNeedsIntelligence | null;
}): UniverseOrchestrationResult {
  const presence = evaluateCompanionPresenceEngine({
    placeId: input.placeId,
    modifiers: input.presenceModifiers,
  });

  const layers = resolveHospitalityLayers({
    place: input.place,
    scene: input.resolvedScene,
    profile: input.profile,
    greeting: input.greeting,
    invite: input.invite,
    now: input.now,
  });

  const hospitalityPrinciple = evaluateHospitalityPrinciple({
    placeId: input.placeId,
    greeting: input.greeting,
    invite: input.invite,
    atmosphere: input.atmosphere,
    preparedItems: input.preparedItems,
  });

  return {
    place: input.place,
    constitution: input.constitution,
    constitutionPassed: constitutionPassed(input.constitution),
    hospitalityPrinciple,
    hospitalityPrinciplePassed: hospitalityPrinciplePassed(hospitalityPrinciple),
    layers,
    librariesUsed: [...input.librariesUsed, "presence"],
    resolvedScene: input.resolvedScene,
    livingRoom: input.livingRoom,
    greeting: input.greeting,
    invite: input.invite,
    atmosphere: input.atmosphere,
    presence,
    needs: input.needs ?? null,
  };
}

/**
 * Companion Brain Orchestrator™
 *
 * Five layers:
 * 1 Foundation (never changes) → 2 Hospitality → 3 Conversation →
 * 4 Traditions → 5 Guest Hospitality
 *
 * The home belongs to Shari. The welcome belongs to the guest.
 */
export function orchestrateCompanionUniverse(
  input: UniverseOrchestrationInput,
): UniverseOrchestrationResult {
  const now = input.now ?? new Date();
  const profile = input.hospitalityProfile;

  const needs = input.needsContext
    ? evaluateCompanionNeedsIntelligence({
        ...input.needsContext,
        lockedPlaceId:
          input.placeLocked && input.placeId
            ? input.placeId
            : input.needsContext.lockedPlaceId,
      })
    : null;

  const placeId: CompanionPlaceId =
    input.placeLocked && input.placeId
      ? input.placeId
      : needs?.recommendedPlaceId ?? input.placeId ?? "living-room";
  const place = placeById(placeId);

  const librariesUsed: CompanionLibraryId[] = [
    "place",
    "emotional-promise",
    "signature-object",
    "personality",
    "constitution",
    "conversation",
    "traditions",
  ];

  if (needs) {
    librariesUsed.unshift("needs");
  }

  if (profile?.guestKey) {
    librariesUsed.push("hospitality-profile", "memory");
  } else if (profile && Object.keys(profile).length > 0) {
    librariesUsed.push("hospitality-profile");
  }

  if (input.directorControls) {
    librariesUsed.push(
      "scene",
      "scene-integrity",
      "image",
      "hospitality",
      "motion",
      "ambient-sound",
      "lighting",
      "seasonal",
      "book",
    );

    const resolvedScene = resolveSceneIntegrity(input.directorControls);
    const constitution = evaluateConstitution({
      foregroundObjectCount: resolvedScene.hospitality.length,
      maxForegroundObjects: MAX_FOREGROUND_OBJECTS,
      hasPlaceholderShapes: false,
      hasOverlappingCopy: false,
      hasImpossibleSceneCombo: resolvedScene.corrections.length > 0,
      motionLoopCount: 0,
      decorativeOnlyObjects: 0,
    });

    return finalizeOrchestration({
      placeId,
      place,
      librariesUsed,
      constitution,
      resolvedScene,
      greeting: resolvedScene.greeting,
      invite: resolvedScene.invite,
      atmosphere: resolvedScene.atmosphere,
      preparedItems: resolvedScene.hospitality.map(hospitalityLabel),
      profile,
      now,
      presenceModifiers: input.presenceModifiers,
      needs,
    });
  }

  if (input.useProductionPath) {
    librariesUsed.push(
      "image",
      "scene-integrity",
      "hospitality",
      "motion",
      "seasonal",
      "discovery",
      "greeting",
      "object",
      "book",
      "memory",
    );

    const timeOfDay = "morning" as const;
    const atmosphere = resolveWelcomeAtmosphere({ timeOfDay, now });
    const welcomePresence = evaluateWelcomePresenceIntelligence({
      now,
      homeState: "QUIET_PRESENCE",
      timeOfDay,
      sessionVisitIndex: 2,
      returnIntervalHours: 24,
      returnIntervalDays: 1,
      isFirstMeeting: false,
    });
    const environment = evaluateCompanionEnvironmentIntelligence({
      now,
      timeOfDay,
      season: atmosphere.season,
      sessionVisitIndex: 2,
      isFirstMeeting: false,
    });
    const livingRoom = composeLivingCompanionRoom({
      environment,
      conversation: welcomePresence,
    });

    const constitution = evaluateConstitution({
      foregroundObjectCount: livingRoom.layer2.length,
      maxForegroundObjects: MAX_FOREGROUND_OBJECTS,
      hasPlaceholderShapes: false,
      hasOverlappingCopy: false,
      hasImpossibleSceneCombo: false,
      motionLoopCount: 0,
      decorativeOnlyObjects: 0,
    });

    const atmosphereLine = `${atmosphere.season} — ${atmosphere.timeOfDay}`;

    return finalizeOrchestration({
      placeId,
      place,
      librariesUsed,
      constitution,
      livingRoom,
      greeting: welcomePresence.greeting,
      invite: welcomePresence.invite ?? undefined,
      atmosphere: atmosphereLine,
      preparedItems: livingRoom.layer2.map(
        (object) => object.label ?? object.kind,
      ),
      profile,
      now,
      presenceModifiers: input.presenceModifiers,
      needs,
    });
  }

  const constitution = evaluateConstitution({
    foregroundObjectCount: 0,
    maxForegroundObjects: MAX_FOREGROUND_OBJECTS,
    hasPlaceholderShapes: false,
    hasOverlappingCopy: false,
    hasImpossibleSceneCombo: false,
    motionLoopCount: 0,
    decorativeOnlyObjects: 0,
  });

  const invite = conversationStyleForPlace(placeId)?.invitePattern;

  return finalizeOrchestration({
    placeId,
    place,
    librariesUsed,
    constitution,
    greeting: place.emotionalPromise,
    invite,
    atmosphere: place.purpose,
    preparedItems: [],
    profile,
    now,
    presenceModifiers: input.presenceModifiers,
    needs,
  });
}
