/**
 * Survey Intelligence — customer validation & feedback frameworks.
 *
 * Determines what feedback is needed, which template fits, and pre-populates
 * Create with proven questions — never a blank page.
 */

import type { ChatTurn } from "./companionIntelligence";
import type { BusinessDecisionType } from "./companionDecisionIntelligence/types";
import type { CreationWorkspaceInput } from "./workspaceCreation";

// ─── Survey types ────────────────────────────────────────────────────────────

export type SurveyType =
  | "product_validation"
  | "pricing_feedback"
  | "customer_satisfaction"
  | "product_improvement"
  | "discovery_research"
  | "beta_tester"
  | "testimonial";

export type SurveyLength = "quick" | "standard" | "deep";

export type SurveyQuestion = {
  id: string;
  text: string;
};

export type SurveyTemplate = {
  id: SurveyType;
  name: string;
  purpose: string;
  itemType: "Form";
  situationIds: string[];
  questions: SurveyQuestion[];
};

export type SurveyResourceCandidate = {
  id: "survey_template";
  surveyType: SurveyType;
  label: string;
  confidence: number;
  reason: string;
  offerReady: boolean;
};

export type SurveyIntelligenceResult = {
  needsSurvey: boolean;
  surveyType: SurveyType | null;
  template: SurveyTemplate | null;
  recommendedLength: SurveyLength;
  confidence: number;
  shouldOfferCreate: boolean;
  offerReady: boolean;
  shouldDeferSurvey: boolean;
  situationId: string | null;
  missingInformation: string;
  rationale: string[];
  resource: SurveyResourceCandidate | null;
};

export type EvaluateSurveyIntelligenceInput = {
  userText: string;
  messages?: ChatTurn[];
  situationId?: string | null;
  decisionType?: BusinessDecisionType | null;
  discoveryComplete?: boolean;
};

export type SurveyFounderRecord = {
  surveysCreated: number;
  surveysCompleted: number;
  byType: Partial<Record<SurveyType, number>>;
  decisionsInfluenced: number;
  lastSurveyType?: SurveyType;
  lastCreatedAt?: string;
  updatedAt: string;
};

const FOUNDER_STORAGE_KEY = "companion-survey-founder-v1";
const OFFER_THRESHOLD = 0.62;

const LENGTH_COUNTS: Record<SurveyLength, number> = {
  quick: 5,
  standard: 10,
  deep: 18,
};

// ─── Templates ───────────────────────────────────────────────────────────────

const PRODUCT_VALIDATION_QUESTIONS: SurveyQuestion[] = [
  { id: "pv1", text: "Which of our current products do you use most often?" },
  { id: "pv2", text: "What do you value most about them?" },
  {
    id: "pv3",
    text: "If we introduced a new product that offered additional benefits, how interested would you be?",
  },
  { id: "pv4", text: "What would influence your decision to try it?" },
  {
    id: "pv5",
    text: "Would you be willing to pay more for improved results?",
  },
  { id: "pv6", text: "Would you be interested in trying a sample?" },
  { id: "pv7", text: "Any additional feedback?" },
  {
    id: "pv8",
    text: "How does this new offer compare to what you use today?",
  },
  {
    id: "pv9",
    text: "What would make you say yes immediately?",
  },
  {
    id: "pv10",
    text: "What would make you hesitate or say no?",
  },
];

const PRICING_FEEDBACK_QUESTIONS: SurveyQuestion[] = [
  { id: "pf1", text: "How would you describe the value you get from our offer?" },
  { id: "pf2", text: "At what price would this feel like a great deal?" },
  { id: "pf3", text: "At what price would this start to feel expensive?" },
  { id: "pf4", text: "What matters most when you decide to purchase?" },
  { id: "pf5", text: "Would you pay more for premium features or support?" },
  { id: "pf6", text: "How do you compare our pricing to alternatives?" },
  { id: "pf7", text: "What would increase your willingness to pay?" },
  { id: "pf8", text: "Would a payment plan or tiered option help?" },
  { id: "pf9", text: "What price point would you hesitate at?" },
  { id: "pf10", text: "Any other pricing feedback?" },
];

