import { isYoutubeUrl, resolveYoutubeEmbed } from "@/lib/focusAudio/youtubeEmbed";
import type { PeacefulPlaceDestination } from "./destinationTypes";

const DIRECT_AUDIO_RE = /\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/i;

function isDirectAudioUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (DIRECT_AUDIO_RE.test(trimmed)) return true;
  try {
    return DIRECT_AUDIO_RE.test(new URL(trimmed).pathname);
  } catch {
    return false;
  }
}

export type PeacefulPlacePlayback =
  | { kind: "youtube"; embedUrl: string }
  | { kind: "direct"; src: string }
  | { kind: "unavailable" };

/** In-app playback for immersive destinations — never surfaces YouTube UI copy. */
export function resolvePeacefulPlacePlayback(
  destination: PeacefulPlaceDestination,
): PeacefulPlacePlayback {
  const audioSrc = destination.audioSrc.trim();
  if (!audioSrc) return { kind: "unavailable" };

  if (destination.audioType === "youtube" || isYoutubeUrl(audioSrc)) {
    const embed = resolveYoutubeEmbed(audioSrc);
    if (embed.kind === "embed") {
      return { kind: "youtube", embedUrl: embed.embedUrl };
    }
    return { kind: "unavailable" };
  }

  if (isDirectAudioUrl(audioSrc)) {
    return { kind: "direct", src: audioSrc };
  }

  return { kind: "unavailable" };
}
