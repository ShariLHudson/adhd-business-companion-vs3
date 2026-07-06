import type {
  AdvisoryDiscussionTopicId,
  AdvisoryMemberId,
  AdvisoryPerspective,
  AdvisoryRelationship,
  BoardConsensus,
  BoardDiscussion,
} from "../types";

const TS = "2026-07-06T11:00:00.000Z";

function perspective(
  partial: Omit<AdvisoryPerspective, "id"> & { id?: string },
): AdvisoryPerspective {
  return {
    id: partial.id ?? `pers-${partial.topicId}-${partial.memberId}`,
    ...partial,
  };
}

function conf(level: AdvisoryPerspective["confidence"]["level"], score: number, rationale: string) {
  return { level, score, rationale };
}

const LISTENING_ROOMS_PERSPECTIVES: AdvisoryPerspective[] = [
  perspective({
    topicId: "listening-rooms",
    memberId: "ceo",
    memberName: "CEO",
    memberRole: "Chief Executive",
    opportunities: ["Own the ADHD restart category with calm estate re-entry."],
    concerns: ["Diluting focus if we open new dashboards before restart works."],
    questions: ["Is this our defining member moment for 2026?"],
    recommendations: ["Treat Listening Rooms as flagship build through Q3."],
    unknowns: ["Competitive copy speed once we lead."],
    suggestedNextStep: "Confirm mission remains critical priority in FIRE brief.",
    evidenceRefs: [
      { id: "ev-lr-spark", kind: "spark", refId: "pat-restart-001", label: "SPARK restart pattern" },
    ],
    confidence: conf("high", 88, "Strategic alignment across mission and SPARK."),
  }),
  perspective({
    topicId: "listening-rooms",
    memberId: "marketing-director",
    memberName: "Marketing Director",
    memberRole: "Marketing",
    opportunities: ["Gentle Restart campaign finally has a believable destination."],
    concerns: ["Launching nurture before the scene feels real."],
    questions: ["Which visual becomes the campaign hero?"],
    recommendations: ["Hold GHL launch until one scene passes Photograph Test."],
    unknowns: ["Newsletter vs social lead for restart narrative."],
    suggestedNextStep: "Align PostCraft draft to estate scene screenshots.",
    evidenceRefs: [
      { id: "ev-lr-postcraft", kind: "campaign", refId: "marketing-launch", label: "Marketing Launch mission" },
    ],
    confidence: conf("medium", 76, "Strong narrative; asset timing uncertain."),
  }),
  perspective({
    topicId: "listening-rooms",
    memberId: "adhd-expert",
    memberName: "ADHD Expert",
    memberRole: "ADHD Entrepreneurship",
    opportunities: ["Clinical usefulness: shame-free return ritual."],
    concerns: ["Any productivity prompt before emotional landing."],
    questions: ["Can a member sit here without being asked to perform?"],
    recommendations: ["No tasks, no streaks — presence only on first return."],
    unknowns: ["How long members need before they choose to plan."],
    suggestedNextStep: "User-test copy with interruption recovery language.",
    evidenceRefs: [
      { id: "ev-lr-companion", kind: "customer-feedback", refId: "member-voice", label: "Companion themes" },
    ],
    confidence: conf("high", 91, "Consistent member voice on restart pain."),
  }),
  perspective({
    topicId: "listening-rooms",
    memberId: "operations",
    memberName: "Operations",
    memberRole: "Operations",
    opportunities: ["Reuses mission composer — no parallel ops surface."],
    concerns: ["Team pulled into estate art iterations without approval gates."],
    questions: ["Who owns scene QA checklist?"],
    recommendations: ["One approval path for estate backgrounds + flicker."],
    unknowns: ["Izna capacity during workshop season."],
    suggestedNextStep: "Single Team Hub deliverable for next scene polish.",
    evidenceRefs: [],
    confidence: conf("medium", 72, "Process clear; capacity is variable."),
  }),
  perspective({
    topicId: "listening-rooms",
    memberId: "finance",
    memberName: "Finance",
    memberRole: "Finance",
    opportunities: ["Revenue potential via improved retention and nurture conversion."],
    concerns: ["Hard to model ROI until restart metric exists."],
    questions: ["What is cost of one estate scene vs LTV lift?"],
    recommendations: ["Fund mission; defer paid acquisition scale."],
    unknowns: ["Exact conversion lift from calm re-entry."],
    suggestedNextStep: "Define simple retention proxy for board review.",
    evidenceRefs: [
      { id: "ev-lr-opp", kind: "opportunity", refId: "opp-listening-rooms-expansion", label: "Opportunity Discovery" },
    ],
    confidence: conf("medium", 68, "Directionally strong; quantification early."),
  }),
  perspective({
    topicId: "listening-rooms",
    memberId: "technology-advisor",
    memberName: "Technology Advisor",
    memberRole: "Technology",
    opportunities: ["Implementation via existing mission + estate stack."],
    concerns: ["Implementation effort if we fork conversation per room."],
    questions: ["Does conversation travel unchanged on room move?"],
    recommendations: ["Spec 108 continuity — compose, don't rebuild chat."],
    unknowns: ["Performance of multiple full-bleed scenes on mobile."],
    suggestedNextStep: "Architecture review: one composer path only.",
    evidenceRefs: [],
    confidence: conf("high", 84, "Patterns exist; execution discipline required."),
  }),
  perspective({
    topicId: "listening-rooms",
    memberId: "accessibility-expert",
    memberName: "Accessibility Expert",
    memberRole: "Accessibility & Inclusion",
    opportunities: ["Inclusiveness: low-energy return without reading walls of text."],
    concerns: ["Flicker motion without reduced-motion respect."],
    questions: ["Is voice optional on first landing?"],
    recommendations: ["Large type on glass; estate-light-flicker utilities only."],
    unknowns: ["Screen reader experience for scenic-only rooms."],
    suggestedNextStep: "Accessibility pass on Conservatory adjacency scene.",
    evidenceRefs: [],
    confidence: conf("medium", 75, "Principles clear; scene-level audit pending."),
  }),
];

