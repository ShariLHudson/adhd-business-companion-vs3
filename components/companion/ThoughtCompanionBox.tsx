"use client";

import type { BrainDumpEntry } from "@/lib/companionStore";
import {
  primaryCollectionChipForThought,
  thoughtCardMeta,
  thoughtTitle,
} from "@/lib/thinkingSpace/thoughtCard";
import { thoughtDisplayEmoji } from "@/lib/thinkingSpace/thoughtEmoji";

type Props = {
  entry: BrainDumpEntry;
  highlighted?: boolean;
  dimmed?: boolean;
  selected?: boolean;
  onOpen: (entry: BrainDumpEntry) => void;
};

/**
 * Thought Companion Box — icon, thought text, one collection chip, status hints.
 * Advanced details live in the Companion Box detail sheet only.
 */
export function ThoughtCompanionBox({
  entry,
  highlighted = false,
  dimmed = false,
  selected = false,
  onOpen,
}: Props) {
  const emoji = thoughtDisplayEmoji(entry.text);
  const title = thoughtTitle(entry);
  const meta = thoughtCardMeta(entry);
  const collectionChip = primaryCollectionChipForThought(entry);

  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      className={`thought-companion-box companion-fade-in w-full rounded-2xl border px-4 py-3.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35 ${
        selected
          ? "border-[#1e4f4f]/40 bg-[#f0f8f8] shadow-sm"
          : highlighted
            ? "border-[#1e4f4f]/30 bg-white shadow-sm"
            : meta.archived
              ? "border-[#e7dfd4]/80 bg-[#faf7f2]/70 opacity-90"
              : "border-[#e7dfd4] bg-white/90 hover:border-[#c5ddd8] hover:bg-[#faf7f2]"
      } ${dimmed ? "opacity-40" : ""}`}
      data-testid={`thought-box-${entry.id}`}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none" aria-hidden>
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {meta.pinned ? (
              <span className="text-sm" aria-label="Pinned">
                📌
              </span>
            ) : null}
            {entry.done ? (
              <span
                className="text-sm font-semibold text-[#1e4f4f]"
                aria-label="Handled"
              >
                ✓
              </span>
            ) : null}
            <p className="text-base font-semibold leading-snug text-[#1f1c19]">
              {title}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {meta.hasReminder && meta.reminderLabel ? (
              <span className="thought-card-badge rounded-full bg-[#fffbeb] px-2 py-0.5 text-xs font-medium text-[#92400e]">
                🔔 {meta.reminderLabel}
              </span>
            ) : null}
            {collectionChip ? (
              <span
                className="rounded-full border px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: collectionChip.palette.chipBg,
                  borderColor: collectionChip.palette.border,
                  color: collectionChip.palette.chipText,
                }}
                data-testid="thought-primary-collection-chip"
              >
                {collectionChip.label}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}
