/**
 * Report builders — deterministic summaries, no LLM.
 */

import { queryMemoryEntries } from "../queryMemory";
import type { UserMemoryEntry } from "../types";
import type { ExportReportType, ExportUserMemoryOptions } from "./types";

const POSITIVE_RE =
  /\b(?:win|won|helped|launched|finished|completed|proud|grateful|breakthrough|milestone|success|grew|learned|shipped|celebrat)\b/i;

const THEME_BUCKETS: { label: string; pattern: RegExp }[] = [
  { label: "Impact & people", pattern: /\b(?:helped|client|customer|someone|team|impact)\b/i },
  { label: "Growth & learning", pattern: /\b(?:learned|lesson|grew|skill|course|institute)\b/i },
  { label: "Courage & momentum", pattern: /\b(?:brave|courage|scared|anyway|shipped|launched|started)\b/i },
  { label: "Business wins", pattern: /\b(?:revenue|sale|offer|launch|business|profit|client)\b/i },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function typeFilterForReport(reportType: ExportReportType) {
  switch (reportType) {
    case "journal":
      return "journal" as const;
    case "portfolio":
      return "portfolio" as const;
    case "evidence":
      return "evidence" as const;
  }
  return "all" as const;
}

function entriesForReport(options: ExportUserMemoryOptions): UserMemoryEntry[] {
  const typeFilter =
    options.typeFilter && options.typeFilter !== "all"
      ? options.typeFilter
      : typeFilterForReport(options.reportType);

  return queryMemoryEntries({
    typeFilter,
    dateRange: options.dateRange,
  });
}

function section(title: string, lines: string[]): string[] {
  return [title, ...lines, ""];
}

function groupByTheme(entries: UserMemoryEntry[]): Map<string, UserMemoryEntry[]> {
  const grouped = new Map<string, UserMemoryEntry[]>();
  const other: UserMemoryEntry[] = [];

  for (const entry of entries) {
    const bucket = THEME_BUCKETS.find((b) => b.pattern.test(entry.content));
    if (!bucket) {
      other.push(entry);
      continue;
    }
    const list = grouped.get(bucket.label) ?? [];
    list.push(entry);
    grouped.set(bucket.label, list);
  }
  if (other.length) grouped.set("Other highlights", other);
  return grouped;
}

export function buildWeeklyWinsReport(options: ExportUserMemoryOptions): string {
  const entries = entriesForReport(options).filter((e) => POSITIVE_RE.test(e.content));
  const lines: string[] = [
    options.title ?? "Weekly Wins Report",
    `Generated ${formatDate(new Date().toISOString())}`,
    "",
    `Highlights: ${entries.length} moment${entries.length === 1 ? "" : "s"}`,
    "",
  ];

  if (!entries.length) {
    lines.push("No wins captured in this period yet — your next one counts.");
    return lines.join("\n");
  }

  const grouped = groupByTheme(entries);
  for (const [theme, items] of grouped) {
    lines.push(...section(theme, items.map((e) => `• ${formatDate(e.timestamp)} — ${e.content.split("\n")[0]}`)));
  }

  lines.push("Summary", `You recorded ${entries.length} meaningful wins in this period.`);
  return lines.join("\n");
}

export function buildJournalReport(options: ExportUserMemoryOptions): string {
  const entries = queryMemoryEntries({
    typeFilter: "journal",
    dateRange: options.dateRange,
  });
  const lines: string[] = [
    options.title ?? "Journal Report",
    `Generated ${formatDate(new Date().toISOString())}`,
    "",
  ];
  if (!entries.length) {
    lines.push("No journal entries in this period.");
    return lines.join("\n");
  }
  for (const e of entries) {
    lines.push(formatDate(e.timestamp));
    if (e.title) lines.push(e.title);
    lines.push(e.content);
    lines.push("");
  }
  return lines.join("\n");
}

export function buildPortfolioReport(options: ExportUserMemoryOptions): string {
  const entries = queryMemoryEntries({
    typeFilter: "portfolio",
    dateRange: options.dateRange,
  });
  const lines: string[] = [
    options.title ?? "Portfolio Report",
    `Generated ${formatDate(new Date().toISOString())}`,
    "",
    "Work history",
    "",
  ];
  if (!entries.length) {
    lines.push("No portfolio items in this period.");
    return lines.join("\n");
  }
  for (const e of entries) {
    lines.push(`— ${e.title ?? "Untitled"} (${formatDate(e.timestamp)})`);
    lines.push(e.content);
    lines.push("");
  }
  return lines.join("\n");
}

export function buildEvidenceReport(options: ExportUserMemoryOptions): string {
  const entries = queryMemoryEntries({
    typeFilter: "evidence",
    dateRange: options.dateRange,
  });
  const lines: string[] = [
    options.title ?? "Evidence Report",
    `Generated ${formatDate(new Date().toISOString())}`,
    "",
    "Achievements & impact",
    "",
  ];
  if (!entries.length) {
    lines.push("No evidence entries in this period.");
    return lines.join("\n");
  }
  for (const e of entries) {
    lines.push(`[${e.title ?? "Evidence"}] ${formatDate(e.timestamp)}`);
    lines.push(e.content);
    lines.push("");
  }
  return lines.join("\n");
}

export function buildReportText(options: ExportUserMemoryOptions): {
  text: string;
  entryCount: number;
} {
  const entries = entriesForReport(options);
  let text: string;
  switch (options.reportType) {
    case "weekly-wins":
      text = buildWeeklyWinsReport(options);
      break;
    case "journal":
      text = buildJournalReport(options);
      break;
    case "portfolio":
      text = buildPortfolioReport(options);
      break;
    case "evidence":
      text = buildEvidenceReport(options);
      break;
    default: {
      const _exhaustive: never = options.reportType;
      text = _exhaustive;
    }
  }
  return { text, entryCount: entries.length };
}

export function textToMarkdown(title: string, body: string): string {
  return `# ${title}\n\n${body.split("\n").join("\n\n")}`;
}
