"use client";

import { createPortal } from "react-dom";
import { useDismissibleWindow } from "@/lib/windowDismiss";

// The one approved Personal Library room image (personal-library-with-clickable-gift).
// The gift and the "Click the gift to unwrap Today's Spark" callout are part of
// this image, so the component only adds invisible clickable hotspots over them.
const GIFT_ROOM_BG = "/backgrounds/personal-library-background.png";

type Props = {
  /** Back / close → returns to the previous Estate screen. */
  onClose: () => void;
  /** This slice: gift click is a no-op test event (full Spark Card deferred). */
  onGiftClick?: () => void;
};

/**
 * Today's Spark gift room (daily-arrival) — the exact prototype room. A
 * full-viewport overlay showing the wrapped gift on the table with the baked-in
 * instruction to click it. Separate from the normal Personal Library room; the
 * gift click is deferred to a later slice.
 */
export function TodaysSparkGiftRoom({ onClose, onGiftClick }: Props) {
  const { requestClose } = useDismissibleWindow({ open: true, onClose });

  function handleGift() {
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
      <div className="tsg-room__stage">
        <div
          className="tsg-room__bg"
          aria-hidden="true"
          style={{ backgroundImage: `url(${GIFT_ROOM_BG})` }}
        />

        {/* Invisible clickable region over the baked-in "Welcome Home" label. */}
        <button
          type="button"
          className="tsg-room__welcome-home"
          onClick={() => requestClose()}
          aria-label="Back to Welcome Home"
          data-testid="tsg-welcome-home"
        />

        {/* Invisible clickable region over the wrapped gift (no-op this slice). */}
        <button
          type="button"
          className="tsg-room__gift"
          onClick={handleGift}
          aria-label="Open Today's Spark"
          data-testid="tsg-gift"
        />
      </div>
    </section>,
    document.body,
  );
}
