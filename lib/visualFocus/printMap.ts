/**
 * Print a completed Visual Focus map — map content only, not the full app chrome.
 */

import { canonicalMapName } from "@/lib/cartographersStudio/mapDefinitions";
import type { VisualFocusMap, VisualFocusVisualLayout } from "./types";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layoutSvg(layout: VisualFocusVisualLayout, title: string): string {
  const width = 960;
  const height = 640;
  const nodes = layout.nodes
    .map((n) => {
      const x = (n.x / 100) * (width - 80) + 40;
      const y = (n.y / 100) * (height - 80) + 40;
      const fill = n.color ?? "#1e4f4f";
      const label = esc(n.label.slice(0, 42));
      return `<g>
        <circle cx="${x}" cy="${y}" r="28" fill="${fill}" opacity="0.9"/>
        <text x="${x}" y="${y + 48}" text-anchor="middle" font-size="12" fill="#2f261f">${label}</text>
      </g>`;
    })
    .join("");
  const edges = layout.edges
    .map((e) => {
      const from = layout.nodes.find((n) => n.id === e.fromId);
      const to = layout.nodes.find((n) => n.id === e.toId);
      if (!from || !to) return "";
      const x1 = (from.x / 100) * (width - 80) + 40;
      const y1 = (from.y / 100) * (height - 80) + 40;
      const x2 = (to.x / 100) * (width - 80) + 40;
      const y2 = (to.y / 100) * (height - 80) + 40;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8a7d70" stroke-width="2"/>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}">
    <rect width="100%" height="100%" fill="#faf6ee"/>
    ${edges}${nodes}
  </svg>`;
}

function outlineList(map: VisualFocusMap, depth = 0): string {
  function walk(node: VisualFocusMap["root"], d: number): string {
    const pad = "&nbsp;".repeat(d * 4);
    const kids = node.children.map((c) => walk(c, d + 1)).join("");
    return `<div>${pad}${d === 0 ? "<strong>" : ""}${esc(node.label)}${d === 0 ? "</strong>" : ""}</div>${kids}`;
  }
  return walk(map.root, depth);
}

export function buildVisualFocusPrintHtml(map: VisualFocusMap): string {
  const typeName = canonicalMapName(map.mode);
  const date = new Date(map.updatedAt || map.createdAt).toLocaleDateString();
  const visual =
    map.visualLayout && map.visualLayout.nodes.length > 0
      ? layoutSvg(map.visualLayout, map.title)
      : `<div class="outline">${outlineList(map)}</div>`;
  const summary = map.summary?.trim()
    ? `<p class="summary">${esc(map.summary)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${esc(map.title)} — ${esc(typeName)}</title>
  <style>
    @page { size: landscape; margin: 0.6in; }
    body {
      margin: 0;
      font-family: "Lora", Georgia, serif;
      color: #2f261f;
      background: #faf6ee;
    }
    .sheet { max-width: 11in; margin: 0 auto; }
    .type {
      font-size: 11pt;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #8a7d70;
      margin: 0 0 0.15in;
    }
    h1 {
      font-size: 22pt;
      font-weight: 600;
      margin: 0 0 0.1in;
    }
    .meta { font-size: 10pt; color: #8a7d70; margin-bottom: 0.25in; }
    .summary { font-size: 12pt; line-height: 1.45; margin: 0.2in 0; }
    .visual { margin-top: 0.15in; }
    .outline { font-size: 12pt; line-height: 1.5; }
    @media print {
      body { background: white; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <p class="type">${esc(typeName)}</p>
    <h1>${esc(map.title || "Untitled map")}</h1>
    <p class="meta">Updated ${esc(date)}</p>
    ${summary}
    <div class="visual">${visual}</div>
  </div>
</body>
</html>`;
}

/** Opens a print-only window with map content (not the full Estate chrome). */
export function printVisualFocusMap(map: VisualFocusMap): void {
  if (typeof window === "undefined") return;
  const html = buildVisualFocusPrintHtml(map);
  const win = window.open("", "_blank", "noopener,noreferrer,width=1100,height=800");
  if (!win) {
    // Popup blocked — fall back to blob URL in same tab print flow
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        window.setTimeout(() => {
          URL.revokeObjectURL(url);
          iframe.remove();
        }, 1000);
      }
    };
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  window.setTimeout(() => {
    win.print();
  }, 250);
}
