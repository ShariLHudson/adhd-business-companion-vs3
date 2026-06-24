"use client";

import { useEffect, useRef, useState } from "react";
import type { SettingsSection } from "@/components/companion/SettingsPanel";
import {
  countActivePlanItems,
  PLAN_MY_DAY_UPDATED,
} from "@/lib/planMyDay";
import { TOP_BAR_NEW_CONVERSATION_LABEL } from "@/lib/freshStartCopy";

type TopBarProps = {
  showPlanMyDay?: boolean;
  onOpenPlanMyDay?: () => void;
  onOpenAdaptMyDay?: () => void;
  onOpenClearMyMind?: () => void;
  onOpenSettings: (section?: SettingsSection | null) => void;
  onOpenProfile: () => void;
  onRequestNewConversation: () => void;
};

const BTN =
  "relative z-50 flex h-11 items-center gap-1.5 rounded-full border border-[#d8cfc2] bg-white/80 px-3.5 text-sm font-medium text-[#3d3630] transition-colors hover:bg-white";

const MENU_BTN =
  "block w-full px-4 py-3 text-left text-base font-semibold text-[#1f1c19] hover:bg-[#f0f5f5]";

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
  href,
  badge,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
  href?: string;
  badge?: number;
}) {
  const className = BTN;
  const content = (
    <>
      <span aria-hidden="true">{emoji}</span>
      <span className="hidden sm:inline">{label}</span>
      {badge != null && badge > 0 ? (
        <span className="rounded-full bg-[var(--cm-accent-tint,#e6f0f0)] px-2 py-0.5 text-xs font-bold text-[var(--cm-accent,#1e4f4f)]">
          {badge}
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        className={className}
        title={label}
        aria-label={badge ? `${label}, ${badge} active items` : label}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      title={label}
      aria-label={badge ? `${label}, ${badge} active items` : label}
    >
      {content}
    </button>
  );
}

export function TopBar({
  showPlanMyDay = false,
  onOpenPlanMyDay,
  onOpenAdaptMyDay,
  onOpenClearMyMind,
  onOpenSettings,
  onOpenProfile,
  onRequestNewConversation,
}: TopBarProps) {
  const planActiveCount = usePlanActiveCount();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  function closeMenus() {
    setAccountMenuOpen(false);
  }

  function runHeaderAction(action: () => void) {
    closeMenus();
    action();
  }

  useEffect(() => {
    if (!accountMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const accountRoot = accountMenuRef.current;
      if (accountRoot?.contains(event.target as Node)) {
        return;
      }
      closeMenus();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountMenuOpen]);

  return (
    <div className="companion-top-bar sticky top-0 z-50 flex shrink-0 items-center justify-end gap-2 px-4 py-2.5 backdrop-blur-sm sm:px-6">
      {onOpenClearMyMind ? (
        <HeaderActionButton
          emoji="🧠"
          label="Clear My Mind"
          onClick={() => runHeaderAction(onOpenClearMyMind)}
        />
      ) : null}

      {showPlanMyDay && onOpenPlanMyDay ? (
        <HeaderActionButton
          emoji="📅"
          label="Plan My Day"
          onClick={() => runHeaderAction(onOpenPlanMyDay)}
          badge={planActiveCount}
        />
      ) : null}

      {onOpenAdaptMyDay ? (
        <HeaderActionButton
          emoji="🌤️"
          label="Adapt My Day"
          onClick={() => runHeaderAction(onOpenAdaptMyDay)}
        />
      ) : null}

      <HeaderActionButton
        emoji="💬"
        label={TOP_BAR_NEW_CONVERSATION_LABEL}
        onClick={() => runHeaderAction(onRequestNewConversation)}
      />

      <div ref={accountMenuRef} className="relative z-50">
        <button
          type="button"
          onClick={() => setAccountMenuOpen((open) => !open)}
          aria-expanded={accountMenuOpen}
          aria-haspopup="menu"
          aria-label="Account"
          title="Account"
          className="relative z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#c9bdb0] bg-white text-[26px] leading-none text-[#3d3630] shadow-sm transition-colors hover:bg-[#fff8ef]"
        >
          ⋯
        </button>
        {accountMenuOpen ? (
          <div
            className="absolute right-0 z-[60] mt-1 w-56 overflow-hidden rounded-xl border border-[#d8cfc2] bg-white shadow-lg"
            role="menu"
            aria-label="Account"
          >
            <p className="border-b border-[#e7dfd4] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
              Account
            </p>
            <button
              type="button"
              role="menuitem"
              onClick={() => runHeaderAction(() => onOpenSettings(null))}
              className={MENU_BTN}
            >
              ⚙️ Settings
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => runHeaderAction(onOpenProfile)}
              className={MENU_BTN}
            >
              👤 Profile
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
