/**
 * Sprint 4 — ADHD Entrepreneur Intelligence™ as the primary lens.
 * Board of Directors is Layer 3 (advisory). This layer is Layer 1 (decision maker).
 */

import type { AdhdNativeAnalysis } from "./adhdNativeIntelligence";
import type { MultiTurnPatternAnalysis } from "./adhdMultiTurnPatterns";
import type { WorkspaceAdvisorRole } from "./workspaceContextLock";
import { adaptiveUserIntelligenceSprint5HintForChat } from "./companionAdaptiveUserEngine";

export type AdhdBusinessPattern =
  | "perfectionism"
  | "planning_addiction"
  | "research_spiral"
  | "tool_hopping"
  | "offer_hopping"
  | "course_collecting"
  | "shiny_object"
  | "time_blindness"
  | "overcommitting"
  | "underestimating_effort"
  | "urgency_addiction"
  | "deadline_dependence"
  | "avoidance"
  | "confidence_crash"
  | "burnout_cycle"
  | "hyperfocus_crash"
  | "dopamine_chasing"
  | "decision_paralysis"
  | "inconsistent_execution";

export type IntelligenceLayer =
  | "adhd_entrepreneur"
  | "adaptive_user"
  | "board_of_directors"
  | "feature_intelligence"
  | "outcome_intelligence";

export const INTELLIGENCE_HIERARCHY_ORDER: IntelligenceLayer[] = [
  "adhd_entrepreneur",
  "adaptive_user",
  "board_of_directors",
  "feature_intelligence",
  "outcome_intelligence",
];

type PatternSpec = {
  id: AdhdBusinessPattern;
  label: string;
  re: RegExp;
  filterNote: string;
};

