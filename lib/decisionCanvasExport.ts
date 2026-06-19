/**
 * Decision visual export — PNG, PDF, print.
 * Infographic-aligned output for shareable exports.
 */

import { jsPDF } from "jspdf";
import type { DecisionMapViewModel } from "./decisionMapView";
import type { VisualThinkingGraph } from "./visualThinkingEngine";
import {
  buildDecisionRecommendationReport,
  type DecisionRecommendationReport,
} from "./decisionRecommendationReport";
import type { PersistedDecisionCompassSession } from "./decisionCompassSessionStore";
import { buildDecisionMapView } from "./decisionMapView";
import { buildDecisionCanvasGraph } from "./decisionCanvasModel";
import {
  buildDecisionExplorationState,
  CONFIDENCE_META,
  explorationSummaryForExport,
} from "./decisionCompassExploration";

export type DecisionExportTarget =
  | "png"
  | "pdf"
  | "print"
  | "project"
  | "google-doc"
  | "google-drive"
  | "google-slides";

export type DecisionExportPlan = {
  supported: DecisionExportTarget[];
  planned: DecisionExportTarget[];
};

export const DECISION_EXPORT_PLAN: DecisionExportPlan = {
  supported: ["png", "pdf", "print"],
  planned: ["project", "google-doc", "google-drive", "google-slides"],
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

/** Infographic-aligned SVG — mirrors on-screen Decision Canvas layout. */
export function buildDecisionInfographicSvg(
  vm: DecisionMapViewModel,
  graph: VisualThinkingGraph,
  width = 720,
  height = 960,
): string {
  const decision = escapeXml(truncate(vm.decision || "Your decision", 80));
  const optA = escapeXml(truncate(vm.optionA.label, 36));
  const optB = escapeXml(truncate(vm.optionB.label, 36));
  const benA = vm.optionA.benefits.slice(0, 2).map((b) => escapeXml(truncate(b, 48)));
  const conA = vm.optionA.concerns.slice(0, 2).map((c) => escapeXml(truncate(c, 48)));
  const benB = vm.optionB.benefits.slice(0, 2).map((b) => escapeXml(truncate(b, 48)));
  const conB = vm.optionB.concerns.slice(0, 2).map((c) => escapeXml(truncate(c, 48)));

  const scoreRows = vm.scores.slice(0, 4).map((s, i) => {
    const y = 420 + i * 44;
    return `
    <text x="48" y="${y}" font-size="11" font-weight="600" fill="#1f1c19">${escapeXml(s.label)}</text>
    <rect x="48" y="${y + 6}" width="280" height="8" rx="4" fill="#e7dfd4"/>
    <rect x="48" y="${y + 6}" width="${(280 * s.optionAPct) / 100}" height="8" rx="4" fill="#34d399"/>
    <rect x="380" y="${y + 6}" width="280" height="8" rx="4" fill="#e7dfd4"/>
    <rect x="380" y="${y + 6}" width="${(280 * s.optionBPct) / 100}" height="8" rx="4" fill="#60a5fa"/>`;
  }).join("");

  const rec = vm.recommendation;
  const recBlock = rec
    ? `
  <rect x="40" y="${height - 200}" width="${width - 80}" height="150" rx="20" fill="#fffbeb" stroke="#fcd34d" stroke-width="2"/>
  <text x="${width / 2}" y="${height - 168}" text-anchor="middle" font-size="13" font-weight="700" fill="#92400e">⭐ Recommended Direction</text>
  <text x="${width / 2}" y="${height - 144}" text-anchor="middle" font-size="16" font-weight="700" fill="#92400e">${escapeXml(truncate(rec.choice, 40))}</text>
  ${rec.primaryReasons
    .slice(0, 3)
    .map(
      (r, i) =>
        `<text x="${width / 2}" y="${height - 120 + i * 18}" text-anchor="middle" font-size="11" fill="#92400e">• ${escapeXml(truncate(r, 56))}</text>`,
    )
    .join("")}`
    : "";

  const haloA =
    graph.recommendedSide === "A"
      ? `<rect x="36" y="108" width="312" height="120" rx="18" fill="none" stroke="#fcd34d" stroke-width="4"/>`
      : "";
  const haloB =
    graph.recommendedSide === "B"
      ? `<rect x="372" y="108" width="312" height="120" rx="18" fill="none" stroke="#fcd34d" stroke-width="4"/>`
      : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#faf7f2"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" rx="24"/>
  <text x="${width / 2}" y="40" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="#9a8f82" letter-spacing="2">ADHD DECISION CANVAS</text>
  <text x="${width / 2}" y="72" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" font-weight="700" fill="#1f1c19">🎯 ${decision}</text>
  ${haloA}
  <rect x="40" y="108" width="312" height="120" rx="18" fill="#ecfdf5" stroke="#34d399" stroke-width="2"/>
  <text x="56" y="136" font-size="14" font-weight="700" fill="#064e3b">🟢 ${optA}</text>
  ${benA.map((b, i) => `<text x="56" y="${158 + i * 18}" font-size="11" fill="#14532d">✅ ${b}</text>`).join("")}
  ${conA.map((c, i) => `<text x="56" y="${194 + i * 16}" font-size="10" fill="#9f1239">⚠ ${c}</text>`).join("")}
  ${haloB}
  <rect x="368" y="108" width="312" height="120" rx="18" fill="#eff6ff" stroke="#60a5fa" stroke-width="2"/>
  <text x="384" y="136" font-size="14" font-weight="700" fill="#1e3a8a">🔵 ${optB}</text>
  ${benB.map((b, i) => `<text x="384" y="${158 + i * 18}" font-size="11" fill="#1e3a8a">✅ ${b}</text>`).join("")}
  ${conB.map((c, i) => `<text x="384" y="${194 + i * 16}" font-size="10" fill="#9f1239">⚠ ${c}</text>`).join("")}
  ${
    vm.scores.length
      ? `<text x="48" y="280" font-size="11" font-weight="700" fill="#6b635a">QUICK COMPARISON</text>${scoreRows}`
      : ""
  }
  ${recBlock}
</svg>`;
}

/** @deprecated use buildDecisionInfographicSvg */
export function buildDecisionExportSvg(
  vm: DecisionMapViewModel,
  graph: VisualThinkingGraph,
  width = 720,
  height = 960,
): string {
  return buildDecisionInfographicSvg(vm, graph, width, height);
}

export async function svgStringToPngBlob(
  svg: string,
  width = 720,
  height = 960,
): Promise<Blob> {
  if (typeof document === "undefined") {
    return new Blob([svg], { type: "image/svg+xml" });
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
    );
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas unavailable"));
        return;
      }
      ctx.fillStyle = "#faf7f2";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("PNG failed"))),
        "image/png",
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG render failed"));
    };
    img.src = url;
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportDecisionVisualPng(
  vm: DecisionMapViewModel,
  graph: VisualThinkingGraph,
  filename = "decision-canvas.png",
): Promise<Blob> {
  const svg = buildDecisionInfographicSvg(vm, graph);
  const blob = await svgStringToPngBlob(svg);
  if (typeof document !== "undefined") {
    downloadBlob(blob, filename);
  }
  return blob;
}

function pdfSection(
  doc: jsPDF,
  title: string,
  items: string[],
  startY: number,
  margin: number,
): number {
  let y = startY;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 79, 79);
  doc.text(title, margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(45, 41, 38);
  for (const item of items) {
    for (const line of doc.splitTextToSize(`• ${item.replace(/\*\*/g, "")}`, 500)) {
      if (y > 720) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 13;
    }
  }
  return y + 8;
}

export async function exportDecisionVisualPdf(
  session: PersistedDecisionCompassSession | null,
  filename = "decision-compass.pdf",
): Promise<void> {
  const vm = buildDecisionMapView(session);
  const graph = buildDecisionCanvasGraph(session);
  const report = buildDecisionRecommendationReport(session);
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  const pageW = doc.internal.pageSize.getWidth();

  // Page 1 — visual infographic
  const svg = buildDecisionInfographicSvg(vm, graph, 720, 960);
  const pngBlob = await svgStringToPngBlob(svg, 720, 960);
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(pngBlob);
  });
  const imgW = pageW - margin * 2;
  const imgH = (imgW * 960) / 720;
  doc.addImage(dataUrl, "PNG", margin, margin, imgW, Math.min(imgH, 680));

  // Page 2 — recommendation summary
  doc.addPage();
  let y = margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 79, 79);
  doc.text("Recommendation Summary", margin, y);
  y += 28;

  if (report?.overallDirection) {
    doc.setFontSize(12);
    doc.text(
      `${report.overallDirection.qualifier}:`,
      margin,
      y,
    );
    y += 18;
    doc.setFontSize(14);
    doc.text(report.overallDirection.choice, margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    for (const line of doc.splitTextToSize(report.overallDirection.summary, 500)) {
      doc.text(line, margin, y);
      y += 14;
    }
    y += 8;
  }

  if (report) {
    y = pdfSection(doc, "Potential Advantages", report.potentialAdvantages, y, margin);
    y = pdfSection(doc, "Potential Concerns", report.potentialConcerns, y, margin);
    const exp = session ? buildDecisionExplorationState(session) : null;
    if (exp) {
      y = pdfSection(
        doc,
        `Decision Confidence: ${CONFIDENCE_META[exp.confidence].label}`,
        [CONFIDENCE_META[exp.confidence].description],
        y,
        margin,
      );
      if (exp.whatCouldChange.length) {
        y = pdfSection(doc, "What Could Change This", exp.whatCouldChange, y, margin);
      }
    }
  }

  // Page 3 — tradeoffs & questions
  doc.addPage();
  y = margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 79, 79);
  doc.text("Tradeoffs & Considerations", margin, y);
  y += 28;

  if (vm.scores.length) {
    y = pdfSection(
      doc,
      "Comparison Dimensions",
      vm.scores.map(
        (s) =>
          `${s.label}: ${s.winner === "A" ? vm.optionA.label : vm.optionB.label} leads`,
      ),
      y,
      margin,
    );
  }

  if (report) {
    y = pdfSection(
      doc,
      "Questions Worth Considering",
      report.questionsWorthConsidering,
      y,
      margin,
    );
  }

  const expState = session?.exploration ?? (session ? buildDecisionExplorationState(session) : null);
  if (expState?.exploredQuestions.length) {
    doc.addPage();
    y = margin;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Questions You Explored", margin, y);
    y += 28;
    for (const q of expState.exploredQuestions) {
      y = pdfSection(doc, q.question, q.answer ? [q.answer] : [], y, margin);
    }
  }

  if (expState?.alternativePaths) {
    doc.addPage();
    y = margin;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Alternative Paths", margin, y);
    y += 28;
    y = pdfSection(
      doc,
      "Primary Path",
      [expState.alternativePaths.primary],
      y,
      margin,
    );
    y = pdfSection(
      doc,
      "Alternatives",
      expState.alternativePaths.alternatives,
      y,
      margin,
    );
    if (expState.alternativePaths.experimental.length) {
      y = pdfSection(
        doc,
        "Experiments",
        expState.alternativePaths.experimental,
        y,
        margin,
      );
    }
  }

  if (expState?.actionPlan) {
    doc.addPage();
    y = margin;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Action Plan", margin, y);
    y += 28;
    y = pdfSection(
      doc,
      expState.actionPlan.recommendedChoice,
      expState.actionPlan.steps.map((s, i) => `${i + 1}. ${s}`),
      y,
      margin,
    );
  }

  if (report) {
    if (y > 600) {
      doc.addPage();
      y = margin;
    }
    y = pdfSection(doc, "Alternative Paths (Report)", report.alternativePaths, y, margin);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(107, 99, 90);
    for (const line of doc.splitTextToSize(report.disclaimer, 500)) {
      doc.text(line, margin, y);
      y += 12;
    }
  } else if (session) {
    const summary = explorationSummaryForExport(session);
    if (summary) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      for (const line of doc.splitTextToSize(summary, 500)) {
        doc.text(line, margin, y);
        y += 12;
      }
    }
  }

  doc.save(filename);
}

/** Legacy signature — builds session from vm only for text-only fallback. */
export function exportDecisionVisualPdfFromVm(
  vm: DecisionMapViewModel,
  filename = "decision-canvas.pdf",
): void {
  void exportDecisionVisualPdf(
    {
      sessionId: "export",
      decision: vm.decision,
      optionA: vm.optionA.label,
      optionB: vm.optionB.label,
      answers: {},
      decisionType: null,
      stepIndex: 0,
      currentStepId: "decision",
      completedSteps: [],
      showMap: false,
      draft: "",
      complete: Boolean(vm.recommendation),
      recommendation: vm.recommendation
        ? {
            type: "strategic",
            headline: vm.recommendation.headline,
            choice: vm.recommendation.choice,
            summary: vm.recommendation.summary,
          }
        : null,
      lastTouchedAt: new Date().toISOString(),
    },
    filename,
  );
}

export function buildPrintableDecisionHtml(
  element: HTMLElement | null,
  report: DecisionRecommendationReport | null,
): string {
  const canvasHtml = element?.innerHTML ?? "";
  const reportHtml = report
    ? `
    <section class="report">
      <h2>Recommendation Report</h2>
      ${
        report.overallDirection
          ? `<div class="direction"><p><strong>${report.overallDirection.qualifier}</strong></p>
             <p class="choice">${report.overallDirection.choice}</p>
             <p>${report.overallDirection.summary}</p></div>`
          : ""
      }
      ${sectionHtml("What We Notice", report.whatWeNotice)}
      ${sectionHtml("Potential Advantages", report.potentialAdvantages)}
      ${sectionHtml("Potential Concerns", report.potentialConcerns)}
      ${sectionHtml("Questions Worth Considering", report.questionsWorthConsidering)}
      ${sectionHtml("Alternative Paths", report.alternativePaths)}
      <p class="disclaimer">${report.disclaimer}</p>
    </section>`
    : "";

  return `
    <html><head><title>Decision Compass</title>
    <style>
      body{font-family:system-ui,sans-serif;padding:24px;background:#faf7f2;color:#1f1c19;}
      .canvas{margin-bottom:32px;}
      .report h2{color:#1e4f4f;margin-top:0;}
      .direction{background:#fffbeb;border:2px solid #fcd34d;border-radius:16px;padding:16px;margin:16px 0;}
      .choice{font-size:1.25rem;font-weight:700;color:#92400e;}
      section.block{margin:12px 0;padding:12px;border-radius:12px;border:1px solid #d4cdc3;background:#fff;}
      section.block h3{margin:0 0 8px;font-size:0.9rem;color:#1e4f4f;}
      ul{margin:0;padding-left:1.2rem;}
      .disclaimer{font-size:0.85rem;color:#6b635a;margin-top:16px;}
    </style>
    </head><body>
    <div class="canvas">${canvasHtml}</div>
    ${reportHtml}
    </body></html>`;
}

function sectionHtml(title: string, items: string[]): string {
  if (!items.length) return "";
  return `<section class="block"><h3>${title}</h3><ul>${items
    .map((i) => `<li>${i.replace(/\*\*/g, "")}</li>`)
    .join("")}</ul></section>`;
}

export function printDecisionVisual(
  element: HTMLElement | null,
  report?: DecisionRecommendationReport | null,
): void {
  if (typeof window === "undefined") return;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(buildPrintableDecisionHtml(element, report ?? null));
  w.document.close();
  w.focus();
  w.print();
}

/** Check infographic SVG includes the same headline content as the view model. */
export function infographicSvgMatchesViewModel(
  vm: DecisionMapViewModel,
  svg: string,
): boolean {
  if (!svg.includes(vm.decision.slice(0, 20))) return false;
  if (!svg.includes(vm.optionA.label.slice(0, 12))) return false;
  if (!svg.includes(vm.optionB.label.slice(0, 12))) return false;
  if (vm.recommendation && !svg.includes("Recommended")) return false;
  return true;
}
