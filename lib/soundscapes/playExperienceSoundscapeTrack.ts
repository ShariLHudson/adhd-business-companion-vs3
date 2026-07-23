import {
  playSoundscapeTrack,
  type EstateAudioPlayResult,
} from "@/lib/estate/estateAudioService";
import type { ExperienceSoundscapeTrack } from "./experienceSoundscapesMenu";

/**
 * Play a room-menu soundscape track without leaving the current room.
 * Routes through the shared Estate Audio Service (one master + one play path).
 */
export async function playExperienceSoundscapeTrack(
  track: ExperienceSoundscapeTrack,
): Promise<EstateAudioPlayResult> {
  return playSoundscapeTrack(track);
}
