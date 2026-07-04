/**
 * Discovery preparation hints — quiet work before navigation.
 */

import type { DiscoverySession } from "./discoveryTypes";
import { adaptivePreparationExtras } from "./adaptiveIntelligence";

export function preparationLineForSession(session: DiscoverySession): string {
  const base = basePreparationLine(session);
  const adaptive = adaptivePreparationExtras(session.topic);
  if (!adaptive) return base;
  if (!base) return adaptive;
  return `${base} ${adaptive}`;
}

function basePreparationLine(session: DiscoverySession): string {
  switch (session.topic) {
    case "create_sop":
      return sopPreparationLine(session);
    case "focus":
      return "I'll have the right space ready when you choose.";
    case "business_growth":
      return "I'll pull together what we need based on what you told me.";
    case "research":
      return "I'll gather what's current and have Study Hall ready.";
    default:
      return "";
  }
}

function sopPreparationLine(session: DiscoverySession): string {
  const audience = session.answers["sop-audience-type"] ?? "";
  const size = session.answers["sop-audience-size"] ?? "";
  const start = session.answers["sop-starting-point"] ?? "";

  const parts: string[] = [];
  if (/client/i.test(audience)) {
    parts.push("I'll set this up for client delivery");
  }
  if (/va|team|multiple|staff/i.test(size)) {
    parts.push("include a printable checklist");
    parts.push("leave placeholders for screenshots");
  }
  if (/scratch|fresh/i.test(start)) {
    parts.push("start from a clean SOP template");
  } else if (/already|written|existing/i.test(start)) {
    parts.push("leave room to paste what you already have");
  }

  if (parts.length === 0) {
    return "I'll open the SOP builder with a template and checklist ready.";
  }
  return `I'll open the SOP builder — ${parts.join(", ")}.`;
}

export function discoveryExpertHint(session: DiscoverySession): string {
  if (session.topic === "create_sop") {
    return "Instructional Designer + Copywriter (invisible).";
  }
  if (session.topic === "research") {
    return "Research Analyst (invisible).";
  }
  if (session.topic === "business_growth") {
    return "Business Strategist + Marketing Expert (invisible).";
  }
  return "";
}
