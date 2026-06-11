import type { EmotionalState } from "./companionEmotions";
import type { CoachingMode } from "./companionPrompt";

/** One system posture at a time — drives UI theme and hierarchy. */
export type SystemMode = "calm" | "focus" | "reset" | "create" | "reflect";

export const SYSTEM_MODE_LABELS: Record<SystemMode, string> = {
  calm: "Calm",
  focus: "Focus",
  reset: "Reset",
  create: "Create",
  reflect: "Reflect",
};

export function emotionalToSystemMode(
  emotion: EmotionalState,
  coachingMode: CoachingMode,
): SystemMode {
  switch (emotion) {
    case "overwhelmed":
    case "emotional":
      return "calm";
    case "focused":
      return "focus";
    case "stuck":
      return "reset";
    case "building":
      return "create";
    case "unclear":
      return coachingMode === "progress" ? "reflect" : "calm";
    default:
      return "calm";
  }
}
