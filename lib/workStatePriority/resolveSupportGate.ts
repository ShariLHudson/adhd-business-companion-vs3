/**
 * Support Gate Decision — Phase 2 of the Work State Priority Model
 * (docs/estate/WORK_STATE_PRIORITY_MODEL.md).
 *
 * The single missing checkpoint identified by that design: emotional
 * state is already computed on every Create Fast Path turn
 * (`detectEmotionalState`), but nothing ever asks it "should this turn
 * proceed toward building at all?" This function is that question,
 * answered as a pure, side-effect-free classification — it does not
 * replace `isSimpleCreateRequest` (which stays a pure lexical "could this
 * be a creation request" check) or `detectEmotionalState` (reused as-is,
 * per the design's own "no new classifier" principle). It only decides
 * whether an already-detected creation match is allowed to be ACTED ON
 * this turn.
 *
 * Per the approved implementation order: "Only change ownership" — this
 * module owns the PAUSE/SOFTEN/PROCEED decision; it does not rewrite
 * Create Fast Path, Universal Creation, or the emotional classifier.
 */

import { detectEmotionalState, isGenuineConfusionSignal, type EmotionalState } from "../companionEmotions";

export type SupportGateTier = "pause" | "soften" | "proceed";

/**
 * PAUSE: the founder's capacity right now is the actual subject of the
 * message — a named work object, if any, is incidental context, not an
 * active request. Blocks Create Fast Path entirely this turn.
 *
 * SOFTEN: the founder is still oriented toward the object (`stuck`) or
 * has said, in their own words, that they're genuinely confused — support
 * acknowledgment is woven into the same turn as a build step, not a
 * separate detour.
 *
 * PROCEED: no distress signal, or `unclear` that traces to a vocabulary
 * gap rather than genuine confusion (see `isGenuineConfusionSignal`) —
 * build continues normally.
 */
export function resolveSupportGate(
  userText: string,
  emotionalState: EmotionalState = detectEmotionalState(userText),
): SupportGateTier {
  if (emotionalState === "overwhelmed" || emotionalState === "emotional") {
    return "pause";
  }
  if (emotionalState === "stuck") {
    return "soften";
  }
  if (emotionalState === "unclear") {
    // The critical distinction Phase 1 exists to make available: raw
    // "unclear" conflates genuine confusion with a classifier vocabulary
    // gap. Only genuine, explicit confusion language earns SOFTEN — an
    // unrecognized build request must default to PROCEED, never be
    // silently treated as distress it never expressed.
    return isGenuineConfusionSignal(userText) ? "soften" : "proceed";
  }
  // "building" | "focused"
  return "proceed";
}

/**
 * SOFTEN behavior (§3.4 of the design): blend a brief, warm acknowledgment
 * into the SAME reply Create Fast Path already produced, rather than
 * replacing it or changing what question is asked. Deliberately reuses
 * existing, already-reviewed copy (`PRESENCE_LINES.stuck` /
 * `PRESENCE_LINES.emotional`-adjacent tone) rather than inventing new
 * language — "modifies the response," not "writes a new one."
 */
const SOFTEN_ACKNOWLEDGMENTS: Record<"stuck" | "confusion", string> = {
  stuck: "We can sort this together.",
  confusion: "That's okay — let's figure it out together.",
};

export function softenResponse(reply: string, userText: string): string {
  const trimmedReply = reply.trim();
  if (!trimmedReply) return reply;
  const acknowledgment = isGenuineConfusionSignal(userText)
    ? SOFTEN_ACKNOWLEDGMENTS.confusion
    : SOFTEN_ACKNOWLEDGMENTS.stuck;
  // Never double up if the reply already opens with the same acknowledgment
  // (e.g. a continuation turn within the same soften-tier exchange).
  if (trimmedReply.startsWith(acknowledgment)) return trimmedReply;
  return `${acknowledgment} ${trimmedReply}`;
}
