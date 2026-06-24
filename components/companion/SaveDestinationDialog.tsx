"use client";

import { useEffect, useState } from "react";
import {
  SAVE_DESTINATION_OPTIONS,
  saveDestinationLabel,
  type SaveDestinationId,
} from "@/lib/saveDestinations";

type SaveDestinationDialogProps = {
  open: boolean;
  title?: string;
  suggested?: SaveDestinationId;
  suggestionReason?: string;
  onSave: (destination: SaveDestinationId) => void;
  onCancel: () => void;
};

export function SaveDestinationDialog({
  open,
  title = "Save To",
  suggested,
  suggestionReason,
  onSave,
  onCancel,
}: SaveDestinationDialogProps) {
  const [selected, setSelected] = useState<SaveDestinationId>(
    suggested ?? "visual-thinking",
  );

  useEffect(() => {
    if (open && suggested) setSelected(suggested);
  }, [open, suggested]);

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
        aria-labelledby="save-destination-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#d4cdc3] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="save-destination-dialog"
      >
        <h2 id="save-destination-title" className="text-xl font-bold text-[#1f1c19]">
          {title}
        </h2>
        {suggestionReason && suggested ? (
          <div className="mt-3 rounded-xl border border-[#c5e0e0] bg-[#f0f8f8] px-3 py-2 text-sm text-[#1f1c19]">
            <p className="font-semibold">Suggested:</p>
            <p className="mt-0.5 text-[#1e4f4f]">
              ✓ {saveDestinationLabel(suggested)}
            </p>
            <p className="mt-1 text-[#6b635a]">{suggestionReason}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-[#6b635a]">
            Choose where to keep this. You make the final choice.
          </p>
        )}
        <fieldset className="mt-4 space-y-2">
          <legend className="sr-only">Save destination</legend>
          {SAVE_DESTINATION_OPTIONS.map((option) => (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${
                selected === option.id
                  ? "border-[#1e4f4f] bg-[#f0f5f5]"
                  : "border-[#e7dfd4] bg-white"
              }`}
            >
              <input
                type="radio"
                name="save-destination"
                value={option.id}
                checked={selected === option.id}
                onChange={() => setSelected(option.id)}
                className="accent-[#1e4f4f]"
              />
              <span className="text-sm font-semibold text-[#1f1c19]">
                {option.label}
              </span>
            </label>
          ))}
        </fieldset>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSave(selected)}
            className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c]"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#d7c8b8] bg-white px-4 py-2.5 text-sm font-semibold text-[#6b635a] hover:bg-[#fff8ef]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
