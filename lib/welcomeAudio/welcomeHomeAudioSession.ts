import { prefersReducedMotion } from "@/lib/welcomeRoom/arrival";
import { markWelcomeRoomOpenedWithGesture } from "@/lib/welcomeRoom/welcomeRoomGesture";
import { getWelcomeRoomAmbienceEnabled } from "@/lib/welcomeRoom/persistence";
import { unlockBrowserAudioFromClick } from "./audioUnlock";
import { resolveWelcomeAudioProfile } from "./profiles";
import { WelcomeAudioManager } from "./WelcomeAudioManager";

let sessionManager: WelcomeAudioManager | null = null;

function ensureWelcomeHomeManager(): WelcomeAudioManager | null {
  const profile = resolveWelcomeAudioProfile("welcome-home");
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

/** Unlock audio from login click — playback waits until Welcome Home is on screen. */
export function primeWelcomeHomeAudioFromGesture(): void {
  unlockBrowserAudioFromClick();
  markWelcomeRoomOpenedWithGesture();
  const manager = ensureWelcomeHomeManager();
  if (!manager) return;
  manager.adoptSessionUnlock();
}

/** Welcome Home panel adopts the manager primed by the opening click. */
export function attachWelcomeHomeAudioManager(): WelcomeAudioManager | null {
  return ensureWelcomeHomeManager();
}

export function destroyWelcomeHomeAudioManager(): void {
  sessionManager?.destroy();
  sessionManager = null;
}

export function getWelcomeHomeAudioManager(): WelcomeAudioManager | null {
  return sessionManager;
}
