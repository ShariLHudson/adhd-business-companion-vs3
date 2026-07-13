/**
 * Match chat phrases that should open an in-destination How to Use guide.
 */

import { BUSINESS_ESTATE_HOW_TO_GUIDE } from "./businessEstateHowToContent";
import { CHAMBER_HOW_TO_GUIDE } from "./chamberHowToContent";
import type {
  EstateHowToGuideContent,
  EstateHowToGuideId,
  EstateHowToGuideMatch,
} from "./types";

type PhraseRule = {
  guideId: EstateHowToGuideId;
  phrases: string[];
  shariReply: string;
};

const RULES: PhraseRule[] = [
  {
    guideId: "chamber-of-momentum",
    phrases: [
      "how do i use the chamber",
      "how do i use chamber of momentum",
      "how does the chamber work",
      "what is the chamber for",
      "what is the chamber of momentum for",
      "how to use the chamber",
      "chamber how to",
      "difference between the board and chamber",
      "difference between board and chamber",
      "board vs chamber",
      "chamber vs board",
      "what's the difference between the board and the chamber",
    ],
    shariReply:
      "I've opened How to Use the Chamber — it explains when to visit, how to get help, and how the Chamber differs from the Board, Research, and me.",
  },
  {
    guideId: "my-business-estate",
    phrases: [
      "how do i use my business estate",
      "how do i use business estate",
      "what should i put in my business estate",
      "what is my business estate for",
      "what is business estate for",
      "how does my business estate work",
      "how to use my business estate",
      "business estate how to",
    ],
    shariReply:
      "I've opened How to Use My Business Estate — it covers the six Business Areas, how to work here, and how Research, Chamber, Board, and Cartography fit.",
  },
];

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[?!.,]+/g, "")
    .replace(/\s+/g, " ");
}

export function matchEstateRoomHowToGuide(
  query: string,
): EstateHowToGuideMatch | null {
  const normalized = normalize(query);
  if (!normalized) return null;

  let best: EstateHowToGuideMatch | null = null;
  let bestLen = 0;

  for (const rule of RULES) {
    for (const phrase of rule.phrases) {
      const p = normalize(phrase);
      if (normalized.includes(p) && p.length > bestLen) {
        bestLen = p.length;
        best = {
          guideId: rule.guideId,
          matchedPhrase: phrase,
          shariReply: rule.shariReply,
        };
      }
    }
  }

  return best;
}

export function getEstateHowToGuideById(
  guideId: EstateHowToGuideId,
): EstateHowToGuideContent {
  return guideId === "chamber-of-momentum"
    ? CHAMBER_HOW_TO_GUIDE
    : BUSINESS_ESTATE_HOW_TO_GUIDE;
}
