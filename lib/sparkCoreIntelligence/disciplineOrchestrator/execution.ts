/**
 * Parallel discipline execution (v1 scaffold — simulated concurrent contributions).
 */

import {
  baseWeightForDiscipline,
  DISCIPLINE_CONSTRAINTS,
} from "./disciplines";
import type {
  ConfidenceWeight,
  DisciplineContribution,
  ExecutiveDisciplineId,
} from "./types";

const LATENCY_BASE_MS: Record<ExecutiveDisciplineId, number> = {
  marketing: 45,
  sales: 40,
  "business-strategy": 55,
  wordsmith: 35,
  research: 70,
  finance: 50,
  operations: 42,
  leadership: 38,
  "creative-direction": 48,
  "customer-experience": 44,
  "ai-automation": 52,
  "product-development": 46,
  "learning-coach": 36,
};

function recommendationFor(
  id: ExecutiveDisciplineId,
  message: string,
): { text: string; confidence: ConfidenceWeight } {
  const lower = message.toLowerCase();
  const snippets: Partial<
    Record<ExecutiveDisciplineId, { text: string; confidence: ConfidenceWeight }>
  > = {
    marketing: {
      text: "Lead with audience clarity and one measurable campaign goal.",
      confidence: "high",
    },
    sales: {
      text: "Open with their outcome, not your offer — earn the next question.",
      confidence: "high",
    },
    "business-strategy": {
      text: "Name the decision, the constraint, and what success looks like in 90 days.",
      confidence: "high",
    },
    wordsmith: {
      text: "Use plain language and one vivid proof point — cut everything else.",
      confidence: "medium",
    },
    research: {
      text: "Verify with current sources before committing to a direction.",
      confidence: "high",
    },
    finance: {
      text: "Model margin impact before changing price or spend.",
      confidence: "high",
    },
    operations: {
      text: "Sequence launch tasks so nothing critical depends on a single person.",
      confidence: "medium",
    },
    leadership: {
      text: "Align the team on one priority before adding new initiatives.",
      confidence: "medium",
    },
    "creative-direction": {
      text: "Anchor creative choices in brand promise, not trend.",
      confidence: "medium",
    },
    "customer-experience": {
      text: "Design the moment of truth — first reply, first delivery, first win.",
      confidence: "high",
    },
    "ai-automation": {
      text: "Automate repeatable steps only after the manual path works once.",
      confidence: "medium",
    },
    "product-development": {
      text: "Ship the smallest version that proves demand, then iterate.",
      confidence: "medium",
    },
    "learning-coach": {
      text: "Match the next step to how they actually learn — one skill at a time.",
      confidence: "medium",
    },
  };

  if (/\b(price|pricing|prices)\b/.test(lower)) {
    if (id === "finance") {
      return {
        text: "Protect margin unless volume gain is proven with data.",
        confidence: "high",
      };
    }
    if (id === "marketing") {
      return {
        text: "Test price on your warmest segment before a broad change.",
        confidence: "high",
      };
    }
    if (id === "sales") {
      return {
        text: "Reframe price as value delivered — prepare proof before the call.",
        confidence: "medium",
      };
    }
  }

  return (
    snippets[id] ?? {
      text: `Apply ${id.replace(/-/g, " ")} lens to this request.`,
      confidence: "medium",
    }
  );
}

function simulateLatency(id: ExecutiveDisciplineId): number {
  const jitter = Math.floor(Math.random() * 15);
  return LATENCY_BASE_MS[id] + jitter;
}

export function executeDiscipline(
  id: ExecutiveDisciplineId,
  message: string,
): DisciplineContribution {
  const start = performance.now();
  const { text, confidence } = recommendationFor(id, message);
  const durationMs = Math.max(
    LATENCY_BASE_MS[id],
    Math.round(performance.now() - start + simulateLatency(id)),
  );

  return {
    disciplineId: id,
    internalRecommendation: text,
    confidence,
    weight: baseWeightForDiscipline(id),
    durationMs,
    constraints: DISCIPLINE_CONSTRAINTS[id],
  };
}

/** Run disciplines in parallel (v1 returns batch as if concurrent). */
export function executeDisciplinesParallel(
  disciplines: ExecutiveDisciplineId[],
  message: string,
): DisciplineContribution[] {
  return disciplines.map((id) => executeDiscipline(id, message));
}

export const DISCIPLINE_LATENCY_BUDGET_MS = 120;
