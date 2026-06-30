/**
 * Opening Phrase Library™ — natural Shari conversation starters.
 * Rotates so Spark does not sound repetitive.
 *
 * @see docs/SPARK_WISDOM_LAYER_FRAMEWORK.md#spec-131--outcome-discovery
 */

export type OpeningPhraseCategory =
  | "welcome"
  | "returning"
  | "gentle_invite"
  | "outcome_oriented";

export type OpeningPhrase = {
  id: string;
  text: string;
  category: OpeningPhraseCategory;
};

/** 28 natural openers — Relationship Constitution / Shari test */
export const OPENING_PHRASE_LIBRARY: readonly OpeningPhrase[] = [
  { id: "welcome-01", text: "How can I help today?", category: "welcome" },
  { id: "welcome-02", text: "What's on your mind?", category: "welcome" },
  { id: "welcome-03", text: "I'm here — what brought you in today?", category: "welcome" },
  { id: "welcome-04", text: "Good to see you. What would feel useful right now?", category: "welcome" },
  { id: "welcome-05", text: "Where would you like to start?", category: "welcome" },
  { id: "welcome-06", text: "Tell me what's in front of you today.", category: "welcome" },
  { id: "welcome-07", text: "What's sitting with you this morning?", category: "welcome" },
  { id: "welcome-08", text: "What do you need a thinking partner for today?", category: "welcome" },
  { id: "gentle-01", text: "No rush — what's on your heart about work today?", category: "gentle_invite" },
  { id: "gentle-02", text: "We can take this one piece at a time. What's first?", category: "gentle_invite" },
  { id: "gentle-03", text: "I'm listening. What would help most right now?", category: "gentle_invite" },
  { id: "gentle-04", text: "Whatever you're carrying — we can sort through it together.", category: "gentle_invite" },
  { id: "gentle-05", text: "You don't have to have it figured out. What's stirring?", category: "gentle_invite" },
  { id: "return-01", text: "Welcome back. Want to pick up where we left off, or start fresh?", category: "returning" },
  { id: "return-02", text: "Good to have you here again. What's alive for you today?", category: "returning" },
  { id: "return-03", text: "I'm glad you're back. What matters most today?", category: "returning" },
  { id: "return-04", text: "Last time we talked, you were working through something — or we can begin somewhere new.", category: "returning" },
  { id: "outcome-01", text: "What would a good outcome look like for you today?", category: "outcome_oriented" },
  { id: "outcome-02", text: "If today went really well, what would be different by tonight?", category: "outcome_oriented" },
  { id: "outcome-03", text: "What are you hoping will feel clearer when we're done?", category: "outcome_oriented" },
  { id: "outcome-04", text: "What would success look like from where you're sitting?", category: "outcome_oriented" },
  { id: "outcome-05", text: "Before we dive in — what are you really hoping happens here?", category: "outcome_oriented" },
  { id: "welcome-09", text: "What's the one thing you'd love off your plate?", category: "welcome" },
  { id: "welcome-10", text: "What feels most important — or most stuck — right now?", category: "welcome" },
  { id: "gentle-06", text: "However you show up today is fine. What's going on?", category: "gentle_invite" },
  { id: "outcome-06", text: "What would 'this worked' mean for you?", category: "outcome_oriented" },
  { id: "welcome-11", text: "I'm here with you. What do you want to untangle?", category: "welcome" },
  { id: "gentle-07", text: "Let's start wherever you are. What's true today?", category: "gentle_invite" },
] as const;

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function pickOpeningPhrase(
  seed: string,
  category?: OpeningPhraseCategory,
): string {
  const pool = category
    ? OPENING_PHRASE_LIBRARY.filter((p) => p.category === category)
    : OPENING_PHRASE_LIBRARY;
  if (!pool.length) return OPENING_PHRASE_LIBRARY[0].text;
  const index = hashSeed(seed) % pool.length;
  return pool[index].text;
}

export function pickOpeningPhraseEntry(
  seed: string,
  category?: OpeningPhraseCategory,
): OpeningPhrase {
  const pool = category
    ? OPENING_PHRASE_LIBRARY.filter((p) => p.category === category)
    : OPENING_PHRASE_LIBRARY;
  const index = hashSeed(seed) % pool.length;
  return pool[index] ?? OPENING_PHRASE_LIBRARY[0];
}

export function openingPhraseCount(): number {
  return OPENING_PHRASE_LIBRARY.length;
}
