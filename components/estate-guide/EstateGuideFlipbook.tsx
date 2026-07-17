"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type TouchEvent,
} from "react";
import { ESTATE_GUIDE_SPREADS } from "@/data/estateGuideSpreads";
import {
  SPARK_ESTATE_GUIDE_COVER_ALT,
  SPARK_ESTATE_GUIDE_COVER_SRC,
} from "@/lib/estate/sparkEstateGuide";
import {
  estateGuideRoomSpreadLabel,
  expandEstateGuideToRoomSpreads,
  type EstateGuideRoomSpread,
} from "@/lib/estate/estateGuidePages";
import { useDismissibleWindow } from "@/lib/windowDismiss";
import { EstateGuideRoomPage } from "./EstateGuideSpread";
import "./estate-guide-flipbook.css";

type Props = {
  open: boolean;
  onClose: () => void;
  /** When set, open the first matching room spread (skips cover). */
  initialRoomId?: string | null;
};

type FlipPhase = "cover" | "spread";

function BookPageStack({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={[
        "eg-flipbook__page-stack",
        side === "left" ? "eg-flipbook__page-stack--left" : "eg-flipbook__page-stack--right",
      ].join(" ")}
      aria-hidden="true"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className="eg-flipbook__page-sheet"
          style={{ "--eg-sheet-offset": index } as CSSProperties}
        />
      ))}
    </div>
  );
}

function GuideRoomSpread({ roomSpread }: { roomSpread: EstateGuideRoomSpread }) {
  return (
    <>
      <div className="eg-flipbook__page-slot eg-flipbook__page-slot--left">
        <EstateGuideRoomPage
          spread={roomSpread.spread}
          pageKind={roomSpread.photoPage.kind}
        />
      </div>
      <div className="eg-flipbook__gutter eg-guide-gutter" aria-hidden="true" />
      <div className="eg-flipbook__page-slot eg-flipbook__page-slot--right">
        <EstateGuideRoomPage
          spread={roomSpread.spread}
          pageKind={roomSpread.textPage.kind}
        />
      </div>
    </>
  );
}

function indexForRoomId(
  roomSpreads: EstateGuideRoomSpread[],
  roomId: string | null | undefined,
): number {
  if (!roomId) return 0;
  const normalized = roomId.trim().toLowerCase();
  if (!normalized) return 0;
  const index = roomSpreads.findIndex(
    (spread) =>
      spread.spread.id.toLowerCase() === normalized ||
      spread.roomTitle.toLowerCase().includes(normalized),
  );
  return index >= 0 ? index : 0;
}

