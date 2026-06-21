"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildGrowthTimeline,
  getGrowthSummary,
  hasGrowthData,
  searchGrowthItems,
  type GrowthFilter,
  type GrowthTimelineGroup,
  type GrowthTimelineItem,
} from "@/lib/growthCenter";
import { EVIDENCE_BANK_UPDATED_EVENT } from "@/lib/evidenceBankStore";
import { CONFIDENCE_VAULT_UPDATED_EVENT } from "@/lib/confidenceVaultStore";
import { MY_JOURNEY_UPDATED_EVENT } from "@/lib/myJourneyStore";
import { workspacePanelShellClass } from "@/lib/workspaceLayoutTokens";

const FILTERS: { id: GrowthFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wins", label: "Wins" },
  { id: "evidence", label: "Evidence" },
];

const FUTURE_FILTERS: { label: string; note: string }[] = [];

function SummaryCard({
  emoji,
  title,
  lines,
  actionLabel,
  onAction,
  muted,
}: {
  emoji: string;
  title: string;
  lines: string[];
  actionLabel?: string;
  onAction?: () => void;
  muted?: boolean;
}) {
  return (
    <article
      className={`flex flex-col rounded-2xl border p-4 ${
        muted
          ? "border-dashed border-[#e7d9c8] bg-[#faf7f2]/40"
          : "border-[#e7d9c8] bg-white"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-xl" aria-hidden="true">
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-[#2f261f]">{title}</h3>
          {lines.map((line) => (
            <p key={line} className="mt-1 text-sm text-[#6f6259]">
              {line}
            </p>
          ))}
        </div>
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 self-start rounded-full border border-[#e7d9c8] bg-[#faf7f2] px-3 py-1.5 text-xs font-semibold text-[#2f261f] hover:bg-[#f3ebe0]"
        >
          {actionLabel}
        </button>
      ) : null}
    </article>
  );
}

function TimelineList({
  groups,
  emptyMessage,
}: {
  groups: GrowthTimelineGroup[];
  emptyMessage: string;
}) {
  if (groups.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[#e7d9c8] bg-[#faf7f2]/50 px-4 py-5 text-center text-sm text-[#6f6259]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {groups.map((group) => (
        <li key={group.dateLabel}>
          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            {group.dateLabel}
          </p>
          <ul className="mt-2 space-y-2">
            {group.items.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-2 rounded-xl border border-[#efe8de] bg-white px-3 py-2.5 text-sm text-[#2f261f]"
              >
                <span aria-hidden="true">{item.kind === "win" ? "✓" : "📈"}</span>
                <div className="min-w-0">
                  <p>{item.title}</p>
                  {item.subtitle ? (
                    <p className="mt-0.5 text-xs text-[#6f6259]">{item.subtitle}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function groupSearchResults(items: GrowthTimelineItem[]): GrowthTimelineGroup[] {
  const groups = new Map<string, GrowthTimelineItem[]>();
  for (const item of items) {
    const list = groups.get(item.dateLabel) ?? [];
    list.push(item);
    groups.set(item.dateLabel, list);
  }
  return Array.from(groups.entries()).map(([dateLabel, groupItems]) => ({
    dateLabel,
    items: groupItems,
  }));
}

export function GrowthCenterPanel({
  refreshKey = 0,
  onOpenWins,
  onOpenEvidence,
  onOpenConfidence,
  onOpenJourney,
}: {
  refreshKey?: string | number;
  onOpenWins: () => void;
  onOpenEvidence: () => void;
  onOpenConfidence: () => void;
  onOpenJourney: () => void;
}) {
  const [filter, setFilter] = useState<GrowthFilter>("all");
  const [search, setSearch] = useState("");
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  useEffect(() => {
    const onUpdate = () => reload();
    window.addEventListener(EVIDENCE_BANK_UPDATED_EVENT, onUpdate);
    window.addEventListener(CONFIDENCE_VAULT_UPDATED_EVENT, onUpdate);
    window.addEventListener(MY_JOURNEY_UPDATED_EVENT, onUpdate);
    return () => {
      window.removeEventListener(EVIDENCE_BANK_UPDATED_EVENT, onUpdate);
      window.removeEventListener(CONFIDENCE_VAULT_UPDATED_EVENT, onUpdate);
      window.removeEventListener(MY_JOURNEY_UPDATED_EVENT, onUpdate);
    };
  }, [reload]);

  const summary = useMemo(() => getGrowthSummary(), [tick]);
  const hasData = useMemo(() => hasGrowthData(), [tick]);
  const timeline = useMemo(
    () => buildGrowthTimeline(filter),
    [filter, tick],
  );
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    return groupSearchResults(searchGrowthItems(search, filter));
  }, [search, filter, tick]);

  const winLine =
    summary.winCount === 1
      ? "1 win recorded"
      : `${summary.winCount} wins recorded`;
  const evidenceLine =
    summary.evidenceTotal === 1
      ? "1 entry"
      : `${summary.evidenceTotal} entries`;
  const evidenceDetail =
    summary.problemsSolved > 0 || summary.thingsImproved > 0
      ? [
          summary.problemsSolved > 0
            ? `${summary.problemsSolved} problem${summary.problemsSolved === 1 ? "" : "s"} solved`
            : null,
          summary.thingsImproved > 0
            ? `${summary.thingsImproved} thing${summary.thingsImproved === 1 ? "" : "s"} improved`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <section className={workspacePanelShellClass({ width: "standard" })}>
      <div>
        <h2 className="text-3xl font-bold text-[#2f261f]">🌱 Growth</h2>
        <p className="mt-1 text-[#6f6259]">
          Track progress, impact, confidence, and personal growth over time.
        </p>
      </div>

      {!hasData ? (
        <div className="mt-6 rounded-3xl border border-[#e7d9c8] bg-gradient-to-b from-[#faf7f2] to-white p-6 text-center">
          <p className="text-lg font-semibold text-[#2f261f]">
            Start building your Growth Center.
          </p>
          <p className="mt-2 text-sm text-[#6f6259]">
            Capture a win, save evidence, and watch your progress accumulate over
            time.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={onOpenWins}
              className="rounded-full bg-[#2f261f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d342c]"
            >
              Open Wins This Week
            </button>
            <button
              type="button"
              onClick={onOpenEvidence}
              className="rounded-full border border-[#e7d9c8] bg-white px-4 py-2 text-sm font-semibold text-[#2f261f] hover:bg-[#faf7f2]"
            >
              Open Evidence Bank
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <SummaryCard
          emoji="🏆"
          title="Wins This Week"
          lines={[
            summary.weekLabel,
            winLine,
          ]}
          actionLabel="Open Wins"
          onAction={onOpenWins}
        />
        <SummaryCard
          emoji="📈"
          title="Evidence Bank"
          lines={
            evidenceDetail
              ? [evidenceLine, evidenceDetail]
              : [evidenceLine]
          }
          actionLabel="Open Evidence Bank"
          onAction={onOpenEvidence}
        />
        <SummaryCard
          emoji="💎"
          title="Confidence Vault"
          lines={[
            summary.confidenceTotal === 1
              ? "1 item saved"
              : `${summary.confidenceTotal} items saved`,
            summary.confidenceFavorites > 0
              ? `${summary.confidenceFavorites} most meaningful`
              : "Proof of your value and expertise",
          ]}
          actionLabel="Open Confidence Vault"
          onAction={onOpenConfidence}
        />
        <SummaryCard
          emoji="🌿"
          title="My Journey"
          lines={[
            summary.journeyTotal === 1
              ? "1 story preserved"
              : `${summary.journeyTotal} stories preserved`,
            summary.journeyChapters > 0
              ? `${summary.journeyChapters} chapters`
              : "Your experiences, lessons, and wisdom",
          ]}
          actionLabel="Open My Journey"
          onAction={onOpenJourney}
        />
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wins and evidence…"
            className="min-w-[12rem] flex-1 rounded-full border border-[#e4ddd2] bg-white px-4 py-2 text-sm text-[#2d2926] placeholder:text-[#9a8f82] focus:border-[#c9a66b] focus:outline-none focus:ring-2 focus:ring-[#c9a66b]/25"
            aria-label="Search growth items"
          />
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  filter === f.id
                    ? "bg-[#2f261f] text-white"
                    : "border border-[#e7d9c8] bg-white text-[#6f6259] hover:bg-[#faf7f2]"
                }`}
              >
                {f.label}
              </button>
            ))}
            {FUTURE_FILTERS.map((f) => (
              <span
                key={f.label}
                title={`${f.label} — ${f.note}`}
                className="cursor-not-allowed rounded-full border border-dashed border-[#e7d9c8] px-3 py-1 text-xs font-semibold text-[#b8afa4]"
              >
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#2f261f]">Growth timeline</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-[#e7d9c8] bg-white px-3 py-1 text-xs font-semibold text-[#6f6259] hover:bg-[#faf7f2]"
              title="Print this view"
            >
              🖨 Print
            </button>
            <button
              type="button"
              disabled
              title="PDF export coming soon"
              className="cursor-not-allowed rounded-full border border-dashed border-[#e7d9c8] bg-[#faf7f2]/50 px-3 py-1 text-xs font-semibold text-[#b8afa4]"
            >
              📄 Export PDF
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-[#6f6259]">
          Your wins and evidence — newest first.
        </p>
        <div className="mt-3">
          <TimelineList
            groups={searchResults ?? timeline}
            emptyMessage={
              search.trim()
                ? "No matches — try different words."
                : "Nothing here yet for this filter."
            }
          />
        </div>
      </div>
    </section>
  );
}