const CUSTOMER_SATISFACTION_QUESTIONS: SurveyQuestion[] = [
  { id: "cs1", text: "How satisfied are you with your overall experience?" },
  { id: "cs2", text: "What is working well for you right now?" },
  { id: "cs3", text: "What could we improve?" },
  { id: "cs4", text: "How likely are you to continue with us?" },
  { id: "cs5", text: "How likely are you to recommend us to someone similar?" },
  { id: "cs6", text: "What almost made you leave or disengage?" },
  { id: "cs7", text: "What support or communication do you want more of?" },
];

const PRODUCT_IMPROVEMENT_QUESTIONS: SurveyQuestion[] = [
  { id: "pi1", text: "What feature or outcome matters most to you?" },
  { id: "pi2", text: "What frustrates you most about the current experience?" },
  { id: "pi3", text: "What is missing that would make this more useful?" },
  { id: "pi4", text: "What would you use more often if we improved it?" },
  { id: "pi5", text: "What should we stop doing or simplify?" },
  { id: "pi6", text: "How do you prefer to learn or use new features?" },
  { id: "pi7", text: "Any specific usability issues we should fix first?" },
];

const DISCOVERY_RESEARCH_QUESTIONS: SurveyQuestion[] = [
  { id: "dr1", text: "What is your biggest challenge right now?" },
  { id: "dr2", text: "What have you already tried to solve it?" },
  { id: "dr3", text: "What is not working about your current approach?" },
  { id: "dr4", text: "What outcome would make this feel solved?" },
  { id: "dr5", text: "What would an ideal solution look like for you?" },
  { id: "dr6", text: "What unmet need do you still have?" },
  { id: "dr7", text: "Who else is involved in this decision?" },
  { id: "dr8", text: "What would make you trust a new solution?" },
  { id: "dr9", text: "What language or framing resonates with you?" },
  { id: "dr10", text: "Anything else we should understand about your situation?" },
];

const BETA_TESTER_QUESTIONS: SurveyQuestion[] = [
  { id: "bt1", text: "What were you hoping to get from this beta?" },
  { id: "bt2", text: "What worked better than expected?" },
  { id: "bt3", text: "What was confusing or frustrating?" },
  { id: "bt4", text: "What would you change before a full launch?" },
  { id: "bt5", text: "Would you use this after the beta ends?" },
  { id: "bt6", text: "What would you tell a friend about this offer?" },
  { id: "bt7", text: "Any bugs, gaps, or missing pieces we should fix first?" },
];

const TESTIMONIAL_QUESTIONS: SurveyQuestion[] = [
  { id: "tm1", text: "What problem were you facing before working with us?" },
  { id: "tm2", text: "What changed after you used our product or service?" },
  { id: "tm3", text: "What specific result are you most proud of?" },
  { id: "tm4", text: "What would you tell someone who is on the fence?" },
  { id: "tm5", text: "May we share your story (with your approval)?" },
  { id: "tm6", text: "What name and title may we use if approved?" },
];

