/**
 * Approved How to Use content — My Business Estate.
 */

import type { EstateHowToGuideContent } from "./types";

export const BUSINESS_ESTATE_HOW_TO_GUIDE: EstateHowToGuideContent = {
  id: "my-business-estate",
  title: "How to Use My Business Estate",
  openActionLabel: "New here? Open How to Use",
  firstVisitInvite: "New here? Open How to Use",
  welcome: [
    "Welcome to My Business Estate.",
    "This is where Shari learns how your business works, what matters to you, who you help, and how to support you more personally.",
    "You do not need to complete everything at once.",
    "Your Business Estate can grow gradually as you work, make decisions, and learn more about your business.",
  ],
  sections: [
    {
      id: "what-for",
      title: "What is My Business Estate for?",
      paragraphs: [
        "My Business Estate keeps the approved information Shari needs to understand the business.",
        "This may include:",
      ],
      bullets: [
        "business identity",
        "offers",
        "brand",
        "current priorities",
        "working preferences",
        "tools and systems",
        "People I Help context",
      ],
      closingLine:
        "The more approved information you add, the less often you need to repeat yourself.",
    },
    {
      id: "six-areas",
      title: "The six Business Areas",
      subsections: [
        {
          title: "Identity Office",
          bullets: [
            "business identity",
            "purpose",
            "mission",
            "vision",
            "values",
          ],
        },
        {
          title: "Offer Suite",
          bullets: [
            "products",
            "services",
            "programs",
            "problems solved",
            "outcomes",
            "future offers",
          ],
        },
        {
          title: "Brand Studio",
          bullets: [
            "personality",
            "tone",
            "messages",
            "preferred language",
            "visual direction",
            "content boundaries",
          ],
        },
        {
          title: "Strategy Desk",
          bullets: [
            "current priorities",
            "main projects",
            "decisions",
            "challenges",
            "milestones",
            "ideas",
            "success",
          ],
        },
        {
          title: "Working Style Study",
          bullets: [
            "preferred working conditions",
            "friction",
            "overwhelm",
            "restart support",
            "decision preferences",
            "how Shari should help",
          ],
        },
        {
          title: "Systems Desk",
          bullets: [
            "website",
            "calendars",
            "file storage",
            "design tools",
            "payment tools",
            "social platforms",
            "other systems",
          ],
        },
      ],
    },
    {
      id: "how-work",
      title: "How would you like to work?",
      subsections: [
        {
          title: "Quick Start",
          bullets: ["answer only the most useful questions"],
        },
        {
          title: "Guided Setup",
          bullets: ["work through one small stage at a time"],
        },
        {
          title: "Browse and Update",
          bullets: ["go directly to saved information"],
        },
        {
          title: "Talk This Through With Shari",
          bullets: [
            "answer conversationally",
            "receive suggested drafts",
            "approve before saving",
          ],
        },
      ],
      closingLine: "These are options, not required paths.",
    },
    {
      id: "own-words",
      title: "Use your own words",
      paragraphs: [
        "Users may type explanations and descriptions in their own words.",
        "Dropdowns are shortcuts, not restrictions.",
        "Text boxes should remain available where explanations are useful.",
      ],
    },
    {
      id: "another-perspective",
      title: "Need another perspective?",
      subsections: [
        {
          title: "Ask a Chamber Specialist",
          bullets: ["focused implementation help"],
        },
        {
          title: "Take This to the Board",
          bullets: [
            "major decisions, risk, direction, tradeoffs, or long-term consequences",
          ],
        },
        {
          title: "Let Shari Recommend",
          bullets: [
            "Shari explains whether continued conversation, Chamber, or Board fits best",
          ],
        },
      ],
      closingLine:
        "Chamber Members and Board Directors stay in separate places — they are never combined.",
    },
    {
      id: "cartography",
      title: "View this in Cartography",
      paragraphs: [
        "Approved Business Estate information may become:",
      ],
      bullets: [
        "identity map",
        "offer flow",
        "strategy map",
        "systems connection map",
        "working rhythm map",
        "audience-needs map",
      ],
      closingLine:
        "Cartography uses existing approved information. Visual changes do not automatically rewrite Business Estate fields.",
    },
    {
      id: "saving",
      title: "Saving and returning",
      paragraphs: ["Users may:"],
      bullets: [
        "save changes",
        "cancel",
        "return later",
        "mark Enough for Now",
        "reopen and edit",
        "leave unfinished areas",
      ],
      closingLine:
        "Closing a question must not erase the current draft. Nothing saves without approval.",
    },
    {
      id: "not-sure",
      title: "When I am not sure",
      paragraphs: ["You can always:"],
      bullets: [
        "Talk This Through With Shari",
        "Help Me Choose",
        "Show Examples",
        "Ask a Chamber Specialist",
        "Leave It for Now",
      ],
      closingLine: "There are no dead ends.",
    },
    {
      id: "things-to-know",
      title: "Things to know",
      bullets: [
        "users do not need to finish every area",
        "users do not need to answer every question",
        "Shari should reuse approved information",
        "Chamber and Board advice do not auto-update profile data",
        "users approve suggested changes",
        "Business Estate grows over time",
      ],
    },
    {
      id: "final-thought",
      title: "Final thought",
      paragraphs: [
        "My Business Estate is not a test or a long form that must be finished.",
        "It is a living picture of the business.",
        "Start with what you know.",
        "Shari can help shape the rest.",
      ],
    },
  ],
  primaryActionLabel: "Choose a Business Area",
  primaryActionTestId: "business-estate-how-to-choose-area",
};