const LISTENING_ROOMS_CONSENSUS: BoardConsensus = {
  agreement: [
    "Listening Rooms addresses the highest-trust member moment: return after interruption.",
    "Build depth before breadth — mission-first, not new dashboards.",
    "Marketing and GHL should wait until the estate moment is believable.",
  ],
  disagreement: [
    "Finance wants retention metrics now; Research wants more observation before quantifying.",
    "AI Advisor cautions voice capture timing; Product wants faster companion iteration.",
  ],
  openQuestions: [
    "How many listening scenes before Gentle Restart campaign?",
    "What is the minimum viable restart ritual members feel?",
  ],
  needsResearch: [
    "Compare interruption recovery patterns across three more member interviews.",
    "Mobile performance profile for full-bleed estate scenes.",
  ],
  needsFounderDecision: [
    "Approve next estate scene as campaign hero.",
    "Confirm no productivity prompts on first return visit.",
  ],
};

export const SAMPLE_BOARD_DISCUSSIONS: BoardDiscussion[] = [
  {
    id: "disc-listening-rooms",
    topicId: "listening-rooms",
    title: "Listening Rooms",
    question: "Should we build Listening Rooms?",
    summary:
      "Board aligns: calm re-entry is strategic flagship work. Disagreement is timing of marketing and measurement — not whether to build.",
    perspectives: LISTENING_ROOMS_PERSPECTIVES,
    consensus: LISTENING_ROOMS_CONSENSUS,
    links: [
      {
        id: "link-lr-mission",
        kind: "mission",
        refId: "listening-rooms",
        label: "Listening Rooms™ mission",
        summary: "Primary mission at 64% progress.",
      },
      {
        id: "link-lr-question",
        kind: "executive-question",
        refId: "product-build-next",
        label: "What should we build next?",
        summary: "Executive question answer points here.",
      },
      {
        id: "link-lr-opp",
        kind: "opportunity",
        refId: "opp-listening-rooms-expansion",
        label: "Listening Rooms expansion",
        summary: "Top discovery opportunity.",
      },
      {
        id: "link-lr-research",
        kind: "research",
        refId: "adhd-restart-research",
        label: "ADHD restart research",
        summary: "External validation of interruption recovery.",
      },
    ],
    missionIds: ["listening-rooms", "companion", "marketing-launch", "postcraft"],
    updatedAt: TS,
  },
  {
    id: "disc-founder-daily-workflow",
    topicId: "founder-daily-workflow",
    title: "Founder Daily Workflow",
    question: "Is today's work surfaced clearly enough for Shari?",
    summary: "Operations and CEO agree mission-first workflow reduces module hunting. Strategist wants tighter link to Executive Questions.",
    perspectives: [
      perspective({
        topicId: "founder-daily-workflow",
        memberId: "ceo",
        memberName: "CEO",
        memberRole: "Chief Executive",
        opportunities: ["One executive surface replaces dashboard scanning."],
        concerns: ["Duplicating FIRE and Mission headers."],
        questions: ["Does Shari still need separate FIRE view?"],
        recommendations: ["Keep workflow composer as single front door."],
        unknowns: [],
        suggestedNextStep: "Validate with one week of real use.",
        evidenceRefs: [],
        confidence: conf("high", 82, "Sprint 1 architecture shipped."),
      }),
      perspective({
        topicId: "founder-daily-workflow",
        memberId: "operations",
        memberName: "Operations",
        memberRole: "Operations",
        opportunities: ["Less context switching for founder and team."],
        concerns: ["Too many layers in assembled stack."],
        questions: ["Can we cap surface items at three?"],
        recommendations: ["Preserve cognitive load caps from Daily Workflow spec."],
        unknowns: [],
        suggestedNextStep: "Audit assembled stack depth quarterly.",
        evidenceRefs: [],
        confidence: conf("medium", 78, "Working; needs lived validation."),
      }),
    ],
    consensus: {
      agreement: ["Mission-first daily workflow beats module menus."],
      disagreement: ["Whether FIRE portfolio remains separate section."],
      openQuestions: ["When to fold Executive Questions into workflow?"],
      needsResearch: [],
      needsFounderDecision: ["Keep or merge FIRE block on Founder Home."],
    },
    links: [
      {
        id: "link-fdw-mission",
        kind: "mission",
        refId: "founder-studio",
        label: "Founder Studio™",
        summary: "Daily workflow serves this mission.",
      },
    ],
    missionIds: ["founder-studio"],
    updatedAt: TS,
  },
  {
    id: "disc-voice-companion",
    topicId: "voice-companion",
    title: "Voice Companion",
    question: "Should we move toward voice-first capture?",
    summary: "Split board: ADHD Expert and Accessibility see opportunity; AI Advisor and Behavioral Psychology urge trust-first delay.",
    perspectives: [
      perspective({
        topicId: "voice-companion",
        memberId: "adhd-expert",
        memberName: "ADHD Expert",
        memberRole: "ADHD Entrepreneurship",
        opportunities: ["Speaking when typing fails during overwhelm."],
        concerns: ["Pushy mic prompts feel surveillant."],
        questions: ["Is voice invited or assumed?"],
        recommendations: ["Observe Rule of Three — no prompt changes yet."],
        unknowns: ["Long-term voice data stewardship."],
        suggestedNextStep: "Document pattern only this quarter.",
        evidenceRefs: [
          { id: "ev-voice-analytics", kind: "analytics", refId: "voice-capture", label: "Capture analytics" },
        ],
        confidence: conf("medium", 70, "Signal present; trust design unresolved."),
      }),
      perspective({
        topicId: "voice-companion",
        memberId: "ai-advisor",
        memberName: "AI Advisor",
        memberRole: "AI & Companion Integrity",
        opportunities: ["Differentiation vs text-only AI apps."],
        concerns: ["Relationship erosion if voice feels performative."],
        questions: ["Does this pass the Shari test out loud?"],
        recommendations: ["No implementation without hospitality review."],
        unknowns: [],
        suggestedNextStep: "Log to Observation Mode — do not ship.",
        evidenceRefs: [],
        confidence: conf("medium", 65, "High stakes for companion trust."),
      }),
    ],
    consensus: {
      agreement: ["Voice can support executive function when optional and calm."],
      disagreement: ["Timing: Product curiosity vs AI Advisor caution."],
      openQuestions: ["Permission model for persistent voice memory?"],
      needsResearch: ["Member interviews on voice trust boundaries."],
      needsFounderDecision: ["Whether voice is 2026 roadmap or observation only."],
    },
    links: [
      { id: "link-vc-mission", kind: "mission", refId: "companion", label: "Companion mission", summary: "" },
      { id: "link-vc-opp", kind: "opportunity", refId: "opp-voice-first-companion", label: "Voice-first opportunity", summary: "" },
    ],
    missionIds: ["companion"],
    updatedAt: TS,
  },
  {
    id: "disc-decision-fatigue-workshop",
    topicId: "decision-fatigue-workshop",
    title: "Decision Fatigue Workshop",
    question: "Should we run a Decision Fatigue workshop next?",
    summary: "Strong alignment: Learning Designer, Sales, and Marketing support one live cohort as validation.",
    perspectives: [
      perspective({
        topicId: "decision-fatigue-workshop",
        memberId: "learning-designer",
        memberName: "Learning Designer",
        memberRole: "Learning Experience",
        opportunities: ["One-session proof before course investment."],
        concerns: ["Overpacking content into 90 minutes."],
        questions: ["What single decision will members leave with?"],
        recommendations: ["Outline three beats: name, narrow, next kind step."],
        unknowns: [],
        suggestedNextStep: "Approve Izna outline in Team Hub.",
        evidenceRefs: [],
        confidence: conf("high", 85, "Member demand + PostCraft draft exist."),
      }),
      perspective({
        topicId: "decision-fatigue-workshop",
        memberId: "sales-director",
        memberName: "Sales Director",
        memberRole: "Revenue",
        opportunities: ["Workshop as offer ladder rung."],
        concerns: ["Pricing before proof of transformation."],
        questions: ["Who is ideal first cohort?"],
        recommendations: ["Small cohort, high touch, testimonial capture."],
        unknowns: [],
        suggestedNextStep: "Set cohort size cap at 12.",
        evidenceRefs: [],
        confidence: conf("medium", 80, "Standard workshop playbook applies."),
      }),
    ],
    consensus: {
      agreement: ["Run one Decision Fatigue workshop before micro-learning or course."],
      disagreement: [],
      openQuestions: ["Live vs hybrid format?"],
      needsResearch: [],
      needsFounderDecision: ["Approve workshop narrative for member-facing copy."],
    },
    links: [
      { id: "link-dfw-workshop", kind: "workshop", refId: "decision-fatigue", label: "Workshop outline", summary: "" },
      { id: "link-dfw-mission", kind: "mission", refId: "workshop-series", label: "Workshop Series™", summary: "" },
    ],
    missionIds: ["workshop-series", "postcraft"],
    updatedAt: TS,
  },
  {
    id: "disc-executive-brief",
    topicId: "executive-brief",
    title: "Executive Brief",
    question: "Is FIRE giving Shari the right executive orientation?",
    summary: "CEO and Research trust FIRE; Operations asks for audio digest pilot.",
    perspectives: [
      perspective({
        topicId: "executive-brief",
        memberId: "ceo",
        memberName: "CEO",
        memberRole: "Chief Executive",
        opportunities: ["One brief reduces decision fatigue."],
        concerns: ["Competing with Mission header."],
        questions: ["Is FIRE still needed daily if Mission Workspace leads?"],
        recommendations: ["FIRE supports; Mission leads."],
        unknowns: [],
        suggestedNextStep: "Keep FIRE below mission workspace.",
        evidenceRefs: [{ id: "ev-fire", kind: "spark", refId: "fire-portfolio", label: "FIRE portfolio" }],
        confidence: conf("high", 86, "Architecture composed correctly."),
      }),
    ],
    consensus: {
      agreement: ["FIRE remains valuable as executive evidence layer."],
      disagreement: ["Audio brief pilot vs stay text-only."],
      openQuestions: [],
      needsResearch: [],
      needsFounderDecision: ["Pilot founder audio digest from FIRE."],
    },
    links: [{ id: "link-eb-mission", kind: "mission", refId: "founder-studio", label: "Founder Studio™", summary: "" }],
    missionIds: ["founder-studio"],
    updatedAt: TS,
  },
  {
    id: "disc-micro-learning",
    topicId: "micro-learning",
    title: "Micro-learning Academy",
    question: "When should we invest in micro-learning?",
    summary: "Board says wait for workshop proof — Learning Designer agrees.",
    perspectives: [
      perspective({
        topicId: "micro-learning",
        memberId: "learning-designer",
        memberName: "Learning Designer",
        memberRole: "Learning Experience",
        opportunities: ["Async depth for members who miss live workshops."],
        concerns: ["Building course infrastructure before workshop NPS."],
        questions: ["What clip length respects ADHD attention?"],
        recommendations: ["Watch Decision Fatigue workshop outcomes first."],
        unknowns: ["Platform choice for micro-lessons."],
        suggestedNextStep: "Park until workshop completes.",
        evidenceRefs: [],
        confidence: conf("medium", 60, "Logical sequence; premature now."),
      }),
    ],
    consensus: {
      agreement: ["Micro-learning follows workshop validation."],
      disagreement: [],
      openQuestions: ["Clip vs written micro-lesson default?"],
      needsResearch: ["Workshop replay engagement metrics."],
      needsFounderDecision: [],
    },
    links: [{ id: "link-ml-opp", kind: "opportunity", refId: "opp-micro-learning-academy", label: "Micro-learning opportunity", summary: "" }],
    missionIds: ["workshop-series"],
    updatedAt: TS,
  },
  {
    id: "disc-pinterest-strategy",
    topicId: "pinterest-strategy",
    title: "Pinterest Strategy",
    question: "Should we invest in Pinterest now?",
    summary: "Marketing curious; CEO and Strategist say ignore until Listening Rooms narrative ships.",
    perspectives: [
      perspective({
        topicId: "pinterest-strategy",
        memberId: "marketing-director",
        memberName: "Marketing Director",
        memberRole: "Marketing",
        opportunities: ["Visual calm may match estate brand on Pinterest."],
        concerns: ["Channel without mission-linked content."],
        questions: ["Do we have enough art-directed scenes?"],
        recommendations: ["Revisit after Gentle Restart assets exist."],
        unknowns: ["Organic reach vs paid test cost."],
        suggestedNextStep: "Keep on watch list — status ignored.",
        evidenceRefs: [],
        confidence: conf("low", 48, "Competitor signal only."),
      }),
      perspective({
        topicId: "pinterest-strategy",
        memberId: "strategist",
        memberName: "Strategist",
        memberRole: "Executive Strategy",
        opportunities: ["Top-of-funnel discovery later."],
        concerns: ["Distraction from mission chain."],
        questions: ["Does Pinterest advance restart narrative?"],
        recommendations: ["Explicitly defer to Q4 review."],
        unknowns: [],
        suggestedNextStep: "No resource allocation this sprint.",
        evidenceRefs: [],
        confidence: conf("medium", 70, "Clear deprioritization case."),
      }),
    ],
    consensus: {
      agreement: ["Defer Pinterest until Listening Rooms content exists."],
      disagreement: [],
      openQuestions: [],
      needsResearch: ["Member Pinterest usage survey."],
      needsFounderDecision: [],
    },
    links: [{ id: "link-pin-opp", kind: "opportunity", refId: "opp-pinterest-strategy", label: "Pinterest opportunity", summary: "" }],
    missionIds: ["postcraft", "marketing-launch"],
    updatedAt: TS,
  },
  {
    id: "disc-automation-studio",
    topicId: "automation-studio",
    title: "Automation Studio",
    question: "What should we automate without harming relationship?",
    summary: "Operations and Technology favor GHL nurture automation; AI Advisor warns against automating companion voice.",
    perspectives: [
      perspective({
        topicId: "automation-studio",
        memberId: "operations",
        memberName: "Operations",
        memberRole: "Operations",
        opportunities: ["Repeated manual nurture steps via GHL."],
        concerns: ["Automating permission-sensitive companion moments."],
        questions: ["What must stay human-in-the-loop?"],
        recommendations: ["Automate logistics; never automate belonging."],
        unknowns: [],
        suggestedNextStep: "Document GHL draft automation spec only.",
        evidenceRefs: [],
        confidence: conf("medium", 74, "Clear boundary principle."),
      }),
      perspective({
        topicId: "automation-studio",
        memberId: "ai-advisor",
        memberName: "AI Advisor",
        memberRole: "AI & Companion Integrity",
        opportunities: ["Invisible organization behind the scenes."],
        concerns: ["Members feeling 'processed' by funnels."],
        questions: ["Does automation feel like Spark or like software?"],
        recommendations: ["Spec 118 hidden work — silent, permission-gated."],
        unknowns: [],
        suggestedNextStep: "No companion automation this year.",
        evidenceRefs: [],
        confidence: conf("high", 88, "Aligns with hospitality specs."),
      }),
    ],
    consensus: {
      agreement: ["Automate logistics; protect companion relationship."],
      disagreement: ["How aggressive GHL nurture timing should be."],
      openQuestions: ["Approval gate for automated sends?"],
      needsResearch: [],
      needsFounderDecision: ["Approve GHL nurture draft when content ready."],
    },
    links: [{ id: "link-auto-campaign", kind: "campaign", refId: "gentle-restart", label: "Gentle Restart", summary: "" }],
    missionIds: ["marketing-launch"],
    updatedAt: TS,
  },
];