export const SURVEY_TEMPLATES: Record<SurveyType, SurveyTemplate> = {
  product_validation: {
    id: "product_validation",
    name: "Product Validation Survey",
    purpose: "Determine market interest before launch.",
    itemType: "Form",
    situationIds: ["product-expansion-uncertainty", "launch-avoidance"],
    questions: PRODUCT_VALIDATION_QUESTIONS,
  },
  pricing_feedback: {
    id: "pricing_feedback",
    name: "Pricing Feedback Survey",
    purpose: "Evaluate willingness to pay and perceived value.",
    itemType: "Form",
    situationIds: ["pricing-guilt", "revenue-pricing-paralysis"],
    questions: PRICING_FEEDBACK_QUESTIONS,
  },
  customer_satisfaction: {
    id: "customer_satisfaction",
    name: "Customer Satisfaction Survey",
    purpose: "Understand current customer experience and retention.",
    itemType: "Form",
    situationIds: [],
    questions: CUSTOMER_SATISFACTION_QUESTIONS,
  },
  product_improvement: {
    id: "product_improvement",
    name: "Product Improvement Survey",
    purpose: "Gather feedback on existing products and features.",
    itemType: "Form",
    situationIds: [],
    questions: PRODUCT_IMPROVEMENT_QUESTIONS,
  },
  discovery_research: {
    id: "discovery_research",
    name: "Discovery Research Survey",
    purpose: "Understand customer needs, pain points, and audience fit.",
    itemType: "Form",
    situationIds: ["niche-confusion", "offer-confusion"],
    questions: DISCOVERY_RESEARCH_QUESTIONS,
  },
  beta_tester: {
    id: "beta_tester",
    name: "Beta Tester Survey",
    purpose: "Gather launch feedback from pilot and early-access groups.",
    itemType: "Form",
    situationIds: [],
    questions: BETA_TESTER_QUESTIONS,
  },
  testimonial: {
    id: "testimonial",
    name: "Testimonial Survey",
    purpose: "Capture stories, outcomes, and social proof.",
    itemType: "Form",
    situationIds: [],
    questions: TESTIMONIAL_QUESTIONS,
  },
};

export const SITUATION_SURVEY_MAP: Record<string, SurveyType> = {
  "product-expansion-uncertainty": "product_validation",
  "pricing-guilt": "pricing_feedback",
  "revenue-pricing-paralysis": "pricing_feedback",
  "niche-confusion": "discovery_research",
  "offer-confusion": "discovery_research",
};

