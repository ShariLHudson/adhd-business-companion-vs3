/**
 * Spark Estate Guidebook — The Treehouse Reflection Desk spread.
 */

import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";
import type { EstateGuideSpreadData } from "@/lib/estate/estateGuideEditorial";

export const POSSIBILITY_REFLECTION_DESK_GUIDE_SPREAD: EstateGuideSpreadData = {
  id: "house-possibility-reflection-desk",
  title: "The Treehouse Reflection Desk",
  guideSubtitle: "Where Your Thoughts Find Their Voice",
  epigraph:
    "Sometimes the wisest thing we can do is slow down long enough to hear our own heart.",
  image: estateBackgroundPath("treehouse-possibility-reflection-desk-background.png"),
  imagePlaceId: "house-possibility-reflection-desk",
  whisperFromEstate:
    "The answers you seek are often waiting in the quiet you've been too busy to visit.",
  guideQuote:
    "A quiet moment spent listening to yourself is never time wasted. It's often where your next chapter quietly begins.",
  blocks: [
    {
      type: "story-of-possibility-studio",
      paragraphs: [
        "There is an old saying among the caretakers of Spark Estate:",
        "\"Every Treehouse needs one window that looks inward as much as outward.\"",
        "When the Treehouse Possibility House was first taking shape, visitors loved creating, dreaming, and exploring.",
        "Yet many found themselves searching for a quiet corner where they could simply think without interruption.",
        "So a simple writing desk was placed beside the open windows.",
        "Nothing elaborate.",
        "Just a sturdy wooden desk, a comfortable chair, a journal, and a view that stretched far beyond the Estate.",
        "Something remarkable happened.",
        "People stayed much longer than anyone expected.",
        "Some wrote pages.",
        "Others wrote only a single sentence.",
        "Many never wrote at all.",
        "They simply watched the light dance across the valley while thoughts they had carried for years slowly settled into place.",
        "Over time, the Reflection Desk became known as one of the quietest places in the Estate—not because nothing happened here, but because some of life's most important conversations began in silence.",
      ],
    },
    {
      type: "why-this-room-exists",
      paragraphs: [
        "The Reflection Desk welcomes you whenever life feels noisy.",
        "You may find yourself here when...",
      ],
      bullets: [
        "Your thoughts feel scattered.",
        "You need to journal.",
        "You're making an important decision.",
        "You want to celebrate a small victory.",
        "You're carrying something difficult.",
        "You simply need a quiet place to think.",
      ],
      closingParagraphs: [
        "Nothing is expected of you here.",
        "There are no right words.",
        "Only honest ones.",
      ],
    },
    {
      type: "the-open-windows",
      paragraphs: [
        "The windows are never closed.",
        "Fresh air drifts gently through the room.",
        "Birdsong rises from the trees below.",
        "The changing light reminds us that every day brings a new perspective.",
        "The Estate believes reflection shouldn't happen in isolation.",
        "It should always remain connected to the living world beyond the page.",
      ],
    },
    {
      type: "the-journal",
      paragraphs: [
        "The journal resting on the desk is more than paper.",
        "It becomes a trusted companion.",
        "Some pages capture dreams.",
        "Others hold gratitude.",
        "Some preserve heartbreak.",
        "Others celebrate victories so small they might otherwise be forgotten.",
        "No page is ever judged.",
        "Every page matters.",
      ],
    },
    {
      type: "kinseys-corner",
      paragraphs: [
        "If Kinsey happens to be resting beneath the desk, consider it a gentle reminder.",
        "Sometimes comfort doesn't come from finding answers.",
        "Sometimes it comes from simply knowing we're not alone while we search for them.",
        "She asks for nothing.",
        "She simply keeps quiet company.",
      ],
    },
    {
      type: "estate-traditions",
      paragraphs: [
        "Many visitors begin each visit by writing just one sentence.",
        "Not a page.",
        "Not a plan.",
        "Just one honest thought.",
        "It's remarkable how often that single sentence becomes the beginning of something much larger.",
      ],
    },
    {
      type: "estate-secret",
      paragraphs: [
        "Look carefully at the desk throughout the seasons.",
        "Every so often, a handwritten page appears.",
        "It may contain a quote.",
        "A forgotten journal entry.",
        "A letter from your past self.",
        "Or an insight Spark quietly saved because it knew one day you'd need to read it again.",
        "No one knows exactly when these pages appear.",
        "The Estate simply has a wonderful sense of timing.",
      ],
    },
    {
      type: "from-shari",
      paragraphs: [
        "Some of the greatest breakthroughs in my life didn't happen while I was working harder.",
        "They happened after I finally became quiet enough to notice what my heart had been trying to tell me all along.",
        "Reflection has a way of turning confusion into clarity—one honest thought at a time.",
      ],
      attribution: ["— Shari Hudson"],
    },
    {
      type: "before-you-leave",
      paragraphs: [
        "Before you stand up from the desk...",
        "Look out the window one last time.",
        "Take a slow breath.",
        "Notice whether anything feels just a little lighter than when you first arrived.",
        "The Reflection Desk rarely changes your life all at once.",
        "Instead, it gently changes the way you see it.",
        "And sometimes...",
        "that's where every meaningful change begins.",
      ],
    },
  ],
};
