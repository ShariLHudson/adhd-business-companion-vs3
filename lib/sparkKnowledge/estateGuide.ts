/**
 * Estate Guide responder — Shari answers "what can Spark do?" naturally.
 */

import {
  getCanonicalEstatePlaceById,
  matchCanonicalPlaceInText,
} from "@/lib/estate/canonicalEstateRegistry";
import {
  allEstateBrainEntries,
  estateBrainExperiences,
} from "@/lib/estateBrain/knowledgeRegistry";
import { searchEstateBrain } from "@/lib/estateBrain/search";
import { THINKING_FRAMEWORKS } from "./thinkingFrameworkRegistry";
import { UNIVERSAL_DOCUMENT_LABELS } from "./creationKnowledge";
import type { EstateGuideTopic, EstateGuideTurnResult } from "./types";

const ESTATE_GUIDE_RE =
  /\b(?:what can spark do|what does spark do|what (?:rooms|places) (?:are|do you have)|what (?:kinds? of )?journals|what visual (?:models?|thinking)|what (?:can|could) help (?:me )?grow (?:my )?business|how can spark help.*adhd|what features? am i missing|tell me about (?:the )?|why was (?:the )?|history of (?:the )?|what(?:'s| is) special about)\b/i;

/** Member exploring what Spark can do — especially ADHD / capability questions. */
const CAPABILITY_EXPLORATION_RE =
  /\b(?:(?:i (?:have|'ve got|'ve) )?adhd\b|(?:what|how) (?:can|could|does) (?:spark|this(?:\s+system)?|the system|it) (?:help|do)\b|wondering what (?:this|spark|the system|it) (?:can|could) help|what(?:'s| is) spark (?:good|helpful|useful) (?:for|with)|what can i do (?:here|with spark))\b/i;

const ORIENTATION_WHAT_IS_RE =
  /\bwhat(?:'s| is) (?:the )?(?:butterfly conservatory|conservatory|estate|spark estate)\b/i;

const ROOM_STORY_RE =
  /\b(?:tell me about|what is|what's|why was|history of|what(?:'s| is) special about)\s+(?:the\s+)?(.+)/i;

export function isEstateRoomStoryQuestion(text: string): boolean {
  const t = text.trim();
  return Boolean(t && ROOM_STORY_RE.test(t) && matchCanonicalPlaceInText(t));
}

export function isEstateOrientationQuestion(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (ESTATE_GUIDE_RE.test(t)) return true;
  if (ORIENTATION_WHAT_IS_RE.test(t)) return true;
  return false;
}

export function isEstateGuideQuestion(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (CAPABILITY_EXPLORATION_RE.test(t)) return true;
  if (isEstateOrientationQuestion(t)) return true;
  if (isEstateRoomStoryQuestion(t)) return true;
  return false;
}

function detectGuideTopic(text: string): EstateGuideTopic {
  const t = text.toLowerCase();
  if (ROOM_STORY_RE.test(t) && matchCanonicalPlaceInText(t)) return "room_story";
  if (/what can spark|what does spark/.test(t)) return "capabilities";
  if (/what rooms|what places/.test(t)) return "rooms";
  if (/journal/.test(t)) return "journals";
  if (/visual model|visual thinking|mind map|whiteboard/.test(t)) return "visual_models";
  if (/grow.*business|business growth/.test(t)) return "business_growth";
  if (/adhd/.test(t)) return "adhd";
  if (/missing|don't know about|haven't tried/.test(t)) return "features_missing";
  return "general";
}

function capabilitiesGuideBody(): string {
  const experiences = estateBrainExperiences();
  const lines = experiences.map(
    (e) =>
      `${e.name} — ${e.purpose} You might ${e.suggestedActivities[0]?.toLowerCase() ?? "start here"}.`,
  );
  return [
    "Spark Estate is one home — conversation is always the front door.",
    "",
    ...lines,
    "",
    "You never need to remember where things live. Just tell me what you're trying to do.",
  ].join("\n");
}

function roomsGuideBody(): string {
  const live = allEstateBrainEntries()
    .filter((e) => e.kind === "space")
    .slice(0, 8);
  const names = live.map((e) => e.name).join(", ");
  return [
    "The Estate has living places, destinations, and quiet outdoor spots — each with its own feeling.",
    "",
    `A few you might enjoy: ${names}.`,
    "",
    "Ask me about any room by name — I'll tell you the story and when it might help.",
  ].join("\n");
}

function journalsGuideBody(): string {
  return [
    "Journaling here isn't homework — it's a quiet place to think out loud.",
    "",
    "Growth Journal — reflection on your business journey and wins.",
    "Clear My Mind — capture thoughts without organizing them yet.",
    "Journal Gazebo — peaceful outdoor writing when you need air.",
    "",
    "Which sounds closer to what you need right now?",
  ].join("\n");
}

function visualModelsGuideBody(): string {
  const samples = THINKING_FRAMEWORKS.slice(0, 6).map((f) => f.name);
  return [
    "Visual thinking helps when words alone feel cramped.",
    "",
    `I can help with ${samples.join(", ")}, and more.`,
    "",
    "Tell me what you're trying to figure out — I'll suggest the right model.",
  ].join("\n");
}

function businessGrowthGuideBody(): string {
  return [
    "Growing a business here means building capability — not just content.",
    "",
    "Momentum — projects, weekly planning, and roadmaps.",
    "Boardroom — strategy, offers, avatars, and funnels.",
    "Momentum Institute — bite-sized learning when you want to level up.",
    "Create — emails, plans, SOPs, and everything you ship.",
    "",
    "What's the one decision or project on your mind right now?",
  ].join("\n");
}

function adhdGuideBody(): string {
  return [
    "Spark was built for brains that work differently — not against them.",
    "",
    "When overwhelm hits: Clear My Mind, Focus Audio, breathing resets, and body doubling.",
    "When you need structure without shame: Momentum, gentle planning, one next step.",
    "When you need to think out loud: conversation first — always.",
    "",
    "Nothing here measures streaks or judges returns. What would help most today?",
  ].join("\n");
}

function featuresMissingGuideBody(): string {
  return [
    "You might not have discovered everything yet — that's normal. The Estate is meant to be explored over time.",
    "",
    "A few things members often love once they find them:",
    "• Visual Thinking Studio — mind maps and whiteboards",
    "• Evidence Vault — quiet celebration of real growth",
    "• Decision Compass — when a choice feels heavy",
    "• Momentum Institute — learning without a course platform feel",
    "",
    "What are you trying to accomplish? I'll point you somewhere that fits.",
  ].join("\n");
}

function roomStoryBody(placeId: string): string {
  const place = getCanonicalEstatePlaceById(placeId);
  const brain = searchEstateBrain(place?.officialName ?? placeId).best?.entry;

  if (!place && !brain) {
    return "I'm not sure which place you mean — can you say the name again?";
  }

  const name = place?.officialName ?? brain!.name;
  const feeling = place?.primaryFeeling ?? brain!.purpose;
  const activities =
    brain?.suggestedActivities.slice(0, 3).join(", ") ?? "quiet presence";
  const related =
    place?.relatedPlaces
      .slice(0, 2)
      .map((id) => getCanonicalEstatePlaceById(id)?.officialName)
      .filter(Boolean)
      .join(" or ") ?? "";

  const parts = [
    `${name} is one of my favorite spots on the Estate.`,
    "",
    feeling,
  ];

  if (brain?.description) {
    parts.push("", brain.description);
  }

  if (place?.permanentObjects?.length) {
    parts.push(
      "",
      `You'll find ${place.permanentObjects.slice(0, 3).join(", ").toLowerCase()} there.`,
    );
  }

  parts.push("", `Members often ${activities.toLowerCase()}.`);

  if (related) {
    parts.push("", `If you love this atmosphere, ${related} might resonate too.`);
  }

  parts.push("", "Would you like to visit, or keep talking here?");

  return parts.join("\n");
}

export function resolveEstateGuideTurn(userText: string): EstateGuideTurnResult {
  const topic = detectGuideTopic(userText);
  const placeMatch = matchCanonicalPlaceInText(userText);
  const placeId = placeMatch?.id;

  let intro = "Happy to walk you through the Estate.";
  let body: string;
  const suggestions: string[] = [];

  switch (topic) {
    case "room_story":
      intro = placeId
        ? `Ah, ${getCanonicalEstatePlaceById(placeId)?.officialName ?? "that place"}.`
        : "Let me tell you about that place.";
      body = placeId ? roomStoryBody(placeId) : roomsGuideBody();
      suggestions.push("Visit there", "Stay here", "Show me the Estate map");
      break;
    case "capabilities":
      body = capabilitiesGuideBody();
      suggestions.push("Help me create something", "I need to focus", "Grow my business");
      break;
    case "rooms":
      body = roomsGuideBody();
      suggestions.push("Tell me about a specific room", "What can Spark do?");
      break;
    case "journals":
      body = journalsGuideBody();
      suggestions.push("Clear My Mind", "Growth Journal", "Stay here");
      break;
    case "visual_models":
      body = visualModelsGuideBody();
      suggestions.push("Mind map", "SWOT", "Help me decide");
      break;
    case "business_growth":
      body = businessGrowthGuideBody();
      suggestions.push("Plan my week", "Work on my offer", "Create a marketing plan");
      break;
    case "adhd":
      body = adhdGuideBody();
      suggestions.push("I'm overwhelmed", "Help me focus", "Clear my mind");
      break;
    case "features_missing":
      body = featuresMissingGuideBody();
      suggestions.push("What can Spark do?", "Show me visual thinking");
      break;
    default:
      body = capabilitiesGuideBody();
      suggestions.push("Tell me about a room", "Help me create something");
  }

  return {
    topic,
    intro,
    body,
    suggestions,
    matchedPlaceId: placeId,
    responseHint: [
      "ESTATE GUIDE (mandatory):",
      `Topic: ${topic}.`,
      "Speak as Shari who has lived here for years — warm, conversational, never a feature list or software tour.",
      "Do NOT read markdown headings aloud. Do NOT number five options.",
      "One primary invitation at most. Member chooses.",
      placeId ? `Matched place: ${placeId}.` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export function formatEstateGuideReply(turn: EstateGuideTurnResult): string {
  return [turn.intro, "", turn.body].join("\n");
}

export { UNIVERSAL_DOCUMENT_LABELS };
