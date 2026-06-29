/**
 * Executive discipline catalog — constraints and default weights.
 */

import type {
  DisciplineConstraint,
  ExecutiveDisciplineId,
} from "./types";

export const EXECUTIVE_DISCIPLINE_LABELS: Record<ExecutiveDisciplineId, string> = {
  marketing: "Marketing",
  sales: "Sales",
  "business-strategy": "Strategy",
  wordsmith: "Wordsmith",
  research: "Research",
  finance: "Finance",
  operations: "Operations",
  leadership: "Leadership",
  "creative-direction": "Creative Direction",
  "customer-experience": "Customer Experience",
  "ai-automation": "AI & Automation",
  "product-development": "Product Development",
  "learning-coach": "Learning Coach",
};

export const DISCIPLINE_CONSTRAINTS: Record<
  ExecutiveDisciplineId,
  DisciplineConstraint
> = {
  marketing: {
    maxSentences: 2,
    mustAvoid: ["jargon", "vanity metrics"],
    tone: "creative",
  },
  sales: {
    maxSentences: 2,
    mustAvoid: ["pressure tactics", "manipulation"],
    tone: "direct",
  },
  "business-strategy": {
    maxSentences: 2,
    mustAvoid: ["analysis paralysis"],
    tone: "analytical",
  },
  wordsmith: {
    maxSentences: 2,
    mustAvoid: ["cleverness over clarity"],
    tone: "creative",
  },
  research: {
    maxSentences: 2,
    mustAvoid: ["unverified claims"],
    tone: "analytical",
  },
  finance: {
    maxSentences: 2,
    mustAvoid: ["false precision"],
    tone: "analytical",
  },
  operations: {
    maxSentences: 2,
    mustAvoid: ["process for process sake"],
    tone: "direct",
  },
  leadership: {
    maxSentences: 2,
    mustAvoid: ["generic motivation"],
    tone: "empathetic",
  },
  "creative-direction": {
    maxSentences: 2,
    mustAvoid: ["trend chasing"],
    tone: "creative",
  },
  "customer-experience": {
    maxSentences: 2,
    mustAvoid: ["survey theater"],
    tone: "empathetic",
  },
  "ai-automation": {
    maxSentences: 2,
    mustAvoid: ["automation for its own sake"],
    tone: "analytical",
  },
  "product-development": {
    maxSentences: 2,
    mustAvoid: ["feature creep"],
    tone: "analytical",
  },
  "learning-coach": {
    maxSentences: 2,
    mustAvoid: ["one-size-fits-all"],
    tone: "empathetic",
  },
};

const DEFAULT_WEIGHTS: Record<ExecutiveDisciplineId, number> = {
  marketing: 0.85,
  sales: 0.85,
  "business-strategy": 0.9,
  wordsmith: 0.8,
  research: 0.88,
  finance: 0.9,
  operations: 0.82,
  leadership: 0.8,
  "creative-direction": 0.78,
  "customer-experience": 0.84,
  "ai-automation": 0.75,
  "product-development": 0.83,
  "learning-coach": 0.77,
};

export function baseWeightForDiscipline(id: ExecutiveDisciplineId): number {
  return DEFAULT_WEIGHTS[id];
}

export const MAX_DISCIPLINES_BY_SCENARIO: Record<string, number> = {
  simple_question: 0,
  overwhelm_support: 0,
  general_business: 3,
  marketing_campaign: 4,
  pricing_decision: 4,
  sales_call: 4,
  launch: 6,
  research: 2,
};
