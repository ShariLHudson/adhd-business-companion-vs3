/**
 * Client Relationships Intelligence — deep intelligence record (I-4, batch 1).
 *
 * Compiled from docs/visual-spark-studios/Chamber-Member-Intelligence/
 * Expert-Intelligence-Profiles/CR_Expert_Intelligence_Profile.md
 * §2 (thinking pattern), §4 (frameworks), §5 (questions), §7 (ADHD
 * translations), §10 (knowledge sources). The markdown is the source of
 * truth — see __tests__/profileDrift.test.ts.
 *
 * Chosen as the second post-pilot expert to migrate (alongside STR)
 * based on activation frequency across both founder-language validation
 * rounds — see docs/estate/CHAMBER_ACTIVATION_V2_NEXT_BATCH.md.
 */

import type { ChamberExpertIntelligence } from "../types";

export const CR_INTELLIGENCE: ChamberExpertIntelligence = {
  id: "CR",

  thinkingPattern: {
    summary:
      "Notices the gap between what the client was told and what they now expect. Repairs trust with a small honest update before it becomes a bigger silence.",
    notices: [
      "expectation gaps between what was told and what's now expected",
      "invisible next steps for the client",
      "emotional labor load",
    ],
    finds: [
      "whether 'ideal client' is real or aspirational",
      "where overgiving is standing in for a boundary",
    ],
    creates: ["a written expectation snapshot", "a repair path that doesn't require a perfect memory"],
    checksForMissing: ["a next step the client can actually see", "a cadence that survives a hard week"],
  },

  frameworks: [
    {
      id: "expectation-snapshot",
      name: "Expectation Snapshot",
      category: "client onboarding",
      purpose: "Align what \"working together\" means.",
      whenToUse: ["new client", "scope creep", "tension"],
      sparkExplanation:
        "We'll name outcomes, roles, rhythm, and what 'done' looks like — in plain language.",
      adhdApplication: "One page; reusable template; beats memory.",
      example: "Outcome · your part · my part · meeting rhythm · response time · out-of-scope list.",
    },
    {
      id: "care-cadence",
      name: "Care Cadence",
      category: "retention",
      purpose: "Sustainable touchpoints.",
      whenToUse: ["ghosting risk", "feast/famine attention", "clients ghosting"],
      sparkExplanation: "A simple rhythm you'll keep beats an ambitious plan you'll abandon.",
      adhdApplication: "Calendar-externalized; low inventiveness each week.",
      example: "Day 1 welcome · Day 7 check · biweekly progress note · closing celebration.",
    },
    {
      id: "repair-note",
      name: "Repair Note",
      category: "trust repair",
      purpose: "Recover trust after a drop.",
      whenToUse: ["missed message", "delayed deliverable", "avoided conversation", "ghosted a client"],
      sparkExplanation: "Acknowledge, own, next step — no novel-length apology.",
      adhdApplication: "Short script reduces avoidance.",
      example: '"I dropped this ball. Here\'s where we are. Here\'s the next step by Friday."',
    },
    {
      id: "ideal-client-clarity",
      name: "Ideal Client Clarity (People I Help)",
      category: "client fit",
      purpose: "Focus care and marketing on the right humans.",
      whenToUse: ["wrong-fit clients", "exhaustion", "fuzzy messaging"],
      sparkExplanation: "Who you're uniquely good for — and who you're not.",
      adhdApplication: "Fewer draining exceptions; clearer decisions.",
      example: "Exhausted service founders who want calmer systems — not anyone with a wallet.",
    },
    {
      id: "scope-kindness-boundary",
      name: "Scope Kindness Boundary",
      category: "boundaries",
      purpose: "Stay warm without free consulting forever.",
      whenToUse: ["scope creep", "resentment"],
      sparkExplanation: "We can care and still name the edge.",
      adhdApplication: "Scripts reduce confrontation freeze.",
      example: '"That\'s important — it\'s outside this package. Here are two ways we can handle it."',
    },
  ],

  signatureQuestions: [
    {
      id: "client-believes-next",
      text: "What does the client believe happens next — and have we said that out loud?",
      reveals: "unstated expectations",
    },
    {
      id: "smallest-update",
      text: "What's the smallest update that would rebuild trust this week?",
      reveals: "the actual repair needed, not a bigger apology",
    },
  ],

  adhdTranslations: [
    {
      id: "no-complex-crm-stages",
      traditional: "Complex CRM stages",
      whyItFails: "Avoidance.",
      sparkAdaptation: "Simple: Active / Waiting / Done + next date.",
      whyBetter: "Usable under stress.",
      appliesWhen: ["client chaos", "onboarding experience", "client journey"],
    },
    {
      id: "no-perfect-apology-essays",
      traditional: "Perfect apology essays",
      whyItFails: "Delay -> worse.",
      sparkAdaptation: "3-sentence Repair Note.",
      whyBetter: "Action over shame.",
      appliesWhen: ["ghosted a client", "clients ghosting", "keep ghosting me"],
    },
  ],

  knowledgeSources: {
    volatileTopics: [
      "platform messaging norms",
      "niche-specific client expectations",
      "competitor onboarding promises",
    ],
    trustedSourceTypes: [
      "exit/feedback conversations",
      "support tickets",
      "peer service businesses",
      "the founder's own win/loss notes",
    ],
    evidenceStandard: "Research improves how clients feel guided — not a reason to delay the next check-in.",
    researchTriggers: [
      "industry service norms change",
      "retention practices shift",
      "communication channel expectations change",
    ],
  },

  profilePath:
    "docs/visual-spark-studios/Chamber-Member-Intelligence/Expert-Intelligence-Profiles/CR_Expert_Intelligence_Profile.md",
};
