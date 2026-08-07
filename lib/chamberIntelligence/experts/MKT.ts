/**
 * Marketing Intelligence — deep intelligence record (I-1/I-2 pilot).
 *
 * Compiled from docs/visual-spark-studios/Chamber-Member-Intelligence/
 * Expert-Intelligence-Profiles/MKT_Expert_Intelligence_Profile.md
 * §2 (thinking pattern), §4 (frameworks), §5 (questions), §7 (ADHD
 * translations), §10 (knowledge sources). The markdown is the source of
 * truth — see __tests__/profileDrift.test.ts.
 */

import type { ChamberExpertIntelligence } from "../types";

export const MKT_INTELLIGENCE: ChamberExpertIntelligence = {
  id: "MKT",

  thinkingPattern: {
    summary:
      "Notices when a message is technically true but unclear to a stranger. Connects what the audience actually needs to what the offer already provides — before reaching for more channels.",
    notices: [
      "invisible offer",
      "channel overwhelm",
      "message unclear to a stranger",
      "channel count rising while inquiries stay flat",
    ],
    finds: [
      "the gap between what the audience needs and what the offer says",
      "vanity metrics that change no decision",
    ],
    creates: ["one clear promise", "one channel home", "one finishable experiment"],
    checksForMissing: [
      "a next step after someone becomes interested",
      "proof a stranger would believe",
    ],
  },

  frameworks: [
    {
      id: "promise-proof-path",
      name: "Promise–Proof–Path",
      category: "positioning",
      purpose: "Tighten marketing to something buyable.",
      whenToUse: [
        "posts get likes but no inquiries",
        "message is mushy",
        "marketing strategy",
        "marketing plan",
      ],
      sparkExplanation:
        "What you promise, why they should believe you, and the next step they take.",
      adhdApplication: "Three anchors — easy to restart after a gap.",
      example: "Promise = calmer client onboarding · Proof = case story · Path = book a 20-min call.",
    },
    {
      id: "one-channel-home",
      name: "One Channel Home",
      category: "content strategy",
      purpose: "End multi-platform burnout.",
      whenToUse: ["guilt across 4+ networks", "posting everywhere landing nowhere", "channel overwhelm"],
      sparkExplanation:
        "We'll pick the home where your people already listen — everything else is optional.",
      adhdApplication: "Reduces decision load and context switching.",
      example: "Newsletter home; social only to point back.",
    },
    {
      id: "30-day-experiment",
      name: "30-Day Marketing Experiment",
      category: "audience research",
      purpose: "Replace fantasy annual plans.",
      whenToUse: ["marketing plan", "low consistency history", "marketing strategy", "marketing calendar"],
      sparkExplanation:
        "One hypothesis, one channel, one offer, one number that tells us if it worked.",
      adhdApplication: "Novelty with a finish line; learnable.",
      example: "8 personal outreach notes/week for 30 days → track conversations booked.",
    },
    {
      id: "trust-asset-ladder",
      name: "Trust Asset Ladder",
      category: "offers",
      purpose: "Build belief without daily posting.",
      whenToUse: ["invisible expertise", "feast/famine trust", "nobody knows i exist"],
      sparkExplanation: "A few strong proof pieces beat a fragile daily streak.",
      adhdApplication: "Batch-friendly; reusable.",
      example: "One case study · one FAQ · one 'how I work' page.",
    },
    {
      id: "soft-launch-loop",
      name: "Soft Launch Loop",
      category: "customer journey",
      purpose: "Launch without white-knuckle campaigns.",
      whenToUse: ["launches wipe me out", "big launch crashes energy", "launch planning"],
      sparkExplanation: "Tell a small warm circle, learn, then widen.",
      adhdApplication: "Lower stakes; restartable.",
      example: "10 past clients first → refine → public announcement.",
    },
  ],

  signatureQuestions: [
    {
      id: "repeat-back",
      text: "If someone repeated your offer back to a friend, what sentence do you hope they'd use?",
      reveals: "positioning clarity",
    },
    {
      id: "warm-attention",
      text: "Where do you already have warm attention you're underusing?",
      reveals: "channel fit",
    },
  ],

  adhdTranslations: [
    {
      id: "no-12-month-calendar",
      traditional: "12-month marketing plan",
      whyItFails:
        "Built in a hyperfocus weekend, abandoned by week three; the abandoned plan then becomes evidence of failure.",
      sparkAdaptation:
        "Before the big plan, build the simple version you can realistically maintain — one 30-day experiment with one metric.",
      whyBetter: "Finishable, learnable, and restartable without shame.",
      appliesWhen: ["marketing plan", "content calendar", "quarterly plan", "marketing strategy"],
    },
    {
      id: "no-post-everywhere",
      traditional: "Post daily on all platforms",
      whyItFails: "Executive-function collapse; the streak becomes the goal instead of the conversation.",
      sparkAdaptation:
        "One channel home, batch-friendly, quiet weeks allowed with a written way back in.",
      whyBetter: "Presence without fracture.",
      appliesWhen: ["visibility", "consistency", "posting", "channel overwhelm"],
    },
  ],

  knowledgeSources: {
    volatileTopics: [
      "platform features and reach",
      "ad benchmarks",
      "search or algorithm behavior",
    ],
    trustedSourceTypes: [
      "the member's own customer language (calls, emails, reviews)",
      "platform-native documentation",
      "recent competitor positioning",
      "reputable industry benchmark reports",
    ],
    evidenceStandard:
      "Enough to improve the message or design the experiment — never a reason to delay showing up.",
    researchTriggers: [
      "channel norms may have changed",
      "pricing or ad costs cited",
      "competitor claim needs checking",
    ],
  },

  profilePath:
    "docs/visual-spark-studios/Chamber-Member-Intelligence/Expert-Intelligence-Profiles/MKT_Expert_Intelligence_Profile.md",
};
