"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  computeGardenBannerDropdownPosition,
  type GardenBannerDropdownSide,
} from "@/lib/peacefulPlaces/gardenBannerDropdownPosition";

type Props = {
  anchorRef: RefObject<HTMLElement | null>;
  side: GardenBannerDropdownSide;
  open: boolean;
  children: ReactNode;
  onMenuPointerEnter?: () => void;
  onMenuPointerLeave?: () => void;
};

export function GardenBannerDropdown({
  anchorRef,
  side,
  open,
  children,
  onMenuPointerEnter,
  onMenuPointerLeave,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !mounted) return;

    function updatePosition() {
      const anchor = anchorRef.current;
      const menu = menuRef.current;
      if (!anchor || !menu) return;

      const anchorRect = anchor.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      setPosition(
        computeGardenBannerDropdownPosition(
          anchorRect,
          { width: menuRect.width, height: menuRect.height },
          side,
        ),
      );
    }

    updatePosition();
    const frame = requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const observer = menuRef.current ? new ResizeObserver(updatePosition) : null;
    if (menuRef.current && observer) {
      observer.observe(menuRef.current);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      observer?.disconnect();
    };
  }, [anchorRef, children, mounted, open, side]);

  if (!mounted || !open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={menuRef}
      className="garden-banner-dropdown"
      data-garden-banner-dropdown="1"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 9999,
      }}
      onPointerEnter={onMenuPointerEnter}
      onPointerLeave={onMenuPointerLeave}
    >
      {children}
    </div>,
    document.body,
  );
}
