/**
 * Collection offer conversation flow — permission, room choice, prefill open.
 */

import {
  isConfirmationAcceptance,
  isConfirmationDecline,
  isPureConfirmationDecline,
} from "@/lib/conversationConfirmationGate";
import { parseOptionSelection } from "@/lib/workspaceSop";
import {
  buildCollectionPrefill,
  formatCollectionRoomMenu,
  isCollectionOfferMessage,
} from "./collectionOfferIntelligence";
import { roomName } from "./estateCollectionsPlaybook";
import {
  clearCollectionPendingOffer,
  type CollectionPendingOffer,
  saveCollectionPendingOffer,
} from "./collectionPendingOffer";
import { getEstateCollectionRoom } from "./registry";
import type { EstateCollectionRoomId } from "./types";
import { ESTATE_COLLECTION_ROOM_IDS } from "./types";

export type CollectionOfferReply =
  | {
      handled: true;
      kind: "decline" | "ack" | "menu" | "open";
      ack: string;
      openRoomId?: EstateCollectionRoomId;
      prefill?: CollectionPendingOffer["prefill"];
      sourceText?: string;
      nextPending?: CollectionPendingOffer | null;
    }
  | { handled: false };

const ROOM_CHOICE_RE =
  /\b(?:different room|another room|somewhere else|other room|choose|pick a room|which room)\b/i;

function roomIdFromUserText(text: string): EstateCollectionRoomId | null {
  const trimmed = text.trim().toLowerCase();
  const numbered = parseOptionSelection(text, ESTATE_COLLECTION_ROOM_IDS.length);
  if (numbered !== null && numbered >= 0 && numbered < ESTATE_COLLECTION_ROOM_IDS.length) {
    return ESTATE_COLLECTION_ROOM_IDS[numbered]!;
  }

  for (const id of ESTATE_COLLECTION_ROOM_IDS) {
    const room = getEstateCollectionRoom(id);
    if (trimmed.includes(room.roomName.toLowerCase())) return id;
  }

  if (/\bjournal|gazebo\b/.test(trimmed)) return "journal";
  if (/\bgreenhouse|seedling\b/.test(trimmed)) return "greenhouse";
  if (/\bevidence|vault\b/.test(trimmed)) return "evidence-vault";
  if (/\bachievement|library|shelf\b/.test(trimmed)) return "achievement-library";
  if (/\bgarden|celebration garden\b/.test(trimmed)) return "celebration-garden";
  if (/\bhall|celebration hall\b/.test(trimmed)) return "celebration-hall";

  return null;
}

function openAck(roomId: EstateCollectionRoomId): string {
  const room = getEstateCollectionRoom(roomId);
  return `I'll open ${room.roomName} with a draft ready — you can edit before saving.`;
}

export function createCollectionPendingOffer(input: {
  roomId: EstateCollectionRoomId;
  sourceUserText: string;
  offerLine: string;
  prefill: CollectionPendingOffer["prefill"];
  offeredAtTurn: number;
  phase?: CollectionPendingOffer["phase"];
  alternateRoomIds?: EstateCollectionRoomId[];
}): CollectionPendingOffer {
  return {
    phase: input.phase ?? "room_suggested",
    sourceUserText: input.sourceUserText,
    suggestedRoomId: input.roomId,
    alternateRoomIds: input.alternateRoomIds,
    prefill: input.prefill,
    offeredAtTurn: input.offeredAtTurn,
    offerLine: input.offerLine,
    savedAt: new Date().toISOString(),
  };
}

export function recoverCollectionPendingFromAssistant(input: {
  assistantText: string;
  sourceUserText: string;
  offeredAtTurn: number;
}): CollectionPendingOffer | null {
  if (!isCollectionOfferMessage(input.assistantText)) return null;
  const roomId = roomIdFromUserText(input.assistantText);
  if (!roomId) return null;
  return createCollectionPendingOffer({
    roomId,
    sourceUserText: input.sourceUserText,
    offerLine: input.assistantText.trim(),
    prefill: buildCollectionPrefill(roomId, input.sourceUserText),
    offeredAtTurn: input.offeredAtTurn,
    phase: /\bwhere would you like this to rest\b/i.test(input.assistantText)
      ? "choose_room"
      : "room_suggested",
  });
}

export function resolveCollectionOfferReply(
  userText: string,
  pending: CollectionPendingOffer | null,
): CollectionOfferReply {
  if (!pending) return { handled: false };

  if (isPureConfirmationDecline(userText)) {
    clearCollectionPendingOffer();
    return {
      handled: true,
      kind: "decline",
      ack: "No problem — we can stay right here.",
      nextPending: null,
    };
  }

  const explicitRoom = roomIdFromUserText(userText);

  if (pending.phase === "choose_room") {
    if (explicitRoom) {
      clearCollectionPendingOffer();
      return {
        handled: true,
        kind: "open",
        ack: openAck(explicitRoom),
        openRoomId: explicitRoom,
        prefill: buildCollectionPrefill(explicitRoom, pending.sourceUserText),
        sourceText: pending.sourceUserText,
        nextPending: null,
      };
    }
    if (isConfirmationAcceptance(userText)) {
      const menu = formatCollectionRoomMenu();
      const next = {
        ...pending,
        phase: "choose_room" as const,
        offerLine: menu,
      };
      saveCollectionPendingOffer(next);
      return {
        handled: true,
        kind: "menu",
        ack: menu,
        nextPending: next,
      };
    }
    return { handled: false };
  }

  if (ROOM_CHOICE_RE.test(userText)) {
    const menu = formatCollectionRoomMenu();
    const next: CollectionPendingOffer = {
      ...pending,
      phase: "choose_room",
      offerLine: menu,
    };
    saveCollectionPendingOffer(next);
    return {
      handled: true,
      kind: "menu",
      ack: menu,
      nextPending: next,
    };
  }

  if (explicitRoom && !isConfirmationDecline(userText)) {
    clearCollectionPendingOffer();
    return {
      handled: true,
      kind: "open",
      ack: openAck(explicitRoom),
      openRoomId: explicitRoom,
      prefill: buildCollectionPrefill(explicitRoom, pending.sourceUserText),
      sourceText: pending.sourceUserText,
      nextPending: null,
    };
  }

  if (isConfirmationAcceptance(userText)) {
    if (
      pending.alternateRoomIds?.length &&
      /\b(?:both|all of (?:them|those)|yes to both)\b/i.test(userText)
    ) {
      const secondary = pending.alternateRoomIds[0]!;
      clearCollectionPendingOffer();
      return {
        handled: true,
        kind: "open",
        ack: `${openAck(pending.suggestedRoomId)} When you are ready, we can also place it in ${roomName(secondary)}.`,
        openRoomId: pending.suggestedRoomId,
        prefill: pending.prefill,
        sourceText: pending.sourceUserText,
        nextPending: null,
      };
    }
    clearCollectionPendingOffer();
    return {
      handled: true,
      kind: "open",
      ack: openAck(pending.suggestedRoomId),
      openRoomId: pending.suggestedRoomId,
      prefill: pending.prefill,
      sourceText: pending.sourceUserText,
      nextPending: null,
    };
  }

  return { handled: false };
}
