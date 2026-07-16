/**
 * Sensory-friendly notification sounds via Web Audio (no asset required).
 * Respects estate silence, master volume, and per-category None.
 */

import {
  getEstateMasterVolume,
  isEstateSilenced,
} from "@/lib/estate/estateAudioSettings";
import { getRecognitionStore } from "@/lib/recognition/recognitionStore";
import type { CelebrationMode } from "@/lib/recognition/types";
import { getNotificationSoundPrefs } from "./notificationSoundPrefs";
import type {
  NotificationSoundEventKind,
  NotificationSoundOptionId,
} from "./notificationSoundTypes";

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let activeStop: (() => void) | null = null;
let lastPlayKey = "";
let lastPlayAt = 0;

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

export function unlockNotificationSounds(): void {
  ensureCtx();
}

function stopActivePreview(): void {
  if (activeStop) {
    try {
      activeStop();
    } catch {
      /* noop */
    }
    activeStop = null;
  }
}

function effectiveVolume(notificationVolume: number): number {
  if (isEstateSilenced()) return 0;
  const estate = getEstateMasterVolume();
  return Math.min(1, Math.max(0, estate * notificationVolume));
}

function scheduleGain(
  g: GainNode,
  t: number,
  peak: number,
  attack: number,
  decay: number,
): void {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0005, peak), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
}

function playToneSequence(
  notes: { f: number; t: number; peak: number; decay: number; type?: OscillatorType }[],
  masterGain: number,
): void {
  const audio = ensureCtx();
  if (!audio || masterGain <= 0.001) return;
  stopActivePreview();

  const master = audio.createGain();
  master.gain.value = masterGain;
  const lp = audio.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 6200;
  master.connect(lp);
  lp.connect(audio.destination);

  const start = audio.currentTime + 0.01;
  const oscillators: OscillatorNode[] = [];

  for (const note of notes) {
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = note.type ?? "sine";
    osc.frequency.value = note.f;
    osc.connect(g);
    g.connect(master);
    const t = start + note.t;
    scheduleGain(g, t, note.peak, 0.015, note.decay);
    osc.start(t);
    osc.stop(t + note.decay + 0.05);
    oscillators.push(osc);
  }

  activeStop = () => {
    for (const osc of oscillators) {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
    }
  };

  const longest =
    notes.reduce((max, n) => Math.max(max, n.t + n.decay), 0) * 1000 + 80;
  window.setTimeout(() => {
    if (activeStop) activeStop = null;
  }, longest);
}

function synthesize(
  optionId: NotificationSoundOptionId,
  masterGain: number,
): void {
  switch (optionId) {
    case "soft-bell":
      playToneSequence(
        [{ f: 784, t: 0, peak: 0.28, decay: 1.1 }],
        masterGain,
      );
      return;
    case "clear-chime":
      playToneSequence(
        [
          { f: 659.25, t: 0, peak: 0.26, decay: 0.7 },
          { f: 987.77, t: 0.14, peak: 0.22, decay: 0.85 },
        ],
        masterGain,
      );
      return;
    case "piano-note":
      playToneSequence(
        [{ f: 523.25, t: 0, peak: 0.3, decay: 0.9, type: "triangle" }],
        masterGain,
      );
      return;
    case "nature-tone":
      playToneSequence(
        [
          { f: 349.23, t: 0, peak: 0.22, decay: 1.2, type: "triangle" },
          { f: 440, t: 0.18, peak: 0.14, decay: 1.0, type: "sine" },
        ],
        masterGain,
      );
      return;
    case "wind-chime":
      playToneSequence(
        [
          { f: 523.25, t: 0, peak: 0.18, decay: 1.4 },
          { f: 659.25, t: 0.2, peak: 0.16, decay: 1.3 },
          { f: 783.99, t: 0.45, peak: 0.14, decay: 1.5 },
          { f: 1046.5, t: 0.7, peak: 0.1, decay: 1.2 },
        ],
        masterGain * 0.9,
      );
      return;
    case "soft-wood":
      playToneSequence(
        [{ f: 220, t: 0, peak: 0.2, decay: 0.35, type: "triangle" }],
        masterGain,
      );
      return;
    case "gentle-bell":
      playToneSequence(
        [
          { f: 698.46, t: 0, peak: 0.22, decay: 0.9 },
          { f: 880, t: 0.16, peak: 0.18, decay: 1.0 },
        ],
        masterGain,
      );
      return;
    case "priority-soft":
      playToneSequence(
        [
          { f: 740, t: 0, peak: 0.26, decay: 0.55 },
          { f: 880, t: 0.2, peak: 0.2, decay: 0.7 },
        ],
        masterGain,
      );
      return;
    case "priority-medium":
      playToneSequence(
        [
          { f: 784, t: 0, peak: 0.3, decay: 0.5 },
          { f: 988, t: 0.18, peak: 0.26, decay: 0.65 },
        ],
        masterGain,
      );
      return;
    case "priority-distinct":
      playToneSequence(
        [
          { f: 659.25, t: 0, peak: 0.32, decay: 0.45 },
          { f: 880, t: 0.16, peak: 0.28, decay: 0.55 },
          { f: 1174.66, t: 0.34, peak: 0.22, decay: 0.7 },
        ],
        masterGain,
      );
      return;
    case "soft-tone":
      playToneSequence(
        [{ f: 587.33, t: 0, peak: 0.14, decay: 0.8 }],
        masterGain * 0.75,
      );
      return;
    case "soft-alert":
      playToneSequence(
        [
          { f: 493.88, t: 0, peak: 0.24, decay: 0.4, type: "triangle" },
          { f: 587.33, t: 0.22, peak: 0.2, decay: 0.55 },
        ],
        masterGain,
      );
      return;
    case "distinct-chime":
      playToneSequence(
        [
          { f: 622.25, t: 0, peak: 0.28, decay: 0.5 },
          { f: 466.16, t: 0.2, peak: 0.24, decay: 0.7 },
        ],
        masterGain,
      );
      return;
    case "celebration-sparkle":
      playToneSequence(
        [
          { f: 1046.5, t: 0, peak: 0.16, decay: 0.4 },
          { f: 1318.5, t: 0.1, peak: 0.14, decay: 0.45 },
          { f: 1568, t: 0.2, peak: 0.12, decay: 0.5 },
        ],
        masterGain * 0.85,
      );
      return;
    case "celebration-flourish":
      playToneSequence(
        [
          { f: 523.25, t: 0, peak: 0.2, decay: 0.5, type: "triangle" },
          { f: 659.25, t: 0.12, peak: 0.2, decay: 0.55, type: "triangle" },
          { f: 783.99, t: 0.24, peak: 0.18, decay: 0.6 },
          { f: 1046.5, t: 0.38, peak: 0.16, decay: 0.75 },
        ],
        masterGain,
      );
      return;
    case "celebration-big":
      playToneSequence(
        [
          { f: 392, t: 0, peak: 0.22, decay: 0.55, type: "triangle" },
          { f: 523.25, t: 0.12, peak: 0.24, decay: 0.6 },
          { f: 659.25, t: 0.24, peak: 0.22, decay: 0.65 },
          { f: 783.99, t: 0.38, peak: 0.2, decay: 0.75 },
          { f: 1046.5, t: 0.52, peak: 0.18, decay: 0.9 },
        ],
        masterGain,
      );
      return;
    default:
      return;
  }
}

