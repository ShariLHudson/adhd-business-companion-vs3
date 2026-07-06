import type {
  EstateThinkingPlace,
  StrategyBoardMember,
  StrategyCenterBootstrap,
  StrategyDecisionSummary,
  StrategyIdeaCard,
  StrategyMeetingNotes,
  StrategyPerspective,
  StrategySession,
  StrategySessionMeta,
  StrategyTool,
} from "../types";

export const STRATEGY_TOOLS: StrategyTool[] = [
  { id: "whiteboard", label: "Whiteboard", description: "Open surface for freeform thinking" },
  { id: "mind-map", label: "Mind Map", description: "Branch ideas from a central theme" },
  { id: "sticky-notes", label: "Sticky Notes", description: "Capture and cluster quick thoughts" },
  { id: "decision-canvas", label: "Decision Canvas", description: "Frame the choice clearly" },
  { id: "pros-cons", label: "Pros & Cons", description: "Balance upside and risk" },
  { id: "swot", label: "SWOT", description: "Strengths, weaknesses, opportunities, threats" },
  {
    id: "opportunity-matrix",
    label: "Opportunity Matrix",
    description: "Impact versus effort",
  },
  {
    id: "priority-matrix",
    label: "Priority Matrix",
    description: "Urgent versus important",
  },
];

export const STRATEGY_PERSPECTIVES: StrategyPerspective[] = [
  {
    id: "ceo",
    role: "CEO Perspective",
    keyQuestion: "Does this strengthen the company we are building?",
    insight: "Placeholder — future FLAME™ lens on leadership and direction.",
    initials: "CEO",
  },
  {
    id: "visionary",
    role: "Visionary",
    keyQuestion: "What future are we inviting people into?",
    insight: "Placeholder — long-horizon imagination without losing today's footing.",
    initials: "V",
  },
  {
    id: "strategist",
    role: "Strategist",
    keyQuestion: "What sequence makes this real?",
    insight: "Placeholder — sequencing, tradeoffs, and coherent moves.",
    initials: "ST",
  },
  {
    id: "marketing",
    role: "Marketing",
    keyQuestion: "Who needs to hear this — and why now?",
    insight: "Placeholder — message, audience, and timing.",
    initials: "MK",
  },
  {
    id: "sales",
    role: "Sales",
    keyQuestion: "What would make someone say yes with confidence?",
    insight: "Placeholder — offer clarity and trust at the moment of decision.",
    initials: "SL",
  },
  {
    id: "customer-experience",
    role: "Customer Experience",
    keyQuestion: "How will this feel in their hands?",
    insight: "Placeholder — hospitality, friction, and dignity in every touch.",
    initials: "CX",
  },
  {
    id: "adhd",
    role: "ADHD Perspective",
    keyQuestion: "Where will executive function break down?",
    insight: "Placeholder — reduce memory load, decision fatigue, and shame.",
    initials: "AD",
  },
  {
    id: "innovation",
    role: "Innovation",
    keyQuestion: "What has not been tried — but should be?",
    insight: "Placeholder — experiments worth protecting.",
    initials: "IN",
  },
  {
    id: "operations",
    role: "Operations",
    keyQuestion: "Can we deliver this reliably?",
    insight: "Placeholder — capacity, handoffs, and calm execution.",
    initials: "OP",
  },
  {
    id: "education",
    role: "Education",
    keyQuestion: "What will people understand after this?",
    insight: "Placeholder — teaching without overwhelming.",
    initials: "ED",
  },
  {
    id: "accessibility",
    role: "Accessibility",
    keyQuestion: "Who might be left out — and how do we include them?",
    insight: "Placeholder — design for real bodies, minds, and circumstances.",
    initials: "A11y",
  },
  {
    id: "finance",
    role: "Finance",
    keyQuestion: "What does this cost — and what does it return?",
    insight: "Placeholder — runway, margin, and honest numbers.",
    initials: "FN",
  },
  {
    id: "legal",
    role: "Legal",
    keyQuestion: "What general business risks should we notice?",
    insight: "Placeholder — contracts, compliance, and prudent guardrails.",
    initials: "LG",
  },
  {
    id: "product",
    role: "Product",
    keyQuestion: "What problem are we actually solving?",
    insight: "Placeholder — member outcome before feature list.",
    initials: "PD",
  },
  {
    id: "ux",
    role: "UX",
    keyQuestion: "What should be obvious without explanation?",
    insight: "Placeholder — clarity, calm, and the next obvious step.",
    initials: "UX",
  },
  {
    id: "brand",
    role: "Brand",
    keyQuestion: "Does this feel like Spark?",
    insight: "Placeholder — warmth, premium estate, and earned trust.",
    initials: "BR",
  },
];

