/**
 * Source lineage for reminders/rhythms created from existing content (Phase 2).
 * Source items are never deleted or duplicated — only referenced.
 */

export type RememberSourceKind =
  | "thought"
  | "parking_lot_item"
  | "chat_message"
  | "plan_item"
  | "conversation_turn";

export type RememberSourceRef = {
  originatedFromId: string;
  originatedFromKind: RememberSourceKind;
  /** Optional human label for history / debugging. */
  sourceRefLabel?: string;
};

export function sourceRefFromThought(
  thoughtId: string,
  label?: string,
): RememberSourceRef {
  return {
    originatedFromId: thoughtId,
    originatedFromKind: "thought",
    sourceRefLabel: label?.slice(0, 80),
  };
}

export function sourceRefFromParkingLot(
  itemId: string,
  label?: string,
): RememberSourceRef {
  return {
    originatedFromId: itemId,
    originatedFromKind: "parking_lot_item",
    sourceRefLabel: label?.slice(0, 80),
  };
}

export function sourceRefFromChat(
  messageKey: string,
  label?: string,
): RememberSourceRef {
  return {
    originatedFromId: messageKey,
    originatedFromKind: "chat_message",
    sourceRefLabel: label?.slice(0, 80),
  };
}
