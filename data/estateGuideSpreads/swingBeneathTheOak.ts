/**
 * Spark Estate Guidebook — The Swing Beneath the Oak spread.
 * Placed immediately before the Treehouse Possibility House section.
 */

import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";
import type { EstateGuideSpreadData } from "@/lib/estate/estateGuideEditorial";

export const SWING_BENEATH_THE_OAK_GUIDE_SPREAD: EstateGuideSpreadData = {
  id: "the-swing-beneath-the-oak",
  title: "The Swing Beneath the Oak",
  guideSubtitle: "Spark Estate Guide",
  openingLine: "Welcome to The Swing Beneath the Oak.",
  epigraph: "Where the heart remembers what the mind has forgotten.",
  image: ESTATE_ROOM_BG.swingBeneathTheOak,
  imagePlaceId: "the-swing-beneath-the-oak",
  whisperFromEstate:
    "If you visit often enough, you may notice the swing never seems to stop moving completely — as though every quiet hope ever shared here leaves behind the faintest ripple.",
  guideQuote:
    "There is nothing to accomplish here. Stay for as long — or as briefly — as feels right.",
  blocks: [
    {
      type: "story",
      paragraphs: [
        "Some places ask you to think.",
        "Others ask you to decide.",
        "This place asks for neither.",
        "The Swing Beneath the Oak is one of the quietest places in Spark Estate. Here, the gentle rhythm of the swing, the sound of the water, and the shade of the old oak invite you to slow down without asking anything of you.",
        "There is no agenda here.",
        "Sometimes the greatest clarity comes when we stop searching for it.",
      ],
    },
    {
      type: "why-this-room-exists",
      paragraphs: ["You may find yourself drawn here when:"],
      bullets: [
        "your mind feels full but you don't want to solve anything yet",
        "you need a gentle place to process emotions",
        "you're waiting for clarity before making an important decision",
        "you want to remember someone you love",
        "you simply need a few peaceful moments before returning to your day",
      ],
      closingParagraphs: [
        "Many members discover that answers arrive naturally once they stop trying so hard to force them.",
      ],
    },
    {
      type: "estate-history",
      paragraphs: [
        "The Swing Beneath the Oak was one of the earliest dreams for Spark Estate.",
        "Long before many of the buildings existed, there was a simple vision: a large tree overlooking quiet water where someone could sit without expectation.",
        "As the Estate slowly grew, more exciting places were imagined first — libraries, observatories, gardens, studios, and gathering spaces. Yet the oak remained untouched.",
        "Years later, while walking the property plans, it became clear that the Estate still lacked one important kind of place.",
        "Not somewhere to learn.",
        "Not somewhere to create.",
        "Simply somewhere to breathe.",
        "The swing was built as a reminder that progress is not measured only by movement. Sometimes the most meaningful moments come while gently swaying beneath an old tree, watching light dance across the water.",
      ],
    },
    {
      type: "estate-secret",
      paragraphs: [
        "Very few visitors notice the small heart carved into the oak.",
        "It simply reads:",
        "SW loves RH",
        "No guide ever explains who carved it.",
        "Some believe it appeared long before the Estate was built.",
        "Others quietly smile, believing they already know.",
        "Whatever its origin, it reminds us that every meaningful place carries the fingerprints of love.",
      ],
    },
    {
      type: "reflection",
      paragraphs: [
        "Life isn't lived only in the moments when we're moving forward. Sometimes it quietly changes us while we're sitting still.",
      ],
      attribution: ["— Spark"],
    },
    {
      type: "did-you-know",
      paragraphs: ["Many members enjoy:"],
      bullets: [
        "Sitting quietly without any destination in mind",
        "Listening to soft instrumental music while watching the water",
        "Reflecting on someone they miss or someone they appreciate",
        "Watching the changing seasons from the same familiar place",
        "Beginning or ending their visit to the Estate here",
        "Letting difficult thoughts settle before moving on to another space",
      ],
      closingParagraphs: [
        "Spark's gentle suggestion: There is nothing to accomplish here. Stay for as long — or as briefly — as feels right. Sometimes the swing gives you exactly what you didn't realize you needed.",
      ],
    },
  ],
};
