import {
  composeBibleClarify,
  composeBibleEcho,
  composeBibleReconnectionQuestion,
  composeBibleSoftPresence,
} from "@/lib/shariVoiceBible";
import { filterQuestionThroughRestraint } from "@/lib/wisdomOfRestraint";
import { saveDayState, type DayState } from "@/lib/companionStore";
import type {
  ConversationalRealityResult,
  RealityEmotionalTone,
} from "./types";

const FLOODED_RE =
  /\b(?:overwhelm(?:ed|ing)?|flooded|too much|can'?t(?:\s+\w+){0,3}\s+today|panic|shut(?:ting)? down|everything (?:is|feels) (?:too much|a lot)|drowning)\b/i;
const GRIEF_RE =
  /\b(?:grief|grieving|passed away|died|funeral|lost (?:my|someone)|mourning)\b/i;
const CELEBRATION_RE =
  /\b(?:excited|great news|won|signed|launched|celebrat|birthday|congrat)\b/i;
const SPARK_RE =
  /\b(?:big idea|creative|energy|motivated|ready to go|let'?s go|spark|inspired)\b/i;
const LOW_RE =
  /\b(?:tired|exhausted|low (?:energy|steam)|running on fumes|slept (?:bad|poor)|no sleep|drained|wiped|burned out|behind|late)\b/i;
const HEAVY_RE =
  /\b(?:heavy|hard day|rough|struggling|bad day|difficult|ashamed|guilty|stressed|anxious|depressed)\b/i;
const VAGUE_RE = /^(?:fine|ok(?:ay)?|meh|idk|ugh|busy|bad|good)\.?$/i;

function toneFromText(text: string): RealityEmotionalTone {
  if (GRIEF_RE.test(text)) return "grief";
  if (FLOODED_RE.test(text)) return "flooded";
  if (CELEBRATION_RE.test(text)) return "celebration";
  if (SPARK_RE.test(text)) return "spark";
  if (LOW_RE.test(text)) return "low";
  if (HEAVY_RE.test(text)) return "heavy";
  return "okay";
}

function energyLevelFromTone(tone: RealityEmotionalTone): DayState["energyLevel"] {
  switch (tone) {
    case "flooded":
    case "grief":
    case "heavy":
      return "need-recharge";
    case "low":
      return "running-on-fumes";
    case "spark":
    case "celebration":
      return "full-tank";
    default:
      return "doing-okay";
  }
}

function motivationFromTone(tone: RealityEmotionalTone): DayState["motivationLevel"] {
  switch (tone) {
    case "flooded":
    case "grief":
      return "not-happening";
    case "low":
    case "heavy":
      return "dragging";
    case "spark":
    case "celebration":
      return "lets-do-this";
    default:
      return "get-it-done";
  }
}

function vibeFromTone(tone: RealityEmotionalTone): DayState["vibe"] {
  switch (tone) {
    case "flooded":
      return "rough-day";
    case "grief":
    case "heavy":
      return "struggling";
    case "low":
      return "mixed-bag";
    case "spark":
    case "celebration":
      return "feeling-good";
    default:
      return "doing-okay";
  }
}

export function openingRealityQuestion(input: {
  returnAfterLongAbsence?: boolean;
  lowEnergyHint?: boolean;
  isFirstVisit?: boolean;
}): string | null {
  return composeBibleReconnectionQuestion({
    homeState: input.isFirstVisit ? "FIRST_VISIT" : "QUIET_PRESENCE",
    timeOfDay: "morning",
    sessionVisitIndex: 1,
    returnIntervalHours: input.returnAfterLongAbsence ? 24 * 42 : 20,
    returnIntervalDays: input.returnAfterLongAbsence ? 42 : 1,
    isFirstMeeting: Boolean(input.isFirstVisit),
    lowEnergy: input.lowEnergyHint,
  });
}

export function processRealityMessage(
  message: string,
  turn: "open" | "clarify",
): ConversationalRealityResult {
  const rawNote = message.trim();
  const tone = toneFromText(rawNote);
  const needsClarify =
    turn === "open" && rawNote.length > 0 && VAGUE_RE.test(rawNote);

  if (needsClarify) {
    return {
      echo: "",
      tone,
      dayState: saveDayState({
        energyLevel: energyLevelFromTone(tone),
        motivationLevel: motivationFromTone(tone),
        vibe: vibeFromTone(tone),
        needs: [],
        note: rawNote,
      }),
      needsClarify: true,
      clarifyQuestion: filterQuestionThroughRestraint(
        composeBibleClarify(
          {
            homeState: "QUIET_PRESENCE",
            timeOfDay: "morning",
            sessionVisitIndex: 1,
            returnIntervalHours: null,
            returnIntervalDays: null,
            isFirstMeeting: false,
          },
          rawNote,
        ),
        { tone, isFirstMeeting: false },
      ).content,
      rawNote,
    };
  }

  const dayState = saveDayState({
    energyLevel: energyLevelFromTone(tone),
    motivationLevel: motivationFromTone(tone),
    vibe: vibeFromTone(tone),
    needs: [],
    note: rawNote || undefined,
  });

  return {
    echo: composeBibleEcho({
      voiceContext: {
        homeState: "QUIET_PRESENCE",
        timeOfDay: "afternoon",
        sessionVisitIndex: 12,
        returnIntervalHours: 16,
        returnIntervalDays: 0.5,
        isFirstMeeting: false,
      },
      tone,
      rawNote,
    }),
    tone,
    dayState,
    needsClarify: false,
    clarifyQuestion: null,
    rawNote,
  };
}

export function softCompleteReality(): ConversationalRealityResult {
  const dayState = saveDayState({
    energyLevel: "doing-okay",
    motivationLevel: "get-it-done",
    vibe: "doing-okay",
    needs: [],
    note: "gentle default",
  });
  return {
    echo: composeBibleSoftPresence({
      homeState: "QUIET_PRESENCE",
      timeOfDay: "evening",
      sessionVisitIndex: 1,
      returnIntervalHours: null,
      returnIntervalDays: null,
      isFirstMeeting: false,
    }),
    tone: "okay",
    dayState,
    needsClarify: false,
    clarifyQuestion: null,
    rawNote: "",
  };
}

export function sameAsYesterdayEcho(note?: string): ConversationalRealityResult {
  const dayState = saveDayState({
    energyLevel: "doing-okay",
    motivationLevel: "get-it-done",
    vibe: "doing-okay",
    needs: [],
    note: note ?? "about the same",
  });
  return {
    echo: composeBibleEcho({
      voiceContext: {
        homeState: "QUIET_PRESENCE",
        timeOfDay: "morning",
        sessionVisitIndex: 1,
        returnIntervalHours: null,
        returnIntervalDays: null,
        isFirstMeeting: false,
      },
      tone: "okay",
      continuity: true,
    }),
    tone: "okay",
    dayState,
    needsClarify: false,
    clarifyQuestion: null,
    rawNote: note ?? "",
  };
}
