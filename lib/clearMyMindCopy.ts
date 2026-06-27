/** Shared relief-first copy for Clear My Mind surfaces. */

import {
  THOUGHT_SEPARATE_INTRO,
  THOUGHT_SEPARATE_PREVIEW,
} from "@/lib/thinkingSpace/copy";

export const CLEAR_MY_MIND_HEADER = "Clear My Mind";

export const CLEAR_MY_MIND_WORKSPACE_SUBTITLE =
  "Let's get it out of your head together.";

/** Reassurance welcome — inside the frosted workspace only. */
export const CLEAR_MY_MIND_WELCOME_LINES = [
  "Nothing has to be organized. Write one thought or one hundred. Messy is perfectly okay. I'll help you sort it afterward.",
] as const;

/** Quiet support while the user is still unloading. */
export const CLEAR_MY_MIND_CAPTURE_SUPPORT_LINES = [
  "Take your time.",
  "There's no rush.",
  "You don't have to make it make sense.",
  "I'm following along.",
] as const;

export const CLEAR_MY_MIND_INPUT_PLACEHOLDER =
  "What's taking up space in your head today?";

/** Visible Thinking during sort — never loading language. */
export const CLEAR_MY_MIND_VISIBLE_THINKING_LINES = [
  "I'm looking for themes.",
  "Some of these thoughts seem connected.",
  "I'm noticing a few things that may be causing the most pressure.",
  "I'm sorting these into manageable pieces.",
] as const;

/** After submission — acknowledgment before organizing. */
export const CLEAR_MY_MIND_POST_SHARE_ACK_LINES = [
  "That's a lot to carry.",
  "I'm glad you didn't have to hold onto it by yourself.",
] as const;

/** Memory — only after permission. */
export const CLEAR_MY_MIND_MEMORY_ASK =
  "Some of these ideas may be helpful later. Would you like me to remember any of them?";

export const CLEAR_MY_MIND_MEMORY_YES = "Yes, remember what helps";

export const CLEAR_MY_MIND_MEMORY_NO = "Not right now";

/** Max three gentle next steps. */
export const CLEAR_MY_MIND_SUGGESTIONS = [
  "Let's organize these.",
  "Let's figure out what actually matters today.",
  "Would it help to move some of these into your parking lot?",
  "Which one feels heaviest right now?",
] as const;

/** @deprecated Use CLEAR_MY_MIND_WELCOME_LINES */
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

/** @deprecated Capture never ends — organization lives in My Thoughts. */
export const CLEAR_MY_MIND_ADD_MORE_LABEL = "Add more thoughts";

export const CLEAR_MY_MIND_SPLIT_HEADLINE = THOUGHT_SEPARATE_INTRO;

export const CLEAR_MY_MIND_SPLIT_SUBLINE = THOUGHT_SEPARATE_PREVIEW;

export const CLEAR_MY_MIND_SPLIT_CONFIRM = "Yes, separate them";

export const CLEAR_MY_MIND_SPLIT_KEEP = "Keep as one thought";

/** Primary capture action — clear for first-time users. */
export const CLEAR_MY_MIND_CAPTURE_BUTTON = "Save";

export const CLEAR_MY_MIND_CAPTURE_BUTTON_MORE = "Save more";

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
