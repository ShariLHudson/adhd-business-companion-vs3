/**
 * Growth report helpers — delegates to Memory Export (no chat / no LLM).
 */

import {
  downloadUserMemoryExport,
  exportUserMemory,
  printUserMemoryExport,
} from "@/lib/memory/export/exportUserMemory";
import type { ExportReportType } from "@/lib/memory/export/types";

export type GrowthReportContent = {
  title: string;
  body: string;
  reportType: ExportReportType;
};

export function buildGrowthReportContent(input: {
  reportType?: ExportReportType;
  reportStyle?: string;
  includes?: string[];
}): GrowthReportContent {
  const reportType: ExportReportType =
    input.reportType === "journal" ||
    input.reportType === "portfolio" ||
    input.reportType === "evidence"
      ? input.reportType
      : "weekly-wins";

  const result = exportUserMemory({
    reportType,
    format: "text",
    dateRange: { preset: "month" },
  });

  return {
    title: result.title,
    body: result.text,
    reportType,
  };
}

export function printGrowthReport(content: GrowthReportContent): void {
  printUserMemoryExport({
    reportType: content.reportType,
    format: "text",
    dateRange: { preset: "month" },
    title: content.title,
  });
}

export function downloadGrowthReportHtml(content: GrowthReportContent): void {
  void downloadUserMemoryExport({
    reportType: content.reportType,
    format: "markdown",
    dateRange: { preset: "month" },
    title: content.title,
  });
}