export const STRATEGY_BOARD: StrategyBoardMember[] = [
  {
    id: "board-ceo",
    role: "CEO",
    expertise: "Company direction and executive judgment",
    currentFocus: "Ecosystem coherence and founder leverage",
    availability: "available",
    initials: "CEO",
  },
  {
    id: "board-visionary",
    role: "Visionary",
    expertise: "Ten-year imagination and category creation",
    currentFocus: "Spark as lifelong companion, not software",
    availability: "in-session",
    initials: "V",
  },
  {
    id: "board-strategist",
    role: "Strategist",
    expertise: "Sequencing, positioning, and tradeoffs",
    currentFocus: "Founder Studio rollout phases",
    availability: "available",
    initials: "ST",
  },
  {
    id: "board-marketing",
    role: "Marketing",
    expertise: "Story, audience, and launch rhythm",
    currentFocus: "Workshop and course narratives",
    availability: "reserved",
    initials: "MK",
  },
  {
    id: "board-sales",
    role: "Sales",
    expertise: "Offers, conversion, and trust",
    currentFocus: "High-ticket clarity without pressure",
    availability: "available",
    initials: "SL",
  },
  {
    id: "board-operations",
    role: "Operations",
    expertise: "Delivery systems and team handoffs",
    currentFocus: "Team Hub execution paths",
    availability: "available",
    initials: "OP",
  },
  {
    id: "board-cx",
    role: "Customer Experience",
    expertise: "Member feeling and hospitality",
    currentFocus: "Relationship Constitution in every room",
    availability: "in-session",
    initials: "CX",
  },
  {
    id: "board-innovation",
    role: "Innovation",
    expertise: "Experiments and future product seeds",
    currentFocus: "Executive thinking environments",
    availability: "available",
    initials: "IN",
  },
  {
    id: "board-education",
    role: "Education",
    expertise: "Curriculum and transformation design",
    currentFocus: "Capability building over content volume",
    availability: "available",
    initials: "ED",
  },
  {
    id: "board-accessibility",
    role: "Accessibility",
    expertise: "Inclusive design and cognitive load",
    currentFocus: "ADHD-first executive function support",
    availability: "available",
    initials: "A11y",
  },
  {
    id: "board-product",
    role: "Product",
    expertise: "Member outcomes and product integrity",
    currentFocus: "Conversation as the product",
    availability: "reserved",
    initials: "PD",
  },
  {
    id: "board-brand",
    role: "Brand",
    expertise: "Spark Estate identity and voice",
    currentFocus: "Premium calm — never dashboard energy",
    availability: "available",
    initials: "BR",
  },
  {
    id: "board-adhd",
    role: "ADHD Success",
    expertise: "Real executive function in entrepreneurship",
    currentFocus: "Thinking environments that reduce shame",
    availability: "in-session",
    initials: "AD",
  },
];

