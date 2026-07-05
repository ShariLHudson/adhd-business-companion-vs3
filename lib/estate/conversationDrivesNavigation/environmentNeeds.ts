/**
 * Environment need lexicon — natural language → canonical Estate places.
 *
 * All placeIds validated against Estate Directory at evaluation time.
 * Member-facing names always come from registry officialName — never invented.
 */

import type { EnvironmentNeedDefinition, EnvironmentNeedId } from "./types";

/**
 * Ordered lexicon — more specific needs before broader ones where patterns overlap.
 *
 * Example mappings (member language → canonical places):
 * - quieter → Gardens, Library, Reading Nook
 * - think → Observatory, Library
 * - fresh air → Garden Path, Woodland Path, Back Deck
 * - focus → Creative Studio, Momentum Builder, Library
 * - relax → Coffee House, Peaceful Places, Porch Swing
 * - inspiration → Creative Studio, Music Room, Conservatory
 * - journal → Journal, Reading Nook, Conservatory
 */
export const ENVIRONMENT_NEED_LEXICON: readonly EnvironmentNeedDefinition[] = [
  {
    id: "journal",
    label: "journaling / reflection writing",
    patterns: [
      /\b(?:want to|need to|like to|i'?d like to)\s+journal\b/i,
      /\b(?:write in my|open my)\s+journal\b/i,
      /\bjournal(?:ing)?\s+(?:together|with you|somewhere)\b/i,
      /\b(?:somewhere|place).{0,30}journal\b/i,
    ],
    placeIds: ["journal", "reading-nook", "conservatory"],
    offerIntro:
      "A few places on the Estate that hold space for journaling:",
  },
  {
    id: "fresh-air",
    label: "fresh air / outdoors",
    patterns: [
      /\b(?:need|want|could use).{0,20}fresh\s+air\b/i,
      /\b(?:get|be)\s+outside\b/i,
      /\b(?:outside|outdoors|open\s+air)\b/i,
      /\b(?:garden\s+walk|woodland|trail)\b/i,
      /\b(?:breathe|air).{0,25}(?:outside|outdoors|garden)\b/i,
    ],
    placeIds: ["garden-path", "woodland-path", "back-deck"],
    offerIntro: "A few open-air spots on the Estate:",
  },
  {
    id: "focus",
    label: "focus / deep work",
    patterns: [
      /\b(?:need to|want to|have to|trying to)\s+focus\b/i,
      /\b(?:need|want).{0,20}focus\b/i,
      /\b(?:deep\s+work|get\s+focused|stay\s+focused)\b/i,
      /\b(?:concentrate|concentration|distraction[- ]free)\b/i,
      /\b(?:boardroom|workshop).{0,20}(?:focus|work|think)\b/i,
    ],
    placeIds: ["creative-studio", "momentum-builder", "library"],
    offerIntro: "A few places on the Estate that support focus:",
  },
  {
    id: "inspiration",
    label: "inspiration / creative spark",
    patterns: [
      /\b(?:need|want|looking for).{0,20}inspiration\b/i,
      /\b(?:feel\s+)?inspired\b/i,
      /\b(?:creative\s+spark|something\s+beautiful|stir\s+my\s+imagination)\b/i,
      /\b(?:art|music|butterfl).{0,30}(?:inspire|inspiration)\b/i,
    ],
    placeIds: ["creative-studio", "music-room", "conservatory"],
    offerIntro: "A few places on the Estate that might spark something:",
  },
  {
    id: "relax",
    label: "relax / unwind",
    patterns: [
      /\b(?:want to|need to|like to|i'?d like to|help me)\s+relax\b/i,
      /\b(?:want to|need to|like to|help me)\s+unwind\b/i,
      /\b(?:wind\s+down|take\s+it\s+easy|loosen\s+up)\b/i,
      /\b(?:hammock|pool|lazy).{0,25}(?:relax|rest)\b/i,
    ],
    placeIds: ["coffee-house", "peaceful-places"],
    offerIntro: "A few easy places on the Estate to unwind:",
  },
  {
    id: "think",
    label: "thinking / sorting through",
    patterns: [
      /\b(?:want to|need to|like to|i'?d like to)\s+think\b/i,
      /\b(?:need to|want to)\s+think\s+(?:about|through|this)\b/i,
      /\b(?:think\s+this\s+through|sort\s+(?:this\s+)?through|figure\s+(?:this\s+)?out)\b/i,
      /\b(?:ponder|mull\s+(?:this\s+)?over)\b/i,
    ],
    placeIds: ["observatory", "library", "reading-nook"],
    offerIntro: "A few places on the Estate that give you room to think:",
  },
  {
    id: "quieter",
    label: "quieter / calmer atmosphere",
    patterns: [
      /\b(?:want|need).{0,25}(?:somewhere\s+)?quiet(?:er)?\b/i,
      /\b(?:somewhere|some\s+place|a\s+place).{0,40}(?:quiet|quieter|peaceful|calm)\b/i,
      /\b(?:quiet|quieter|peaceful|calm).{0,40}(?:somewhere|some\s+place|spot|room)\b/i,
      /\b(?:less\s+noise|more\s+quiet|hush|stillness)\b/i,
      /\b(?:stressed|overwhelm|anxious).{0,50}(?:quiet|peaceful|calm)\b/i,
    ],
    placeIds: ["gardens", "library", "reading-nook"],
    offerIntro: "A few quieter places on the Estate:",
  },
];

export function getEnvironmentNeedDefinition(
  needId: EnvironmentNeedId,
): EnvironmentNeedDefinition | undefined {
  return ENVIRONMENT_NEED_LEXICON.find((entry) => entry.id === needId);
}
