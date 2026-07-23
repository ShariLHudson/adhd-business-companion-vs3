import { getExperienceControlPrefs } from "@/lib/estate/experienceControlPrefs";
import { getSupportStylePreference } from "@/lib/supportStyle/prefs";
import { detectAdaptiveConversationalOverride } from "./conversationalOverride";
import { getAdaptiveCompanionExplicitPrefs } from "./explicitPrefs";
import { getAdaptiveSessionOverride } from "./sessionOverride";
import type {
  AdaptiveChoiceLoad,
  AdaptivePresentationContext,
  AdaptivePresentationResolved,
  ResolveAdaptivePresentationInput,
} from "./types";

function choiceLoadToMax(load: AdaptiveChoiceLoad): number {
  if (load === "one") return 1;
  if (load === "two") return 2;
  if (load === "three") return 3;
  return 3; // ask → still show a calm default set
}

function resolveChoiceLoad(): {
  load: AdaptiveChoiceLoad;
  sources: string[];
} {
  const sources: string[] = [];
  const explicit = getAdaptiveCompanionExplicitPrefs();
  if (explicit.choiceLoad) {
    sources.push("adaptive_explicit.choiceLoad");
    return { load: explicit.choiceLoad, sources };
  }
  const support = getSupportStylePreference();
  const fromSupport = support.customSettings?.choiceCount;
  if (
    fromSupport === "one" ||
    fromSupport === "two" ||
    fromSupport === "three" ||
    fromSupport === "ask"
  ) {
    sources.push("support_style.choiceCount");
    return { load: fromSupport, sources };
  }
  if (support.styleId === "step-by-step") {
    sources.push("support_style.step-by-step");
    return { load: "one", sources };
  }
  if (support.styleId === "give-me-choices") {
    sources.push("support_style.give-me-choices");
    return { load: "three", sources };
  }
  sources.push("default");
  return { load: "three", sources };
}

/**
 * Resolve how intelligence should be presented right now.
 * Does not change reasoning quality — only delivery shape.
 */
export function resolveAdaptivePresentation(
  input: ResolveAdaptivePresentationInput = {},
): AdaptivePresentationResolved {
  const sources: string[] = [];
  const explicit = getAdaptiveCompanionExplicitPrefs();
  const experience = getExperienceControlPrefs();
  const support = getSupportStylePreference();
  const session =
    input.sessionOverride !== undefined
      ? input.sessionOverride
      : getAdaptiveSessionOverride();
  const conversational = input.conversationalText
    ? detectAdaptiveConversationalOverride(input.conversationalText)
    : null;

  let summaryFirst = explicit.summaryFirst;
  sources.push("adaptive_explicit");
  let paragraphLength = explicit.paragraphLength;
  let instructionPacing = explicit.instructionPacing;
  let examplePreference = explicit.examplePreference;
  let resumeDepth = explicit.resumeSummaryPreference;
  let comparisonStyle = explicit.comparisonStyle;
  let structureLevel = explicit.structureLevel;
  let showProgress = explicit.showProgressPreference;
  const plainLanguage = explicit.plainLanguagePreference;

  if (support.styleId === "step-by-step") {
    instructionPacing = "one_at_a_time";
    sources.push("support_style.pacing");
  }
  if (support.customSettings?.stuckHelp?.includes("show-example")) {
    examplePreference = "prefer";
    sources.push("support_style.examples");
  }

  sources.push("experience_controls");
  const reduceMotion = experience.reduceMotion;
  const sensorySoftened =
    experience.backgroundMode === "soften" ||
    experience.backgroundMode === "focus";

  if (session) {
    sources.push("session_override");
    if (typeof session.summaryFirst === "boolean") {
      summaryFirst = session.summaryFirst;
    }
    if (session.paragraphLength) paragraphLength = session.paragraphLength;
    if (session.instructionPacing) instructionPacing = session.instructionPacing;
    if (session.examplePreference) examplePreference = session.examplePreference;
    if (session.resumeSummaryPreference) {
      resumeDepth = session.resumeSummaryPreference;
    }
    if (session.comparisonStyle) comparisonStyle = session.comparisonStyle;
    if (session.structureLevel) structureLevel = session.structureLevel;
    if (typeof session.showProgressPreference === "boolean") {
      showProgress = session.showProgressPreference;
    }
  }

  const choiceResolved = resolveChoiceLoad();
  let choiceLoad = choiceResolved.load;
  sources.push(...choiceResolved.sources);
  if (session?.choiceLoad) {
    choiceLoad = session.choiceLoad;
    sources.push("session_override.choiceLoad");
  }

  if (conversational) {
    sources.push("conversational_override");
    if (conversational.forceFullDetail) {
      summaryFirst = false;
      resumeDepth = "detailed";
      paragraphLength = "standard";
    }
    if (conversational.forceSummaryFirst) {
      summaryFirst = true;
      resumeDepth = "brief";
      paragraphLength = "short";
    }
    if (conversational.forceFewerChoices) choiceLoad = "one";
    if (conversational.forceOneStep) instructionPacing = "one_at_a_time";
    if (conversational.forceMoreExamples) examplePreference = "prefer";
  }

  const maxVisibleChoices = choiceLoadToMax(choiceLoad);

  return {
    summaryFirst,
    maxVisibleChoices,
    showMoreOptionsControl: maxVisibleChoices < 3 || choiceLoad === "ask",
    oneQuestionAtATime: instructionPacing === "one_at_a_time",
    shortParagraphs: paragraphLength === "short",
    preferExamples: examplePreference === "prefer",
    resumeDepth,
    reduceMotion,
    sensorySoftened,
    comparisonStyle,
    structureLevel,
    showProgress,
    fullDetailAvailable: true,
    plainLanguage,
    textSize: experience.textSize,
    audioReady: experience.shariVoiceEnabled,
    sources: Array.from(new Set(sources)),
  };
}

export function toAdaptivePresentationContext(
  resolved: AdaptivePresentationResolved,
): AdaptivePresentationContext {
  return {
    summaryFirst: resolved.summaryFirst,
    maxVisibleChoices: resolved.maxVisibleChoices,
    oneQuestionAtATime: resolved.oneQuestionAtATime,
    shortParagraphs: resolved.shortParagraphs,
    resumeDepth: resolved.resumeDepth,
    reduceMotion: resolved.reduceMotion,
  };
}

/** Cap a list for reduced-choice presentation; caller may still offer More Options. */
export function limitVisibleChoices<T>(
  items: T[],
  resolved: AdaptivePresentationResolved,
): { visible: T[]; hiddenCount: number } {
  const max = Math.max(1, Math.min(3, resolved.maxVisibleChoices));
  if (items.length <= max) {
    return { visible: items, hiddenCount: 0 };
  }
  return {
    visible: items.slice(0, max),
    hiddenCount: items.length - max,
  };
}
