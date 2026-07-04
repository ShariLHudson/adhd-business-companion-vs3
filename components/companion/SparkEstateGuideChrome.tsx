"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SparkEstateGuideAnchor } from "./SparkEstateGuideAnchor";
import { EstateGuideFlipbook } from "@/components/estate-guide";

type Props = {
  /** When false, only sign-in and other blocking overlays hide the guidebook. */
  visible: boolean;
  flipbookOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

/**
 * Portaled guidebook chrome — cover anchor + flipbook overlay.
 * Fixed to the viewport so overflow-hidden shells never clip the book.
 */
export function SparkEstateGuideChrome({
  visible,
  flipbookOpen,
  onOpen,
  onClose,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !visible) return null;

  return createPortal(
    <>
      {!flipbookOpen ? <SparkEstateGuideAnchor onClick={onOpen} /> : null}
      <EstateGuideFlipbook open={flipbookOpen} onClose={onClose} />
    </>,
    document.body,
  );
}
