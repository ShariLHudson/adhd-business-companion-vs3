// Server-side Google Drive / Docs / Sheets helpers (OAuth token required).

import type { GTokens } from "./google";
import type { GoogleFileKind } from "./googleWorkspace";

export type CreateGoogleFileInput = {
  title: string;
  content: string;
  kind: GoogleFileKind;
  folderId?: string;
};

export type CreateGoogleFileResult = {
  fileId: string;
  url: string;
  kind: GoogleFileKind;
};

export function googleUrlForFile(kind: GoogleFileKind, fileId: string): string {
  switch (kind) {
    case "sheet":
      return `https://docs.google.com/spreadsheets/d/${fileId}/edit`;
    case "form":
      return `https://docs.google.com/forms/d/${fileId}/edit`;
    default:
      return `https://docs.google.com/document/d/${fileId}/edit`;
  }
}

export async function createGoogleDriveFile(
  tokens: GTokens,
  input: CreateGoogleFileInput,
): Promise<CreateGoogleFileResult> {
  const mimeType =
    input.kind === "sheet"
      ? "application/vnd.google-apps.spreadsheet"
      : input.kind === "form"
        ? "application/vnd.google-apps.document"
        : "application/vnd.google-apps.document";

  const partType = input.kind === "sheet" ? "text/csv" : "text/plain";
  const fileTitle =
    input.kind === "form" && !input.title.toLowerCase().includes("form")
      ? `Form: ${input.title}`
      : input.title.slice(0, 120);

  const metadata: { name: string; mimeType: string; parents?: string[] } = {
    name: fileTitle,
    mimeType,
  };
  if (input.folderId) {
    metadata.parents = [input.folderId];
  }

  const boundary = `spark${Date.now()}`;
  const multipart =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${partType}; charset=UTF-8\r\n\r\n` +
    `${input.content}\r\n` +
    `--${boundary}--`;

  const r = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipart,
    },
  );

  if (!r.ok) {
    const detail = await r.text();
    throw new Error(detail || "Drive create failed.");
  }

  const j = (await r.json()) as { id: string };
  return {
    fileId: j.id,
    url: googleUrlForFile(input.kind, j.id),
    kind: input.kind,
  };
}

export async function createGoogleDriveFolder(
  tokens: GTokens,
  name: string,
  parentId?: string,
): Promise<{ folderId: string; url: string }> {
  const metadata: Record<string, unknown> = {
    name: name.slice(0, 120),
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentId) metadata.parents = [parentId];

  const r = await fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  });

  if (!r.ok) {
    throw new Error("Folder create failed.");
  }

  const j = (await r.json()) as { id: string };
  return {
    folderId: j.id,
    url: `https://drive.google.com/drive/folders/${j.id}`,
  };
}

export async function updateGoogleDriveFile(
  tokens: GTokens,
  input: { fileId: string; content: string; kind: GoogleFileKind },
): Promise<void> {
  if (input.kind === "sheet") {
    const lines = input.content
      .split("\n")
      .map((line) => line.split(/\t|\|/).map((c) => c.trim()));
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${input.fileId}/values/A1:clear`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
      },
    );
    const ur = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${input.fileId}/values/A1?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: lines }),
      },
    );
    if (!ur.ok) throw new Error("Sheet update failed.");
    return;
  }

  const docRes = await fetch(
    `https://docs.googleapis.com/v1/documents/${input.fileId}`,
    { headers: { Authorization: `Bearer ${tokens.access_token}` } },
  );
  if (!docRes.ok) throw new Error("Doc read failed.");

  const doc = (await docRes.json()) as {
    body?: { content?: { endIndex?: number }[] };
  };
  const endIndex = doc.body?.content?.at(-1)?.endIndex ?? 2;
  const requests = [
    {
      deleteContentRange: {
        range: { startIndex: 1, endIndex: Math.max(2, endIndex - 1) },
      },
    },
    { insertText: { location: { index: 1 }, text: input.content } },
  ];

  const up = await fetch(
    `https://docs.googleapis.com/v1/documents/${input.fileId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests }),
    },
  );
  if (!up.ok) throw new Error("Doc update failed.");
}
