const STORAGE_KEY = "spark-journal-gazebo-sound-muted";

/**
 * Opt-in ambience — quiet until the member turns sound on.
 * Missing key ⇒ muted (never auto-play on first visit).
 */
export function readJournalGazeboSoundMuted(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === null) return true;
    return value === "1";
  } catch {
    return true;
  }
}

export function writeJournalGazeboSoundMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  } catch {
    /* storage unavailable */
  }
}
