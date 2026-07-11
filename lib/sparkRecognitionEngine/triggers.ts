/**
 * Recognition trigger phrases — rule-based v1.
 * Gentle notice only; never auto-save or auto-celebrate.
 */

import type { RecognitionTriggerMatch } from "./types";

const PRESERVE_PHRASES = [
  "i figured it out",
  "i figured out",
  "i solved it",
  "i solved",
  "i learned something",
  "i learned",
  "i discovered",
  "i don't want to forget",
  "i do not want to forget",
  "i helped someone",
  "i helped",
  "i prevented",
  "it worked",
  "i made progress",
  "i realized",
] as const;

const CELEBRATION_PHRASES = [
  "i did it",
  "i finally finished",
  "i launched",
  "i published",
  "i got my first client",
  "i'm proud of myself",
  "i am proud of myself",
  "this is huge",
  "i overcame",
] as const;

const HALL_PHRASES = [
  "that changed everything",
  "this changed everything",
  "defining moment",
  "part of my story",
] as const;

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function detectRecognitionTriggers(
  userText: string,
): RecognitionTriggerMatch {
  const text = normalize(userText);
  if (!text) {
    return {
      matched: false,
      phrases: [],
      suggestsCelebration: false,
      suggestsHallLanguage: false,
      suggestsPreserve: false,
    };
  }

  const phrases: string[] = [];
  let suggestsPreserve = false;
  let suggestsCelebration = false;
  let suggestsHallLanguage = false;

  for (const phrase of PRESERVE_PHRASES) {
    if (text.includes(phrase)) {
      phrases.push(phrase);
      suggestsPreserve = true;
    }
  }
  for (const phrase of CELEBRATION_PHRASES) {
    if (text.includes(phrase)) {
      phrases.push(phrase);
      suggestsCelebration = true;
      suggestsPreserve = true;
    }
  }
  for (const phrase of HALL_PHRASES) {
    if (text.includes(phrase)) {
      phrases.push(phrase);
      suggestsHallLanguage = true;
      suggestsPreserve = true;
    }
  }

  return {
    matched: phrases.length > 0,
    phrases,
    suggestsCelebration,
    suggestsHallLanguage,
    suggestsPreserve,
  };
}
