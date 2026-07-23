import {
  ADAPTIVE_COMPANION_SESSION_KEY,
  type AdaptiveSessionOverride,
} from "./types";

const memory: { override: AdaptiveSessionOverride | null } = { override: null };

export function getAdaptiveSessionOverride(): AdaptiveSessionOverride | null {
  if (typeof window === "undefined") return memory.override;
  try {
    const raw = window.sessionStorage.getItem(ADAPTIVE_COMPANION_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdaptiveSessionOverride;
  } catch {
    return null;
  }
}

export function setAdaptiveSessionOverride(
  override: AdaptiveSessionOverride | null,
): void {
  if (typeof window === "undefined") {
    memory.override = override;
    return;
  }
  try {
    if (!override || Object.keys(override).length === 0) {
      window.sessionStorage.removeItem(ADAPTIVE_COMPANION_SESSION_KEY);
    } else {
      window.sessionStorage.setItem(
        ADAPTIVE_COMPANION_SESSION_KEY,
        JSON.stringify(override),
      );
    }
  } catch {
    /* ignore */
  }
}

export function clearAdaptiveSessionOverride(): void {
  setAdaptiveSessionOverride(null);
}

export function __resetAdaptiveSessionOverrideForTests(): void {
  memory.override = null;
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ADAPTIVE_COMPANION_SESSION_KEY);
}
