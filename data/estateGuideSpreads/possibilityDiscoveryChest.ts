/**
 * Spark Estate Guidebook — The Treehouse Discovery Chest spread.
 */

import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";
import type { EstateGuideSpreadData } from "@/lib/estate/estateGuideEditorial";

export const POSSIBILITY_DISCOVERY_CHEST_GUIDE_SPREAD: EstateGuideSpreadData = {
  id: "house-possibility-discovery-chest",
  title: "The Treehouse Discovery Chest",
  guideSubtitle: "Where Curiosity Is Always Rewarded",
  epigraph: "The greatest treasures are rarely the ones we were searching for.",
  image: estateBackgroundPath("treehouse-possibility-discovery-chest-background.png"),
  imagePlaceId: "house-possibility-discovery-chest",
  whisperFromEstate:
    "Stay curious. The next small discovery may quietly change everything.",
  guideQuote:
    "Some treasures aren't hidden because they're difficult to find. They're hidden because wonder is meant to be discovered, not delivered.",
  blocks: [
    {
      type: "story-of-possibility-studio",
      paragraphs: [
        "Every old house has a place where forgotten things seem to gather.",
        "The Treehouse has the Discovery Chest.",
        "Tucked quietly beneath the staircase, it almost appears to have been overlooked.",
        "That was intentional.",
        "Many years ago, visitors to the Treehouse began leaving behind small treasures.",
        "Not valuables.",
        "Moments.",
        "A handwritten note that brought hope during a difficult season.",
        "A favorite quote.",
        "A pressed flower collected during a morning walk through the Estate.",
        "A tiny sketch.",
        "A photograph.",
        "A bookmark.",
        "A recipe.",
        "A postcard.",
        "Something ordinary that had become extraordinary because of the story attached to it.",
        "As the years passed, the collection quietly grew.",
        "No one could remember who had started it.",
        "Everyone simply added to it.",
        "Eventually the Estate's caretakers placed everything inside an old wooden chest beneath the staircase.",
        "It has remained there ever since.",
        "Visitors say the Discovery Chest has a curious way of offering exactly the right treasure at exactly the right moment.",
        "No one has ever explained how.",
        "The Estate simply smiles...",
        "...and keeps its secrets.",
      ],
    },
    {
      type: "why-this-room-exists",
      paragraphs: [
        "The Discovery Chest isn't a place to accomplish something.",
        "It's a place to experience wonder.",
        "You might visit when:",
      ],
      bullets: [
        "You need encouragement.",
        "You feel discouraged.",
        "You're curious.",
        "You want a surprise.",
        "You're celebrating something.",
        "You simply feel like wandering.",
      ],
      closingParagraphs: [
        "Unlike most places in the Estate, you never quite know what you'll discover here.",
        "That uncertainty is part of its charm.",
      ],
    },
    {
      type: "opening-the-chest",
      paragraphs: ["There is no ceremony.", "Simply lift the lid.", "Inside you may find:"],
      bullets: [
        "A handwritten letter.",
        "A forgotten memory.",
        "A journal prompt.",
        "A beautiful photograph.",
        "An inspiring quote.",
        "A seasonal keepsake.",
        "A bookmark.",
        "A recipe.",
        "A challenge.",
        "A piece of encouragement.",
        "Or perhaps something the Estate quietly saved because it knew you would need it one day.",
      ],
      closingParagraphs: ["No two visits are ever exactly alike."],
    },
    {
      type: "estate-traditions",
      paragraphs: [
        "Longtime visitors have a tradition.",
        "Before opening the chest, they pause for a moment and silently ask themselves:",
        "\"What do I most need today?\"",
        "They don't always receive the answer they expected.",
        "More often...",
        "they receive the one they needed.",
      ],
    },
    {
      type: "estate-secret",
      paragraphs: [
        "There is an old story shared among Estate caretakers.",
        "They say the Discovery Chest is never completely empty.",
        "Even when it appears nearly bare...",
        "there is always room for one more surprise.",
        "No one has ever seen anyone refill it.",
        "Yet somehow...",
        "there is always something waiting.",
        "Perhaps curiosity has a way of creating its own treasures.",
      ],
    },
    {
      type: "from-shari",
      paragraphs: [
        "Some of the greatest gifts in my life arrived completely unplanned.",
        "They weren't on my calendar or part of a carefully organized strategy.",
        "They appeared because I stayed curious enough to notice them.",
        "The Discovery Chest reminds me that life still has wonderful surprises waiting for those who continue exploring.",
      ],
      attribution: ["— Shari Hudson"],
    },
    {
      type: "before-you-close-lid",
      paragraphs: [
        "Take one last look inside.",
        "Not because you're searching for something more...",
        "But because life has a beautiful habit of rewarding those who take one extra moment to notice.",
        "Then gently close the lid.",
        "Trust that another discovery will be waiting when the time is right.",
        "The Estate has always understood that anticipation is part of the treasure.",
      ],
    },
    {
      type: "hidden-estate-legend",
      paragraphs: [
        "Among longtime visitors, there is a quiet belief that no two members have ever found exactly the same collection inside the Discovery Chest.",
        "The chest doesn't reveal what everyone wants.",
        "It reveals what each person is ready to discover.",
        "And perhaps that's why so many people find themselves returning.",
        "Not because they know what they'll find...",
        "But because they know the Estate has a remarkable way of saying,",
        "\"I thought you might need this today.\"",
      ],
    },
  ],
};
