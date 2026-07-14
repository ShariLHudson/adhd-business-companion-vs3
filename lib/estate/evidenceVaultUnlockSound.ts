/**
 * Soft metallic unlock click — Web Audio, no new audio system.
 * Respects Estate silence / master volume. Fails silent.
 */

import {
  getEstateMasterVolume,
  isEstateSilenced,
} from "@/lib/estate/estateAudioSettings";

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function estateSfxAllowed(): boolean {
  if (isEstateSilenced()) return false;
  return getEstateMasterVolume() > 0.01;
}

/** Soft key-in-lock metallic click + tiny glint tick. */
export function playEvidenceVaultUnlockSound(): void {
  if (!estateSfxAllowed()) return;
  const audio = ensureCtx();
  if (!audio) return;
  try {
    const start = audio.currentTime + 0.01;
    const master = audio.createGain();
    const volume = Math.min(0.22, 0.18 * getEstateMasterVolume());
    master.gain.value = volume;
    master.connect(audio.destination);

    // Soft metal engage
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, start);
    osc.frequency.exponentialRampToValueAtTime(180, start + 0.12);
    osc.connect(g);
    g.connect(master);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.55, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
    osc.start(start);
    osc.stop(start + 0.22);

    // Quiet tumbler tick
    const tick = audio.createOscillator();
    const tg = audio.createGain();
    tick.type = "sine";
    tick.frequency.setValueAtTime(880, start + 0.14);
    tick.frequency.exponentialRampToValueAtTime(640, start + 0.22);
    tick.connect(tg);
    tg.connect(master);
    tg.gain.setValueAtTime(0.0001, start + 0.14);
    tg.gain.exponentialRampToValueAtTime(0.28, start + 0.15);
    tg.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
    tick.start(start + 0.14);
    tick.stop(start + 0.3);
  } catch {
    /* audio unavailable */
  }
}
