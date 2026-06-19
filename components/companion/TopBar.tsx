"use client";

import { useEffect, useState } from "react";
import {
  ACTIVE_AVATARS,
  ACTIVE_COMPANIONS_TOOLTIP,
  formatActiveAvatarsSummary,
  getActiveAvatarsForIds,
  getActiveCompanionIds,
  MAX_ACTIVE_COMPANIONS,
  toggleActiveCompanion,
} from "@/lib/activeCompanions";

type TopBarProps = {
  onAdjustDay: () => void;
  onNewChat: () => void;
  onNewDayChat: () => void;
  onSettings: () => void;
  onProfile: () => void;
  onOpenAvatars?: () => void;
  minimal?: boolean;
};

const BTN =
  "flex items-center gap-1.5 rounded-full border border-[#d8cfc2] bg-white/80 px-3.5 py-1.5 text-sm font-medium text-[#3d3630] transition-colors hover:bg-white";

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
  showChevron = true,
  compact = false,
}: {
  activeAvatarIds: string[];
  showChevron?: boolean;
  compact?: boolean;
}) {
  const avatars = getActiveAvatarsForIds(activeAvatarIds);
  const portraitSize = compact ? 24 : 28;

  if (avatars.length === 1) {
    const avatar = avatars[0]!;
    return (
      <>
        <AvatarPortrait
          emoji={avatar.emoji}
          image={avatar.image}
          size={portraitSize}
        />
        {!compact ? (
          <span className="hidden max-w-[9rem] truncate sm:inline">{avatar.label}</span>
        ) : null}
        {showChevron ? (
          <span aria-hidden="true" className="text-xs">
            ▾
          </span>
        ) : null}
      </>
    );
  }

  return (
    <>
      <span className="flex items-center -space-x-1.5">
        {avatars.slice(0, 3).map((avatar) => (
          <AvatarPortrait
            key={avatar.id}
            emoji={avatar.emoji}
            image={avatar.image}
            size={compact ? 22 : 24}
            className="ring-2 ring-white"
          />
        ))}
      </span>
      {!compact ? (
        <span className="font-semibold">{avatars.length} avatars</span>
      ) : null}
      {showChevron ? (
        <span aria-hidden="true" className="text-xs">
          ▾
        </span>
      ) : null}
    </>
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
  onAdjustDay,
  onNewChat,
  onNewDayChat,
  onSettings,
  onProfile,
  onOpenAvatars,
  minimal = false,
}: TopBarProps) {
  const [convoOpen, setConvoOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [avatarListExpanded, setAvatarListExpanded] = useState(false);
  const [activeAvatarIds, setActiveAvatarIds] = useState<string[]>([]);

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

  useEffect(() => {
    if (overflowOpen) setAvatarListExpanded(false);
  }, [overflowOpen]);

  useEffect(() => {
    if (avatarMenuOpen) setAvatarListExpanded(false);
  }, [avatarMenuOpen]);

  const avatarSummary = formatActiveAvatarsSummary(activeAvatarIds);

  function handleAvatarToggle(id: string) {
    setActiveAvatarIds(toggleActiveCompanion(id));
  }

  function closeAvatarMenus() {
    setAvatarMenuOpen(false);
    setAvatarListExpanded(false);
  }

  function avatarPicker(dropdownClass: string) {
    return (
      <div className={dropdownClass}>
        <p className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          Active Avatars
        </p>

        <button
          type="button"
          onClick={() => setAvatarListExpanded((open) => !open)}
          aria-expanded={avatarListExpanded}
          className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-[#f0f5f5]"
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <ActiveAvatarsTrigger
              activeAvatarIds={activeAvatarIds}
              showChevron={false}
            />
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
              className="w-full border-t border-[#e7dfd4] px-4 py-2.5 text-center text-xs font-semibold text-[#6b635a] hover:bg-[#f0f5f5]"
            >
              Close
            </button>
          </>
        ) : (
          <div className="border-b border-[#e7dfd4] px-4 pb-2.5">
            <p className="text-xs font-semibold text-[#1f1c19]">
              {avatarSummary.countLine}
            </p>
            <p className="mt-0.5 text-xs text-[#6b635a]">
              {avatarSummary.detailLine}
            </p>
            <p className="mt-1 text-[11px] text-[#9a8f82]">
              Tap above to choose from {ACTIVE_AVATARS.length} voices
            </p>
          </div>
        )}
      </div>
    );
  }

  if (minimal) {
    const items: { label: string; fn: () => void }[] = [
      { label: "⚡ Adjust My Day", fn: onAdjustDay },
      { label: "💬 Fresh Start", fn: onNewChat },
      { label: "🌅 Fresh Start · New Day", fn: onNewDayChat },
      ...(onOpenAvatars
        ? [{ label: "👤 Client Avatars", fn: onOpenAvatars }]
        : []),
      { label: "⚙️ Settings", fn: onSettings },
      { label: "🧍 Profile", fn: onProfile },
    ];
    return (
      <div className="sticky top-0 z-30 flex shrink-0 items-center justify-end bg-[#f4efe7]/70 px-4 py-2.5 backdrop-blur-sm sm:px-6">
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
                onClick={() => {
                  setOverflowOpen(false);
                  setAvatarListExpanded(false);
                }}
                aria-hidden="true"
              />
              <div className="absolute right-0 z-20 mt-1 w-72 overflow-hidden rounded-xl border border-[#d8cfc2] bg-white shadow-lg">
                {avatarPicker("border-b border-[#e7dfd4] py-1")}
                {items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setOverflowOpen(false);
                      item.fn();
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm font-medium text-[#3d3630] hover:bg-[#f0f5f5]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-30 flex shrink-0 items-center justify-end gap-2 bg-[#f4efe7]/70 px-4 py-2.5 backdrop-blur-sm sm:px-6">
      <div className="relative mr-auto">
        <button
          type="button"
          onClick={() => {
            refreshState();
            setAvatarMenuOpen((o) => !o);
          }}
          aria-expanded={avatarMenuOpen}
          aria-label="Active avatars"
          className={BTN}
          title={ACTIVE_COMPANIONS_TOOLTIP}
        >
          <ActiveAvatarsTrigger activeAvatarIds={activeAvatarIds} />
        </button>
        {avatarMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={closeAvatarMenus}
              aria-hidden="true"
            />
            {avatarPicker(
              "absolute left-0 z-20 mt-1 w-72 overflow-hidden rounded-xl border border-[#d8cfc2] bg-white shadow-lg",
            )}
          </>
        )}
      </div>

      <button type="button" onClick={onAdjustDay} className={BTN}>
        <span aria-hidden="true">⚡</span> Adjust My Day
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setConvoOpen((o) => !o)}
          aria-expanded={convoOpen}
          className={BTN}
        >
          <span aria-hidden="true">💬</span> Conversation
          <span aria-hidden="true" className="text-xs">
            ▾
          </span>
        </button>
        {convoOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setConvoOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-[#d8cfc2] bg-white shadow-lg">
              {[
                { label: "Fresh Start", fn: onNewChat },
                { label: "Fresh Start · New Day", fn: onNewDayChat },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setConvoOpen(false);
                    item.fn();
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm font-medium text-[#3d3630] hover:bg-[#f0f5f5]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button type="button" onClick={onSettings} className={BTN}>
        <span aria-hidden="true">⚙️</span> Settings
      </button>
      <button type="button" onClick={onProfile} className={BTN}>
        <span aria-hidden="true">👤</span> Profile
      </button>
    </div>
  );
}
