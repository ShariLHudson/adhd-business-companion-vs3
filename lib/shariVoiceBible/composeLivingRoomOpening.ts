import type { GreetingIntelligenceInput } from "@/lib/greetingIntelligence/types";
import type { RealityEmotionalTone } from "@/lib/arrivalExperience/types";
import { composeLifeMoment } from "@/lib/sharisLifeMoments";
import { recordOpeningComposite } from "./cooldownStore";
import { interpolateVoiceTemplate, shortTopicLabel } from "./interpolate";
import { resolveVoiceContext } from "./resolveVoiceContext";
import {
  selectClarifyQuestion,
  selectEchoLine,
  selectVoiceLine,
} from "./selectVoiceLine";
import type { ShariLivingRoomOpening, ShariVoiceCategory, ShariVoiceContext } from "./types";

function emotionalTagFromTone(tone: RealityEmotionalTone): ShariVoiceContext["emotionalTag"] {
  switch (tone) {
    case "flooded":
      return "overwhelmed";
    case "grief":
      return "grief";
    case "heavy":
      return "discouraged";
    case "low":
      return "exhausted";
    case "spark":
    case "celebration":
      return "excited";
    default:
      return "neutral";
  }
}

function shouldAskQuestion(
  ctx: ShariVoiceContext,
  greetingStandsAlone?: boolean,
  presencePreferSilence?: boolean,
  companionRelationship?: import("@/lib/companionRelationship").CompanionRelationshipVerdict,
): boolean {
  if (presencePreferSilence) return false;
  const rhythm = companionRelationship?.rhythm;
  if (companionRelationship?.visitIntent === "work_now") return false;
  if (rhythm && !rhythm.askReconnectionQuestion) {
    if (rhythm.greetingLength === "brief") return false;
    if (stableMod(ctx.sessionVisitIndex, 3) !== 0) return false;
  }
  if (rhythm?.preferLivingRoomLinger) return true;
  if (greetingStandsAlone) {
    if (ctx.relationshipStage === "kin" || ctx.relationshipStage === "deep") {
      return stableMod(ctx.sessionVisitIndex, 3) !== 0;
    }
    if (ctx.relationshipStage === "trusted") {
      return stableMod(ctx.sessionVisitIndex, 2) !== 0;
    }
  }
  if (ctx.relationshipStage === "kin" && stableMod(ctx.sessionVisitIndex, 4) === 0) {
    return false;
  }
  return true;
}

function stableMod(n: number, mod: number): number {
  return Math.abs(n) % mod;
}

function resolveGreetingCategory(ctx: ShariVoiceContext): ShariVoiceContext["visitCategory"] {
  if (ctx.birthdayToday) return "birthday";
  if (ctx.visitCategory) return ctx.visitCategory;
  if (ctx.isWeekend) return "weekend";
  if (ctx.isMonday && ctx.timeOfDay === "morning") return "monday_morning";
  if (ctx.isFriday && ctx.timeOfDay === "evening") return "friday_evening";
  if (ctx.weather === "rain") return "rainy_day";
  if (ctx.weather === "snow") return "snowy_iowa_day";
  if (ctx.season === "summer" && ctx.weather === "clear") return "sunny_summer_day";
  if (ctx.holidaySeason) return "holiday_season";
  if (ctx.projectRecentlyCompleted) return "business_win";
  if (ctx.vacationDaysAway != null && ctx.vacationDaysAway <= 3) {
    return "vacation_return";
  }
  if (ctx.lowEnergy) return "exhausted";
  if (ctx.recoveryGentle) return "after_grief";
  if (ctx.timeOfDay === "midday") return "midday";
  return ctx.timeOfDay;
}

/**
 * Living Room opening from the Voice Bible™.
 * Greeting + optional question. Silence is valid hospitality.
 */
