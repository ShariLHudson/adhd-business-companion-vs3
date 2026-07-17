"use client";

import { lazy, Suspense, useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
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
  /**
   * When false, the guide chrome stays unmounted (Welcome Home arrival).
   * Bottom-corner launcher removed — open only via Welcome Home → Spark Estate.
   */
  visible: boolean;
  flipbookOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  /** Open to a specific room section when provided. */
  initialRoomId?: string | null;
};

/**
 * Portaled Spark Estate Guide — flipbook only.
 * No bottom-corner anchor. Mounts only after explicit open.
 */
export function SparkEstateGuideChrome({
  visible,
  flipbookOpen,
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

  // Never mount on Welcome Home arrival — only when explicitly opened (or brief close fade).
  if (!mounted || !visible || (!flipbookOpen && !flipbookMounted)) return null;

  return createPortal(
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
    </Suspense>,
    document.body,
  );
}
