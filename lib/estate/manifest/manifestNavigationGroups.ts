/**
 * Ambiguous destination groups — never guess when multiple places match.
 * Supplemental to manifest aliases; subplaces not yet in manifest stay here.
 *
 * @see docs/estate/ESTATE_PLACE_MASTER_MANIFEST.json
 */

import type { EstateManifestAmbiguityGroup } from "./types";

/** User phrase → numbered choices (never random selection). */
export const MANIFEST_NAVIGATION_AMBIGUITY_GROUPS: readonly EstateManifestAmbiguityGroup[] =
  [
    {
      id: "garden",
      patterns: [/^(?:the\s+)?garden$/i, /^(?:the\s+)?gardens$/i],
      intro: "We have a few garden spaces. Which one would you like?",
      placeIds: [
        "estate-gardens",
        "gardens",
        "conservatory",
        "greenhouse",
        "reflection-tree-main",
      ],
    },
    {
      id: "reading-nook",
      patterns: [/^(?:the\s+)?reading nook$/i, /^(?:the\s+)?nook$/i],
      intro: "We have a couple of reading nooks. Which one would you like?",
      placeIds: ["reading-nook", "stairway-reading-nook", "window-seat"],
    },
    {
      id: "telescope",
      patterns: [
        /^(?:the\s+)?telescope$/i,
        /\b(?:take me to|go to|show me|visit)\s+(?:the\s+)?telescope\b/i,
      ],
      intro: "A couple of places with a telescope — which one?",
      placeIds: [
        "observatory-telescope-window",
        "house-possibility-telescope-deck",
      ],
    },
    {
      id: "observatory",
      patterns: [
        /^(?:the\s+)?observatory$/i,
        /\b(?:take me to|go to|show me|visit)\s+(?:the\s+)?observatory\b/i,
      ],
      intro:
        "I found several observatory spaces. Which would you like?",
      placeIds: [
        "observatory",
        "house-possibility-observatory",
        "house-possibility-telescope-deck",
      ],
    },
    {
      id: "conservatory",
      patterns: [
        /^(?:the\s+)?conservatory$/i,
        /\b(?:take me to|go to|show me|visit)\s+(?:the\s+)?conservatory\b/i,
      ],
      intro:
        "I found a few conservatory spaces. Did you mean the Aquarium Room or the Greenhouse?",
      placeIds: ["conservatory", "greenhouse"],
    },
    {
      id: "pond",
      patterns: [/^(?:the\s+)?pond$/i],
      intro: "We have a couple of pond spaces — which sounds better?",
      placeIds: ["seat-at-pond"],
    },
  ];