export function composeLivingRoomOpening(
  input: GreetingIntelligenceInput,
): ShariLivingRoomOpening {
  const ctx = resolveVoiceContext(input);
  const category = resolveGreetingCategory(ctx);

  const greetingPick = selectVoiceLine("greeting", ctx, {
    category,
    salt: `greeting-${category}`,
  });

  const greetingLine = greetingPick?.line;
  const greeting =
    greetingPick?.text ??
    (ctx.relationshipStage === "kin" ? "Hi." : "Come in.");

  let question: string | null = null;
  let questionLineId: string | null = null;

  if (
    shouldAskQuestion(
      ctx,
      greetingLine?.standsAlone,
      input.presencePreferSilence,
      input.companionRelationship,
    )
  ) {
    if (ctx.previousTopic?.trim()) {
      const wonderPick = selectVoiceLine("question", ctx, {
        tag: "presence_wonder",
        salt: "presence-wonder",
      });
      if (wonderPick) {
        question = wonderPick.text;
        questionLineId = wonderPick.line.id;
      } else {
        const topic = shortTopicLabel(ctx.previousTopic);
        const topicPick = selectVoiceLine("question", ctx, {
          tag: "topic_followup",
          salt: `topic-${topic.slice(0, 12)}`,
        });
        if (topicPick) {
          question = interpolateVoiceTemplate(topicPick.text, { topic });
          questionLineId = topicPick.line.id;
        }
      }
    } else {
      const questionPick =
        selectVoiceLine("question", ctx, {
          category: category,
          salt: `question-${category}`,
        }) ??
        selectVoiceLine("question", ctx, {
          category: "variable_question",
          salt: "question-fallback",
        });

      if (questionPick) {
        question = questionPick.text;
        questionLineId = questionPick.line.id;
      }
    }
  }

  if (greetingLine) {
    recordOpeningComposite(
      greetingLine.id,
      questionLineId,
      ctx.sessionVisitIndex,
    );
  }

  const placeholderPick =
    selectVoiceLine("placeholder", ctx, {
      salt: "placeholder",
    }) ??
    (ctx.recoveryGentle || ctx.lowEnergy
      ? selectVoiceLine("placeholder", ctx, { salt: "placeholder-gentle" })
      : null);

  const placeholder = placeholderPick?.text ?? "I'm listening…";

  return {
    greeting,
    question,
    greetingLineId: greetingLine?.id ?? "fallback-greeting",
    questionLineId,
    chatPlaceholder: placeholder,
  };
}

export function composeBibleReconnectionQuestion(
  input: GreetingIntelligenceInput,
): string | null {
  return composeLivingRoomOpening(input).question;
}

export function composeBibleGreeting(input: GreetingIntelligenceInput): string {
  return composeLivingRoomOpening(input).greeting;
}

function echoCategoryFromTone(tone: RealityEmotionalTone): ShariVoiceCategory {
  switch (tone) {
    case "flooded":
      return "overwhelmed";
    case "grief":
      return "after_grief";
    case "heavy":
      return "discouraged";
    case "low":
      return "exhausted";
    case "spark":
    case "celebration":
      return "celebrating";
    default:
      return "echo";
  }
}

export function composeBibleEcho(input: {
  voiceContext: GreetingIntelligenceInput;
  tone: RealityEmotionalTone;
  rawNote?: string;
  continuity?: boolean;
}): string {
  const lifeMoment = composeLifeMoment({
    voiceContext: input.voiceContext,
    tone: input.tone,
    rawNote: input.rawNote,
    continuity: input.continuity,
  });
  if (lifeMoment) return lifeMoment;

  const ctx = resolveVoiceContext(input.voiceContext);
  if (input.continuity) {
    const line = selectVoiceLine("echo", ctx, {
      category: "continuity",
      salt: "continuity",
    });
    return line?.text ?? "Still carrying a similar feeling?";
  }

  const tag = emotionalTagFromTone(input.tone);
  const echoCategory = echoCategoryFromTone(input.tone);
  const line =
    selectEchoLine({ ...ctx, emotionalTag: tag }, tag, echoCategory) ??
    selectVoiceLine("echo", { ...ctx, emotionalTag: tag }, {
      category: echoCategory,
      salt: `echo-${tag}`,
    });

  return line?.text ?? "Thank you for telling me.";
}

export function composeBibleClarify(
  input: GreetingIntelligenceInput,
  _rawText: string,
): string {
  const ctx = resolveVoiceContext(input);
  return (
    selectClarifyQuestion(ctx)?.text ?? "More steady, or more stretched?"
  );
}

export function composeBibleSoftPresence(
  input: GreetingIntelligenceInput,
): string {
  const ctx = resolveVoiceContext(input);
  return (
    selectVoiceLine("observation", ctx, { category: "quiet", salt: "soft" })
      ?.text ?? "We can just be here."
  );
}

export function composeBibleChatPlaceholder(
  input: GreetingIntelligenceInput,
): string {
  const ctx = resolveVoiceContext(input);
  return (
    selectVoiceLine("placeholder", ctx, { salt: "chat-ph" })?.text ??
    "I'm listening…"
  );
}
