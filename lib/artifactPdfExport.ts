/**
 * Client-side PDF generation for artifact execution.
 */

import { jsPDF } from "jspdf";

function safeFilename(title: string): string {
  const base = title.trim().replace(/[^\w.-]+/g, "-").slice(0, 48);
  return base || "document";
}

export function downloadMarkdownAsPdf(title: string, body: string): void {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 56;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(title.trim() || "Document", maxWidth);
  for (const line of titleLines) {
    doc.text(line, margin, y);
    y += 18;
  }

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const plain = body
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^#+\s+/gm, "")
    .trim();
  const bodyLines = doc.splitTextToSize(plain, maxWidth);
  const lineHeight = 14;
  const pageHeight = doc.internal.pageSize.getHeight();

  for (const line of bodyLines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  doc.save(`${safeFilename(title)}.pdf`);
}
