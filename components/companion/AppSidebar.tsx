"use client";

import { useState } from "react";
import {
  ASSETS,
  BRAND,
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
  MENU_TEXT_HOVER,
} from "@/lib/menuNavStyles";
import type { CoachingMode } from "@/lib/companionPrompt";

type AppSidebarProps = {
  activeNav: SidebarNavId;
  activeSection: AppSection;
  onNavSelect: (nav: SidebarNavId, mode?: CoachingMode) => void;
};

// Six sidebar doors — Chat, Focus My Brain, Visual Thinking, Growth, Other, How Do I.
export function AppSidebar({
  activeNav,
  activeSection,
  onNavSelect,
}: AppSidebarProps) {
  const normalizedActiveNav = normalizeSidebarNav(activeNav);
  const moreActive = MORE_NAV.some(
    (item) =>
      SECTION_NAV[item.id] === activeSection || normalizedActiveNav === item.id,
  );
  const [moreOpen, setMoreOpen] = useState(false);
  const showMore = moreOpen || moreActive;

  function renderItem(item: {
    id: SidebarNavId;
    label: string;
    emoji: string;
    mode?: CoachingMode;
  }) {
    const sectionFor = SECTION_NAV[item.id];
    const active = sectionFor
      ? activeSection === sectionFor ||
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
      {/* Brand header — the identity anchor, above all navigation. */}
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

      {/* Google quick links — optional external tools, separate from main nav. */}
      <div className="border-t border-black/10 p-2">
        <div className="rounded-lg bg-black/[0.03] px-1 py-1.5">
          <p
            className={`hidden px-2 pb-1 pt-0.5 md:block text-[10px] font-semibold uppercase tracking-wider text-black/45`}
          >
            Google Workspace
          </p>
          {[
            {
              l: "📅",
              t: "Google Calendar",
              u: "https://calendar.google.com",
            },
            { l: "📝", t: "Google Docs", u: "https://docs.google.com" },
            { l: "📁", t: "Google Drive", u: "https://drive.google.com" },
          ].map((g) => (
            <a
              key={g.t}
              href={g.u}
              target="_blank"
              rel="noopener noreferrer"
              title={g.t}
              aria-label={g.t}
              className={`${MENU_NAV_LINK} py-2 text-black/70 ${MENU_TEXT_HOVER}`}
            >
              <span
                aria-hidden="true"
                className="flex w-6 shrink-0 justify-center opacity-80"
              >
                {g.l}
              </span>
              <span className="hidden text-sm font-medium text-black/70 md:inline">
                {g.t}
              </span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
