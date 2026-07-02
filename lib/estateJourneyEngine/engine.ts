/**
 * Estate Journey Engine™ — orchestration API.
 */

import type { EstateEmotionalLabel } from "@/lib/estateMemory/types";
import { captureActiveArtifactAsPausedWork } from "./pausedWork";
import { recordJourneyRoomVisit } from "./roomHistory";
import { noteJourneyIdeaCaptured, noteJourneyProjectAdvanced } from "./session";
import { getJourneyEngineState, patchJourneyEngine } from "./journeyStore";
import type { RecordJourneyRoomTransitionInput } from "./types";

export { getJourneyEngineState, patchJourneyEngine } from "./journeyStore";

function inferEnergy(
  emotional?: EstateEmotionalLabel | null,
  overwhelmed?: boolean,
): "low" | "medium" | "high" | undefined {
  if (overwhelmed || emotional === "overwhelmed" || emotional === "anxious") {
    return "low";
  }
  if (emotional === "energized" || emotional === "focused") return "high";
  if (emotional === "calm") return "medium";
  return undefined;
}

function looksLikeIdea(text: string): boolean {
  return /\b(?:idea|thought|what if|maybe we|i'm thinking)\b/i.test(text);
}

function looksLikeProjectProgress(text: string): boolean {
  return /\b(?:finished|completed|drafted|built|created|updated)\b/i.test(text);
}

/** Called after estate memory records a room transition. */
export function onEstateJourneyRoomTransition(
  input: RecordJourneyRoomTransitionInput,
): void {
  if (input.fromEntryId && input.fromEntryId !== input.toEntryId) {
    captureActiveArtifactAsPausedWork(input.fromEntryId, input.fromSection);
  }

  recordJourneyRoomVisit(input.toEntryId, input.toRoomName);

  const focus =
    input.userText?.trim() ||
    (input.reason !== "navigation" ? input.reason : undefined);

  patchJourneyEngine((journey) => ({
    ...journey,
    currentFocus: focus ?? journey.currentFocus,
  }));
}

export type RecordJourneyConversationTurnInput = {
  userText: string;
  emotionalLabel?: EstateEmotionalLabel | null;
  overwhelmed?: boolean;
  activeGoal?: string | null;
  activeTask?: string | null;
};

/** Called after estate memory records a conversation turn. */
export function onEstateJourneyConversationTurn(
  input: RecordJourneyConversationTurnInput,
): void {
  patchJourneyEngine((journey) => ({
    ...journey,
    currentMood: input.emotionalLabel ?? journey.currentMood,
    currentEnergy: inferEnergy(input.emotionalLabel, input.overwhelmed),
    currentGoal: input.activeGoal?.trim() || journey.currentGoal,
    currentFocus: input.activeTask?.trim() || journey.currentFocus,
  }));

  if (looksLikeIdea(input.userText)) {
    noteJourneyIdeaCaptured(input.userText);
  }
  if (looksLikeProjectProgress(input.userText) && input.activeTask) {
    noteJourneyProjectAdvanced(input.activeTask);
  }
}

/** LLM continuity block — journey state for chat hints. */
export function estateJourneyHintForChat(): string | null {
  const journey = getJourneyEngineState();
  const lines: string[] = [
    "ESTATE JOURNEY ENGINE (one continuous journey — never make member repeat context):",
  ];

  const chain = journey.roomHistory.map((h) => h.roomName).join(" → ");
  if (chain) lines.push(`Journey path: ${chain}`);

  if (journey.pausedWork.length) {
    const paused = journey.pausedWork
      .slice(0, 4)
      .map((p) => p.label)
      .join("; ");
    lines.push(`Paused work (safe, resumable): ${paused}`);
  }

  if (journey.currentGoal) lines.push(`Current goal: ${journey.currentGoal}`);
  if (journey.currentFocus) lines.push(`Current focus: ${journey.currentFocus}`);
  if (journey.currentLesson) lines.push(`Current lesson: ${journey.currentLesson}`);
  if (journey.currentMood) {
    lines.push(`Mood thread: ${journey.currentMood} (carry gently)`);
  }

  const recentLearning = journey.learning
    .filter((l) => l.status === "completed")
    .slice(0, 4)
    .map((l) => l.label);
  if (recentLearning.length) {
    lines.push(`Recent learning: ${recentLearning.join("; ")}`);
  }

  if (lines.length <= 1) return null;
  lines.push("Never imply starting over — progress and journey persist.");
  return lines.join("\n");
}
