/**
 * Approved How to Use content — Chamber of Momentum.
 */

import type { EstateHowToGuideContent } from "./types";

export const CHAMBER_HOW_TO_GUIDE: EstateHowToGuideContent = {
  id: "chamber-of-momentum",
  title: "How to Use the Chamber of Momentum",
  openActionLabel: "How to Use the Chamber",
  firstVisitInvite: "New here? Open How to Use",
  welcome: [
    "Welcome to the Chamber of Momentum.",
    "This is where ideas become action.",
    "While the Board of Directors helps you think through important business decisions, the Chamber of Momentum helps you move those decisions forward.",
    "Each Chamber Member specializes in a different area of business. When you are stuck, unsure where to begin, or want a focused perspective, the Chamber can help connect you with the right specialist.",
    "You do not need to know who to ask. Shari can help recommend someone.",
  ],
  sections: [
    {
      id: "when-visit",
      title: "When should I visit the Chamber?",
      paragraphs: [
        "Visit the Chamber when you want help with things such as:",
      ],
      bullets: [
        "writing emails, proposals, or documents",
        "marketing or social media ideas",
        "creating products or services",
        "improving customer experience",
        "solving a focused business problem",
        "building systems or processes",
        "brainstorming",
        "organizing projects",
        "understanding data or research",
        "planning presentations or workshops",
        "strengthening leadership",
        "improving sales conversations",
        "creating content",
        "using AI more effectively",
      ],
      closingLine:
        "If it is about doing or improving the work, the Chamber is usually the right place.",
    },
    {
      id: "three-ways",
      title: "Three ways to get help",
      numbered: [
        {
          title: "Let Shari Recommend",
          description:
            "Tell Shari what you are trying to accomplish. She may recommend one Chamber Member and, when useful, one optional second specialist.",
        },
        {
          title: "Ask a Chamber Specialist",
          description:
            "Choose a Chamber Member directly and begin a focused conversation.",
        },
        {
          title: "Continue a Previous Conversation",
          description:
            "Return to a previous Chamber conversation without starting over.",
        },
      ],
    },
    {
      id: "what-happens",
      title: "What happens during a Chamber conversation?",
      paragraphs: ["A Chamber Member may help you:"],
      bullets: [
        "clarify your thinking",
        "brainstorm ideas",
        "draft content",
        "solve problems",
        "organize information",
        "offer practical recommendations",
        "suggest tools or resources",
        "prepare proposed updates",
      ],
      closingLine:
        "Nothing is automatically changed. Suggested updates to Business Estate, People I Help, or other areas require user review and approval.",
    },
    {
      id: "compare",
      title: "Chamber, Board, Research, or Shari?",
      comparisonRows: [
        {
          name: "Shari",
          points: [
            "helps the user discover what they need",
            "talks things through",
            "keeps the experience connected",
          ],
        },
        {
          name: "Board of Directors",
          points: [
            "helps examine major decisions",
            "considers risks, opportunities, tradeoffs, and long-term consequences",
          ],
        },
        {
          name: "Chamber of Momentum",
          points: [
            "helps build, create, organize, improve, and implement",
          ],
        },
        {
          name: "Research This With Shari",
          points: [
            "gathers current outside information and sources",
          ],
        },
      ],
    },
    {
      id: "things-to-know",
      title: "Things to know",
      bullets: [
        "users can switch Chamber Members",
        "a second specialist may be invited",
        "conversations stay focused on the current task",
        "nothing saves automatically",
        "the user controls the next step",
        "Chamber Members are different from Board Directors",
      ],
    },
    {
      id: "final-invitation",
      title: "Final invitation",
      paragraphs: [
        "You do not need the perfect question before coming here.",
        "Bring an unfinished idea, a roadblock, a task, or an “I do not know where to start” moment.",
        "The Chamber exists to help you build momentum one conversation at a time.",
      ],
    },
  ],
  primaryActionLabel: "Find the Right Chamber Member",
  primaryActionTestId: "chamber-how-to-find-member",
};
