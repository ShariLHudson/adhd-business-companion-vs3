"use client";

import { useState } from "react";
import {
  CLASSIFICATION_LABELS,
  ignoreSuggestedMoment,
  markSuggestedMomentProcessed,
  type SuggestedGrowthMoment,
} from "@/lib/suggestedGrowthMoments";
import { createSavedGrowthWin } from "@/lib/growthWinsStore";
import type { GrowthAttachment } from "@/lib/growthAttachments";
import { GrowthAttachmentsField } from "@/components/companion/GrowthAttachmentsField";

const INPUT_CLASS =
  "mt-1 w-full rounded-xl border border-[#e4ddd2] bg-white px-3 py-2.5 text-sm text-[#2d2926] focus:border-[#c9a66b] focus:outline-none focus:ring-2 focus:ring-[#c9a66b]/25";

const PRIMARY_BTN =
  "rounded-full bg-[#2f261f] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1f1c19]";

const SECONDARY_BTN =
  "rounded-full border border-[#e7d9c8] bg-[#faf7f2] px-2.5 py-1 text-[11px] font-semibold text-[#2f261f] hover:bg-[#f3ebe0]";

function InboxItemActions({
  editing,
  onSaveWin,
  onSaveEvidence,
  onSavePortfolio,
  onSaveJourney,
  onEditToggle,
  onDismiss,
}: {
  editing: boolean;
  onSaveWin: () => void;
  onSaveEvidence: () => void;
  onSavePortfolio: () => void;
  onSaveJourney: () => void;
  onEditToggle: () => void;
  onDismiss: () => void;
}) {
  const [elsewhereOpen, setElsewhereOpen] = useState(false);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <button type="button" className={PRIMARY_BTN} onClick={onSaveWin}>
        Save as Win
      </button>
      <div className="relative">
        <button
          type="button"
          className={SECONDARY_BTN}
          onClick={() => setElsewhereOpen((v) => !v)}
          aria-expanded={elsewhereOpen}
        >
          Save elsewhere ▾
        </button>
        {elsewhereOpen ? (
          <div className="absolute left-0 top-full z-10 mt-1 min-w-[10rem] rounded-xl border border-[#e7d9c8] bg-white py-1 shadow-lg">
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-xs font-semibold text-[#2f261f] hover:bg-[#faf7f2]"
              onClick={() => {
                setElsewhereOpen(false);
                onSaveEvidence();
              }}
            >
              Evidence
            </button>
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-xs font-semibold text-[#2f261f] hover:bg-[#faf7f2]"
              onClick={() => {
                setElsewhereOpen(false);
                onSavePortfolio();
              }}
            >
              Portfolio
            </button>
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-xs font-semibold text-[#2f261f] hover:bg-[#faf7f2]"
              onClick={() => {
                setElsewhereOpen(false);
                onSaveJourney();
              }}
            >
              Journey
            </button>
          </div>
        ) : null}
      </div>
      <button type="button" className={SECONDARY_BTN} onClick={onEditToggle}>
        {editing ? "Cancel" : "Edit"}
      </button>
      <button
        type="button"
        className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#9a8f82] hover:text-[#6f6259]"
        onClick={onDismiss}
      >
        Dismiss
      </button>
    </div>
  );
}

export function GrowthInbox({
  items,
  onUpdate,
  onSaveEvidence,
  onSaveProof,
  onSaveJourney,
}: {
  items: SuggestedGrowthMoment[];
  onUpdate: () => void;
  onSaveEvidence: (text: string, sourceId: string) => void;
  onSaveProof: (text: string) => void;
  onSaveJourney: (text: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editAttachments, setEditAttachments] = useState<GrowthAttachment[]>([]);

  function finish(sourceId: string) {
    markSuggestedMomentProcessed(sourceId);
    setEditingId(null);
    setEditText("");
    setEditAttachments([]);
    onUpdate();
  }

  function dismiss(item: SuggestedGrowthMoment) {
    ignoreSuggestedMoment(item.sourceId);
    if (editingId === item.id) setEditingId(null);
    onUpdate();
  }

  function textFor(item: SuggestedGrowthMoment) {
    return editingId === item.id ? editText.trim() : item.whatHappened;
  }

  function saveAsWin(item: SuggestedGrowthMoment) {
    const text = textFor(item);
    if (!text) return;
    createSavedGrowthWin({
      whatHappened: text,
      ts: item.ts,
      icon: item.icon,
      sourceId: item.sourceId,
      classification: item.classification,
      attachments: editingId === item.id ? editAttachments : [],
    });
    finish(item.sourceId);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[#e7d9c8] bg-[#faf7f2]/40 px-4 py-5 text-center text-sm text-[#6f6259]">
        Growth Inbox is clear — meaningful moments will appear here for review.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#e7d9c8] bg-[#faf7f2] p-5">
      <h3 className="text-sm font-bold text-[#2f261f]">Growth Inbox</h3>
      <p className="mt-1 text-xs text-[#6f6259]">
        Potential growth items — save where they belong or dismiss what doesn&apos;t count.
      </p>
      <ul className="mt-3 space-y-3">
        {items.map((item) => {
          const editing = editingId === item.id;
          return (
            <li
              key={item.id}
              className="rounded-2xl border border-[#e7d9c8] bg-white p-4"
            >
              <span className="rounded-full bg-[#faf7f2] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#9a8f82]">
                {CLASSIFICATION_LABELS[item.classification]}
              </span>
              <div className="mt-2 flex items-start gap-2 text-sm text-[#2f261f]">
                <span aria-hidden="true">{item.icon}</span>
                {editing ? (
                  <textarea
                    rows={2}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className={INPUT_CLASS}
                  />
                ) : (
                  <span>{item.whatHappened}</span>
                )}
              </div>
              {editing ? (
                <div className="mt-3">
                  <GrowthAttachmentsField
                    attachments={editAttachments}
                    onAttachmentsChange={setEditAttachments}
                  />
                </div>
              ) : null}
              <InboxItemActions
                editing={editing}
                onSaveWin={() => saveAsWin(item)}
                onSaveEvidence={() => {
                  const text = textFor(item);
                  if (!text) return;
                  onSaveEvidence(text, item.sourceId);
                  finish(item.sourceId);
                }}
                onSavePortfolio={() => {
                  const text = textFor(item);
                  if (!text) return;
                  onSaveProof(text);
                  finish(item.sourceId);
                }}
                onSaveJourney={() => {
                  const text = textFor(item);
                  if (!text) return;
                  onSaveJourney(text);
                  finish(item.sourceId);
                }}
                onEditToggle={() =>
                  editing
                    ? setEditingId(null)
                    : (setEditingId(item.id), setEditText(item.whatHappened))
                }
                onDismiss={() => dismiss(item)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
