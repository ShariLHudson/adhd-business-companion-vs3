/**
 * P0.26 — Execute artifact generation (no workspace open).
 */

import { downloadMarkdownAsPdf } from "./artifactPdfExport";
import {
  artifactExecutionFailureReply,
  type ArtifactExecutionDraft,
  type ArtifactExecutionKind,
} from "./artifactExecutionAuthority";
import { contentToSheetCsv, isLikelyCsv } from "./googleSheetContent";
import { createSavedWork, updateSavedWork } from "./savedWorkStore";
import { addGoogleSheetToLibrary } from "./googleSheetsLibrary";
import { isGoogleCreateSuccess } from "./saveExportTrust";
import { saveTimeBlock } from "./companionStore";

export type ArtifactExecutionResult =
  | {
      ok: true;
      message: string;
      url?: string;
      savedWorkId?: string;
      downloadTriggered?: boolean;
    }
  | { ok: false; message: string };

function kindLabel(kind: ArtifactExecutionKind): string {
  switch (kind) {
    case "pdf":
      return "PDF";
    case "google-doc":
      return "Google Doc";
    case "google-sheet":
      return "Google Sheet";
    case "calendar":
      return "Calendar";
  }
}

function savedLocationLabel(kind: ArtifactExecutionKind): string {
  switch (kind) {
    case "calendar":
      return "Calendar Assets";
    case "google-sheet":
      return "Google Sheets";
    default:
      return "Created Content";
  }
}

function successMessage(
  kind: ArtifactExecutionKind,
  title: string,
  url?: string,
): string {
  const name = title.trim() || kindLabel(kind);
  const lines = [`Your ${kindLabel(kind)} is ready.`];
  if (kind === "pdf") {
    lines.push("• Download PDF");
    if (url) lines.push(`• Open PDF: ${url}`);
  } else if (url) {
    lines.push(`• Open ${kindLabel(kind)}: ${url}`);
  }
  lines.push(`Saved to ${savedLocationLabel(kind)}.`);
  return lines.join("\n");
}

async function ensureGoogleConnected(): Promise<
  { ok: true } | { ok: false; message: string }
> {
  const statusRes = await fetch("/api/google/status", { cache: "no-store" });
  const status = (await statusRes.json()) as { connected?: boolean };
  if (!status.connected) {
    return {
      ok: false,
      message: artifactExecutionFailureReply(
        "google-doc",
        "Google isn't connected yet — connect in Settings and try again",
      ),
    };
  }
  return { ok: true };
}

async function executePdf(draft: ArtifactExecutionDraft): Promise<ArtifactExecutionResult> {
  if (!draft.body.trim()) {
    return {
      ok: false,
      message: artifactExecutionFailureReply(
        "pdf",
        "there was no content to export",
      ),
    };
  }
  try {
    downloadMarkdownAsPdf(draft.title, draft.body);
    const saved = createSavedWork({
      title: draft.title,
      artifactType: "PDF",
      body: draft.body,
      sourceWorkspace: "chat",
      tags: ["pdf", "artifact-execution"],
    });
    updateSavedWork(saved.id, {
      status: "exported",
      typeFolder: "PDFs",
      savedLocation: "Created Content > PDFs",
    });
    return {
      ok: true,
      message: successMessage("pdf", draft.title),
      savedWorkId: saved.id,
      downloadTriggered: true,
    };
  } catch {
    return {
      ok: false,
      message: artifactExecutionFailureReply(
        "pdf",
        "the PDF export failed on this device",
      ),
    };
  }
}

async function executeGoogleDoc(
  draft: ArtifactExecutionDraft,
): Promise<ArtifactExecutionResult> {
  const auth = await ensureGoogleConnected();
  if (!auth.ok) return { ok: false, message: auth.message };

  const res = await fetch("/api/google/create-doc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: draft.title.slice(0, 120),
      content: draft.body,
      kind: "doc",
    }),
  });
  const data = (await res.json()) as { url?: string; id?: string; error?: string };
  if (!isGoogleCreateSuccess(res.status, data)) {
    return {
      ok: false,
      message: artifactExecutionFailureReply(
        "google-doc",
        data.error ?? "Google Doc creation failed",
      ),
    };
  }

  const saved = createSavedWork({
    title: draft.title,
    artifactType: "Google Doc",
    body: draft.body,
    sourceWorkspace: "chat",
    tags: ["google-doc", "artifact-execution"],
  });
  updateSavedWork(saved.id, {
    googleDocId: data.id,
    googleDocUrl: data.url,
    status: "exported",
    typeFolder: "Documents",
    savedLocation: "Created Content > Documents",
  });

  return {
    ok: true,
    message: successMessage("google-doc", draft.title, data.url),
    url: data.url,
    savedWorkId: saved.id,
  };
}

