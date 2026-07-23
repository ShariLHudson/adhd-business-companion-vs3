"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  EstateDropdownMenuActionRow,
  EstateDropdownMenuCategoryRow,
  EstateDropdownMenuSection,
  EstateDropdownMenuSectionItems,
} from "@/components/companion/estate/EstateDropdownMenuPrimitives";
import { useCompanionVisibility } from "@/components/companion/CompanionVisibilityContext";
import {
  ESTATE_MENU_DROPDOWN_ENTRIES,
  type EstateMenuActionId,
} from "@/lib/estateMenu";
import {
  companionVisibilityAriaLabel,
  companionVisibilityLabel,
} from "@/lib/conversationVisibility";
import {
  userProfileDisplayName,
  userProfileImageUrl,
  userProfileInitials,
  userProfileMenuGreeting,
} from "@/lib/userProfileDisplay";

export type GlobalEstateMenuProps = {
  onAction: (actionId: EstateMenuActionId) => void;
  /** topbar = inline in TopBar; floating = fixed upper-right for immersive rooms */
  variant?: "topbar" | "floating";
  /** When true, render inline inside EstateTopRightChrome (no separate portal). */
  embedded?: boolean;
  className?: string;
};

type ExpandedGroupId = "conversations" | "my-spark-estate" | "profile";

type ProfileDisplayState = {
  imageUrl: string | null;
  initials: string;
  displayName: string;
  greeting: { line1: string; line2: string };
};

function useUserProfileDisplay(): ProfileDisplayState {
  const [state, setState] = useState<ProfileDisplayState>(() => ({
    imageUrl: null,
    initials: "",
    displayName: "Member",
    greeting: userProfileMenuGreeting(),
  }));

  useEffect(() => {
    const sync = () => {
      setState({
        imageUrl: userProfileImageUrl(),
        initials: userProfileInitials(),
        displayName: userProfileDisplayName(),
        greeting: userProfileMenuGreeting(),
      });
    };
    sync();
    window.addEventListener("companion-prefs-updated", sync);
    return () => window.removeEventListener("companion-prefs-updated", sync);
  }, []);

  return state;
}

function GenericProfileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="1.1em"
      height="1.1em"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M12 12a4.25 4.25 0 1 0-4.25-4.25A4.25 4.25 0 0 0 12 12Zm0 1.75c-3.4 0-7.25 1.7-7.25 4.25V19.5A1.25 1.25 0 0 0 6 20.75h12a1.25 1.25 0 0 0 1.25-1.25v-1.5c0-2.55-3.85-4.25-7.25-4.25Z"
      />
    </svg>
  );
}

function AvatarFace({
  imageUrl,
  initials,
  imageClassName,
  fallbackClassName,
}: {
  imageUrl: string | null;
  initials: string;
  imageClassName: string;
  fallbackClassName: string;
}): ReactNode {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt="" className={imageClassName} />
    );
  }
  if (initials) {
    return (
      <span className={fallbackClassName} aria-hidden>
        {initials}
      </span>
    );
  }
  return (
    <span className={`${fallbackClassName} global-estate-menu__avatar-icon`} aria-hidden>
      <GenericProfileIcon />
    </span>
  );
}

export function GlobalEstateMenu({
  onAction,
  variant = "topbar",
  embedded = false,
  className = "",
}: GlobalEstateMenuProps) {
  const { imageUrl, initials, displayName, greeting } = useUserProfileDisplay();
  const companionVisibility = useCompanionVisibility();
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<ExpandedGroupId | null>(null);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const onActionRef = useRef(onAction);

  function labelForMenuAction(
    actionId: EstateMenuActionId,
    fallback: string,
  ): string {
    if (actionId === "toggle-companion-visibility") {
      if (!companionVisibility?.showControls) return fallback;
      return companionVisibilityLabel(companionVisibility.visibility);
    }
    return fallback;
  }

  function shouldShowMenuChild(actionId: EstateMenuActionId): boolean {
    if (actionId === "toggle-companion-visibility") {
      return Boolean(companionVisibility?.showControls);
    }
    return true;
  }

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
        aria-label="Open profile menu"
        title="Profile menu"
        className={triggerClass}
        data-estate-menu-trigger=""
        data-top-bar-menu="account"
        data-testid="global-estate-menu-trigger"
      >
        <AvatarFace
          imageUrl={imageUrl}
          initials={initials}
          imageClassName="global-estate-menu__avatar-image global-estate-menu__avatar-image--trigger"
          fallbackClassName="global-estate-menu__trigger-initials"
        />
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
            <AvatarFace
              imageUrl={imageUrl}
              initials={initials}
              imageClassName="global-estate-menu__header-avatar"
              fallbackClassName="global-estate-menu__header-avatar global-estate-menu__header-avatar--fallback"
            />
            <div className="global-estate-menu__header-copy">
              <p
                className="global-estate-menu__header-greeting"
                data-testid="global-estate-menu-greeting"
              >
                {greeting.line1}
              </p>
              <p className="global-estate-menu__header-sub">{greeting.line2}</p>
              {displayName && displayName !== "Member" ? (
                <p className="global-estate-menu__header-name">{displayName}</p>
              ) : null}
            </div>
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
                        {entry.children
                          .filter((child) => shouldShowMenuChild(child.id))
                          .map((child) => (
                            <EstateDropdownMenuActionRow
                              key={child.id}
                              label={labelForMenuAction(child.id, child.label)}
                              icon={child.emoji}
                              showChevron
                              testId={`global-estate-menu-item-${child.id}`}
                              menuItemId={child.id}
                              ariaPressed={
                                child.id === "toggle-companion-visibility"
                                  ? companionVisibility?.visibility === "on"
                                  : undefined
                              }
                              ariaLabel={
                                child.id === "toggle-companion-visibility" &&
                                companionVisibility
                                  ? companionVisibilityAriaLabel(
                                      companionVisibility.visibility,
                                    )
                                  : undefined
                              }
                              onClick={() => closeAndRun(child.id)}
                            />
                          ))}
                      </EstateDropdownMenuSectionItems>
                    ) : null}
                  </EstateDropdownMenuSection>
                );
              }

              if (entry.id === "settings" || entry.id === "experience-controls") {
                return (
                  <EstateDropdownMenuCategoryRow
                    key={entry.id}
                    label={entry.label}
                    testId={`global-estate-menu-item-${entry.id}`}
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
