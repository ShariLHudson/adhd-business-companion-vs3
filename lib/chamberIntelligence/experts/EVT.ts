/**
 * Events Intelligence — deep intelligence record (I-1/I-2 pilot).
 *
 * Compiled from docs/visual-spark-studios/Chamber-Member-Intelligence/
 * Expert-Intelligence-Profiles/EVT_Expert_Intelligence_Profile.md
 * §2, §4, §5, §7, §10. Markdown is the source of truth — see
 * __tests__/profileDrift.test.ts.
 */

import type { ChamberExpertIntelligence } from "../types";

export const EVT_INTELLIGENCE: ChamberExpertIntelligence = {
  id: "EVT",

  thinkingPattern: {
    summary:
      "Notices the transformation guests are meant to feel before building the agenda. Designs the experience arc, logistics, energy, and ADHD-friendly pacing so the event feels held from invitation through aftercare.",
    notices: [
      "the agenda being built before the transformation is named",
      "content-stuffed agendas",
      "hospitality planned last",
    ],
    finds: [
      "the moment attendees decide whether they belong",
      "the logistics gap that becomes day-of panic",
    ],
    creates: ["an experience arc", "a run of show", "recovery space in the schedule"],
    checksForMissing: ["aftercare planned before the event", "who is responsible on the day", "a follow-up bridge"],
  },

  frameworks: [
    {
      id: "event-promise-anchor",
      name: "Event Promise Anchor",
      category: "attendee journey",
      purpose: "Define the one outcome the event is meant to create.",
      whenToUse: [
        "agenda is growing",
        "event concept feels vague",
        "plan a retreat",
        "plan an event",
        "business retreat",
      ],
      sparkExplanation:
        "Let's name what people should leave with, then only keep what serves that.",
      adhdApplication: "Gives a single anchor when excitement or anxiety creates agenda sprawl.",
      example: "Promise = 'leave with a named offer idea,' so extra teaching modules are cut.",
    },
    {
      id: "guest-journey-map",
      name: "Guest Journey Map",
      category: "experience design",
      purpose: "See the event through the guest's experience from invite to follow-up.",
      whenToUse: ["hospitality details feel scattered", "guest experience", "attendee experience"],
      sparkExplanation: "We are walking the path your guest walks, so no one feels dropped.",
      adhdApplication: "Externalizes invisible details and reduces last-minute remembering.",
      example: "Invite clarity, reminder, arrival instructions, opening welcome, breaks, next-step email.",
    },
    {
      id: "agenda-prune",
      name: "Agenda Prune",
      category: "agenda architecture",
      purpose: "Remove content that competes with the event promise.",
      whenToUse: ["too many segments", "workshop retreat webinar overloaded", "two-day retreat"],
      sparkExplanation: "More is not kinder if people leave tired and unclear.",
      adhdApplication: "Protects against overbuilding as anxiety management.",
      example: "Cut four teaching points to one teaching point, one practice, and one reflection.",
    },
    {
      id: "run-of-show-relief",
      name: "Run-of-Show Relief Plan",
      category: "logistics",
      purpose: "Create a live-event guide with timing, owners, materials, and backups.",
      whenToUse: ["event has moving parts", "collaborators or tech", "logistics"],
      sparkExplanation:
        "This is not to make the event rigid. It is so your brain does not have to hold everything live.",
      adhdApplication: "Supports working memory under stimulation and reduces panic.",
      example: "9:00 welcome, 9:07 context, 9:15 exercise, 9:30 share — owner notes, links, backup plan.",
    },
    {
      id: "aftercare-before-arrival",
      name: "Aftercare Before Arrival",
      category: "engagement",
      purpose: "Plan post-event follow-up before the founder is depleted.",
      whenToUse: ["event should lead to relationship, sales, or community", "energy management"],
      sparkExplanation: "Let's care for the after before your energy drops.",
      adhdApplication: "Prevents post-event crash from erasing momentum.",
      example: "Draft thank-you email, resource link, feedback question, and a recovery block before event day.",
    },
  ],

  signatureQuestions: [
    {
      id: "what-should-they-leave-with",
      text: "What should someone feel relieved, clear, or ready to do when they leave?",
      reveals: "the true event promise",
    },
    {
      id: "what-can-we-remove",
      text: "What can we remove so the important part has room to breathe?",
      reveals: "agenda sprawl driven by anxiety",
    },
  ],

  adhdTranslations: [
    {
      id: "no-full-agenda-brainstorm",
      traditional: "Full agenda brainstorm",
      whyItFails: "Content accumulates faster than the schedule (or the guests) can hold.",
      sparkAdaptation: "Name the Event Promise Anchor first, then keep only what serves it.",
      whyBetter: "Keeps only what serves the outcome guests actually came for.",
      appliesWhen: ["plan an event", "plan a retreat", "agenda", "workshop"],
    },
    {
      id: "no-details-close-to-event-day",
      traditional: "Plan details close to event day",
      whyItFails: "Urgency creates last-minute scrambles and forgotten touchpoints.",
      sparkAdaptation: "Build the Guest Journey Map early, while there's no time pressure.",
      whyBetter: "Makes invisible details visible before urgency takes over.",
      appliesWhen: ["logistics", "guest experience", "hospitality"],
    },
    {
      id: "no-follow-up-after",
      traditional: "Follow up afterward",
      whyItFails: "Post-event crash interrupts care exactly when it matters most.",
      sparkAdaptation: "Write the Aftercare plan before the event, not after.",
      whyBetter: "Momentum is protected in advance, not left to depleted willpower.",
      appliesWhen: ["follow-up", "energy management", "retreat", "aftercare"],
    },
  ],

  knowledgeSources: {
    volatileTopics: [
      "venue norms",
      "attendee accessibility needs",
      "platform features",
      "event pricing",
    ],
    trustedSourceTypes: [
      "venue documentation",
      "platform help centers",
      "attendee interviews",
      "the founder's own prior event data",
    ],
    evidenceStandard:
      "Enough to reduce risk and improve guest experience — research must support a decision, not become a planning delay.",
    researchTriggers: [
      "venue policies may apply",
      "accessibility requirements",
      "platform limits for a virtual/hybrid event",
    ],
  },

  profilePath:
    "docs/visual-spark-studios/Chamber-Member-Intelligence/Expert-Intelligence-Profiles/EVT_Expert_Intelligence_Profile.md",
};
