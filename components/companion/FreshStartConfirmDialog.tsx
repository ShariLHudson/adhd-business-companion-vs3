"use client";

import type { FreshStartCopy } from "@/lib/freshStartCopy";

type FreshStartConfirmDialogProps = {
  open: boolean;
  copy: FreshStartCopy;
  onConfirm: () => void;
  onCancel: () => void;
};

function CheckList({
  title,
  items,
  positive,
}: {
  title: string;
  items: string[];
  positive: boolean;
}) {
  return (
    <div className="mt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[#6b635a]">
        {title}
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm leading-snug text-[#3d3630]"
          >
            <span
              aria-hidden="true"
              className={
                positive ? "text-[#1e4f4f]" : "text-[#9a8f82]"
              }
            >
              {positive ? "✓" : "✗"}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FreshStartConfirmDialog({
  open,
  copy,
  onConfirm,
  onCancel,
}: FreshStartConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fresh-start-dialog-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#d4cdc3] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-2xl" aria-hidden="true">
          {copy.menuEmoji}
        </p>
        <h2
          id="fresh-start-dialog-title"
          className="mt-2 text-lg font-semibold text-[#1f1c19]"
        >
          {copy.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6b635a]">
          {copy.intro}
        </p>
        <CheckList title="This will" items={copy.willDo} positive />
        <CheckList title="This will NOT" items={copy.willNot} positive={false} />
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#c9bfb0] bg-white px-4 py-2 text-sm font-semibold text-[#4b463f] hover:bg-[#faf7f2]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
          >
            {copy.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
