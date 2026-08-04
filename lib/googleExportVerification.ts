/**
 * P0.44 — Google export pre-checks, post-create verification, user-facing messages.
 */

export const GOOGLE_EXPORT_MESSAGES = {
  emptyDocument:
    "I don't have enough content yet to create this document.",
  needSheetStructure: "I need the spreadsheet structure first.",
  verifyFailed: "I couldn't finish creating the Google file.",
  docCreated: "Google Doc created.",
  sheetCreated: "Google Sheet created.",
} as const;

export type SpreadsheetStructureResult =
  | { ok: true; rows: string[][]; columnCount: number; dataRowCount: number }
  | { ok: false; reason: "empty" | "no_columns" | "no_rows" };

export type DocumentContentResult =
  | { ok: true; length: number }
  | { ok: false; message: string };

/** True when content is already CSV (header + data rows with commas). */
export function isLikelyCsv(content: string): boolean {
  const lines = content
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  if (lines.length < 2) return false;
  const headerCommas = (lines[0]?.match(/,/g) ?? []).length;
  if (headerCommas < 1) return false;
  return lines.every((line) => (line.match(/,/g) ?? []).length >= headerCommas);
}

/** Parse simple CSV (quoted fields supported). */
export function parseCsvRows(csv: string): string[][] {
  const lines = csv.trim().split(/\r?\n/).filter((line) => line.length > 0);
  return lines.map(parseCsvLine);
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

export function validateDocumentExportContent(content: string): DocumentContentResult {
  const trimmed = content.trim();
  if (!trimmed) {
    return { ok: false, message: GOOGLE_EXPORT_MESSAGES.emptyDocument };
  }
  return { ok: true, length: trimmed.length };
}

export function validateSpreadsheetCsv(csv: string): SpreadsheetStructureResult {
  const trimmed = csv.trim();
  if (!trimmed) {
    return { ok: false, reason: "empty" };
  }

  const rows = parseCsvRows(trimmed);
  if (rows.length === 0 || rows.every((row) => row.every((cell) => !cell.trim()))) {
    return { ok: false, reason: "empty" };
  }

  const header = rows[0] ?? [];
  const columnCount = header.filter((cell) => cell.trim().length > 0).length;
  if (columnCount === 0) {
    return { ok: false, reason: "no_columns" };
  }

  const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell.trim().length > 0));
  if (dataRows.length === 0) {
    return { ok: false, reason: "no_rows" };
  }

  return {
    ok: true,
    rows,
    columnCount,
    dataRowCount: dataRows.length,
  };
}

export function spreadsheetStructureErrorMessage(
  reason: Exclude<SpreadsheetStructureResult, { ok: true }>["reason"],
): string {
  if (reason === "empty" || reason === "no_columns") {
    return GOOGLE_EXPORT_MESSAGES.needSheetStructure;
  }
  return GOOGLE_EXPORT_MESSAGES.needSheetStructure;
}

export function extractPlainTextFromGoogleDoc(doc: {
  body?: {
    content?: Array<{
      paragraph?: {
        elements?: Array<{ textRun?: { content?: string } }>;
      };
    }>;
  };
}): string {
  const parts: string[] = [];
  for (const block of doc.body?.content ?? []) {
    for (const el of block.paragraph?.elements ?? []) {
      if (el.textRun?.content) parts.push(el.textRun.content);
    }
  }
  return parts.join("");
}

export async function verifyGoogleDocFileContent(
  accessToken: string,
  fileId: string,
  minLength = 1,
): Promise<boolean> {
  try {
    const docRes = await fetch(
      `https://docs.googleapis.com/v1/documents/${fileId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (docRes.ok) {
      const doc = (await docRes.json()) as Parameters<
        typeof extractPlainTextFromGoogleDoc
      >[0];
      if (extractPlainTextFromGoogleDoc(doc).trim().length >= minLength) {
        return true;
      }
    }

    const exportRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (exportRes.ok) {
      const text = await exportRes.text();
      return text.trim().length >= minLength;
    }
  } catch (e) {
    console.error("verifyGoogleDocFileContent error", e);
  }
  return false;
}

export async function verifyGoogleSheetFileContent(
  accessToken: string,
  fileId: string,
): Promise<boolean> {
  try {
    const exportRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (exportRes.ok) {
      const csv = await exportRes.text();
      const check = validateSpreadsheetCsv(csv);
      if (check.ok) return true;
    }

    const valuesRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values/A1:Z200`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (valuesRes.ok) {
      const data = (await valuesRes.json()) as { values?: string[][] };
      const values = data.values ?? [];
      if (values.length < 2) return false;
      const headerCols = (values[0] ?? []).filter((c) => String(c).trim()).length;
      if (headerCols === 0) return false;
      const dataRows = values.slice(1).filter((row) => row.some((c) => String(c).trim()));
      return dataRows.length > 0;
    }
  } catch (e) {
    console.error("verifyGoogleSheetFileContent error", e);
  }
  return false;
}

export async function deleteGoogleDriveFile(
  accessToken: string,
  fileId: string,
): Promise<void> {
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (e) {
    console.error("deleteGoogleDriveFile error", e);
  }
}
