/**
 * Estate Memory hint — injected before every LLM response on Estate paths.
 */

import type { EstateMemory } from "./types";
import { getEstateMemory } from "./estateMemoryStore";
import { estateJourneyHintForChat } from "@/lib/estateJourneyEngine/engine";
import { estateJourneyIntelligenceHint } from "@/lib/estateJourneyEngine/intelligence";
import { journeyReturnHintForChat } from "@/lib/estateJourneyEngine/returnExperience";
import { formatRoomHistoryChain } from "@/lib/estateJourneyEngine/roomHistory";

function formatDigest(memory: EstateMemory): string | null {
  const recent = memory.conversationDigest.slice(-6);
  if (recent.length === 0) return null;
  return recent
    .map((t) => `${t.role === "user" ? "Member" : "Spark"}: ${t.summary}`)
    .join("\n");
}

function formatJourney(memory: EstateMemory): string | null {
  const journeyHistory = memory.journeyEngine?.roomHistory;
  if (journeyHistory && journeyHistory.length > 0) {
    return formatRoomHistoryChain(journeyHistory);
  }
  const steps = memory.activeJourney.steps;
  if (steps.length === 0) return null;
  return steps
    .map((s) => s.roomName)
    .join(" → ");
}

/** LLM block — continuity without asking member to repeat themselves. */
export function estateMemoryHintForChat(
  memory: EstateMemory | null = getEstateMemory(),
): string | null {
  if (!memory) return null;

  const lines: string[] = [
    "ESTATE MEMORY CONTINUITY (mandatory — one continuous conversation across rooms):",
    "The Estate remembers the member. Never re-introduce yourself or ask them to repeat context already established.",
    "Conversation is GLOBAL — not per-room. Continue the same journey in this new environment.",
  ];

  if (memory.emotionalState.current) {
    lines.push(
      `Emotional thread: ${memory.emotionalState.current} (carry gently — do not label or lecture).`,
    );
  }

  if (memory.activeJourney.activeTask) {
    lines.push(`Active task: ${memory.activeJourney.activeTask}`);
  }

  if (memory.activeGoals.length) {
    const goals = memory.activeGoals.map((g) => g.label).join("; ");
    lines.push(`Active goals: ${goals}`);
  }

  if (memory.momentumState.unfinishedLoops.length) {
    lines.push(
      `Open loops: ${memory.momentumState.unfinishedLoops.join("; ")}`,
    );
  }

  const journey = formatJourney(memory);
  if (journey) {
    lines.push(`Estate journey so far: ${journey}`);
  }

  if (memory.lastTransition) {
    const t = memory.lastTransition;
    const why = t.userText
      ? `Member said: "${t.userText}"`
      : t.reason;
    lines.push(
      `Just arrived from ${t.fromEntryId ?? "prior room"} → ${t.toEntryId}. ${why}`,
    );
    if (t.expectedNextStep) {
      lines.push(`Expected next step: ${t.expectedNextStep}`);
    }
  }

  if (memory.currentRoom) {
    lines.push(
      `Current room: ${memory.currentRoom.entryId} — continue conversation here; no room-definition opener.`,
    );
  }

  const digest = formatDigest(memory);
  if (digest) {
    lines.push("Recent conversation (continue from here — do not restart):");
    lines.push(digest);
  }

  lines.push(
    "Never: reset chat · re-ask what they already shared · explain what this room is first.",
  );

  const journeyHint = estateJourneyHintForChat();
  if (journeyHint) lines.push(journeyHint);

  const returnHint = journeyReturnHintForChat();
  if (returnHint) lines.push(returnHint);

  const intelligenceHint = estateJourneyIntelligenceHint();
  if (intelligenceHint) lines.push(intelligenceHint);

  return lines.join("\n");
}

/** Brief arrival line when preserving global chat across a room change. */
export function estateRoomArrivalContinuationLine(roomName: string): string {
  return `We're in ${roomName} now — same conversation, just a different place. What would you like to do next?`;
}
