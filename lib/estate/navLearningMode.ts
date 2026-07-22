/**
 * Prompt 144 — optional learning mode for navigation subtitles.
 * Default on so first-time members see intention hints; can be turned off.
 */

const STORAGE_KEY = "companion-nav-learning-mode-v1";

function hasStorage(): boolean {
  return (
    typeof globalThis.window !== "undefined" &&
    typeof globalThis.localStorage !== "undefined"
  );
}

/** Learning mode defaults to on until the member turns it off. */
export function isNavLearningModeEnabled(): boolean {
  if (!hasStorage()) return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return true;
    return raw === "1" || raw === "true";
  } catch {
    return true;
  }
}

export function setNavLearningModeEnabled(enabled: boolean): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    window.dispatchEvent(new Event("companion-nav-learning-mode-updated"));
  } catch {
    /* ignore */
  }
}

export function resetNavLearningModeForTests(): void {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
