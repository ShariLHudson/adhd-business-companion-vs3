/**
 * Spark Estate Guidebook — The Treehouse Possibility House opening chapter.
 * First impression of the Possibility House section — where every new chapter begins.
 */

import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";
import type { EstateGuideSpreadData } from "@/lib/estate/estateGuideEditorial";

export const POSSIBILITY_HOUSE_GUIDE_SPREAD: EstateGuideSpreadData = {
  id: "house-possibility-outside",
  title: "The Treehouse Possibility House",
  guideSubtitle: "Where Every New Chapter Begins",
  epigraph:
    "Some places don't simply welcome you inside... they invite you to imagine who you might become.",
  image: estateBackgroundPath("treehouse-possibility-house-outside-background.png"),
  imagePlaceId: "house-possibility-outside",
  whisperFromEstate:
    "Possibility doesn't live at the end of the journey. It lives in the courage to take the first step.",
  guideQuote:
    "The most remarkable journeys rarely begin with certainty. They begin with curiosity, one step, and the quiet belief that something wonderful may be waiting just beyond the next door.",
  blocks: [
    {
      type: "story-of-possibility-studio",
      paragraphs: [
        "Long before it became part of Spark Estate, the Treehouse Possibility House was little more than a simple wooden platform nestled high among the branches of one of the Estate's oldest oak trees.",
        "Legend says the very first caretaker built it for one reason—not to escape the world below, but to see it from a different perspective.",
        "Over time, visitors discovered something unexpected.",
        "The higher they climbed, the quieter their minds became.",
        "Ideas that once felt impossible somehow seemed within reach.",
        "Problems that appeared overwhelming from the ground became smaller when viewed from above.",
        "So people began returning.",
        "Some carried notebooks.",
        "Others brought paintbrushes, musical instruments, sketches, blueprints, journals, or simply questions they couldn't answer anywhere else.",
        "With every visit, the little treehouse slowly grew.",
        "A creative studio appeared.",
        "A quiet reflection desk was tucked beside an open window.",
        "An observatory reached toward the stars.",
        "A cabinet began collecting life's chapters.",
        "Little by little, the Treehouse became more than a building.",
        "It became a place where possibility felt safe.",
        "Today, every beam, every window, every lantern, and every winding staircase reminds us that growth rarely happens all at once.",
        "It happens one thoughtful step at a time.",
        "The Treehouse has never asked anyone to be extraordinary.",
        "Only curious enough to climb the first stair.",
      ],
    },
    {
      type: "why-this-room-exists",
      paragraphs: [
        "The Treehouse Possibility House is for anyone standing on the edge of a new beginning.",
        "You might come here when...",
      ],
      bullets: [
        "you're dreaming about something bigger.",
        "you're searching for inspiration.",
        "you're beginning a new business, project, or adventure.",
        "you're wondering what's next.",
        "you're feeling stuck.",
        "you simply want to remember that life still holds wonderful possibilities.",
      ],
      closingParagraphs: [
        "This isn't a place that gives you answers.",
        "It's a place that helps you discover your own.",
      ],
    },
    {
      type: "what-youll-discover",
      paragraphs: [
        "Every room within the Treehouse has its own purpose.",
        "The Creative Studio helps ideas take shape.",
        "The Reflection Desk offers space to think quietly.",
        "The Observatory reminds you to look beyond today's horizon.",
        "The Cabinet of Chapters preserves the story you're already writing.",
        "The Discovery Chest rewards curiosity.",
        "The staircase invites you to slow down instead of rushing ahead.",
        "No single room is more important than another.",
        "Together, they tell one story.",
        "The story of becoming.",
      ],
    },
    {
      type: "estate-traditions",
      paragraphs: [
        "Visitors are gently encouraged to wander.",
        "There is no recommended path.",
        "No numbered tour.",
        "No \"correct\" order.",
        "Some people spend an hour in the Creative Studio.",
        "Others never make it past the staircase window.",
        "Many discover something entirely unexpected along the way.",
        "The Estate has learned that curiosity is a far better guide than directions.",
      ],
    },
    {
      type: "estate-secret",
      paragraphs: [
        "Longtime caretakers quietly share a story.",
        "They say the Treehouse grows.",
        "Not in ways you would measure with a ruler.",
        "But in ways only returning visitors seem to notice.",
        "A new photograph appears.",
        "A favorite chair has moved closer to the window.",
        "Another journal rests on the shelf.",
        "A plant has grown taller.",
        "A new possibility waits where there wasn't one before.",
        "No one remembers making these changes.",
        "The Treehouse simply grows alongside those who return to it.",
        "Perhaps that's what possibility has always done.",
      ],
    },
    {
      type: "from-shari",
      paragraphs: [
        "For much of my life, I believed I needed certainty before I could move forward.",
        "Experience has taught me something far more hopeful.",
        "Possibility doesn't ask us to have everything figured out.",
        "It simply asks us to stay curious enough to take the next step.",
        "Nearly everything meaningful in my life began as a quiet idea that refused to go away.",
      ],
      attribution: ["— Shari Hudson"],
    },
    {
      type: "before-you-explore",
      paragraphs: [
        "As you step inside the Treehouse, don't worry about seeing everything.",
        "You won't.",
        "No one ever does.",
        "Every visit reveals something different.",
        "A detail you missed.",
        "A room that suddenly feels important.",
        "A quiet corner that seems to have been waiting just for you.",
        "The Treehouse was never designed to be explored in a single afternoon.",
        "It was designed to grow with you.",
        "And perhaps that's the greatest possibility of all.",
      ],
    },
  ],
};
