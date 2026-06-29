"use client";

import { useEffect, useId, useRef, useState } from "react";
import { companionNavHref } from "@/lib/companionNavUrl";
import type { CoachingMode } from "@/lib/companionPrompt";
import type { HomesteadSignpostItem } from "@/lib/homesteadSignpost";
import { SidebarVictorianLampPostSvg } from "@/components/companion/homesteadSignpost/SidebarVictorianLampPostSvg";

type Props = {
  destinations: readonly HomesteadSignpostItem[];
  otherMenuItems: readonly HomesteadSignpostItem[];
  isItemActive: (item: HomesteadSignpostItem) => boolean;
  onSelect: (nav: HomesteadSignpostItem["id"], mode?: CoachingMode) => void;
};

function SignChains() {
  return (
    <div className="homestead-signpost__chains" aria-hidden="true">
      <span className="homestead-signpost__chain" />
      <span className="homestead-signpost__chain" />
    </div>
  );
}

function OtherSign({
  item,
  menuItems,
  active,
  swayIndex,
  onSelect,
}: {
  item: HomesteadSignpostItem;
  menuItems: readonly HomesteadSignpostItem[];
  active: boolean;
  swayIndex: number;
  onSelect: (nav: HomesteadSignpostItem["id"], mode?: CoachingMode) => void;
}) {
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
        "homestead-signpost__sign-wrap",
        "homestead-signpost__sign-wrap--menu",
        `homestead-signpost__sign-wrap--sway-${(swayIndex % 5) + 1}`,
      ].join(" ")}
    >
      <SignChains />
      <div
        className={[
          "homestead-signpost__plaque",
          "homestead-signpost__plaque--menu",
          isLit ? "homestead-signpost__plaque--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
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
          className="homestead-signpost__plaque-link"
        >
          <span className="homestead-signpost__plaque-label">{item.label}</span>
        </a>
        <button
          type="button"
          className="homestead-signpost__plaque-toggle"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-label={`${item.label} menu`}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="homestead-signpost__plaque-toggle-mark" aria-hidden="true">
            +
          </span>
        </button>
      </div>
      {open ? (
        <div
          id={listId}
          role="menu"
          aria-label={`${item.label} resources`}
          className="homestead-signpost__submenu"
        >
          {menuItems.map((entry) => (
            <div key={entry.id} className="homestead-signpost__sign-wrap homestead-signpost__sign-wrap--sub">
              <SignChains />
              <button
                type="button"
                role="menuitem"
                className="homestead-signpost__plaque homestead-signpost__plaque--sub"
                onClick={() => {
                  setOpen(false);
                  onSelect(entry.id, entry.mode);
                }}
              >
                <span className="homestead-signpost__plaque-label">{entry.label}</span>
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DestinationSign({
  item,
  active,
  swayIndex,
  onSelect,
}: {
  item: HomesteadSignpostItem;
  active: boolean;
  swayIndex: number;
  onSelect: (nav: HomesteadSignpostItem["id"], mode?: CoachingMode) => void;
}) {
  const href = companionNavHref(item.id, item.mode);

  return (
    <div
      className={[
        "homestead-signpost__sign-wrap",
        `homestead-signpost__sign-wrap--sway-${(swayIndex % 5) + 1}`,
      ].join(" ")}
    >
      <SignChains />
      <a
        href={href}
        data-nav-id={item.id}
        data-sign-tier={item.tier}
        {...(item.mode ? { "data-nav-mode": item.mode } : {})}
        onClick={(e) => {
          e.preventDefault();
          onSelect(item.id, item.mode);
        }}
        title={item.label}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className={[
          "homestead-signpost__plaque",
          active ? "homestead-signpost__plaque--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="homestead-signpost__plaque-label">{item.label}</span>
      </a>
    </div>
  );
}

/** Victorian wrought-iron lamppost + hanging estate plaques. */
export function HomesteadSignpost({
  destinations,
  otherMenuItems,
  isItemActive,
  onSelect,
}: Props) {
  return (
    <div className="homestead-signpost" aria-label="Navigation">
      <div className="homestead-signpost__arm" aria-hidden="true" />
      <div className="homestead-signpost__post" aria-hidden="true">
        <SidebarVictorianLampPostSvg idPrefix="homestead-sidebar-lamp" />
      </div>
      <nav className="homestead-signpost__signs" aria-label="Destinations">
        {destinations.map((item, index) =>
          item.id === "other" ? (
            <OtherSign
              key={item.id}
              item={item}
              menuItems={otherMenuItems}
              active={isItemActive(item)}
              swayIndex={index}
              onSelect={onSelect}
            />
          ) : (
            <DestinationSign
              key={item.id}
              item={item}
              active={isItemActive(item)}
              swayIndex={index}
              onSelect={onSelect}
            />
          ),
        )}
      </nav>
    </div>
  );
}
