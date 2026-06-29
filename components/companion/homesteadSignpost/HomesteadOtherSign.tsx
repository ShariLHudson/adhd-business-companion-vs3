"use client";

import { useEffect, useId, useRef, useState } from "react";
import { companionNavHref } from "@/lib/companionNavUrl";
import { primeWelcomeRoomAudioFromGesture } from "@/lib/welcomeAudio/welcomeRoomAudioSession";
import { markWelcomeRoomOpenedWithGesture } from "@/lib/welcomeRoom/welcomeRoomGesture";
import type { HomesteadSignpostItem } from "@/lib/homesteadSignpost";
import type { CoachingMode } from "@/lib/companionPrompt";

type Props = {
  item: HomesteadSignpostItem;
  menuItems: readonly HomesteadSignpostItem[];
  active: boolean;
  swayIndex: number;
  onSelect: (nav: HomesteadSignpostItem["id"], mode?: CoachingMode) => void;
};

/** Other destination — hanging sign with knowledge dropdown. */
export function HomesteadOtherSign({
  item,
  menuItems,
  active,
  swayIndex,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const href = companionNavHref(item.id, item.mode);
  const isLit = active || open;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={[
        "homestead-sign homestead-sign--destination homestead-sign--menu",
        isLit ? "homestead-sign--active" : "",
        `homestead-sign--sway-${(swayIndex % 5) + 1}`,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="homestead-sign__hanger" aria-hidden="true" />
      <div className="homestead-sign__board homestead-sign__board--menu">
        <a
          href={href}
          data-nav-id={item.id}
          data-sign-tier={item.tier}
          onClick={(e) => {
            e.preventDefault();
            onSelect(item.id, item.mode);
          }}
          title={item.label}
          aria-label={item.label}
          aria-current={active && !open ? "page" : undefined}
          className="homestead-sign__menu-primary"
        >
          <span className="homestead-sign__label">{item.label}</span>
        </a>
        <button
          type="button"
          className="homestead-sign__menu-toggle"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-label={`${item.label} menu`}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="homestead-sign__menu-caret" aria-hidden="true">
            ▾
          </span>
        </button>
      </div>

      {open ? (
        <div
          id={listId}
          role="menu"
          aria-label={`${item.label} resources`}
          className="homestead-sign__menu-panel"
        >
          {menuItems.map((entry) => (
            <button
              key={entry.id}
              type="button"
              role="menuitem"
              className="homestead-sign__menu-item"
              onClick={() => {
                setOpen(false);
                onSelect(entry.id, entry.mode);
              }}
              onPointerDown={() => {
                if (entry.id === "welcome-room") {
                  markWelcomeRoomOpenedWithGesture();
                  primeWelcomeRoomAudioFromGesture();
                }
              }}
            >
              {entry.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
