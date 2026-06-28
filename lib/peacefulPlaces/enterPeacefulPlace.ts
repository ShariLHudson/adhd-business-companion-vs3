import { rememberAudioSelection } from "@/lib/audioPlaylists";
import type { SoundscapeMoodId } from "@/lib/soundscapes/types";
import type { PeacefulPlaceCategoryId, PeacefulPlaceDestination } from "./destinationTypes";

const CATEGORY_TO_MOOD: Record<PeacefulPlaceCategoryId, SoundscapeMoodId> = {
  slowDown: "calming",
  focus: "focus",
  unwind: "unwind",
  recharge: "energize",
};

export type EnterPeacefulPlaceResult = {
  destination: PeacefulPlaceDestination;
};

/**
 * Single entry point for immersive Peaceful Places™ destinations.
 * Image + ambient audio are one experience — never separate actions.
 */
export function enterPeacefulPlace(
  destination: PeacefulPlaceDestination,
): EnterPeacefulPlaceResult {
  if (!destination.enabled) {
    throw new Error(`Peaceful place destination is disabled: ${destination.id}`);
  }

  const mood = CATEGORY_TO_MOOD[destination.category];
  rememberAudioSelection("focus-audio", mood, destination.soundscapeId);

  void import("@/lib/ecosystem/eventTrackingEngine").then(({ trackEcosystemEvent }) => {
    trackEcosystemEvent({
      eventType: "feature.focus_audio_started",
      feature: "focus-audio",
      metadata: {
        categoryId: mood,
        trackId: destination.soundscapeId,
        peacefulPlaceId: destination.placeId,
        peacefulPlaceDestinationId: destination.id,
        playback: "in-app",
        soundscape: true,
        peacefulPlace: true,
        peacefulPlacesDirectory: true,
        estateSignpost: true,
        unifiedDestination: true,
      },
    });
  });

  return { destination };
}
