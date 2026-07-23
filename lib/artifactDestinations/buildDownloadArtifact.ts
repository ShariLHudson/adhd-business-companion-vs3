import type {
  ArtifactDestinationFormat,
  BuiltDownloadArtifact,
} from "./types";

const UTF8_BOM = "\uFEFF";

function sanitizeFilenameBase(title: string): string {
  const base = (title || "spark-content")
    .replace(/[^\w.\- ]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || "spark-content";
}

function ensureExtension(base: string, ext: string): string {
  const lower = base.toLowerCase();
  if (lower.endsWith(`.${ext}`)) return base;
  return `${base}.${ext}`;
}

/** UTF-8 text with BOM so Windows Notepad never misreads as ANSI/binary. */
export function utf8TextBytes(text: string): Uint8Array {
  return new TextEncoder().encode(UTF8_BOM + text);
}

function mimeFor(format: ArtifactDestinationFormat): string {
  switch (format) {
    case "md":
      return "text/markdown;charset=utf-8";
    case "csv":
      return "text/csv;charset=utf-8";
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "txt":
    default:
      return "text/plain;charset=utf-8";
  }
}

function asMarkdown(title: string, body: string): string {
  const heading = title.trim() || "Spark document";
  return `# ${heading}\n\n${body.trim()}\n`;
}

function asCsv(body: string): string {
  // Prefer pipe/markdown tables when present; otherwise one-cell-per-line.
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const tableRows = lines.filter((l) => l.includes("|") && !/^\s*\|?\s*-+/.test(l));
  if (tableRows.length >= 2) {
    return tableRows
      .map((row) =>
        row
          .split("|")
          .map((c) => c.trim())
          .filter(Boolean)
          .map((c) => `"${c.replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
  }
  return lines
    .map((line) => `"${line.replace(/"/g, '""')}"`)
    .join("\n");
}

/**
 * Minimal Word-compatible OOXML (.docx) using store-only ZIP (no compression).
 * Produces a valid package Word / LibreOffice can open — never binary gibberish as .txt.
 */
function buildMinimalDocx(title: string, body: string): Uint8Array {
  const escapeXml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const paragraphs = (body.trim() || " ").split(/\n/).map((line) => {
    const text = escapeXml(line.length ? line : " ");
    return `<w:p><w:r><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;
  });

  const documentXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
    `<w:body>` +
    `<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(title.trim() || "Spark document")}</w:t></w:r></w:p>` +
    paragraphs.join("") +
    `<w:sectPr/></w:body></w:document>`;

  const contentTypes =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
    `</Types>`;

  const rels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
    `</Relationships>`;

  const files: { path: string; data: Uint8Array }[] = [
    { path: "[Content_Types].xml", data: new TextEncoder().encode(contentTypes) },
    { path: "_rels/.rels", data: new TextEncoder().encode(rels) },
    { path: "word/document.xml", data: new TextEncoder().encode(documentXml) },
  ];

  return zipStore(files);
}

function crc32(bytes: Uint8Array): number {
  let c = ~0;
  for (let i = 0; i < bytes.length; i += 1) {
    c ^= bytes[i]!;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    }
  }
  return ~c >>> 0;
}

function u16(n: number): Uint8Array {
  const b = new Uint8Array(2);
  b[0] = n & 0xff;
  b[1] = (n >>> 8) & 0xff;
  return b;
}

function u32(n: number): Uint8Array {
  const b = new Uint8Array(4);
  b[0] = n & 0xff;
  b[1] = (n >>> 8) & 0xff;
  b[2] = (n >>> 16) & 0xff;
  b[3] = (n >>> 24) & 0xff;
  return b;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

/** Store-method ZIP (method 0) — sufficient for a tiny docx package. */
function zipStore(files: { path: string; data: Uint8Array }[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.path);
    const crc = crc32(file.data);
    const localHeader = concatBytes([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
    ]);
    localParts.push(localHeader, file.data);

    const central = concatBytes([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(nameBytes.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBytes,
    ]);
    centralParts.push(central);
    offset += localHeader.length + file.data.length;
  }

  const centralDir = concatBytes(centralParts);
  const localDir = concatBytes(localParts);
  const end = concatBytes([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDir.length),
    u32(localDir.length),
    u16(0),
  ]);

  return concatBytes([localDir, centralDir, end]);
}

async function buildPdfBytes(title: string, body: string): Promise<Uint8Array> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(title.trim() || "Spark document", pageWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 20 + 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const bodyLines = doc.splitTextToSize(body || " ", pageWidth);
  const lineHeight = 16;
  const pageHeight = doc.internal.pageSize.getHeight();

  for (const line of bodyLines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  const arrayBuffer = doc.output("arraybuffer");
  return new Uint8Array(arrayBuffer);
}

export type BuildDownloadArtifactInput = {
  title: string;
  body: string;
  format: ArtifactDestinationFormat;
};

/**
 * Build a downloadable artifact with honest MIME type, extension, and encoding.
 * Text formats always include a UTF-8 BOM so Notepad shows readable text.
 */
export async function buildDownloadArtifact(
  input: BuildDownloadArtifactInput,
): Promise<BuiltDownloadArtifact> {
  const base = sanitizeFilenameBase(input.title);
  const body = String(input.body ?? "");

  if (input.format === "pdf") {
    const bytes = await buildPdfBytes(input.title, body);
    return {
      filename: ensureExtension(base, "pdf"),
      mimeType: mimeFor("pdf"),
      bytes,
      encoding: "binary",
      format: "pdf",
    };
  }

  if (input.format === "docx") {
    const bytes = buildMinimalDocx(input.title, body);
    return {
      filename: ensureExtension(base, "docx"),
      mimeType: mimeFor("docx"),
      bytes,
      encoding: "binary",
      format: "docx",
    };
  }

  let text: string;
  let ext: ArtifactDestinationFormat;
  if (input.format === "md") {
    text = asMarkdown(input.title, body);
    ext = "md";
  } else if (input.format === "csv") {
    text = asCsv(body);
    ext = "csv";
  } else {
    text = body;
    ext = "txt";
  }

  return {
    filename: ensureExtension(base, ext),
    mimeType: mimeFor(ext),
    text: UTF8_BOM + text,
    bytes: utf8TextBytes(text),
    encoding: "utf-8",
    format: ext,
  };
}

/** Trigger a browser download for a built artifact. */
export function triggerBrowserDownload(artifact: BuiltDownloadArtifact): void {
  const payload = artifact.bytes
    ? artifact.bytes
    : new TextEncoder().encode(artifact.text ?? "");
  const blob = new Blob([payload], { type: artifact.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = artifact.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
