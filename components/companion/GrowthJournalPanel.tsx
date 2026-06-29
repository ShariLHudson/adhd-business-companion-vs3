"use client";

import { useEffect, useState } from "react";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import { GrowthAttachmentsField } from "@/components/companion/GrowthAttachmentsField";
import {
  deleteJournalEntry,
  getJournalEntries,
  GROWTH_JOURNAL_UPDATED_EVENT,
  type JournalEntry,
} from "@/lib/growthJournalStore";
import type { GrowthPanelNav } from "@/lib/growthNavigation";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function GrowthJournalPanel({
  nav,
}: {
  refreshKey?: string;
  nav: GrowthPanelNav;
}) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const load = () => setEntries(getJournalEntries());
    load();
    window.addEventListener(GROWTH_JOURNAL_UPDATED_EVENT, load);
    return () => window.removeEventListener(GROWTH_JOURNAL_UPDATED_EVENT, load);
  }, []);

  return (
    <div className="min-h-full bg-gradient-to-b from-[#f8f4ed] to-[#efe8de] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <GrowthPanelBackButton onBack={nav.onBack} label={nav.backLabel} />
        <header className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            Quiet writing room
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#2f261f]">Journal</h1>
          <p className="mt-1 text-sm text-[#6f6259]">
            Private reflection — no required prompts. Capture from Growth when something is worth keeping.
          </p>
        </header>

        {entries.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[#e7d9c8] bg-white/60 px-5 py-8 text-center text-sm text-[#6f6259]">
            Nothing here yet. Use &ldquo;What&apos;s worth keeping?&rdquo; in Growth — file to Journal when it feels personal.
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-2xl border border-[#e7d9c8] bg-white p-5 shadow-sm"
              >
                <time className="text-xs font-semibold text-[#9a8f82]">
                  {formatDate(entry.createdAt)}
                </time>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#2f261f]">
                  {entry.body}
                </p>
                {entry.attachments.length > 0 ? (
                  <div className="mt-3">
                    <GrowthAttachmentsField
                      attachments={entry.attachments}
                      onAttachmentsChange={() => {}}
                    />
                  </div>
                ) : null}
                <button
                  type="button"
                  className="mt-3 text-xs font-semibold text-[#9a6b6b] hover:underline"
                  onClick={() => deleteJournalEntry(entry.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
