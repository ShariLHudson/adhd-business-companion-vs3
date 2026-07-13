"use client";

import { useState } from "react";
import {
  createMemberRhythm,
  RHYTHM_CADENCE_OPTIONS,
  type RhythmCadence,
} from "@/lib/rhythms";
import { getPlanDayOwnerUserId } from "@/lib/planMyDay/planDayOwner";
import type { PlanDayItem } from "@/lib/planMyDay";

type Props = {
  item: PlanDayItem;
  onKeepDayItem: () => void;
  onRemoveDayItem: () => void;
  onCancel: () => void;
  /** Optional labels when converting from a previous day */
  keepLabel?: string;
  removeLabel?: string;
  doneHint?: string;
};

/**
 * Rhythms setup — convert a day item into a recurring rhythm with member choice.
 * Does not auto-convert; cadence and keep/remove are explicit.
 */
export function MyRhythmsSetupFlow({
  item,
  onKeepDayItem,
  onRemoveDayItem,
  onCancel,
  keepLabel = "Keep on today's plan",
  removeLabel = "Remove from today",
  doneHint,
}: Props) {
  const [cadence, setCadence] = useState<RhythmCadence | null>(null);
  const [customNote, setCustomNote] = useState("");
  const [created, setCreated] = useState(false);

  function handleCreate() {
    if (!cadence) return;
    createMemberRhythm({
      title: item.title,
      details: item.notes,
      cadence,
      customNote: cadence === "custom" ? customNote : undefined,
      sourcePlanItemId: item.id,
      ownerUserId: getPlanDayOwnerUserId(),
    });
    setCreated(true);
  }

  if (created) {
    return (
      <div
        className="rounded-2xl border border-[#e7dfd4] bg-white px-4 py-5"
        data-testid="my-rhythms-setup-done"
      >
        <p className="text-lg font-semibold text-[#1f1c19]">
          Rhythm saved
        </p>
        <p className="mt-2 text-base text-[#6b635a]">
          {doneHint ??
            `Would you like to keep “${item.title}” on today's plan, or remove it now that it has a rhythm?`}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onKeepDayItem}
            className="companion-btn-primary rounded-xl px-4 py-3 text-base font-semibold"
            data-testid="my-rhythms-keep-day-item"
          >
            {keepLabel}
          </button>
          <button
            type="button"
            onClick={onRemoveDayItem}
            className="rounded-xl border border-[#d4cdc3] px-4 py-3 text-base font-semibold text-[#4b463f]"
            data-testid="my-rhythms-remove-day-item"
          >
            {removeLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-[#e7dfd4] bg-white px-4 py-5"
      data-testid="my-rhythms-setup"
    >
      <p className="text-lg font-semibold text-[#1f1c19]">
        Convert to a Rhythm
      </p>
      <p className="mt-1 text-base text-[#6b635a]">
        How often should &ldquo;{item.title}&rdquo; return?
      </p>

      <ul className="mt-4 flex flex-col gap-2" role="radiogroup" aria-label="Rhythm cadence">
        {RHYTHM_CADENCE_OPTIONS.map((opt) => (
          <li key={opt.id}>
            <button
              type="button"
              role="radio"
              aria-checked={cadence === opt.id}
              onClick={() => setCadence(opt.id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-base ${
                cadence === opt.id
                  ? "border-[#1e4f4f] bg-[#f0f8f8] text-[#1f1c19]"
                  : "border-[#d4cdc3] bg-[#faf7f2] text-[#1f1c19] hover:border-[#1e4f4f]/40"
              }`}
              data-testid={`my-rhythms-cadence-${opt.id}`}
            >
              <span
                className={`inline-block h-4 w-4 shrink-0 rounded-full border-2 ${
                  cadence === opt.id
                    ? "border-[#1e4f4f] bg-[#1e4f4f]"
                    : "border-[#1e4f4f]"
                }`}
                aria-hidden
              />
              {opt.label}
            </button>
          </li>
        ))}
      </ul>

      {cadence === "custom" ? (
        <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-[#6b635a]">
          Custom rhythm
          <input
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Describe the rhythm in your own words"
            className="mt-1 w-full rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
          />
        </label>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCreate}
          disabled={!cadence || (cadence === "custom" && !customNote.trim())}
          className="companion-btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
          data-testid="my-rhythms-create"
        >
          Create Rhythm
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-[#d4cdc3] px-4 py-2.5 text-sm font-semibold text-[#4b463f]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
