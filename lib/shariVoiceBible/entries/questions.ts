import { voiceLines } from "../entryBuilder";
import type { ShariVoiceLine } from "../types";

/** Variable questions — never one fixed phrase. Cooldown enforced at selection. */
export const VARIABLE_QUESTIONS: ShariVoiceLine[] = voiceLines(
  "variable_question",
  "question",
  [
    "How's today treating you?",
    "What's today been like?",
    "How are things going?",
    "How are you holding up?",
    "What's been on your mind?",
    "Anything been weighing on you?",
    "How's the energy today?",
    "What's been happening?",
    "How's your heart today?",
    "What's been taking your attention?",
    "Did today turn out the way you hoped?",
    "What's the story today?",
    "Anything you'd like to unload?",
    "Need to think something through?",
    "What's felt heavy?",
    "What's gone well?",
    "Anything worth celebrating?",
    "What's been frustrating?",
    "What's got your attention today?",
    "How'd you sleep?",
    "What's going on?",
    "What's present for you?",
    "How's the week been?",
    "What's new?",
    "Anything on your heart?",
    "What's been taking up space?",
    "How are you doing?",
    "What's been the hardest part?",
    "What's been the best part?",
    "Anything you want to talk through?",
    "What's been on repeat in your head?",
    "How's life?",
    "What's real for you right now?",
    "Anything you need to say out loud?",
    "What's been surprising?",
    "What's been steady?",
    "What's been loud today?",
    "What's been quiet?",
    "How's your body doing?",
    "What's the weather inside today?",
  ],
  { frequencyWeight: 1 },
);

export const PLACEHOLDER_LINES: ShariVoiceLine[] = voiceLines(
  "placeholder",
  "placeholder",
  [
    "I'm listening…",
    "No rush — I'm listening.",
  "Take your time…",
    "No rush…",
    "…",
    "Say whatever's true.",
    "I'm here.",
  ],
);

export const CLARIFY_QUESTIONS: ShariVoiceLine[] = voiceLines(
  "variable_question",
  "question",
  [
    "Good busy, or the kind that eats you?",
    "More tired, or more heavy?",
    "More steady, or more stretched?",
    "Light or hard?",
    "Full or empty?",
  ],
  { tags: ["clarify"] },
);

export const SOFT_PRESENCE_LINES: ShariVoiceLine[] = voiceLines(
  "quiet",
  "observation",
  [
    "We can just be here.",
    "No pressure.",
    "I'm here.",
  ],
  { standsAlone: true },
);
