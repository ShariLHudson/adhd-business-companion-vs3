/**
 * Approved How to Use content — My Business Estate (ADHD-calm, three sections).
 */

import type { EstateHowToGuideContent } from "./types";

export const BUSINESS_ESTATE_HOW_TO_GUIDE: EstateHowToGuideContent = {
  id: "my-business-estate",
  title: "How to Use My Business Estate",
  openActionLabel: "New here? Open How to Use",
  firstVisitInvite: "New here? Open How to Use",
  welcome: [
    "Welcome to My Business Estate.",
    "This is where Spark learns about your business so support feels more personal.",
  ],
  sections: [
    {
      id: "what-is-it",
      title: "What is it?",
      paragraphs: [
        "My Business Estate is where Spark learns about your business — identity, people you help, offers, brand, direction, working style, and tools.",
        "Approved information here helps Shari, the Chamber, and the Board give you more useful guidance.",
      ],
    },
    {
      id: "how-it-works",
      title: "How does it work?",
      paragraphs: ["Three gentle steps:"],
      bullets: [
        "Open a room that feels useful right now",
        "Answer only what you know — leave the rest for later",
        "Return anytime; Spark remembers what you already shared",
      ],
      closingLine: "Everything is optional. There is no required order.",
    },
    {
      id: "what-first",
      title: "What should I do first?",
      paragraphs: [
        "Start with the Next Helpful Step on the overview — usually Business Basics in the Identity Office.",
        "If you already know who you help, People I Help is a warm next place.",
      ],
      closingLine:
        "One room at a time is enough. You can always Choose Something Else.",
    },
    {
      id: "advanced-help",
      title: "Advanced help (optional)",
      subsections: [
        {
          title: "Need another perspective?",
          bullets: [
            "Ask a Chamber Specialist for focused implementation help",
            "Take a major decision to the Board",
            "Let Shari recommend which fits best",
          ],
        },
        {
          title: "Things to know",
          bullets: [
            "You do not need to finish every area",
            "Shari reuses approved information",
            "Chamber and Board advice do not auto-update your estate",
          ],
        },
      ],
    },
  ],
  primaryActionLabel: "See My Next Helpful Step",
  primaryActionTestId: "business-estate-how-to-choose-area",
};
