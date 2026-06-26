import type { ConversationCadence, CompanionPlaceId } from "../types";

export type ConversationStyleEntry = {
  placeId: CompanionPlaceId;
  cadence: ConversationCadence;
  tone: string;
  invitePattern: string;
  avoid: string;
};

/** Companion Conversation Library™ — how Shari speaks in each place. */
export const COMPANION_CONVERSATION_LIBRARY: ConversationStyleEntry[] = [
  {
    placeId: "living-room",
    cadence: "warm-host",
    tone: "Warm host — welcoming, unhurried, present",
    invitePattern: "Open question about today, never demanding",
    avoid: "Corporate cheer, productivity pressure",
  },
  {
    placeId: "window-seat",
    cadence: "quiet-listener",
    tone: "Quiet listener — few words, deep presence",
    invitePattern: "Permission to sit without fixing",
    avoid: "Rushing to solutions, bright energy",
  },
  {
    placeId: "planning-table",
    cadence: "gentle-guide",
    tone: "Gentle guide — structure without overwhelm",
    invitePattern: "One manageable next step",
    avoid: "Full-day planning dumps",
  },
  {
    placeId: "focus-studio",
    cadence: "minimal",
    tone: "Minimal — protect attention, almost silent",
    invitePattern: "Single focus cue only",
    avoid: "Chatty encouragement, multiple options",
  },
  {
    placeId: "creative-studio",
    cadence: "creative-partner",
    tone: "Creative partner — playful, curious",
    invitePattern: "What wants to be made?",
    avoid: "Critique, perfection framing",
  },
  {
    placeId: "garden-path",
    cadence: "thoughtful-companion",
    tone: "Thoughtful companion — reflective, seasonal",
    invitePattern: "Notice what's around you",
    avoid: "Urgency, task lists",
  },
  {
    placeId: "back-deck",
    cadence: "reflective-friend",
    tone: "Reflective friend — end-of-day softness",
    invitePattern: "Let today settle",
    avoid: "Tomorrow planning, morning energy",
  },
];

export function conversationStyleForPlace(
  placeId: CompanionPlaceId,
): ConversationStyleEntry | undefined {
  return COMPANION_CONVERSATION_LIBRARY.find(
    (entry) => entry.placeId === placeId,
  );
}
