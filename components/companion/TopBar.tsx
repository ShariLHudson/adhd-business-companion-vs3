"use client";

import { useEffect, useState } from "react";
import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import type { SettingsSection } from "@/components/companion/SettingsPanel";
import {
  ACTIVE_AVATARS,
  ACTIVE_COMPANIONS_TOOLTIP,
  formatActiveAvatarsSummary,
  getActiveAvatarsForIds,
  getActiveCompanionIds,
  MAX_ACTIVE_COMPANIONS,
  toggleActiveCompanion,
} from "@/lib/activeCompanions";
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
  onOpenAvatars?: () => void;
};

const BTN =
  "flex items-center gap-1.5 rounded-full border border-[#d8cfc2] bg-white/80 px-3.5 py-1.5 text-sm font-medium text-[#3d3630] transition-colors hover:bg-white";

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

function PlanMyDayNavButton({
  onClick,
  count,
}: {
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={BTN}
      title="Plan My Day"
      aria-label={
        count > 0 ? `Plan My Day, ${count} active items` : "Plan My Day"
      }
    >
      <span aria-hidden="true">📅</span>
      <span>Plan My Day</span>
      {count > 0 ? (
        <span className="rounded-full bg-[var(--cm-accent-tint,#e6f0f0)] px-2 py-0.5 text-xs font-bold text-[var(--cm-accent,#1e4f4f)]">
          {count}
        </span>
      ) : null}
    </button>
  );
}

function AvatarPortrait({
  emoji,
  image,
  size = 36,
  className = "",
}: {
  emoji: string;
  image?: string;
  size?: number;
  className?: string;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#1e4f4f]/10 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      aria-hidden="true"
    >
      {emoji}
    </div>
  );
}

function ActiveAvatarsTrigger({
  activeAvatarIds,
  compact = false,
}: {
  activeAvatarIds: string[];
  compact?: boolean;
}) {
  const avatars = getActiveAvatarsForIds(activeAvatarIds);
  const portraitSize = compact ? 22 : 24;

  if (avatars.length === 1) {
    const avatar = avatars[0]!;
    return (
      <AvatarPortrait
        emoji={avatar.emoji}
        image={avatar.image}
        size={portraitSize}
      />
    );
  }

  return (
    <span className="flex items-center -space-x-1.5">
      {avatars.slice(0, 3).map((avatar) => (
        <AvatarPortrait
          key={avatar.id}
          emoji={avatar.emoji}
          image={avatar.image}
          size={portraitSize}
          className="ring-2 ring-white"
        />
      ))}
    </span>
  );
}

