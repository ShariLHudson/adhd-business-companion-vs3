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
        className={`flex w-full items-center justify-start gap-2 rounded-lg px-2 py-2.5 text-left leading-tight transition-colors md:px-3 ${
          active
            ? "companion-nav-active shadow-sm"
            : "text-white hover:bg-white/10"
        }`}
      >
        <span
          aria-hidden="true"
          className="relative flex w-6 shrink-0 justify-center"
        >
          {item.emoji}
        </span>
        <span className="hidden text-left text-base font-medium md:inline">
          {item.label}
        </span>
      </a>
    );
  }

  return (
    <aside
      className="companion-app-sidebar relative flex h-dvh w-14 shrink-0 flex-col overflow-y-auto border-r border-black/10 text-white backdrop-blur-md md:w-44"
      aria-label="Navigation"
    >
      {/* Brand header — the identity anchor, above all navigation. */}
      <div className="flex items-center gap-2 border-b border-white/15 px-2 py-3.5 md:px-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ASSETS.logo}
          alt=""
          className="h-7 w-7 shrink-0 rounded object-contain"
        />
        <span className="hidden text-sm font-semibold leading-tight text-white md:inline">
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
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-2 py-2.5 text-left leading-tight text-white/80 transition-colors hover:bg-white/10 md:justify-start md:px-3"
            >
              <span
                aria-hidden="true"
                className="flex w-6 shrink-0 justify-center"
              >
                {showMore ? "▾" : "⋯"}
              </span>
              <span className="hidden text-left text-base font-medium md:inline">
                More
              </span>
            </button>
            {showMore ? (
              <div className="flex flex-col gap-1 md:pl-2">
                {MORE_NAV.map(renderItem)}
              </div>
            ) : null}
          </>
        ) : null}
      </nav>

      {/* Google quick links — open your apps from anywhere. */}
      <div className="border-t border-white/15 p-2">
        <p className="hidden px-2 pb-1 pt-0.5 text-[11px] font-bold uppercase tracking-wide text-white/55 md:block">
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
            className="flex w-full items-center justify-start gap-2 rounded-lg px-2 py-2 text-left leading-tight text-white/85 transition-colors hover:bg-white/10 md:px-3"
          >
            <span aria-hidden="true" className="flex w-6 shrink-0 justify-center">
              {g.l}
            </span>
            <span className="hidden text-base font-medium md:inline">{g.t}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}
