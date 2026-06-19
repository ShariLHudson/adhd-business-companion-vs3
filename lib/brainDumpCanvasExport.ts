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
  width = 800,
  height = 640,
): string {
  const clusters = graph.clusters
    .filter((c) => c.id !== "__more__")
    .slice(0, 4);
  const clusterSvg = clusters
    .map((c, i) => {
      const x = 80 + (i % 2) * 360;
      const y = 200 + Math.floor(i / 2) * 140;
      return `<rect x="${x}" y="${y}" width="280" height="100" rx="20" fill="#ffffff" stroke="#1e4f4f" stroke-width="2" opacity="0.95"/>
  <text x="${x + 20}" y="${y + 36}" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#1f1c19">${escapeXml(c.icon)} ${escapeXml(c.label)}</text>
  <text x="${x + 20}" y="${y + 58}" font-family="system-ui,sans-serif" font-size="12" fill="#6b635a">${c.count} thought${c.count === 1 ? "" : "s"}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#faf7f2"/>
  <text x="400" y="48" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="#6b635a">Clear My Mind</text>
  <circle cx="400" cy="130" r="56" fill="#ffffff" stroke="#1e4f4f" stroke-width="3"/>
  <text x="400" y="125" text-anchor="middle" font-size="28">🧠</text>
  <text x="400" y="155" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="600" fill="#1f1c19">${graph.totalThoughts} thoughts</text>
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
  doc.setFontSize(18);
  doc.text("Clear My Mind — Visual Summary", margin, y);
  y += 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`${graph.totalThoughts} thoughts organized`, margin, y);
  y += 24;

  for (const cluster of graph.clusters.filter((c) => c.id !== "__more__")) {
    doc.setFont("helvetica", "bold");
    doc.text(`${cluster.icon} ${cluster.label} (${cluster.count})`, margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    for (const sub of cluster.subClusters.slice(0, 3)) {
      doc.text(`  ${sub.label}: ${sub.thoughts.length} items`, margin, y);
      y += 14;
      for (const t of sub.visibleThoughts) {
        for (const line of doc.splitTextToSize(`    • ${t.text}`, 480)) {
          if (y > 720) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 12;
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
    <style>body{font-family:system-ui,sans-serif;padding:24px;background:#faf7f2;}</style>
    </head><body>${element.innerHTML}</body></html>
  `);
  w.document.close();
  w.focus();
  w.print();
}
