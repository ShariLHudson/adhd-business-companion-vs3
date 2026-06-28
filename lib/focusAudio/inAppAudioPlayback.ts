import type { AudioLink } from "@/lib/audioPlaylists";
import { isYoutubeUrl, resolveYoutubeEmbed } from "@/lib/focusAudio/youtubeEmbed";

export type InAppAudioPlayback =
  | { kind: "youtube"; embedUrl: string; openUrl: string; label: string }
  | { kind: "direct"; src: string; openUrl: string; label: string }
  | {
      kind: "unsupported";
      openUrl: string;
      label: string;
      message: string;
      openLabel: string;
    };

const DIRECT_AUDIO_RE = /\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/i;

function isDirectAudioUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("data:audio/")) return true;
  if (DIRECT_AUDIO_RE.test(trimmed)) return true;
  try {
    const path = new URL(trimmed).pathname;
    return DIRECT_AUDIO_RE.test(path);
  } catch {
    return false;
  }
}

export function resolveInAppAudioPlayback(link: AudioLink): InAppAudioPlayback {
  const openUrl = link.url.trim();
  const label = link.name.trim() || "Saved audio";

  if (isYoutubeUrl(openUrl)) {
    const embed = resolveYoutubeEmbed(openUrl);
    if (embed.kind === "embed") {
      return {
        kind: "youtube",
        embedUrl: embed.embedUrl,
        openUrl,
        label,
      };
    }
    return {
      kind: "unsupported",
      openUrl,
      label,
      openLabel: "Open YouTube",
      message:
        embed.reason +
        " Use Open YouTube to listen in a new tab while you keep working here.",
    };
  }

  if (isDirectAudioUrl(openUrl)) {
    return {
      kind: "direct",
      src: openUrl,
      openUrl,
      label,
    };
  }

  const openLabel = /spotify\.com/i.test(openUrl)
    ? "Open Spotify"
    : /soundcloud\.com/i.test(openUrl)
      ? "Open SoundCloud"
      : "Open link";

  return {
    kind: "unsupported",
    openUrl,
    label,
    openLabel,
    message: `${openLabel} in a new tab — this service does not allow in-app playback here. Your companion stays open while you listen.`,
  };
}
