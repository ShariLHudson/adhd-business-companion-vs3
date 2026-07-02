"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ESTATE_MENU_SECTION_IDS,
  ESTATE_MENU_SECTION_LABELS,
  estateMenuItemsForSection,
  type EstateMenuActionId,
} from "@/lib/estateMenu";
import { getPrefs } from "@/lib/companionStore";
import {
  userProfileImageUrl,
  userProfileInitials,
} from "@/lib/userProfileDisplay";
import {
  MENU_DROPDOWN_ITEM_LG,
  MENU_SECTION_HEADING,
} from "@/lib/menuNavStyles";

export type GlobalEstateMenuProps = {
  onAction: (actionId: EstateMenuActionId) => void;
  /** topbar = inline in TopBar; floating = fixed upper-right for immersive rooms */
  variant?: "topbar" | "floating";
  className?: string;
};

function useUserProfileDisplay() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    const sync = () => {
      setImageUrl(userProfileImageUrl());
      setInitials(userProfileInitials());
    };
    sync();
    window.addEventListener("companion-prefs-updated", sync);
    return () => window.removeEventListener("companion-prefs-updated", sync);
  }, []);

  return { imageUrl, initials, name: getPrefs().name };
}

export function GlobalEstateMenu({
  onAction,
  variant = "topbar",
  className = "",
}: GlobalEstateMenuProps) {
  const { imageUrl, initials, name } = useUserProfileDisplay();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function close() {
    setOpen(false);
  }

  function run(actionId: EstateMenuActionId) {
    close();
    onAction(actionId);
  }

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("click", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const triggerClass =
    variant === "floating"
      ? "global-estate-menu__trigger global-estate-menu__trigger--floating"
      : "global-estate-menu__trigger";

  const panelClass =
    variant === "floating"
      ? "global-estate-menu__panel global-estate-menu__panel--floating"
      : "global-estate-menu__panel";

  const rootClass =
    variant === "floating"
      ? `global-estate-menu-anchor ${className}`.trim()
      : `relative z-50 ${className}`.trim();

  const displayName = name?.trim() || "Your Estate";

  const menu = (
    <div
      ref={rootRef}
      className={rootClass}
      data-companion-menu-layer="true"
      data-estate-menu=""
      data-estate-menu-variant={variant}
      data-testid="global-estate-menu"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Profile and settings"
        title="Profile and settings"
        className={triggerClass}
        data-estate-menu-trigger=""
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="global-estate-menu__avatar-image"
          />
        ) : (
          <span className="global-estate-menu__avatar-fallback" aria-hidden>
            {initials}
          </span>
        )}
        <span className="global-estate-menu__dots" aria-hidden>
          ⋯
        </span>
      </button>

      {open ? (
        <div
          className={panelClass}
          role="menu"
          aria-label="Estate menu"
          data-companion-menu-panel="true"
          data-estate-menu-panel=""
        >
          <div className="global-estate-menu__header">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="global-estate-menu__header-avatar"
              />
            ) : (
              <span
                className="global-estate-menu__header-avatar global-estate-menu__header-avatar--fallback"
                aria-hidden
              >
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <p className="global-estate-menu__header-name">{displayName}</p>
              <p className="global-estate-menu__header-sub">Estate Menu</p>
            </div>
          </div>

          {ESTATE_MENU_SECTION_IDS.map((sectionId, sectionIndex) => {
            const items = estateMenuItemsForSection(sectionId);
            return (
              <div
                key={sectionId}
                className={
                  sectionIndex > 0
                    ? "global-estate-menu__section global-estate-menu__section--bordered"
                    : "global-estate-menu__section"
                }
              >
                <p className={`${MENU_SECTION_HEADING} global-estate-menu__section-label`}>
                  {ESTATE_MENU_SECTION_LABELS[sectionId]}
                </p>
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    title={item.hint}
                    onClick={() => run(item.id)}
                    className={`${MENU_DROPDOWN_ITEM_LG} global-estate-menu__item${
                      item.id === "log-out"
                        ? " global-estate-menu__item--logout"
                        : ""
                    }`}
                    data-estate-menu-item={item.id}
                  >
                    <span className="global-estate-menu__item-emoji" aria-hidden>
                      {item.emoji}
                    </span>
                    <span className="global-estate-menu__item-label">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );

  if (variant === "floating") {
    if (!mounted) return null;
    return createPortal(menu, document.body);
  }

  return menu;
}
