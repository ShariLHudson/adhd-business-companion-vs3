/**
 * Chamber of Momentum — intelligence decision logic (Phase 5).
 * Understand emotional state, energy, and clarity before routing support.
 *
 * @see docs/protocols/CHAMBER_OF_MOMENTUM_INTELLIGENCE_DECISION_LOGIC_SPECIFICATION_PHASE5.md
 */

import type { AppSection } from "@/lib/companionUi";
import type { ChamberMomentumIntent } from "./chamberOfMomentumRouting";

export const CHAMBER_INTELLIGENCE_SESSION_KEY =
  "chamber-momentum-intelligence-v1";

export type ChamberSupportState =
  | "overwhelmed"
  | "too-many-ideas"
  | "stuck"
  | "needs-plan"
  | "ready-to-execute"
  | "wants-to-learn";

export type ChamberEnergyLevel = "low" | "normal" | "high";

export type ChamberStuckBlocker =
  | "clarity"
  | "skill"
  | "time"
  | "energy"
  | "confidence";

export type ChamberDecisionPriority =
  | "reduce-overwhelm"
  | "create-clarity"
  | "choose-next-action"
  | "build-plan"
  | "execute"
  | "capture-progress";

export type ChamberIntelligenceAssessment = {
  state: ChamberSupportState;
  energy: ChamberEnergyLevel;
  priority: ChamberDecisionPriority;
  intent: ChamberMomentumIntent;
  section: AppSection;
  stuckBlocker: ChamberStuckBlocker | null;
  /** One important question — never a form. */
  memberQuestion: string | null;
  lowEnergyMode: boolean;
};

export const CHAMBER_STUCK_QUESTION =
  "What is making the next step difficult?";

export const CHAMBER_DELAY_REFRAME_QUESTION = "What changed?";

export const CHAMBER_COMPLETION_QUESTIONS = [
  "What did you accomplish?",
  "What did you learn?",
  "What would you like to remember?",
] as const;

const OVERWHELMED_RE =
  /\b(?:too much to do|don'?t know where to start|brain is everywhere|feel(?:ing)? stuck|overwhelm(?:ed)?|my head is spinning|everything at once|can'?t keep up)\b/i;

