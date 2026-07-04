import type { JournalEntry } from "@/lib/growthJournalStore";
import { JOURNAL_FONT_OPTIONS } from "./catalog";
import { penRenderProfile } from "./penRender";
import { sanitizePageHtml, type TypingStyle } from "./writingSurface";
import type { JournalGazeboConfig } from "./types";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fontFamily(config: JournalGazeboConfig): string {
  return (
    JOURNAL_FONT_OPTIONS.find((f) => f.id === config.fontId)?.family ??
    JOURNAL_FONT_OPTIONS[1]!.family
  );
}

function penBodyStyle(config: JournalGazeboConfig): string {
  const pen = penRenderProfile(config);
  const parts = [
    `font-weight:${pen.fontWeight}`,
    `letter-spacing:${pen.letterSpacing}`,
    `opacity:${pen.opacity}`,
    `color:${pen.inkColor}`,
  ];
  if (pen.textShadow !== "none") parts.push(`text-shadow:${pen.textShadow}`);
  if (pen.filter !== "none") parts.push(`filter:${pen.filter}`);
  if (pen.webkitTextStroke !== "0") {
    parts.push(`-webkit-text-stroke:${pen.webkitTextStroke}`);
    parts.push("paint-order:stroke fill");
  }
  return parts.join(";");
}

function bodyForPrint(body: string): string {
  if (/<[a-z][\s\S]*>/i.test(body)) {
    return sanitizePageHtml(body);
  }
  return esc(body);
}

function formatEntryDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatEntryTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function stationeryStyles(): string {
  return `
    @page { margin: 0.85in 0.9in; }
    body {
      margin: 0;
      background: #faf6ee;
      color: #2f261f;
      font-family: "Lora", Georgia, serif;
    }
    .sheet {
      max-width: 6.5in;
      margin: 0 auto;
      padding: 0.25in 0;
    }
    .sheet__journal {
      font-size: 11pt;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #8a7d70;
      margin-bottom: 0.15in;
    }
    .sheet__date {
      font-size: 10pt;
      color: #9a8f82;
      margin-bottom: 0.35in;
    }
    .sheet__body {
      white-space: pre-wrap;
      font-size: 12.5pt;
      line-height: 1.65;
    }
    .pen-fountain .sheet__body {
      letter-spacing: 0.035em;
    }
    .pen-fountain.pen-nib-fine .sheet__body {
      letter-spacing: 0.045em;
      font-weight: 380;
    }
    .pen-fountain.pen-nib-broad .sheet__body {
      letter-spacing: 0.02em;
      font-weight: 520;
    }
    .pen-felt .sheet__body {
      font-weight: 680;
      letter-spacing: -0.015em;
      -webkit-text-stroke: 0.15pt currentColor;
      paint-order: stroke fill;
    }
    .pen-pencil .sheet__body {
      font-weight: 380;
      letter-spacing: 0.02em;
      opacity: 0.84;
      filter: contrast(0.84) saturate(0.52);
    }
    .pen-ballpoint .sheet__body {
      font-weight: 540;
      letter-spacing: 0.01em;
    }
    .sheet + .sheet {
      page-break-before: always;
      margin-top: 0.5in;
    }
  `;
}

function configForPrint(
  config: JournalGazeboConfig,
  typingStyle?: TypingStyle,
): JournalGazeboConfig {
  if (!typingStyle) return config;
  return { ...config, ...typingStyle, writingFontSize: typingStyle.writingFontSize };
}

function buildSheetHtml(input: {
  config: JournalGazeboConfig;
  body: string;
  createdAt: string;
  showTime?: boolean;
  typingStyle?: TypingStyle;
}): string {
  const printConfig = configForPrint(input.config, input.typingStyle);
  const family = fontFamily(printConfig);
  const pen = penRenderProfile(printConfig);
  const penClasses = [
    pen.penClass,
    printConfig.penStyle === "fountain" ? `pen-nib-${printConfig.nibSize}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const timeLine = input.showTime
    ? `<div class="sheet__date">${esc(formatEntryTime(input.createdAt))}</div>`
    : "";

  return `
    <article class="sheet ${penClasses}">
      <div class="sheet__journal">${esc(input.config.name)}</div>
      <div class="sheet__date">${esc(formatEntryDate(input.createdAt))}</div>
      ${timeLine}
      <div class="sheet__body" style="font-family:${family};${penBodyStyle(input.config)}">
        ${bodyForPrint(input.body)}
      </div>
    </article>
  `;
}

function openPrintWindow(title: string, bodyHtml: string): void {
  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!win) return;
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Caveat&family=Cormorant+Garamond&family=Merriweather&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Source+Serif+4&display=swap" rel="stylesheet" />
  <style>${stationeryStyles()}</style>
</head>
<body>${bodyHtml}</body>
</html>`);
  win.document.close();
  win.focus();
  win.setTimeout(() => {
    win.print();
  }, 400);
}

export function printCurrentJournalPage(input: {
  config: JournalGazeboConfig;
  body: string;
  createdAt?: string;
  showTime?: boolean;
  typingStyle?: TypingStyle;
}): void {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const html = buildSheetHtml({
    config: input.config,
    body: input.body,
    createdAt,
    showTime: input.showTime,
    typingStyle: input.typingStyle,
  });
  openPrintWindow(input.config.name, html);
}

export function printJournalEntries(input: {
  config: JournalGazeboConfig;
  entries: JournalEntry[];
  showTime?: boolean;
}): void {
  if (input.entries.length === 0) return;
  const html = input.entries
    .map((entry) =>
      buildSheetHtml({
        config: input.config,
        body: entry.body,
        createdAt: entry.createdAt,
        showTime: input.showTime,
      }),
    )
    .join("");
  openPrintWindow(input.config.name, html);
}

export function exportJournalPdf(input: {
  config: JournalGazeboConfig;
  entries: JournalEntry[];
  showTime?: boolean;
}): void {
  printJournalEntries(input);
}
