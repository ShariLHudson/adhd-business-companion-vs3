/** Shared relief-first copy for Clear My Mind surfaces. */

import {
  THOUGHT_SEPARATE_INTRO,
  THOUGHT_SEPARATE_PREVIEW,
} from "@/lib/thinkingSpace/copy";

export const CLEAR_MY_MIND_HEADER = "Clear My Mind";

export const CLEAR_MY_MIND_WORKSPACE_SUBTITLE =
  "Empty everything competing for attention.";

/** Primary entry CTA — multi-thought unload, not Park It. */
export const CLEAR_MY_MIND_START_CTA = "Start Emptying My Mind";

/**
 * Entry greeting — Capture Mode only.
 * Capture first. Protect the user’s words. Organize only with permission.
 */
export const CLEAR_MY_MIND_WELCOME_LINES = [
  "Feeling overwhelmed? Put everything on your mind here. I'll help sort it into manageable next steps. Nothing has to be organized yet — I'll safely capture your words first.",
] as const;

/** Post-capture reassurance — flat list first, no automatic analysis. */
export const CLEAR_MY_MIND_CAPTURED_SAFE_TITLE =
  "Everything Is Safely Captured" as const;

export const CLEAR_MY_MIND_CAPTURED_SAFE_BODY =
  "I placed your thoughts into a clear list while preserving your words. Nothing has been categorized, prioritized, or turned into a project." as const;

export const CLEAR_MY_MIND_CAPTURED_SAFE_LOOK =
  "Take a quick look. You can adjust anything I separated incorrectly." as const;

export const CLEAR_MY_MIND_SAVE_FOR_LATER_CONFIRM =
  "They’re saved. You do not need to decide anything about them right now." as const;

export const CLEAR_MY_MIND_MAKE_SENSE_DEFAULT =
  "Organizing these by life area may be the easiest way to scan them. You can use that view now or choose a different way." as const;

/** Quiet support while the member is still unloading — never coaching. */
export const CLEAR_MY_MIND_CAPTURE_SUPPORT_LINES = [
  "Take your time.",
  "Anything else?",
  "I'm still listening.",
  "Keep going.",
  "No rush.",
] as const;

export const CLEAR_MY_MIND_ORGANIZE_LABEL = "Organize My Thoughts";

export const CLEAR_MY_MIND_DONE_LABEL = "Done";

export const CLEAR_MY_MIND_VISUAL_THINKING_LABEL = "Visualize";

export const CLEAR_MY_MIND_ADD_MORE_THOUGHTS_LABEL = "Add More Thoughts";

export const CLEAR_MY_MIND_SAVE_FOR_LATER_LABEL = "Continue Later";

export const CLEAR_MY_MIND_FILTER_LABEL = "Filter";

export const CLEAR_MY_MIND_PRIORITIZE_LABEL = "Prioritize";

export const CLEAR_MY_MIND_CONVERT_LABEL = "Create";

export const CLEAR_MY_MIND_SAVE_LABEL = "Save";

export const CLEAR_MY_MIND_EXIT_LABEL = "Exit";

export const CLEAR_MY_MIND_NEXT_PROMPT =
  "As I looked through what you shared, a few things stood out. What would you like to do next?";

/** Soft reflection lead after Continue — personal, not a report header. */
export const CLEAR_MY_MIND_REFLECTION_LEAD =
  "Everything is safely out of your head now." as const;

export const CLEAR_MY_MIND_NEXT_SECTION =
  "What Would Help Most Right Now?" as const;

export const CLEAR_MY_MIND_JOURNAL_LIST_LABEL =
  "Your thoughts" as const;

export const CLEAR_MY_MIND_SAVED_ACK =
  "Saved to My Thoughts. You can open My Thoughts anytime to find, filter, or print them.";

export const CLEAR_MY_MIND_CONTINUE_LATER_ACK =
  "I'll hold this session for you. Come back anytime to continue.";

export const CLEAR_MY_MIND_VISUAL_OFFER =
  "Would you like to see this visually?";

export const CLEAR_MY_MIND_EXIT_ANNOUNCE =
  "We've left Clear My Mind for now. Your thoughts are saved whenever you want to return.";

export const CLEAR_MY_MIND_INPUT_PLACEHOLDER =
  "Type, speak, or paste everything that’s on your mind. Nothing has to be organized yet — I’ll keep capturing as you go.";

/** Visible Thinking during sort — never loading language. */
export const CLEAR_MY_MIND_VISIBLE_THINKING_LINES = [
  "As I look through what you shared…",
  "Taking a quiet moment with these thoughts…",
  "Sitting with what you wrote…",
  "Letting the threads come into view…",
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

/** Max three gentle next steps — after capture, member-led. */
export const CLEAR_MY_MIND_SUGGESTIONS = [
  "Let's organize these.",
  "Would you like to see this visually?",
  "Let's figure out what actually matters today.",
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

/** After Share — encourages continuous capture (never coaching). */
export const CLEAR_MY_MIND_CONTINUE_PROMPT = "Anything else?";

export function clearMyMindCaptureSupportLine(submissionIndex: number): string {
  const lines = CLEAR_MY_MIND_CAPTURE_SUPPORT_LINES;
  const i = Math.max(0, submissionIndex - 1) % lines.length;
  return lines[i]!;
}

export function clearMyMindHeldCountLine(count: number): string {
  const n = Math.max(0, Math.floor(count));
  if (n === 0) return "";
  if (n === 1) {
    return "I've safely got 1 thought waiting whenever you're ready.";
  }
  return `I've safely got ${n} thoughts waiting whenever you're ready.`;
}

export const CLEAR_MY_MIND_ACK_CONTINUE_LABEL =
  "Look through these with me";

/** @deprecated Use CLEAR_MY_MIND_ADD_MORE_THOUGHTS_LABEL */
export const CLEAR_MY_MIND_ADD_MORE_LABEL = "Add More Thoughts";

export const CLEAR_MY_MIND_SPLIT_HEADLINE = THOUGHT_SEPARATE_INTRO;

export const CLEAR_MY_MIND_SPLIT_SUBLINE = THOUGHT_SEPARATE_PREVIEW;

export const CLEAR_MY_MIND_SPLIT_CONFIRM = "Yes, separate them";

export const CLEAR_MY_MIND_SPLIT_KEEP = "Keep as one thought";

/** Primary capture action — guided Continue, never "Save". */
export const CLEAR_MY_MIND_CAPTURE_BUTTON = "Continue";

export const CLEAR_MY_MIND_CAPTURE_BUTTON_MORE = "Continue";

/** Brief confirmation while thoughts are received. */
export const CLEAR_MY_MIND_CAPTURE_BUTTON_CONFIRM = "I've got it.";

/** Secondary capture action — review thoughts already captured this session. */
export const CLEAR_MY_MIND_REVIEW_THOUGHTS_LABEL = "Review Thoughts";

export function clearMyMindCapturedCountLine(count: number): string {
  const n = Math.max(0, Math.floor(count));
  if (n === 0) return "Nothing captured yet — keep going whenever you're ready.";
  if (n === 1) return "1 thought captured. Still raw — nothing organized yet.";
  return `${n} thoughts captured. Still raw — nothing organized yet.`;
}

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
