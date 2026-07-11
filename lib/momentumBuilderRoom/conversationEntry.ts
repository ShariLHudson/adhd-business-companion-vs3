/**
 * Layer 1 — Conversation entry for Momentum Builder.
 * Discovers context; never shows productivity frameworks.
 *
 * @see docs/MOMENTUM_BUILDER_ROOM_ARCHITECTURE.md
 */

import type {
  MomentumConversationDiscovery,
  MomentumRoadblock,
  MomentumRoomEnergy,
} from "./types";
import { MOMENTUM_BUILDER_ROOM_META } from "./roomRegistry";

export const MOMENTUM_BUILDER_ENTRY_PROMPT =
  MOMENTUM_BUILDER_ROOM_META.entryPrompt;

export const MOMENTUM_BUILDER_RETURN_GREETING =
  "I'm glad you're here. What feels hardest right now?";

export type ConversationEntryInput = {
  memberText: string;
  now?: Date;
  /** Optional hints from arrival / momentum intelligence — never shown as data. */
  priorEnergy?: MomentumRoomEnergy;
  priorRoadblocks?: MomentumRoadblock[];
  activeProjectIds?: string[];
};

/** Lightweight V1 discovery — richer NLP arrives in conversation runtime later. */
export function buildConversationDiscovery(
  input: ConversationEntryInput,
): MomentumConversationDiscovery {
  const text = input.memberText.trim();
  const lower = text.toLowerCase();
  const now = input.now ?? new Date();

  let energy: MomentumRoomEnergy = input.priorEnergy ?? "unknown";
  if (/\b(exhaust|tired|drain|low energy|no energy)\b/.test(lower)) {
    energy = "low";
  } else if (/\b(focused|ready|energized|sharp)\b/.test(lower)) {
    energy = "high";
  } else if (text.length > 0) {
    energy = energy === "unknown" ? "medium" : energy;
  }

  const roadblocks: MomentumRoadblock[] = [...(input.priorRoadblocks ?? [])];
  if (/\b(overwhelm|stuck|avoid|procrastinat|scatter|distract)\b/.test(lower)) {
    roadblocks.push({
      id: `roadblock-${now.getTime()}`,
      label: "Feeling stuck or overwhelmed",
      kind: "internal",
    });
  }

  const priorities: string[] = [];
  if (/\b(client|customer|launch|deadline|invoice|email)\b/.test(lower)) {
    priorities.push("Business obligations mentioned");
  }

  let availableTimeMinutes: number | undefined;
  const timeMatch = lower.match(/\b(\d{1,3})\s*(min|minute|hour|hr)\b/);
  if (timeMatch) {
    const n = Number(timeMatch[1]);
    const unit = timeMatch[2];
    availableTimeMinutes =
      unit?.startsWith("hour") || unit === "hr" ? n * 60 : n;
  }

  return {
    rawMemberText: text,
    emotionalState: inferEmotionalState(lower),
    availableTimeMinutes,
    energy,
    priorities,
    roadblocks,
    activeProjectIds: input.activeProjectIds ?? [],
    discoveredAt: now.toISOString(),
  };
}

function inferEmotionalState(lower: string): string | undefined {
  if (/\b(overwhelm|too much|can't think)\b/.test(lower)) return "overwhelmed";
  if (/\b(anxious|worried|nervous)\b/.test(lower)) return "anxious";
  if (/\b(frustrat|annoyed|stuck)\b/.test(lower)) return "frustrated";
  if (/\b(uncertain|unsure|don't know)\b/.test(lower)) return "uncertain";
  if (/\b(fine|okay|good)\b/.test(lower)) return "steady";
  return undefined;
}
