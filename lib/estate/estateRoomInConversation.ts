/**
 * In-room conversation — stay in the estate place; no workspace auto-routing.
 * @see docs/ESTATE_ROOM_TEMPLATE.md
 */

import { ESTATE_ROOM_PRIMARY_CATALOG } from "./estateRoomInvitationCatalog";
import { isDirectEstateRoomRequest } from "@/lib/estateIntelligence/estateCommandRouter";
import { resolveExplicitCompanionAction } from "@/lib/companion/explicitCompanionActions";

export type EstateRoomInConversationTopic =
  | "journal"
  | "quiet"
  | "reflect";

export type { ExplicitCompanionAction as EstateExplicitActivity } from "@/lib/companion/explicitCompanionActions";

export { resolveExplicitEstateActivity } from "@/lib/companion/explicitCompanionActions";

const JOURNAL_RE =
  /\b(?:journal(?:ing)?|feel like (?:writing|journaling)|write (?:in )?(?:my )?journal|diary|capture (?:this|thoughts)|write (?:this )?down)\b/i;

const QUIET_RE =
  /\b(?:quiet time|just (?:sit|be)|enjoy (?:the |this )?(?:room|space|view)|peaceful|slow down)\b/i;

const REFLECT_RE =
  /\b(?:reflect(?:ion)?|think about (?:my )?journey|look back|process (?:this|what))\b/i;

export function detectEstateRoomInConversationTopic(
  userText: string,
): EstateRoomInConversationTopic | null {
  const text = userText.trim();
  if (!text) return null;
  if (JOURNAL_RE.test(text)) return "journal";
  if (QUIET_RE.test(text)) return "quiet";
  if (REFLECT_RE.test(text)) return "reflect";
  return null;
}

function roomOffersJournal(roomId: string): boolean {
  const items = ESTATE_ROOM_PRIMARY_CATALOG[roomId] ?? [];
  return items.some(
    (item) =>
      item.action.kind === "section" &&
      item.action.section === "growth-journal",
  );
}

const IN_ROOM_REPLIES: Record<
  EstateRoomInConversationTopic,
  Partial<Record<string, string>> & { default: string }
> = {
  journal: {
    "apple-orchard":
      "I'd love that. The orchard is a gentle place to write — what's stirring in you?",
    greenhouse:
      "We can journal about a seed while it's still small — what's on your mind?",
    gardens:
      "I'd love that. We can write together here in the garden — what wants to come out?",
    conservatory:
      "Journal sounds right. We can write together here, or just talk first — whatever feels easier.",
    journal: "What's worth capturing while it's fresh?",
    default:
      "I'd love that. We can write together right here — what's on your mind?",
  },
  quiet: {
    "apple-orchard":
      "We can just be here. No agenda. The orchard isn't going anywhere.",
    default: "We can just be here. No agenda.",
  },
  reflect: {
    "apple-orchard":
      "Growth happens one season at a time. What part of your journey is on your heart?",
    default: "I'm listening. What are you noticing?",
  },
};

/**
 * Warm in-room reply when member is already inside an estate place.
 * Returns null when the message should leave the room (explicit navigation).
 */
export function resolveEstateRoomInConversationReply(
  roomId: string,
  userText: string,
): string | null {
  if (isDirectEstateRoomRequest(userText)) return null;

  const topic = detectEstateRoomInConversationTopic(userText);
  if (!topic) return null;

  if (topic === "journal" && roomId === "journal") {
    return null;
  }

  if (topic === "journal" && !roomOffersJournal(roomId) && roomId !== "journal") {
    return null;
  }

  const pool = IN_ROOM_REPLIES[topic];
  return pool[roomId] ?? pool.default;
}

export function shouldSuppressEstateIntentWhileVisiting(
  activeDirectVisitRoomId: string | null | undefined,
  userText: string,
): boolean {
  if (!activeDirectVisitRoomId) return false;
  if (isDirectEstateRoomRequest(userText)) return false;
  if (resolveExplicitCompanionAction(userText)) return false;
  return true;
}
