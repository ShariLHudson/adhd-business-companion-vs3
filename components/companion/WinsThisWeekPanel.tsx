"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildWeeklyWins,
  formatWeeklyWinLine,
  getWeeklyWinsHistory,
} from "@/lib/weeklyWins";
import { hasEvidenceForWin } from "@/lib/evidenceBankStore";
import {
  getSavedGrowthWins,
  updateSavedGrowthWin,
  SAVED_GROWTH_WINS_UPDATED_EVENT,
  type SavedGrowthWin,
} from "@/lib/growthWinsStore";
import { buildSuggestedGrowthMoments } from "@/lib/suggestedGrowthMoments";
import {
  isInGrowthArchivePeriod,
  type GrowthArchivePeriod,
} from "@/lib/growthArchive";
import type { GrowthPanelNav } from "@/lib/growthNavigation";
import { GrowthInbox } from "@/components/companion/GrowthInbox";
import { GrowthAttachmentsField, GrowthAttachmentsList } from "@/components/companion/GrowthAttachmentsField";
import {
  GrowthArchiveBar,
  GrowthSectionHeader,
} from "@/components/companion/GrowthSectionHeader";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";
import type { GrowthAttachment } from "@/lib/growthAttachments";

export function WinsThisWeekPanel({
  refreshKey = 0,
  nav,
  onSaveToEvidenceBank,
  onSaveEvidence,
  onSaveProof,
  onSaveJourney,
}: {
  refreshKey?: string | number;
  nav: GrowthPanelNav;
  onSaveToEvidenceBank?: (whatHappened: string, sourceWinId: string) => void;
  onSaveEvidence: (text: string, sourceId: string) => void;
  onSaveProof: (text: string) => void;
  onSaveJourney: (text: string) => void;
}) {
  const [tick, setTick] = useState(0);
  const [search, setSearch] = useState("");
  const [archivePeriod, setArchivePeriod] = useState<GrowthArchivePeriod>("week");
  const [attachWinId, setAttachWinId] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<GrowthAttachment[]>([]);

  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  useEffect(() => {
    const onUpdate = () => reload();
    window.addEventListener(SAVED_GROWTH_WINS_UPDATED_EVENT, onUpdate);
    return () =>
      window.removeEventListener(SAVED_GROWTH_WINS_UPDATED_EVENT, onUpdate);
  }, [reload]);

  const snapshot = useMemo(() => buildWeeklyWins(), [tick]);
  const history = useMemo(() => getWeeklyWinsHistory(), [tick]);
  const inboxItems = useMemo(() => buildSuggestedGrowthMoments(), [tick]);
  const savedWins = useMemo(() => {
    const q = search.trim().toLowerCase();
    return getSavedGrowthWins().filter((win) => {
      if (!isInGrowthArchivePeriod(win.ts, archivePeriod)) return false;
      if (!q) return true;
      return win.whatHappened.toLowerCase().includes(q);
    });
  }, [tick, search, archivePeriod]);

  function handleAttachChange(win: SavedGrowthWin, next: GrowthAttachment[]) {
    updateSavedGrowthWin(win.id, { attachments: next });
    reload();
  }

  function closeAll() {
    setAttachWinId(null);
    setPendingAttachments([]);
  }

  return (
    <section className={workspacePanelShellClass({ width: "standard" })}>
      <GrowthSectionHeader
        nav={nav}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search wins…"
        onCloseAll={closeAll}
        onQuickAttach={(atts) => {
          setPendingAttachments((prev) => [...prev, ...atts]);
          if (savedWins[0]) {
            updateSavedGrowthWin(savedWins[0].id, {
              attachments: [...savedWins[0].attachments, ...atts],
            });
            reload();
          }
        }}
      />

      <WorkspaceAreaWorksGuide areaId="wins-this-week" />

      <div className="mt-4">
        <GrowthInbox
          items={inboxItems}
          onUpdate={reload}
          onSaveEvidence={onSaveEvidence}
          onSaveProof={onSaveProof}
          onSaveJourney={onSaveJourney}
        />
      </div>

      <div className="mt-4">
        <GrowthArchiveBar period={archivePeriod} onPeriodChange={setArchivePeriod} />
      </div>

      <div className="mt-5 rounded-3xl border border-[#e7d9c8] bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          {snapshot.weekLabel}
        </p>
        {snapshot.stats.length === 0 ? (
          <p className="mt-3 text-sm text-[#6f6259]">
            Activity summary will appear here as you work.
          </p>
        ) : (
          <>
            <p className="mt-2 text-xs text-[#9a8f82]">Activity this week (summary)</p>
            <ul className="mt-2 space-y-2">
              {snapshot.stats.map((stat) => (
                <li
                  key={stat.id}
                  className="flex items-start gap-2 text-sm text-[#6f6259]"
                >
                  <span aria-hidden="true">{stat.icon}</span>
                  <span>{formatWeeklyWinLine(stat)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="mt-4 rounded-3xl border border-[#e7d9c8] bg-[#faf7f2] p-5">
        <h3 className="text-sm font-bold text-[#2f261f]">Your wins</h3>
        <p className="mt-1 text-xs text-[#6f6259]">
          Confirmed wins — attach proof when you have it.
        </p>
        {pendingAttachments.length > 0 && !savedWins.length ? (
          <p className="mt-2 text-xs text-[#9a8f82]">
            {pendingAttachments.length} file(s) ready — save a win from Growth Inbox first.
          </p>
        ) : null}
        {savedWins.length === 0 ? (
          <p className="mt-3 text-sm text-[#6f6259]">
            No wins in this period. Review items in Growth Inbox above.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {savedWins.map((win) => {
              const savedEvidence = win.sourceId
                ? hasEvidenceForWin(win.sourceId)
                : false;
              return (
                <li
                  key={win.id}
                  className="rounded-2xl border border-[#e7d9c8] bg-white px-3 py-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-2 text-sm text-[#2f261f]">
                      <span aria-hidden="true">{win.icon}</span>
                      <div className="min-w-0">
                        <span>{win.whatHappened}</span>
                        <GrowthAttachmentsList
                          attachments={win.attachments}
                          compact
                        />
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setAttachWinId((id) => (id === win.id ? null : win.id))
                        }
                        className="rounded-full border border-[#e7d9c8] bg-[#faf7f2] px-3 py-1.5 text-xs font-semibold text-[#2f261f]"
                      >
                        {attachWinId === win.id ? "Hide attach" : "Attach"}
                      </button>
                      {onSaveToEvidenceBank && win.sourceId && !savedEvidence ? (
                        <button
                          type="button"
                          onClick={() =>
                            onSaveToEvidenceBank(win.whatHappened, win.sourceId!)
                          }
                          className="rounded-full border border-[#e7d9c8] bg-[#faf7f2] px-3 py-1.5 text-xs font-semibold text-[#2f261f]"
                        >
                          Save to Evidence
                        </button>
                      ) : savedEvidence ? (
                        <span className="self-center text-xs font-semibold text-[#9a8f82]">
                          In Evidence Bank
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {attachWinId === win.id ? (
                    <div className="mt-3 border-t border-[#efe8de] pt-3">
                      <GrowthAttachmentsField
                        attachments={win.attachments}
                        onAttachmentsChange={(next) =>
                          handleAttachChange(win, next)
                        }
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {history.length > 0 ? (
        <div className="mt-4 rounded-3xl border border-[#e7d9c8] bg-[#faf7f2] p-5">
          <h3 className="text-sm font-bold text-[#2f261f]">Previous weeks</h3>
          <ul className="mt-3 space-y-3">
            {history.slice(0, 8).map((entry) => (
              <li key={entry.weekKey} className="text-sm text-[#2f261f]">
                <p className="font-semibold">{entry.weekLabel}</p>
                {entry.stats.length === 0 ? (
                  <p className="mt-0.5 text-xs text-[#6f6259]">No activity recorded</p>
                ) : (
                  <ul className="mt-1 space-y-0.5 text-xs text-[#6b635a]">
                    {entry.stats.map((stat) => (
                      <li key={stat.id}>{formatWeeklyWinLine(stat)}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