export const ADHD_ENTREPRENEUR_KNOWLEDGE_BASE: PatternSpec[] = [
  {
    id: "perfectionism",
    label: "Perfectionism",
    re: /\b(?:perfect|not good enough|not ready|one more tweak|has to be right)\b/i,
    filterNote: "Favor good-enough forward motion over polish.",
  },
  {
    id: "planning_addiction",
    label: "Planning addiction",
    re: /\b(?:another plan|keep planning|outline first|need a system|checklist before)\b/i,
    filterNote: "Plans are not progress — find the smallest start.",
  },
  {
    id: "research_spiral",
    label: "Research spiral",
    re: /\b(?:research more|one more course|learn more before|gather more info)\b/i,
    filterNote: "Research is often fear — define good enough to act.",
  },
  {
    id: "tool_hopping",
    label: "Tool hopping",
    re: /\b(?:another tool|different app|switch tools|new platform|better software)\b/i,
    filterNote: "Tools don't fix execution — simplify the workflow first.",
  },
  {
    id: "offer_hopping",
    label: "Offer hopping",
    re: /\b(?:new offer|different offer|pivot offer|change my offer|another program)\b/i,
    filterNote: "Offer switching often avoids selling — stabilize one offer first.",
  },
  {
    id: "course_collecting",
    label: "Course collecting",
    re: /\b(?:another course|buy a course|sign up for|training program)\b/i,
    filterNote: "Learning without application is avoidance — apply one lesson.",
  },
  {
    id: "shiny_object",
    label: "Shiny object syndrome",
    re: /\b(?:shiny object|new idea|saw someone|everyone is doing|trending)\b/i,
    filterNote: "Novelty is not strategy — return to the committed path.",
  },
  {
    id: "time_blindness",
    label: "Time blindness",
    re: /\b(?:where did the time|lost track of time|took longer than|ran out of time|time got away)\b/i,
    filterNote: "Shrink time boxes — external timers and visible deadlines.",
  },
  {
    id: "overcommitting",
    label: "Overcommitting",
    re: /\b(?:said yes to too|too many commitments|overcommitted|can't do it all)\b/i,
    filterNote: "Subtract before adding — protect capacity.",
  },
  {
    id: "underestimating_effort",
    label: "Underestimating effort",
    re: /\b(?:thought it would take|took way longer|underestimated|bigger than i thought)\b/i,
    filterNote: "Double the estimate — plan for friction.",
  },
  {
    id: "urgency_addiction",
    label: "Urgency addiction",
    re: /\b(?:only works under pressure|last minute|deadline rush|need pressure)\b/i,
    filterNote: "Artificial urgency burns out — build micro-deadlines instead.",
  },
  {
    id: "deadline_dependence",
    label: "Deadline dependence",
    re: /\b(?:need a deadline|won't start without|waiting until due)\b/i,
    filterNote: "Create external accountability without crisis mode.",
  },
  {
    id: "avoidance",
    label: "Avoidance",
    re: /\b(?:avoiding|putting off|can'?t make myself|procrastinat)\b/i,
    filterNote: "Name the scary part — shrink exposure, not willpower.",
  },
  {
    id: "confidence_crash",
    label: "Confidence crash",
    re: /\b(?:nobody will|not qualified|imposter|fraud|who am i to)\b/i,
    filterNote: "Ground in evidence — one stabilizing step, no cheerleading.",
  },
  {
    id: "burnout_cycle",
    label: "Burnout cycle",
    re: /\b(?:burned out|burnt out|running on empty|can'?t keep this pace)\b/i,
    filterNote: "Recovery is strategic — make today smaller.",
  },
  {
    id: "hyperfocus_crash",
    label: "Hyperfocus crash",
    re: /\b(?:hyperfocus|crashed after|all night|ignored everything else)\b/i,
    filterNote: "Protect recovery after sprints — don't stack big asks.",
  },
  {
    id: "dopamine_chasing",
    label: "Dopamine chasing",
    re: /\b(?:quick win|easy task|busy work|low.?value|organizing instead)\b/i,
    filterNote: "Safer tasks may be avoidance — name the exposed task.",
  },
  {
    id: "decision_paralysis",
    label: "Decision paralysis",
    re: /\b(?:can'?t decide|stuck between|too many options|decision paralysis)\b/i,
    filterNote: "Reduce options artificially — good enough beats perfect.",
  },
  {
    id: "inconsistent_execution",
    label: "Inconsistent execution",
    re: /\b(?:start strong then stop|never follow through|inconsistent|fall off)\b/i,
    filterNote: "Repeatable beats ambitious — one rhythm at a time.",
  },
];

type ExpertTranslation = {
  domain: WorkspaceAdvisorRole;
  traditional: RegExp;
  translated: string;
};

const EXPERT_TRANSLATIONS: ExpertTranslation[] = [
  {
    domain: "marketing",
    traditional: /\b(?:five platforms|every day|post daily|comprehensive content strategy|content calendar for the quarter)\b/i,
    translated:
      "Choose one platform and one repeatable post rhythm first — visibility beats volume.",
  },
  {
    domain: "marketing",
    traditional: /\b(?:full funnel|complete nurture sequence|omnichannel)\b/i,
    translated:
      "Decide what happens after someone says they're interested — one next step.",
  },
  {
    domain: "operations",
    traditional: /\b(?:detailed sops? for all|document every workflow|comprehensive systems)\b/i,
    translated:
      "Document the one process that causes the most frustration — not everything at once.",
  },
  {
    domain: "operations",
    traditional: /\b(?:implement (?:a )?crm workflow|full crm setup)\b/i,
    translated:
      "Make sure new leads don't get forgotten — one follow-up habit first.",
  },
  {
    domain: "planning",
    traditional: /\b(?:90[- ]day strategic plan|comprehensive roadmap|full business plan)\b/i,
    translated:
      "Identify the next milestone and build from there — not the whole map.",
  },
  {
    domain: "planning",
    traditional: /\b(?:quarterly goals? for every area|balance all pillars)\b/i,
    translated:
      "Pick the one outcome that would make this month feel successful.",
  },
  {
    domain: "marketing",
    traditional: /\b(?:create a comprehensive content strategy)\b/i,
    translated: "Decide what one post needs to accomplish first.",
  },
];

const BOARD_DOMAIN_GUIDANCE: Record<WorkspaceAdvisorRole, string> = {
  marketing:
    "Marketing expertise (invisible): audience, message, visibility — translate to ONE channel, ONE rhythm, ONE next post.",
  operations:
    "Operations expertise (invisible): systems and delivery — translate to ONE frustrating process, ONE checklist.",
  planning:
    "Planning expertise (invisible): goals and roadmap — translate to ONE milestone, ONE next week.",
  mindset:
    "Mindset expertise (invisible): friction and capacity — translate to ONE smaller step, zero shame.",
};

export function detectAdhdBusinessPatterns(text: string): AdhdBusinessPattern[] {
  const t = text.trim();
  if (!t) return [];
  return ADHD_ENTREPRENEUR_KNOWLEDGE_BASE.filter((p) => p.re.test(t)).map(
    (p) => p.id,
  );
}

export function translateExpertAdviceInText(text: string): string | null {
  const t = text.trim();
  if (!t) return null;
  for (const rule of EXPERT_TRANSLATIONS) {
    if (rule.traditional.test(t)) return rule.translated;
  }
  return null;
}

export function getExpertTranslationForDomain(
  domain: WorkspaceAdvisorRole,
): string {
  const examples = EXPERT_TRANSLATIONS.filter((e) => e.domain === domain)
    .slice(0, 2)
    .map((e) => e.translated);
  return examples.length
    ? `Expert translation examples: ${examples.join(" | ")}`
    : BOARD_DOMAIN_GUIDANCE[domain];
}

/** ADHD reality check — would a brilliant ADHD entrepreneur realistically execute this? */
export function adhdRealityCheck(recommendation: string): {
  realistic: boolean;
  issue?: string;
  simplified?: string;
} {
  const t = recommendation.trim();
  if (!t) return { realistic: true };

  const overloadRe =
    /\b(?:every day|all platforms|comprehensive|complete system|full funnel|90[- ]day plan|all major workflows|every area|daily for)\b/i;
  if (overloadRe.test(t)) {
    return {
      realistic: false,
      issue: "Too much scope for ADHD execution",
      simplified:
        "Shrink to one platform, one process, or one milestone — sequence the rest.",
    };
  }

  const multiStepOverload =
    (t.match(/\d+\s*(?:steps|tasks|platforms|goals)/i) ?? []).length > 0 ||
    (t.split(/[,;]/).length > 4 && /\b(?:and|also|then)\b/i.test(t));
  if (multiStepOverload && t.length > 120) {
    return {
      realistic: false,
      issue: "Too many parallel actions",
      simplified: "Offer ONE next action — sequence the rest after completion.",
    };
  }

  return { realistic: true };
}

export type AdhdEntrepreneurAnalysis = {
  detectedPatterns: AdhdBusinessPattern[];
  patternNotes: string[];
  expertTranslation: string | null;
  boardDomain: WorkspaceAdvisorRole | null;
};

export function analyzeAdhdEntrepreneurTurn(input: {
  userText: string;
  adhdNative?: AdhdNativeAnalysis | null;
  multiTurn?: MultiTurnPatternAnalysis | null;
  boardDomain?: WorkspaceAdvisorRole | null;
}): AdhdEntrepreneurAnalysis {
  const detectedPatterns = detectAdhdBusinessPatterns(input.userText);
  const patternNotes = detectedPatterns
    .map((id) => {
      const spec = ADHD_ENTREPRENEUR_KNOWLEDGE_BASE.find((p) => p.id === id);
      return spec ? `${spec.label}: ${spec.filterNote}` : "";
    })
    .filter(Boolean);

  const expertTranslation =
    translateExpertAdviceInText(input.userText) ??
    (input.boardDomain
      ? getExpertTranslationForDomain(input.boardDomain)
      : null);

  return {
    detectedPatterns,
    patternNotes,
    expertTranslation,
    boardDomain: input.boardDomain ?? null,
  };
}

/** Layer 1 — primary hint. Always injected before board/advisor hints. */
export function adhdEntrepreneurPrimaryHintForChat(input: {
  analysis: AdhdEntrepreneurAnalysis;
  adhdNative?: AdhdNativeAnalysis | null;
}): string {
  const parts: string[] = [
    "ADHD ENTREPRENEUR INTELLIGENCE™ (Layer 1 — PRIMARY — always first):",
    "You are an ADHD Entrepreneur Companion with access to a Board of Directors — NOT ADHD Companion + Board.",
    "Before ANY recommendation, strategy, workflow, or expert insight, ask: What would actually work for an ADHD entrepreneur?",
    "Never default to traditional business coach advice. Simplify, reduce, sequence, make actionable.",
    "ONE COMPANION RULE: User never switches to Marketing/Sales/Operations — you integrate expertise invisibly.",
    "Expert advice must pass the ADHD filter before speaking. Translate — never repeat traditional advice raw.",
  ];

  if (input.analysis.detectedPatterns.length) {
    parts.push(
      `ADHD business patterns this turn: ${input.analysis.detectedPatterns.join(", ")}.`,
      input.analysis.patternNotes.join(" "),
    );
  }

  if (input.adhdNative?.protectionMode === "momentum") {
    parts.push("Protect momentum — no scope expansion.");
  }
  if (input.adhdNative?.protectionMode === "overwhelm") {
    parts.push("Protect from overwhelm — reduce complexity before adding expertise.");
  }

  if (input.analysis.expertTranslation) {
    parts.push(`EXPERT TRANSLATION (mandatory lens): ${input.analysis.expertTranslation}`);
  }

  parts.push(
    "INTELLIGENCE HIERARCHY: (0) Trust + Confidence + Adaptive User → (1) ADHD Entrepreneur → (3) Board advisory → (4) Feature routing → (5) Outcome tracking.",
    "Board of Directors serves expertise when needed — it does NOT drive the conversation.",
  );

  return parts.join("\n");
}

/** Layer 3 — board hint subordinate to Layer 1. */
export function buildFilteredBoardAdvisorHint(role: WorkspaceAdvisorRole): string {
  const domainGuidance = BOARD_DOMAIN_GUIDANCE[role];
  const translation = getExpertTranslationForDomain(role);

  return [
    "BOARD OF DIRECTORS™ (Layer 3 — advisory only, invisible):",
    `Draw on ${domainGuidance}`,
    translation,
    "CRITICAL: Filter every board insight through ADHD Entrepreneur Intelligence first. If traditional advice would overwhelm — rewrite it before speaking.",
    "Never say you are the marketing expert, CEO, or operations advisor — one companion voice only.",
  ].join("\n");
}

/** @deprecated Use companionSprint5Intelligence adaptive hint. */
export function adaptiveUserIntelligenceHintForChat(): string | null {
  return adaptiveUserIntelligenceSprint5HintForChat({});
}