const SURVEY_SIGNALS: { type: SurveyType; re: RegExp; weight: number }[] = [
  {
    type: "product_validation",
    re: /\b(?:don'?t know if (?:customers?|people) would buy|market validation|validate (?:the )?(?:market|offer|idea)|before (?:i )?launch|would (?:anyone|customers?) (?:buy|pay)|test (?:the )?market|new (?:product|offer|line|service))\b/i,
    weight: 0.9,
  },
  {
    type: "pricing_feedback",
    re: /\b(?:price increase|raising (?:my )?prices?|willingness to pay|pricing feedback|charge more|premium version|package chang|price sensitivity|how much (?:to )?charge)\b/i,
    weight: 0.88,
  },
  {
    type: "customer_satisfaction",
    re: /\b(?:customer satisfaction|retention|churn|loyal(?:ty)?|client experience|keep customers|losing customers)\b/i,
    weight: 0.85,
  },
  {
    type: "product_improvement",
    re: /\b(?:feature request|improve (?:the )?product|usability|customer frustration|what(?:'s| is) broken|product feedback)\b/i,
    weight: 0.84,
  },
  {
    type: "discovery_research",
    re: /\b(?:market research|customer pain points?|audience understanding|who (?:is )?my (?:ideal )?(?:customer|audience)|unmet needs?|biggest challenges?)\b/i,
    weight: 0.86,
  },
  {
    type: "beta_tester",
    re: /\b(?:beta (?:test|program|launch)|pilot program|early access|launch feedback)\b/i,
    weight: 0.87,
  },
  {
    type: "testimonial",
    re: /\b(?:testimonial|case study|social proof|success stor(?:y|ies)|client stor(?:y|ies))\b/i,
    weight: 0.82,
  },
  {
    type: "product_validation",
    re: /\b(?:customer feedback|gather (?:real )?input|need (?:more )?information)\b/i,
    weight: 0.7,
  },
  {
    type: "discovery_research",
    re: /\b(?:survey|questionnaire)\b/i,
    weight: 0.55,
  },
];

const EXPLICIT_SURVEY_CREATE_RE =
  /\b(?:create|build|make|open)\s+(?:a\s+)?(?:product validation|pricing feedback|discovery research|customer satisfaction|beta tester|testimonial|product improvement)?\s*survey\b/i;

const SURVEY_OFFER_RE =
  /\b(?:product validation survey|pricing feedback survey|discovery research survey|customer satisfaction survey|beta tester survey|testimonial survey|create (?:a )?survey)\b/i;

const DECISION_TYPE_SURVEY: Partial<Record<BusinessDecisionType, SurveyType>> = {
  business_expansion: "product_validation",
  pricing: "pricing_feedback",
  strategy: "discovery_research",
  product_choice: "product_validation",
};

function threadText(messages: ChatTurn[] | undefined, userText: string): string {
  const prior = (messages ?? []).map((m) => m.content).join("\n");
  return `${prior}\n${userText}`.trim();
}

export function surveyTypeForSituationId(
  situationId: string | null | undefined,
): SurveyType | null {
  if (!situationId) return null;
  return SITUATION_SURVEY_MAP[situationId] ?? null;
}

export function recommendSurveyLength(input: {
  surveyType: SurveyType;
  confidence: number;
  thread: string;
}): SurveyLength {
  if (input.surveyType === "discovery_research") return "deep";
  if (input.surveyType === "testimonial" || input.surveyType === "beta_tester") {
    return "quick";
  }
  if (/\b(?:quick|short|simple|few questions)\b/i.test(input.thread)) {
    return "quick";
  }
  if (/\b(?:deep|comprehensive|thorough|research)\b/i.test(input.thread)) {
    return "deep";
  }
  if (input.confidence >= 0.8) return "standard";
  return "quick";
}

function scoreSurveySignals(thread: string): {
  type: SurveyType;
  score: number;
  hits: string[];
} | null {
  let best: { type: SurveyType; score: number; hits: string[] } | null = null;

  for (const signal of SURVEY_SIGNALS) {
    if (!signal.re.test(thread)) continue;
    const score = signal.weight;
    const hits = [signal.re.source];
    if (!best || score > best.score) {
      best = { type: signal.type, score, hits };
    }
  }

  return best;
}

function missingInformationLabel(type: SurveyType): string {
  switch (type) {
    case "product_validation":
      return "customer buying intent before launch";
    case "pricing_feedback":
      return "willingness to pay and perceived value";
    case "customer_satisfaction":
      return "current customer experience signals";
    case "product_improvement":
      return "specific product improvement priorities";
    case "discovery_research":
      return "audience needs and pain points";
    case "beta_tester":
      return "beta launch feedback";
    case "testimonial":
      return "client success stories and outcomes";
  }
}

export function questionsForSurveyLength(
  template: SurveyTemplate,
  length: SurveyLength,
): SurveyQuestion[] {
  const count = Math.min(LENGTH_COUNTS[length], template.questions.length);
  return template.questions.slice(0, count);
}

export function formatSurveyDraftContent(
  template: SurveyTemplate,
  length: SurveyLength,
): string {
  const questions = questionsForSurveyLength(template, length);
  const lines = [
    `# ${template.name}`,
    "",
    `**Purpose:** ${template.purpose}`,
    "",
    "## Instructions",
    "Share this with customers or prospects who fit your audience. Keep it short — one sitting, no jargon.",
    "",
    "## Questions",
    "",
    ...questions.map((q, i) => `${i + 1}. ${q.text}`),
    "",
    "---",
    "_Template from Survey Intelligence — edit questions to match your voice before sending._",
  ];
  return lines.join("\n");
}

export function buildSurveyCreationInput(
  template: SurveyTemplate,
  length: SurveyLength = "standard",
): CreationWorkspaceInput {
  return {
    itemType: template.itemType,
    title: template.name,
    draftContent: formatSurveyDraftContent(template, length),
    brief: template.purpose,
    source: "template",
    stage: "using template",
    templateId: `survey-${template.id}`,
    artifactTypeLocked: true,
  };
}

export function surveyOfferLineForTemplate(template: SurveyTemplate): string {
  return (
    `It sounds like the missing piece is **${missingInformationLabel(template.id)}**. ` +
    `I can help you build a survey to gather real input before making the decision. ` +
    `Would you like to create a **${template.name}**?`
  );
}

export function evaluateSurveyResourceCandidate(input: {
  surveyType: SurveyType | null;
  confidence: number;
  shouldDeferSurvey: boolean;
  discoveryComplete?: boolean;
}): SurveyResourceCandidate | null {
  if (!input.surveyType) return null;
  const template = SURVEY_TEMPLATES[input.surveyType];
  let confidence = input.confidence;
  const reasons: string[] = [];

  if (input.shouldDeferSurvey) {
    confidence -= 0.4;
    reasons.push("Discovery not complete — clarify before offering survey.");
  } else {
    reasons.push("Structured survey beats guessing for evidence gaps.");
  }

  if (input.discoveryComplete) {
    confidence += 0.1;
    reasons.push("Enough context to tailor the survey.");
  }

  confidence = Math.max(0, Math.min(1, confidence));

  return {
    id: "survey_template",
    surveyType: input.surveyType,
    label: template.name,
    confidence,
    reason: reasons.join(" "),
    offerReady: confidence >= OFFER_THRESHOLD && !input.shouldDeferSurvey,
  };
}

export function evaluateSurveyIntelligence(
  input: EvaluateSurveyIntelligenceInput,
): SurveyIntelligenceResult {
  const thread = threadText(input.messages, input.userText);
  const rationale: string[] = [];
  const signal = scoreSurveySignals(thread);

  let surveyType: SurveyType | null = signal?.type ?? null;
  let confidence = signal?.score ?? 0;

  if (signal) {
    rationale.push(`Feedback signal detected (${signal.type.replace(/_/g, " ")}).`);
  }

  const fromSituation = surveyTypeForSituationId(input.situationId);
  if (fromSituation) {
    surveyType = fromSituation;
    confidence = Math.max(confidence, 0.78);
    rationale.push(`Situation Atlas maps to ${SURVEY_TEMPLATES[fromSituation].name}.`);
  }

  if (!surveyType && input.decisionType) {
    const fromDecision = DECISION_TYPE_SURVEY[input.decisionType];
    if (fromDecision) {
      surveyType = fromDecision;
      confidence = Math.max(confidence, 0.72);
      rationale.push(`Decision type suggests ${SURVEY_TEMPLATES[fromDecision].name}.`);
    }
  }

  const needsSurvey = Boolean(surveyType) && confidence >= 0.55;
  const template = surveyType ? SURVEY_TEMPLATES[surveyType] : null;

  const shouldDeferSurvey =
    Boolean(input.decisionType === "business_expansion" && !input.discoveryComplete) ||
    (/\b(?:new product|add(?:ing)? a)\b/i.test(thread) &&
      !input.discoveryComplete &&
      input.decisionType === "business_expansion");

  if (shouldDeferSurvey) {
    rationale.push("Defer survey offer until basic business context is gathered.");
  }

  const recommendedLength = surveyType
    ? recommendSurveyLength({ surveyType, confidence, thread })
    : "standard";

  const resource = evaluateSurveyResourceCandidate({
    surveyType,
    confidence,
    shouldDeferSurvey,
    discoveryComplete: input.discoveryComplete,
  });

  const offerReady = Boolean(resource?.offerReady);
  const shouldOfferCreate = needsSurvey && offerReady;

  return {
    needsSurvey,
    surveyType,
    template,
    recommendedLength,
    confidence,
    shouldOfferCreate,
    offerReady,
    shouldDeferSurvey,
    situationId: input.situationId ?? null,
    missingInformation: surveyType ? missingInformationLabel(surveyType) : "",
    rationale,
    resource,
  };
}

export function isExplicitSurveyCreateRequest(text: string): boolean {
  return EXPLICIT_SURVEY_CREATE_RE.test(text.trim());
}

export function assistantOfferedSurveyCreate(text: string): boolean {
  return SURVEY_OFFER_RE.test(text.trim()) && /\?\s*$/.test(text.trim());
}

export function inferSurveyTypeFromAssistantOffer(
  text: string,
): SurveyType | null {
  const t = text.trim();
  if (/\bproduct validation survey\b/i.test(t)) return "product_validation";
  if (/\bpricing feedback survey\b/i.test(t)) return "pricing_feedback";
  if (/\bdiscovery research survey\b/i.test(t)) return "discovery_research";
  if (/\bcustomer satisfaction survey\b/i.test(t)) return "customer_satisfaction";
  if (/\bbeta tester survey\b/i.test(t)) return "beta_tester";
  if (/\btestimonial survey\b/i.test(t)) return "testimonial";
  if (/\bproduct improvement survey\b/i.test(t)) return "product_improvement";
  if (/\bcreate (?:a )?survey\b/i.test(t)) return "product_validation";
  return null;
}

export function surveyIntelligenceHintForChat(
  result: SurveyIntelligenceResult,
): string | null {
  if (!result.needsSurvey || !result.template) return null;

  const parts = [
    "SURVEY INTELLIGENCE (mandatory when evidence is missing):",
    `Missing information: ${result.missingInformation}.`,
    `Recommended template: ${result.template.name}.`,
    `Survey length: ${result.recommendedLength} (${LENGTH_COUNTS[result.recommendedLength]} questions).`,
    result.rationale.join(" "),
  ];

  if (result.shouldDeferSurvey) {
    parts.push(
      "DO NOT offer Create or a survey template on this turn.",
      "Ask ONE discovery question first — then offer the survey with permission.",
    );
    return parts.join("\n");
  }

  if (result.shouldOfferCreate) {
    parts.push(
      `OFFER CREATE: ${surveyOfferLineForTemplate(result.template)}`,
      "If user accepts, Create opens with the template pre-loaded — NOT a blank document.",
      "FORBIDDEN: empty form, blank page, or asking user to invent questions from scratch.",
    );
  } else {
    parts.push(
      "Acknowledge the evidence gap in 1–2 sentences.",
      "Prepare to offer the survey after one clarifying question.",
    );
  }

  return parts.join("\n");
}

// ─── Founder Intelligence ───────────────────────────────────────────────────

function readFounderRecord(): SurveyFounderRecord {
  if (typeof window === "undefined") {
    return {
      surveysCreated: 0,
      surveysCompleted: 0,
      byType: {},
      decisionsInfluenced: 0,
      updatedAt: new Date().toISOString(),
    };
  }
  try {
    const raw = localStorage.getItem(FOUNDER_STORAGE_KEY);
    if (!raw) throw new Error("empty");
    return JSON.parse(raw) as SurveyFounderRecord;
  } catch {
    return {
      surveysCreated: 0,
      surveysCompleted: 0,
      byType: {},
      decisionsInfluenced: 0,
      updatedAt: new Date().toISOString(),
    };
  }
}

function writeFounderRecord(record: SurveyFounderRecord) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FOUNDER_STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* noop */
  }
}

export function recordSurveyCreated(
  surveyType: SurveyType,
  opts?: { influencedDecision?: boolean },
): SurveyFounderRecord {
  const cur = readFounderRecord();
  const next: SurveyFounderRecord = {
    ...cur,
    surveysCreated: cur.surveysCreated + 1,
    byType: {
      ...cur.byType,
      [surveyType]: (cur.byType[surveyType] ?? 0) + 1,
    },
    decisionsInfluenced:
      cur.decisionsInfluenced + (opts?.influencedDecision ? 1 : 0),
    lastSurveyType: surveyType,
    lastCreatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  writeFounderRecord(next);
  return next;
}

export function recordSurveyCompleted(surveyType: SurveyType): SurveyFounderRecord {
  const cur = readFounderRecord();
  const next: SurveyFounderRecord = {
    ...cur,
    surveysCompleted: cur.surveysCompleted + 1,
    lastSurveyType: surveyType,
    updatedAt: new Date().toISOString(),
  };
  writeFounderRecord(next);
  return next;
}

export function getSurveyFounderMetrics(): SurveyFounderRecord {
  return readFounderRecord();
}

export function mostUsedSurveyType(): SurveyType | null {
  const metrics = readFounderRecord();
  let best: SurveyType | null = null;
  let bestCount = 0;
  for (const [type, count] of Object.entries(metrics.byType)) {
    if ((count ?? 0) > bestCount) {
      best = type as SurveyType;
      bestCount = count ?? 0;
    }
  }
  return best;
}

export const SURVEY_RESOURCE_OFFER_THRESHOLD = OFFER_THRESHOLD;
