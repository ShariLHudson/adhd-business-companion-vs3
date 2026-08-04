"use client";

import { useState } from "react";
import {
  ASSETS,
  BRAND,
  GROWTH_MENU,
  GROWTH_VAULT_SECTIONS,
  MORE_NAV,
  SECTION_NAV,
  SIDEBAR_NAV,
  normalizeSidebarNav,
  type AppSection,
  type SidebarNavId,
} from "@/lib/companionUi";
import { companionNavHref } from "@/lib/companionNavUrl";
import {
  MENU_NAV_LINK,
  MENU_NAV_LINK_LABEL,
  MENU_SECTION_HEADING,
  MENU_TEXT_HOVER,
} from "@/lib/menuNavStyles";
import type { CoachingMode } from "@/lib/companionPrompt";

type AppSidebarProps = {
  activeNav: SidebarNavId;
  activeSection: AppSection;
  workspacePanel?: AppSection | null;
  onNavSelect: (nav: SidebarNavId, mode?: CoachingMode) => void;
};

export function AppSidebar({
  activeNav,
  activeSection,
  workspacePanel = null,
  onNavSelect,
}: AppSidebarProps) {
  const effectiveSection = workspacePanel ?? activeSection;
  const normalizedActiveNav = normalizeSidebarNav(activeNav);
  const moreActive = MORE_NAV.some(
    (item) =>
      SECTION_NAV[item.id] === activeSection || normalizedActiveNav === item.id,
  );
  const [moreOpen, setMoreOpen] = useState(false);
  const showMore = moreOpen || moreActive;

  const growthVaultActive =
    activeSection === "growth-vault" ||
    GROWTH_VAULT_SECTIONS.includes(activeSection);
  const outcomeGoalsActive = activeSection === "outcome-goals";
  const growthBranchActive =
    normalizedActiveNav === "growth" ||
    growthVaultActive ||
    outcomeGoalsActive;
  const [growthOpen, setGrowthOpen] = useState(false);
  const showGrowth = growthOpen || growthBranchActive;

  function renderItem(item: {
    id: SidebarNavId;
    label: string;
    emoji: string;
    mode?: CoachingMode;
  }) {
    if (item.id === "growth") {
      return (
        <div key="growth-branch">
          <button
            type="button"
            onClick={() => setGrowthOpen((o) => !o)}
            aria-expanded={showGrowth}
            title="Growth"
            aria-label="Growth"
            className={`${MENU_NAV_LINK} w-full ${
              growthBranchActive ? "companion-nav-active shadow-sm" : MENU_TEXT_HOVER
            }`}
          >
            <span
              aria-hidden="true"
              className="relative flex w-6 shrink-0 justify-center"
            >
              {item.emoji}
            </span>
            <span className={`${MENU_NAV_LINK_LABEL} flex-1 text-left`}>
              {item.label}
            </span>
            <span aria-hidden className="hidden text-xs md:inline">
              {showGrowth ? "▾" : "▸"}
            </span>
          </button>
          {showGrowth ? (
            <div className="mt-1 flex flex-col gap-1 md:pl-2">
              {GROWTH_MENU.map((child) => {
                const childActive =
                  child.id === "growth-vault"
                    ? growthVaultActive
                    : outcomeGoalsActive;
                return (
                  <a
                    key={child.id}
                    href={companionNavHref(child.id)}
                    data-nav-id={child.id}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavSelect(child.id);
                    }}
                    title={child.label}
                    aria-label={child.label}
                    aria-current={childActive ? "page" : undefined}
                    className={`${MENU_NAV_LINK} ${
                      childActive ? "companion-nav-active shadow-sm" : MENU_TEXT_HOVER
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="relative flex w-6 shrink-0 justify-center"
                    >
                      {child.emoji}
                    </span>
                    <span className={MENU_NAV_LINK_LABEL}>{child.label}</span>
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
      );
    }

    const sectionFor = SECTION_NAV[item.id];
    const active = sectionFor
      ? effectiveSection === sectionFor ||
        (item.id === "today" && effectiveSection === "plan-my-day") ||
        (activeSection === "home" && normalizedActiveNav === item.id)
      : normalizedActiveNav === item.id && activeSection === "home";
    const href = companionNavHref(item.id, item.mode);
    return (
      <a
        key={item.id}
        href={href}
        data-nav-id={item.id}
        {...(item.mode ? { "data-nav-mode": item.mode } : {})}
        onClick={(e) => {
          e.preventDefault();
          onNavSelect(item.id, item.mode);
        }}
        title={item.label}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className={`${MENU_NAV_LINK} ${
          active ? "companion-nav-active shadow-sm" : MENU_TEXT_HOVER
        }`}
      >
        <span
          aria-hidden="true"
          className="relative flex w-6 shrink-0 justify-center"
        >
          {item.emoji}
        </span>
        <span className={MENU_NAV_LINK_LABEL}>{item.label}</span>
      </a>
    );
  }

  return (
    <aside
      className="companion-app-sidebar relative flex h-dvh w-14 shrink-0 flex-col overflow-y-auto border-r border-black/10 text-black backdrop-blur-md md:w-44"
      aria-label="Navigation"
    >
      <div className="flex items-center gap-2 border-b border-black/10 px-2 py-3.5 md:px-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ASSETS.logo}
          alt=""
          className="h-7 w-7 shrink-0 rounded object-contain"
        />
        <span className="hidden text-sm font-semibold leading-tight text-black md:inline">
          {BRAND.name}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {SIDEBAR_NAV.map(renderItem)}

        {MORE_NAV.length > 0 ? (
          <>
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={showMore}
              title="More sections"
              aria-label="More sections"
              className={`mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-black/10 px-2 py-2.5 text-left leading-tight ${MENU_TEXT_HOVER} transition-colors hover:bg-black/5 md:justify-start md:px-3`}
            >
              <span
                aria-hidden="true"
                className="flex w-6 shrink-0 justify-center"
              >
                {showMore ? "▾" : "⋯"}
              </span>
              <span className={MENU_NAV_LINK_LABEL}>More</span>
            </button>
            {showMore ? (
              <div className="flex flex-col gap-1 md:pl-2">
                {MORE_NAV.map(renderItem)}
              </div>
            ) : null}
          </>
        ) : null}
      </nav>

      <div className="border-t border-black/10 p-2">
        <p className={`hidden px-2 pb-1 pt-0.5 md:block ${MENU_SECTION_HEADING}`}>
          Open in Google
        </p>
        {[
          { l: "📅", t: "Calendar", u: "https://calendar.google.com" },
          { l: "📝", t: "Docs", u: "https://docs.google.com" },
          { l: "📊", t: "Sheets", u: "https://sheets.google.com" },
          { l: "📁", t: "Drive", u: "https://drive.google.com" },
        ].map((g) => (
          <a
            key={g.t}
            href={g.u}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open Google ${g.t}`}
            aria-label={`Open Google ${g.t}`}
            className={`${MENU_NAV_LINK} py-2 ${MENU_TEXT_HOVER}`}
          >
            <span aria-hidden="true" className="flex w-6 shrink-0 justify-center">
              {g.l}
            </span>
            <span className="hidden text-base font-medium text-black md:inline">
              {g.t}
            </span>
          </a>
        ))}
      </div>
    </aside>
  );
}
