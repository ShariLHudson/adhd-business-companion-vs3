"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ESTATE_GUIDE_SPREADS,
  type EstateGuideSpreadData,
} from "@/data/estateGuideSpreads";
import {
  SPARK_ESTATE_GUIDE_COVER_ALT,
  SPARK_ESTATE_GUIDE_COVER_SRC,
} from "@/lib/estate/sparkEstateGuide";
import { EstateGuideSpread } from "./EstateGuideSpread";
import "./estate-guide-flipbook.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

type FlipPhase = "cover" | "spread";
type FlipAnim = "idle" | "next" | "prev";

export function EstateGuideFlipbook({ open, onClose }: Props) {
  const spreads = ESTATE_GUIDE_SPREADS;
  const [phase, setPhase] = useState<FlipPhase>("cover");
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [flipAnim, setFlipAnim] = useState<FlipAnim>("idle");
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const spread = spreads[spreadIndex] as EstateGuideSpreadData | undefined;
  const atStart = spreadIndex <= 0;
  const atEnd = spreadIndex >= spreads.length - 1;

  const resetBook = useCallback(() => {
    setPhase("cover");
    setSpreadIndex(0);
    setFlipAnim("idle");
  }, []);

  const runFlip = useCallback(
    (direction: "next" | "prev", nextIndex: number) => {
      setFlipAnim((current) => {
        if (current !== "idle") return current;
        window.setTimeout(() => {
          setSpreadIndex(nextIndex);
          setFlipAnim("idle");
        }, 420);
        return direction;
      });
    },
    [],
  );

  useEffect(() => {
    if (!open) {
      resetBook();
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, resetBook]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (phase !== "spread" || flipAnim !== "idle") return;
      if (event.key === "ArrowRight" && spreadIndex < spreads.length - 1) {
        runFlip("next", spreadIndex + 1);
      }
      if (event.key === "ArrowLeft" && spreadIndex > 0) {
        runFlip("prev", spreadIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose, phase, flipAnim, spreadIndex, spreads.length, runFlip]);

  const openToFirstSpread = useCallback(() => {
    setPhase("spread");
    setSpreadIndex(0);
  }, []);

  const goNext = useCallback(() => {
    if (phase !== "spread" || atEnd || flipAnim !== "idle") return;
    runFlip("next", spreadIndex + 1);
  }, [phase, atEnd, flipAnim, runFlip, spreadIndex]);

  const goPrev = useCallback(() => {
    if (phase !== "spread" || atStart || flipAnim !== "idle") return;
    runFlip("prev", spreadIndex - 1);
  }, [phase, atStart, flipAnim, runFlip, spreadIndex]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null || phase !== "spread") return;
    const end = event.changedTouches[0]?.clientX;
    if (end == null) return;
    const delta = end - start;
    if (delta < -48) goNext();
    if (delta > 48) goPrev();
  };

  if (!open) return null;

  return (
    <div
      className="eg-flipbook"
      role="dialog"
      aria-modal="true"
      aria-label="Spark Estate Guide"
      ref={dialogRef}
    >
      <button
        type="button"
        className="eg-flipbook__backdrop"
        aria-label="Close guidebook"
        onClick={onClose}
      />

      <div className="eg-flipbook__shell">
        <header className="eg-flipbook__toolbar">
          <p className="eg-flipbook__eyebrow">Spark Estate Guide™</p>
          {phase === "spread" && spread ? (
            <p className="eg-flipbook__meta">
              {spread.title} · Spread {spreadIndex + 1} of {spreads.length}
            </p>
          ) : (
            <p className="eg-flipbook__meta">Your companion to the Estate</p>
          )}
          <button
            type="button"
            className="eg-flipbook__close"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <div
          className="eg-flipbook__stage"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {phase === "cover" ? (
            <div className="eg-flipbook__cover-panel">
              <button
                type="button"
                className="eg-flipbook__cover-open"
                onClick={openToFirstSpread}
                aria-label="Open Spark Estate Guide"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={SPARK_ESTATE_GUIDE_COVER_SRC}
                  alt={SPARK_ESTATE_GUIDE_COVER_ALT}
                  className="eg-flipbook__cover-image"
                  decoding="async"
                />
                <span className="eg-flipbook__cover-hint">Open guide</span>
              </button>
            </div>
          ) : spread ? (
            <div
              className={[
                "eg-flipbook__spread-wrap",
                flipAnim === "next" ? "eg-flipbook__spread-wrap--flip-next" : "",
                flipAnim === "prev" ? "eg-flipbook__spread-wrap--flip-prev" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <EstateGuideSpread spread={spread} className="eg-flipbook__spread" />

              <button
                type="button"
                className="eg-flipbook__page-turn eg-flipbook__page-turn--prev"
                onClick={goPrev}
                disabled={atStart || flipAnim !== "idle"}
                aria-label="Previous spread"
              />
              <button
                type="button"
                className="eg-flipbook__page-turn eg-flipbook__page-turn--next"
                onClick={goNext}
                disabled={atEnd || flipAnim !== "idle"}
                aria-label="Next spread"
              />
            </div>
          ) : null}
        </div>

        {phase === "spread" ? (
          <footer className="eg-flipbook__footer">
            <button
              type="button"
              className="eg-flipbook__nav-btn"
              onClick={goPrev}
              disabled={atStart || flipAnim !== "idle"}
            >
              Previous
            </button>
            <p className="eg-flipbook__footer-hint">
              Tap the page edge or swipe to turn
            </p>
            <button
              type="button"
              className="eg-flipbook__nav-btn"
              onClick={goNext}
              disabled={atEnd || flipAnim !== "idle"}
            >
              Next
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
