/**
 * Spark Estate Guidebook™ — The Treehouse Cabinet of Chapters™ spread.
 * Philosophy chapter — among the longest in the guidebook; members return as life grows.
 */

import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";
import type { EstateGuideSpreadData } from "@/lib/estate/estateGuideEditorial";

export const POSSIBILITY_CABINET_OF_CHAPTERS_GUIDE_SPREAD: EstateGuideSpreadData = {
  id: "house-possibility-cabinet-of-chapters",
  title: "The Treehouse Cabinet of Chapters",
  guideSubtitle: "Where Every Life Becomes a Story Worth Remembering",
  epigraph:
    "The story of your life isn't written all at once. It is written one chapter, one memory, one choice at a time.",
  image: estateBackgroundPath(
    "treehouse-possibility-cabinet-of-chapters-background.png",
  ),
  imagePlaceId: "house-possibility-cabinet-of-chapters",
  whisperFromEstate:
    "Your story is not measured by how many chapters you've finished... but by your willingness to keep writing the next one.",
  guideQuote:
    "Every life becomes a masterpiece not because every chapter is perfect, but because every chapter becomes part of a story worth telling.",
  blocks: [
    {
      type: "story-of-possibility-studio",
      paragraphs: [
        "Among all the rooms in the Treehouse, none has inspired more quiet conversation than the Cabinet of Chapters.",
        "No blueprint for the cabinet has ever been found.",
        "No craftsman ever signed it.",
        "It has simply been here for as long as anyone can remember.",
        "Early visitors believed it was a place to store journals and keepsakes.",
        "They quickly discovered it was something much more remarkable.",
        "Every drawer represented a different chapter of life.",
      ],
      bullets: [
        "Family.",
        "Friendships.",
        "Dreams.",
        "Lessons.",
        "Gratitude.",
        "Purpose.",
        "Character.",
        "Legacy.",
      ],
      closingParagraphs: [
        "Each drawer became a place where meaningful moments could be preserved—not because they were perfect, but because they mattered.",
        "Over the years, visitors noticed something curious.",
        "The cabinet never seemed completely full.",
        "No matter how many stories were added...",
        "there always seemed to be room for another.",
        "Perhaps that's because a meaningful life is never finished.",
        "There is always another chapter waiting to be written.",
      ],
    },
    {
      type: "why-this-room-exists",
      paragraphs: [
        "The Cabinet of Chapters invites you to reconnect with the story you're already living.",
        "You might open a drawer to:",
      ],
      bullets: [
        "Remember an important milestone.",
        "Celebrate a quiet accomplishment.",
        "Revisit a meaningful lesson.",
        "Preserve a treasured family memory.",
        "Capture a dream before it's forgotten.",
        "Reflect on how much you've grown.",
        "Discover patterns you never noticed before.",
      ],
      closingParagraphs: [
        "Every drawer tells part of your story.",
        "Together, they remind you that your life is far richer than any single moment.",
      ],
    },
    {
      type: "the-drawers",
      paragraphs: [
        "Each drawer has its own purpose.",
        "Some hold memories.",
        "Some preserve dreams.",
        "Others quietly gather wisdom from ordinary days.",
        "None are ranked.",
        "None are more important than another.",
        "Life isn't measured by achievements alone.",
        "It is shaped by relationships, kindness, courage, curiosity, gratitude, and the countless moments that often go unnoticed.",
        "The Cabinet honors them all.",
      ],
    },
    {
      type: "still-becoming",
      paragraphs: [
        "One drawer is unlike the others.",
        "Its name is simple.",
        "Still Becoming.",
        "It isn't filled with memories.",
        "It isn't meant to be.",
        "This drawer remains open for everything life has yet to reveal.",
      ],
      bullets: [
        "Future dreams.",
        "Unexpected friendships.",
        "New adventures.",
        "Fresh ideas.",
        "Quiet transformations.",
      ],
      closingParagraphs: [
        "The Estate believes there is no age at which possibility ends.",
        "As long as we are living...",
        "we are still becoming.",
      ],
    },
    {
      type: "estate-traditions",
      paragraphs: [
        "Visitors are encouraged not to choose a drawer with their minds.",
        "Instead, they simply notice which one draws their attention first.",
        "It is remarkable how often that first drawer reflects exactly what they need in that season of life.",
        "Six months later...",
        "a completely different drawer may quietly call their name.",
      ],
    },
    {
      type: "estate-secret",
      paragraphs: [
        "There is an old tradition among the Estate caretakers.",
        "Late in the evening, when the Treehouse has grown quiet and only the lanterns remain lit, one drawer is sometimes found slightly open.",
        "No one remembers opening it.",
        "Inside is never anything dramatic.",
        "Perhaps a handwritten note.",
        "An old photograph.",
        "A pressed flower.",
        "A forgotten quote.",
        "A letter.",
        "Something beautifully ordinary.",
        "Yet almost everyone who discovers it says the same thing.",
        "\"It was exactly what I needed today.\"",
        "No one has ever explained why.",
        "Around the Estate they simply smile and say...",
        "\"The Cabinet remembers.\"",
      ],
    },
    {
      type: "from-shari",
      paragraphs: [
        "For many years I believed my life was made up of disconnected chapters—some joyful, some heartbreaking, some wonderfully unexpected.",
        "Looking back, I can see that every season, every challenge, and every triumph was helping write the same story.",
        "The Cabinet of Chapters reminds me that nothing meaningful is ever wasted.",
        "Every chapter has a purpose, even when we don't understand it yet.",
      ],
      attribution: ["— Shari Hudson"],
    },
    {
      type: "before-you-leave",
      paragraphs: [
        "Before closing the drawer you've been exploring...",
        "Pause for just a moment.",
        "Ask yourself one quiet question:",
        "\"If today became one more chapter in my story... what would I want it to say?\"",
        "You don't need to write the entire book today.",
        "Only today's page.",
        "The rest will come, one beautiful chapter at a time.",
      ],
    },
  ],
};
