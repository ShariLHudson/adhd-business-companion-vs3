"use client";

import { useEffect, useState } from "react";
import { CreativeStudioRoomShell } from "@/components/companion/CreativeStudioRoomShell";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import { GrowthAttachmentsField } from "@/components/companion/GrowthAttachmentsField";
import {
  deletePortfolioEntry,
  getPortfolioEntries,
  GROWTH_PORTFOLIO_UPDATED_EVENT,
  type PortfolioEntry,
} from "@/lib/growthPortfolioStore";
import type { GrowthPanelNav } from "@/lib/growthNavigation";
import "@/app/companion/creative-studio-room.css";

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
    <CreativeStudioRoomShell>
      <EstateWorkspace>
        <GrowthPanelBackButton onBack={nav.onBack} label={nav.backLabel ?? "My Story"} />

        <header className="creative-studio-room__header">
          <p className="estate-workspace__kicker">Creative Studio</p>
          <h1 className="estate-workspace__title">Creative Portfolio</h1>
          <p className="estate-workspace__lead">
            A place for your ideas, projects, courses, businesses and creative work to grow.
          </p>
        </header>

        {entries.length === 0 ? (
          <p className="creative-studio-room__empty">
            Your gallery is waiting. Capture something you made from Growth — file to Portfolio.
          </p>
        ) : (
          <ul className="creative-studio-room__grid">
            {entries.map((entry) => {
              const cover = entry.attachments.find((a) => a.kind === "image");
              return (
                <li key={entry.id} className="creative-studio-room__card">
                  {cover?.url ? (
                    <img
                      src={cover.url}
                      alt=""
                      className="creative-studio-room__card-cover"
                    />
                  ) : (
                    <div className="creative-studio-room__card-placeholder" aria-hidden />
                  )}
                  <div className="creative-studio-room__card-body">
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
      </EstateWorkspace>
    </CreativeStudioRoomShell>
  );
}
