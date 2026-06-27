import type { PersonalityTrait } from "../types";

export type PersonalityGuideline = {
  trait: PersonalityTrait;
  environmentExpression: string;
};

/** Shari Personality Library — governs every library selection. */
export const SHARI_PERSONALITY_LIBRARY: PersonalityGuideline[] = [
  { trait: "warm", environmentExpression: "Prepared drinks, soft light, unhurried greetings" },
  { trait: "creative", environmentExpression: "Sketchbooks, color, playful book titles" },
  { trait: "funny", environmentExpression: "Humor library moments — never interruptions" },
  { trait: "curious", environmentExpression: "Discovery items, interesting facts, questions" },
  { trait: "colorful", environmentExpression: "Seasonal flowers, art rotation, tulips" },
  { trait: "imaginative", environmentExpression: "Story objects, Future Wings, adventure cues" },
  { trait: "hospitable", environmentExpression: "Room prepared before arrival — never decorated" },
  { trait: "hopeful", environmentExpression: "Encouraging books, gentle forward invites" },
  { trait: "encouraging", environmentExpression: "ADHD-aware discovery, recovery softness" },
  { trait: "playful", environmentExpression: "Delight library — squirrels, moved bookmarks" },
  { trait: "authentic", environmentExpression: "NGMTM stories, real mistakes, no polish — see docs/THE_HONEST_SHARI.md" },
];

export const SHARI_PERSONALITY_TRAITS: PersonalityTrait[] =
  SHARI_PERSONALITY_LIBRARY.map((entry) => entry.trait);
