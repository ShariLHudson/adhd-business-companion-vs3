/**
 * Estate Registry — tool registrations.
 */

import type { EstateRegistryEntry } from "../types";

export const DECISION_COMPASS_ENTRY: EstateRegistryEntry = {
  id: "decision-compass",
  name: "Decision Compass",
  category: "tool",
  purpose:
    "Talk through choices with structure — member owns the decision, Spark illuminates options.",
  memberDescription:
    "Decision Compass is where we talk through a choice until the right path feels clear — without rushing you.",
  primarySection: "decision-compass",
  objectId: "decision-compass",
  keywords: [
    "decide",
    "decision",
    "choose",
    "choice",
    "which option",
    "stuck between",
    "torn between",
    "can't decide",
    "help me choose",
    "pros and cons",
    "decision compass",
  ],
  phrases: [
    "i can't decide",
    "cant decide",
    "help me decide",
    "which should i",
    "stuck between two",
  ],
  userNeeds: ["decide"],
  intents: ["decide"],
  problemsSolved: ["analysis paralysis", "competing options"],
  outcomes: ["clearer decision", "confidence in next step"],
  journeyRole: "plan",
  status: "live",
};

export const SOUNDSCAPES_FOCUS_AUDIO_ENTRY: EstateRegistryEntry = {
  id: "soundscapes-focus-audio",
  name: "Soundscapes / Focus Audio",
  category: "audio",
  purpose:
    "Estate listening environments — rain, hearth, café, morning light, and more.",
  memberDescription:
    "Soundscapes inside Peaceful Places let you stay in the Estate while the world gets quieter.",
  primarySection: "focus-audio",
  objectId: "focus-audio",
  keywords: [
    "soundscape",
    "soundscapes",
    "focus audio",
    "background music",
    "background sound",
    "listen to music",
    "rain sounds",
    "white noise",
    "ambient audio",
  ],
  emotionalStates: ["anxious", "distracted"],
  userNeeds: ["calm"],
  problemsSolved: ["need focus audio", "want listening support"],
  outcomes: ["regulated focus", "calmer environment"],
  relatedEntryIds: ["peaceful-places"],
  journeyRole: "recover",
  status: "live",
};

export const TOOL_REGISTRATIONS: readonly EstateRegistryEntry[] = [
  DECISION_COMPASS_ENTRY,
  SOUNDSCAPES_FOCUS_AUDIO_ENTRY,
] as const;
