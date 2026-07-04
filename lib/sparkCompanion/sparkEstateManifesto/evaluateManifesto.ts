import { detectMemberEmotionalSignals } from "@/lib/conversation/emotionalFirstResponseSequence";
import { detectMentalLoadSignals } from "@/lib/sparkCompanion/makeItLighter/mentalLoadSignals";
import type {
  MemberSeason,
  SparkEstateManifestoDecision,
  SparkFiveQuestion,
} from "./types";

const CELEBRATION_RE =
  /\b(?:excited|thrilled|celebrat|big win|nailed it|proud|launched|so happy|amazing news|breakthrough)\b/i;

const CREATING_RE =
  /\b(?:creating|writing|building|designing|drafting|making|working on my)\b/i;

const LEARNING_RE =
  /\b(?:learn(?:ing)?|studying|research(?:ing)?|curious about|want to understand)\b/i;

const DREAMING_RE =
  /\b(?:dream(?:ing)?|vision|someday|what if i could|imagine|big idea)\b/i;

const DIFFICULT_RE =
  /\b(?:overwhelm|grief|grieving|burned out|burnt out|can'?t|stuck|ashamed|hopeless|discouraged|heavy|hard day|difficult|struggling|exhausted)\b/i;

const REST_RE =
  /\b(?:rest(?:ing)?|need a break|step away|pause|slow down|gentle day|lighter day)\b/i;

function detectSeason(text: string, overwhelmed?: boolean): MemberSeason {
  const t = text.trim();
  if (!t) return "neutral";
  if (overwhelmed || DIFFICULT_RE.test(t)) return "difficult";
  if (REST_RE.test(t)) return "resting";
  if (CELEBRATION_RE.test(t)) return "celebrating";
  if (DREAMING_RE.test(t)) return "dreaming";
  if (CREATING_RE.test(t) && !DIFFICULT_RE.test(t)) return "creating";
  if (LEARNING_RE.test(t) && !DIFFICULT_RE.test(t)) return "learning";
  if (/\b(?:build(?:ing)?|grow(?:ing)?|launch(?:ing)?)\b/i.test(t)) {
    return "building";
  }
  return "neutral";
}

function relevantQuestionsForTurn(
  text: string,
  season: MemberSeason,
  overwhelmed?: boolean,
): SparkFiveQuestion[] {
  const questions = new Set<SparkFiveQuestion>();
  const signals = detectMemberEmotionalSignals(text);
  const load = detectMentalLoadSignals(text);

  questions.add("remember_me");

  if (
    signals.length > 0 ||
    load.length > 0 ||
    season === "difficult" ||
    overwhelmed
  ) {
    questions.add("understand_feeling");
    questions.add("stay_with_me");
  }

  if (
    signals.includes("confusion") ||
    signals.includes("uncertainty") ||
    signals.includes("overwhelm") ||
    /\b(?:make sense|don'?t understand|confused|all over the place)\b/i.test(
      text,
    )
  ) {
    questions.add("make_sense");
  }

  if (
    signals.includes("shame") ||
    signals.includes("discouragement") ||
    /\b(?:forgotten|failure|not good enough|who am i)\b/i.test(text)
  ) {
    questions.add("remind_who_i_am");
  }

  if (season === "celebrating" || season === "building") {
    questions.add("remind_who_i_am");
  }

  if (season === "difficult" || season === "resting") {
    questions.add("stay_with_me");
  }

  return [...questions];
}

export function evaluateSparkEstateManifesto(input: {
  userText: string;
  overwhelmed?: boolean;
}): SparkEstateManifestoDecision {
  const text = input.userText.trim();
  const season = detectSeason(text, input.overwhelmed);
  const relevantQuestions = relevantQuestionsForTurn(
    text,
    season,
    input.overwhelmed,
  );

  return {
    relevantQuestions,
    season,
    reason: `season: ${season}; questions: ${relevantQuestions.join(", ")}`,
  };
}

import { ESTATE_PLACE_VOICE } from "./manifesto";

export function estatePlaceVoiceHint(placeId: string): string | null {
  const voice = ESTATE_PLACE_VOICE[placeId];
  if (!voice) return null;
  return `Place voice (${placeId}): "${voice}"`;
}
