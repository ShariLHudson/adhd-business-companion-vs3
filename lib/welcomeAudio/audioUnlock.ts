/**
 * Browser autoplay unlock — play() must run synchronously inside the click handler.
 */

const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==" as const;

let sessionUnlocked = false;

export function isWelcomeAudioSessionUnlocked(): boolean {
  return sessionUnlocked;
}

export function isAutoplayBlockedError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String(error.name) : "";
  return name === "NotAllowedError";
}

/** Call synchronously from onClick / onPointerDown — not from useEffect. */
export function unlockBrowserAudioFromClick(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionUnlocked) return true;

  try {
    const audio = new Audio(SILENT_WAV);
    audio.volume = 0.001;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      void playPromise
        .then(() => {
          audio.pause();
        })
        .catch(() => {
          /* gesture may still have unlocked the document */
        });
    }
    sessionUnlocked = true;
    return true;
  } catch {
    return false;
  }
}

export async function unlockBrowserAudio(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (sessionUnlocked) return true;
  unlockBrowserAudioFromClick();
  if (sessionUnlocked) return true;

  try {
    const ctx = new AudioContext();
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    await ctx.resume();
    await ctx.close();
    sessionUnlocked = true;
    return true;
  } catch {
    return false;
  }
}
