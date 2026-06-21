"use client";

import type { AppSection } from "@/lib/companionUi";
import {
  SPLIT_BESIDE_SUGGESTIONS,
  splitBesideAreaDescription,
  workspaceAreaEmoji,
  workspaceAreaTitle,
} from "@/lib/splitWorkspacePanel";
import { supportsWorkspace } from "@/lib/workspaceMode";

export function SplitWorkspaceBesideEmptyState({
  onOpenSection,
}: {
  onOpenSection?: (section: AppSection) => void;
}) {
  return (
    <div className="flex h-full min-h-[12rem] flex-col justify-center px-6 py-10">
      <p className="text-lg font-semibold text-[#1f1c19]">
        Open an area to work beside your conversation.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[#6b635a]">
        Pick a destination below — your chat stays on the left while you work on
        the right.
      </p>
      {onOpenSection ? (
        <ul className="mt-5 space-y-2">
          {SPLIT_BESIDE_SUGGESTIONS.map((item) => (
            <li key={item.section}>
              <button
                type="button"
                onClick={() => onOpenSection(item.section)}
                className="flex w-full items-center gap-2 rounded-xl border border-[#e4ddd2] bg-white px-4 py-3 text-left text-sm font-semibold text-[#1f1c19] shadow-sm hover:bg-[#faf7f2]"
              >
                <span aria-hidden="true">{workspaceAreaEmoji(item.section)}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[#6b635a]">
          {SPLIT_BESIDE_SUGGESTIONS.map((item) => (
            <li key={item.section}>{item.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SplitWorkspaceAreaPanel({
  section,
  onOpenFullScreen,
}: {
  section: AppSection;
  onOpenFullScreen?: () => void;
}) {
  const title = workspaceAreaTitle(section);
  const emoji = workspaceAreaEmoji(section);
  const canSplit = supportsWorkspace(section);

  return (
    <div className="flex h-full min-h-[12rem] flex-col justify-center px-6 py-10">
      <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
        {emoji} {title}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[#2d2926]">
        {splitBesideAreaDescription(section)}
      </p>
      {!canSplit && onOpenFullScreen ? (
        <button
          type="button"
          onClick={onOpenFullScreen}
          className="mt-5 self-start rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          Open {title}
        </button>
      ) : null}
    </div>
  );
}
