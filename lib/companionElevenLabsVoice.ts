/**
 * Shari's ElevenLabs voice — single source for TTS and Welcome Room cache generation.
 *
 * Set ELEVENLABS_VOICE_ID in .env.local to your cloned Shari voice from ElevenLabs.
 * Without it, the app falls back to a generic stock voice (not Shari).
 */

/** Generic ElevenLabs default — warm but not Shari. */
export const ELEVENLABS_FALLBACK_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export function resolveElevenLabsVoiceId(): string {
  const configured = process.env.ELEVENLABS_VOICE_ID?.trim();
  if (configured) return configured;
  return ELEVENLABS_FALLBACK_VOICE_ID;
}

export function isShariVoiceConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_VOICE_ID?.trim());
}

export const ELEVENLABS_TTS_MODEL = "eleven_turbo_v2_5" as const;

export const ELEVENLABS_VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
} as const;
