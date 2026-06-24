/**
 * Convert draft content to CSV for Google Sheets export.
 */

export function isTableFriendlyContent(content: string): boolean {
  const t = content.trim();
  if (!t) return false;
  const pipeRows = t.split("\n").filter((l) => l.includes("|"));
  if (pipeRows.length >= 2) return true;
  const tabRows = t.split("\n").filter((l) => l.includes("\t"));
  if (tabRows.length >= 2) return true;
  const bulletRows = t.split("\n").filter((l) => /^[-•*\d]+[.)]\s/.test(l.trim()));
  if (bulletRows.length >= 3) return true;
  return false;
}

function escapeCsvCell(cell: string): string {
  const c = cell.replace(/\*\*/g, "").trim();
  if (/[",\n]/.test(c)) return `"${c.replace(/"/g, '""')}"`;
  return c;
}

export function rowsToCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

function markdownTableToRows(content: string): string[][] | null {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const tableLines = lines.filter((l) => l.includes("|"));
  if (tableLines.length < 2) return null;
  const rows: string[][] = [];
  for (const line of tableLines) {
    if (/^\|?[\s:-]+\|/.test(line)) continue;
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((c, i, arr) => !(i === 0 && !c) && !(i === arr.length - 1 && !c));
    if (cells.length) rows.push(cells);
  }
  return rows.length ? rows : null;
}

export function contentToSheetCsv(content: string): string {
  const table = markdownTableToRows(content);
  if (table) {
    return table.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
  }

  const lines = content
    .split("\n")
    .map((l) => l.replace(/^[-•*\d]+[.)]\s+/, "").replace(/\*\*/g, "").trim())
    .filter(Boolean);

  if (lines.length >= 2) {
    return ["Item", "Notes", ...lines.map((l, i) => `${i + 1},${escapeCsvCell(l)}`)].join(
      "\n",
    );
  }

  return `Content\n${escapeCsvCell(content.trim())}`;
}
