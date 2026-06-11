// Connective layer between the audio library, the Companion's suggestions,
// and the background engine.
//
//  - audioCategoryForEmotion: which audio category fits an emotional state, so
//    the chat can suggest the right sound for what the person needs.
//  - audioBackgroundMood: which background "mood" a music type maps to, so the
//    backdrop can change organically with the audio (consumed by the
//    background engine once it lands).
//  - suggestAudioForEmotion: one-call API the Companion uses to recommend a
//    category + a concrete track.

import type { EmotionalState } from "./companionEmotions";
import {
  categoryDisplayName,
  getRecommendedTrack,
  type AudioLink,
} from "./audioPlaylists";

/** Background moods map onto the background engine's page pools. */
export type AudioBackgroundMood = "focus" | "today" | "progress" | "recovery";

/** Emotional state → best-fit audio category id. */
export const AUDIO_CATEGORY_FOR_EMOTION: Record<EmotionalState, string> = {
  focused: "deep-work",
  building: "deep-work",
  stuck: "motivation-boost",
  unclear: "morning-focus",
  overwhelmed: "calm-brain",
  emotional: "calm-brain",
};

/** Audio category id → background mood, so the backdrop tracks the music type. */
export const AUDIO_BACKGROUND_MOOD: Record<string, AudioBackgroundMood> = {
  "deep-work": "focus",
  "morning-focus": "today",
  "motivation-boost": "progress",
  "calm-brain": "recovery",
  "sleep-sounds": "recovery",
};

/** Short, warm reason shown when the Companion suggests a category. */
export const AUDIO_SUGGESTION_REASON: Record<EmotionalState, string> = {
  focused: "to settle into deep work",
  building: "to keep the ideas flowing",
  stuck: "to get a little momentum going",
  unclear: "to ease in gently",
  overwhelmed: "to quiet the noise",
  emotional: "to feel a bit more grounded",
};

export type AudioSuggestion = {
  categoryId: string;
  categoryName: string;
  reason: string;
  track: AudioLink | null;
  mood: AudioBackgroundMood;
};

export function audioCategoryForEmotion(emotion: EmotionalState): string {
  return AUDIO_CATEGORY_FOR_EMOTION[emotion] ?? "deep-work";
}

export function audioBackgroundMood(categoryId: string): AudioBackgroundMood {
  return AUDIO_BACKGROUND_MOOD[categoryId] ?? "focus";
}

/**
 * Detects when a chat message is really asking for music/audio, and which
 * category fits. Used to route the conversation straight to Focus Audio.
 */
export function detectAudioRequest(text: string): {
  isAudio: boolean;
  categoryId: string;
} {
  const t = text.toLowerCase();
  const isAudio =
    /\b(music|audio|sound|sounds|soundtrack|playlist|lo-?fi|lofi|noise|song|songs|tunes|listen|beats|ambien|something to (listen|play))\b/.test(
      t,
    );

  let categoryId = "deep-work";
  if (/\b(energi|energy|pump|hype|motivat|wake|moving|upbeat|boost|get going)\b/.test(t)) {
    categoryId = "motivation-boost";
  } else if (
    /\b(calm|relax|soothe|anxious|overwhelm|stress|unwind|chill|ground|settle)\b/.test(t)
  ) {
    categoryId = "calm-brain";
  } else if (/\b(sleep|rest|wind down|bedtime|nap|drift)\b/.test(t)) {
    categoryId = "sleep-sounds";
  } else if (/\b(morning|start the day)\b/.test(t)) {
    categoryId = "morning-focus";
  } else if (/\b(focus|concentrat|deep work|study|productiv)\b/.test(t)) {
    categoryId = "deep-work";
  }

  return { isAudio, categoryId };
}

/** Warm one-liner the Companion says when offering to open Focus Audio. */
export function audioSuggestionLine(categoryId: string): string {
  const name = categoryDisplayName(categoryId);
  const rec = getRecommendedTrack(categoryId);
  const tail = rec ? ` I'd cue up ${rec.name} to start.` : "";
  return `Sounds like ${name} is what you need.${tail} Want me to take you to Focus Audio?`;
}

/** The Companion calls this to recommend audio based on how the person feels. */
export function suggestAudioForEmotion(emotion: EmotionalState): AudioSuggestion {
  const categoryId = audioCategoryForEmotion(emotion);
  return {
    categoryId,
    categoryName: categoryDisplayName(categoryId),
    reason: AUDIO_SUGGESTION_REASON[emotion] ?? "to help you settle in",
    track: getRecommendedTrack(categoryId),
    mood: audioBackgroundMood(categoryId),
  };
}
