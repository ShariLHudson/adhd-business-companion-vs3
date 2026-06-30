/**
 * Spark Alpha™ — detect member intent from conversation text.
 */

import type { SparkAlphaSuggestionEffect } from "./suggestionParser";

export type ConversationExportKind =
  | "print"
  | "pdf"
  | "google_doc"
  | "google_calendar"
  | "google_drive";

const AGREEMENT_RE =
  /^(yes|yeah|yep|sure|ok|okay|please|let'?s|do it|sounds good|go ahead|absolutely|definitely)\b/i;

export function isAgreement(text: string): boolean {
  return AGREEMENT_RE.test(text.trim());
}

export function detectExportIntent(text: string): ConversationExportKind | null {
  const lower = text.toLowerCase();
  if (/\bprint\b/.test(lower)) return "print";
  if (/\bpdf\b/.test(lower) || /\bdownload\b.*\bpdf\b/.test(lower)) return "pdf";
  if (/google\s+doc/.test(lower)) return "google_doc";
  if (/google\s+calendar/.test(lower) || /\bschedule\b.*\bcalendar\b/.test(lower)) {
    return "google_calendar";
  }
  if (/google\s+drive/.test(lower)) return "google_drive";
  return null;
}

export function detectFocusSessionRequest(
  text: string,
): { minutes: number; label?: string } | null {
  const lower = text.toLowerCase();
  if (!/\b(focus|timer|pomodoro|time\s+block)\b/.test(lower)) return null;

  const minuteMatch = text.match(/(\d{1,3})\s*[-–]?\s*minute(?:s)?/i);
  const minutes = minuteMatch ? Number.parseInt(minuteMatch[1], 10) : 25;
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 120) return null;

  const onMatch = text.match(/\bon\s+(.+?)(?:\s+for\b|\s*$)/i);
  const label = onMatch?.[1]?.trim().slice(0, 80) || undefined;

  return { minutes, label };
}

export function effectFromAssistantOffer(
  assistantText: string,
): SparkAlphaSuggestionEffect | null {
  const lower = assistantText.toLowerCase();
  if (/\b(focus|timer|pomodoro|time\s+block)\b/.test(lower)) {
    const minuteMatch = assistantText.match(/(\d{1,3})\s*[-–]?\s*minute(?:s)?/i);
    const minutes = minuteMatch ? Number.parseInt(minuteMatch[1], 10) : 25;
    if (Number.isFinite(minutes) && minutes >= 1 && minutes <= 120) {
      return { type: "focus_timer", minutes };
    }
  }
  if (/\bprint\b/.test(lower)) return { type: "print" };
  if (/\bpdf\b/.test(lower)) return { type: "pdf" };
  if (/google\s+doc/.test(lower)) return { type: "google_doc" };
  if (/google\s+calendar/.test(lower)) return { type: "google_calendar" };
  if (/google\s+drive/.test(lower)) return { type: "google_drive" };
  return null;
}

export function resolveActionFromUserTurn(
  userText: string,
  lastAssistantText: string | null,
): SparkAlphaSuggestionEffect | ConversationExportKind | null {
  const directExport = detectExportIntent(userText);
  if (directExport) return directExport;

  const directFocus = detectFocusSessionRequest(userText);
  if (directFocus) {
    return {
      type: "focus_timer",
      minutes: directFocus.minutes,
      label: directFocus.label,
    };
  }

  if (!isAgreement(userText) || !lastAssistantText) return null;
  return effectFromAssistantOffer(lastAssistantText);
}
