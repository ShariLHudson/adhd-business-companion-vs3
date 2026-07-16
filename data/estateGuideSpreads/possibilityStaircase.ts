/**
 * Spark Estate Guidebook — The Treehouse Possibility Staircase spread.
 */

import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";
import type { EstateGuideSpreadData } from "@/lib/estate/estateGuideEditorial";

export const POSSIBILITY_STAIRCASE_GUIDE_SPREAD: EstateGuideSpreadData = {
  id: "house-possibility-staircase",
  title: "The Treehouse Possibility Staircase",
  guideSubtitle: "Where Every Step Opens a New Possibility",
  epigraph:
    "You don't have to see the entire journey. You only have to be willing to take the next step.",
  image: estateBackgroundPath(
    "treehouse-possibility-staircase-window-reading-nook-background.png",
  ),
  imagePlaceId: "house-possibility-staircase",
  whisperFromEstate:
    "Every remarkable journey is built from ordinary steps taken with extraordinary courage.",
  guideQuote:
    "The staircase doesn't ask you to leap to the top. It simply invites you to discover what the next step can see.",
  blocks: [
    {
      type: "story-of-possibility-studio",
      paragraphs: [
        "When the original Treehouse Possibility House was first built, there was no grand staircase.",
        "Only a simple ladder.",
        "Visitors climbed carefully, carrying notebooks, dreams, sketches, and questions that had followed them for years.",
        "As more people returned, the caretaker noticed something.",
        "No one rushed.",
        "Halfway up, they often stopped.",
        "They leaned against the railing.",
        "They looked out across the valley.",
        "They smiled.",
        "Some even turned around and climbed back down again, not because they had given up, but because simply climbing had reminded them that progress didn't have to happen all at once.",
        "Years later, the ladder was replaced with the staircase you see today.",
        "Built around the living tree, it was designed to honor a simple truth:",
        "Growth should never feel rushed.",
        "Every step invites you to notice something you couldn't see from the one before.",
      ],
    },
    {
      type: "why-this-room-exists",
      paragraphs: [
        "The Treehouse Possibility Staircase isn't simply a way to reach another room.",
        "It's a place to pause.",
        "To breathe.",
        "To gather your thoughts before continuing.",
        "Many visitors stop here when they:",
      ],
      bullets: [
        "Feel overwhelmed by a decision.",
        "Need a moment of quiet.",
        "Want to admire the view.",
        "Are unsure what comes next.",
        "Need to remind themselves that progress happens one step at a time.",
      ],
      closingParagraphs: ["Sometimes the journey itself is the destination."],
    },
    {
      type: "look-closely",
      paragraphs: [
        "The staircase was intentionally built around the living tree.",
        "Its trunk passes through the heart of the Treehouse, quietly reminding us that every meaningful life needs strong roots before it can reach great heights.",
        "The large windows invite sunlight to dance across the wooden steps throughout the day.",
        "Morning light feels hopeful.",
        "Evening light feels reflective.",
        "Every visit has its own atmosphere.",
        "Take a moment to notice the details.",
        "The Treehouse always has something new to show those who slow down.",
      ],
    },
    {
      type: "estate-traditions",
      paragraphs: [
        "Many visitors place one hand lightly on the railing before climbing the next step.",
        "Not because it's necessary.",
        "Because it reminds them to move forward with intention rather than urgency.",
        "The Estate has never measured progress by speed.",
        "Only by courage.",
      ],
    },
    {
      type: "estate-secret",
      paragraphs: [
        "Stand halfway up the staircase and look back toward the entrance.",
        "The view changes completely.",
        "The same room.",
        "The same Treehouse.",
        "A completely different perspective.",
        "Visitors often say this tiny pause reminds them that life is much the same.",
        "Sometimes changing your view changes everything.",
      ],
    },
    {
      type: "from-shari",
      paragraphs: [
        "For years I believed I needed to know the entire path before taking the first step.",
        "Life has taught me something much kinder.",
        "Clarity usually arrives while we're moving, not while we're waiting.",
        "Looking back, every meaningful chapter of my life began with one small step I almost didn't take.",
      ],
      attribution: ["— Shari Hudson"],
    },
    {
      type: "before-you-continue",
      paragraphs: [
        "As you reach the top of the staircase, pause for just a moment.",
        "Take one slow breath.",
        "Look out across the valley.",
        "Notice how much farther you can see than when you first entered the Treehouse.",
        "That is the quiet gift of perspective.",
        "Sometimes the only thing standing between where we are and where we're going...",
        "...is one more step.",
      ],
    },
  ],
};
