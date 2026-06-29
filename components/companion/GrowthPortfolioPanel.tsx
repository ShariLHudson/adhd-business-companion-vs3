"use client";

import { useEffect, useState } from "react";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import { GrowthAttachmentsField } from "@/components/companion/GrowthAttachmentsField";
import {
  deletePortfolioEntry,
  getPortfolioEntries,
  GROWTH_PORTFOLIO_UPDATED_EVENT,
  type PortfolioEntry,
} from "@/lib/growthPortfolioStore";
import type { GrowthPanelNav } from "@/lib/growthNavigation";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function GrowthPortfolioPanel({
  nav,
}: {
  refreshKey?: string;
  nav: GrowthPanelNav;
}) {
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);

  useEffect(() => {
    const load = () => setEntries(getPortfolioEntries());
    load();
    window.addEventListener(GROWTH_PORTFOLIO_UPDATED_EVENT, load);
    return () => window.removeEventListener(GROWTH_PORTFOLIO_UPDATED_EVENT, load);
  }, []);

  return (
    <div className="min-h-full bg-gradient-to-b from-[#fff9f0] to-[#f5ebe0] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <GrowthPanelBackButton onBack={nav.onBack} label={nav.backLabel} />
        <header className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#b45309]">
            Creative studio
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#2f261f]">Portfolio</h1>
          <p className="mt-1 text-sm text-[#6f6259]">
            What you&apos;ve created — projects, courses, campaigns, and creative work.
          </p>
        </header>

        {entries.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[#e7d9c8] bg-white/70 px-5 py-8 text-center text-sm text-[#6f6259]">
            Your gallery is waiting. Capture something you made from Growth — file to Portfolio.
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {entries.map((entry) => {
              const cover = entry.attachments.find((a) => a.kind === "image");
              return (
                <li
                  key={entry.id}
                  className="overflow-hidden rounded-2xl border border-[#e7d9c8] bg-white shadow-sm"
                >
                  {cover?.url ? (
                    <img
                      src={cover.url}
                      alt=""
                      className="h-36 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 text-3xl">
                      ✦
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="font-bold text-[#2f261f]">{entry.title}</h2>
                    <time className="text-[10px] font-semibold uppercase tracking-wide text-[#9a8f82]">
                      {formatDate(entry.createdAt)}
                    </time>
                    {entry.description ? (
                      <p className="mt-2 line-clamp-3 text-sm text-[#4b463f]">
                        {entry.description}
                      </p>
                    ) : null}
                    {entry.attachments.length > 0 ? (
                      <div className="mt-2">
                        <GrowthAttachmentsField
                          attachments={entry.attachments}
                          onAttachmentsChange={() => {}}
                        />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      className="mt-2 text-xs font-semibold text-[#9a6b6b] hover:underline"
                      onClick={() => deletePortfolioEntry(entry.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
