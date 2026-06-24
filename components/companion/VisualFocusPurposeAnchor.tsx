"use client";

import { purposeQuestionForMode } from "@/lib/companionEntry/purposeAnchor";
import { BUSINESS_CANVAS_INTRO_SUPPORT } from "@/lib/visualFocus/businessCanvas/copy";
import { studioCardTitleForMode } from "@/lib/visualFocus/studioCards";
import type { VisualFocusMode } from "@/lib/visualFocus";

export function VisualFocusPurposeAnchor({
  mode,
  onCancel,
  onConfirm,
}: {
  mode: VisualFocusMode;
  onCancel: () => void;
  onConfirm: (answer: string) => void;
}) {
  const question = purposeQuestionForMode(mode);
  const title = studioCardTitleForMode(mode);
  const supportCopy =
    mode === "business-canvas"
      ? BUSINESS_CANVAS_INTRO_SUPPORT
      : "This becomes your map title and helps Shari guide you.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="visual-focus-purpose-anchor-title"
      data-testid="visual-focus-purpose-anchor"
    >
      <form
        className="w-full max-w-md rounded-2xl border border-[#e7dfd4] bg-white p-6 shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();
          const answer = new FormData(e.currentTarget).get("purpose") as string;
          if (answer?.trim()) onConfirm(answer.trim());
        }}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
          {title}
        </p>
        <h2
          id="visual-focus-purpose-anchor-title"
          className="mt-1 text-lg font-semibold text-[#1f1c19]"
        >
          {question}
        </h2>
        <p className="mt-1 text-sm text-[#6b635a]">{supportCopy}</p>
        <textarea
          name="purpose"
          required
          rows={3}
          autoFocus
          placeholder="Type your answer…"
          className="mt-4 w-full resize-none rounded-xl border border-[#c9bfb0] bg-[#faf7f2] px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
        />
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c]"
          >
            Start map
          </button>
        </div>
      </form>
    </div>
  );
}
