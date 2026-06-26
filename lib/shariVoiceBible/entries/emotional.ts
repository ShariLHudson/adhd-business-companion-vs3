import { voiceLines } from "../entryBuilder";
import type { ShariVoiceLine } from "../types";

export const EMOTIONAL_GREETINGS: ShariVoiceLine[] = [
  ...voiceLines("celebrating", "greeting", [
    "Hi.",
    "Good day for it.",
    "Something to celebrate?",
  ], { emotionalTags: ["celebrating", "excited", "good_news"] }),
  ...voiceLines("discouraged", "greeting", [
    "Hi.",
    "Come in.",
    "Hi. Sit down.",
  ], { emotionalTags: ["discouraged"] }),
  ...voiceLines("overwhelmed", "greeting", [
    "Hi.",
    "Come in.",
    "Hi. No rush.",
  ], { emotionalTags: ["overwhelmed"] }),
  ...voiceLines("quiet", "greeting", [
    "Hi.",
    "Come in.",
  ], { emotionalTags: ["quiet", "neutral"], standsAlone: true }),
  ...voiceLines("excited", "greeting", [
    "Hi.",
    "Big energy today?",
  ], { emotionalTags: ["excited", "creative"] }),
  ...voiceLines("creative", "greeting", [
    "Hi.",
    "Ideas in the air?",
  ], { emotionalTags: ["creative"] }),
  ...voiceLines("exhausted", "greeting", [
    "Hi.",
    "Rough one?",
    "Come sit.",
  ], { emotionalTags: ["exhausted"] }),
  ...voiceLines("after_grief", "greeting", [
    "Hi.",
    "Come in.",
  ], { emotionalTags: ["grief"] }),
];

export const LIFE_MOMENT_GREETINGS: ShariVoiceLine[] = [
  ...voiceLines("business_win", "greeting", [
    "Hi.",
    "Good news in the air?",
    "Something went right?",
  ], { tags: ["win"] }),
  ...voiceLines("launch_week", "greeting", [
    "Hi.",
    "Big week.",
    "Launch week?",
  ], { tags: ["launch"] }),
  ...voiceLines("big_decision", "greeting", [
    "Hi.",
    "Something weighing on you?",
  ], { tags: ["decision"] }),
  ...voiceLines("vacation_return", "greeting", [
    "Welcome back.",
    "Hi. Trip behind you?",
    "Back from the road?",
  ], { tags: ["vacation"] }),
  ...voiceLines("after_completing", "greeting", [
    "Hi.",
    "Finished something?",
    "Done?",
  ], { tags: ["completed"] }),
  ...voiceLines("after_doing_nothing", "greeting", [
    "Hi.",
    "Quiet day?",
    "Come in.",
  ], { tags: ["rest"] }),
  ...voiceLines("after_good_news", "greeting", [
    "Hi.",
    "Good news?",
  ], { emotionalTags: ["good_news", "celebrating"] }),
  ...voiceLines("after_difficult_news", "greeting", [
    "Hi.",
    "Come in.",
  ], { emotionalTags: ["difficult_news", "grief"] }),
  ...voiceLines("after_meetings", "greeting", [
    "Hi.",
    "Meeting day?",
    "Back to back?",
  ], { tags: ["meetings"] }),
  ...voiceLines("after_creative_session", "greeting", [
    "Hi.",
    "Good session?",
  ], { tags: ["creative_session"], emotionalTags: ["creative"] }),
  ...voiceLines("after_hard_week", "greeting", [
    "Hi.",
    "Hard week?",
    "Come sit.",
  ], { tags: ["hard_week"] }),
  ...voiceLines("after_productive_day", "greeting", [
    "Hi.",
    "Full day?",
  ], { tags: ["productive"] }),
  ...voiceLines("after_avoiding_app", "greeting", [
    "Hi.",
    "There you are.",
    "Come in.",
  ], { tags: ["return_after_gap"] }),
];

export const EMOTIONAL_ECHOES: ShariVoiceLine[] = [
  ...voiceLines("echo", "echo", [
    "Thank you for telling me.",
    "I'm glad you said that.",
    "Okay.",
    "I hear you.",
  ], { emotionalTags: ["neutral"] }),
  ...voiceLines("overwhelmed", "echo", [
    "That's a lot.",
    "We don't have to fix anything right now.",
    "No rush.",
  ], { emotionalTags: ["overwhelmed"] }),
  ...voiceLines("after_grief", "echo", [
    "I'm sorry.",
    "We can just sit with that.",
  ], { emotionalTags: ["grief"] }),
  ...voiceLines("discouraged", "echo", [
    "Hard one.",
    "I'm here.",
  ], { emotionalTags: ["discouraged"] }),
  ...voiceLines("exhausted", "echo", [
    "We'll keep it light.",
    "Okay — gentle today.",
  ], { emotionalTags: ["exhausted"] }),
  ...voiceLines("celebrating", "echo", [
    "That's worth celebrating.",
    "Good.",
  ], { emotionalTags: ["celebrating", "excited", "good_news"] }),
  ...voiceLines("creative", "echo", [
    "I love that energy.",
    "Good spark.",
  ], { emotionalTags: ["creative", "excited"] }),
  ...voiceLines("continuity", "echo", [
    "Still carrying a similar feeling?",
    "Yesterday still with you?",
    "Want to start there?",
  ], { tags: ["continuity"] }),
];
