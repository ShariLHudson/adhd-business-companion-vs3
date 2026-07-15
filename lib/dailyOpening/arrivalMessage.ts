/**
 * Brief arrival line after a daily-opening choice navigates.
 * Click = permission — never ask "Would you like me to take you there?"
 */

import type { DailyOpeningDestination } from "./types";

export function buildDailyOpeningArrivalMessage(
  destination: DailyOpeningDestination,
): string | null {
  switch (destination.kind) {
    case "continue": {
      const title = destination.option.title.trim();
      return title
        ? `Here you are. I opened ${title} where you left off.`
        : "Here you are. I opened where you left off.";
    }
    case "plan-my-day":
      return "Here you are. Let's shape today's plan.";
    case "adapt-my-day":
      return "Here you are. We'll reshape today around how you feel right now.";
    case "clear-my-mind":
      return "Here you are. We can set things down together.";
    case "explore-estate":
      return "Here you are. We can look around whenever you're ready.";
    case "business-estate":
      return "Here you are. Your Business Estate is ready when you are.";
    case "section":
      return "Here you are.";
    default:
      return null;
  }
}
