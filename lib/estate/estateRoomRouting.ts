/**
 * Estate Room Registry™ — natural-language routing and Shari navigation copy.
 * Explicit room-name navigation is separate from feeling/activity intent routing.
 *
 * **Phase C — replace later:** Regex rules here are legacy. Exact place navigation must use
 * `resolveEstatePlace` → `goToPlace` (canonical authority).
 *
 * @see lib/estate/resolveEstatePlace.ts
 * @see docs/estate/PHASE_C_GOTOPLACE_REPORT.md
 */

import type { EstateRoomDefinition } from "./types";
import { ESTATE_ROOM_REGISTRY, getEstateRoomById } from "./estateRoomRegistry";

export type EstateRoomMatch = {
  room: EstateRoomDefinition;
  reason: string;
  score: number;
};

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

/** Only explicit "take me to …" style navigation — never mood/feeling. */
const EXPLICIT_NAVIGATION_RULES: {
  pattern: RegExp;
  roomId: string;
  score: number;
  reason: string;
}[] = [
  {
    pattern:
      /\b(?:take me to|go to|visit|open|let'?s visit|head to|show me|me to)\b.*\bconservator(?:y|ies)\b/i,
    roomId: "conservatory",
    score: 40,
    reason: "explicit navigation → The Conservatory™",
  },
  {
    pattern:
      /\b(?:take me to|go to|visit|open|let'?s visit|head to|show me|me to)\b.*\bmomentum institute\b/i,
    roomId: "momentum-institute",
    score: 40,
    reason: "explicit navigation → Momentum Institute™",
  },
  {
    pattern:
      /\b(?:take me to|go to|visit|open|let'?s visit|head to|show me|me to)\b.*\bcoffee house\b/i,
    roomId: "coffee-house",
    score: 40,
    reason: "explicit navigation → Coffee House™",
  },
  {
    pattern:
      /\b(?:take me to|go to|visit|open|let'?s visit|head to|show me|me to)\b.*\bcreative studio\b/i,
    roomId: "creative-studio",
    score: 40,
    reason: "explicit navigation → Creative Studio™",
  },
  {
    pattern:
      /\b(?:take me to|go to|visit|open|let'?s visit|head to|show me|me to)\b.*\bpeaceful places?\b/i,
    roomId: "peaceful-places",
    score: 40,
    reason: "explicit navigation → Peaceful Places™",
  },
  {
    pattern:
      /\b(?:take me to|go to|visit|open|let'?s visit|head to|show me|me to)\b.*\b(?:my )?journal\b/i,
    roomId: "journal",
    score: 40,
    reason: "explicit navigation → Journal™",
  },
  {
    pattern:
      /\b(?:take me to|go to|visit|open|let'?s visit|head to|show me|me to)\b.*\bmy estate\b/i,
    roomId: "my-estate",
    score: 40,
    reason: "explicit navigation → My Estate™",
  },
  {
    pattern:
      /\b(?:take me to|go to|visit|open|let'?s visit|head to|me to)\b.*\bapple orchard\b/i,
    roomId: "apple-orchard",
    score: 40,
    reason: "explicit navigation → Apple Orchard™",
  },
  {
    pattern:
      /\b(?:take me to|go to|visit|open|let'?s visit|head to|me to)\b.*\bsunroom\b/i,
    roomId: "sunroom",
    score: 40,
    reason: "explicit navigation → Sunroom",
  },
  {
    pattern:
      /\b(?:take me to|go to|visit|open)\b.*\bmusic room\b/i,
    roomId: "music-room",
    score: 40,
    reason: "explicit navigation → Music Room™",
  },
  {
    pattern:
      /\b(?:take me to|go to|visit|open|let'?s visit)\b.*\btea room\b/i,
    roomId: "tea-room",
    score: 40,
    reason: "explicit navigation → Tea Room™",
  },
  {
    pattern:
      /\b(?:take me to|go to|visit|let'?s visit)\b.*\bstables?\b/i,
    roomId: "stables",
    score: 40,
    reason: "explicit navigation → Stables™",
  },
  {
    pattern:
      /\b(?:take me to|go to|visit|let'?s visit)\b.*\bgardens?\b/i,
    roomId: "gardens",
    score: 40,
    reason: "explicit navigation → Gardens™",
  },
  {
    pattern:
      /\b(?:take me to|go to|visit|open|let'?s visit)\b.*\bgreenhouse\b/i,
    roomId: "greenhouse",
    score: 40,
    reason: "explicit navigation → Greenhouse™",
  },
  {
    pattern:
      /\b(?:take me to|go to|visit|open|let'?s visit)\b.*\bgame room\b/i,
    roomId: "game-room",
    score: 40,
    reason: "explicit navigation → Game Room™",
  },
  {
    pattern:
      /\b(?:take me to|go to|visit|open|let'?s visit)\b.*\bclear my mind\b/i,
    roomId: "clear-my-mind",
    score: 40,
    reason: "explicit navigation → Clear My Mind™",
  },
];

/** Feeling/activity intent — only when no exact room name was given. */
const INTENT_ROUTING_RULES: {
  pattern: RegExp;
  roomId: string;
  score: number;
  reason: string;
}[] = [
  {
    pattern: /\b(?:want|need|play).*\bmusic\b/i,
    roomId: "music-room",
    score: 22,
    reason: "music intent → Music Room™",
  },
  {
    pattern: /\b(?:want|need).*\bcoffee\b/i,
    roomId: "coffee-house",
    score: 22,
    reason: "coffee → Coffee House™",
  },
  {
    pattern: /\blearn(?:ing)? (?:about )?pricing\b/i,
    roomId: "momentum-institute",
    score: 24,
    reason: "learn pricing → Momentum Institute™",
  },
  {
    pattern: /\b(?:write|writing|draft).*\bnewsletter\b/i,
    roomId: "creative-studio",
    score: 26,
    reason: "newsletter → Creative Studio™",
  },
  {
    pattern: /\bthink through (?:a )?decision\b/i,
    roomId: "decision-compass",
    score: 24,
    reason: "decision → Decision Compass™",
  },
  {
    pattern: /\b(?:need to |want to |help me )?clear (?:my )?(?:head|mind)\b/i,
    roomId: "clear-my-mind",
    score: 24,
    reason: "clear head → Clear My Mind™",
  },
  {
    pattern: /\b(?:want|need) to journal\b/i,
    roomId: "journal",
    score: 24,
    reason: "journal → Journal™",
  },
  {
    pattern: /\bresearch ai tools?\b/i,
    roomId: "observatory",
    score: 24,
    reason: "research AI → Observatory™",
  },
  {
    pattern: /\b(?:i'?m|i am) nervous\b/i,
    roomId: "stables",
    score: 22,
    reason: "nervous → Stables™",
  },
  {
    pattern: /\b(?:lack|lacking|low) (?:of )?confidence\b/i,
    roomId: "stables",
    score: 24,
    reason: "confidence → Stables™",
  },
  {
    pattern: /\b(?:afraid|scared) to raise (?:my )?prices?\b/i,
    roomId: "stables",
    score: 26,
    reason: "pricing fear → Stables™",
  },
  {
    pattern: /\bavoid(?:ing)? networking\b/i,
    roomId: "stables",
    score: 24,
    reason: "networking avoidance → Stables™",
  },
  {
    pattern: /\bdon'?t trust myself\b/i,
    roomId: "stables",
    score: 26,
    reason: "self-trust → Stables™",
  },
  {
    pattern: /\bsecond[- ]?guess(?:ing)? everything\b/i,
    roomId: "stables",
    score: 24,
    reason: "second guessing → Stables™",
  },
  {
    pattern: /\b(?:afraid|scared) of rejection\b/i,
    roomId: "stables",
    score: 24,
    reason: "rejection fear → Stables™",
  },
];

function collectMatches(
  text: string,
  rules: typeof EXPLICIT_NAVIGATION_RULES,
): EstateRoomMatch[] {
  const byId = new Map<string, EstateRoomMatch>();

  const add = (roomId: string, score: number, reason: string) => {
    const room = getEstateRoomById(roomId);
    if (!room) return;
    const existing = byId.get(roomId);
    if (!existing || score > existing.score) {
      byId.set(roomId, { room, reason, score });
    }
  };

  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      add(rule.roomId, rule.score, rule.reason);
    }
  }

  return [...byId.values()].sort((a, b) => b.score - a.score);
}

/** Explicit navigation only — for direct room commands. */
export function matchExplicitEstateRoomNavigation(
  text: string,
): EstateRoomMatch | null {
  return collectMatches(text, EXPLICIT_NAVIGATION_RULES)[0] ?? null;
}

/** Feeling/activity recommendations — never overrides exact room names. */
export function matchEstateRoomIntent(text: string): EstateRoomMatch | null {
  return collectMatches(text, INTENT_ROUTING_RULES)[0] ?? null;
}

/** Match member language to Estate rooms — for navigation and Estate Intelligence™. */
export function matchEstateRoomsForText(text: string): EstateRoomMatch[] {
  const t = normalize(text);
  if (!t) return [];

  const byId = new Map<string, EstateRoomMatch>();

  const add = (roomId: string, score: number, reason: string) => {
    const room = getEstateRoomById(roomId);
    if (!room) return;
    const existing = byId.get(roomId);
    if (!existing || score > existing.score) {
      byId.set(roomId, { room, reason, score });
    }
  };

  for (const match of collectMatches(text, EXPLICIT_NAVIGATION_RULES)) {
    add(match.room.id, match.score, match.reason);
  }
  for (const match of collectMatches(text, INTENT_ROUTING_RULES)) {
    add(match.room.id, match.score, match.reason);
  }

  for (const room of ESTATE_ROOM_REGISTRY) {
    for (const phrase of room.navigationPhrases) {
      if (t.includes(phrase.toLowerCase())) {
        add(room.id, 16, `navigation phrase: ${phrase}`);
        break;
      }
    }
  }

  return [...byId.values()].sort((a, b) => b.score - a.score);
}

export function bestEstateRoomForText(text: string): EstateRoomMatch | null {
  const matches = matchEstateRoomsForText(text);
  return matches[0] ?? null;
}

/** Estate language — never "Opening workspace…" */
export function estateRoomNavigationLine(roomId: string): string | null {
  const room = getEstateRoomById(roomId);
  if (!room) return null;

  switch (room.id) {
    case "apple-orchard":
      return "Let's head to the Apple Orchard.";
    case "music-room":
      return "I'll take us to the Music Room.";
    case "tea-room":
      return "The Tea Room sounds peaceful — shall we head there?";
    case "gardens":
      return "Let's visit the Gardens.";
    case "stables":
      return "I'd like to take us somewhere that might help. Let's spend a few minutes at the Stables™.";
    case "momentum-institute":
      return "I'll take us to the Momentum Institute™.";
    case "creative-studio":
      return "Let's head to Create.";
    case "peaceful-places":
      return "Peaceful Places™ might help — shall we go there?";
    case "clear-my-mind":
      return "Let's clear your mind together.";
    case "decision-compass":
      return "The Decision Compass™ can help us think this through.";
    case "coffee-house":
      return "The Coffee House™ is warm — want to head there?";
    case "observatory":
      return "Let's visit the Observatory™.";
    case "game-room":
      return "The Game Room might be a good reset — want to go?";
    case "conservatory":
      return "Let's head to The Conservatory™.";
    default:
      return `Let's head to ${room.trademark ?? room.name}.`;
  }
}

export function estateRoomInvitationLine(
  roomId: string,
  options?: { confirm?: boolean },
): string | null {
  const line = estateRoomNavigationLine(roomId);
  if (!line) return null;
  if (options?.confirm) {
    return `${line.replace(/\.$/, "")} — would you like that?`;
  }
  return line;
}

/** Hints for companion chat when routing to a room. */
export function estateRoomHintForChat(room: EstateRoomDefinition): string {
  return [
    `ESTATE ROOM REGISTRY (mandatory): Member intent matches **${room.trademark ?? room.name}**.`,
    `Purpose: ${room.purpose}`,
    `Emotional feeling: ${room.emotionalFeeling}`,
    `What members do here: ${room.whatMembersDo}`,
    `What Shari does: ${room.whatShariDoes}`,
    room.route
      ? `Primary route: ${room.route}`
      : "No dedicated route yet — invite conversationally or ask where they'd like to go.",
    "Use Estate language — never 'Opening module…' or 'Navigate to…'.",
    `Preferred invitation: ${estateRoomNavigationLine(room.id) ?? "Let's go there together."}`,
  ].join("\n");
}
