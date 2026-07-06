import type {
  ExecutiveAnswer,
  ExecutiveQuestionId,
  ExecutiveQuestionRelationship,
} from "../types";

type SampleAnswerRecord = Omit<ExecutiveAnswer, "questionId"> & {
  id: string;
};

export const SAMPLE_EXECUTIVE_ANSWERS: SampleAnswerRecord[] = [
  {
    id: "ans-product-build-next",
    summary: {
      headline: "Listening Rooms Expansion",
      narrative:
        "Member restart friction is the highest-leverage build. Listening Rooms already supports Companion re-entry — expanding calm estate scenes compounds trust before new features.",
    },
    evidence: [
      {
        id: "ev-lr-demand",
        title: "Customer demand for gentle re-entry",
        summary: "Repeated Companion themes: interruption recovery without productivity pressure.",
        source: { id: "src-feedback", kind: "customer-feedback", label: "Member feedback" },
        weight: 90,
      },
      {
        id: "ev-lr-mission",
        title: "Mission alignment",
        summary: "Listening Rooms mission at 64% progress with critical priority.",
        source: { id: "src-mission-lr", kind: "mission", label: "Mission Workspace" },
        weight: 88,
      },
      {
        id: "ev-companion-requests",
        title: "Companion requests",
        summary: "Members ask for a place to land before planning or creating.",
        source: { id: "src-companion", kind: "companion", label: "Companion signals" },
        weight: 82,
      },
    ],
    supportingResearch: [
      {
        id: "ev-research-restart",
        title: "ADHD restart research trend",
        summary: "Interruption recovery outranks net-new productivity features in SPARK patterns.",
        source: { id: "src-spark", kind: "spark", label: "SPARK patterns" },
        weight: 85,
      },
    ],
    relatedMissions: [
      {
        missionId: "listening-rooms",
        name: "Listening Rooms™",
        summary: "Calm estate re-entry — primary build focus.",
      },
      {
        missionId: "companion",
        name: "Spark Companion™",
        summary: "Relationship product benefits from calmer return rituals.",
      },
    ],
    relatedDecisions: [
      {
        id: "dec-invest-restart",
        title: "Invest in restart intelligence first",
        summary: "Executive Strategy Center — no dashboards before re-entry.",
        status: "decided",
      },
    ],
    recommendedActions: [
      {
        id: "act-continue-mission",
        label: "Continue current mission",
        summary: "Stay on Listening Rooms — next milestone: SPARK restart pattern wired.",
        priority: "critical",
      },
      {
        id: "act-review-roadmap",
        label: "Review roadmap",
        summary: "Confirm no competing build competes for executive attention this week.",
        priority: "medium",
      },
    ],
    confidence: {
      level: "high",
      score: 86,
      rationale: "Multiple independent signals — member voice, mission progress, SPARK pattern.",
    },
    priority: {
      level: "critical",
      score: 91,
      founderImportance: 94,
      customerImpact: 92,
      revenuePotential: 78,
      label: "critical",
    },
    openQuestions: [
      "Which estate scene ships next after Conservatory adjacency?",
      "Does Gentle Restart campaign wait for one more listening scene?",
    ],
    opportunities: [
      {
        id: "opp-restart-campaign",
        title: "Gentle Restart campaign",
        summary: "Marketing Launch mission ready when content approves.",
      },
    ],
    risks: [
      {
        id: "risk-scope-creep",
        title: "Scope creep into new dashboards",
        summary: "Fragmentation if build diverges from mission-first workspace.",
        severity: "medium",
      },
    ],
    insights: [
      {
        id: "ins-build-next",
        title: "Build depth before breadth",
        summary: "Members need one trustworthy return ritual more than five new rooms.",
      },
    ],
    relatedItems: [
      {
        id: "rel-roadmap-lr",
        kind: "roadmap",
        title: "Listening Rooms roadmap",
        summary: "Scene polish → SPARK wiring → PostCraft alignment.",
        refId: "listening-rooms",
      },
    ],
  },
  {
    id: "ans-content-create-next",
    summary: {
      headline: "Decision fatigue series",
      narrative:
        "A short content series on decision fatigue matches rising member questions and supports Workshop + PostCraft without overwhelming ADHD brains.",
    },
    evidence: [
      {
        id: "ev-member-requests-df",
        title: "Member requests",
        summary: "Increasing asks for help choosing between good options.",
        source: { id: "src-feedback-df", kind: "customer-feedback", label: "Member feedback" },
        weight: 88,
      },
      {
        id: "ev-search-df",
        title: "Search trends",
        summary: "Decision fatigue and prioritization queries trending in nurture segments.",
        source: { id: "src-analytics", kind: "analytics", label: "Analytics" },
        weight: 75,
      },
    ],
    supportingResearch: [
      {
        id: "ev-workshop-df",
        title: "Workshop relationship",
        summary: "Plan My Day workshop themes overlap — series feeds next cohort outline.",
        source: { id: "src-research", kind: "research", label: "Research library" },
        weight: 70,
      },
    ],
    relatedMissions: [
      {
        missionId: "postcraft",
        name: "PostCraft™",
        summary: "Primary creation surface for the series.",
      },
      {
        missionId: "workshop-series",
        name: "Workshop Series™",
        summary: "Live session can premiere one episode.",
      },
    ],
    relatedDecisions: [],
    recommendedActions: [
      {
        id: "act-draft-series",
        label: "Draft three-part outline in PostCraft",
        summary: "Permission before publish — align to Gentle Restart tone.",
        priority: "high",
      },
    ],
    confidence: { level: "medium", score: 72, rationale: "Strong member signal; draft not yet validated." },
    priority: {
      level: "high",
      score: 80,
      founderImportance: 75,
      customerImpact: 88,
      revenuePotential: 72,
      label: "high",
    },
    openQuestions: ["Newsletter first or social clips first?"],
    opportunities: [],
    risks: [],
    insights: [],
    relatedItems: [
      {
        id: "rel-postcraft-draft",
        kind: "postcraft",
        title: "PostCraft draft slot",
        summary: "Decision fatigue series — outline stage.",
        refId: "postcraft",
      },
    ],
  },
  {
    id: "ans-founder-attention-today",
    summary: {
      headline: "Listening Rooms — one primary action",
      narrative:
        "Today's executive attention belongs on the active mission. FIRE and Concierge agree: wire restart pattern before opening new surfaces.",
    },
    evidence: [
      {
        id: "ev-fire-today",
        title: "FIRE executive brief",
        summary: "Top priority: member trust through calm re-entry.",
        source: { id: "src-fire", kind: "fire", label: "FIRE portfolio" },
        weight: 90,
      },
    ],
    supportingResearch: [],
    relatedMissions: [
      {
        missionId: "listening-rooms",
        name: "Listening Rooms™",
        summary: "Active mission — 64% progress.",
      },
    ],
    relatedDecisions: [],
    recommendedActions: [
      {
        id: "act-mission-primary",
        label: "Open mission workspace",
        summary: "Continue building — SPARK restart pattern milestone.",
        priority: "critical",
      },
    ],
    confidence: { level: "high", score: 88, rationale: "Aligned across FIRE, mission, and daily workflow." },
    priority: {
      level: "critical",
      score: 93,
      founderImportance: 95,
      customerImpact: 90,
      revenuePotential: 70,
      label: "critical",
    },
    openQuestions: [],
    opportunities: [],
    risks: [],
    insights: [],
    relatedItems: [],
  },
  {
    id: "ans-founder-mission-forward",
    summary: {
      headline: "Move Listening Rooms forward",
      narrative: "Highest strategic value among active missions. Companion and Marketing Launch both depend on calm re-entry.",
    },
    evidence: [
      {
        id: "ev-mission-score",
        title: "Strategic value scoring",
        summary: "Listening Rooms: 92 strategic value, critical priority.",
        source: { id: "src-mission", kind: "mission", label: "Mission Engine" },
        weight: 92,
      },
    ],
    supportingResearch: [],
    relatedMissions: [
      {
        missionId: "listening-rooms",
        name: "Listening Rooms™",
        summary: "Primary mission to advance.",
      },
    ],
    relatedDecisions: [],
    recommendedActions: [
      {
        id: "act-continue-building",
        label: "Continue building",
        summary: "Next milestone: SPARK restart pattern wired.",
        priority: "critical",
      },
    ],
    confidence: { level: "high", score: 90, rationale: "Mission progress and relationships are clear." },
    priority: {
      level: "critical",
      score: 92,
      founderImportance: 94,
      customerImpact: 91,
      revenuePotential: 76,
      label: "critical",
    },
    openQuestions: [],
    opportunities: [],
    risks: [],
    insights: [],
    relatedItems: [],
  },
  {
    id: "ans-customers-adhd-struggles",
    summary: {
      headline: "Restart after interruption",
      narrative:
        "ADHD entrepreneurs struggle most with returning after life interrupts — not starting. Shame and decision fatigue compound the gap.",
    },
    evidence: [
      {
        id: "ev-companion-themes",
        title: "Companion conversation themes",
        summary: "Overwhelm, guilt about absence, and 'where do I even start?'",
        source: { id: "src-companion-2", kind: "companion", label: "Companion" },
        weight: 91,
      },
    ],
    supportingResearch: [],
    relatedMissions: [{ missionId: "companion", name: "Spark Companion™", summary: "Primary surface for struggle signals." }],
    relatedDecisions: [],
    recommendedActions: [
      {
        id: "act-capture-lesson",
        label: "Capture lesson in Memory",
        summary: "Institutionalize pattern for PostCraft and workshops.",
        priority: "medium",
      },
    ],
    confidence: { level: "high", score: 84, rationale: "Consistent across conversations and workshops." },
    priority: {
      level: "critical",
      score: 88,
      founderImportance: 85,
      customerImpact: 95,
      revenuePotential: 65,
      label: "critical",
    },
    openQuestions: [],
    opportunities: [],
    risks: [],
    insights: [],
    relatedItems: [],
  },
  {
    id: "ans-founder-decision-waiting",
    summary: {
      headline: "Workshop approval for Gentle Restart narrative",
      narrative: "Izna's workshop outline awaits founder approval before PostCraft series ships.",
    },
    evidence: [
      {
        id: "ev-team-approval",
        title: "Pending approval",
        summary: "Workshop-approval reminder in Team Hub.",
        source: { id: "src-team", kind: "team-hub", label: "Team Hub" },
        weight: 80,
      },
    ],
    supportingResearch: [],
    relatedMissions: [{ missionId: "workshop-series", name: "Workshop Series™", summary: "Blocked on approval." }],
    relatedDecisions: [
      {
        id: "dec-workshop-approve",
        title: "Approve workshop narrative",
        summary: "Permission gate before member-facing copy.",
        status: "pending",
      },
    ],
    recommendedActions: [
      {
        id: "act-review-approval",
        label: "Review approval",
        summary: "15-minute Decision Vault + Team Hub review.",
        priority: "high",
      },
    ],
    confidence: { level: "medium", score: 78, rationale: "Single blocker identified; may be others in vault." },
    priority: {
      level: "high",
      score: 79,
      founderImportance: 82,
      customerImpact: 70,
      revenuePotential: 68,
      label: "high",
    },
    openQuestions: ["Any copy changes before Izna proceeds?"],
    opportunities: [],
    risks: [],
    insights: [],
    relatedItems: [
      {
        id: "rel-decision-vault",
        kind: "decision",
        title: "Decision Vault entry",
        summary: "Workshop narrative approval",
        refId: "dec-workshop-approve",
      },
    ],
  },
  {
    id: "ans-team-izna-work",
    summary: {
      headline: "PostCraft Gentle Restart drafts",
      narrative: "Izna's highest leverage: finish nurture-aligned drafts for founder approval.",
    },
    evidence: [
      {
        id: "ev-postcraft-queue",
        title: "PostCraft queue",
        summary: "Decision fatigue series outline + Gentle Restart social clips.",
        source: { id: "src-postcraft", kind: "postcraft", label: "PostCraft" },
        weight: 85,
      },
    ],
    supportingResearch: [],
    relatedMissions: [{ missionId: "postcraft", name: "PostCraft™", summary: "Content mission active." }],
    relatedDecisions: [],
    recommendedActions: [
      {
        id: "act-assign-postcraft",
        label: "Assign PostCraft deliverable",
        summary: "One series outline due end of week.",
        priority: "high",
      },
    ],
    confidence: { level: "high", score: 82, rationale: "Clear queue from Team Hub sample." },
    priority: {
      level: "high",
      score: 81,
      founderImportance: 78,
      customerImpact: 75,
      revenuePotential: 80,
      label: "high",
    },
    openQuestions: [],
    opportunities: [],
    risks: [],
    insights: [],
    relatedItems: [],
  },
  {
    id: "ans-product-greatest-impact",
    summary: {
      headline: "Calm re-entry beats new features",
      narrative: "Greatest impact feature is restart intelligence surfaced through Listening Rooms — not another workspace.",
    },
    evidence: [
      {
        id: "ev-spark-impact",
        title: "SPARK impact scoring",
        summary: "pat-restart-001 ranks highest on customer impact dimension.",
        source: { id: "src-spark-2", kind: "spark", label: "SPARK" },
        weight: 93,
      },
    ],
    supportingResearch: [],
    relatedMissions: [{ missionId: "listening-rooms", name: "Listening Rooms™", summary: "Impact anchor mission." }],
    relatedDecisions: [],
    recommendedActions: [
      {
        id: "act-stay-course",
        label: "Stay the course",
        summary: "Decline interesting distractions until milestone ships.",
        priority: "critical",
      },
    ],
    confidence: { level: "high", score: 87, rationale: "SPARK and FIRE priorities align." },
    priority: {
      level: "critical",
      score: 90,
      founderImportance: 92,
      customerImpact: 94,
      revenuePotential: 74,
      label: "critical",
    },
    openQuestions: [],
    opportunities: [],
    risks: [],
    insights: [],
    relatedItems: [],
  },
  {
    id: "ans-business-opportunity-growing",
    summary: {
      headline: "Gentle Restart nurture opportunity",
      narrative: "Marketing Launch mission shows growing opportunity as Listening Rooms nears content-ready state.",
    },
    evidence: [
      {
        id: "ev-ghl-draft",
        title: "GHL funnel status",
        summary: "Nurture sequence draft ready for review.",
        source: { id: "src-ghl", kind: "ghl", label: "GoHighLevel" },
        weight: 76,
      },
    ],
    supportingResearch: [],
    relatedMissions: [{ missionId: "marketing-launch", name: "Marketing Launch™", summary: "Planned launch mission." }],
    relatedDecisions: [],
    recommendedActions: [
      {
        id: "act-size-opportunity",
        label: "Size the opportunity",
        summary: "Confirm list segment and launch window with FIRE.",
        priority: "medium",
      },
    ],
    confidence: { level: "medium", score: 70, rationale: "Opportunity growing; timing depends on mission milestone." },
    priority: {
      level: "high",
      score: 77,
      founderImportance: 72,
      customerImpact: 80,
      revenuePotential: 85,
      label: "high",
    },
    openQuestions: ["Launch before or after next listening scene?"],
    opportunities: [
      {
        id: "opp-ghl-nurture",
        title: "GHL nurture launch",
        summary: "Revenue-aligned restart campaign.",
      },
    ],
    risks: [],
    insights: [],
    relatedItems: [],
  },
];

