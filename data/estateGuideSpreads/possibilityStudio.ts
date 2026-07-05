/**
 * Spark Estate Guidebook™ — The Treehouse Possibility Studio™ spread.
 */

import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";
import type { EstateGuideSpreadData } from "@/lib/estate/estateGuideEditorial";

export const POSSIBILITY_STUDIO_GUIDE_SPREAD: EstateGuideSpreadData = {
  id: "house-possibility-studio",
  title: "The Treehouse Possibility Studio",
  epigraph:
    "Every extraordinary journey begins with the quiet permission to imagine.",
  image: estateBackgroundPath("treehouse-possibility-studio.png"),
  imagePlaceId: "house-possibility-studio",
  whisperFromEstate:
    "The future rarely begins with a perfect plan. It begins with a single possibility that refuses to be ignored.",
  guideQuote: "Every masterpiece was once someone's impossible idea.",
  blocks: [
    {
      type: "story-of-possibility-studio",
      paragraphs: [
        "Long before the Treehouse became a place of ideas, it was simply an unfinished attic tucked among the branches.",
        "The room had rough wooden floors, wide windows, and little more than a worktable covered in scraps of paper.",
        "Travelers, artists, inventors, writers, entrepreneurs, and dreamers would wander upstairs carrying ideas they weren't quite ready to share.",
        "Some arrived full of excitement.",
        "Others arrived carrying disappointment.",
        "Many arrived convinced they had missed their chance.",
        "There was no expectation here.",
        "No deadlines.",
        "No judgments.",
        "Only space.",
        "They began pinning sketches, photographs, handwritten notes, tiny victories, favorite quotes, and impossible dreams to the walls.",
        "Every visit added another layer to the room until the walls themselves became a living tapestry of possibility.",
        "Over the years, visitors noticed something curious.",
        "The more unfinished the room looked...",
        "the more complete they felt.",
        "No one ever \"finished\" the Possibility Studio.",
        "That was never its purpose.",
        "Its purpose was to remind every visitor that beautiful things are always in the process of becoming.",
        "Today, every photograph, sketch, note, and inspiration card represents someone who chose hope over hesitation—even if only for a single afternoon.",
        "The walls continue to grow because possibility never stands still.",
        "Neither do you.",
      ],
    },
    {
      type: "why-this-room-exists",
      paragraphs: [
        "The Treehouse Possibility Studio is where scattered thoughts begin finding direction.",
        "You may find yourself here when:",
      ],
      bullets: [
        "A new idea won't leave you alone.",
        "You're dreaming about a future that feels just out of reach.",
        "You're beginning a business, project, or creative adventure.",
        "You feel stuck and need fresh perspective.",
        "You want to reconnect with your imagination.",
        "You simply need to remember that possibilities still exist.",
      ],
      closingParagraphs: [
        "This room doesn't ask you to produce.",
        "It invites you to wonder.",
      ],
    },
    {
      type: "look-closely",
      paragraphs: [
        "Every visit reveals something different.",
        "Perhaps a handwritten note tucked between photographs.",
        "A sketch that reminds you of your own dream.",
        "A quote you've somehow overlooked before.",
        "Or a tiny detail that suddenly feels meant just for you.",
        "The wall is never exactly the same twice.",
        "Some ideas quietly disappear.",
        "Others arrive when you need them most.",
        "Look closely.",
        "The room has a way of rewarding curiosity.",
      ],
    },
    {
      type: "estate-traditions",
      paragraphs: [
        "Visitors often begin with one simple question:",
        "\"What if...\"",
        "Not because they already know the answer...",
        "but because asking the question changes what becomes possible.",
        "Many guests leave a single sentence behind before they go.",
        "Some write goals.",
        "Some write dreams.",
        "Some write fears they are finally ready to release.",
        "No one else needs to read them.",
        "The act of writing is enough.",
      ],
    },
    {
      type: "estate-secret",
      paragraphs: [
        "There is a story told among longtime visitors.",
        "It says the Studio quietly remembers unfinished dreams.",
        "Months—or even years—after someone visits, they sometimes return and notice a photograph, a sketch, or a quote that seems strangely familiar.",
        "Almost as though the room had been holding onto the idea until they were ready to continue.",
        "No one has ever proved this.",
        "Yet remarkably few people question it.",
      ],
    },
    {
      type: "from-shari",
      paragraphs: [
        "I believe every meaningful life begins the same way...",
        "with someone willing to imagine something that doesn't exist yet.",
        "The world often tells us to be practical before we're hopeful.",
        "This room gently asks us to reverse that order.",
        "Dream first.",
        "Believe second.",
        "Build third.",
        "You don't need certainty to begin.",
        "You only need enough hope to take the next small step.",
      ],
      attribution: ["— Shari Hudson"],
    },
  ],
};
