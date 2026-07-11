import { CLEAR_MY_MIND_CONSERVATORY_BG } from "@/lib/clearMyMind/conservatory";

export const CONSERVATORY_BG = CLEAR_MY_MIND_CONSERVATORY_BG;

export const PREPARED_LINE =
  "Your workshop marketing plan is ready — I've shaped the opening so you can begin with the promise.";

export const WORK_TITLE = "Workshop Marketing Plan";

export const WORK_SECTIONS = [
  {
    id: "for",
    label: "For",
    text: "ADHD entrepreneurs carrying too many ideas and not enough clarity about what matters this week.",
  },
  {
    id: "promise",
    label: "Promise",
    text: "Leave with one calm, specific next move — and the confidence to act on it.",
  },
] as const;

export const SPARK_PROMPT =
  "What would make the right person feel relief in the first sentence?";

export const COMPANION_WHISPER =
  "One thought — name the transformation before the logistics. That is where trust begins.";

export const STILLNESS_LINE =
  "Beautiful. The room is still here whenever you return.";

export const RESOURCES = {
  businessBrain: ["Visual Spark Studios", "ADHD Business Ecosystem"],
  brandVoice: "Warm, clear, encouraging",
  clientAvatar: "Overwhelmed ADHD entrepreneur seeking momentum",
  assets: ["Workshop Launch", "Founder Invitation"],
  sparkCard: "A clear promise makes every message easier to write.",
} as const;
