"use client";

import type { PendingClassification } from "@/lib/brainDumpClusterPreferences";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { ThoughtCategoryPicker } from "@/components/companion/ThoughtCategoryPicker";

export function ClassificationReviewCard({
  entry,
  pending,
  onApprove,
  onCategoryChange,
}: {
  entry: BrainDumpEntry;
  pending: PendingClassification;
  onApprove: (final: PendingClassification) => void;
  onCategoryChange: (category: string) => void;
}) {
  const category = pending.category ?? entry.category ?? "Other";

  return (
    <div
      className="rounded-xl border border-[#b45309]/30 bg-[#fffbf5] px-4 py-3"
      data-testid={`classification-review-${entry.id}`}
    >
      <p className="text-base font-medium text-[#1f1c19]">{entry.text}</p>
      <p className="mt-1 text-sm text-[#6b635a]">
        Suggested: {pending.topic ?? "—"} · {pending.category ?? "Other"}
      </p>
      <div className="mt-3">
        <ThoughtCategoryPicker value={category} onChange={onCategoryChange} />
      </div>
      <button
        type="button"
        onClick={() =>
          onApprove({
            ...pending,
            category,
          })
        }
        className="mt-3 rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
        data-testid="approve-classification"
      >
        Approve category
      </button>
    </div>
  );
}
