import type {
  HomesteadConversationRhythm,
  HomesteadTimePeriod,
} from "./types";

const HINTS: Record<HomesteadTimePeriod, string[]> = {
  dawn: ["Good morning.", "The house is just waking up.", "It's peaceful out."],
  morning: [
    "Good morning.",
    "Coffee's ready.",
    "It's a beautiful morning.",
  ],
  midday: ["Plenty of daylight left.", "The house feels awake."],
  afternoon: ["Good time to settle into something.", "The light is softer now."],
  "golden-hour": ["I love this light.", "Everything feels warm right now."],
  evening: ["I'm glad you stopped by.", "The lamps are on if you want cozy."],
  night: ["It feels good to slow down.", "The house is quiet tonight."],
};

export function resolveConversationRhythm(
  period: HomesteadTimePeriod,
  now = new Date(),
): HomesteadConversationRhythm {
  const hints = HINTS[period];
  const index = now.getDate() % hints.length;

  switch (period) {
    case "dawn":
    case "morning":
      return {
        pace: "encouraging",
        tone: "hope",
        hints: [hints[index]],
      };
    case "midday":
    case "afternoon":
      return {
        pace: "steady",
        tone: "momentum",
        hints: [hints[index]],
      };
    case "golden-hour":
    case "evening":
      return {
        pace: "gentle",
        tone: "reflection",
        hints: [hints[index]],
      };
    case "night":
      return {
        pace: "quiet",
        tone: "gentleness",
        hints: [hints[index]],
      };
  }
}
