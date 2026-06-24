/**
 * P0.18 / P0.18.1 — Create Google Sheet from companion intake and persist link.
 */

import { createSavedWork, updateSavedWork } from "./savedWorkStore";
import {
  addGoogleSheetToLibrary,
  googleSheetSavedLocationLabel,
} from "./googleSheetsLibrary";
import type { GoogleSheetPendingPayload } from "./googleSheetsIntelligence";
import {
  buildGoogleWorkspaceSession,
  googleFileIdFromUrl,
  type GoogleWorkspaceSession,
} from "./googleWorkspace";

export type GoogleSheetCreateResult =
  | {
      ok: true;
      url: string;
      id: string;
      savedWorkId: string;
      libraryId: string;
      session: GoogleWorkspaceSession;
    }
  | {
      ok: true;
      url: string;
      id: string;
      savedWorkId: string;
      libraryId: string;
      session: null;
      linkFailed: true;
    }
  | { ok: false; error: string; needsConnection?: boolean };

export type GoogleSheetLinkValidation = {
  valid: boolean;
  fileId: string | null;
  reason?: "missing" | "bad_url" | "id_mismatch";
};

export function validateGoogleSheetLink(
  url: string | undefined | null,
  id: string | undefined | null,
): GoogleSheetLinkValidation {
  const u = url?.trim();
  const docId = id?.trim();
  if (!u || !docId) {
    return { valid: false, fileId: null, reason: "missing" };
  }
  const fromUrl = googleFileIdFromUrl(u);
  if (!fromUrl) {
    return { valid: false, fileId: null, reason: "bad_url" };
  }
  if (fromUrl !== docId) {
    return { valid: false, fileId: null, reason: "id_mismatch" };
  }
  return { valid: true, fileId: fromUrl };
}

export function googleSheetCreateSuccessAck(
  title: string,
  opts?: { autoOpening?: boolean; offerOpen?: boolean },
): string {
  const name = title.trim() || "Google Sheet";
  if (opts?.autoOpening) {
    return (
      `Your **${name}** is ready.\n` +
      `I saved it under **Google Sheets**.\n` +
      `Opening **Google Sheets** now.`
    );
  }
  if (opts?.offerOpen) {
    return (
      `Your **${name}** is ready.\n` +
      `I saved it under **Google Sheets**.\n` +
      `Would you like me to open **Google Sheets** now?`
    );
  }
  return (
    `Your **${name}** is ready.\n` +
    `I saved it under **Google Sheets**.`
  );
}

export function googleSheetLinkFailureAck(): string {
  return (
    "I created the sheet data, but I couldn't open the Google Sheet link. " +
    "Please reconnect Google Sheets in **Settings**."
  );
}

export function googleSheetCreateFailureAck(error: string): string {
  return error;
}

/** @deprecated Use googleSheetCreateSuccessAck */
export function googleSheetCreateAck(title: string, _url: string): string {
  return googleSheetCreateSuccessAck(title, { autoOpening: true });
}

export async function createGoogleSheetFromPayload(
  payload: GoogleSheetPendingPayload,
  opts?: {
    projectId?: string;
    projectName?: string;
    openInNewTab?: boolean;
    autoOpenInApp?: boolean;
  },
): Promise<GoogleSheetCreateResult> {
  const statusRes = await fetch("/api/google/status", { cache: "no-store" });
  const status = (await statusRes.json()) as {
    connected?: boolean;
    configured?: boolean;
  };
  if (!status.connected) {
    return {
      ok: false,
      error:
        "Google isn't connected yet — connect in **Settings** and I'll create the sheet.",
      needsConnection: true,
    };
  }

  const res = await fetch("/api/google/create-doc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: payload.title.slice(0, 120),
      content: payload.csv,
      kind: "sheet",
    }),
  });

  const data = (await res.json()) as { url?: string; id?: string; error?: string };
  if (!res.ok || !data.url || !data.id) {
    return {
      ok: false,
      error: data.error ?? "Couldn't create the Google Sheet.",
      needsConnection: res.status === 401,
    };
  }

  const linkCheck = validateGoogleSheetLink(data.url, data.id);
  const session = linkCheck.valid
    ? buildGoogleWorkspaceSession({
        kind: "sheet",
        url: data.url,
        title: payload.title,
        artifactType: payload.artifactType,
        content: payload.csv,
        fileId: data.id,
      })
    : null;

  const saved = createSavedWork({
    title: payload.title,
    artifactType: payload.artifactType,
    body: payload.csv,
    sourceWorkspace: "google-workspace",
    tags: ["google-sheet", payload.sheetType],
  });
  updateSavedWork(saved.id, {
    googleDocId: data.id,
    googleDocUrl: data.url,
    projectId: opts?.projectId,
    projectName: opts?.projectName,
    status: linkCheck.valid ? "exported" : "saved",
    tags: ["google-sheet", payload.sheetType],
    typeFolder: "Google Sheets",
    savedLocation: googleSheetSavedLocationLabel(payload.title),
  });

  const libraryItem = addGoogleSheetToLibrary({
    title: payload.title,
    googleDocId: data.id,
    googleDocUrl: data.url,
    sheetType: payload.sheetType,
    source: "chat",
    savedWorkId: saved.id,
  });

  updateSavedWork(saved.id, {
    savedLocation: googleSheetSavedLocationLabel(payload.title),
    typeFolder: "Google Sheets",
  });

  if (
    opts?.openInNewTab !== false &&
    linkCheck.valid &&
    typeof window !== "undefined"
  ) {
    window.open(data.url, "_blank", "noopener,noreferrer");
  }

  void import("@/lib/ecosystem/eventTrackingEngine").then(({ trackEcosystemEvent }) => {
    trackEcosystemEvent({
      eventType: "document.google_sheet_created",
      feature: "documents",
      metadata: {
        documentId: data.id ?? null,
        artifactType: payload.artifactType ?? null,
        sheetType: payload.sheetType ?? null,
        linkValid: linkCheck.valid,
      },
    });
  });

  if (!linkCheck.valid || !session) {
    return {
      ok: true,
      url: data.url,
      id: data.id,
      savedWorkId: saved.id,
      libraryId: libraryItem.id,
      session: null,
      linkFailed: true,
    };
  }

  return {
    ok: true,
    url: data.url,
    id: data.id,
    savedWorkId: saved.id,
    libraryId: libraryItem.id,
    session,
  };
}
