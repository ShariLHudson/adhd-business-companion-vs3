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
import { groupSavedWinsByDate } from "@/lib/growthWinDateGroups";
import type { GrowthPanelNav } from "@/lib/growthNavigation";
import { GrowthInbox } from "@/components/companion/GrowthInbox";
import { GrowthAttachmentsField, GrowthAttachmentsList } from "@/components/companion/GrowthAttachmentsField";
import { GrowthSectionHeader } from "@/components/companion/GrowthSectionHeader";
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
  const [openDateGroup, setOpenDateGroup] = useState<string | null>(null);
  const [expandedWinId, setExpandedWinId] = useState<string | null>(null);
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
      if (!q) return true;
      return win.whatHappened.toLowerCase().includes(q);
    });
  }, [tick, search]);

  const dateGroups = useMemo(
    () => groupSavedWinsByDate(savedWins),
    [savedWins],
  );

  function handleAttachChange(win: SavedGrowthWin, next: GrowthAttachment[]) {
    updateSavedGrowthWin(win.id, { attachments: next });
    reload();
  }

  function closeAll() {
    setOpenDateGroup(null);
    setExpandedWinId(null);
    setAttachWinId(null);
    setPendingAttachments([]);
  }

  function toggleDateGroup(id: string) {
    setOpenDateGroup((current) => (current === id ? null : id));
    setExpandedWinId(null);
    setAttachWinId(null);
  }

  function toggleWin(id: string) {
    setExpandedWinId((current) => (current === id ? null : id));
    setAttachWinId(null);
  }

  function renderWin(win: SavedGrowthWin) {
    const expanded = expandedWinId === win.id;
    const savedEvidence = win.sourceId ? hasEvidenceForWin(win.sourceId) : false;

    return (
      <li
        key={win.id}
        className="overflow-hidden rounded-xl border border-[#e7d9c8] bg-white"
      >
        <button
          type="button"
          onClick={() => toggleWin(win.id)}
          className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-[#faf7f2]/80"
        >
          <span className="shrink-0 text-xs text-[#9a8f82]" aria-hidden>
            {expanded ? "▼" : "▶"}
          </span>
          <span aria-hidden="true">{win.icon}</span>
          <span className="min-w-0 flex-1 text-sm text-[#2f261f]">{win.whatHappened}</span>
        </button>
        {expanded ? (
          <div className="border-t border-[#efe8de] px-3 pb-3 pt-2">
            <GrowthAttachmentsList attachments={win.attachments} compact />
            <div className="mt-2 flex flex-wrap gap-2">
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
            {attachWinId === win.id ? (
              <div className="mt-3 border-t border-[#efe8de] pt-3">
                <GrowthAttachmentsField
                  attachments={win.attachments}
                  onAttachmentsChange={(next) => handleAttachChange(win, next)}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </li>
    );
  }

  return (
    <section className={workspacePanelShellClass({ width: "standard" })}>
      <GrowthSectionHeader
        nav={nav}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search wins…"
        onCloseAll={closeAll}
        toolsInMore
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

      {snapshot.stats.length > 0 ? (
        <details className="mt-4 rounded-2xl border border-[#e7d9c8] bg-white px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-[#6f6259]">
            Activity summary — {snapshot.weekLabel}
          </summary>
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
        </details>
      ) : null}

      <div className="mt-5">
        <h3 className="text-sm font-bold text-[#2f261f]">Your wins</h3>
        {pendingAttachments.length > 0 && !savedWins.length ? (
          <p className="mt-2 text-xs text-[#9a8f82]">
            {pendingAttachments.length} file(s) ready — save a win from Growth Inbox first.
          </p>
        ) : null}
        {dateGroups.length === 0 ? (
          <p className="mt-3 text-sm text-[#6f6259]">
            No wins yet. Review items in Growth Inbox above.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {dateGroups.map((group) => {
              const groupOpen = openDateGroup === group.id;
              return (
                <div
                  key={group.id}
                  className="overflow-hidden rounded-2xl border border-[#e7d9c8] bg-[#faf7f2]/50"
                >
                  <button
                    type="button"
                    onClick={() => toggleDateGroup(group.id)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-[#faf7f2]"
                  >
                    <span className="text-sm text-[#9a8f82]" aria-hidden>
                      {groupOpen ? "▼" : "▶"}
                    </span>
                    <span className="text-sm font-semibold text-[#2f261f]">
                      {group.label}
                    </span>
                    <span className="ml-auto text-xs text-[#9a8f82]">
                      {group.wins.length}
                    </span>
                  </button>
                  {groupOpen ? (
                    <ul className="space-y-2 border-t border-[#efe8de] p-3">
                      {group.wins.map((win) => renderWin(win))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {history.length > 0 ? (
        <details className="mt-4 rounded-2xl border border-[#e7d9c8] bg-[#faf7f2]/50 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-[#6f6259]">
            Previous weeks
          </summary>
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
        </details>
      ) : null}
    </section>
  );
}
