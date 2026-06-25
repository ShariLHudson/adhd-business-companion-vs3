/** Shared relief-first copy for Clear My Mind™ surfaces. */

import {
  THOUGHT_SEPARATE_INTRO,
  THOUGHT_SEPARATE_PREVIEW,
} from "@/lib/thinkingSpace/copy";

export const CLEAR_MY_MIND_HEADER =
  "A calm place to unload when your mind feels too heavy.";

export const CLEAR_MY_MIND_PERMISSION =
  "You don't have to carry all of this by yourself anymore. When you're ready, share it with me.";

export const CLEAR_MY_MIND_CAPTURE_GUIDANCE =
  "Type or speak as much as you want. Separate thoughts with commas or new lines.";

export const CLEAR_MY_MIND_CAPTURE_EXAMPLE =
  "Call doctor, finish newsletter, text Izna…";

export const CLEAR_MY_MIND_RELEASE_DONE_LABEL =
  "That's everything for now";

/** @deprecated Capture never ends — kept for legacy references only. */
export const CLEAR_MY_MIND_RELEASE_DONE_HINT =
  "When you're ready, I'll receive what you shared.";

/** After Share — encourages continuous capture. */
export const CLEAR_MY_MIND_CONTINUE_PROMPT =
  "What else is taking up space?";

export function clearMyMindHeldCountLine(count: number): string {
  const n = Math.max(0, Math.floor(count));
  if (n === 0) return "";
  if (n === 1) {
    return "I've safely got 1 thought waiting whenever you're ready.";
  }
  return `I've safely got ${n} thoughts waiting whenever you're ready.`;
}

export const CLEAR_MY_MIND_ACK_CONTINUE_LABEL =
  "See what I'm noticing";

/** @deprecated Capture never ends — organization lives in My Thoughts™. */
export const CLEAR_MY_MIND_ADD_MORE_LABEL = "Add more thoughts";

export const CLEAR_MY_MIND_SPLIT_HEADLINE = THOUGHT_SEPARATE_INTRO;

export const CLEAR_MY_MIND_SPLIT_SUBLINE = THOUGHT_SEPARATE_PREVIEW;

export const CLEAR_MY_MIND_SPLIT_CONFIRM = "Yes, separate them";

export const CLEAR_MY_MIND_SPLIT_KEEP = "Keep as one thought";

/** Primary capture action — clear for first-time users. */
export const CLEAR_MY_MIND_CAPTURE_BUTTON = "Share";

export const CLEAR_MY_MIND_CAPTURE_BUTTON_MORE = "Share more";

/** Brief button confirmation after Share — emotional, not functional. */
export const CLEAR_MY_MIND_CAPTURE_BUTTON_CONFIRM = "I've got it.";

/** How long the Share button shows confirmation before returning to idle. */
export const CLEAR_MY_MIND_SHARE_CONFIRM_MS = 1400;

/** Delay before Shari's acknowledgment appears after Share. */
export const CLEAR_MY_MIND_SHARE_ACK_DELAY_MS = 450;

export const CLEAR_MY_MIND_GENTLE_NEXT_PROMPT =
  "Want to turn one of these into today's focus, or just let this sit here for now?";

export const CLEAR_MY_MIND_GENTLE_FOCUS = "Make one today's focus";

export const CLEAR_MY_MIND_GENTLE_REST = "Let it sit here for now";

export const CLEAR_MY_MIND_SECTION_HOLDING = "Thoughts I'm keeping safe";

export const CLEAR_MY_MIND_SECTION_CONNECTIONS = "Connections I'm noticing";

export const CLEAR_MY_MIND_SECTION_PATTERNS = "Patterns emerging";

export const CLEAR_MY_MIND_AGENCY_PROMPT =
  "Would it help to explore one of these together, or would you rather leave these here for now?";

export const CLEAR_MY_MIND_AGENCY_EXPLORE = "Explore together";

export const CLEAR_MY_MIND_AGENCY_REST = "Leave them here for now";

/** @deprecated Use CLEAR_MY_MIND_RELEASE_DONE_LABEL */
export const CLEAR_MY_MIND_SEE_HELD_LABEL = CLEAR_MY_MIND_RELEASE_DONE_LABEL;

/** @deprecated Use CLEAR_MY_MIND_RELEASE_DONE_HINT */
export const CLEAR_MY_MIND_HELD_HINT = CLEAR_MY_MIND_RELEASE_DONE_HINT;

export const OVERFLOW_CLUSTER_FALLBACK =
  "Other thoughts are safely held here.";