const TOO_MANY_IDEAS_RE =
  /\b(?:so many ideas|too many ideas|want to do everything|don'?t want to lose (?:this )?idea|ideas everywhere|lots of ideas|i have an idea)\b/i;

const STUCK_RE =
  /\b(?:don'?t know what to do next|started but can(?:not|'t) move forward|cannot move forward|can'?t move forward|stuck on this|not moving forward)\b/i;

const NEEDS_PLAN_RE =
  /\b(?:help me organize|make me a plan|need a plan|organize this|break this into steps)\b/i;

const READY_TO_EXECUTE_RE =
  /\b(?:know what i need to do|help me finish|finish my|complete (?:this )?project|work on (?:a )?project|need to finish|ready to (?:work|execute))\b/i;

const WANTS_TO_LEARN_RE =
  /\b(?:teach me|i want to learn|how do i improve|need to understand|help me learn|want to learn|how do i)\b/i;

const LOW_ENERGY_RE =
  /\b(?:tired|exhausted|discouraged|limited time|low energy|no energy|don'?t have (?:the )?capacity|not much time|wiped out|drained)\b/i;

const HIGH_ENERGY_RE =
  /\b(?:motivated|excited|ready to go|pumped|energized|fired up)\b/i;

const BLOCKER_CLARITY_RE =
  /\b(?:don'?t know what to do|unclear|not sure what|what should i do)\b/i;

const BLOCKER_SKILL_RE =
  /\b(?:don'?t know how|need to learn how|how do i|don'?t understand how)\b/i;

const BLOCKER_TIME_RE =
  /\b(?:don'?t have (?:enough )?time|not enough time|no time|too busy)\b/i;

const BLOCKER_ENERGY_RE =
  /\b(?:don'?t have (?:the )?capacity|too tired|low energy|no energy today)\b/i;

const BLOCKER_CONFIDENCE_RE =
  /\b(?:afraid|won'?t work|scared|imposter|not good enough|might fail)\b/i;

const STATE_PRIORITY: ChamberSupportState[] = [
  "overwhelmed",
  "too-many-ideas",
  "stuck",
  "needs-plan",
  "ready-to-execute",
  "wants-to-learn",
];

const STATE_TO_INTENT: Record<ChamberSupportState, ChamberMomentumIntent> = {
  overwhelmed: "build",
  "too-many-ideas": "idea",
  stuck: "build",
  "needs-plan": "plan",
  "ready-to-execute": "execute",
  "wants-to-learn": "learn",
};

const STATE_TO_PRIORITY: Record<ChamberSupportState, ChamberDecisionPriority> =
  {
    overwhelmed: "reduce-overwhelm",
    "too-many-ideas": "create-clarity",
    stuck: "choose-next-action",
    "needs-plan": "build-plan",
    "ready-to-execute": "execute",
    "wants-to-learn": "create-clarity",
  };

function detectSupportState(text: string): ChamberSupportState | null {
  const checks: [ChamberSupportState, RegExp][] = [
    ["overwhelmed", OVERWHELMED_RE],
    ["too-many-ideas", TOO_MANY_IDEAS_RE],
    ["stuck", STUCK_RE],
    ["needs-plan", NEEDS_PLAN_RE],
    ["ready-to-execute", READY_TO_EXECUTE_RE],
    ["wants-to-learn", WANTS_TO_LEARN_RE],
  ];

  for (const state of STATE_PRIORITY) {
    const match = checks.find(([s]) => s === state);
    if (match && match[1].test(text)) return state;
  }
  return null;
}

export function detectChamberEnergyLevel(text: string): ChamberEnergyLevel {
  if (LOW_ENERGY_RE.test(text)) return "low";
  if (HIGH_ENERGY_RE.test(text)) return "high";
  return "normal";
}

export function classifyStuckBlocker(text: string): ChamberStuckBlocker | null {
  if (BLOCKER_CONFIDENCE_RE.test(text)) return "confidence";
  if (BLOCKER_SKILL_RE.test(text)) return "skill";
  if (BLOCKER_TIME_RE.test(text)) return "time";
  if (BLOCKER_ENERGY_RE.test(text)) return "energy";
  if (BLOCKER_CLARITY_RE.test(text)) return "clarity";
  return null;
}

function memberQuestionForState(
  state: ChamberSupportState,
  stuckBlocker: ChamberStuckBlocker | null,
): string | null {
  switch (state) {
    case "stuck":
      return stuckBlocker ? null : CHAMBER_STUCK_QUESTION;
    case "needs-plan":
      return "What outcome are you trying to reach?";
    case "ready-to-execute":
      return "What do you want to finish next?";
    case "wants-to-learn":
      return "What do you want to understand better?";
    default:
      return null;
  }
}

/** Route support from assessed state — relief before optimization. */
export function chamberIntelligenceSection(input: {
  state: ChamberSupportState;
  energy: ChamberEnergyLevel;
  stuckBlocker: ChamberStuckBlocker | null;
}): AppSection {
  const { state, energy, stuckBlocker } = input;

  if (state === "overwhelmed") {
    return energy === "high" ? "momentum-builder" : "brain-dump";
  }

  if (state === "too-many-ideas") {
    return "evidence-bank";
  }

  if (state === "stuck") {
    switch (stuckBlocker) {
      case "skill":
        return "momentum-institute";
      case "confidence":
        return "evidence-bank";
      case "energy":
        return "brain-dump";
      case "time":
      case "clarity":
      default:
        return "momentum-builder";
    }
  }

  if (state === "needs-plan") {
    return "momentum-builder";
  }

  if (state === "ready-to-execute") {
    return "chamber-project-entry";
  }

  return "momentum-institute";
}

/** Shrink large actions when energy is low. */
export function reduceActionForLowEnergy(action: string): string {
  const trimmed = action.trim();
  const lower = trimmed.toLowerCase();

  if (/\bmarketing plan\b/i.test(trimmed)) {
    return "Write three customer problems you solve.";
  }
  if (/\b(?:full|complete|entire)\b.*\b(?:website|site)\b/i.test(trimmed)) {
    return "Write the homepage headline.";
  }
  if (/\bonline course\b/i.test(trimmed)) {
    return "Name the one person this course is for.";
  }
  if (/\bbook\b/i.test(trimmed) && /\b(?:write|finish|complete)\b/i.test(lower)) {
    return "Write one paragraph of the opening scene.";
  }
  if (lower.length > 48) {
    return "Choose the smallest honest next step.";
  }
  return trimmed;
}

export function assessChamberMomentum(text: string): ChamberIntelligenceAssessment | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const state = detectSupportState(trimmed);
  if (!state) return null;

  const energy = detectChamberEnergyLevel(trimmed);
  const stuckBlocker =
    state === "stuck" ? classifyStuckBlocker(trimmed) : null;
  const lowEnergyMode = energy === "low" || stuckBlocker === "energy";

  return {
    state,
    energy,
    priority: STATE_TO_PRIORITY[state],
    intent: STATE_TO_INTENT[state],
    section: chamberIntelligenceSection({ state, energy, stuckBlocker }),
    stuckBlocker,
    memberQuestion: memberQuestionForState(state, stuckBlocker),
    lowEnergyMode,
  };
}

export function stageChamberIntelligence(
  assessment: ChamberIntelligenceAssessment,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      CHAMBER_INTELLIGENCE_SESSION_KEY,
      JSON.stringify(assessment),
    );
  } catch {
    /* quota */
  }
}

export function consumeChamberIntelligence(): ChamberIntelligenceAssessment | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHAMBER_INTELLIGENCE_SESSION_KEY);
    sessionStorage.removeItem(CHAMBER_INTELLIGENCE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChamberIntelligenceAssessment;
    if (!parsed?.state || !parsed?.section) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function peekChamberIntelligence(): ChamberIntelligenceAssessment | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHAMBER_INTELLIGENCE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ChamberIntelligenceAssessment;
  } catch {
    return null;
  }
}
