import type { WelcomeGreetingCategory } from "./types";

export const WELCOME_GREETING_LIBRARY: Record<
  WelcomeGreetingCategory,
  readonly string[]
> = {
  day_one: ["Welcome.", "I'm here for you."],
  morning: [
    "Good morning.",
    "Morning.",
    "It's good to see you.",
    "Welcome.",
    "There you are.",
    "Ready whenever you are.",
    "Take your time this morning.",
    "A brand-new day.",
  ],
  afternoon: [
    "Welcome back.",
    "Hi!",
    "Good to see you again.",
    "Come on in.",
    "Glad you stopped by.",
  ],
  evening: [
    "Welcome back.",
    "Long day?",
    "Come in and sit for a while.",
    "Let's slow things down.",
    "Take a breath.",
    "I'm glad you're here.",
  ],
  late_night: [
    "Couldn't sleep?",
    "Still awake?",
    "You're not alone tonight.",
    "Let's keep this gentle.",
    "Nothing has to be solved tonight.",
  ],
  birthday: [
    "Happy Birthday.",
    "I'm really glad I get to celebrate today with you.",
  ],
  celebration: [
    "Before anything else… congratulations.",
    "I'm really happy for you.",
  ],
  recovery: [
    "I'm really glad you came back today.",
    "We'll go gently.",
  ],
  vacation: ["Good morning.", "Only a few mornings until your trip."],
  low_energy: ["Good morning.", "Let's keep today honest."],
  relationship_month: [
    "Good morning.",
    "It's nice seeing you again.",
  ],
  relationship_six_months: [
    "Welcome back.",
    "I've been wondering how today was going.",
  ],
  relationship_years: [
    "There you are.",
    "Come on in.",
    "It's always good to see you.",
  ],
  ordinary: [
    "Morning.",
    "Coffee's ready.",
    "Welcome.",
    "Hi.",
  ],
};

export const WELCOME_INVITE_LIBRARY: Record<
  WelcomeGreetingCategory,
  readonly string[]
> = {
  day_one: ["What's on your mind today?"],
  morning: [
    "What's on your mind today?",
    "How are you arriving today?",
    "What feels important today?",
  ],
  afternoon: [
    "What's on your mind today?",
    "Where should we begin?",
    "Need a little reset?",
    "How's your day unfolding?",
  ],
  evening: [
    "What's on your mind today?",
    "Tell me what's been on your mind.",
    "Where should we begin?",
  ],
  late_night: [
    "What's on your mind?",
    "Tell me what's been on your mind.",
    "Where should we begin?",
  ],
  birthday: ["What's on your mind today?"],
  celebration: ["What's on your mind today?"],
  recovery: ["We'll go at your pace. What's present for you?"],
  vacation: ["What's on your mind today?"],
  low_energy: ["What's feeling doable today?"],
  relationship_month: ["What's on your mind today?"],
  relationship_six_months: ["What's on your mind today?"],
  relationship_years: ["What's on your mind today?"],
  ordinary: [
    "What's on your mind today?",
    "What's today's story?",
    "How can I help today?",
  ],
};

export const WELCOME_CHAT_PLACEHOLDER_LIBRARY: Record<
  WelcomeGreetingCategory,
  string
> = {
  day_one: "I'm listening…",
  morning: "I'm listening…",
  afternoon: "I'm listening…",
  evening: "I'm listening…",
  late_night: "I'm listening…",
  birthday: "I'm listening…",
  celebration: "I'm listening…",
  recovery: "No rush — I'm listening.",
  vacation: "I'm listening…",
  low_energy: "Take your time…",
  relationship_month: "I'm listening…",
  relationship_six_months: "I'm listening…",
  relationship_years: "I'm listening…",
  ordinary: "I'm listening…",
};
