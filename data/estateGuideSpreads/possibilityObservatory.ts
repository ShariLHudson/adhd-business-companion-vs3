/**
 * Spark Estate Guidebook™ — The Treehouse Observatory™ spread.
 */

import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";
import type { EstateGuideSpreadData } from "@/lib/estate/estateGuideEditorial";

export const POSSIBILITY_OBSERVATORY_GUIDE_SPREAD: EstateGuideSpreadData = {
  id: "house-possibility-observatory",
  title: "The Treehouse Observatory",
  guideSubtitle: "Where Perspective Changes Everything",
  epigraph:
    "Sometimes the clearest path forward begins by looking beyond today's horizon.",
  image: estateBackgroundPath("treehouse-possibility-observatory-background.png"),
  imagePlaceId: "house-possibility-observatory",
  whisperFromEstate:
    "The horizon isn't the end of your story. It's simply the edge of what you can see today.",
  guideQuote:
    "Hope isn't found by escaping today's reality. It's found by remembering that today's reality is not the end of your story.",
  blocks: [
    {
      type: "story-of-possibility-studio",
      paragraphs: [
        "Long before the observatory became one of the Treehouse's most cherished places, this room was nothing more than a small lookout tucked beneath the roof.",
        "Visitors naturally climbed to the highest point of the Treehouse.",
        "Not because there was anything waiting for them...",
        "But because something about being above the forest made the world feel different.",
        "The caretaker eventually placed a simple telescope near the great circular window.",
        "At first, everyone assumed it was meant for studying the stars.",
        "It wasn't.",
        "Over time, people discovered the telescope's real purpose.",
        "It wasn't designed to help you see farther.",
        "It was designed to help you think farther.",
        "The view reminded visitors that every valley eventually leads to another hill.",
        "Every ending quietly becomes another beginning.",
        "Every horizon hides possibilities that can't yet be seen from where we stand.",
        "The telescope became a symbol of hope—not because it revealed the future, but because it reminded people there was always more beyond today's circumstances.",
      ],
    },
    {
      type: "why-this-room-exists",
      paragraphs: [
        "The Observatory is where perspective returns.",
        "Visit whenever...",
      ],
      bullets: [
        "you're facing a difficult decision",
        "life feels overwhelming",
        "you've lost sight of your direction",
        "you need hope",
        "you're dreaming about what's next",
        "you simply want to sit quietly and watch the world",
      ],
      closingParagraphs: [
        "Some visitors spend hours here.",
        "Others stay only a few minutes.",
        "Both leave seeing things differently.",
      ],
    },
    {
      type: "the-great-window",
      paragraphs: [
        "The great circular window is more than beautiful architecture.",
        "It was intentionally designed to frame possibility.",
        "Morning brings gentle light.",
        "Afternoon reveals endless forests.",
        "Evening fills the room with warm gold.",
        "Night reminds us how wonderfully small—and wonderfully connected—we really are.",
        "Every season changes the view.",
        "Every visit tells a different story.",
      ],
    },
    {
      type: "the-telescope",
      paragraphs: [
        "Many people instinctively walk toward the telescope.",
        "Few realize they don't need to look through it.",
        "Sometimes simply standing beside it is enough.",
        "The telescope reminds us to lift our eyes from immediate problems and remember there is always a larger picture waiting to be seen.",
        "Perspective has a remarkable way of making even the hardest seasons feel temporary.",
      ],
    },
    {
      type: "the-hearth",
      paragraphs: [
        "Even high above the forest canopy, the little fireplace offers warmth.",
        "It was built as a quiet reminder that while we dream boldly, we also need places of comfort.",
        "Hope grows strongest where we feel safe.",
        "Sit beside the fire.",
        "Watch the flames dance.",
        "Sometimes answers arrive when we stop chasing them.",
      ],
    },
    {
      type: "estate-traditions",
      paragraphs: [
        "Visitors often end their journey through the Treehouse here.",
        "Not because it is the last room...",
        "But because it reminds them to leave with hope.",
        "Many pause before the window, take one deep breath, and silently ask themselves:",
        "\"What if everything turns out better than I imagined?\"",
        "The Estate has found that this single question changes more lives than certainty ever has.",
      ],
    },
    {
      type: "estate-secret",
      paragraphs: [
        "There is an old story shared only among longtime visitors.",
        "It says that on evenings when someone reaches an important breakthrough, the sunset lingers just a little longer through the great window.",
        "No one has measured it.",
        "No one has proven it.",
        "Yet those who have experienced it never forget.",
        "The Estate has always had its own way of celebrating quiet victories.",
      ],
    },
    {
      type: "from-shari",
      paragraphs: [
        "There have been seasons in my life when I couldn't see beyond the challenge right in front of me.",
        "Looking back, I realize my world hadn't become smaller—my perspective had.",
        "The Observatory reminds me to lift my eyes, breathe deeply, and remember that today's chapter is never the whole story.",
      ],
      attribution: ["— Shari Hudson"],
    },
    {
      type: "before-you-leave",
      paragraphs: [
        "Take one final look through the great window.",
        "Notice the winding river.",
        "The forests stretching into the distance.",
        "The changing sky.",
        "Everything beyond the glass has existed all along.",
        "The view didn't change.",
        "Your perspective did.",
        "Carry that with you as you climb back down the staircase.",
        "Sometimes the greatest gift we can receive isn't a new destination.",
        "It's seeing our current path with new eyes.",
      ],
    },
  ],
};
