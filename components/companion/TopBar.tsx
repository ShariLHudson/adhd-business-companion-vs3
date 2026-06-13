"use client";

import { useEffect, useState } from "react";
import {
  getAvatars,
  getActiveAvatar,
  setActiveAvatar,
  type IdealClientAvatar,
} from "@/lib/companionStore";

// The app's primary navigation — three layers:
//  • Adjust My Day (state tuner)
//  • Conversation (the workspace; New Chat / New Day Chat)
//  • Settings / Profile (account + system)

type TopBarProps = {
  onAdjustDay: () => void;
  onNewChat: () => void;
  onNewDayChat: () => void;
  onSettings: () => void;
  onProfile: () => void;
  onSignIn?: () => void;
  signedInEmail?: string | null;
  onOpenAvatars?: () => void;
  // On the home screen we collapse everything into one "⋯" so the chat stays
  // the only thing competing for attention.
  minimal?: boolean;
};

const BTN =
  "flex items-center gap-1.5 rounded-full border border-[#d8cfc2] bg-white/80 px-3.5 py-1.5 text-sm font-medium text-[#3d3630] transition-colors hover:bg-white";

export function TopBar({
  onAdjustDay,
  onNewChat,
  onNewDayChat,
  onSettings,
  onProfile,
  onSignIn,
  signedInEmail,
  onOpenAvatars,
  minimal = false,
}: TopBarProps) {
  const [convoOpen, setConvoOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [avatars, setAvatars] = useState<IdealClientAvatar[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  function refreshAvatars() {
    setAvatars(getAvatars());
    setActiveId(getActiveAvatar()?.id);
  }
  useEffect(() => {
    refreshAvatars();
  }, []);

  const active = avatars.find((a) => a.id === activeId);

  // ---- Minimal (home): a single overflow menu, nothing else ---------------
  if (minimal) {
    const items: { label: string; fn: () => void }[] = [
      { label: "⚡ Adjust My Day", fn: onAdjustDay },
      { label: "💬 Fresh Start", fn: onNewChat },
      { label: "🌅 Fresh Start · New Day", fn: onNewDayChat },
      ...(onOpenAvatars
        ? [{ label: "👤 Client Avatars", fn: onOpenAvatars }]
        : []),
      ...(onSignIn
        ? [
            {
              label: signedInEmail
                ? `🔐 Signed in · ${signedInEmail}`
                : "🔐 Sign in",
              fn: onSignIn,
            },
          ]
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
              <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-[#d8cfc2] bg-white shadow-lg">
                {/* Switch avatar — only when there's more than one to choose. */}
                {avatars.length >= 2 && (
                  <div className="border-b border-[#e7dfd4] py-1">
                    <p className="px-4 py-1 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
                      Writing for
                    </p>
                    {avatars.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setActiveAvatar(a.id);
                          setActiveId(a.id);
                          setOverflowOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium hover:bg-[#f0f5f5] ${
                          a.id === activeId ? "text-[#1e4f4f]" : "text-[#3d3630]"
                        }`}
                      >
                        <span aria-hidden="true">{a.emoji ?? "👤"}</span>
                        <span className="flex-1 truncate">{a.name}</span>
                        {a.id === activeId && <span aria-hidden="true">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
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
      {/* Current avatar in use — only worth showing with 2+ to switch between. */}
      {avatars.length >= 2 && (
        <div className="relative mr-auto">
          <button
            type="button"
            onClick={() => {
              refreshAvatars();
              setAvatarOpen((o) => !o);
            }}
            aria-expanded={avatarOpen}
            className={BTN}
            title="The client everything is written for right now"
          >
            <span aria-hidden="true">👤</span> Using:{" "}
            <span className="font-semibold">{active?.name ?? "Auto"}</span>
            <span aria-hidden="true" className="text-xs">
              ▾
            </span>
          </button>
          {avatarOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setAvatarOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute left-0 z-20 mt-1 w-56 overflow-hidden rounded-xl border border-[#d8cfc2] bg-white shadow-lg">
                {avatars.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setActiveAvatar(a.id);
                      setActiveId(a.id);
                      setAvatarOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium hover:bg-[#f0f5f5] ${
                      a.id === activeId ? "text-[#1e4f4f]" : "text-[#3d3630]"
                    }`}
                  >
                    <span aria-hidden="true">{a.emoji ?? "👤"}</span>
                    <span className="flex-1 truncate">{a.name}</span>
                    {a.id === activeId && <span aria-hidden="true">✓</span>}
                  </button>
                ))}
                {onOpenAvatars && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarOpen(false);
                      onOpenAvatars();
                    }}
                    className="block w-full border-t border-[#e7dfd4] px-4 py-2.5 text-left text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
                  >
                    Manage avatars →
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

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

      {onSignIn ? (
        <button type="button" onClick={onSignIn} className={BTN}>
          <span aria-hidden="true">🔐</span>
          {signedInEmail ? "Account" : "Sign in"}
        </button>
      ) : null}

      <button type="button" onClick={onSettings} className={BTN}>
        <span aria-hidden="true">⚙️</span> Settings
      </button>
      <button type="button" onClick={onProfile} className={BTN}>
        <span aria-hidden="true">👤</span> Profile
      </button>
    </div>
  );
}
