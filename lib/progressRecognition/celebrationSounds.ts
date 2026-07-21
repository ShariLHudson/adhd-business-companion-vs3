/**
 * 101 — Optional celebration sounds. Never auto-play by default.
 */

import {
  getRecognitionPreferences,
  mayAutoPlayCelebrationSound,
} from "./preferences";

export type CelebrationSoundId =
  | "none"
  | "gentle_chime"
  | "warm_applause"
  | "spark_celebration"
  | "use_default";

export type CelebrationSoundChoice = {
  id: CelebrationSoundId;
  label: string;
  description: string;
};

export const CELEBRATION_SOUND_CHOICES: readonly CelebrationSoundChoice[] = [
  {
    id: "none",
    label: "No sound",
    description: "Celebrate quietly — no audio.",
  },
  {
    id: "gentle_chime",
    label: "Gentle chime",
    description: "A soft, brief chime.",
  },
  {
    id: "warm_applause",
    label: "Warm applause",
    description: "Soft applause — never startling.",
  },
  {
    id: "spark_celebration",
    label: "Spark celebration",
    description: "A warm estate tone.",
  },
  {
    id: "use_default",
    label: "Use my default",
    description: "Follow your saved intensity preference.",
  },
] as const;

export type CelebrationSoundDecision = {
  willPlay: boolean;
  soundId: CelebrationSoundId;
  reason: string;
};

/**
 * Resolve whether a sound may play. Default: never auto-play.
 * Preview requires explicit member choice.
 */
export function resolveCelebrationSound(input: {
  chosenId: CelebrationSoundId;
  /** True only when member explicitly previews or confirms play. */
  memberRequestedPlay: boolean;
  focusMode?: boolean;
  meetingMode?: boolean;
}): CelebrationSoundDecision {
  const prefs = getRecognitionPreferences();
  if (input.chosenId === "none") {
    return {
      willPlay: false,
      soundId: "none",
      reason: "Member chose no sound.",
    };
  }
  if (!input.memberRequestedPlay) {
    return {
      willPlay: false,
      soundId: input.chosenId,
      reason: "Sounds never play automatically.",
    };
  }
  // Defaults never auto-play; mayAutoPlay is always false today.
  void mayAutoPlayCelebrationSound(prefs);
  if (prefs.quietHoursEnabled || input.focusMode || input.meetingMode) {
    return {
      willPlay: false,
      soundId: input.chosenId,
      reason: "Quiet context — sound suppressed.",
    };
  }
  if (!prefs.offerCelebrationSounds) {
    return {
      willPlay: false,
      soundId: "none",
      reason: "Celebration sounds are turned off in preferences.",
    };
  }
  return {
    willPlay: true,
    soundId:
      input.chosenId === "use_default" ? "gentle_chime" : input.chosenId,
    reason: "Member requested play.",
  };
}

/**
 * Soft Web Audio preview — never blocks navigation.
 * No-op when AudioContext unavailable or willPlay is false.
 */
export function previewCelebrationSound(
  decision: CelebrationSoundDecision,
): void {
  if (!decision.willPlay || decision.soundId === "none") return;
  if (typeof window === "undefined") return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value =
      decision.soundId === "warm_applause" ? 392 : 523.25;
    gain.gain.value = 0.04;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.stop(ctx.currentTime + 0.4);
    void ctx.close();
  } catch {
    /* sensory-safe: fail silent */
  }
}
