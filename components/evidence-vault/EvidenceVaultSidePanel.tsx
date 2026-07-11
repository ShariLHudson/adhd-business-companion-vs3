"use client";

import { useEffect, useState } from "react";
import {
  createEvidenceEntry,
  deleteEvidenceEntry,
  exportEvidenceEntry,
  filterEvidenceEntries,
  getEvidenceEntries,
  printEvidenceEntry,
  tagEvidenceHallCandidate,
  type EvidenceEntry,
} from "@/lib/evidenceBankStore";
import { buildEvidenceInsights } from "@/lib/evidenceVault/insights";
import {
  EVIDENCE_VAULT_SEARCH_EXAMPLES,
  EVIDENCE_VAULT_SEARCH_PLACEHOLDER,
} from "@/lib/evidenceVault/hospitality";

export type EvidenceVaultPanel =
  | "search"
  | "timeline"
  | "insights"
  | "archive"
  | "settings"
  | null;

type Props = {
  panel: EvidenceVaultPanel;
  onClose: () => void;
  onOpenEntry: (entry: EvidenceEntry) => void;
};

function evidenceEntryTitle(entry: EvidenceEntry): string {
  const line = entry.whatHappened.trim().split(/\n/)[0] ?? "";
  if (!line) return "Discovery";
  return line.length <= 72 ? line : `${line.slice(0, 69)}…`;
}

function evidenceEntrySummary(entry: EvidenceEntry): string {
  const body = entry.whatHappened.trim();
  if (body.length <= 140) return body;
  return `${body.slice(0, 137)}…`;
}

function groupByMonth(entries: EvidenceEntry[]): Map<string, EvidenceEntry[]> {
  const map = new Map<string, EvidenceEntry[]>();
  for (const entry of entries) {
    const key = new Date(entry.createdAt).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
    const list = map.get(key) ?? [];
    list.push(entry);
    map.set(key, list);
  }
  return map;
}

function EntryCard({
  entry,
  onOpen,
}: {
  entry: EvidenceEntry;
  onOpen: (entry: EvidenceEntry) => void;
}) {
  return (
    <article className="evidence-vault__card" data-category={entry.category}>
      <div className="evidence-vault__card-top">
        <div>
          <div className="evidence-vault__card-date">
            {new Date(entry.createdAt).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="evidence-vault__card-category">{entry.category}</div>
        </div>
      </div>
      <h3 className="evidence-vault__card-body" style={{ fontWeight: 600 }}>
        {evidenceEntryTitle(entry)}
      </h3>
      <p className="evidence-vault__card-body">{evidenceEntrySummary(entry)}</p>
      {entry.whoBenefited.trim() ? (
        <p className="evidence-vault__card-body" style={{ opacity: 0.85 }}>
          {entry.whoBenefited.trim()}
        </p>
      ) : null}
      <div className="evidence-vault__card-footer">
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className="evidence-vault__btn"
            onClick={() => onOpen(entry)}
          >
            Open
          </button>
          <button
            type="button"
            className="evidence-vault__btn"
            onClick={() => printEvidenceEntry(entry)}
          >
            Print
          </button>
          <button
            type="button"
            className="evidence-vault__btn"
            onClick={() => exportEvidenceEntry(entry, "markdown")}
          >
            Export
          </button>
          <button
            type="button"
            className="evidence-vault__btn"
            onClick={() => {
              createEvidenceEntry({
                category: entry.category,
                whatHappened: entry.whatHappened,
                whatImproved: entry.whatImproved,
                whatMovedForward: entry.whatMovedForward,
                whatProblemSolved: entry.whatProblemSolved,
                whoBenefited: entry.whoBenefited,
                whyItMattered: entry.whyItMattered,
                whatThisProves: entry.whatThisProves,
                attachments: entry.attachments,
                hallCandidate: entry.hallCandidate,
              });
            }}
          >
            Duplicate
          </button>
          <button
            type="button"
            className="evidence-vault__btn"
            onClick={() => {
              if (window.confirm("Delete this discovery permanently?")) {
                deleteEvidenceEntry(entry.id);
              }
            }}
          >
            Delete
          </button>
          <button
            type="button"
            className="evidence-vault__btn evidence-vault__btn--gold"
            onClick={() =>
              tagEvidenceHallCandidate(entry.id, !entry.hallCandidate)
            }
          >
            {entry.hallCandidate ? "Hall ✓" : "Hall?"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function EvidenceVaultSidePanel({ panel, onClose, onOpenEntry }: Props) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (panel !== "search") setQuery("");
  }, [panel]);

  if (!panel) return null;

  const title =
    panel === "search"
      ? "Search"
      : panel === "timeline"
        ? "Timeline"
        : panel === "insights"
          ? "Insights"
          : panel === "archive"
            ? "Archive"
            : "Settings";

  const entries =
    panel === "search" && query.trim()
      ? filterEvidenceEntries(getEvidenceEntries(), { query })
      : getEvidenceEntries();

  const insights = panel === "insights" ? buildEvidenceInsights() : [];
  const grouped = panel === "timeline" ? groupByMonth(entries) : null;

  return (
    <>
      <button
        type="button"
        className="ev-evx__panel-backdrop"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside className="ev-evx__panel" aria-label={title}>
        <header className="ev-evx__panel-head">
          <h2 className="ev-evx__panel-title">{title}</h2>
        </header>
        <div className="ev-evx__panel-scroll evidence-vault">
          {panel === "search" ? (
            <>
              <input
                className="ev-evx__search-input"
                value={query}
                placeholder={EVIDENCE_VAULT_SEARCH_PLACEHOLDER}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="ev-evx__search-examples">
                {EVIDENCE_VAULT_SEARCH_EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    className="ev-evx__search-chip"
                    onClick={() => setQuery(ex.replace(/\.$/, ""))}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {panel === "insights" ? (
            insights.length > 0 ? (
              insights.map((insight) => (
                <p key={insight.id} className="ev-evx__insight">
                  {insight.text}
                </p>
              ))
            ) : (
              <p className="evidence-vault__empty-body">
                Preserve a few discoveries and Spark will begin noticing patterns
                for you.
              </p>
            )
          ) : null}

          {panel === "settings" ? (
            <p className="evidence-vault__empty-body">
              Every section in your Discovery File is optional. Nothing here has
              to be perfect. Export and print from any archived discovery.
            </p>
          ) : null}

          {panel === "timeline" && grouped
            ? [...grouped.entries()].map(([month, monthEntries]) => (
                <div key={month} className="ev-evx__timeline-group">
                  <div className="ev-evx__timeline-label">{month}</div>
                  <div className="evidence-vault__cards">
                    {monthEntries.map((entry) => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        onOpen={onOpenEntry}
                      />
                    ))}
                  </div>
                </div>
              ))
            : null}

          {(panel === "archive" || panel === "search") && entries.length > 0 ? (
            <div
              className="evidence-vault__cards"
              style={{ marginTop: "0.85rem" }}
            >
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onOpen={onOpenEntry} />
              ))}
            </div>
          ) : null}

          {(panel === "archive" || panel === "search") && entries.length === 0 ? (
            <div className="evidence-vault__empty" style={{ marginTop: "1rem" }}>
              <p className="evidence-vault__empty-title">The archive awaits</p>
              <p className="evidence-vault__empty-body">
                {panel === "search"
                  ? "Try a different phrase — Spark searches meaning across your discoveries."
                  : "Your preserved discoveries will rest here as elegant folders, never spreadsheets."}
              </p>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
