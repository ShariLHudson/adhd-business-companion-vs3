"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildGrowthReportContent,
  defaultIncludesForType,
  downloadGrowthReportHtml,
  GROWTH_REPORT_INCLUDE_OPTIONS,
  GROWTH_REPORT_STYLE_OPTIONS,
  GROWTH_REPORT_TYPE_OPTIONS,
  printGrowthReport,
  resolveReportDateRange,
  type GrowthReportIncludes,
  type GrowthReportStyle,
  type GrowthReportType,
} from "@/lib/growthReports";

const FIELD_CLASS =
  "w-full rounded-xl border border-[#e4ddd2] bg-white px-3 py-2.5 text-sm text-[#2d2926] focus:border-[#c9a66b] focus:outline-none focus:ring-2 focus:ring-[#c9a66b]/25";

const LABEL_CLASS = "text-xs font-bold uppercase tracking-wide text-[#9a8f82]";

type GrowthReportsPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function GrowthReportsPanel({ open, onClose }: GrowthReportsPanelProps) {
  const [reportType, setReportType] = useState<GrowthReportType>("weekly");
  const [reportStyle, setReportStyle] = useState<GrowthReportStyle>("summary");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [includes, setIncludes] = useState<GrowthReportIncludes>(
    defaultIncludesForType("weekly"),
  );
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleTypeChange = useCallback((type: GrowthReportType) => {
    setReportType(type);
    setIncludes(defaultIncludesForType(type));
    setStatus(null);
  }, []);

  const datePreview = useMemo(
    () =>
      resolveReportDateRange(
        reportType,
        customFrom || undefined,
        customTo || undefined,
      ).label,
    [reportType, customFrom, customTo],
  );

  const typeHint = GROWTH_REPORT_TYPE_OPTIONS.find((o) => o.id === reportType)?.hint;

  function toggleInclude(key: keyof GrowthReportIncludes) {
    setIncludes((prev) => ({ ...prev, [key]: !prev[key] }));
    setStatus(null);
  }

  function handleGenerate() {
    const content = buildGrowthReportContent({
      reportType,
      reportStyle,
      includes,
      customFrom: customFrom || undefined,
      customTo: customTo || undefined,
    });
    printGrowthReport(content);
    setStatus("Report opened — use Print or Save as PDF in your browser.");
  }

  function handleDownloadHtml() {
    const content = buildGrowthReportContent({
      reportType,
      reportStyle,
      includes,
      customFrom: customFrom || undefined,
      customTo: customTo || undefined,
    });
    downloadGrowthReportHtml(content);
    setStatus("HTML report downloaded — open it and print to PDF anytime.");
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="growth-reports-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-[#e7d9c8] bg-[#faf7f2] shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#e7d9c8] bg-white px-5 py-4">
          <div>
            <h2 id="growth-reports-title" className="text-xl font-bold text-[#2f261f]">
              📖 Growth Reports
            </h2>
            <p className="mt-1 text-sm text-[#6f6259]">
              Build a printable report from your wins, evidence, highlights, and journey.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#e7d9c8] bg-[#faf7f2] px-3 py-1.5 text-sm font-semibold text-[#6f6259] hover:bg-[#f3ebe0]"
            aria-label="Close Growth Reports"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <label htmlFor="report-type" className={LABEL_CLASS}>
              Report Type
            </label>
            <select
              id="report-type"
              value={reportType}
              onChange={(e) => handleTypeChange(e.target.value as GrowthReportType)}
              className={`${FIELD_CLASS} mt-1.5`}
            >
              {GROWTH_REPORT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            {typeHint ? (
              <p className="mt-1.5 text-xs text-[#9a8f82]">{typeHint}</p>
            ) : null}
            <p className="mt-1 text-xs font-medium text-[#6f6259]">
              Date range: {datePreview}
            </p>
          </div>

          {reportType === "custom" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="report-from" className={LABEL_CLASS}>
                  From
                </label>
                <input
                  id="report-from"
                  type="date"
                  value={customFrom}
                  onChange={(e) => {
                    setCustomFrom(e.target.value);
                    setStatus(null);
                  }}
                  className={`${FIELD_CLASS} mt-1.5`}
                />
              </div>
              <div>
                <label htmlFor="report-to" className={LABEL_CLASS}>
                  To
                </label>
                <input
                  id="report-to"
                  type="date"
                  value={customTo}
                  onChange={(e) => {
                    setCustomTo(e.target.value);
                    setStatus(null);
                  }}
                  className={`${FIELD_CLASS} mt-1.5`}
                />
              </div>
            </div>
          ) : null}

          <div>
            <p className={LABEL_CLASS}>Include</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {GROWTH_REPORT_INCLUDE_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#efe8de] bg-white px-3 py-2.5 text-sm text-[#2f261f]"
                >
                  <input
                    type="checkbox"
                    checked={includes[opt.key]}
                    onChange={() => toggleInclude(opt.key)}
                    className="h-4 w-4 rounded border-[#e4ddd2] text-[#2f261f] focus:ring-[#c9a66b]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="report-style" className={LABEL_CLASS}>
              Report Style
            </label>
            <select
              id="report-style"
              value={reportStyle}
              onChange={(e) => {
                setReportStyle(e.target.value as GrowthReportStyle);
                setStatus(null);
              }}
              className={`${FIELD_CLASS} mt-1.5`}
            >
              {GROWTH_REPORT_STYLE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            {reportStyle === "storybook" || reportStyle === "visual" ? (
              <p className="mt-1.5 text-xs text-[#9a8f82]">
                Visual / Storybook styling coming soon — Phase 1 still generates your full narrative report.
              </p>
            ) : null}
          </div>

          {status ? (
            <p className="rounded-xl border border-[#e7d9c8] bg-white px-3 py-2 text-sm text-[#6f6259]">
              {status}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[#e7d9c8] bg-white px-5 py-4">
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-full bg-[#2f261f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3d342c]"
          >
            Generate Growth Report
          </button>
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="rounded-full border border-[#e7d9c8] bg-[#faf7f2] px-4 py-2.5 text-sm font-semibold text-[#2f261f] hover:bg-[#f3ebe0]"
            title="Download as HTML — open in browser and print to PDF"
          >
            Download HTML
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#e7d9c8] px-4 py-2.5 text-sm font-semibold text-[#6f6259] hover:bg-[#faf7f2]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function GrowthReportsButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className ||
        "rounded-full border border-[#e7d9c8] bg-white px-4 py-2 text-sm font-semibold text-[#2f261f] shadow-sm hover:bg-[#faf7f2]"
      }
    >
      📖 Growth Reports
    </button>
  );
}
