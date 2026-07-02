const REPLAY_SESSION_KEY = "companion-welcome-home-replay";
export const WELCOME_HOME_REPLAY_EVENT = "companion-welcome-home-replay";

export function requestWelcomeHomeReplay(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(REPLAY_SESSION_KEY, "1");
    window.dispatchEvent(new CustomEvent(WELCOME_HOME_REPLAY_EVENT));
  } catch {
    /* ignore */
  }
}

export function peekWelcomeHomeReplayRequested(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(REPLAY_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearWelcomeHomeReplayRequest(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(REPLAY_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
