/**
 * Clear My Mind visual export — reuses Decision Canvas export patterns.
 */

import { jsPDF } from "jspdf";
import type { BrainDumpClusterGraph } from "./brainDumpClusterModel";
import {
  downloadBlob,
  svgStringToPngBlob,
} from "./decisionCanvasExport";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildBrainDumpExportSvg(
  graph: BrainDumpClusterGraph,
  width = 960,
  height = 720,
): string {
  const clusters = graph.clusters
    .filter((c) => c.id !== "__more__")
    .slice(0, 4);
  const clusterSvg = clusters
    .map((c, i) => {
      const x = 100 + (i % 2) * 420;
      const y = 220 + Math.floor(i / 2) * 160;
      return `<rect x="${x}" y="${y}" width="320" height="120" rx="20" fill="#ffffff" stroke="#1e4f4f" stroke-width="2" opacity="0.95"/>
  <text x="${x + 24}" y="${y + 42}" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="#1f1c19">${escapeXml(c.icon)} ${escapeXml(c.label)}</text>
  <text x="${x + 24}" y="${y + 68}" font-family="system-ui,sans-serif" font-size="15" fill="#6b635a">${c.count} thought${c.count === 1 ? "" : "s"}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#faf7f2"/>
  <text x="480" y="56" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" fill="#6b635a">Clear My Mind</text>
  <circle cx="480" cy="150" r="64" fill="#ffffff" stroke="#1e4f4f" stroke-width="3"/>
  <text x="480" y="145" text-anchor="middle" font-size="32">🧠</text>
  <text x="480" y="178" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="600" fill="#1f1c19">${graph.totalThoughts} thoughts</text>
  ${clusterSvg}
</svg>`;
}

export async function exportBrainDumpVisualPng(
  graph: BrainDumpClusterGraph,
  filename = "clear-my-mind.png",
): Promise<Blob> {
  const svg = buildBrainDumpExportSvg(graph);
  const blob = await svgStringToPngBlob(svg);
  if (typeof document !== "undefined") {
    downloadBlob(blob, filename);
  }
  return blob;
}

export function exportBrainDumpVisualPdf(
  graph: BrainDumpClusterGraph,
  filename = "clear-my-mind.pdf",
): void {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Clear My Mind — Visual Summary", margin, y);
  y += 32;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text(`${graph.totalThoughts} thoughts organized`, margin, y);
  y += 28;

  for (const cluster of graph.clusters.filter((c) => c.id !== "__more__")) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${cluster.icon} ${cluster.label} (${cluster.count})`, margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    for (const sub of cluster.subClusters.slice(0, 3)) {
      doc.text(`  ${sub.label}: ${sub.thoughts.length} items`, margin, y);
      y += 16;
      for (const t of sub.visibleThoughts) {
        for (const line of doc.splitTextToSize(`    • ${t.text}`, 480)) {
          if (y > 720) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 14;
        }
      }
      y += 6;
    }
    y += 8;
  }

  doc.save(filename);
}

export function printBrainDumpVisual(element: HTMLElement | null): void {
  if (!element || typeof window === "undefined") return;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`
    <html><head><title>Clear My Mind</title>
    <style>
      body{font-family:system-ui,sans-serif;padding:32px;background:#faf7f2;font-size:16px;line-height:1.5;}
      h1,h2,h3,p,li{font-size:inherit;}
      [data-testid="brain-dump-infographic"]{max-width:720px;margin:0 auto;}
      .text-3xl{font-size:2rem !important;}
      .text-lg{font-size:1.125rem !important;}
      .text-base{font-size:1rem !important;}
    </style>
    </head><body>${element.innerHTML}</body></html>
  `);
  w.document.close();
  w.focus();
  w.print();
}
