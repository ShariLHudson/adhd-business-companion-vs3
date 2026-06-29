/**
 * Discipline selection — scenario detection and activation caps.
 */

import type {
  ExecutiveDisciplineId,
  OrchestrationScenario,
  SupportMode,
} from "./types";
import type { EstateRoomId } from "@/lib/sparkResponseIntelligence/types";
import { MAX_DISCIPLINES_BY_SCENARIO } from "./disciplines";

export type SelectionResult = {
  scenario: OrchestrationScenario;
  disciplines: ExecutiveDisciplineId[];
  supportModes: SupportMode[];
  estateSupport?: EstateRoomId;
  reason: string;
  debateRequired: boolean;
};

const SCENARIO_PACKS: Record<
  Exclude<OrchestrationScenario, "general_business" | "simple_question">,
  ExecutiveDisciplineId[]
> = {
  marketing_campaign: [
    "marketing",
    "business-strategy",
    "wordsmith",
    "creative-direction",
  ],
  pricing_decision: ["finance", "business-strategy", "marketing", "sales"],
  sales_call: ["sales", "research", "wordsmith", "customer-experience"],
  overwhelm_support: [],
  launch: [
    "business-strategy",
    "marketing",
    "sales",
    "wordsmith",
    "operations",
    "creative-direction",
  ],
  research: ["research"],
};

const BUSINESS_CONTEXT_SIGNALS =
  /\b(revenue|client|launch|pricing|campaign|offer|deadline|project|sales|marketing)\b/i;

function isSimpleQuestion(message: string): boolean {
  const lower = message.toLowerCase().trim();
  if (lower.length > 120) return false;
  return (
    /^(what is|define|who is|when did|how do i)\b/.test(lower) ||
    /\?$/.test(lower) && !BUSINESS_CONTEXT_SIGNALS.test(lower)
  );
}

export function detectScenario(
  message: string,
  emotionalState?: string,
  businessContextEmerging?: boolean,
): OrchestrationScenario {
  const lower = message.toLowerCase();

  if (
    emotionalState === "overwhelmed" ||
    /\b(overwhelmed|too much|can't cope|burned out|shut down)\b/.test(lower)
  ) {
    if (!businessContextEmerging && !BUSINESS_CONTEXT_SIGNALS.test(lower)) {
      return "overwhelm_support";
    }
  }

  if (isSimpleQuestion(message)) return "simple_question";

  if (/\b(research|competitor|market study|look up|investigate|observatory)\b/.test(lower)) {
    return "research";
  }

  if (/\b(launch|go live|product launch|release day)\b/.test(lower)) {
    return "launch";
  }

  if (/\b(price|pricing|prices|margin|raise (?:my )?price)\b/.test(lower)) {
    return "pricing_decision";
  }

  if (/\b(sales call|discovery call|demo call|close the deal|objection)\b/.test(lower)) {
    return "sales_call";
  }

  if (/\b(campaign|marketing plan|ad copy|funnel|audience growth)\b/.test(lower)) {
    return "marketing_campaign";
  }

  return "general_business";
}

export function selectDisciplinesForScenario(
  scenario: OrchestrationScenario,
  message: string,
): SelectionResult {
  const lower = message.toLowerCase();

  if (scenario === "simple_question") {
    return {
      scenario,
      disciplines: [],
      supportModes: [],
      reason: "Simple question — no discipline stack",
      debateRequired: false,
    };
  }

  if (scenario === "overwhelm_support") {
    return {
      scenario,
      disciplines: [],
      supportModes: ["conversation", "focus_support"],
      reason: "Overwhelm — conversation and focus support only",
      debateRequired: false,
    };
  }

  if (scenario === "general_business") {
    const picked: ExecutiveDisciplineId[] = [];
    if (/\b(team|lead|delegate|culture)\b/.test(lower)) picked.push("leadership");
    if (/\b(automate|ai|workflow)\b/.test(lower)) picked.push("ai-automation");
    if (/\b(product|feature|roadmap)\b/.test(lower)) picked.push("product-development");
    if (/\b(learn|course|skill)\b/.test(lower)) picked.push("learning-coach");
    if (picked.length === 0) picked.push("business-strategy");
    return {
      scenario,
      disciplines: capDisciplines(picked, scenario),
      supportModes: [],
      reason: "General business — minimal relevant stack",
      debateRequired: picked.length > 2,
    };
  }

  const pack =
    scenario === "research"
      ? [...SCENARIO_PACKS.research]
      : [...SCENARIO_PACKS[scenario]];

  let estateSupport: EstateRoomId | undefined;
  if (scenario === "research") {
    estateSupport = "observatory";
    if (/\b(decide|should i|which option|recommend)\b/.test(lower)) {
      pack.push("business-strategy");
    }
  }

  const debateRequired =
    scenario === "pricing_decision" ||
    scenario === "launch" ||
    pack.length >= 4;

  return {
    scenario,
    disciplines: capDisciplines(pack, scenario),
    supportModes: [],
    estateSupport,
    reason: `Scenario: ${scenario}`,
    debateRequired,
  };
}

export function capDisciplines(
  disciplines: ExecutiveDisciplineId[],
  scenario: OrchestrationScenario,
): ExecutiveDisciplineId[] {
  const max = MAX_DISCIPLINES_BY_SCENARIO[scenario] ?? 4;
  const unique = [...new Set(disciplines)];
  return unique.slice(0, max);
}

export function selectExecutiveDisciplines(
  message: string,
  options?: {
    emotionalState?: string;
    businessContextEmerging?: boolean;
  },
): SelectionResult {
  const scenario = detectScenario(
    message,
    options?.emotionalState,
    options?.businessContextEmerging,
  );
  return selectDisciplinesForScenario(scenario, message);
}
