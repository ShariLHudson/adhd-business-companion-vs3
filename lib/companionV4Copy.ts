import type { EmotionalState } from "./companionEmotions";
import type { RoutingResult } from "./companionRouting";

export const V4_NEXT_STEP: Record<
  EmotionalState,
  { title: string; accent: string }
> = {
  overwhelmed: { title: "Clear your mind", accent: "Brain Dump" },
  stuck: { title: "Let's figure out the next step", accent: "One small move" },
  focused: { title: "Start 25-min Focus Session", accent: "Pomodoro Timer" },
  building: { title: "Open your Business Playbook", accent: "Create & structure" },
  unclear: { title: "Talk it through with me", accent: "We'll find the path" },
  emotional: { title: "Ground first", accent: "Breathe" },
};

export function getInputHint(
  emotion: EmotionalState,
  routing: RoutingResult,
): string | null {
  if (routing.fallback) {
    return `${routing.fallback.label} instead?`;
  }
  const hints: Partial<Record<EmotionalState, string>> = {
    stuck: "Want help breaking this down?",
    overwhelmed: "Need a fresh start?",
    building: "Not sure where to begin writing?",
    unclear: "What's on your mind right now?",
  };
  return hints[emotion] ?? null;
}
