import { patchEstateAudioSettings } from "@/lib/estate/estateAudioSettings";
import { patchEstateRuntimeState } from "@/lib/estate/estateRuntimeState";
import { startEstateSoundscapeOverlayFromUrl } from "@/lib/estate/estateSoundscapeOverlay";
import type { ExperienceSoundscapeTrack } from "./experienceSoundscapesMenu";

/** Play a room-menu soundscape track without leaving the current room. */
export async function playExperienceSoundscapeTrack(
  track: ExperienceSoundscapeTrack,
): Promise<void> {
  patchEstateAudioSettings({
    silenced: false,
    soundscapeOverlayEnabled: true,
  });
  patchEstateRuntimeState({ activeSoundscape: track.id });
  await startEstateSoundscapeOverlayFromUrl(track.id, track.src);
}
