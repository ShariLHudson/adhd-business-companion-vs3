"use client";

import { useEffect, useState } from "react";
import {
  ASSETS,
  BRAND,
  MORE_NAV,
  SECTION_NAV,
  SIDEBAR_NAV,
  type AppSection,
  type SidebarNavId,
} from "@/lib/companionUi";
import { getLastActivity } from "@/lib/companionStore";
import type { CoachingMode } from "@/lib/companionPrompt";

type AppSidebarProps = {
  activeNav: SidebarNavId;
  activeSection: AppSection;
  onNavSelect: (nav: SidebarNavId, mode?: CoachingMode) => void;
};

// Three primary doors (Chat · Focus · Create) + a collapsible "More" for backstage
// areas. One navigation system; the top bar collapses to "⋯" on home.
export function AppSidebar({
  activeNav,
  activeSection,
  onNavSelect,
}: AppSidebarProps) {
  // Is one of the backstage sections currently open? Keep "More" expanded if so.
  const moreActive = MORE_NAV.some(
    (item) => SECTION_NAV[item.id] === activeSection,
  );
  const [moreOpen, setMoreOpen] = useState(false);
  const showMore = moreOpen || moreActive;

  // Continue indicator — a small dot on Chat when unfinished work exists, so
  // users elsewhere in the app know there's something to come back to.
  const [hasContinue, setHasContinue] = useState(false);
  useEffect(() => {
    setHasContinue(Boolean(getLastActivity()));
  }, [activeSection]);

  function renderItem(item: {
    id: SidebarNavId;
    label: string;
    emoji: string;
    mode?: CoachingMode;
  }) {
    const sectionFor = SECTION_NAV[item.id];
    const active = sectionFor
      ? activeSection === sectionFor
      : activeNav === item.id && activeSection === "home";
    const showDot = item.id === "chat" && hasContinue && !active;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onNavSelect(item.id, item.mode)}
        title={item.label}
        aria-label={
          showDot ? `${item.label} — you have something to continue` : item.label
        }
        className={`flex w-full items-center justify-start gap-2 rounded-lg px-2 py-2.5 text-left leading-tight transition-colors md:px-3 ${
          active
            ? "bg-[#1e4f4f] text-white shadow-sm"
            : "text-white/80 hover:bg-white/10"
        }`}
      >
        <span
          aria-hidden="true"
          className="relative flex w-6 shrink-0 justify-center"
        >
          {item.emoji}
          {showDot && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#e0795a] ring-2 ring-[#6e6a66]" />
          )}
        </span>
        <span className="hidden text-left text-base font-medium md:inline">
          {item.label}
          {showDot && (
            <span aria-hidden="true" className="ml-1.5 text-[#e0795a]">
              ●
            </span>
          )}
        </span>
      </button>
    );
  }

  return (
    <aside
      className="sticky top-0 flex h-dvh w-14 shrink-0 flex-col self-start overflow-y-auto border-r border-black/10 bg-[#6e6a66] text-white backdrop-blur-md md:w-44"
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

        {/* More — backstage doors, off the main path but one tap away. */}
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={showMore}
          title="More sections"
          aria-label="More sections"
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-2 py-2.5 text-left leading-tight text-white/80 transition-colors hover:bg-white/10 md:justify-start md:px-3"
        >
          <span aria-hidden="true" className="flex w-6 shrink-0 justify-center">
            {showMore ? "▾" : "⋯"}
          </span>
          <span className="hidden text-left text-base font-medium md:inline">
            More
          </span>
        </button>
        {showMore && (
          <div className="flex flex-col gap-1 md:pl-2">
            {MORE_NAV.map(renderItem)}
          </div>
        )}
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
