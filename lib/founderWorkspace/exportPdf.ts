import { jsPDF } from "jspdf";

import type { FounderWorkspaceItem } from "./types";
import { formatFounderPdfBody, founderExportFilename } from "./exportContent";

export function downloadFounderItemPdf(item: FounderWorkspaceItem): void {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 56;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const body = formatFounderPdfBody(item);
  const bodyLines = doc.splitTextToSize(body, maxWidth);
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

  doc.save(founderExportFilename(item.title, "pdf"));
}
