import {
  WELCOME_ROOM_AMBIENCE_FADE_MS,
  WELCOME_ROOM_AMBIENCE_DUCK_VOLUME,
  WELCOME_ROOM_AMBIENCE_PAUSE_VOLUME,
  WELCOME_ROOM_AMBIENCE_RESTORE_MS,
  WELCOME_ROOM_AMBIENCE_SRC,
  WELCOME_ROOM_AMBIENCE_VOLUME,
} from "@/lib/welcomeRoom/ambience";
import {
  WELCOME_ROOM_GREETING_SPEECH,
  welcomeRoomWelcomeBodySpeechText,
} from "@/lib/welcomeRoom/content";
import {
  WELCOME_ROOM_PLAY_MUSIC_START_MS,
  WELCOME_ROOM_PLAY_VOICE_START_MS,
  WELCOME_ROOM_SILENCE_MS,
} from "@/lib/welcomeRoom/arrival";
import { WELCOME_ROOM_VOICE_PLAYBACK_RATE } from "@/lib/welcomeRoom/voice";
import {
  WELCOME_ROOM_GREETING_AUDIO_SRC,
  WELCOME_ROOM_FULL_WELCOME_AUDIO_SRC,
  WELCOME_ROOM_WELCOME_AUDIO_PARTS,
} from "./welcomeVoiceCache";
import type { WelcomeAudioProfile } from "./types";

/** Welcome Room — Shari's personal welcome + Songer sunroom ambience. */
export const WELCOME_ROOM_AUDIO_PROFILE: WelcomeAudioProfile = {
  id: "welcome-room",
  timeline: {
    silenceMs: WELCOME_ROOM_SILENCE_MS,
    musicStartMs: WELCOME_ROOM_PLAY_MUSIC_START_MS,
    voiceStartMs: WELCOME_ROOM_PLAY_VOICE_START_MS,
  },
  ambience: {
    id: "welcome-room-ambience",
    src: WELCOME_ROOM_AMBIENCE_SRC,
    volume: WELCOME_ROOM_AMBIENCE_VOLUME,
    duckVolume: WELCOME_ROOM_AMBIENCE_DUCK_VOLUME,
    pauseVolume: WELCOME_ROOM_AMBIENCE_PAUSE_VOLUME,
    fadeInMs: WELCOME_ROOM_AMBIENCE_FADE_MS,
    fadeOutMs: WELCOME_ROOM_AMBIENCE_FADE_MS,
    restoreMs: WELCOME_ROOM_AMBIENCE_RESTORE_MS,
    loop: true,
  },
  voice: {
    id: "welcome-room-personal-welcome",
    greetingText: WELCOME_ROOM_GREETING_SPEECH,
    greetingSrc: WELCOME_ROOM_GREETING_AUDIO_SRC,
    bodyText: welcomeRoomWelcomeBodySpeechText(),
    cachedBodySrcs: WELCOME_ROOM_WELCOME_AUDIO_PARTS,
    fullWelcomeSrc: WELCOME_ROOM_FULL_WELCOME_AUDIO_SRC,
    playbackRate: WELCOME_ROOM_VOICE_PLAYBACK_RATE,
  },
};

const PROFILE_REGISTRY: Record<string, WelcomeAudioProfile> = {
  [WELCOME_ROOM_AUDIO_PROFILE.id]: WELCOME_ROOM_AUDIO_PROFILE,
};

export function resolveWelcomeAudioProfile(
  profileId: string,
): WelcomeAudioProfile | null {
  return PROFILE_REGISTRY[profileId] ?? null;
}

export function registerWelcomeAudioProfile(profile: WelcomeAudioProfile): void {
  PROFILE_REGISTRY[profile.id] = profile;
}
