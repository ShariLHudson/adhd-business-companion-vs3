"use client";

import { useEffect, useState } from "react";
import {
  ACTIVE_AVATARS,
  ACTIVE_COMPANIONS_TOOLTIP,
  formatActiveAvatarsSummary,
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
}: {
  emoji: string;
  image?: string;
  size?: number;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-[#1e4f4f]/10"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      aria-hidden="true"
    >
      {emoji}
    </div>
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

  const avatarSummary = formatActiveAvatarsSummary(activeAvatarIds);

  function avatarPicker(dropdownClass: string) {
    return (
      <div className={dropdownClass}>
        <p className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          Active Avatars
        </p>
        {ACTIVE_AVATARS.map((avatar) => {
          const checked = activeAvatarIds.includes(avatar.id);
          const atLimit =
            !checked && activeAvatarIds.length >= MAX_ACTIVE_COMPANIONS;
          return (
            <button
              key={avatar.id}
              type="button"
              disabled={atLimit}
              onClick={() => {
                setActiveAvatarIds(toggleActiveCompanion(avatar.id));
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[#f0f5f5] disabled:cursor-not-allowed disabled:opacity-50 ${
                checked ? "text-[#1e4f4f]" : "text-[#3d3630]"
              }`}
            >
              <AvatarPortrait emoji={avatar.emoji} image={avatar.image} />
              <span className="min-w-0 flex-1 text-sm font-medium">
                {avatar.label}
              </span>
              <span className="shrink-0 text-base" aria-hidden="true">
                {checked ? "☑" : "☐"}
              </span>
            </button>
          );
        })}
        <div className="border-t border-[#e7dfd4] px-4 py-2.5">
          <p className="text-xs font-semibold text-[#1f1c19]">
            {avatarSummary.countLine}
          </p>
          <p className="mt-0.5 text-xs text-[#6b635a]">{avatarSummary.detailLine}</p>
        </div>
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
            onClick={() => setOverflowOpen((o) => !o)}
            aria-expanded={overflowOpen}
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8cfc2] bg-white/80 text-xl leading-none text-[#3d3630] hover:bg-white"
          >
            ⋯
          </button>
          {overflowOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOverflowOpen(false)}
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
          className={BTN}
          title={ACTIVE_COMPANIONS_TOOLTIP}
        >
          <span className="hidden sm:inline">Active Avatars:</span>{" "}
          <span className="font-semibold">{activeAvatarIds.length}</span>
          <span aria-hidden="true" className="text-xs">
            ▾
          </span>
        </button>
        {avatarMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setAvatarMenuOpen(false)}
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
