import type { MemoryDateRange, MemoryTypeFilter } from "../types";

export type ExportFormat = "pdf" | "text" | "markdown";

export type ExportReportType =
  | "weekly-wins"
  | "journal"
  | "portfolio"
  | "evidence";

export type ExportUserMemoryOptions = {
  reportType: ExportReportType;
  dateRange?: MemoryDateRange;
  typeFilter?: MemoryTypeFilter;
  format: ExportFormat;
  title?: string;
};

export type ExportUserMemoryResult = {
  title: string;
  format: ExportFormat;
  text: string;
  markdown: string;
  filename: string;
  entryCount: number;
};
