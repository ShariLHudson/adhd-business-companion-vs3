"use client";

import { createPortal } from "react-dom";
import { useDismissibleWindow } from "@/lib/windowDismiss";

const GIFT_ROOM_BG = "/backgrounds/personal-library-background.png";

type Props = {
  /** Back / close → returns to the previous Estate screen. */
  onClose: () => void;
  /** This slice: gift click emits a test event only — the full Spark Card is
   *  NOT opened yet (wired in a later slice). */
  onGiftClick?: () => void;
};

/**
 * Today's Spark gift room (daily-arrival), reproduced from the approved
 * prototype. A full-screen overlay showing the wrapped gift on the table with
 * a clear instruction to click it. It is intentionally separate from the normal
 * dashboard Personal Library room. For this slice the gift click is a no-op
 * test event; the full Spark Card is not opened yet.
 */
export function TodaysSparkGiftRoom({ onClose, onGiftClick }: Props) {
  const { requestClose } = useDismissibleWindow({ open: true, onClose });

  function handleGift() {
    // Full Spark Card opening is deferred to a later slice.
    if (typeof console !== "undefined") {
      console.debug(
        "[todays-spark-gift] gift clicked — full Spark Card deferred this slice",
      );
    }
    onGiftClick?.();
  }

  return createPortal(
    <section
      className="tsg-room"
      role="dialog"
      aria-modal="true"
      aria-label="My Personal Library — Today's Spark"
      data-testid="todays-spark-gift-room"
    >
      <div
        className="tsg-room__bg"
        aria-hidden="true"
        style={{ backgroundImage: `url(${GIFT_ROOM_BG})` }}
      />

      <button
        type="button"
        className="tsg-room__welcome-home"
        onClick={() => requestClose()}
        data-testid="tsg-welcome-home"
      >
        <span aria-hidden="true">⌂ </span>Welcome Home
      </button>

      <button
        type="button"
        className="tsg-room__gift"
        onClick={handleGift}
        aria-label="Open Today's Spark"
        data-testid="tsg-gift"
      />

      <div className="tsg-room__callout" data-testid="tsg-callout">
        <strong>Click the gift to unwrap Today’s Spark.</strong>
        A new discovery is waiting just for you.
      </div>
    </section>,
    document.body,
  );
}