export const SAMPLE_QUESTION_RELATIONSHIPS: ExecutiveQuestionRelationship[] = [
  {
    id: "qr-lr-build",
    questionId: "product-build-next",
    relatedKind: "mission",
    relatedId: "listening-rooms",
    summary: "Primary build answer ties to Listening Rooms mission.",
  },
  {
    id: "qr-lr-companion",
    questionId: "product-build-next",
    relatedKind: "companion",
    relatedId: "companion",
    summary: "Companion requests inform build priority.",
  },
  {
    id: "qr-content-postcraft",
    questionId: "content-create-next",
    relatedKind: "postcraft",
    relatedId: "postcraft",
    summary: "Content answers route through PostCraft.",
  },
  {
    id: "qr-content-workshop",
    questionId: "content-create-next",
    relatedKind: "research",
    relatedId: "workshop-series",
    summary: "Workshop themes feed content series.",
  },
  {
    id: "qr-founder-decision-vault",
    questionId: "founder-decision-waiting",
    relatedKind: "decision",
    relatedId: "decision-vault",
    summary: "Pending decisions live in Decision Vault.",
  },
  {
    id: "qr-team-hub-izna",
    questionId: "team-izna-work",
    relatedKind: "team-hub",
    relatedId: "team-hub",
    summary: "Assignments surface from Team Hub.",
  },
  {
    id: "qr-marketing-ghl",
    questionId: "marketing-campaign-launch",
    relatedKind: "ghl",
    relatedId: "marketing-launch",
    summary: "Campaign launch flows through GHL.",
  },
  {
    id: "qr-customers-feedback",
    questionId: "customers-adhd-struggles",
    relatedKind: "customer-feedback",
    relatedId: "member-voice",
    summary: "Member voice is primary evidence.",
  },
];

const ANSWER_BY_ID = new Map(SAMPLE_EXECUTIVE_ANSWERS.map((a) => [a.id, a]));

export function getSampleAnswerById(answerId: string): SampleAnswerRecord | undefined {
  return ANSWER_BY_ID.get(answerId);
}

export function getSampleAnswerForQuestion(
  questionId: ExecutiveQuestionId,
  sampleAnswerId?: string,
): ExecutiveAnswer | null {
  const record = sampleAnswerId ? ANSWER_BY_ID.get(sampleAnswerId) : undefined;
  if (!record) return null;
  const { id: _id, ...answer } = record;
  return { ...answer, questionId };
}

export const DEFAULT_RECOMMENDED_QUESTION_IDS: ExecutiveQuestionId[] = [
  "founder-attention-today",
  "product-build-next",
  "founder-mission-forward",
  "founder-decision-waiting",
  "content-create-next",
];
