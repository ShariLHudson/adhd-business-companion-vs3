/**
 * Per-room action matchers — activity in place, not navigation.
 */

import { detectDirectCommand } from "@/lib/estateIntelligence/estateCommandRouter";
import { resolveEstatePlaceIdFromUserText } from "../estateRoomAliasRegistry";
import { hasHardEstateNavigationIntent } from "../estateMetaNavigationPhrases";
import type { EstateRoomAction, EstateRoomActionResult } from "./types";
import { estateRoomsEquivalent, normalizeEstateRoomId } from "./roomIds";

type RoomActionMatch = {
  pattern: RegExp;
  action: EstateRoomAction;
  reply: string;
};

const JOURNAL_MATCHES: RoomActionMatch[] = [
  {
    pattern:
      /\b(?:show me my journal|open my journal|see my journal|view my journal)\b/i,
    action: { kind: "open_journal" },
    reply: "Opening your current journal.",
  },
  {
    pattern: /\b(?:create (?:a )?new journal|start a new journal|new journal)\b/i,
    action: { kind: "create_journal" },
    reply: "Let's create one together.",
  },
  {
    pattern:
      /\b(?:continue writing|pick up where i left off|resume (?:writing|my journal)|keep writing)\b/i,
    action: { kind: "resume_journal" },
    reply: "Picking up where you left off.",
  },
  {
    pattern:
      /\b(?:change pens?|writing tools|different pen|ink colors?|choose (?:a )?pen)\b/i,
    action: { kind: "open_writing_tools" },
    reply: "Let's look at your writing tools.",
  },
  {
    pattern:
      /\b(?:journal(?:ing)?|(?:like|want) to journal|write in my journal|journal for (?:a )?(?:few )?minutes|feel like journaling)\b/i,
    action: { kind: "open_journal" },
    reply: "Absolutely. I'll open your journal.",
  },
];

