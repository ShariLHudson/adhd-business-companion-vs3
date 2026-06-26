import { voiceLines } from "../entryBuilder";
import type { ShariVoiceLine } from "../types";

/** Previous-conversation follow-ups — `{topic}` interpolated at selection time. */
export const TOPIC_FOLLOW_UP_QUESTIONS: ShariVoiceLine[] = voiceLines(
  "variable_question",
  "question",
  [
    "Last time you were sitting with {topic}. How's that feeling now?",
    "You were with {topic} last time. How's that sitting with you?",
    "{topic} — still on your mind?",
    "Still thinking about {topic}?",
    "How's {topic} going?",
    "{topic}. Where is that now?",
    "Been carrying {topic} around?",
    "What's shifted with {topic}?",
  ],
  { tags: ["topic_followup"], frequencyWeight: 1.1 },
);
