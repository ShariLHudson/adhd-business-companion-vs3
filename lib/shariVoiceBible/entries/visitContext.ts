import { voiceLines } from "../entryBuilder";
import type { ShariVoiceLine } from "../types";

export const VISIT_CONTEXT_GREETINGS: ShariVoiceLine[] = [
  ...voiceLines("first_visit", "greeting", [
    "Hi.",
    "Come in.",
    "Hi. I'm glad you're here.",
    "Welcome in.",
    "Hi — make yourself at home.",
  ], { relationshipStages: ["day_one"] }),
  ...voiceLines("second_visit", "greeting", [
    "Hi again.",
    "Back already — good.",
    "Hi. Good to see you.",
    "There you are.",
  ], { relationshipStages: ["early"] }),
  ...voiceLines("return_one_day", "greeting", [
    "Hi.",
    "Back again.",
    "There you are.",
    "Hi — good to see you.",
  ]),
  ...voiceLines("return_one_week", "greeting", [
    "Hi.",
    "Been a few days.",
    "There you are.",
    "Welcome back.",
  ]),
  ...voiceLines("return_one_month", "greeting", [
    "Hi.",
    "It's been a minute.",
    "There you are.",
    "Good to see you.",
  ]),
  ...voiceLines("return_six_months", "greeting", [
    "Hi.",
    "Been a while.",
    "There you are.",
  ]),
  ...voiceLines("return_long_absence", "greeting", [
    "Hi.",
    "It's been a long time.",
    "There you are.",
    "I'm glad you walked in.",
  ]),
];

export const VISIT_CONTEXT_QUESTIONS: ShariVoiceLine[] = [
  ...voiceLines("first_visit", "question", [
    "What brought you by?",
    "What's going on?",
    "What's been on your mind?",
  ], { relationshipStages: ["day_one"] }),
  ...voiceLines("return_long_absence", "question", [
    "What's been happening?",
    "What's been going on in your world?",
    "What's new?",
  ]),
];
