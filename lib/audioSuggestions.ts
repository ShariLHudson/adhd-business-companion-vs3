// Connective layer between soundscapes, the Companion's suggestions,
// and the background engine.

import type { EmotionalState } from "./companionEmotions";
import { messageNamesExactEstateRoom } from "./estate/estateRoomAliasRegistry";
import {
  getRecommendedTrack,
  type AudioLink,
} from "./audioPlaylists";
import {
  recommendedSoundscapeForLegacyCategory,
  soundscapeDisplayLabel,
  soundscapeToAudioLink,
} from "./soundscapes";

export type AudioBackgroundMood = "focus" | "today" | "progress" | "recovery";

/** Emotional state → soundscape mood scroll target. */
export const AUDIO_CATEGORY_FOR_EMOTION: Record<EmotionalState, string> = {
  focused: "focus",
  building: "focus",
  stuck: "energize",
  unclear: "focus",
  overwhelmed: "calming",
  emotional: "calming",
};

export const AUDIO_BACKGROUND_MOOD: Record<string, AudioBackgroundMood> = {
  focus: "focus",
  calming: "recovery",
  sleep: "recovery",
  energize: "today",
  "deep-work": "focus",
  "morning-focus": "today",
  energetic: "today",
  "motivation-boost": "progress",
  "calm-brain": "recovery",
  "sleep-sounds": "recovery",
};

export const AUDIO_SUGGESTION_REASON: Record<EmotionalState, string> = {
  focused: "to settle into deep work",
  building: "to keep the ideas flowing",
  stuck: "to find a little momentum",
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
  return AUDIO_CATEGORY_FOR_EMOTION[emotion] ?? "focus";
}

export function audioBackgroundMood(categoryId: string): AudioBackgroundMood {
  return AUDIO_BACKGROUND_MOOD[categoryId] ?? "focus";
}

const ENERGIZE_AUDIO_RE =
  /\b(energi[sz]e|energi[sz]ing|pep (?:me )?up|pick me up|need (?:more )?energy|get (?:me )?going|wake me up|uplift(?:ing)?|something to energi[sz]e)\b/;

const CALM_AUDIO_RE =
  /\b(?:calm(?:ing)?\s+(?:audio|music|sounds?|soundscape|playlist)|relax(?:ing)?\s+(?:audio|music|sounds?)|soothe|soothing|grounding\s+(?:audio|music|sounds?)|quiet\s+(?:audio|music|sounds?)|calm my brain|something calm(?:\s+to\s+listen)?|need something calm)\b/i;

const MOTIVATION_AUDIO_RE =
  /\b(motivat(?:e|ing|ion(?:al)?)(?:\s+(?:audio|music|sounds?|playlist))?|motivation boost|pump[- ]?up|pep (?:me )?up|energy boost|hype (?:music|playlist)|get (?:me )?going|something motivat)\b/i;

const SLEEP_AUDIO_RE =
  /\b(sleep(?:\s+(?:audio|music|sounds?|soundscape))?|wind[- ]?down(?:\s+(?:audio|music|sounds?))?|bedtime (?:sounds?|music)|nap sounds?)\b/i;

const FOCUS_AUDIO_RE =
  /\b(focus audio|focus music|focus soundscape|background (?:music|sounds?|audio)|concentration music|deep work (?:music|audio|sounds?)|study (?:music|audio|sounds?))\b/i;

const EXPLICIT_FOCUS_AUDIO_RE =
  /\b(?:focus (?:audio|music|soundscape)|soundscapes?|(?:brown|white|pink) noise|rain sounds?|calming sounds?|background (?:sound|music|audio)|play (?:music|audio|brown|white|rain|something)|open (?:focus )?(?:audio|music|soundscapes?)|help me focus with (?:sound|music|audio)|(?:i )?need (?:audio|music) to focus|music to focus|open music)\b/i;

const MUSIC_MEDIA_RE =
  /\b(music|audio|playlist|lo-?fi|lofi|soundtrack|song|songs|tunes|beats)\b/i;

const LISTEN_FOR_AUDIO_RE =
  /\b(?:something to listen to|listen to (?:music|something|calm|rain))\b/i;

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
    return "energize";
  }
  if (CALM_AUDIO_RE.test(t)) {
    return "calming";
  }
  if (SLEEP_AUDIO_RE.test(t)) {
    return "sleep";
  }
  if (/\b(morning|start the day)\b/.test(t)) {
    return "energize";
  }
  if (/\b(focus|concentrat|deep work|study|productiv)\b/.test(t)) {
    return "focus";
  }
  return "focus";
}

export function detectAudioRequest(text: string): {
  isAudio: boolean;
  categoryId: string;
} {
  if (isRhetoricalSoundUsage(text)) {
    return { isAudio: false, categoryId: "focus" };
  }

  const t = text.toLowerCase();

  if (messageNamesExactEstateRoom(text) && !MUSIC_MEDIA_RE.test(t)) {
    return { isAudio: false, categoryId: "focus" };
  }
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

function recommendedTrackForCategory(categoryId: string): AudioLink | null {
  const soundscape = recommendedSoundscapeForLegacyCategory(categoryId);
  if (soundscape) return soundscapeToAudioLink(soundscape);
  return getRecommendedTrack(categoryId);
}

export function audioSuggestionLine(categoryId: string): string {
  const rec = recommendedTrackForCategory(categoryId);
  const tail = rec ? ` I'd start with **${rec.name}**.` : "";
  return `A peaceful place might help.${tail} Want me to open **Peaceful Places**?`;
}

export function focusAudioOpenAck(categoryId: string): string {
  const rec = recommendedTrackForCategory(categoryId);
  const tail = rec ? ` Starting with **${rec.name}**.` : "";
  return `Opening **Peaceful Places**.${tail} Choose where you'd like to spend a little time.`;
}

export function suggestAudioForEmotion(emotion: EmotionalState): AudioSuggestion {
  const categoryId = audioCategoryForEmotion(emotion);
  const soundscape = recommendedSoundscapeForLegacyCategory(categoryId);
  return {
    categoryId,
    categoryName: soundscape
      ? soundscapeDisplayLabel(soundscape)
      : categoryId,
    reason: AUDIO_SUGGESTION_REASON[emotion] ?? "to help you settle in",
    track: recommendedTrackForCategory(categoryId),
    mood: audioBackgroundMood(categoryId),
  };
}
