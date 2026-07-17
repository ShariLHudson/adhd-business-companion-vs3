/**
 * True when the pointer is on a scrollbar track/thumb of `scrollEl`
 * (not on the scrollable content area).
 */
export function isScrollbarPointerTarget(
  event: { clientX?: number; clientY?: number; target: EventTarget | null },
  scrollEl: Element,
): boolean {
  if (event.target !== scrollEl) return false;
  if (typeof event.clientX !== "number" || typeof event.clientY !== "number") {
    return false;
  }
  const rect = scrollEl.getBoundingClientRect();
  const onVerticalBar = event.clientX >= rect.left + scrollEl.clientWidth;
  const onHorizontalBar = event.clientY >= rect.top + scrollEl.clientHeight;
  return onVerticalBar || onHorizontalBar;
}

/**
 * Click outside the frosted morning-room workspace closes the room.
 * Clicks inside `[data-morning-room-workspace]` do not dismiss.
 * Scrollbar interaction on the scrollport does not dismiss (106).
 */
export function handleMorningRoomOutsideClick(
  event: {
    currentTarget: EventTarget & Element;
    target: EventTarget | null;
    clientX?: number;
    clientY?: number;
  },
  onOutsideDismiss?: () => void,
): void {
  if (!onOutsideDismiss) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (isScrollbarPointerTarget(event, event.currentTarget)) return;
  const workspace = event.currentTarget.querySelector(
    "[data-morning-room-workspace]",
  );
  if (workspace?.contains(target)) return;
  onOutsideDismiss();
}
