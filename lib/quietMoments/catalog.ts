import type { HospitalityMotionId } from "@/lib/companionHospitalityPrototype";
import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";
import type { ShariQuietPosture } from "./types";

export type QuietAmbientMoment = {
  id: string;
  description: string;
  motion: HospitalityMotionId;
  /** Designer note — never shown to guest */
  designerNote: string;
};

/** Natural life between messages — nothing asks for attention. */
export const QUIET_AMBIENT_MOMENTS: readonly QuietAmbientMoment[] = [
  {
    id: "qm-morning-sun",
    description: "Morning sunlight slowly brightens the room",
    motion: "sunlight",
    designerNote: "47s drift — guest feels day arriving, not UI loading",
  },
  {
    id: "qm-coffee-steam",
    description: "Steam rises from the coffee mug",
    motion: "steam",
    designerNote: "Irregular rise and fade — Shari's favorite mug, not a loader",
  },
  {
    id: "qm-curtain-breeze",
    description: "Curtain gently moves in the breeze",
    motion: "curtains",
    designerNote: "Barely perceptible sway — open window implied",
  },
  {
    id: "qm-bird-feeder",
    description: "A bird lands at the feeder",
    motion: "cardinal",
    designerNote: "Brief visit once — not orbit, not loop",
  },
  {
    id: "qm-kinsey-stretch",
    description: "Kinsey stretches and finds another sunny spot",
    motion: "sunlight",
    designerNote: "Posture change in scene — no animation gimmick",
  },
  {
    id: "qm-aquarium-bubbles",
    description: "Aquarium bubbles quietly",
    motion: "candle",
    designerNote: "Reading nook peace — slow racing thoughts",
  },
  {
    id: "qm-journal-page",
    description: "A page in an open journal shifts slightly from the breeze",
    motion: "curtains",
    designerNote: "Tied to window-seat journal object",
  },
  {
    id: "qm-clock-hour",
    description: "Grandfather clock quietly marks the hour",
    motion: "lamplight",
    designerNote: "Soft tick implied — ambient audio future, not UI alert",
  },
  {
    id: "qm-cloud-drift",
    description: "Clouds move slowly outside",
    motion: "clouds",
    designerNote: "Sky time passing — almost imagined",
  },
  {
    id: "qm-evening-lamp",
    description: "Room slowly becomes warmer in tone",
    motion: "lamplight",
    designerNote: "Evening lamplight breathe — not dramatic sunset",
  },
  {
    id: "qm-fireplace-flicker",
    description: "Fireplace flickers irregularly",
    motion: "fireplace",
    designerNote: "Autumn/winter only — life not entertainment",
  },
  {
    id: "qm-rain-glass",
    description: "Rain on the window at varied angles",
    motion: "rain",
    designerNote: "Cozy containment — guest safe inside",
  },
] as const;

export function resolveQuietMotions(input: {
  timeOfDay?: WelcomeTimeOfDay;
  season?: WelcomeSeason;
  recoveryGentle?: boolean;
  flooded?: boolean;
}): HospitalityMotionId[] {
  if (input.flooded || input.recoveryGentle) {
    return ["curtains", "lamplight", "candle"];
  }

  const motions = new Set<HospitalityMotionId>([
    "steam",
    "curtains",
    "sunlight",
    "clouds",
  ]);

  if (input.timeOfDay === "evening" || input.timeOfDay === "night") {
    motions.add("lamplight");
    motions.add("candle");
  }
  if (input.timeOfDay === "morning") {
    motions.add("sunlight");
  }
  if (input.season === "winter") {
    motions.add("cardinal");
    motions.add("fireplace");
  }
  if (input.season === "summer") {
    motions.add("foliage");
    motions.add("butterflies");
  }
  if (input.season === "autumn") {
    motions.add("leaves");
    motions.add("fireplace");
  }

  return [...motions];
}

export function resolveShariQuietPosture(input: {
  idleMs: number;
  roomId?: string;
}): ShariQuietPosture {
  if (input.roomId === "window-seat" || input.roomId === "clear-my-mind") {
    return input.idleMs > 120_000 ? "writing" : "window";
  }
  if (input.roomId === "reading-nook") return "reading";
  if (input.roomId === "creative-studio") return "craft";
  if (input.idleMs > 180_000) return "kinsey";
  if (input.idleMs > 60_000) return "relaxed";
  return "window";
}
