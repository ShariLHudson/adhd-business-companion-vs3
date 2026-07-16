"use client";

import { lazy, Suspense, useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { SparkEstateGuideAnchor } from "./SparkEstateGuideAnchor";
/** Loading overlay styles — full flipbook CSS arrives with the lazy chunk. */
import "@/components/estate-guide/estate-guide-flipbook.css";

type FlipbookProps = {
  open: boolean;
  onClose: () => void;
  /** Optional room/spread id to open when the book loads. */
  initialRoomId?: string | null;
};

const EstateGuideFlipbookLazy = lazy(async () => {
  const mod = await import("@/components/estate-guide/EstateGuideFlipbook");
  return { default: mod.EstateGuideFlipbook as ComponentType<FlipbookProps> };
});

type Props = {
  /** When false, only sign-in and other blocking overlays hide the guidebook. */
  visible: boolean;
  flipbookOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  /** Open to a specific room section when provided. */
  initialRoomId?: string | null;
};

/**
 * Portaled guidebook chrome — lightweight cover anchor (bottom left).
 * The full two-page flipbook is dynamically imported only when opened.
 */
export function SparkEstateGuideChrome({
  visible,
  flipbookOpen,
  onOpen,
  onClose,
  initialRoomId = null,
}: Props) {
  const [mounted, setMounted] = useState(false);
  /** Keep the lazy chunk mounted briefly after close so return feels instant. */
  const [flipbookMounted, setFlipbookMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (flipbookOpen) {
      setFlipbookMounted(true);
      return;
    }
    if (!flipbookMounted) return;
    const timer = window.setTimeout(() => setFlipbookMounted(false), 400);
    return () => window.clearTimeout(timer);
  }, [flipbookOpen, flipbookMounted]);

  if (!mounted || !visible) return null;

  return createPortal(
    <>
      {!flipbookOpen ? <SparkEstateGuideAnchor onClick={onOpen} /> : null}
      {flipbookMounted ? (
        <Suspense
          fallback={
            flipbookOpen ? (
              <div
                className="eg-flipbook eg-flipbook--loading"
                role="status"
                aria-live="polite"
                data-testid="estate-guide-loading"
              >
                <p className="eg-flipbook__loading-label">Opening the Guide…</p>
              </div>
            ) : null
          }
        >
          <EstateGuideFlipbookLazy
            open={flipbookOpen}
            onClose={onClose}
            initialRoomId={initialRoomId}
          />
        </Suspense>
      ) : null}
    </>,
    document.body,
  );
}
