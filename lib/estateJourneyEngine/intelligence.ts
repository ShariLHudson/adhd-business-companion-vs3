/**
 * Estate Journey Engine — intelligence hints for natural room recommendations.
 */

import { getJourneyEngineState } from "./journeyStore";
import { weeksStudyingTopic } from "./learningMemory";

const TOPIC_ROOM_SUGGESTIONS: Record<
  string,
  { roomName: string; entryId: string; minWeeks: number }
> = {
  marketing: {
    roomName: "Creative Studio",
    entryId: "creative-studio",
    minWeeks: 3,
  },
  sales: {
    roomName: "Sales Workshop",
    entryId: "sales-workshop",
    minWeeks: 2,
  },
  leadership: {
    roomName: "Conservatory",
    entryId: "conservatory",
    minWeeks: 2,
  },
};

export function estateJourneyIntelligenceHint(): string | null {
  const journey = getJourneyEngineState();
  const hints: string[] = [];

  for (const [topic, config] of Object.entries(TOPIC_ROOM_SUGGESTIONS)) {
    const weeks = weeksStudyingTopic(journey, topic);
    if (weeks >= config.minWeeks) {
      hints.push(
        `Member has been studying ${topic} for several weeks. ${config.roomName} may naturally invite applying what they learned — one gentle suggestion only, never a menu.`,
      );
    }
  }

  if (journey.pausedWork.length > 0) {
    const labels = journey.pausedWork
      .slice(0, 3)
      .map((p) => p.label)
      .join("; ");
    hints.push(
      `Paused work waiting (nothing lost): ${labels}. Mention only if member asks or seems ready to resume.`,
    );
  }

  if (journey.currentFocus) {
    hints.push(`Current focus thread: ${journey.currentFocus}`);
  }

  if (hints.length === 0) return null;
  return ["ESTATE JOURNEY INTELLIGENCE:", ...hints].join("\n");
}
