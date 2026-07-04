/**
 * Cached Welcome Room voice — instant playback without live TTS per visit.
 * Generate once: `node scripts/generate-welcome-voice-cache.mjs`
 */

import { estateAudioPath } from "@/lib/estate/estatePlaceMedia";

export const WELCOME_ROOM_GREETING_AUDIO_SRC =
  "/audio/welcome-room/welcome-greeting.mp3" as const;

/** Numbered parts after the opening greeting — full letter body. */
export const WELCOME_ROOM_WELCOME_AUDIO_PARTS = [
  "/audio/welcome-room/welcome-part-01.mp3",
  "/audio/welcome-room/welcome-part-02.mp3",
] as const;

/** Pre-rendered full welcome letter (greeting + body) — no live ElevenLabs per visit. */
export const WELCOME_ROOM_FULL_WELCOME_AUDIO_SRC =
  "/audio/welcome-room/welcome-letter-full.mp3" as const;

/** Post-login Welcome Home narration (`public/audio/Welcome to the Spark Estates.m4a`). */
export const WELCOME_HOME_WELCOME_AUDIO_FILENAME =
  "Welcome to the Spark Estates.m4a" as const;

export const WELCOME_HOME_FOUNDER_AUDIO_SRC = estateAudioPath(
  WELCOME_HOME_WELCOME_AUDIO_FILENAME,
);

export type CachedSpeechClip = {
  audio: HTMLAudioElement;
  src: string;
};

export function probeCachedAudioSrc(
  src: string,
  timeoutMs = 5000,
): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  return new Promise((resolve) => {
    const audio = new Audio();
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      audio.removeEventListener("loadeddata", onReady);
      audio.removeEventListener("canplaythrough", onReady);
      audio.removeEventListener("error", onError);
      audio.src = "";
      resolve(ok);
    };
    const onReady = () => finish(true);
    const onError = () => finish(false);
    const timer = setTimeout(() => finish(false), timeoutMs);
    audio.addEventListener("loadeddata", onReady, { once: true });
    audio.addEventListener("canplaythrough", onReady, { once: true });
    audio.addEventListener("error", onError, { once: true });
    audio.preload = "auto";
    audio.src = src;
    audio.load();
  });
}

export async function loadCachedSpeechClip(
  src: string,
): Promise<CachedSpeechClip | null> {
  if (typeof window === "undefined") return null;
  const audio = new Audio(src);
  audio.preload = "auto";

  const ready = await new Promise<boolean>((resolve) => {
    if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      resolve(true);
      return;
    }
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("loadeddata", onReady);
      audio.removeEventListener("error", onError);
      resolve(ok);
    };
    const onReady = () => finish(true);
    const onError = () => finish(false);
    const timer = setTimeout(() => finish(false), 8000);
    audio.addEventListener("canplay", onReady, { once: true });
    audio.addEventListener("loadeddata", onReady, { once: true });
    audio.addEventListener("error", onError, { once: true });
    audio.load();
  });

  if (!ready) return null;
  return { audio, src };
}

export async function resolveWelcomeVoiceSources(
  greetingSrc: string,
  partSrcs: readonly string[],
): Promise<{ greeting: CachedSpeechClip | null; parts: CachedSpeechClip[] }> {
  const [greeting, ...partResults] = await Promise.all([
    loadCachedSpeechClip(greetingSrc),
    ...partSrcs.map((src) => loadCachedSpeechClip(src)),
  ]);
  return {
    greeting,
    parts: partResults.filter((p): p is CachedSpeechClip => p !== null),
  };
}
