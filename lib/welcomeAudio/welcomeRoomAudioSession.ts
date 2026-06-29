import { prefersReducedMotion } from "@/lib/welcomeRoom/arrival";
import { getWelcomeRoomAmbienceEnabled } from "@/lib/welcomeRoom/persistence";
import { unlockBrowserAudioFromClick } from "./audioUnlock";
import { resolveWelcomeAudioProfile } from "./profiles";
import { WelcomeAudioManager } from "./WelcomeAudioManager";

let sessionManager: WelcomeAudioManager | null = null;

function ensureWelcomeRoomManager(): WelcomeAudioManager | null {
  const profile = resolveWelcomeAudioProfile("welcome-room");
  if (!profile) return null;
  if (!sessionManager) {
    sessionManager = new WelcomeAudioManager(profile);
    sessionManager.setMusicMuted(!getWelcomeRoomAmbienceEnabled());
    if (!prefersReducedMotion()) {
      sessionManager.beginImmersiveWelcome();
    }
  }
  return sessionManager;
}

/** Call synchronously from the sidebar / menu click — before React opens the room. */
export function primeWelcomeRoomAudioFromGesture(): void {
  unlockBrowserAudioFromClick();
  const manager = ensureWelcomeRoomManager();
  if (!manager) return;
  manager.adoptSessionUnlock();
  void manager.playExperience();
}

/** Panel hook adopts the manager primed by the opening click. */
export function attachWelcomeRoomAudioManager(): WelcomeAudioManager | null {
  return ensureWelcomeRoomManager();
}

export function destroyWelcomeRoomAudioManager(): void {
  sessionManager?.destroy();
  sessionManager = null;
}

export function getWelcomeRoomAudioManager(): WelcomeAudioManager | null {
  return sessionManager;
}
