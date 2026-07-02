/**
 * Estate Journey Engine™ — return experience when member comes back.
 */

import { getEstateMemory } from "@/lib/estateMemory/estateMemoryStore";
import { getJourneyEngineState } from "./journeyStore";
import { mostRecentPausedWork, pausedWorkReturnPhrase } from "./pausedWork";

export function buildEstateJourneyReturnGreeting(): string | null {
  const memory = getEstateMemory();
  const journey = getJourneyEngineState(memory);
  const paused = mostRecentPausedWork(journey);

  if (paused) {
    return (
      `Welcome back. Last time we were ${pausedWorkReturnPhrase(paused)}. ` +
      `Would you like to continue where we left off?`
    );
  }

  const activeTask = memory.activeJourney.activeTask?.trim();
  if (activeTask) {
    return (
      `Welcome back. Last time we were working on ${activeTask}. ` +
      `Would you like to continue where we left off?`
    );
  }

  const lesson = journey.currentLesson?.trim();
  if (lesson) {
    return (
      `Welcome back. We were in your lesson on ${lesson}. ` +
      `Would you like to pick that back up?`
    );
  }

  const unfinished = memory.roomVisitMemory?.lastUnfinishedActivity;
  if (unfinished?.label) {
    return (
      `Welcome back. Last time we were ${unfinished.label}. ` +
      `Would you like to continue where we left off?`
    );
  }

  return null;
}

export function journeyReturnHintForChat(): string | null {
  const greeting = buildEstateJourneyReturnGreeting();
  if (!greeting) return null;
  return [
    "ESTATE JOURNEY RETURN (use only when member is returning — warm, one invitation):",
    greeting,
    "Offer to continue — never pressure. Staying fresh is also valid.",
  ].join("\n");
}
