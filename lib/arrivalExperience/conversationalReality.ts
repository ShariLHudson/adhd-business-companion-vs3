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

function buildEcho(text: string, tone: RealityEmotionalTone): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return "I'll keep today gentle until you tell me otherwise.";
  }
  switch (tone) {
    case "flooded":
      return "So — flooded. We simplify everything until breathing is easier.";
    case "grief":
      return "So — a heavy day. Nothing needs fixing right now.";
    case "heavy":
      return "So — it's a hard one. We go gently and protect what we can.";
    case "low":
      return "So — short tank today. We keep it honest and small.";
    case "spark":
      return "So — you've got spark. Let's not waste it on busywork.";
    case "celebration":
      return "So — good news is in the room. We'll honor that first.";
    default:
      if (/\bbehind\b/i.test(trimmed)) {
        return "So — you're behind, not broken. One honest piece at a time.";
      }
      if (/\bbusy\b/i.test(trimmed)) {
        return "So — full day ahead. We'll shape it to what's actually true.";
      }
      return "So — I've got the shape of today. We'll keep it manageable.";
  }
}

function clarifyForVague(text: string): string {
  if (/^busy/i.test(text)) {
    return "Good busy, or the kind that eats you?";
  }
  if (/^bad/i.test(text)) {
    return "More tired, or more heavy?";
  }
  return "More steady, or more stretched?";
}

export function openingRealityQuestion(input: {
  returnAfterLongAbsence?: boolean;
  lowEnergyHint?: boolean;
}): string {
  if (input.returnAfterLongAbsence) return "What's today actually like?";
  if (input.lowEnergyHint) return "How much do you actually have in the tank?";
  return "How's today?";
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
      clarifyQuestion: clarifyForVague(rawNote),
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
    echo: buildEcho(rawNote, tone),
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
    echo: "I'll keep today gentle until you tell me otherwise.",
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
    note: note ?? "same as yesterday",
  });
  return {
    echo: "Same as yesterday — I've got it.",
    tone: "okay",
    dayState,
    needsClarify: false,
    clarifyQuestion: null,
    rawNote: note ?? "",
  };
}
