/**
 * Spark Estate Guidebook™ — Ocean Conservatory™ spread.
 * Placed immediately before the Treehouse Possibility House section.
 */

import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";
import type { EstateGuideSpreadData } from "@/lib/estate/estateGuideEditorial";

export const OCEAN_CONSERVATORY_GUIDE_SPREAD: EstateGuideSpreadData = {
  id: "ocean-conservatory",
  title: "Ocean Conservatory™",
  guideSubtitle: "Spark Estate Guide",
  openingLine: "Welcome to the Ocean Conservatory.",
  epigraph: "Where the rhythm of the sea quiets the mind.",
  image: ESTATE_ROOM_BG.oceanConservatory,
  imagePlaceId: "conservatory",
  blocks: [
    {
      type: "story",
      paragraphs: [
        "There is something extraordinary about watching life move beneath the surface of the water.",
        "Nothing rushes.",
        "Nothing competes.",
        "Every movement feels intentional, graceful, and unhurried.",
        "The Ocean Conservatory was created for those moments when life has become noisy, overwhelming, or mentally exhausting.",
        "Here, the world slows down.",
        "Your breathing naturally becomes deeper, your thoughts become quieter, and your perspective begins to widen.",
        "This isn't simply a room with a beautiful aquarium.",
        "It is a place to remember that clarity often arrives after stillness.",
      ],
    },
    {
      type: "why-this-room-exists",
      paragraphs: ["You may find yourself drawn here when you..."],
      bullets: [
        "feel mentally overwhelmed",
        "need a break from constant thinking",
        "are carrying too many ideas at once",
        "need to recharge before returning to work",
        "want to read quietly",
        "need inspiration without pressure",
        "simply want to sit in peaceful silence",
      ],
      closingParagraphs: [
        "Many members discover that only a few minutes here helps them think more clearly than forcing themselves to keep working.",
      ],
    },
    {
      type: "estate-history",
      paragraphs: [
        "The Ocean Conservatory was never part of the original architectural plans for the Estate.",
        "During construction, one of the designers remarked that while the Estate had beautiful gardens, forests, libraries, and gathering spaces, it had no place where people could experience the calming rhythm of moving water without stepping outdoors.",
        "Rather than building another room, the team imagined creating an entire underwater world that members could observe while remaining warm, comfortable, and completely undisturbed.",
        "What began as a single viewing wall slowly became one of the Estate's most peaceful spaces.",
        "Over time, members discovered something unexpected.",
        "The fish never seemed to be performing.",
        "They were simply living.",
        "Watching that quiet, natural rhythm reminded many visitors that life doesn't always need to be faster to become more meaningful.",
        "Sometimes the next breakthrough arrives only after we become still enough to notice it.",
      ],
    },
    {
      type: "estate-secret",
      paragraphs: [
        "If you remain here long enough, you'll notice something subtle.",
        "No two visits ever look exactly the same.",
        "Different fish appear.",
        "Different schools swim by.",
        "The light changes throughout the day.",
        "Even the reflections across the room are constantly moving.",
        "The Conservatory quietly reminds us that although life may sometimes feel repetitive, it is always changing in ways we rarely notice.",
      ],
    },
    {
      type: "reflection",
      paragraphs: [
        "When your thoughts begin racing faster than your heart can follow, don't force yourself to think harder.",
        "Come somewhere that reminds you how peaceful movement can be.",
        "Sometimes the clearest answers arrive after the mind finally becomes quiet.",
      ],
      attribution: ["— Spark"],
    },
    {
      type: "did-you-know",
      paragraphs: ["Recommended activities:"],
      bullets: [
        "Quiet reflection",
        "Reading",
        "Focus music",
        "Gentle conversation",
        "Listening sessions",
        "Meditation",
        "Journaling",
        "Simply watching the ocean",
      ],
      closingParagraphs: [
        "Spark may naturally recommend this space when a member feels overwhelmed, mentally tired, emotionally overloaded, stuck, anxious, or in need of perspective.",
      ],
    },
  ],
};
