/**
 * Pre-reasoning analysis — 9 questions before responding.
 */

import { selectDisciplines } from "@/lib/sparkResponseIntelligence/disciplineRouting";
import type { DisciplineId, InteractionClass } from "@/lib/sparkResponseIntelligence/types";

import { detectProblemNature, selectReasoningMode, shouldOverthinkGuard } from "./reasoningModes";
import type {
  Assumption,
  ConfidenceLevel,
  KnownFact,
  MissingInfo,
  ProblemNature,
  ReasoningInput,
  ReasoningMode,
} from "./types";

export function inferAccomplishing(message: string, nature: ProblemNature): string {
  const t = message.trim();
  if (nature === "emotional") {
    return "Find relief, clarity, or permission without more pressure";
  }
  return t.length > 100 ? t.slice(0, 100) + "…" : t;
}

export function inferSuccess(mode: ReasoningMode, message: string): string {
  switch (mode) {
    case "quick_answer":
      return "Member has a clear, correct answer";
    case "coaching":
      return "Member feels supported with one manageable next step";
    case "planning":
      return "Member has a sequenced plan with a first action";
    case "creative_reasoning":
      return "Member has a tangible creative starting point";
    case "decision_support":
      return "Member can make a confident decision with tradeoffs understood";
    case "research_reasoning":
      return "Member has trustworthy information scoped to their question";
    case "executive_board_reasoning":
      return "Member understands stakes, risks, and recommended path";
    case "teaching_reasoning":
      return "Member understands the concept well enough to apply it";
    case "reflective_reasoning":
      return "Member feels heard and slightly clearer";
    default:
      return `Move forward on: ${message.slice(0, 60)}`;
  }
}

export function extractKnownFacts(
  message: string,
  provided?: KnownFact[],
): KnownFact[] {
  const facts: KnownFact[] = [...(provided ?? [])];
  const lower = message.toLowerCase();

  if (/\b(coaching|consulting|course|membership)\b/.test(lower)) {
    facts.push({
      statement: "Member mentioned an offer type in message",
      source: "member",
      weight: 0.7,
    });
  }
  if (/\b(\$|price|pricing|revenue)\b/.test(lower)) {
    facts.push({
      statement: "Pricing or money topic present",
      source: "member",
      weight: 0.8,
    });
  }

  return facts;
}

export function detectMissing(
  message: string,
  mode: ReasoningMode,
  nature: ProblemNature,
): MissingInfo[] {
  const missing: MissingInfo[] = [];
  const lower = message.toLowerCase();
  const len = message.trim().length;

  if (len < 12) {
    missing.push({ field: "request_detail", severity: "blocking" });
  }

  if (mode === "research_reasoning" && !/\b(quick|deep|current|latest)\b/.test(lower)) {
    missing.push({ field: "research_depth", severity: "helpful" });
  }

  if (
    mode === "creative_reasoning" &&
    /\b(campaign|landing)\b/.test(lower) &&
    !/\b(audience|for who|offer)\b/.test(lower)
  ) {
    missing.push({ field: "audience_or_offer", severity: "blocking" });
  }

  if (nature === "strategic" && mode === "decision_support" && len < 60) {
    missing.push({ field: "decision_context", severity: "helpful" });
  }

  return missing;
}

export function researchRequired(
  message: string,
  mode: ReasoningMode,
): { required: boolean; reason?: string } {
  if (mode !== "research_reasoning" && mode !== "executive_board_reasoning") {
    return { required: false };
  }

  const lower = message.toLowerCase();
  if (/\b(current|latest|today|this year|202\d|competitor|market)\b/.test(lower)) {
    return {
      required: true,
      reason: "Current facts or market conditions materially affect the answer",
    };
  }

  if (mode === "research_reasoning") {
    return { required: true, reason: "Explicit research request" };
  }

  return { required: false };
}

function mapModeToInteraction(mode: ReasoningMode): InteractionClass {
  switch (mode) {
    case "creative_reasoning":
      return "creative_work";
    case "research_reasoning":
      return "research";
    case "planning":
      return "planning";
    case "decision_support":
    case "strategic_reasoning":
    case "executive_board_reasoning":
      return "decision_making";
    case "teaching_reasoning":
      return "learning";
    case "reflective_reasoning":
      return "reflection";
    case "coaching":
      return "emotional_support";
    default:
      return "execution";
  }
}

export function selectParticipatingDisciplines(
  mode: ReasoningMode,
  message: string,
): DisciplineId[] {
  if (mode === "quick_answer" || mode === "reflective_reasoning" || mode === "coaching") {
    return [];
  }
  return selectDisciplines(mapModeToInteraction(mode), message);
}

export function scoreConfidence(
  missing: MissingInfo[],
  known: KnownFact[],
  mode: ReasoningMode,
): { level: ConfidenceLevel; note?: string } {
  if (missing.some((m) => m.severity === "blocking")) {
    return { level: "low", note: "Blocking information missing" };
  }
  if (mode === "research_reasoning" || mode === "executive_board_reasoning") {
    return { level: "medium", note: "May require verification or research" };
  }
  if (known.length >= 2 && missing.length === 0) {
    return { level: "high" };
  }
  if (missing.some((m) => m.severity === "helpful")) {
    return { level: "medium", note: "Proceed with stated assumptions" };
  }
  return { level: "high" };
}

export function detectAssumptions(
  message: string,
  missing: MissingInfo[],
  confidence: ConfidenceLevel,
): Assumption[] {
  if (confidence === "high" && missing.length === 0) return [];

  const assumptions: Assumption[] = [];
  const lower = message.toLowerCase();

  if (!/\b(audience|customer|client)\b/.test(lower) && /\b(marketing|sell)\b/.test(lower)) {
    assumptions.push({
      field: "target_audience",
      value: "Existing customer base similar to past buyers",
      confidence: "medium",
      shouldStateToMember: true,
    });
  }

  if (missing.some((m) => m.field === "research_depth")) {
    assumptions.push({
      field: "research_depth",
      value: "Member wants a practical quick take unless they say otherwise",
      confidence: "medium",
      shouldStateToMember: true,
    });
  }

  return assumptions;
}

export function analyzePreReasoning(input: ReasoningInput): {
  mode: ReasoningMode;
  nature: ProblemNature;
  accomplishing: string;
  success: string;
  known: KnownFact[];
  missing: MissingInfo[];
  research: { required: boolean; reason?: string };
  disciplines: DisciplineId[];
  confidence: ConfidenceLevel;
  confidenceNote?: string;
  assumptions: Assumption[];
  overthinkGuard: boolean;
} {
  const nature = detectProblemNature(input.memberMessage);
  const mode = selectReasoningMode(input.memberMessage, nature);
  const accomplishing =
    input.objectiveSummary ?? inferAccomplishing(input.memberMessage, nature);
  const success = inferSuccess(mode, input.memberMessage);
  const known = extractKnownFacts(input.memberMessage, input.knownFacts);
  const missing = detectMissing(input.memberMessage, mode, nature);
  const research = researchRequired(input.memberMessage, mode);
  const disciplines = selectParticipatingDisciplines(mode, input.memberMessage);
  const { level: confidence, note: confidenceNote } = scoreConfidence(
    missing,
    known,
    mode,
  );
  const assumptions = detectAssumptions(input.memberMessage, missing, confidence);

  return {
    mode,
    nature,
    accomplishing,
    success,
    known,
    missing,
    research,
    disciplines,
    confidence,
    confidenceNote,
    assumptions,
    overthinkGuard: shouldOverthinkGuard(mode),
  };
}
