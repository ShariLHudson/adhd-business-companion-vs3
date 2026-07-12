"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  EstateDropdownMenuActionRow,
  EstateDropdownMenuCategoryRow,
  EstateDropdownMenuSection,
  EstateDropdownMenuSectionItems,
} from "@/components/companion/estate/EstateDropdownMenuPrimitives";
import {
  ESTATE_MENU_DROPDOWN_ENTRIES,
  type EstateMenuActionId,
} from "@/lib/estateMenu";
import { getPrefs } from "@/lib/companionStore";
import {
  userProfileImageUrl,
  userProfileInitials,
} from "@/lib/userProfileDisplay";

export type GlobalEstateMenuProps = {
  onAction: (actionId: EstateMenuActionId) => void;
  /** topbar = inline in TopBar; floating = fixed upper-right for immersive rooms */
  variant?: "topbar" | "floating";
  /** When true, render inline inside EstateTopRightChrome (no separate portal). */
  embedded?: boolean;
  className?: string;
};

type ExpandedGroupId = "conversations" | "profile";

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
  embedded = false,
  className = "",
}: GlobalEstateMenuProps) {
  const { imageUrl, initials, name } = useUserProfileDisplay();
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<ExpandedGroupId | null>(null);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const onActionRef = useRef(onAction);

  useEffect(() => {
    onActionRef.current = onAction;
  }, [onAction]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setExpandedGroup(null);
  }, []);

  /** Run destination first, then close — avoids losing the click when the panel unmounts. */
  const closeAndRun = useCallback(
    (actionId: EstateMenuActionId) => {
      onActionRef.current(actionId);
      close();
    },
    [close],
  );

  const toggleGroup = useCallback((groupId: ExpandedGroupId) => {
    setExpandedGroup((current) => (current === groupId ? null : groupId));
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDownOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", onPointerDownOutside);
    document.addEventListener("touchstart", onPointerDownOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDownOutside);
      document.removeEventListener("touchstart", onPointerDownOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);

  const triggerClass =
    variant === "floating"
      ? "global-estate-menu__trigger global-estate-menu__trigger--floating"
      : "global-estate-menu__trigger";

  const panelClass = [
    "estate-room-experience-menu__panel",
    "global-estate-menu__panel",
    variant === "floating" ? "global-estate-menu__panel--floating" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const rootClass = [
    variant === "floating"
      ? `global-estate-menu-anchor${
          embedded ? " global-estate-menu-anchor--embedded" : ""
        }`
      : "relative z-50",
    open ? "global-estate-menu--open" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const displayName = name?.trim() || "Member";

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
        aria-label={`${initials} — profile menu`}
        title="Profile"
        className={triggerClass}
        data-estate-menu-trigger=""
        data-top-bar-menu="account"
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="global-estate-menu__avatar-image global-estate-menu__avatar-image--trigger"
          />
        ) : (
          <span className="global-estate-menu__trigger-initials" aria-hidden>
            {initials}
          </span>
        )}
        <span className="global-estate-menu__trigger-chevron" aria-hidden>
          ▼
        </span>
      </button>

      {open ? (
        <div
          className={panelClass}
          role="menu"
          aria-label="Profile menu"
          data-companion-menu-panel="true"
          data-estate-menu-panel=""
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
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
            <p className="global-estate-menu__header-name">{displayName}</p>
          </div>

          <div className="global-estate-menu__list">
            {ESTATE_MENU_DROPDOWN_ENTRIES.map((entry) => {
              if (entry.kind === "group") {
                const isExpanded = expandedGroup === entry.id;
                return (
                  <EstateDropdownMenuSection
                    key={entry.id}
                    sectionId={entry.id}
                    expanded={isExpanded}
                  >
                    <EstateDropdownMenuCategoryRow
                      label={entry.label}
                      expanded={isExpanded}
                      testId={`global-estate-menu-group-${entry.id}`}
                      onClick={() => toggleGroup(entry.id)}
                    />
                    {isExpanded ? (
                      <EstateDropdownMenuSectionItems label={entry.label}>
                        {entry.children.map((child) => (
                          <EstateDropdownMenuActionRow
                            key={child.id}
                            label={child.label}
                            icon={child.emoji}
                            showChevron
                            testId={`global-estate-menu-item-${child.id}`}
                            menuItemId={child.id}
                            onClick={() => closeAndRun(child.id)}
                          />
                        ))}
                      </EstateDropdownMenuSectionItems>
                    ) : null}
                  </EstateDropdownMenuSection>
                );
              }

              if (entry.id === "settings") {
                return (
                  <EstateDropdownMenuCategoryRow
                    key={entry.id}
                    label={entry.label}
                    testId="global-estate-menu-item-settings"
                    onClick={() => closeAndRun(entry.id)}
                  />
                );
              }

              return (
                <EstateDropdownMenuActionRow
                  key={entry.id}
                  label={entry.label}
                  icon={entry.emoji}
                  variant={entry.id === "log-out" ? "logout" : "default"}
                  testId={`global-estate-menu-item-${entry.id}`}
                  menuItemId={entry.id}
                  onClick={() => closeAndRun(entry.id)}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );

  if (variant === "floating" && !embedded) {
    if (!mounted) return null;
    return createPortal(menu, document.body);
  }

  if (variant === "floating" && embedded && !mounted) {
    return null;
  }

  return menu;
}
