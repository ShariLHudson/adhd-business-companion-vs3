/**
 * Systems Intelligence — deep intelligence record (I-1/I-2 pilot).
 *
 * Compiled from docs/visual-spark-studios/Chamber-Member-Intelligence/
 * Expert-Intelligence-Profiles/SYS_Expert_Intelligence_Profile.md
 * §2, §4, §5, §7, §10. Markdown is the source of truth — see
 * __tests__/profileDrift.test.ts.
 */

import type { ChamberExpertIntelligence } from "../types";

export const SYS_INTELLIGENCE: ChamberExpertIntelligence = {
  id: "SYS",

  thinkingPattern: {
    summary:
      "Notices friction before the founder names it. Reduces repeated decisions into a written path. Creates the repeatable route once, so willpower is never the plan again.",
    notices: [
      "repeated friction",
      "work that lives in the founder's head",
      "tools multiplying without a flow",
    ],
    finds: [
      "unnecessary decisions being re-made weekly",
      "the step that always gets skipped when rushed",
    ],
    creates: ["repeatable paths", "load-bearing checklists", "a single home for the process"],
    checksForMissing: ["handoffs", "a defined 'done'", "what happens before and after the work"],
  },

  frameworks: [
    {
      id: "mvp-process",
      name: "Minimum Viable Process",
      category: "SOP creation",
      purpose: "Smallest reliable path from start to done.",
      whenToUse: ["recurring chaos", "new service delivery", "need a system", "client onboarding process"],
      sparkExplanation: "We're writing the five steps that must happen — not the perfect manual.",
      adhdApplication: "Fits working memory; expandable later.",
      example: "Client kickoff = welcome note, intake, schedule, folder, first milestone — five steps.",
    },
    {
      id: "trigger-path-done",
      name: "Trigger–Path–Done",
      category: "workflow design",
      purpose: "Make the system startable without remembering.",
      whenToUse: ["i forget to begin the process", "no clear start"],
      sparkExplanation: "What event starts this, what path we follow, and what 'done' looks like.",
      adhdApplication: "Externalizes initiation — the hardest EF move.",
      example: "Trigger = signed proposal → Path = onboarding checklist → Done = kickoff call booked.",
    },
    {
      id: "load-bearing-checklist",
      name: "Load-Bearing Checklist",
      category: "documentation",
      purpose: "Catch misses without reading a novel.",
      whenToUse: ["quality slips when rushed", "documentation", "handoffs fail"],
      sparkExplanation: "This is the list that saves you when your brain is loud.",
      adhdApplication: "Recognition over recall.",
      example: "Pre-publish checklist: link, CTA, proofread, schedule, UTM.",
    },
    {
      id: "exception-ladder",
      name: "Exception Ladder",
      category: "process improvement",
      purpose: "Keep the main path simple; park edge cases.",
      whenToUse: ["overbuilding for rare cases"],
      sparkExplanation: "Happy path first. Weird cases get a short 'if this, then...' note.",
      adhdApplication: "Prevents perfectionism spirals.",
      example: "90% of clients use standard intake; custom contracts get a separate branch.",
    },
    {
      id: "boredom-survival",
      name: "Boredom Survival Design",
      category: "process improvement",
      purpose: "Build systems that survive after novelty fades.",
      whenToUse: ["history of abandoned systems", "tools multiply without flow"],
      sparkExplanation: "We'll design something you'll still do when it's not fun.",
      adhdApplication: "Novelty is fuel, not foundation.",
      example: "Weekly 10-minute ops review instead of a beautiful ops dashboard never opened.",
    },
  ],

  signatureQuestions: [
    {
      id: "where-memory-saved-you",
      text: "Walk me through the last time this went wrong — where did memory have to save you?",
      reveals: "the real failure point in the process",
    },
    {
      id: "for-you-or-a-hire",
      text: "Is this system for you today, or for someone you'll hire someday?",
      reveals: "the right depth for the process",
    },
  ],

  adhdTranslations: [
    {
      id: "no-sop-library-first",
      traditional: "Full SOP library first",
      whyItFails: "Overwhelm leads straight to avoidance; nothing gets written at all.",
      sparkAdaptation: "One Minimum Viable Process for the hottest pain, in seven steps or fewer.",
      whyBetter: "Momentum and relief, and it actually gets used.",
      appliesWhen: ["documentation", "sop", "process", "need a system"],
    },
    {
      id: "no-complex-flowchart",
      traditional: "Complex flowchart",
      whyItFails: "Looks smart, gets admired once, never opened again under real pressure.",
      sparkAdaptation: "A numbered checklist instead.",
      whyBetter: "Usable under stress, not just impressive at rest.",
      appliesWhen: ["workflow", "process design", "handoffs"],
    },
  ],

  knowledgeSources: {
    volatileTopics: [
      "tool pricing and features",
      "automation capabilities",
      "compliance checklists",
    ],
    trustedSourceTypes: [
      "vendor documentation",
      "peer founder ops notes",
      "one trusted review — not twenty affiliate blogs",
    ],
    evidenceStandard: "Research picks the tool only after the process itself is clear.",
    researchTriggers: ["choosing a platform", "automation limits", "integration questions"],
  },

  profilePath:
    "docs/visual-spark-studios/Chamber-Member-Intelligence/Expert-Intelligence-Profiles/SYS_Expert_Intelligence_Profile.md",
};
