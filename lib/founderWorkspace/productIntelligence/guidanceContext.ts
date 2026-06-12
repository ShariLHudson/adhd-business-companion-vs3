import type { ProductIntelligenceReport } from "./types";
import { PRODUCT_CATEGORY_LABELS } from "./types";

export function formatProductIntelligenceForGuidance(
  report: ProductIntelligenceReport,
): string {
  const lines = [
    "PRODUCT INTELLIGENCE (founder-only — patterns from user activity signals):",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "TOP FRUSTRATIONS:",
  ];

  if (report.topFrustrations.length === 0) {
    lines.push("(none yet — log friction via pain points and coaching chat)");
  } else {
    for (const [i, issue] of report.topFrustrations.slice(0, 10).entries()) {
      lines.push(
        `${i + 1}. ${issue.text} — ${issue.priority} priority (×${issue.count}, ${PRODUCT_CATEGORY_LABELS[issue.category]})`,
      );
    }
  }

  lines.push("", "MOST REQUESTED FEATURES:");
  if (report.mostRequestedFeatures.length === 0) {
    lines.push("(none detected yet)");
  } else {
    for (const [i, req] of report.mostRequestedFeatures.slice(0, 8).entries()) {
      lines.push(`${i + 1}. ${req.text} (×${req.count})`);
    }
  }

  lines.push("", "MOST LOVED FEATURES:");
  if (report.mostLovedFeatures.length === 0) {
    lines.push("(no success signals yet)");
  } else {
    for (const loved of report.mostLovedFeatures.slice(0, 6)) {
      lines.push(`- ${loved.feature}: ${loved.evidence}`);
    }
  }

  lines.push("", "QUICK WINS:");
  if (report.quickWins.length === 0) {
    lines.push("(none identified yet)");
  } else {
    for (const win of report.quickWins) {
      lines.push(`- ${win.title}: ${win.rationale}`);
    }
  }

  lines.push("", "OPPORTUNITIES:");
  if (report.opportunities.length === 0) {
    lines.push("(none yet)");
  } else {
    for (const opp of report.opportunities.slice(0, 5)) {
      lines.push(`- ${opp.title} (${opp.potentialImpact} impact)`);
      lines.push(`  ${opp.hypothesis}`);
    }
  }

  lines.push("", "WEEKLY PRODUCT REVIEW:");
  lines.push(report.weeklyReview.summary);
  for (const action of report.weeklyReview.recommendedActions) {
    lines.push(`- Next: ${action}`);
  }

  if (report.leastUsedFeatures.length) {
    lines.push("", "LEAST USED WORKSPACES:");
    for (const f of report.leastUsedFeatures) {
      lines.push(`- ${f.feature}: ${f.opens} opens`);
    }
  }

  return lines.join("\n");
}
