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
import { useCompanionPhotoCatalog } from "@/lib/companionPhotoProvider";
import { companionPhotoSrcWithVersion } from "@/lib/companionPhotoCatalog";
import { ASSETS } from "@/lib/companionUi";

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
  const { catalog } = useCompanionPhotoCatalog();
  const resolvedImage =
    image === ASSETS.profile
      ? companionPhotoSrcWithVersion(catalog.primarySrc, catalog.version)
      : image;
  if (resolvedImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedImage}
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

export function ActiveCompanionsPicker({ compact = false }: { compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [activeIds, setActiveIds] = useState<string[]>([]);

  function refresh() {
    setActiveIds(getActiveCompanionIds());
  }

  useEffect(() => {
    refresh();
    const onPrefs = () => refresh();
    window.addEventListener("companion-prefs-updated", onPrefs);
    window.addEventListener("companion-active-companions-updated", onPrefs);
    return () => {
      window.removeEventListener("companion-prefs-updated", onPrefs);
      window.removeEventListener("companion-active-companions-updated", onPrefs);
    };
  }, []);

  const summary = formatActiveAvatarsSummary(activeIds);
  const avatars = getActiveAvatarsForIds(activeIds);

  return (
    <div
      className={
        compact
          ? "rounded-xl border border-[#d4cdc3] bg-white/85"
          : "mt-6 rounded-2xl border border-[#d4cdc3] bg-white/85 p-4"
      }
    >
      {!compact ? (
        <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
          Active Companions
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        title={ACTIVE_COMPANIONS_TOOLTIP}
        className={`flex w-full items-center justify-between gap-2 text-left hover:bg-[#f0f5f5] ${
          compact ? "rounded-xl px-4 py-3" : "mt-2 rounded-lg px-2 py-2"
        }`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex items-center -space-x-1.5">
            {avatars.slice(0, 3).map((avatar) => (
              <AvatarPortrait
                key={avatar.id}
                emoji={avatar.emoji}
                image={avatar.image}
                size={24}
                className="ring-2 ring-white"
              />
            ))}
          </span>
          <span className="text-sm font-medium text-[#3d3630]">
            {summary.countLine}
          </span>
        </span>
        <span className="shrink-0 text-xs text-[#6b635a]" aria-hidden="true">
          {expanded ? "▴" : "▾"}
        </span>
      </button>
      {!expanded ? (
        <p className={`text-xs text-[#6b635a] ${compact ? "px-4 pb-3" : "px-2"}`}>
          {summary.detailLine}
        </p>
      ) : (
        <div className={compact ? "border-t border-[#e7dfd4]" : "mt-1"}>
          {ACTIVE_AVATARS.map((avatar) => {
            const checked = activeIds.includes(avatar.id);
            const atLimit =
              !checked && activeIds.length >= MAX_ACTIVE_COMPANIONS;
            return (
              <button
                key={avatar.id}
                type="button"
                disabled={atLimit}
                onClick={() => setActiveIds(toggleActiveCompanion(avatar.id))}
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
        </div>
      )}
    </div>
  );
}
