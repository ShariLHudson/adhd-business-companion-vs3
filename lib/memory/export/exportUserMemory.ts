/**
 * exportUserMemory™ — background data processor.
 * No chat · no LLM · no estate navigation.
 */

import { buildReportText, textToMarkdown } from "./buildReports";
import type { ExportUserMemoryOptions, ExportUserMemoryResult } from "./types";

function defaultFilename(reportType: string, format: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `spark-memory-${reportType}-${stamp}.${format === "markdown" ? "md" : format === "pdf" ? "pdf" : "txt"}`;
}

function reportTitle(reportType: ExportUserMemoryOptions["reportType"]): string {
  switch (reportType) {
    case "weekly-wins":
      return "Weekly Wins Report";
    case "journal":
      return "Journal Report";
    case "portfolio":
      return "Portfolio Report";
    case "evidence":
      return "Evidence Report";
    default: {
      const _exhaustive: never = reportType;
      return _exhaustive;
    }
  }
}

/** Build export artifact — pure data processing. */
export function exportUserMemory(
  options: ExportUserMemoryOptions,
): ExportUserMemoryResult {
  const title = options.title ?? reportTitle(options.reportType);
  const { text, entryCount } = buildReportText({ ...options, title });
  const markdown =
    options.format === "markdown"
      ? text
      : textToMarkdown(title, text);

  return {
    title,
    format: options.format,
    text,
    markdown,
    filename: defaultFilename(options.reportType, options.format),
    entryCount,
  };
}

export async function exportUserMemoryPdf(
  options: ExportUserMemoryOptions,
): Promise<Blob> {
  const result = exportUserMemory({ ...options, format: "text" });
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(result.title, pageWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 20 + 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const bodyLines = doc.splitTextToSize(result.text, pageWidth);
  const lineHeight = 14;
  const pageHeight = doc.internal.pageSize.getHeight();

  for (const line of bodyLines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  return doc.output("blob");
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadUserMemoryExport(
  options: ExportUserMemoryOptions,
): Promise<void> {
  if (options.format === "pdf") {
    const blob = await exportUserMemoryPdf(options);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = defaultFilename(options.reportType, "pdf");
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const result = exportUserMemory(options);
  if (options.format === "markdown") {
    downloadTextFile(result.filename, result.markdown, "text/markdown;charset=utf-8");
    return;
  }
  downloadTextFile(result.filename, result.text, "text/plain;charset=utf-8");
}

/** Open print dialog with report HTML — no chat involvement. */
export function printUserMemoryExport(options: ExportUserMemoryOptions): void {
  if (typeof window === "undefined") return;
  const result = exportUserMemory({ ...options, format: "text" });
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${result.title}</title>
<style>body{font-family:Georgia,serif;max-width:42rem;margin:2rem auto;padding:0 1rem;color:#2f261f;line-height:1.55}
h1{font-size:1.5rem}pre{white-space:pre-wrap;font-family:inherit}</style></head>
<body><h1>${result.title}</h1><pre>${result.text.replace(/</g, "&lt;")}</pre></body></html>`;
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
