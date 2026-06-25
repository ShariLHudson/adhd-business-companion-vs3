"use client";

import type { BrainDumpEntry } from "@/lib/companionStore";
import {
  getCollectionsForThought,
  type ThoughtCollection,
} from "@/lib/thinkingSpace";
import {
  collectionChipsForThought,
  thoughtCardMeta,
  thoughtPreview,
  thoughtTitle,
} from "@/lib/thinkingSpace/thoughtCard";
import { resolveThoughtCollectionAuthority } from "@/lib/thinkingSpace/thoughtCollectionAuthority";
import { thoughtDisplayEmoji } from "@/lib/thinkingSpace/thoughtEmoji";

type Props = {
  entry: BrainDumpEntry;
  collections?: ThoughtCollection[];
  highlighted?: boolean;
  dimmed?: boolean;
  selected?: boolean;
  onOpen: (entry: BrainDumpEntry) => void;
};

/**
 * Thought Companion Box™ — icon, title, preview, collections, connections.
 */
export function ThoughtCompanionBox({
  entry,
  collections: collectionsProp,
  highlighted = false,
  dimmed = false,
  selected = false,
  onOpen,
}: Props) {
  const collections =
    collectionsProp ?? getCollectionsForThought(entry);
  const emoji = thoughtDisplayEmoji(entry.text);
  const title = thoughtTitle(entry);
  const preview = thoughtPreview(entry);
  const meta = thoughtCardMeta(entry);
  const chips = collectionChipsForThought(entry);
  const collectionState = resolveThoughtCollectionAuthority(entry);

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
            <p className="text-base font-semibold leading-snug text-[#1f1c19]">
              {title}
            </p>
          </div>

          {preview ? (
            <p className="mt-1 text-sm leading-relaxed text-[#6b635a] line-clamp-2">
              {preview}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap gap-1.5">
            {meta.hasReminder && meta.reminderLabel ? (
              <span className="thought-card-badge rounded-full bg-[#fffbeb] px-2 py-0.5 text-xs font-medium text-[#92400e]">
                🔔 {meta.reminderLabel}
              </span>
            ) : null}
            {meta.projectName ? (
              <span className="thought-card-badge rounded-full bg-[#eff6ff] px-2 py-0.5 text-xs font-medium text-[#1e40af]">
                🎯 {meta.projectName}
              </span>
            ) : null}
            {meta.connectedPerson ? (
              <span className="thought-card-badge rounded-full bg-[#fdf4ff] px-2 py-0.5 text-xs font-medium text-[#7e22ce]">
                👤 {meta.connectedPerson}
              </span>
            ) : null}
            {meta.archived ? (
              <span className="thought-card-badge rounded-full bg-[#f8fafc] px-2 py-0.5 text-xs font-medium text-[#64748b]">
                Resting
              </span>
            ) : null}
          </div>

          {collectionState.isUncategorized && collectionState.suggestion ? (
            <p className="mt-1.5 text-xs text-[#6b635a]">
              Suggested:{" "}
              <span className="font-medium text-[#1e4f4f]">
                {collectionState.suggestion.label}
                {collectionState.suggestion.lowConfidence
                  ? ""
                  : ` · ${collectionState.suggestion.confidence}%`}
              </span>
            </p>
          ) : null}

          {chips.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full border px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: c.palette.chipBg,
                    borderColor: c.palette.border,
                    color: c.palette.chipText,
                  }}
                >
                  {c.label}
                </span>
              ))}
            </div>
          ) : collections.length > 0 && chips.length === 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {collections.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full border border-[#c5ddd8] bg-[#f0f8f8]/80 px-2 py-0.5 text-xs font-medium text-[#1e4f4f]"
                >
                  {c.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}
