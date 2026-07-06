import type {
  ExecutiveApproval,
  ExecutiveInitiative,
  ExecutivePlan,
  ExecutiveROI,
  FounderPromise,
  ImplementationPlans,
} from "../types";

const TS = "2026-07-06T14:00:00.000Z";

const DEFAULT_APPROVALS: ExecutiveApproval[] = [
  {
    id: "oa-prepare",
    label: "Preparation complete",
    status: "approved",
    requiresExplicitApproval: false,
    blockedActions: [],
    notes: "Drafts and plans only.",
  },
  {
    id: "oa-founder",
    label: "Founder execution approval",
    status: "pending",
    requiresExplicitApproval: true,
    blockedActions: [
      "publish",
      "launch",
      "send_email",
      "spend_money",
      "execute_automation",
      "change_production",
    ],
    notes: "Founder always makes the final business decision.",
  },
];

function plans(partial: Partial<ImplementationPlans>): ImplementationPlans {
  return {
    developmentPlan: [],
    researchPlan: [],
    contentPlan: [],
    marketingPlan: [],
    launchPlan: [],
    trainingPlan: [],
    teamPlan: [],
    automationPlan: [],
    measurementPlan: [],
    reviewPlan: [],
    ...partial,
  };
}

function roi(partial: Partial<ExecutiveROI>): ExecutiveROI {
  return {
    founderTimeRequiredHours: 8,
    founderTimeSavedHours: 4,
    teamTimeRequiredHours: 12,
    estimatedRevenue: "Moderate",
    customerValue: "High",
    strategicValue: 75,
    risk: "medium",
    confidence: 78,
    difficulty: 55,
    longTermBenefit: "Compounds across missions.",
    ...partial,
  };
}

function promise(partial: Partial<FounderPromise> & Pick<FounderPromise, "whatHappened" | "whyItMatters" | "recommendation">): FounderPromise {
  return {
    options: [],
    whatFounderWillPrepare: ["Implementation drafts", "Checklist", "Monitoring plan"],
    requiresApproval: ["Any publish, launch, send, spend, or automation execution"],
    howWeMeasureSuccess: ["Mission progress", "Customer feedback", "Revenue signal"],
    whatHappensNext: ["Review prepared bundle", "Approve or defer", "Founder orchestrates — nothing auto-executes"],
    ...partial,
  };
}

function base(
  partial: Omit<
    ExecutiveInitiative,
    "approvals" | "assignments" | "automationCandidates" | "graphNodeIds" | "createdAt" | "updatedAt"
  > &
    Partial<Pick<ExecutiveInitiative, "approvals" | "assignments" | "automationCandidates" | "graphNodeIds">>,
): ExecutiveInitiative {
  return {
    approvals: DEFAULT_APPROVALS,
    assignments: [],
    automationCandidates: [],
    graphNodeIds: [],
    createdAt: TS,
    updatedAt: TS,
    ...partial,
  };
}

