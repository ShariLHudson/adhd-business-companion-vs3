/**
 * Shared ElevenLabs TTS client — same `/api/tts` route as the main Companion voice.
 */

const TTS_ENDPOINT = "/api/tts" as const;

/** API route trims at 2500 — keep chunks under that. */
export const COMPANION_TTS_MAX_CHARS = 2400 as const;

export async function fetchCompanionSpeechBlob(text: string): Promise<Blob | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    const res = await fetch(TTS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
    });
    if (!res.ok) return null;
    return res.blob();
  } catch {
    return null;
  }
}

export function createSpeechAudio(blob: Blob): {
  audio: HTMLAudioElement;
  revoke: () => void;
} {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  return {
    audio,
    revoke: () => URL.revokeObjectURL(url),
  };
}
