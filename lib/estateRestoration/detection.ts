/**
 * Detect when intentional restoration through the Estate Guide would help.
 */

import type { RestorationInput, RestorationTrigger } from "./types";

const FRUSTRATION_RE =
  /\b(?:frustrat(?:ed|ing)?|annoyed|this (?:isn't|is not) working|nothing(?:'s| is) working|keeps? failing|so irritated|fed up)\b/i;

const STUCK_RE =
  /\b(?:feel(?:ing)? stuck|i'?m stuck|got stuck|can't figure (?:this|it) out|not making progress|going in circles|spinning my wheels|hit a wall)\b/i;

const REVISION_LOOP_RE =
  /\b(?:keep revising|revised (?:this )?again|same paragraph|third draft|fourth draft|still not right|tweaking forever|endless revisions?)\b/i;

const DECISION_FATIGUE_RE =
  /\b(?:decision fatigue|too many decisions|can't decide|decision(?:s)? exhaust|brain is tired of choosing|choice overload)\b/i;

const FATIGUE_RE =
  /\b(?:mentally (?:tired|exhausted|drained)|brain (?:is )?(?:fried|tired|done)|cognitive overload|too much in my head|can't think straight|foggy|worn out|burned out|burnt out)\b/i;

const EXTENDED_WORK_RE =
  /\b(?:been (?:at this|working) (?:for )?(?:hours|all (?:morning|day|afternoon))|working (?:hard|intensely) (?:for )?(?:a )?while|at this for (?:hours|too long))\b/i;

const NATURAL_PAUSE_RE =
  /\b(?:that(?:'s| is) a good (?:stopping|breaking) point|natural pause|before (?:we|i) continue|step back for a minute|need a moment)\b/i;

const FORWARD_INTENT_RE =
  /\b(?:help me (?:create|write|build|plan|decide)|create (?:a|an)|write (?:a|an)|plan my|let'?s (?:finish|complete|ship)|need to (?:finish|send|publish))\b/i;

export type TriggerMatch = {
  trigger: RestorationTrigger;
  weight: number;
};

export function detectRestorationTriggers(
  input: RestorationInput,
): TriggerMatch[] {
  const t = input.userText.trim();
  const matches: TriggerMatch[] = [];

  if (input.overwhelmed) {
    matches.push({ trigger: "cognitive_overload", weight: 28 });
  }
  if (FATIGUE_RE.test(t)) {
    matches.push({ trigger: "mental_fatigue", weight: 26 });
  }
  if (FRUSTRATION_RE.test(t)) {
    matches.push({ trigger: "frustration", weight: 24 });
  }
  if (STUCK_RE.test(t)) {
    matches.push({ trigger: "stuck", weight: 22 });
  }
  if (REVISION_LOOP_RE.test(t)) {
    matches.push({ trigger: "revision_loop", weight: 20 });
  }
  if (DECISION_FATIGUE_RE.test(t)) {
    matches.push({ trigger: "decision_fatigue", weight: 22 });
  }
  if (EXTENDED_WORK_RE.test(t)) {
    matches.push({ trigger: "extended_work", weight: 18 });
  }
  if (NATURAL_PAUSE_RE.test(t)) {
    matches.push({ trigger: "natural_pause", weight: 16 });
  }
  if (input.emotionalState === "overwhelmed" || input.emotionalState === "stuck") {
    matches.push({ trigger: "cognitive_overload", weight: 20 });
  }

  return matches.sort((a, b) => b.weight - a.weight);
}

export function shouldBlockRestorationOffer(userText: string): boolean {
  const t = userText.trim();
  if (!t) return true;
  if (FORWARD_INTENT_RE.test(t)) return true;
  return false;
}

export function bestRestorationTrigger(
  input: RestorationInput,
): RestorationTrigger | null {
  if (shouldBlockRestorationOffer(input.userText)) return null;
  const matches = detectRestorationTriggers(input);
  return matches[0]?.trigger ?? null;
}