export const SAMPLE_EXECUTIVE_INITIATIVES: ExecutiveInitiative[] = [
  base({
    id: "init-listening-rooms",
    title: "Listening Rooms™ Estate Scene",
    category: "mission",
    missionId: "listening-rooms",
    productId: "listening-rooms",
    decisionId: "ed-lr-estate-scene",
    goal: "Ship shame-free restart experience with estate scene as hero.",
    purpose: "Members return to belonging — not a dashboard.",
    businessValue: "Category-leading calm ADHD restart.",
    expectedOutcome: "Scene QA complete; mission progress ≥70%.",
    priority: "critical",
    strategicImportance: 95,
    estimatedTime: "4–6 weeks",
    estimatedEffort: "High",
    estimatedRevenue: "Enables Gentle Restart conversion",
    estimatedCustomerImpact: "Transformational trust on return",
    estimatedTimeSaved: "12+ hrs/month manual nurture",
    estimatedAutomationPotential: 45,
    estimatedConfidence: 91,
    currentStep: "monitor",
    completedSteps: ["discover", "understand", "options", "decision", "plan", "prepare", "approve", "orchestrate"],
    status: "in_progress",
    roi: roi({
      founderTimeRequiredHours: 10,
      founderTimeSavedHours: 6,
      strategicValue: 95,
      risk: "low",
      confidence: 91,
      longTermBenefit: "Foundation for every restart-touching initiative.",
    }),
    founderPromise: promise({
      whatHappened: "Decision committed to full-bleed estate scene before other features.",
      whyItMatters: "Without the scene, Listening Rooms is another app — not a place.",
      options: ["Scene first", "Feature menu first"],
      recommendation: "Scene first — everything else waits.",
      whatFounderWillPrepare: ["Cursor build plan", "QA checklist", "Mission milestone update"],
      howWeMeasureSuccess: ["Photograph Test pass", "Mission progress", "Restart session completion"],
    }),
    graphNodeIds: ["node-listening-rooms", "node-mission-lr"],
    institutionalMemoryId: "mem-decision-invest-restart",
  }),

  base({
    id: "init-voice-companion",
    title: "Voice Companion™ (Limited Return)",
    category: "product",
    missionId: "listening-rooms",
    productId: "companion",
    decisionId: "ed-voice-companion",
    goal: "Test voice welcome on return sessions only.",
    purpose: "Reduce typing friction when members are depleted.",
    businessValue: "Differentiated companion feel vs generic AI.",
    expectedOutcome: "Pilot spec approved; no production deploy without approval.",
    priority: "high",
    strategicImportance: 82,
    estimatedTime: "4–5 weeks",
    estimatedEffort: "Medium",
    estimatedRevenue: "Retention lift (indirect)",
    estimatedCustomerImpact: "High on first return",
    estimatedTimeSaved: "N/A — member-facing",
    estimatedAutomationPotential: 30,
    estimatedConfidence: 86,
    currentStep: "prepare",
    completedSteps: ["discover", "understand", "options", "decision", "plan"],
    status: "awaiting_approval",
    roi: roi({
      founderTimeRequiredHours: 6,
      founderTimeSavedHours: 2,
      strategicValue: 82,
      difficulty: 58,
    }),
    founderPromise: promise({
      whatHappened: "Council compared full voice, limited return voice, and wait.",
      whyItMatters: "Restart is when members are most depleted.",
      options: ["Full voice", "Limited return voice", "Wait"],
      recommendation: "Limited voice on return first.",
      whatFounderWillPrepare: ["Cursor implementation draft", "Accessibility checklist", "Copy drafts"],
    }),
    graphNodeIds: ["node-listening-rooms"],
  }),

  base({
    id: "init-workshop-launch",
    title: "Decision Fatigue Workshop Launch",
    category: "workshop",
    missionId: "listening-rooms",
    decisionId: "ed-launch-workshop",
    goal: "Schedule workshop after Listening Rooms beta proof.",
    purpose: "Convert research into live trust and stories.",
    businessValue: "Workshop feeds nurture and Gentle Restart campaign.",
    expectedOutcome: "Q3 calendar hold; outline draft ready.",
    priority: "medium",
    strategicImportance: 74,
    estimatedTime: "Q3",
    estimatedEffort: "Medium",
    estimatedRevenue: "Workshop tickets + nurture",
    estimatedCustomerImpact: "High for research-interested members",
    estimatedTimeSaved: "4 hrs/month content sourcing",
    estimatedAutomationPotential: 55,
    estimatedConfidence: 81,
    currentStep: "orchestrate",
    completedSteps: ["discover", "understand", "options", "decision", "plan", "prepare", "approve"],
    status: "planned",
    roi: roi({ founderTimeRequiredHours: 12, founderTimeSavedHours: 3, strategicValue: 74 }),
    founderPromise: promise({
      whatHappened: "Workshop deferred until estate scene proves the promise.",
      whyItMatters: "Live events land harder when the room exists.",
      options: ["Pilot in 3 weeks", "Q3 after beta"],
      recommendation: "Q3 after beta.",
      whatFounderWillPrepare: ["Workshop outline", "PostCraft nurture drafts", "Ops calendar hold"],
    }),
    graphNodeIds: ["node-workshop-fatigue"],
  }),

  base({
    id: "init-pinterest-strategy",
    title: "Pinterest Strategy for Visual Spark Studios",
    category: "marketing",
    missionId: "listening-rooms",
    goal: "Prepare calm estate imagery pipeline for Pinterest without publishing.",
    purpose: "Visual discovery aligned with Spark aesthetic — not hustle content.",
    businessValue: "Top-of-funnel awareness for estate brand.",
    expectedOutcome: "30-pin draft catalog; no live posts until approved.",
    priority: "medium",
    strategicImportance: 68,
    estimatedTime: "2 weeks prep",
    estimatedEffort: "Low-medium",
    estimatedRevenue: "Long-tail traffic",
    estimatedCustomerImpact: "Discovery — not conversion direct",
    estimatedTimeSaved: "3 hrs/week if templated",
    estimatedAutomationPotential: 70,
    estimatedConfidence: 72,
    currentStep: "plan",
    completedSteps: ["discover", "understand", "options", "decision"],
    status: "draft",
    roi: roi({
      founderTimeRequiredHours: 4,
      founderTimeSavedHours: 5,
      teamTimeRequiredHours: 8,
      strategicValue: 68,
      risk: "low",
    }),
    founderPromise: promise({
      whatHappened: "Opportunity to extend estate beauty into Pinterest discovery.",
      whyItMatters: "Spark's visual estate is a competitive moat.",
      options: ["Manual pin curation", "PostCraft template batch", "Defer until launch"],
      recommendation: "PostCraft template batch — draft only.",
      whatFounderWillPrepare: ["Pin copy drafts", "Image checklist", "Publishing hold list"],
    }),
    graphNodeIds: ["node-campaign-gentle-restart"],
  }),

  base({
    id: "init-executive-brief",
    title: "Executive Brief Morning Cycle",
    category: "executive",
    missionId: "founder-studio",
    goal: "Orchestrate daily brief preparation from overnight intelligence.",
    purpose: "Shari starts each day with plain-English clarity.",
    businessValue: "Reduces context switching across missions.",
    expectedOutcome: "Brief bundle draft by 6am — review only.",
    priority: "high",
    strategicImportance: 90,
    estimatedTime: "Ongoing",
    estimatedEffort: "Low daily",
    estimatedRevenue: "Founder time ROI",
    estimatedCustomerImpact: "Indirect — better decisions",
    estimatedTimeSaved: "45 min/day context gathering",
    estimatedAutomationPotential: 85,
    estimatedConfidence: 88,
    currentStep: "orchestrate",
    completedSteps: ["discover", "understand", "options", "decision", "plan", "prepare", "approve"],
    status: "in_progress",
    roi: roi({
      founderTimeRequiredHours: 2,
      founderTimeSavedHours: 7,
      strategicValue: 90,
      confidence: 88,
      longTermBenefit: "Daily executive calm compounds.",
    }),
    founderPromise: promise({
      whatHappened: "Overnight cycle surfaces signals; brief translates to plain English.",
      whyItMatters: "Decision fatigue drops when the day starts clear.",
      options: ["Manual brief", "Orchestrated draft brief"],
      recommendation: "Orchestrated draft — Shari reviews, never auto-sends.",
      whatFounderWillPrepare: ["Morning brief draft", "Priority stack", "Approval queue summary"],
      howWeMeasureSuccess: ["Time to first decision", "Brief review completion"],
    }),
    graphNodeIds: ["node-mission-lr"],
  }),

  base({
    id: "init-founder-onboarding",
    title: "Founder Studio Onboarding Path",
    category: "executive",
    missionId: "founder-studio",
    goal: "Prepare calm onboarding sequence for new founder workflows.",
    purpose: "Shari or Izna can orient without module hunting.",
    businessValue: "Faster adoption of executive OS.",
    expectedOutcome: "Checklist + tour copy drafts — no UI changes this sprint.",
    priority: "medium",
    strategicImportance: 76,
    estimatedTime: "1 week",
    estimatedEffort: "Low",
    estimatedRevenue: "Internal efficiency",
    estimatedCustomerImpact: "N/A",
    estimatedTimeSaved: "2 hrs/onboarding session",
    estimatedAutomationPotential: 40,
    estimatedConfidence: 75,
    currentStep: "prepare",
    completedSteps: ["discover", "understand", "options", "decision", "plan"],
    status: "planned",
    roi: roi({ founderTimeRequiredHours: 3, founderTimeSavedHours: 4, strategicValue: 76 }),
    founderPromise: promise({
      whatHappened: "Founder Studio needs orientation without dashboard tours.",
      whyItMatters: "Executive OS only works if it feels calm on day one.",
      options: ["Written guide", "Checklist + concierge prompts"],
      recommendation: "Checklist + concierge prompts (draft).",
      whatFounderWillPrepare: ["Onboarding checklist", "Guidebook page drafts"],
    }),
    graphNodeIds: [],
  }),

  base({
    id: "init-companion-feature",
    title: "Companion Continuity on Room Change",
    category: "product",
    missionId: "listening-rooms",
    productId: "companion",
    goal: "Prepare Spec 108 continuity verification for estate moves.",
    purpose: "Conversation never resets when the member changes rooms.",
    businessValue: "Trust compounds — members feel one relationship.",
    expectedOutcome: "QA checklist + test plan draft.",
    priority: "high",
    strategicImportance: 88,
    estimatedTime: "2 weeks",
    estimatedEffort: "Medium",
    estimatedRevenue: "Retention",
    estimatedCustomerImpact: "High — relationship continuity",
    estimatedTimeSaved: "Support burden reduction",
    estimatedAutomationPotential: 25,
    estimatedConfidence: 84,
    currentStep: "monitor",
    completedSteps: ["discover", "understand", "options", "decision", "plan", "prepare", "approve", "orchestrate"],
    status: "in_progress",
    roi: roi({ strategicValue: 88, customerValue: "Very high", risk: "low" }),
    founderPromise: promise({
      whatHappened: "Estate moves must preserve conversation per Spec 108.",
      whyItMatters: "Resetting chat feels like software — not companionship.",
      options: ["Manual QA only", "Orchestrated test checklist"],
      recommendation: "Orchestrated test checklist before scene launch.",
      whatFounderWillPrepare: ["QA checklist", "Cursor test plan", "Regression watch list"],
    }),
    graphNodeIds: ["node-listening-rooms", "node-feedback-restart"],
  }),
];

const BY_ID = new Map(SAMPLE_EXECUTIVE_INITIATIVES.map((i) => [i.id, i]));

export function getSampleInitiative(id: string): ExecutiveInitiative | undefined {
  return BY_ID.get(id);
}

export function listSampleInitiatives(): ExecutiveInitiative[] {
  return [...SAMPLE_EXECUTIVE_INITIATIVES];
}

export function initiativesForMission(missionId: string): ExecutiveInitiative[] {
  return SAMPLE_EXECUTIVE_INITIATIVES.filter((i) => i.missionId === missionId);
}

export function initiativesByCategory(category: ExecutiveInitiative["category"]): ExecutiveInitiative[] {
  return SAMPLE_EXECUTIVE_INITIATIVES.filter((i) => i.category === category);
}

export function initiativeForDecision(decisionId: string): ExecutiveInitiative | undefined {
  return SAMPLE_EXECUTIVE_INITIATIVES.find((i) => i.decisionId === decisionId);
}

export { plans as sampleImplementationPlans };
