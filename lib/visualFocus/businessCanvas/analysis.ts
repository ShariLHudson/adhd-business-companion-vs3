import type { VisualFocusAnalysis } from "../types";
import { BUSINESS_CANVAS_USER_LABEL } from "./architecture";
import type { BusinessCanvasData } from "./types";
import { BUSINESS_CANVAS_SECTION_GUIDANCE } from "./guidance";
import { BUSINESS_CANVAS_SECTION_ORDER } from "./types";
import { filledBusinessCanvasSectionCount } from "./factory";

export function buildBusinessCanvasAnalysis(
  data: BusinessCanvasData,
  title: string,
  purpose?: string,
): VisualFocusAnalysis {
  const now = new Date().toISOString();
  const filled = filledBusinessCanvasSectionCount(data);

  const segments = data.sections["customer-segments"].items.filter(Boolean);
  const value = data.sections["value-proposition"].items.filter(Boolean);
  const channels = data.sections.channels.items.filter(Boolean);
  const revenue = data.sections["revenue-streams"].items.filter(Boolean);
  const costs = data.sections["cost-structure"].items.filter(Boolean);

  const keyRelationships: string[] = [];
  if (segments[0] && value[0]) {
    keyRelationships.push(`${segments[0]} ↔ ${value[0]} (who you serve ↔ what you promise)`);
  }
  if (channels[0] && segments[0]) {
    keyRelationships.push(`${channels[0]} → ${segments[0]} (discovery path to audience)`);
  }
  if (revenue[0] && value[0]) {
    keyRelationships.push(`${value[0]} → ${revenue[0]} (value delivered as revenue)`);
  }

  const risks: string[] = [];
  if (channels.length > 0 && revenue.length === 0) {
    risks.push(
      "Revenue Streams™: Visibility channels exist without a clear revenue stream — validate how discovery converts to income.",
    );
  }
  if (filled < 5) {
    risks.push(
      "Several canvas sections are still empty — incomplete models hide blind spots.",
    );
  }
  if (costs.length === 0) {
    risks.push(
      "Cost Structure™: No costs listed yet — profitability stays invisible until this section is filled.",
    );
  }
  if (revenue.length === 1) {
    risks.push(
      "Revenue Streams™: Your revenue currently depends on only one primary source.",
    );
  }

  const opportunities: string[] = [];
  if (channels.length >= 2 && segments.length >= 1) {
    opportunities.push(
      `Channels™: ${channels.join(", ")} may reach the same audience (${segments[0]}) — a unified content system could connect them.`,
    );
  }
  if (segments.length >= 1 && segments[0]!.length < 40) {
    opportunities.push(
      "Customer Segments™: Audience definition appears narrow and may limit growth opportunities.",
    );
  }
  if (value.length > 0 && revenue.length === 0) {
    opportunities.push(
      `Strong value proposition ("${value[0]}") — define which offer format turns this into revenue.`,
    );
  }

  const recommendations: string[] = [];
  if (channels.length >= 2) {
    recommendations.push(
      "Create a unified content pipeline across your listed channels so messaging stays consistent.",
    );
  }
  if (filled >= 7) {
    recommendations.push(
      "Review empty sections — even one missing block can break how audience, offer, and revenue connect.",
    );
  } else {
    recommendations.push(
      "Fill the highest-impact sections next: Customer Segments™, Value Proposition™, and Revenue Streams™.",
    );
  }

  const boardObservations = [
    "Your canvas maps how value flows from activities and resources to customers and revenue.",
    filled >= 6
      ? "Enough sections are filled to discuss trade-offs — prioritize alignment between channels and revenue."
      : "Early-stage canvas — focus on clarity before scaling spend or partnerships.",
  ];

  const summary = purpose
    ? `Business Canvas™ for "${title}" (${purpose}) — ${filled} of 9 sections mapped.`
    : `Business Canvas™ for "${title}" — ${filled} of 9 sections mapped.`;

  const nextSteps: string[] = [];
  for (const id of BUSINESS_CANVAS_SECTION_ORDER) {
    if (data.sections[id].items.every((i) => !i.trim())) {
      nextSteps.push(`Add entries to ${BUSINESS_CANVAS_SECTION_GUIDANCE[id].title}`);
      if (nextSteps.length >= 2) break;
    }
  }
  if (nextSteps.length === 0) {
    nextSteps.push("Save this canvas in My Work™ and revisit after your next strategy session.");
  }

  return {
    summary,
    keyRelationships,
    patterns: [
      `${filled} sections filled in your ${BUSINESS_CANVAS_USER_LABEL}.`,
    ],
    risks,
    opportunities,
    recommendations,
    nextSteps,
    boardObservations,
    generatedAt: now,
  };
}
