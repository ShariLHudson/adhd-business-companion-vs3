/**
 * Spec 109 — No scroll chasing / top-down reading.
 *
 * When conversation content updates, align the start of the latest exchange
 * (preferring the latest assistant message) to the top of the scrollport so
 * members read downward without scrolling up to find the beginning.
 *
 * Auto-scroll-to-bottom that hides the start of a long reply is the bug this
 * helper replaces.
 */

const LATEST_ASSISTANT = "[data-conversation-latest-assistant]";
const LATEST_EXCHANGE = '[data-conversation-exchange="latest"]';
const THREAD_ITEM = ".companion-chat-thread__item";
const SPARK_ALPHA_LINE = ".spark-alpha-line";

function lastOf<T extends Element>(list: NodeListOf<T> | T[]): T | null {
  const len = list.length;
  return len > 0 ? list[len - 1]! : null;
}

/** Find the anchor element that should sit at the top of the chat scrollport. */
export function findLatestConversationAnchor(
  scroller: HTMLElement,
): HTMLElement | null {
  return (
    scroller.querySelector<HTMLElement>(LATEST_ASSISTANT) ??
    scroller.querySelector<HTMLElement>(LATEST_EXCHANGE) ??
    lastOf(scroller.querySelectorAll<HTMLElement>(THREAD_ITEM)) ??
    lastOf(
      scroller.querySelectorAll<HTMLElement>(
        `${SPARK_ALPHA_LINE}:not(.spark-alpha-line--thinking)`,
      ),
    ) ??
    lastOf(scroller.querySelectorAll<HTMLElement>(SPARK_ALPHA_LINE)) ??
    null
  );
}

export type ScrollToLatestExchangeOptions = {
  behavior?: ScrollBehavior;
  /** Extra offset above the anchor (px). */
  paddingTop?: number;
};

/**
 * Scroll `scroller` so the latest exchange / assistant message starts at the
 * top of the visible area. Falls back to top of content when no anchor exists.
 */
export function scrollConversationToLatestExchange(
  scroller: HTMLElement | null | undefined,
  options?: ScrollToLatestExchangeOptions,
): void {
  if (!scroller) return;

  const behavior = options?.behavior ?? "auto";
  const paddingTop = options?.paddingTop ?? 0;
  const anchor = findLatestConversationAnchor(scroller);

  if (!anchor) {
    if (typeof scroller.scrollTo === "function") {
      scroller.scrollTo({ top: 0, behavior });
    } else {
      scroller.scrollTop = 0;
    }
    return;
  }

  const top =
    anchor.getBoundingClientRect().top -
    scroller.getBoundingClientRect().top +
    scroller.scrollTop -
    paddingTop;
  const nextTop = Math.max(0, top);

  if (typeof scroller.scrollTo === "function") {
    scroller.scrollTo({ top: nextTop, behavior });
  } else {
    scroller.scrollTop = nextTop;
  }
}
