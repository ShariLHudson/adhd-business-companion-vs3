/**
 * Estate Journey Engine™ — return experience when member comes back.
 * @see lib/sparkCompanion/sparkEstateWelcomeHome — never punish absence
 */

import { SPARK_WELCOME_HOME_MESSAGE } from "@/lib/sparkCompanion/sparkEstateWelcomeHome";
import { getEstateMemory } from "@/lib/estateMemory/estateMemoryStore";
import { getJourneyEngineState } from "./journeyStore";
import { mostRecentPausedWork, pausedWorkReturnPhrase } from "./pausedWork";

function returnLead(continuation: string): string {
  return `${SPARK_WELCOME_HOME_MESSAGE} ${continuation}`;
}

export function buildEstateJourneyReturnGreeting(): string | null {
  const memory = getEstateMemory();
  const journey = getJourneyEngineState(memory);
  const paused = mostRecentPausedWork(journey);

  if (paused) {
    return returnLead(
      `Last time we were ${pausedWorkReturnPhrase(paused)}. ` +
        `Would you like to continue where we left off, or begin somewhere fresh today?`,
    );
  }

  const activeTask = memory.activeJourney.activeTask?.trim();
  if (activeTask) {
    return returnLead(
      `Last time we were working on ${activeTask}. ` +
        `Would you like to continue where we left off, or begin somewhere fresh today?`,
    );
  }

  const lesson = journey.currentLesson?.trim();
  if (lesson) {
    return returnLead(
      `We were in your lesson on ${lesson}. ` +
        `Would you like to pick that back up, or start somewhere new today?`,
    );
  }

  const unfinished = memory.roomVisitMemory?.lastUnfinishedActivity;
  if (unfinished?.label) {
    return returnLead(
      `Last time we were ${unfinished.label}. ` +
        `Would you like to continue where we left off, or begin somewhere fresh today?`,
    );
  }

  return null;
}

export function journeyReturnHintForChat(): string | null {
  const greeting = buildEstateJourneyReturnGreeting();
  if (!greeting) return null;
  return [
    "ESTATE JOURNEY RETURN (constitutional — warm welcome, no guilt, no day-counts):",
    greeting,
    "FORBIDDEN: Welcome back · streak · days away · catch up · abandoned project.",
    "Offer to continue — never pressure. Fresh start is always valid.",
  ].join("\n");
}
