"use client";

import type { JournalEnvelopeBeat } from "@/lib/journalGazebo/cinematicTypes";
import { JOURNAL_ENVELOPE_ADDRESS } from "@/lib/journalGazebo/hospitality";

type Props = {
  beat: JournalEnvelopeBeat;
  clickable: boolean;
  onOpen: () => void;
};

/**
 * Heirloom envelope — fully closed until opened. Letter does not exist until removed.
 */
export function JournalGazeboCinematicEnvelope({
  beat,
  clickable,
  onOpen,
}: Props) {
  const animating = beat !== "waiting";
  const letterVisible =
    beat === "letter-peek" ||
    beat === "letter-rise" ||
    beat === "letter-unfold" ||
    beat === "complete";

  return (
    <button
      type="button"
      className={[
        "jg-heirloom-envelope",
        animating ? `jg-heirloom-envelope--${beat}` : "",
        clickable ? "jg-heirloom-envelope--clickable" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={clickable ? onOpen : undefined}
      disabled={!clickable}
      aria-label="Open the welcome envelope"
    >
      <span className="jg-heirloom-envelope__shadow" aria-hidden="true" />

      <span className="jg-heirloom-envelope__craft" aria-hidden="true">
        <span className="jg-heirloom-envelope__back">
          <span className="jg-heirloom-envelope__texture" />
        </span>

        <span className="jg-heirloom-envelope__lining" />

        <span
          className={[
            "jg-heirloom-envelope__letter",
            letterVisible ? "jg-heirloom-envelope__letter--visible" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className="jg-heirloom-envelope__letter-panel jg-heirloom-envelope__letter-panel--a" />
          <span className="jg-heirloom-envelope__letter-panel jg-heirloom-envelope__letter-panel--b" />
        </span>

        <span className="jg-heirloom-envelope__front">
          <span className="jg-heirloom-envelope__texture" />
          <span className="jg-heirloom-envelope__address">{JOURNAL_ENVELOPE_ADDRESS}</span>
        </span>

        <span className="jg-heirloom-envelope__flap">
          <span className="jg-heirloom-envelope__flap-face">
            <span className="jg-heirloom-envelope__texture" />
          </span>
          <span className="jg-heirloom-envelope__flap-lining" />
          <span className="jg-heirloom-envelope__wax">
            <span className="jg-heirloom-envelope__wax-pool" />
            <span className="jg-heirloom-envelope__wax-body" />
            <span className="jg-heirloom-envelope__wax-shine" />
            <span className="jg-heirloom-envelope__flame-impression" />
          </span>
        </span>
      </span>
    </button>
  );
}
