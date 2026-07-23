"use client";

import type { ReactNode } from "react";

export type EstateDropdownMenuSectionProps = {
  sectionId: string;
  expanded: boolean;
  children: ReactNode;
};

/** Collapsible section wrapper — matches Welcome Home room menu sections. */
export function EstateDropdownMenuSection({
  sectionId,
  expanded,
  children,
}: EstateDropdownMenuSectionProps) {
  return (
    <div
      className={[
        "estate-room-experience-menu__section",
        expanded ? "estate-room-experience-menu__section--open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-estate-menu-section={sectionId}
    >
      {children}
    </div>
  );
}

export type EstateDropdownMenuCategoryRowProps = {
  label: string;
  expanded?: boolean;
  onClick: () => void;
  testId?: string;
};

/** Category row with chevron — expand/collapse or direct navigation. */
export function EstateDropdownMenuCategoryRow({
  label,
  expanded = false,
  onClick,
  testId,
}: EstateDropdownMenuCategoryRowProps) {
  return (
    <button
      type="button"
      className="estate-room-experience-menu__category"
      aria-expanded={expanded}
      data-testid={testId}
      onClick={onClick}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <span className="estate-room-experience-menu__category-label">{label}</span>
      <span className="estate-room-experience-menu__category-chevron" aria-hidden>
        ›
      </span>
    </button>
  );
}

export type EstateDropdownMenuActionRowProps = {
  label: string;
  icon?: string;
  onClick: () => void;
  testId?: string;
  menuItemId?: string;
  showChevron?: boolean;
  variant?: "default" | "logout";
  /** For Companion On/Off — exposes pressed state to assistive tech */
  ariaPressed?: boolean;
  ariaLabel?: string;
};

/** Pill-shaped action row — nested submenu items and flat actions. */
export function EstateDropdownMenuActionRow({
  label,
  icon,
  onClick,
  testId,
  menuItemId,
  showChevron = false,
  variant = "default",
  ariaPressed,
  ariaLabel,
}: EstateDropdownMenuActionRowProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={[
        "estate-room-experience-menu__item",
        "global-estate-menu__action-row",
        variant === "logout" ? "global-estate-menu__action-row--logout" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid={testId}
      data-estate-menu-item={menuItemId}
      aria-pressed={ariaPressed}
      aria-label={ariaLabel}
      onClick={onClick}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <span className="global-estate-menu__action-row-main">
        {icon ? (
          <span className="estate-room-experience-menu__item-icon" aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className="estate-room-experience-menu__item-label">{label}</span>
      </span>
      {showChevron ? (
        <span className="global-estate-menu__action-chevron" aria-hidden>
          ›
        </span>
      ) : null}
    </button>
  );
}

export type EstateDropdownMenuValueRowProps = {
  label: string;
  value: string;
  onClick: () => void;
  testId?: string;
};

/** Settings-style row — label left, current value + chevron right. */
export function EstateDropdownMenuValueRow({
  label,
  value,
  onClick,
  testId,
}: EstateDropdownMenuValueRowProps) {
  return (
    <button
      type="button"
      className={[
        "estate-room-experience-menu__item",
        "global-estate-menu__action-row",
        "estate-dropdown-menu__value-row",
      ].join(" ")}
      data-testid={testId}
      onClick={onClick}
    >
      <span className="estate-room-experience-menu__item-label estate-dropdown-menu__value-row-label">
        {label}
      </span>
      <span className="estate-dropdown-menu__value-row-meta">
        <span className="estate-dropdown-menu__value-row-value" title={value}>
          {value}
        </span>
        <span className="global-estate-menu__action-chevron" aria-hidden>
          ›
        </span>
      </span>
    </button>
  );
}

export type EstateDropdownMenuSectionItemsProps = {
  label: string;
  children: ReactNode;
};

/** Indented nested items container. */
export function EstateDropdownMenuSectionItems({
  label,
  children,
}: EstateDropdownMenuSectionItemsProps) {
  return (
    <div
      className="estate-room-experience-menu__section-items"
      role="group"
      aria-label={label}
    >
      {children}
    </div>
  );
}
