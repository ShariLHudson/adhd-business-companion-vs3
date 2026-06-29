import { fadeAudioVolumeAsync } from "@/lib/welcomeAudio/fadeVolume";
import { prefersReducedMotion } from "@/lib/welcomeRoom/arrival";
import {
  BEDROOM_WINDOW_AMBIENCE_MP3,
  EAST_TERRACE_AMBIENCE_MP3,
  EVENING_HEARTH_AMBIENCE_MP3,
  HALL_OF_REFLECTIONS_AMBIENCE_MP3,
  TIN_ROOF_RAIN_AMBIENCE_MP3,
} from "@/lib/soundscapes/audioAssets";
import type { EstateSignId } from "./signpostLayout";

/** Hover preview loops — emotional destination before the click. */
export const GARDEN_FLAG_HOVER_AMBIENCE: Record<EstateSignId, string> = {
  focus: EAST_TERRACE_AMBIENCE_MP3,
  calming: TIN_ROOF_RAIN_AMBIENCE_MP3,
  unwind: EVENING_HEARTH_AMBIENCE_MP3,
  energize: BEDROOM_WINDOW_AMBIENCE_MP3,
  "my-places": HALL_OF_REFLECTIONS_AMBIENCE_MP3,
} as const;

const CROSSFADE_MS = 1200;
const FADE_OUT_MS = 900;
const HOVER_VOLUME = 0.14;

type AudioSlot = "a" | "b";

let slotA: HTMLAudioElement | null = null;
let slotB: HTMLAudioElement | null = null;
let activeSlot: AudioSlot | null = null;
let currentId: EstateSignId | null = null;
let fadeToken = 0;

function ensureSlot(slot: AudioSlot): HTMLAudioElement {
  const existing = slot === "a" ? slotA : slotB;
  if (existing) return existing;

  const audio = new Audio();
  audio.loop = true;
  audio.preload = "auto";

  if (slot === "a") {
    slotA = audio;
  } else {
    slotB = audio;
  }
  return audio;
}

function otherSlot(slot: AudioSlot): AudioSlot {
  return slot === "a" ? "b" : "a";
}

function resolveSrc(audio: HTMLAudioElement, src: string): void {
  const resolved = new URL(src, window.location.origin).href;
  if (audio.src !== resolved) {
    audio.src = src;
    audio.currentTime = 0;
  }
}

async function fadeOutSlot(audio: HTMLAudioElement, token: number): Promise<void> {
  await fadeAudioVolumeAsync(audio, 0, FADE_OUT_MS);
  if (token !== fadeToken) return;
  audio.pause();
  audio.currentTime = 0;
}

/** Crossfade into a destination's ambience on flag hover; fade out when hover ends. */
export async function crossfadeGardenFlagAmbience(id: EstateSignId | null): Promise<void> {
  if (typeof window === "undefined") return;
  if (prefersReducedMotion()) {
    if (!id) await stopGardenFlagAmbience();
    return;
  }

  if (id === currentId) return;

  const token = ++fadeToken;
  currentId = id;

  if (!id) {
    const playing = activeSlot ? ensureSlot(activeSlot) : null;
    activeSlot = null;
    if (playing) {
      await fadeOutSlot(playing, token);
    }
    return;
  }

  const src = GARDEN_FLAG_HOVER_AMBIENCE[id];
  const nextSlot: AudioSlot = activeSlot ? otherSlot(activeSlot) : "a";
  const next = ensureSlot(nextSlot);
  const prev = activeSlot ? ensureSlot(activeSlot) : null;

  resolveSrc(next, src);
  next.volume = 0;

  try {
    await next.play();
  } catch {
    return;
  }

  if (token !== fadeToken) return;

  activeSlot = nextSlot;

  await Promise.all([
    fadeAudioVolumeAsync(next, HOVER_VOLUME, CROSSFADE_MS),
    prev && prev !== next ? fadeAudioVolumeAsync(prev, 0, CROSSFADE_MS) : Promise.resolve(),
  ]);

  if (token !== fadeToken) return;

  if (prev && prev !== next) {
    prev.pause();
    prev.currentTime = 0;
  }
}

/** Stop hover ambience when leaving the garden path or entering a destination. */
export async function stopGardenFlagAmbience(): Promise<void> {
  if (typeof window === "undefined") return;
  currentId = null;
  const token = ++fadeToken;
  const playing = activeSlot ? ensureSlot(activeSlot) : null;
  activeSlot = null;
  if (playing) {
    await fadeOutSlot(playing, token);
  }
}
