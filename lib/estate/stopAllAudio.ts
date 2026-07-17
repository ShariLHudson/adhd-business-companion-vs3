/**
 * Authoritative Stop All Sound (133–135).
 * Stops environmental layers, welcome voice, registered media, and orphan DOM players.
 */

import { stopAllEstateEnvironmentalAudio } from "@/lib/estate/estateEnvironmentalAudio";
import { destroyWelcomeHomeAudioManager } from "@/lib/welcomeAudio/welcomeHomeAudioSession";
import { stopAllVoiceSessions } from "@/lib/windowDismiss/dismissPolicy";
import { patchEstateAudioSettings } from "@/lib/estate/estateAudioSettings";

const mediaStoppers = new Set<() => void>();

/** Register a Focus / Peaceful / modal player so Stop All Sound can reach it. */
export function registerEstateMediaStopper(stop: () => void): () => void {
  mediaStoppers.add(stop);
  return () => {
    mediaStoppers.delete(stop);
  };
}

function pauseOrphanDomMedia(): void {
  if (typeof document === "undefined") return;
  document.querySelectorAll("audio, video").forEach((el) => {
    const media = el as HTMLMediaElement;
    try {
      media.pause();
      media.muted = true;
      if (Number.isFinite(media.currentTime)) {
        media.currentTime = 0;
      }
    } catch {
      /* ignore */
    }
  });
}

function runRegisteredStoppers(): void {
  for (const stop of [...mediaStoppers]) {
    try {
      stop();
    } catch {
      /* ignore */
    }
  }
}

/**
 * Stop every active audio source Spark owns — including hidden / orphaned players.
 * Does not flip permanent “Silence Estate” unless `silenceEstate` is true.
 */
export async function stopAllAudio(opts?: {
  /** When true, persist silenced so autoplay paths stay quiet. */
  silenceEstate?: boolean;
}): Promise<void> {
  runRegisteredStoppers();
  pauseOrphanDomMedia();

  if (typeof window !== "undefined") {
    stopAllVoiceSessions();
    try {
      destroyWelcomeHomeAudioManager();
    } catch {
      /* ignore */
    }
    await stopAllEstateEnvironmentalAudio();
    window.dispatchEvent(new CustomEvent(STOP_ALL_AUDIO_EVENT));
  }

  if (opts?.silenceEstate) {
    patchEstateAudioSettings({ silenced: true, autoplayAllowed: false });
  }
}

export const STOP_ALL_AUDIO_EVENT = "spark:estate:stop-all-audio";
