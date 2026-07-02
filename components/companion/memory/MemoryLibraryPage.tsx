"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import {
  downloadUserMemoryExport,
  printUserMemoryExport,
} from "@/lib/memory/export/exportUserMemory";
import type { ExportFormat, ExportReportType } from "@/lib/memory/export/types";
import { queryMemoryEntries } from "@/lib/memory/queryMemory";
import type { MemoryDateRange, MemoryEntryType, MemoryTypeFilter } from "@/lib/memory/types";
import {
  createReflectionReport,
} from "@/lib/memory/reflection/createReflectionReport";
import type { ReflectionReport } from "@/lib/memory/reflection/types";
import {
  getUserMemoryStore,
  subscribeUserMemoryStore,
} from "@/lib/memory/userMemoryStore";
import "@/app/companion/memory-library.css";

export type MemoryLibraryTab = "all" | MemoryEntryType | "reflection" | "export";

type Props = {
  onBack: () => void;
  backLabel?: string | null;
  initialTab?: MemoryLibraryTab;
};

const TAB_LABELS: Record<MemoryLibraryTab, string> = {
  all: "All",
  journal: "Journal",
  portfolio: "Portfolio",
  evidence: "Evidence",
  reflection: "Reflection",
  export: "Export Reports",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function typeLabel(type: MemoryEntryType): string {
  if (type === "journal") return "Journal";
  if (type === "portfolio") return "Portfolio";
  return "Evidence";
}

function ReflectionSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <section className="memory-reflection__section">
      <h2 className="memory-reflection__heading">{title}</h2>
      <ul className="memory-reflection__list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function ReflectionPanel({ report }: { report: ReflectionReport }) {
  if (report.insufficientData) {
    return (
      <p className="memory-library__empty">{report.summary}</p>
    );
  }
  return (
    <div className="memory-reflection">
      <p className="memory-reflection__summary">{report.summary}</p>
      <ReflectionSection title="Themes" items={report.themes} />
      <ReflectionSection title="Emotional Patterns" items={report.emotionalPatterns} />
      <ReflectionSection title="Behavior Patterns" items={report.behaviorPatterns} />
      <ReflectionSection title="Wins" items={report.wins} />
      <ReflectionSection title="Challenges" items={report.challenges} />
      <ReflectionSection title="Insights" items={report.insights} />
      <p className="memory-reflection__meta">
        {report.entryCount} entries analyzed ·{" "}
        {new Date(report.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}

export function MemoryLibraryPage({
  onBack,
  backLabel,
  initialTab = "all",
}: Props) {
  const [tab, setTab] = useState<MemoryLibraryTab>(initialTab);
  const [range, setRange] = useState<"week" | "month" | "all">("all");
  const [search, setSearch] = useState("");
  const [tick, setTick] = useState(0);
  const [exportReport, setExportReport] = useState<ExportReportType>("weekly-wins");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  useEffect(() => subscribeUserMemoryStore(() => setTick((n) => n + 1)), []);

  const typeFilter: MemoryTypeFilter = useMemo(() => {
    if (tab === "all" || tab === "export" || tab === "reflection") return "all";
    return tab;
  }, [tab]);

  const dateRange: MemoryDateRange = useMemo(
    () => ({ preset: range }),
    [range],
  );

  const entries = useMemo(
    () =>
      queryMemoryEntries({
        typeFilter,
        dateRange,
        search,
      }),
    [typeFilter, dateRange, search, tick],
  );

  const counts = useMemo(() => {
    const store = getUserMemoryStore();
    return {
      journal: store.journals.length,
      portfolio: store.portfolioItems.length,
      evidence: store.evidenceItems.length,
    };
  }, [tick]);

  const reflectionReport = useMemo(
    () =>
      createReflectionReport({
        timeRange: dateRange,
      }),
    [dateRange, tick],
  );

  const runExport = useCallback(
    async (mode: "download" | "print") => {
      const options = {
        reportType: exportReport,
        format: exportFormat,
        dateRange,
        typeFilter:
          exportReport === "weekly-wins"
            ? ("all" as const)
            : exportReport === "journal"
              ? ("journal" as const)
              : exportReport === "portfolio"
                ? ("portfolio" as const)
                : ("evidence" as const),
      };
      if (mode === "print") {
        printUserMemoryExport({ ...options, format: "text" });
        setExportStatus("Print dialog opened — no chat involved.");
      } else {
        await downloadUserMemoryExport(options);
        setExportStatus("Download started.");
      }
    },
    [exportReport, exportFormat, dateRange],
  );

  return (
    <EstateWorkspace className="memory-library companion-fade-in">
      <GrowthPanelBackButton onBack={onBack} label={backLabel ?? "Back"} />

      <header className="memory-library__header">
        <p className="estate-workspace__kicker">Your Estate</p>
        <h1 className="estate-workspace__title">Memory</h1>
        <p className="memory-library__lead">
          Everything you captured — read, search, and export. This is not a chat.
        </p>
      </header>

      <nav className="memory-library__tabs" aria-label="Memory sections">
        {(Object.keys(TAB_LABELS) as MemoryLibraryTab[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`memory-library__tab${tab === id ? " memory-library__tab--active" : ""}`}
            onClick={() => setTab(id)}
          >
            {TAB_LABELS[id]}
          </button>
        ))}
      </nav>

      {tab === "reflection" ? (
        <>
          <div className="memory-library__toolbar">
            <label className="memory-library__field">
              <span>Period</span>
              <select
                value={range}
                onChange={(e) =>
                  setRange(e.target.value as "week" | "month" | "all")
                }
              >
                <option value="week">Past week</option>
                <option value="month">Past month</option>
                <option value="all">All time</option>
              </select>
            </label>
          </div>
          <p className="memory-library__export-intro">
            Patterns drawn only from stored memory — not from conversation.
          </p>
          <ReflectionPanel report={reflectionReport} />
        </>
      ) : tab === "export" ? (
        <section className="memory-library__export" aria-label="Export reports">
          <p className="memory-library__export-intro">
            Reports are built from your stored memory — quietly, in the background.
          </p>

          <label className="memory-library__field">
            <span>Report</span>
            <select
              value={exportReport}
              onChange={(e) => setExportReport(e.target.value as ExportReportType)}
            >
              <option value="weekly-wins">Weekly Wins Report</option>
              <option value="journal">Journal Report</option>
              <option value="portfolio">Portfolio Report</option>
              <option value="evidence">Evidence Report</option>
            </select>
          </label>

          <label className="memory-library__field">
            <span>Date range</span>
            <select
              value={range}
              onChange={(e) =>
                setRange(e.target.value as "week" | "month" | "all")
              }
            >
              <option value="week">Past week</option>
              <option value="month">Past month</option>
              <option value="all">All time</option>
            </select>
          </label>

          <label className="memory-library__field">
            <span>Format</span>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            >
              <option value="pdf">PDF</option>
              <option value="markdown">Markdown</option>
              <option value="text">Plain text</option>
            </select>
          </label>

          <div className="memory-library__export-actions">
            <button type="button" onClick={() => void runExport("download")}>
              Download
            </button>
            <button type="button" onClick={() => void runExport("print")}>
              Print
            </button>
          </div>

          {exportStatus ? (
            <p className="memory-library__status" role="status">
              {exportStatus}
            </p>
          ) : null}
        </section>
      ) : (
        <>
          <div className="memory-library__toolbar">
            <label className="memory-library__field">
              <span>When</span>
              <select
                value={range}
                onChange={(e) =>
                  setRange(e.target.value as "week" | "month" | "all")
                }
              >
                <option value="all">All time</option>
                <option value="week">Past week</option>
                <option value="month">Past month</option>
              </select>
            </label>
            <label className="memory-library__field memory-library__field--grow">
              <span>Search</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your memory…"
              />
            </label>
          </div>

          <p className="memory-library__counts" aria-live="polite">
            {entries.length} shown · {counts.journal} journal · {counts.portfolio}{" "}
            portfolio · {counts.evidence} evidence
          </p>

          <ul className="memory-library__list">
            {entries.length === 0 ? (
              <li className="memory-library__empty">
                Nothing here yet for this filter. Capture writes appear instantly —
                never in chat.
              </li>
            ) : (
              entries.map((entry) => (
                <li key={`${entry.type}-${entry.id}`} className="memory-library__card">
                  <div className="memory-library__card-meta">
                    <span className="memory-library__badge">{typeLabel(entry.type)}</span>
                    <time dateTime={entry.timestamp}>{formatWhen(entry.timestamp)}</time>
                  </div>
                  {entry.title ? (
                    <h2 className="memory-library__card-title">{entry.title}</h2>
                  ) : null}
                  <p className="memory-library__card-body">{entry.content}</p>
                  {entry.tags.length > 0 ? (
                    <p className="memory-library__tags">{entry.tags.join(" · ")}</p>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </EstateWorkspace>
  );
}
