// Founder Ecosystem — Phase 5 Founder Advisor Board (types + advisor roster).
//
// The board is an INVISIBLE internal reasoning layer. The founder sees one
// Companion (Shari), one conversation, one response. Behind the scenes several
// advisors contribute perspective and the board combines them. Advisors are
// roles, not chatbots — they never speak individually to the user.

import type { ID } from "../models";
import type { Level } from "../dashboardTypes";

export type { Level };

export type AdvisorId =
  | "ceo"
  | "marketing"
  | "sales"
  | "operations"
  | "productivity"
  | "accountability"
  | "wellness";

export type Advisor = {
  id: AdvisorId;
  name: string;
  focus: string[];
  coreQuestions: string[];
};

export const ADVISORS: Record<AdvisorId, Advisor> = {
  ceo: {
    id: "ceo",
    name: "CEO",
    focus: ["vision", "goals", "strategy", "priorities", "long-term direction"],
    coreQuestions: [
      "What matters most?",
      "Is this aligned with the goals?",
      "What should be deprioritized?",
    ],
  },
  marketing: {
    id: "marketing",
    name: "Marketing",
    focus: ["audience", "visibility", "content", "offers", "lead generation"],
    coreQuestions: [
      "How will people find this?",
      "Is there enough marketing activity?",
      "What content opportunities exist?",
    ],
  },
  sales: {
    id: "sales",
    name: "Sales",
    focus: ["revenue", "conversations", "follow-up", "offers", "conversion"],
    coreQuestions: [
      "What generates revenue?",
      "What sales activity is missing?",
      "Which prospects need attention?",
    ],
  },
  operations: {
    id: "operations",
    name: "Operations",
    focus: ["processes", "systems", "documentation", "automation", "efficiency"],
    coreQuestions: [
      "Can this be systemized?",
      "What is repetitive?",
      "What creates bottlenecks?",
    ],
  },
  productivity: {
    id: "productivity",
    name: "Productivity",
    focus: ["execution", "focus", "time", "task management"],
    coreQuestions: [
      "What is the next action?",
      "What creates momentum?",
      "What should happen today?",
    ],
  },
  accountability: {
    id: "accountability",
    name: "Accountability",
    focus: ["follow-through", "commitments", "consistency"],
    coreQuestions: [
      "What was started but not finished?",
      "What commitments are overdue?",
      "What promises need attention?",
    ],
  },
  wellness: {
    id: "wellness",
    name: "Wellness",
    // STRICT: workload / energy / stress / capacity only. Never diagnose,
    // never medical advice.
    focus: ["capacity", "energy", "burnout prevention", "workload"],
    coreQuestions: [
      "Does the founder have capacity right now?",
      "Is overwhelm increasing?",
      "Should the workload be reduced?",
    ],
  },
};

export const ALL_ADVISOR_IDS = Object.keys(ADVISORS) as AdvisorId[];

// One advisor's internal contribution. Never shown verbatim to the founder.
export type AdvisorPerspective = {
  advisor: AdvisorId;
  observation: string; // what this advisor notices
  recommendation: string; // what this advisor would suggest
  confidence: Level;
  sourceEventIds: ID[]; // evidence — keeps it explainable
};

// The board's single, unified output.
export type BoardResponse = {
  message: string; // the ONE response the founder sees
  primaryAdvisor: AdvisorId;
  secondaryAdvisors: AdvisorId[];
  perspectives: AdvisorPerspective[]; // internal — for transparency/debug only
  rationale: string; // why the board landed here
  confidence: Level;
};

// Routing decision.
export type AdvisorRouting = {
  primary: AdvisorId;
  secondary: AdvisorId[];
};
