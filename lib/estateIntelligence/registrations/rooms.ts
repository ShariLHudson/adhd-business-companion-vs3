/**
 * Estate Registry — room registrations (thin adapters; no duplicate runtime logic).
 */

import type { EstateRegistryEntry } from "../types";
import {
  MOMENTUM_BUILDER_OBJECT_ID,
  MOMENTUM_BUILDER_SECTION,
} from "@/lib/momentumBuilderRoom/roomRegistry";

export const PEACEFUL_PLACES_ENTRY: EstateRegistryEntry = {
  id: "peaceful-places",
  name: "Peaceful Places",
  category: "room",
  purpose:
    "Immersive calm destinations inside the Estate — soundscapes, warmth, and restoration without leaving Spark.",
  memberDescription:
    "Peaceful Places inside the Estate was created for moments when you need calm, focus, or a gentle reset.",
  primarySection: "focus-audio",
  objectId: "focus-audio",
  keywords: [
    "peaceful",
    "peaceful place",
    "peaceful places",
    "calm",
    "relax",
    "soundscape",
    "soundscapes",
    "focus audio",
    "ambient",
    "listen",
    "nature sounds",
    "hearth",
    "café",
    "cafe",
  ],
  phrases: [
    "what is a peaceful place",
    "what's a peaceful place",
    "tell me about peaceful places",
    "where are peaceful places",
  ],
  emotionalStates: ["anxious", "stressed", "overwhelmed", "tired"],
  userNeeds: ["calm", "rest"],
  intents: ["understand", "clarify"],
  problemsSolved: [
    "need calm without another app",
    "asking what peaceful place means",
    "want background sound in the estate",
  ],
  outcomes: ["feel calmer", "find a restorative place inside Spark"],
  journeyRole: "recover",
  relatedEntryIds: ["soundscapes-focus-audio"],
  status: "live",
};

export const MOMENTUM_BUILDER_ENTRY: EstateRegistryEntry = {
  id: "momentum-builder",
  name: "Momentum Builder",
  category: "room",
  purpose:
    "Coaching conversation in a planning studio — turn uncertainty into one meaningful next step.",
  memberDescription:
    "Momentum Builder is where we figure out what matters today and name the smallest honest next step together.",
  primarySection: MOMENTUM_BUILDER_SECTION,
  sections: ["grow-momentum-builders"],
  objectId: MOMENTUM_BUILDER_OBJECT_ID,
  keywords: [
    "momentum",
    "overwhelmed",
    "overwhelm",
    "stuck",
    "procrastinat",
    "can't start",
    "get started",
    "move forward",
    "today",
    "what should i do",
    "paralyzed",
  ],
  phrases: [
    "i'm overwhelmed",
    "im overwhelmed",
    "feeling overwhelmed",
    "so overwhelmed",
    "can't get started",
    "don't know where to start",
  ],
  emotionalStates: ["overwhelmed", "stuck", "anxious"],
  userNeeds: ["momentum", "clarity"],
  intents: ["plan", "execute", "clarify"],
  problemsSolved: [
    "too much to do",
    "no clear first step",
    "productivity paralysis",
  ],
  outcomes: ["know exactly what to do next", "feel less overwhelmed"],
  journeyRole: "execute",
  status: "live",
};

export const CLEAR_MY_MIND_ENTRY: EstateRegistryEntry = {
  id: "clear-my-mind",
  name: "Clear My Mind",
  category: "room",
  purpose:
    "Continuous thought capture — empty the head without organizing pressure.",
  memberDescription:
    "Clear My Mind is where we unload what's swirling so your head has room to think again.",
  primarySection: "brain-dump",
  objectId: "brain-dump",
  keywords: [
    "clear my mind",
    "clear my thoughts",
    "clear my head",
    "brain dump",
    "braindump",
    "jumbled",
    "scattered thoughts",
    "too much in my head",
    "mind dump",
    "unload",
  ],
  phrases: [
    "need to clear my thoughts",
    "clear my thoughts",
    "organize my thoughts",
    "everything in my head",
    "thoughts are jumbled",
  ],
  emotionalStates: ["overwhelmed", "scattered"],
  userNeeds: ["clarity", "organize"],
  intents: ["organize", "clarify"],
  problemsSolved: ["mental clutter", "can't think straight"],
  outcomes: ["lighter head", "thoughts captured safely"],
  journeyRole: "think",
  status: "live",
};

export const CREATIVE_STUDIO_ENTRY: EstateRegistryEntry = {
  id: "creative-studio",
  name: "Creative Studio",
  category: "room",
  purpose: "Create workshops, content, and business assets with Spark beside you.",
  memberDescription:
    "Creative Studio is a peaceful place to build what you're imagining — drafts welcome, perfection not required.",
  primarySection: "content-generator",
  objectId: "content-generator",
  keywords: [
    "create",
    "write",
    "workshop",
    "content",
    "draft",
    "build",
    "launch",
    "creative studio",
  ],
  phrases: [
    "want to create",
    "help me write",
    "build a workshop",
    "help creating a workshop",
    "creating a workshop",
  ],
  userNeeds: ["create"],
  intents: ["build", "execute"],
  problemsSolved: ["need to make something real", "blank page"],
  outcomes: ["tangible draft", "forward motion on creation"],
  journeyRole: "create",
  status: "live",
};

export const COFFEE_HOUSE_ENTRY: EstateRegistryEntry = {
  id: "coffee-house",
  name: "Coffee House",
  category: "room",
  purpose:
    "Warm reflective pause — debrief, breathe, and celebrate without productivity pressure.",
  memberDescription:
    "The Coffee House is always warm when you need a breather or a quiet moment to reflect.",
  keywords: [
    "coffee house",
    "coffee shop",
    "take a break",
    "need a break",
    "debrief",
    "reflect on",
    "pause",
    "rest",
  ],
  phrases: ["need a breather", "just need a break"],
  emotionalStates: ["tired", "drained"],
  userNeeds: ["rest"],
  intents: ["conversation"],
  problemsSolved: ["need rest without guilt", "want reflection space"],
  outcomes: ["feel seen", "gentle pause"],
  journeyRole: "reflect",
  status: "partial",
};

export const ROOM_REGISTRATIONS: readonly EstateRegistryEntry[] = [
  PEACEFUL_PLACES_ENTRY,
  MOMENTUM_BUILDER_ENTRY,
  CLEAR_MY_MIND_ENTRY,
  CREATIVE_STUDIO_ENTRY,
  COFFEE_HOUSE_ENTRY,
] as const;