function AvatarPickerList({
  activeAvatarIds,
  onToggle,
}: {
  activeAvatarIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <>
      {ACTIVE_AVATARS.map((avatar) => {
        const checked = activeAvatarIds.includes(avatar.id);
        const atLimit =
          !checked && activeAvatarIds.length >= MAX_ACTIVE_COMPANIONS;
        return (
          <button
            key={avatar.id}
            type="button"
            disabled={atLimit}
            onClick={() => onToggle(avatar.id)}
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[#f0f5f5] disabled:cursor-not-allowed disabled:opacity-50 ${
              checked ? "text-[#1e4f4f]" : "text-[#3d3630]"
            }`}
          >
            <AvatarPortrait emoji={avatar.emoji} image={avatar.image} />
            <span className="min-w-0 flex-1 text-sm font-medium">{avatar.label}</span>
            <span className="shrink-0 text-base" aria-hidden="true">
              {checked ? "☑" : "☐"}
            </span>
          </button>
        );
      })}
    </>
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
  onOpenAvatars,
}: TopBarProps) {
  const planActiveCount = usePlanActiveCount();
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [avatarListExpanded, setAvatarListExpanded] = useState(false);
  const [activeAvatarIds, setActiveAvatarIds] = useState<string[]>([]);
  const { configured: authConfigured, user, signOut } = useCompanionAuth();

  function refreshState() {
    setActiveAvatarIds(getActiveCompanionIds());
  }

  useEffect(() => {
    refreshState();
    const onPrefs = () => refreshState();
    window.addEventListener("companion-prefs-updated", onPrefs);
    window.addEventListener("companion-active-companions-updated", onPrefs);
    return () => {
      window.removeEventListener("companion-prefs-updated", onPrefs);
      window.removeEventListener("companion-active-companions-updated", onPrefs);
    };
  }, []);

  const avatarSummary = formatActiveAvatarsSummary(activeAvatarIds);

  function handleAvatarToggle(id: string) {
    setActiveAvatarIds(toggleActiveCompanion(id));
  }

  function closeMenu() {
    setOverflowOpen(false);
    setAvatarListExpanded(false);
  }

  function openSettingsSection(section: SettingsSection | null) {
    closeMenu();
    onOpenSettings(section);
  }

  return (
    <div className="companion-top-bar sticky top-0 z-30 flex shrink-0 items-center justify-end gap-2 px-4 py-2.5 backdrop-blur-sm sm:px-6">
      {showPlanMyDay && onOpenPlanMyDay ? (
        <PlanMyDayNavButton onClick={onOpenPlanMyDay} count={planActiveCount} />
      ) : null}

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            refreshState();
            setOverflowOpen((open) => {
              if (open) setAvatarListExpanded(false);
              return !open;
            });
          }}
          aria-expanded={overflowOpen}
          aria-label="Menu"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c9bdb0] bg-white text-[26px] leading-none text-[#3d3630] shadow-sm transition-colors hover:bg-[#fff8ef]"
        >
          ⋯
        </button>
        {overflowOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={closeMenu}
              aria-hidden="true"
            />
            <div className="absolute right-0 z-20 mt-1 w-72 overflow-hidden rounded-xl border border-[#d8cfc2] bg-white shadow-lg">
              <p className="border-b border-[#e7dfd4] px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-[#9a8f82]">
                Settings &amp; account
              </p>
              {(
                [
                  { label: "⚙️ Settings", section: null as SettingsSection | null },
                  { label: "🎨 Appearance", section: "appearance" as const },
                  { label: "♿ Accessibility", section: "pattern" as const },
                  { label: "💬 Feedback", section: "account" as const },
                  { label: "❓ Help", section: "help" as const },
                  { label: "🧍 Profile", action: onOpenProfile },
                ] as const
              ).map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if ("action" in item) {
                      closeMenu();
                      item.action();
                    } else {
                      openSettingsSection(item.section);
                    }
                  }}
                  className={MENU_BTN}
                >
                  {item.label}
                </button>
              ))}
              {authConfigured && user ? (
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    void signOut();
                  }}
                  className={`${MENU_BTN} border-t border-[#e7dfd4] text-[#8b3a3a]`}
                >
                  Log out
                </button>
              ) : null}

              <p className="border-t border-[#e7dfd4] px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-[#9a8f82]">
                Workspace
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
              {onOpenAvatars ? (
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    onOpenAvatars();
                  }}
                  className={MENU_BTN}
                >
                  👤 Client Avatars
                </button>
              ) : null}

              <div className="border-t border-[#e7dfd4] py-1">
                <p className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
                  Active Avatars
                </p>
                <button
                  type="button"
                  onClick={() => setAvatarListExpanded((open) => !open)}
                  aria-expanded={avatarListExpanded}
                  title={ACTIVE_COMPANIONS_TOOLTIP}
                  className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-[#f0f5f5]"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <ActiveAvatarsTrigger
                      activeAvatarIds={activeAvatarIds}
                      compact
                    />
                    <span className="text-sm font-medium text-[#3d3630]">
                      {avatarSummary.countLine}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-[#6b635a]" aria-hidden="true">
                    {avatarListExpanded ? "▴" : "▾"}
                  </span>
                </button>
                {avatarListExpanded ? (
                  <>
                    <AvatarPickerList
                      activeAvatarIds={activeAvatarIds}
                      onToggle={handleAvatarToggle}
                    />
                    <button
                      type="button"
                      onClick={() => setAvatarListExpanded(false)}
                      className="w-full border-t border-[#e7dfd4] px-4 py-2 text-center text-xs font-semibold text-[#6b635a] hover:bg-[#f0f5f5]"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <p className="px-4 pb-2.5 text-xs text-[#6b635a]">
                    {avatarSummary.detailLine}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