export function EstateGuideFlipbook({
  open,
  onClose,
  initialRoomId = null,
}: Props) {
  const roomSpreads = useMemo(
    () => expandEstateGuideToRoomSpreads(ESTATE_GUIDE_SPREADS),
    [],
  );
  const startIndex = indexForRoomId(roomSpreads, initialRoomId);
  const [phase, setPhase] = useState<FlipPhase>(
    initialRoomId ? "spread" : "cover",
  );
  const [spreadIndex, setSpreadIndex] = useState(startIndex);
  const [spreadFading, setSpreadFading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const spreadRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [fitScale, setFitScale] = useState(1);

  const roomSpread = roomSpreads[spreadIndex] as EstateGuideRoomSpread | undefined;
  const atStart = spreadIndex <= 0;
  const atEnd = spreadIndex >= roomSpreads.length - 1;

  const resetBook = useCallback(() => {
    setPhase("cover");
    setSpreadIndex(0);
    setSpreadFading(false);
  }, []);

  const goToSpread = useCallback(
    (nextIndex: number) => {
      if (nextIndex === spreadIndex) return;
      if (nextIndex < 0 || nextIndex >= roomSpreads.length) return;

      setSpreadFading(true);
      window.setTimeout(() => {
        setSpreadIndex(nextIndex);
        window.setTimeout(() => setSpreadFading(false), 40);
      }, 180);
    },
    [roomSpreads.length, spreadIndex],
  );

  useEffect(() => {
    if (!open) {
      resetBook();
      return;
    }
    if (initialRoomId) {
      const next = indexForRoomId(roomSpreads, initialRoomId);
      setPhase("spread");
      setSpreadIndex(next);
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, resetBook, initialRoomId, roomSpreads]);

  const { onBackdropClick, requestClose } = useDismissibleWindow({
    open,
    onClose,
    closeOnEscape: true,
  });

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      // Escape is owned by useDismissibleWindow (topmost-layer stack).
      if (event.key === "Escape") return;
      if (phase !== "spread" || spreadFading) return;
      if (event.key === "ArrowRight" && spreadIndex < roomSpreads.length - 1) {
        goToSpread(spreadIndex + 1);
      }
      if (event.key === "ArrowLeft" && spreadIndex > 0) {
        goToSpread(spreadIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, phase, spreadFading, spreadIndex, roomSpreads.length, goToSpread]);

  useEffect(() => {
    if (!open || phase !== "spread") {
      setFitScale(1);
      return;
    }

    const spreadEl = spreadRef.current;
    if (!spreadEl) return;

    const measureFit = () => {
      const fitTargets = spreadEl.querySelectorAll<HTMLElement>(
        ".eg-guide-room-page--photo .eg-guide-room-page__lower, .eg-guide-room-page--text .eg-guide-room-page__text-shell",
      );
      if (fitTargets.length === 0) {
        setFitScale(1);
        return;
      }

      let nextScale = 1;
      for (const fitTarget of fitTargets) {
        const previousTransform = fitTarget.style.transform;
        fitTarget.style.transform = "none";
        const available = fitTarget.clientHeight;
        const needed = fitTarget.scrollHeight;
        fitTarget.style.transform = previousTransform;

        if (available > 0 && needed > available) {
          nextScale = Math.min(nextScale, available / needed);
        }
      }

      setFitScale(Math.max(0.58, Math.min(1, nextScale)));
    };

    measureFit();
    const observer = new ResizeObserver(measureFit);
    observer.observe(spreadEl);
    for (const fitTarget of spreadEl.querySelectorAll<HTMLElement>(
      ".eg-guide-room-page--photo .eg-guide-room-page__lower, .eg-guide-room-page--text .eg-guide-room-page__text-shell",
    )) {
      observer.observe(fitTarget);
    }
    window.addEventListener("resize", measureFit);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureFit);
    };
  }, [open, phase, spreadIndex, spreadFading]);

  const openToFirstSpread = useCallback(() => {
    setPhase("spread");
    setSpreadIndex(0);
  }, []);

  const goNext = useCallback(() => {
    if (phase !== "spread" || atEnd || spreadFading) return;
    goToSpread(spreadIndex + 1);
  }, [phase, atEnd, spreadFading, goToSpread, spreadIndex]);

  const goPrev = useCallback(() => {
    if (phase !== "spread" || atStart || spreadFading) return;
    goToSpread(spreadIndex - 1);
  }, [phase, atStart, spreadFading, goToSpread, spreadIndex]);

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null || phase !== "spread" || spreadFading) return;
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
        aria-label="Close Spark Estate Guide"
        data-testid="estate-guide-backdrop"
        onClick={(event) => onBackdropClick(event)}
      />

      <button
        type="button"
        className="eg-flipbook__close"
        onClick={() => requestClose()}
        aria-label="Close Spark Estate Guide"
        data-testid="estate-guide-close"
      >
        <span aria-hidden="true">×</span>
      </button>

      <div className="eg-flipbook__shell">
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
                  loading="eager"
                  fetchPriority="high"
                />
                <span className="eg-flipbook__cover-hint">Open guide</span>
              </button>
            </div>
          ) : roomSpread ? (
            <div className="eg-flipbook__book">
              <div className="eg-flipbook__volume" aria-hidden="true">
                <span className="eg-flipbook__board eg-flipbook__board--back" />
                <BookPageStack side="left" />
                <BookPageStack side="right" />
              </div>

              <div
                ref={spreadRef}
                className={[
                  "eg-flipbook__spread-view",
                  "eg-flipbook__spread-view--room-spread",
                  spreadFading ? "eg-flipbook__spread-view--fading" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={roomSpread.roomTitle}
                style={
                  {
                    "--eg-fit-scale": fitScale,
                    "--eg-remaining-spreads": Math.max(
                      1,
                      roomSpreads.length - spreadIndex - 1,
                    ),
                  } as CSSProperties
                }
              >
                <GuideRoomSpread roomSpread={roomSpread} />
              </div>

              <button
                type="button"
                className="eg-flipbook__arrow eg-flipbook__arrow--prev"
                onClick={goPrev}
                disabled={atStart || spreadFading}
                aria-label="Previous spread"
              >
                <span className="eg-flipbook__arrow-glyph" aria-hidden="true">
                  ‹
                </span>
              </button>
              <button
                type="button"
                className="eg-flipbook__arrow eg-flipbook__arrow--next"
                onClick={goNext}
                disabled={atEnd || spreadFading}
                aria-label="Next spread"
              >
                <span className="eg-flipbook__arrow-glyph" aria-hidden="true">
                  ›
                </span>
              </button>

              <p className="eg-flipbook__spread-meta" aria-live="polite">
                <span className="eg-flipbook__sr-only">
                  {estateGuideRoomSpreadLabel(
                    roomSpread,
                    spreadIndex,
                    roomSpreads.length,
                  )}
                  .{" "}
                </span>
                {roomSpread.roomTitle} · {spreadIndex + 1} of {roomSpreads.length}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
