import { voiceLine, voiceLines } from "../entryBuilder";
import type { ShariVoiceLine } from "../types";

const MORNING_GREETINGS = voiceLines("morning", "greeting", [
  "Good morning.",
  "Morning.",
  "Coffee's ready.",
  "Hi.",
  "Good morning — coffee's on the table.",
  "Morning. Kitchen smells good.",
  "Hi. Sleep okay?",
  "Morning. Come in.",
], { timeOfDay: ["morning"], frequencyWeight: 1.2 });

const MORNING_KIN = voiceLines(
  "morning",
  "greeting",
  ["Morning.", "Coffee?", "Hi.", "Morning."],
  {
    timeOfDay: ["morning"],
    relationshipStages: ["kin", "deep"],
    frequencyWeight: 1.4,
    standsAlone: true,
  },
);

const MORNING_TRUSTED = voiceLines(
  "morning",
  "greeting",
  ["There you are.", "Morning.", "Hi.", "Coffee's ready."],
  {
    timeOfDay: ["morning"],
    relationshipStages: ["trusted", "deep", "kin"],
    standsAlone: true,
  },
);

const MIDDAY_GREETINGS = voiceLines("midday", "greeting", [
  "Hi.",
  "There you are.",
  "Hey.",
  "Afternoon already.",
  "Hi — come in.",
  "There you are. Grab a seat.",
], { timeOfDay: ["midday", "afternoon"] });

const AFTERNOON_GREETINGS = voiceLines("afternoon", "greeting", [
  "Hi.",
  "There you are.",
  "Hey.",
  "Afternoon.",
  "Hi — come sit.",
  "There you are. How's the day been?",
], { timeOfDay: ["afternoon"] });

const EVENING_GREETINGS = voiceLines("evening", "greeting", [
  "Hi.",
  "Evening.",
  "Long day?",
  "Come in.",
  "Hi. Sit down.",
  "Evening. You made it.",
], { timeOfDay: ["evening"] });

const LATE_NIGHT_GREETINGS = voiceLines("late_night", "greeting", [
  "You're still awake.",
  "Hi.",
  "Still up?",
  "Come tell me what's going on.",
  "Hey — couldn't sleep?",
  "Hi. Quiet night.",
], { timeOfDay: ["late_night"] });

export const TIME_OF_DAY_ENTRIES: ShariVoiceLine[] = [
  ...MORNING_GREETINGS,
  ...MORNING_KIN,
  ...MORNING_TRUSTED,
  ...MIDDAY_GREETINGS,
  ...AFTERNOON_GREETINGS,
  ...EVENING_GREETINGS,
  ...LATE_NIGHT_GREETINGS,
];

export const TIME_OF_DAY_QUESTIONS: ShariVoiceLine[] = [
  ...voiceLines("morning", "question", [
    "How'd you sleep?",
    "Sleep okay?",
    "How's the morning feeling?",
    "What's the morning been like?",
  ], { timeOfDay: ["morning"] }),
  ...voiceLines("midday", "question", [
    "How's today treating you?",
    "What's today been like?",
    "How are things going?",
    "What's been happening?",
  ], { timeOfDay: ["midday", "afternoon"] }),
  ...voiceLines("evening", "question", [
    "Long day?",
    "How was your day?",
    "How's today treating you?",
    "What's today been like?",
  ], { timeOfDay: ["evening"] }),
  ...voiceLines("late_night", "question", [
    "What's going on?",
    "What's on your mind?",
    "Can't sleep?",
    "What's keeping you up?",
  ], { timeOfDay: ["late_night"] }),
];