export const ESTATE_THINKING_PLACES: EstateThinkingPlace[] = [
  {
    id: "round-table",
    label: "The Round Table",
    href: "/companion",
    feeling: "Gathered judgment and honest debate",
  },
  {
    id: "observatory",
    label: "The Observatory",
    href: "/companion",
    feeling: "Long view and emerging patterns",
  },
  {
    id: "greenhouse",
    label: "The Greenhouse",
    href: "/companion",
    feeling: "Ideas taking root in warmth",
  },
  {
    id: "coffee-house",
    label: "The Coffee House",
    href: "/companion",
    feeling: "Relaxed conversation and connection",
  },
  {
    id: "library",
    label: "The Library",
    href: "/companion",
    feeling: "Deep reference and quiet study",
  },
  {
    id: "music-room",
    label: "The Listening Room",
    href: "/companion",
    feeling: "Stillness, reflection, and listening",
  },
];

const SAMPLE_IDEA_CARDS: StrategyIdeaCard[] = [
  {
    id: "idea-1",
    title: "Member-first roadmap",
    body: "Sequence what strengthens trust before what impresses.",
    category: "Product",
    color: "teal",
    x: 48,
    y: 36,
  },
  {
    id: "idea-2",
    title: "Workshop narrative",
    body: "Transformation story — not feature tour.",
    category: "Marketing",
    color: "gold",
    x: 280,
    y: 120,
  },
  {
    id: "idea-3",
    title: "ADHD executive load",
    body: "One decision surface. No competing panels.",
    category: "UX",
    color: "aqua",
    x: 160,
    y: 220,
  },
];

const DEFAULT_DECISION: StrategyDecisionSummary = {
  currentDecision: "How should Executive Strategy Center evolve after the visual environment ships?",
  pros: [
    "Creates a dedicated thinking room before intelligence layers arrive",
    "Board and perspectives architecture ready for FLAME™",
    "Supports big decisions without execution pressure",
  ],
  concerns: [
    "Must not feel like another dashboard",
    "Session save needs real persistence later",
  ],
  unknowns: [
    "Which estate rooms Founder will recommend first",
    "When live FLAME perspectives replace placeholders",
  ],
  recommendedNextStep:
    "Use this room for one real strategic question this week — note what feels missing.",
  status: "exploring",
};

const DEFAULT_NOTES: StrategyMeetingNotes = {
  richText:
    "Executive Strategy Center session — capture thinking here before it becomes execution.",
  bullets: [
    "Environment first, intelligence later",
    "Thinking ≠ reporting",
    "Estate spaces are part of cognition",
  ],
  quickNotes: "What would make Shari reach for this room naturally?",
  actionItems: ["Walk through one product decision on the canvas"],
  decisionNotes: "Park execution until the decision feels clear.",
};

export const DEFAULT_STRATEGY_SESSION: StrategySession = {
  id: "session-default",
  title: "Executive Strategy Session",
  executiveQuestion: "What problem are we trying to solve?",
  activeToolId: "sticky-notes",
  ideaCards: SAMPLE_IDEA_CARDS,
  decision: DEFAULT_DECISION,
  notes: DEFAULT_NOTES,
  updatedAt: new Date().toISOString(),
  archived: false,
};

export const SAMPLE_SAVED_SESSIONS: StrategySessionMeta[] = [
  {
    id: "session-prior-1",
    title: "Spark Alpha positioning",
    updatedAt: "2026-07-01T14:30:00.000Z",
    archived: false,
  },
  {
    id: "session-prior-2",
    title: "Workshop curriculum arc",
    updatedAt: "2026-06-28T09:15:00.000Z",
    archived: true,
  },
];

export const STRATEGY_CENTER_BOOTSTRAP: StrategyCenterBootstrap = {
  defaultSession: DEFAULT_STRATEGY_SESSION,
  tools: STRATEGY_TOOLS,
  perspectives: STRATEGY_PERSPECTIVES,
  boardMembers: STRATEGY_BOARD,
  estatePlaces: ESTATE_THINKING_PLACES,
  savedSessions: SAMPLE_SAVED_SESSIONS,
};
