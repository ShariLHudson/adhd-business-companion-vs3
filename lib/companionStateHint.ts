import type { EmotionalState } from "./companionEmotions";

/** One subtle UI hint per state — not a button, not a card. */
export const STATE_UI_HINT: Record<EmotionalState, string | null> = {
  stuck: "When you're ready, Clear My Mind can help unload what's stuck.",
  overwhelmed: "Chat Workspace → New Chat can help slow everything down.",
  focused: "Pomodoro is here when you want a focus block.",
  unclear: null,
  building: null,
  emotional: "Breathe can help you ground for a moment.",
};

export function getStateHint(state: EmotionalState): string | null {
  return STATE_UI_HINT[state];
}

export const EMOTION_SHELL_CLASS: Record<EmotionalState, string> = {
  stuck: "emotion-stuck",
  overwhelmed: "emotion-calm",
  unclear: "emotion-neutral",
  focused: "emotion-focus",
  building: "emotion-neutral",
  emotional: "emotion-reflect",
};
