/**
 * Strategy Intelligence — deep intelligence record (I-4, batch 1).
 *
 * Compiled from docs/visual-spark-studios/Chamber-Member-Intelligence/
 * Expert-Intelligence-Profiles/STR_Expert_Intelligence_Profile.md
 * §2 (thinking pattern), §4 (frameworks), §5 (questions), §7 (ADHD
 * translations), §10 (knowledge sources). The markdown is the source of
 * truth — see __tests__/profileDrift.test.ts.
 *
 * Chosen as the first post-pilot expert to migrate (alongside CR) based
 * on activation frequency across both founder-language validation rounds
 * — see docs/estate/CHAMBER_ACTIVATION_V2_NEXT_BATCH.md.
 */

import type { ChamberExpertIntelligence } from "../types";

export const STR_INTELLIGENCE: ChamberExpertIntelligence = {
  id: "STR",

  thinkingPattern: {
    summary:
      "Notices when busy has quietly replaced chosen. Names the one bet worth protecting, then defends it against every equally-interesting alternative.",
    notices: [
      "too many simultaneous 'most important' things",
      "today's work not matching stated goals",
      "capacity vs ambition mismatch",
    ],
    finds: [
      "the difference between busy and chosen",
      "opportunity cost hiding inside a full calendar",
    ],
    creates: ["one written bet, protected from detours", "one stop, one next action"],
    checksForMissing: [
      "a decision log Working Memory can recall",
      "a scheduled rethink instead of a silent failure",
    ],
  },

  frameworks: [
    {
      id: "focus-bet-canvas",
      name: "Focus Bet Canvas",
      category: "prioritization",
      purpose: "Name the one strategic bet for the next 30-90 days.",
      whenToUse: ["too many initiatives", "growth feels random", "restarting after a pivot"],
      sparkExplanation:
        "We're picking the one move that, if it works, makes the other ideas easier later.",
      adhdApplication: "Fits on one screen; reviewable after interruption; no 40-page plan.",
      example: 'Bet = "Fill the Signature Offer with 3 clients via warm outreach," not "build brand everywhere."',
    },
    {
      id: "stop-start-continue",
      name: "Stop / Start / Continue",
      category: "prioritization",
      purpose: "Make strategy concrete by cutting load.",
      whenToUse: ["overwhelm", "calendar full of low-leverage work"],
      sparkExplanation: "Strategy shows up in what we stop as much as what we start.",
      adhdApplication: "Stopping frees dopamine and attention; list max 3 stops.",
      example: "Stop posting daily on 4 platforms; Start one weekly newsletter; Continue client delivery excellence.",
    },
    {
      id: "opportunity-filter",
      name: "Opportunity Filter (Impact × Fit × Capacity)",
      category: "decision-making",
      purpose: "Rank ideas without endless debate.",
      whenToUse: ["idea piles", "fomo launches", "too many offers", "which one to focus on"],
      sparkExplanation:
        "We'll score by business impact, fit with who you help, and whether you can do it with your real energy.",
      adhdApplication: "Replaces rumination with a quick three-number gut score.",
      example: "Podcast idea scores high interest, low capacity -> park; offer refresh scores high on all three -> proceed.",
    },
    {
      id: "reversible-vs-irreversible",
      name: "Reversible vs Irreversible",
      category: "decision-making",
      purpose: "Match decision weight to process weight.",
      whenToUse: ["founder freezing on small choices", "rushing big ones"],
      sparkExplanation: "If we can undo it cheaply, we decide faster. If it locks us in, we slow down.",
      adhdApplication: "Prevents both perfectionist stall and impulsive overcommit.",
      example: "Homepage headline = reversible; exclusive partnership = irreversible.",
    },
    {
      id: "vision-this-week-bridge",
      name: "Vision → This Week Bridge",
      category: "goal-setting",
      purpose: "Connect long-term desire to one near action.",
      whenToUse: ["beautiful vision, empty monday", "long term vision", "five year visions"],
      sparkExplanation: "What's the smallest move this week that still points at that future?",
      adhdApplication: "Avoids all-or-nothing; creates restart points.",
      example: 'Vision "thought-leader brand" -> this week: one story post that teaches one idea.',
    },
  ],

  signatureQuestions: [
    {
      id: "quieter-month",
      text: "If everything went quieter for a month, what would you most want to still be true about the business?",
      reveals: "what actually matters versus what's just noise",
    },
    {
      id: "stop-without-guilt",
      text: "What would you stop without guilt if I gave you permission?",
      reveals: "hidden low-leverage commitments",
    },
  ],

  adhdTranslations: [
    {
      id: "no-12-month-strategic-plan",
      traditional: "12-month strategic plan",
      whyItFails: "Too long for working memory; feels fake by month two.",
      sparkAdaptation: "90-day Focus Bet + 30-day check.",
      whyBetter: "Holdable; revisable without shame.",
      appliesWhen: ["strategic plan", "business strategy", "growth plan", "strategy"],
    },
    {
      id: "no-5-simultaneous-priorities",
      traditional: "5 simultaneous priorities",
      whyItFails: "Splits attention; none finish.",
      sparkAdaptation: "One primary + one support.",
      whyBetter: "Matches real focus.",
      appliesWhen: ["too many priorities", "different offers", "too many offers"],
    },
  ],

  knowledgeSources: {
    volatileTopics: [
      "market size claims",
      "platform algorithm bets",
      "competitor offers",
      "industry pricing bands",
    ],
    trustedSourceTypes: [
      "direct customer conversations",
      "recent competitor sites",
      "reputable industry reports",
      "the founder's own sales data",
    ],
    evidenceStandard: "Enough to choose — not enough to delay forever. Prefer 3 solid signals over 30 tabs.",
    researchTriggers: [
      "market shifts",
      "pricing norms change",
      "competitor moves",
      "regulation could change the bet",
    ],
  },

  profilePath:
    "docs/visual-spark-studios/Chamber-Member-Intelligence/Expert-Intelligence-Profiles/STR_Expert_Intelligence_Profile.md",
};
