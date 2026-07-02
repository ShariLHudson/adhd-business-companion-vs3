/**
 * Browser autoplay unlock — play() must run synchronously inside the click handler.
 */

const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==" as const;

const SESSION_UNLOCKED_KEY = "spark-welcome-audio-session-unlocked";

let sessionUnlocked = false;

function readUnlockedFromStorage(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_UNLOCKED_KEY) === "1";
  } catch {
    return false;
  }
}

function writeUnlockedToStorage(unlocked: boolean): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (unlocked) {
      sessionStorage.setItem(SESSION_UNLOCKED_KEY, "1");
    } else {
      sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
    }
  } catch {
    /* quota */
  }
}

if (typeof window !== "undefined") {
  sessionUnlocked = readUnlockedFromStorage();
}

export function isWelcomeAudioSessionUnlocked(): boolean {
  return sessionUnlocked || readUnlockedFromStorage();
}

export function isAutoplayBlockedError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String(error.name) : "";
  return name === "NotAllowedError";
}

/** play() interrupted by pause, load(), or a newer play() — safe to ignore. */
export function isInterruptedPlayError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String(error.name) : "";
  if (name === "AbortError") return true;
  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : "";
  return message.includes("interrupted by a new load request");
}

export function isBenignAudioPlayError(error: unknown): boolean {
  return isAutoplayBlockedError(error) || isInterruptedPlayError(error);
}

function markSessionUnlocked(): void {
  sessionUnlocked = true;
  writeUnlockedToStorage(true);
}

/** Call synchronously from onClick / onPointerDown — not from useEffect. */
export function unlockBrowserAudioFromClick(): boolean {
  if (typeof window === "undefined") return false;
  if (isWelcomeAudioSessionUnlocked()) return true;

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
    markSessionUnlocked();
    return true;
  } catch {
    return false;
  }
}

export async function unlockBrowserAudio(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (isWelcomeAudioSessionUnlocked()) return true;
  unlockBrowserAudioFromClick();
  if (isWelcomeAudioSessionUnlocked()) return true;

  try {
    const ctx = new AudioContext();
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    await ctx.resume();
    await ctx.close();
    markSessionUnlocked();
    return true;
  } catch {
    return false;
  }
}