function celebrationOptionForMode(
  mode: CelebrationMode,
): NotificationSoundOptionId | null {
  if (mode === "off") return null;
  if (mode === "simple") return "celebration-sparkle";
  return "celebration-flourish";
}

export type PlayNotificationSoundOptions = {
  /** Preview ignores dedupe and does not require an event. */
  preview?: boolean;
  /** Override volume 0–1 for preview. */
  volumeOverride?: number;
  /** Deduplicate key (defaults to option id). */
  dedupeKey?: string;
};

/**
 * Play a catalog sound. Never throws. Never blocks UI.
 * Preview stops any previous preview first.
 */
export function playNotificationSoundOption(
  optionId: NotificationSoundOptionId | null,
  options: PlayNotificationSoundOptions = {},
): boolean {
  if (!optionId) return false;
  const prefs = getNotificationSoundPrefs();
  const volume = effectiveVolume(
    options.volumeOverride ?? prefs.masterNotificationVolume,
  );
  if (volume <= 0.001) return false;

  if (!options.preview) {
    const key = options.dedupeKey ?? optionId;
    const now = Date.now();
    if (key === lastPlayKey && now - lastPlayAt < 1200) return false;
    lastPlayKey = key;
    lastPlayAt = now;
  }

  try {
    synthesize(optionId, volume * 0.45);
    return true;
  } catch {
    return false;
  }
}

export function resolveSoundOptionForEvent(
  kind: NotificationSoundEventKind,
): NotificationSoundOptionId | null {
  const prefs = getNotificationSoundPrefs();
  switch (kind) {
    case "reminder":
    case "time-block":
      return prefs.reminderSoundId;
    case "rhythm":
      return prefs.rhythmSoundId;
    case "priority-alert":
      return prefs.priorityAlertSoundId;
    case "shari-check-in":
      return prefs.shariCheckInSoundId;
    case "attention-needed":
      if (!prefs.attentionNeededEnabled) return null;
      return prefs.attentionNeededSoundId;
    case "celebration": {
      const mode = getRecognitionStore().celebrationMode;
      return celebrationOptionForMode(mode);
    }
    case "test":
      return prefs.reminderSoundId ?? "soft-bell";
    default:
      return null;
  }
}

/** Play the sound for a routed notification event. */
export function playNotificationSoundForEvent(
  kind: NotificationSoundEventKind,
  dedupeKey?: string,
): boolean {
  const optionId = resolveSoundOptionForEvent(kind);
  return playNotificationSoundOption(optionId, {
    dedupeKey: dedupeKey ?? `${kind}:${optionId ?? "none"}`,
  });
}

export function stopNotificationSoundPreview(): void {
  stopActivePreview();
}
