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
 *
 * Does NOT trigger on rhetorical "sound" (copy/tone: "sounds good", "sound like a tool").
 */
const ENERGIZE_AUDIO_RE =
  /\b(energi[sz]e|energi[sz]ing|pep (?:me )?up|pick me up|need (?:more )?energy|get (?:me )?going|wake me up|uplift(?:ing)?|something to energi[sz]e)\b/;

const CALM_AUDIO_RE =
  /\b(calm(?:ing)?(?:\s+(?:audio|music|sounds?|playlist))?|relax(?:ing)?(?:\s+(?:audio|music|sounds?))?|soothe|soothing|grounding(?:\s+(?:audio|music|sounds?))?|quiet(?:\s+(?:audio|music|sounds?))?|calm my brain|something calm|need (?:something )?calm)\b/i;

const MOTIVATION_AUDIO_RE =
  /\b(motivat(?:e|ing|ion(?:al)?)(?:\s+(?:audio|music|sounds?|playlist))?|motivation boost|pump[- ]?up|pep (?:me )?up|energy boost|hype (?:music|playlist)|get (?:me )?going|something motivat)\b/i;

const SLEEP_AUDIO_RE =
  /\b(sleep(?:\s+(?:audio|music|sounds?))?|wind[- ]?down(?:\s+(?:audio|music|sounds?))?|bedtime (?:sounds?|music)|nap sounds?)\b/i;

const FOCUS_AUDIO_RE =
  /\b(focus audio|focus music|background (?:music|sounds?|audio)|concentration music|deep work (?:music|audio|sounds?)|study (?:music|audio|sounds?))\b/i;

/** Explicit Focus Audio triggers — never bare "sound" / "sounds". */
const EXPLICIT_FOCUS_AUDIO_RE =
  /\b(?:focus (?:audio|music)|(?:brown|white|pink) noise|rain sounds?|calming sounds?|background (?:sound|music|audio)|play (?:music|audio|brown|white|rain|something)|open (?:focus )?(?:audio|music)|help me focus with (?:sound|music|audio)|(?:i )?need (?:audio|music) to focus|music to focus|open music)\b/i;

const MUSIC_MEDIA_RE =
  /\b(music|audio|playlist|lo-?fi|lofi|soundtrack|song|songs|tunes|beats)\b/i;

const LISTEN_FOR_AUDIO_RE =
  /\b(?:something to listen to|listen to (?:music|something|calm|rain))\b/i;

/** Copy/tone "sound" — not a Focus Audio request. */
export function isRhetoricalSoundUsage(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (
    /\b(?:that|this|it)\s+sounds?\b/i.test(t) ||
    /\bsounds?\s+(?:good|bad|wrong|right|like|too|warm|warmer|cold|corporate|chatgpt|better|off|weird|great|fine|okay|ok|perfect|terrible|robotic|generic|salesy|stiff)\b/i.test(t) ||
    /\b(?:make|making|want(?:ed)?|don't|do not|should|shouldn't|need|needs)\b[^.!?]{0,60}\b(?:to\s+)?sound\b/i.test(t) ||
    /\bdoes\s+this\s+sound\b/i.test(t) ||
    /\bto\s+sound\s+like\b/i.test(t) ||
    /\bsound\s+like\s+(?:a\s+)?(?:tool|planner|ecosystem|chatgpt|robot|corporate)\b/i.test(t)
  ) {
    return true;
  }
  return false;
}

export function resolveFocusAudioCategory(text: string): string {
  const t = text.toLowerCase();
  if (ENERGIZE_AUDIO_RE.test(t) || MOTIVATION_AUDIO_RE.test(t)) {
    return "motivation-boost";
  }
  if (CALM_AUDIO_RE.test(t)) {
    return "calm-brain";
  }
  if (SLEEP_AUDIO_RE.test(t)) {
    return "sleep-sounds";
  }
  if (/\b(morning|start the day)\b/.test(t)) {
    return "morning-focus";
  }
  if (/\b(focus|concentrat|deep work|study|productiv)\b/.test(t)) {
    return "deep-work";
  }
  return "deep-work";
}

export function detectAudioRequest(text: string): {
  isAudio: boolean;
  categoryId: string;
} {
  if (isRhetoricalSoundUsage(text)) {
    return { isAudio: false, categoryId: "deep-work" };
  }

  const t = text.toLowerCase();
  const wantsEnergize = ENERGIZE_AUDIO_RE.test(t);
  const moodAudioIntent =
    wantsEnergize ||
    CALM_AUDIO_RE.test(t) ||
    MOTIVATION_AUDIO_RE.test(t) ||
    SLEEP_AUDIO_RE.test(t) ||
    FOCUS_AUDIO_RE.test(t);

  const explicitAudio =
    EXPLICIT_FOCUS_AUDIO_RE.test(text) ||
    MUSIC_MEDIA_RE.test(t) ||
    LISTEN_FOR_AUDIO_RE.test(t);

  const isAudio = explicitAudio || moodAudioIntent;

  return {
    isAudio,
    categoryId: resolveFocusAudioCategory(text),
  };
}

/** Warm one-liner the Companion says when offering to open Focus Audio. */
export function audioSuggestionLine(categoryId: string): string {
  const name = categoryDisplayName(categoryId);
  const rec = getRecommendedTrack(categoryId);
  const tail = rec ? ` I'd cue up ${rec.name} to start.` : "";
  if (categoryId === "motivation-boost") {
    return (
      `Energizing music can help — **Focus Audio** has a **${name}** playlist.${tail} ` +
      `Want me to open it?`
    );
  }
  return `Sounds like ${name} is what you need.${tail} Want me to take you to Focus Audio?`;
}

export function focusAudioOpenAck(categoryId: string): string {
  const name = categoryDisplayName(categoryId);
  const rec = getRecommendedTrack(categoryId);
  const tail = rec ? ` Starting with **${rec.name}**.` : "";
  if (categoryId === "motivation-boost") {
    return `Opening **Focus Audio** — **${name}** for an energy lift.${tail} Pick a track or add your own link.`;
  }
  return `Opening **Focus Audio** — **${name}** is ready.${tail}`;
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