export const SAMPLE_ADVISORY_RELATIONSHIPS: AdvisoryRelationship[] = SAMPLE_BOARD_DISCUSSIONS.flatMap(
  (disc) =>
    disc.links.map((link) => ({
      id: `ar-${disc.topicId}-${link.id}`,
      topicId: disc.topicId,
      link,
    })),
);

const DISC_BY_TOPIC = new Map(SAMPLE_BOARD_DISCUSSIONS.map((d) => [d.topicId, d]));

export function getSampleDiscussion(topicId: AdvisoryDiscussionTopicId): BoardDiscussion | undefined {
  return DISC_BY_TOPIC.get(topicId);
}

export function listSampleDiscussions(): BoardDiscussion[] {
  return [...SAMPLE_BOARD_DISCUSSIONS];
}

export function getSamplePerspective(
  topicId: AdvisoryDiscussionTopicId,
  memberId: AdvisoryMemberId,
): AdvisoryPerspective | undefined {
  const disc = getSampleDiscussion(topicId);
  return disc?.perspectives.find((p) => p.memberId === memberId);
}

export const MISSION_TOPIC_MAP: Record<string, AdvisoryDiscussionTopicId> = {
  "listening-rooms": "listening-rooms",
  "founder-studio": "founder-daily-workflow",
  companion: "voice-companion",
  "workshop-series": "decision-fatigue-workshop",
  postcraft: "pinterest-strategy",
  "marketing-launch": "automation-studio",
  estate: "listening-rooms",
};

export const QUESTION_TOPIC_MAP: Record<string, AdvisoryDiscussionTopicId> = {
  "product-build-next": "listening-rooms",
  "founder-attention-today": "founder-daily-workflow",
  "founder-decision-waiting": "decision-fatigue-workshop",
  "content-create-next": "decision-fatigue-workshop",
  "business-automate": "automation-studio",
};

export const DECISION_TOPIC_MAP: Record<string, AdvisoryDiscussionTopicId> = {
  "dec-invest-restart": "listening-rooms",
  "dec-workshop-approve": "decision-fatigue-workshop",
};
