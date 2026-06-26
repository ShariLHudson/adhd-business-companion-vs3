import { voiceLines } from "../entryBuilder";
import type { ShariVoiceLine } from "../types";

/** Earned questions — caring person wondering, never citing memory. */
export const PRESENCE_WONDER_QUESTIONS: ShariVoiceLine[] = voiceLines(
  "variable_question",
  "question",
  [
    "I've been wondering how things have been going.",
    "Did things work out the way you hoped?",
    "How did that turn out?",
    "How are things sitting with you?",
    "What's been on your mind lately?",
    "How's life been treating you?",
    "Anything shifted since we last sat together?",
    "How are you doing today?",
  ],
  { tags: ["presence_wonder"], frequencyWeight: 1.2 },
);