const COFFEE_HOUSE_MATCHES: RoomActionMatch[] = [
  {
    pattern: /\b(?:let'?s sit(?: here)?|sit here|stay here|remain here|we can stay)\b/i,
    action: { kind: "remain_in_room" },
    reply: "We can stay right here as long as you like.",
  },
  {
    pattern: /\b(?:brainstorm|think out loud|talk through an idea)\b/i,
    action: { kind: "begin_brainstorm" },
    reply: "Let's brainstorm — what's stirring?",
  },
];

const CREATIVE_STUDIO_MATCHES: RoomActionMatch[] = [
  {
    pattern:
      /\b(?:help me (?:create|write|draft|build) (?:an )?sop|standard operating procedure)\b/i,
    action: { kind: "launch_creation", creationIntent: "sop" },
    reply: "Let's build that SOP together — right here in the studio.",
  },
  {
    pattern:
      /\b(?:help me write|write (?:a|an)|draft (?:a|an)|create (?:a|an))\b/i,
    action: { kind: "launch_creation" },
    reply: "We can work on that right here — what are we making?",
  },
  {
    pattern: /\b(?:brainstorm|think out loud|talk through an idea)\b/i,
    action: { kind: "begin_brainstorm" },
    reply: "Let's brainstorm — start anywhere.",
  },
];

const MOMENTUM_MATCHES: RoomActionMatch[] = [
  {
    pattern:
      /\b(?:show (?:me )?my projects|open projects|my projects|see my projects)/i,
    action: { kind: "open_projects" },
    reply: "Opening your projects.",
  },
];

const ROUND_TABLE_MATCHES: RoomActionMatch[] = [
  {
    pattern: /\b(?:show (?:me )?my projects|open projects|my projects)/i,
    action: { kind: "open_projects" },
    reply: "Let's look at your projects together.",
  },
];

const ROOM_MATCHERS: Record<string, RoomActionMatch[]> = {
  journal: JOURNAL_MATCHES,
  "coffee-house": COFFEE_HOUSE_MATCHES,
  "creative-studio": CREATIVE_STUDIO_MATCHES,
  "art-studio": CREATIVE_STUDIO_MATCHES,
  "strategy-studio": CREATIVE_STUDIO_MATCHES,
  "momentum-institute": MOMENTUM_MATCHES,
  "momentum-room": MOMENTUM_MATCHES,
  "study-hall": MOMENTUM_MATCHES,
  "round-table": ROUND_TABLE_MATCHES,
  "goals-projects": ROUND_TABLE_MATCHES,
};

function matchRoomActions(
  roomId: string,
  text: string,
): EstateRoomActionResult | null {
  const normalized = normalizeEstateRoomId(roomId);
  if (!normalized) return null;

  const matchers =
    ROOM_MATCHERS[normalized] ??
    Object.entries(ROOM_MATCHERS).find(([key]) =>
      estateRoomsEquivalent(key, normalized),
    )?.[1];

  if (!matchers) return null;

  for (const row of matchers) {
    if (row.pattern.test(text)) {
      return {
        currentRoomId: normalized,
        action: row.action,
        reply: row.reply,
      };
    }
  }
  return null;
}

function requestsNavigationToDifferentRoom(
  text: string,
  currentRoomId: string,
): boolean {
  const direct = detectDirectCommand(text);
  if (direct) {
    const dest = direct.roomId ?? direct.entryId ?? null;
    if (dest && !estateRoomsEquivalent(dest, currentRoomId)) return true;
    return false;
  }

  const resolved = resolveEstatePlaceIdFromUserText(text);
  if (!resolved || estateRoomsEquivalent(resolved, currentRoomId)) {
    return false;
  }

  return (
    hasHardEstateNavigationIntent(text) ||
    /\b(?:take me|go to|bring me|head to|visit|show me the)\b/i.test(text)
  );
}

function isRedundantNavigationToCurrentRoom(
  text: string,
  currentRoomId: string,
): boolean {
  const direct = detectDirectCommand(text);
  if (direct) {
    const dest = direct.roomId ?? direct.entryId ?? null;
    return Boolean(dest && estateRoomsEquivalent(dest, currentRoomId));
  }

  const resolved = resolveEstatePlaceIdFromUserText(text);
  if (!resolved || !estateRoomsEquivalent(resolved, currentRoomId)) {
    return false;
  }

  return (
    hasHardEstateNavigationIntent(text) ||
    /\b(?:take me|go to|bring me|head to|visit|show me the)\b/i.test(text)
  );
}

function defaultActionForRedundantNavigation(
  currentRoomId: string,
): EstateRoomActionResult | null {
  const room = normalizeEstateRoomId(currentRoomId);
  if (!room) return null;

  if (estateRoomsEquivalent(room, "journal")) {
    return {
      currentRoomId: room,
      action: { kind: "open_journal" },
      reply: "You're already in the Journal Gazebo — opening your journal.",
    };
  }

  if (estateRoomsEquivalent(room, "coffee-house")) {
    return {
      currentRoomId: room,
      action: { kind: "remain_in_room" },
      reply: "We're already here — take your time.",
    };
  }

  if (estateRoomsEquivalent(room, "creative-studio")) {
    return {
      currentRoomId: room,
      action: { kind: "remain_in_room" },
      reply: "We're already in the Creative Studio. What would you like to work on?",
    };
  }

  if (estateRoomsEquivalent(room, "momentum-institute")) {
    return {
      currentRoomId: room,
      action: { kind: "remain_in_room" },
      reply: "We're already here. What would help most right now?",
    };
  }

  return {
    currentRoomId: room,
    action: { kind: "remain_in_room" },
    reply: `We're already here. What would you like to do?`,
  };
}

export function matchEstateRoomAction(
  text: string,
  currentPlaceId: string,
): EstateRoomActionResult | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const current = normalizeEstateRoomId(currentPlaceId);
  if (!current) return null;

  const matched = matchRoomActions(current, trimmed);
  if (matched) return matched;

  if (requestsNavigationToDifferentRoom(trimmed, current)) {
    return null;
  }

  if (isRedundantNavigationToCurrentRoom(trimmed, current)) {
    return defaultActionForRedundantNavigation(current);
  }

  return null;
}
