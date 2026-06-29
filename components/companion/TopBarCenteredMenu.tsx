"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { CompanionObjectVisual } from "@/components/companion/CompanionObjectVisual";
import { MENU_DROPDOWN_ROW, TOP_BAR_SIGN_BTN } from "@/lib/menuNavStyles";

export type CenteredMenuItem = {
  id: string;
  label: string;
  objectId: string;
  onSelect: () => void;
};

type Props = {
  menuId: string;
  triggerObjectId: string;
  label: string;
  items: CenteredMenuItem[];
  badge?: number;
  showCaret?: boolean;
  active?: boolean;
};

const VIEWPORT_INSET_PX = 32;
const PANEL_MIN_WIDTH_PX = 208;
const PANEL_MAX_WIDTH_PX = 260;

export function TopBarCenteredMenu({
  menuId,
  label,
  items,
  badge,
  showCaret = true,
  active = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const isActive = active;

  useEffect(() => {
    if (!open) return;

    function positionPanel() {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;

      const triggerRect = trigger.getBoundingClientRect();
      const panelWidth = Math.min(
        PANEL_MAX_WIDTH_PX,
        Math.max(PANEL_MIN_WIDTH_PX, panel.offsetWidth || PANEL_MIN_WIDTH_PX),
      );
      const centerX = triggerRect.left + triggerRect.width / 2;
      let left = centerX - panelWidth / 2;
      left = Math.max(
        VIEWPORT_INSET_PX,
        Math.min(left, window.innerWidth - VIEWPORT_INSET_PX - panelWidth),
      );

      setPanelStyle({
        left: `${left - triggerRect.left}px`,
        width: `${panelWidth}px`,
        transform: "none",
      });
    }

    positionPanel();
    window.addEventListener("resize", positionPanel);
    return () => window.removeEventListener("resize", positionPanel);
  }, [open, items.length]);

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
    <div ref={rootRef} className="top-bar-centered-menu relative z-50">
      <button
        ref={triggerRef}
        type="button"
        className={`${TOP_BAR_SIGN_BTN}${isActive ? " top-bar-homestead-sign--active" : ""}`}
        title={label}
        aria-label={badge ? `${label}, ${badge} active items` : label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        data-top-bar-menu={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="top-bar-homestead-sign__hanger" aria-hidden="true" />
        <span className="top-bar-homestead-sign__lantern-glow" aria-hidden="true" />
        <span className="top-bar-homestead-sign__board">
          <span className="top-bar-homestead-sign__label">{label}</span>
          {badge != null && badge > 0 ? (
            <span className="top-bar-homestead-sign__badge">{badge}</span>
          ) : null}
          {showCaret ? (
            <span className="top-bar-centered-menu__caret" aria-hidden="true">
              ▾
            </span>
          ) : null}
        </span>
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={listId}
          role="menu"
          aria-label={label}
          className="top-bar-centered-menu__panel"
          style={panelStyle}
          data-top-bar-menu-panel={menuId}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={MENU_DROPDOWN_ROW}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              <CompanionObjectVisual objectId={item.objectId} size="xs" variant="icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
