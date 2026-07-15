/**
 * Click outside the frosted morning-room workspace closes the room.
 * Clicks inside `[data-morning-room-workspace]` do not dismiss.
 */
export function handleMorningRoomOutsideClick(
  event: {
    currentTarget: EventTarget & Element;
    target: EventTarget | null;
  },
  onOutsideDismiss?: () => void,
): void {
  if (!onOutsideDismiss) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  const workspace = event.currentTarget.querySelector(
    "[data-morning-room-workspace]",
  );
  if (workspace?.contains(target)) return;
  onOutsideDismiss();
}
