/**
 * Audio Experience Foundation — classify natural-language audio intent.
 */

import { classifyAudioPlaybackIntent } from "@/lib/estate/audioPlaybackGuard";

export type AudioIntentKind =
  | "browse_audio"
  | "recommend_audio"
  | "play_audio"
  | "stop_audio"
  | "where_audio"
  | "how_audio"
  | "want_music"
  | null;

const WHERE_AUDIO_RE =
  /\b(?:where can i listen|where do i listen|where is the music|where can i hear)\b/i;

const HOW_AUDIO_RE =
  /\b(?:how do i (?:play|use|listen)|how does (?:focus audio|peaceful places) work)\b/i;

const WANT_MUSIC_RE =
  /\b(?:listen to music|want music|hear music|somewhere with music|play music)\b/i;

const EXPLICIT_PLAY_RE =
  /\b(?:play|start|turn on|put on)\b.{0,30}\b(?:audio|music|soundscape|peaceful places|focus audio|rain|birds?|chatter)\b/i;

export function classifyAudioIntent(
  query: string,
): { kind: AudioIntentKind; matchedPhrase?: string } | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const guarded = classifyAudioPlaybackIntent(trimmed);
  if (guarded.intent === "browse") {
    return { kind: "browse_audio", matchedPhrase: guarded.matchedPhrase };
  }
  if (guarded.intent === "recommend") {
    return { kind: "recommend_audio", matchedPhrase: guarded.matchedPhrase };
  }
  if (guarded.intent === "stop") {
    return { kind: "stop_audio", matchedPhrase: guarded.matchedPhrase };
  }
  if (guarded.intent === "play") {
    return { kind: "play_audio", matchedPhrase: guarded.matchedPhrase };
  }

  const checks: Array<{ kind: AudioIntentKind; pattern: RegExp }> = [
    { kind: "how_audio", pattern: HOW_AUDIO_RE },
    { kind: "where_audio", pattern: WHERE_AUDIO_RE },
    { kind: "want_music", pattern: WANT_MUSIC_RE },
    { kind: "play_audio", pattern: EXPLICIT_PLAY_RE },
  ];

  for (const { kind, pattern } of checks) {
    const match = trimmed.match(pattern);
    if (match) {
      return { kind, matchedPhrase: match[0] };
    }
  }

  return null;
}
