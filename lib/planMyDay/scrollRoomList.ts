/**
 * Scroll a saved card/section into view inside the morning-room scrollport.
 */

export function scrollRoomListToTestId(testId: string): void {
  if (typeof document === "undefined") return;
  const el = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  if (!el) return;
  const scroller = el.closest(
    ".plan-my-day-morning-room__scroll",
  ) as HTMLElement | null;
  if (scroller) {
    const top =
      el.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop -
      16;
    scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    return;
  }
  el.scrollIntoView({ block: "start", behavior: "smooth" });
}
