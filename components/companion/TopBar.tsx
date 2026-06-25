"use client";

import { useEffect, useRef, useState } from "react";
import type { SettingsSection } from "@/components/companion/SettingsPanel";
import {
  countActivePlanItems,
  PLAN_MY_DAY_UPDATED,
} from "@/lib/planMyDay";
import { TOP_BAR_NEW_CONVERSATION_LABEL } from "@/lib/freshStartCopy";
import {
  MENU_DROPDOWN_ITEM_LG,
  MENU_DROPDOWN_ROW,
  MENU_SECTION_HEADING,
  MENU_TRIGGER_BTN,
} from "@/lib/menuNavStyles";
import type { HomeNavVisibility } from "@/lib/arrivalIntelligence";

type TopBarProps = {
  calmHome?: boolean;
  navVisibility?: HomeNavVisibility;
  showPlanMyDay?: boolean;
  onOpenPlanMyDay?: () => void;
  onOpenAdaptMyDay?: () => void;
  onOpenClearMyMind?: () => void;
  onOpenSettings: (section?: SettingsSection | null) => void;
  onOpenProfile: () => void;
  onRequestNewConversation: () => void;
  onRequestNewDayConversation: () => void;
};

const BTN = MENU_TRIGGER_BTN;

const MENU_BTN = MENU_DROPDOWN_ITEM_LG;

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

function NewConversationDropdown({
  onNewConversation,
  onNewDayConversation,
}: {
  onNewConversation: () => void;
  onNewDayConversation: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const btnClass = MENU_TRIGGER_BTN;
  const itemClass = MENU_DROPDOWN_ROW;

  return (
    <div ref={ref} className="relative z-50">
      <button
        type="button"
        className={btnClass}
        title={TOP_BAR_NEW_CONVERSATION_LABEL}
        aria-label={TOP_BAR_NEW_CONVERSATION_LABEL}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">💬</span>
        <span className="hidden sm:inline">{TOP_BAR_NEW_CONVERSATION_LABEL}</span>
        <span style={{ fontSize: 9, opacity: 0.5, marginLeft: 1 }}>▾</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-[60] mt-1 w-52 overflow-hidden rounded-xl border border-[#d8cfc2] bg-white shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onNewConversation();
            }}
          >
            <span>💬</span>
            <span>New Conversation</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className={`${itemClass} border-t border-[#f0e9e0]`}
            onClick={() => {
              setOpen(false);
              onNewDayConversation();
            }}
          >
            <span>🌅</span>
            <span>New Day Conversation</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function TopBar({
  calmHome = false,
  navVisibility = "calm",
  showPlanMyDay = false,
  onOpenPlanMyDay,
  onOpenAdaptMyDay,
  onOpenClearMyMind,
  onOpenSettings,
  onOpenProfile,
  onRequestNewConversation,
  onRequestNewDayConversation,
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
    <div
      className={`companion-top-bar sticky top-0 z-50 flex shrink-0 items-center justify-end gap-2 px-4 py-2.5 backdrop-blur-sm sm:px-6 ${calmHome ? "companion-top-bar-calm" : ""} companion-nav-${navVisibility}`}
      data-home-calm={calmHome ? "" : undefined}
      data-nav-visibility={navVisibility}
    >
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

      <NewConversationDropdown
        onNewConversation={() => runHeaderAction(onRequestNewConversation)}
        onNewDayConversation={() => runHeaderAction(onRequestNewDayConversation)}
      />

      <div ref={accountMenuRef} className="relative z-50">
        <button
          type="button"
          onClick={() => setAccountMenuOpen((open) => !open)}
          aria-expanded={accountMenuOpen}
          aria-haspopup="menu"
          aria-label="Account"
          title="Account"
          className="relative z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#c9bdb0] bg-white text-[26px] leading-none text-black shadow-sm transition-colors hover:bg-[#fff8ef] hover:text-black"
        >
          ⋯
        </button>
        {accountMenuOpen ? (
          <div
            className="absolute right-0 z-[60] mt-1 w-56 overflow-hidden rounded-xl border border-[#d8cfc2] bg-white shadow-lg"
            role="menu"
            aria-label="Account"
          >
            <p className={`border-b border-[#e7dfd4] px-4 py-2 ${MENU_SECTION_HEADING}`}>
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
