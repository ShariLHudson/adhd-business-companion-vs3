"use client";

import { useEffect, useState } from "react";
import type { SettingsSection } from "@/components/companion/SettingsPanel";
import {
  countActivePlanItems,
  PLAN_MY_DAY_UPDATED,
} from "@/lib/planMyDay";
import {
  BEGIN_NEW_DAY_COPY,
  CLEAR_TODAY_CONTEXT_COPY,
} from "@/lib/freshStartCopy";

type TopBarProps = {
  showPlanMyDay?: boolean;
  onOpenPlanMyDay?: () => void;
  onOpenSettings: (section?: SettingsSection | null) => void;
  onOpenProfile: () => void;
  onAdjustDay: () => void;
  onRequestClearTodayContext: () => void;
  onRequestBeginNewDay: () => void;
};

const BTN =
  "flex h-11 items-center gap-1.5 rounded-full border border-[#d8cfc2] bg-white/80 px-3.5 text-sm font-medium text-[#3d3630] transition-colors hover:bg-white";

const MENU_BTN =
  "block w-full px-4 py-2.5 text-left text-sm font-medium text-[#3d3630] hover:bg-[#f0f5f5]";

const MENU_BTN_HINT =
  "block w-full px-4 py-2.5 text-left hover:bg-[#f0f5f5]";

function usePlanActiveCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const sync = () => setCount(countActivePlanItems());
    sync();
    window.addEventListener(PLAN_MY_DAY_UPDATED, sync);
    return () => window.removeEventListener(PLAN_MY_DAY_UPDATED, sync);
  }, []);
  return count;
}

function HeaderActionButton({
  emoji,
  label,
  onClick,
  badge,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={BTN}
      title={label}
      aria-label={badge ? `${label}, ${badge} active items` : label}
    >
      <span aria-hidden="true">{emoji}</span>
      <span className="hidden sm:inline">{label}</span>
      {badge != null && badge > 0 ? (
        <span className="rounded-full bg-[var(--cm-accent-tint,#e6f0f0)] px-2 py-0.5 text-xs font-bold text-[var(--cm-accent,#1e4f4f)]">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export function TopBar({
  showPlanMyDay = false,
  onOpenPlanMyDay,
  onOpenSettings,
  onOpenProfile,
  onAdjustDay,
  onRequestClearTodayContext,
  onRequestBeginNewDay,
}: TopBarProps) {
  const planActiveCount = usePlanActiveCount();
  const [dayToolsOpen, setDayToolsOpen] = useState(false);

  function closeMenu() {
    setDayToolsOpen(false);
  }

  return (
    <div className="companion-top-bar sticky top-0 z-30 flex shrink-0 items-center justify-end gap-2 px-4 py-2.5 backdrop-blur-sm sm:px-6">
      {showPlanMyDay && onOpenPlanMyDay ? (
        <HeaderActionButton
          emoji="📅"
          label="Plan My Day"
          onClick={onOpenPlanMyDay}
          badge={planActiveCount}
        />
      ) : null}

      <HeaderActionButton emoji="🧍" label="Profile" onClick={onOpenProfile} />

      <HeaderActionButton
        emoji="⚙️"
        label="Settings"
        onClick={() => onOpenSettings(null)}
      />

      <div className="relative">
        <button
          type="button"
          onClick={() => setDayToolsOpen((open) => !open)}
          aria-expanded={dayToolsOpen}
          aria-label="Day tools"
          title="Day tools"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c9bdb0] bg-white text-[26px] leading-none text-[#3d3630] shadow-sm transition-colors hover:bg-[#fff8ef]"
        >
          ⋯
        </button>
        {dayToolsOpen ? (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={closeMenu}
              aria-hidden="true"
            />
            <div className="absolute right-0 z-20 mt-1 w-72 overflow-hidden rounded-xl border border-[#d8cfc2] bg-white shadow-lg">
              <p className="border-b border-[#e7dfd4] px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-[#9a8f82]">
                Day tools
              </p>
              <p className="border-b border-[#e7dfd4] px-4 py-2 text-xs leading-snug text-[#6b635a]">
                Plan My Day is your daily list. These tools reset or reshape
                today&apos;s context.
              </p>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  onAdjustDay();
                }}
                className={MENU_BTN}
              >
                ⚡ Adjust My Day
              </button>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  onRequestClearTodayContext();
                }}
                className={MENU_BTN_HINT}
              >
                <span className="block text-sm font-semibold text-[#3d3630]">
                  {CLEAR_TODAY_CONTEXT_COPY.menuEmoji}{" "}
                  {CLEAR_TODAY_CONTEXT_COPY.menuLabel}
                </span>
                <span className="mt-0.5 block text-xs font-normal leading-snug text-[#8a7f72]">
                  {CLEAR_TODAY_CONTEXT_COPY.menuHint}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  onRequestBeginNewDay();
                }}
                className={MENU_BTN_HINT}
              >
                <span className="block text-sm font-semibold text-[#3d3630]">
                  {BEGIN_NEW_DAY_COPY.menuEmoji} {BEGIN_NEW_DAY_COPY.menuLabel}
                </span>
                <span className="mt-0.5 block text-xs font-normal leading-snug text-[#8a7f72]">
                  {BEGIN_NEW_DAY_COPY.menuHint}
                </span>
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
