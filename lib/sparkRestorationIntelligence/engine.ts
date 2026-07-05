/**
 * Spark Restoration Intelligence™ — what would give this person more energy?
 */

import { buildStoryPick } from "@/lib/estateRestoration/storySnippets";
import { canOfferRestorationNow } from "@/lib/estateRestoration/store";
import { formatAdventureWheelLine, pickAdventureEntry } from "./adventureWheel";
import { classifySparkEnergy } from "./detection";
import {
  recommendationsForEnergy,
  SPARK_ENERGY_REGISTRY,
} from "./energyRegistry";
import type {
  EnergyRestorationOffer,
  RestorationRecommendation,
  SparkEnergyType,
  SparkRestorationEvaluation,
  SparkRestorationInput,
} from "./types";

const FORWARD_TASK_RE =
  /\b(?:sop|newsletter|email|project|plan|proposal|draft|document)\b/i;

function inferReturnContext(input: SparkRestorationInput): string | null {
  const t = input.userText.toLowerCase();
  if (/\bsop\b/.test(t)) return "your SOP";
  if (/\bnewsletter\b/.test(t)) return "the newsletter";
  if (/\bemail\b/.test(t)) return "the email";
  if (/\bproject\b/.test(t)) return "the project";
  if (input.workspace === "content-generator") return "what we were creating";
  if (input.workspace === "projects") return "your project";
  if (FORWARD_TASK_RE.test(t)) return "what we were working on";
  return null;
}

function pickRecommendations(
  energy: SparkEnergyType,
  input: SparkRestorationInput,
  count = 3,
): RestorationRecommendation[] {
  const pool = [...recommendationsForEnergy(energy)];

  if (energy === "play") {
    const adventure = pickAdventureEntry(
      (input.currentTurn ?? 0) + input.userText.length,
    );
    const spinIdx = pool.findIndex((r) => r.id === "spin-wheel");
    if (spinIdx >= 0) {
      pool[spinIdx] = {
        ...pool[spinIdx]!,
        reason: formatAdventureWheelLine(adventure),
      };
    }
  }

  return pool.slice(0, count);
}

function enrichWithGuideStory(
  recs: RestorationRecommendation[],
): Pick<
  SparkRestorationEvaluation,
  "guideStorySnippet" | "guideSpreadId" | "guideSpreadTitle"
> {
  const guideRec = recs.find((r) => r.kind === "guide_story" && r.spreadId);
  if (!guideRec?.spreadId) return {};
  const pick = buildStoryPick(guideRec.spreadId, "curiosity energy");
  if (!pick) return {};
  return {
    guideStorySnippet: pick.conversationalSnippet,
    guideSpreadId: pick.spreadId,
    guideSpreadTitle: pick.title,
  };
}

export function evaluateSparkRestoration(
  input: SparkRestorationInput,
): SparkRestorationEvaluation | null {
  const turn = input.currentTurn ?? 0;
  if (!canOfferRestorationNow(turn)) return null;

  const classification = classifySparkEnergy(input);
  if (!classification) return null;

  const recommendations = pickRecommendations(
    classification.energyType,
    input,
  );
  if (recommendations.length === 0) return null;

  const guide = enrichWithGuideStory(recommendations);

  const confidence: SparkRestorationEvaluation["confidence"] =
    classification.weight >= 24
      ? "high"
      : classification.weight >= 18
        ? "medium"
        : "low";

  return {
    shouldOffer: true,
    energyType: classification.energyType,
    confidence,
    trigger: classification.trigger,
    recommendations,
    primary: recommendations[0]!,
    returnContextLabel: inferReturnContext(input),
    ...guide,
  };
}

function energyIntro(energy: SparkEnergyType, trigger: SparkRestorationEvaluation["trigger"]): string {
  if (trigger === "extended_work") {
    return "You've been at this with real focus for a while.";
  }
  switch (energy) {
    case "mental":
      return "Your mind has been carrying a lot.";
    case "emotional":
      return "I can hear how heavy this feels.";
    case "creative":
      return "Sometimes the ideas need room to breathe.";
    case "sensory":
      return "Everything may feel a little loud right now.";
    case "play":
      return "Your brain might be hungry for something different.";
    case "curiosity":
      return "A change of scenery can help ideas settle.";
    case "social":
      return "You don't have to carry this alone.";
    default:
      return "You've been doing thoughtful work.";
  }
}

function invitationForPrimary(
  eval_: SparkRestorationEvaluation,
): string {
  const { primary, guideSpreadTitle } = eval_;

  if (primary.kind === "guide_story" && guideSpreadTitle) {
    return `Would you like to read a couple of pages about ${guideSpreadTitle}? Or I could tell you a bit of the story right here.`;
  }
  if (primary.kind === "adventure") {
    return `${primary.reason} Want to spin for today's adventure?`;
  }
  if (primary.kind === "conversation") {
    return "We could just talk for a few minutes — no agenda. Would that help?";
  }
  if (primary.kind === "game") {
    return `What if we tried ${primary.label} for two minutes — not to escape, just to reset?`;
  }

  return `What if we tried ${primary.label}? ${primary.reason}`;
}

export function buildEnergyRestorationOffer(
  eval_: SparkRestorationEvaluation,
): EnergyRestorationOffer {
  return {
    intro: energyIntro(eval_.energyType, eval_.trigger),
    invitation: invitationForPrimary(eval_),
    energyType: eval_.energyType,
    primary: eval_.primary,
    alternatives: eval_.recommendations.slice(1, 3),
    responseHint: restorationIntelligenceHint(eval_),
  };
}

export function formatEnergyRestorationReply(offer: EnergyRestorationOffer): string {
  return [offer.intro, "", offer.invitation].join("\n");
}

export function formatInlineEnergyStory(eval_: SparkRestorationEvaluation): string | null {
  if (!eval_.guideStorySnippet) return null;
  return [
    "Before we jump back in, I have a story I'd love to share with you.",
    "",
    eval_.guideStorySnippet,
    "",
    "Would you like to read more in the Estate Guide, or stay here with me?",
  ].join("\n");
}

export function restorationIntelligenceHint(
  eval_: SparkRestorationEvaluation,
): string {
  const alts = eval_.recommendations
    .slice(1, 3)
    .map((a) => `• ${a.label} — ${a.reason}`)
    .join("\n");
  return [
    "SPARK RESTORATION INTELLIGENCE (mandatory):",
    `Energy need: ${SPARK_ENERGY_REGISTRY[eval_.energyType].name} — NOT 'take a break'.`,
    `Internal question: What would give this person more energy right now?`,
    `Primary: ${eval_.primary.label} (${eval_.primary.kind}).`,
    alts ? `Alternatives if useful (max 2, optional):\n${alts}` : "",
    "Games = Intentional Cognitive Refreshers — never distractions or points.",
    "Momentum = forward motion — may mean play, wander, journal, or read.",
    "Offer ONE primary path — member chooses. Never guilt on decline.",
    "FORBIDDEN: 'take a break', 'you should rest', productivity lecture.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function isEnergyRestorationOfferMessage(text: string): boolean {
  return /\b(?:Today's Adventure|more energy|change of scenery|read a couple of pages|tell you a bit of the story|reset your brain|spin for today|Intentional Cognitive|before we jump back in)\b/i.test(
    text,
  );
}
