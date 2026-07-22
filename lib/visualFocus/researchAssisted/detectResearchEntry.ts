/**
 * Research-Assisted Entry detection.
 *
 * Reads a member's plain-language opening line ("I want to map how to make a
 * Loom video but I don't know the steps") and decides whether Spark should
 * offer to research it. The member never has to use research terminology.
 *
 * This is intentionally conservative: when in doubt we offer help rather than
 * assuming the member already knows the content.
 */

import type {
  MapKnowledgeState,
  ResearchEntryChoice,
  ResearchEntryDetection,
} from "./types";

/** Phrases that signal "please research this / I don't know". */
const RESEARCH_SIGNALS: readonly string[] = [
  "i don't know",
  "i dont know",
  "i do not know",
  "not sure how",
  "no idea",
  "figure this out",
  "figure it out",
  "research this",
  "research it",
  "look this up",
  "look it up",
  "researching",
  "find out",
  "how do i",
  "how do you",
  "how to",
  "teach me",
  "help me research",
  "build the map for me",
  "build it for me",
  "build this for me",
  "do it for me",
  "not familiar",
  "never done",
  "i've never",
  "ive never",
  "where do i start",
  "where to start",
  "don't know the steps",
  "dont know the steps",
  "don't know how",
  "dont know how",
  "know the outcome but not",
];

/** Phrases that signal "I only know part of it". */
const PARTIAL_SIGNALS: readonly string[] = [
  "part of it",
  "some of it",
  "i know a bit",
  "know a little",
  "roughly know",
  "sort of know",
  "kind of know",
  "i have some",
  "most of it",
  "not all of it",
  "know some steps",
];

/** Phrases that signal "I already know this". */
const KNOWN_SIGNALS: readonly string[] = [
  "i already know",
  "i know exactly",
  "i have it all",
  "i know all the steps",
  "i've got the steps",
  "ive got the steps",
  "just capture what i say",
  "just write down",
  "i'll tell you",
  "ill tell you",
];

/**
 * Explicit "help me think" requests. Highest priority — the member is asking
 * to reason together, even if they also said "I'm not sure".
 */
const THINK_IT_THROUGH_SIGNALS: readonly string[] = [
  "help me think",
  "think it through",
  "think this through",
  "think through this",
  "talk this through",
  "talk it through",
];

/** Phrases that signal "I'm unsure how to structure this". */
const UNSURE_STRUCTURE_SIGNALS: readonly string[] = [
  "not sure how to structure",
  "how should i structure",
  "how should this be organized",
  "don't know how to organize",
  "dont know how to organize",
  "what should this look like",
  "not sure where things go",
];

function matches(haystack: string, needles: readonly string[]): string[] {
  return needles.filter((n) => haystack.includes(n));
}

/**
 * Best-effort extraction of the topic from a longer sentence, stripping the
 * "I don't know" framing so the map title stays clean.
 */
export function extractTopic(raw: string): string {
  let t = raw.trim();
  if (!t) return "";

  // Remove trailing uncertainty clauses after a comma/but/though.
  t = t.replace(
    /[,;]?\s*(but|though|however|although)\s+i\s+(do not|don't|dont)\s+know.*$/i,
    "",
  );
  t = t.replace(/[,;]?\s*(but|though)\s+i'?m?\s+not\s+sure.*$/i, "");

  // Strip common leading intent phrases.
  t = t.replace(
    /^(i\s+(want|would like|need|'?d like)\s+to\s+)?(create|build|make|map out|map|draw)\s+(a|an|the)?\s*/i,
    "",
  );
  t = t.replace(
    /^(a|an|the)?\s*(mind|decision|relationship|process|journey|timeline|strategy|opportunity|system|priority)\s+map\s+(for|of|about|on)\s+/i,
    "",
  );
  t = t.replace(/^(for|of|about|on)\s+/i, "");
  t = t.replace(/^how\s+to\s+/i, "");

  return t.trim();
}

/**
 * Read the member's opening statement and decide whether to offer research.
 */
export function detectResearchEntry(raw: string): ResearchEntryDetection {
  const text = (raw ?? "").toLowerCase();
  const topic = extractTopic(raw ?? "");

  const thinkHits = matches(text, THINK_IT_THROUGH_SIGNALS);
  const researchHits = matches(text, RESEARCH_SIGNALS);
  const partialHits = matches(text, PARTIAL_SIGNALS);
  const knownHits = matches(text, KNOWN_SIGNALS);
  const unsureHits = matches(text, UNSURE_STRUCTURE_SIGNALS);

  let knowledgeState: MapKnowledgeState;
  let suggestedChoice: ResearchEntryChoice;
  let shouldOfferResearch: boolean;
  const matchedSignals = [
    ...thinkHits,
    ...researchHits,
    ...partialHits,
    ...unsureHits,
  ];

  if (thinkHits.length > 0) {
    // Member explicitly asked to reason it through together.
    knowledgeState = "unsure";
    suggestedChoice = "think-it-through";
    shouldOfferResearch = true;
  } else if (
    knownHits.length > 0 &&
    researchHits.length === 0 &&
    partialHits.length === 0
  ) {
    // Member explicitly has the content.
    knowledgeState = "known";
    suggestedChoice = "build-from-known";
    shouldOfferResearch = false;
  } else if (researchHits.length > 0) {
    knowledgeState = "research";
    suggestedChoice = "research-it";
    shouldOfferResearch = true;
  } else if (partialHits.length > 0) {
    knowledgeState = "partial";
    suggestedChoice = "research-it";
    shouldOfferResearch = true;
  } else if (unsureHits.length > 0) {
    knowledgeState = "unsure";
    suggestedChoice = "think-it-through";
    shouldOfferResearch = true;
  } else {
    // No strong signal. If the topic is a "how to" style / very short,
    // gently offer research; otherwise default to building from what they know.
    const looksProcedural =
      /^how\b/i.test(raw ?? "") || /\bhow to\b/i.test(raw ?? "");
    knowledgeState = "unsure";
    suggestedChoice = looksProcedural ? "research-it" : "build-from-known";
    shouldOfferResearch = true;
  }

  return {
    topic,
    knowledgeState,
    shouldOfferResearch,
    suggestedChoice,
    matchedSignals,
  };
}