async function executeGoogleSheet(
  draft: ArtifactExecutionDraft,
): Promise<ArtifactExecutionResult> {
  const auth = await ensureGoogleConnected();
  if (!auth.ok) {
    return {
      ok: false,
      message: artifactExecutionFailureReply(
        "google-sheet",
        "Google isn't connected yet — connect in Settings and try again",
      ),
    };
  }

  const csv = contentToSheetCsv(draft.body);
  const res = await fetch("/api/google/create-doc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: draft.title.slice(0, 120),
      content: csv,
      kind: "sheet",
      alreadyCsv: isLikelyCsv(csv),
    }),
  });
  const data = (await res.json()) as { url?: string; id?: string; error?: string };
  if (!isGoogleCreateSuccess(res.status, data)) {
    return {
      ok: false,
      message: artifactExecutionFailureReply(
        "google-sheet",
        data.error ?? "Google Sheet creation failed",
      ),
    };
  }

  const saved = createSavedWork({
    title: draft.title,
    artifactType: "Google Sheet",
    body: csv,
    sourceWorkspace: "chat",
    tags: ["google-sheet", "artifact-execution"],
  });
  updateSavedWork(saved.id, {
    googleDocId: data.id,
    googleDocUrl: data.url,
    status: "exported",
    typeFolder: "Google Sheets",
    savedLocation: "Google Sheets",
  });
  addGoogleSheetToLibrary({
    title: draft.title,
    googleDocId: data.id!,
    googleDocUrl: data.url!,
    sheetType: "content_calendar",
    source: "chat",
    savedWorkId: saved.id,
  });

  return {
    ok: true,
    message: successMessage("google-sheet", draft.title, data.url),
    url: data.url,
    savedWorkId: saved.id,
  };
}

function executeCalendar(draft: ArtifactExecutionDraft): ArtifactExecutionResult {
  const lines = draft.body
    .split("\n")
    .map((l) => l.replace(/^[-•*\d]+[.)]\s+/, "").trim())
    .filter(Boolean);
  const today = new Date().toISOString().slice(0, 10);
  let created = 0;
  for (const line of lines.slice(0, 12)) {
    saveTimeBlock({
      title: line.slice(0, 80),
      date: today,
      startTime: "09:00",
      durationMin: 30,
      status: "pending",
    });
    created += 1;
  }

  const saved = createSavedWork({
    title: draft.title || "Calendar",
    artifactType: "Calendar",
    body: draft.body,
    sourceWorkspace: "chat",
    tags: ["calendar", "artifact-execution"],
  });
  updateSavedWork(saved.id, {
    status: "exported",
    typeFolder: "Plans",
    savedLocation: "Calendar Assets",
  });

  const blockNote =
    created > 0
      ? `Added ${created} calendar block${created === 1 ? "" : "s"}.`
      : "Saved the calendar plan.";

  return {
    ok: true,
    message: [
      "Your calendar is ready.",
      `• ${blockNote}`,
      "Saved to Calendar Assets.",
    ].join("\n"),
    savedWorkId: saved.id,
  };
}

export async function executeArtifactGeneration(
  draft: ArtifactExecutionDraft,
): Promise<ArtifactExecutionResult> {
  switch (draft.kind) {
    case "pdf":
      return executePdf(draft);
    case "google-doc":
      return executeGoogleDoc(draft);
    case "google-sheet":
      return executeGoogleSheet(draft);
    case "calendar":
      return executeCalendar(draft);
  }
}

export function artifactExecutionHintForChat(): string {
  return [
    "ARTIFACT EXECUTION (P0.26): User wants a finished file — execute generation.",
    "Do NOT open Create, Documents, or Google Workspace unless they asked to draft or edit.",
    "Confirm once if needed, then generate and save to Created Content.",
  ].join("\n");
}
