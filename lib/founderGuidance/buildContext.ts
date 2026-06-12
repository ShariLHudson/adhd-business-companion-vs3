import type { FounderWorkspaceItem } from "@/lib/founderWorkspace";
import { kindLabel, statusLabel } from "@/lib/founderWorkspace";

import type {
  FounderGuidanceRequest,
  FounderGuidanceWorkspaceSnapshot,
} from "./types";

const ISSUE_PATTERN =
  /\b(issue|bug|fix|broken|error|urgent|blocker|crash|regression)\b/i;

function formatItem(item: FounderWorkspaceItem): string {
  const issue = ISSUE_PATTERN.test(`${item.title} ${item.description}`)
    ? " [likely-issue]"
    : "";
  const desc = item.description
    ? item.description.slice(0, 280).replace(/\s+/g, " ")
    : "(no description)";
  return `- [${item.id}] ${kindLabel(item.kind)} | ${statusLabel(item.status)}${issue} | "${item.title}" — ${desc}`;
}

function listSection(label: string, items: FounderWorkspaceItem[]): string {
  if (items.length === 0) return `${label}: (none)`;
  return `${label} (${items.length}):\n${items.map(formatItem).join("\n")}`;
}

export function detectLikelyIssues(
  workspace: FounderGuidanceWorkspaceSnapshot,
): FounderWorkspaceItem[] {
  const all = [
    ...workspace.projects,
    ...workspace.experiments,
    ...workspace.notes,
  ];
  return all.filter((item) =>
    ISSUE_PATTERN.test(`${item.title} ${item.description}`),
  );
}

export function buildFounderGuidanceContext(
  input: Pick<
    FounderGuidanceRequest,
    | "workspace"
    | "activeTab"
    | "selectedItem"
    | "intelligenceSummary"
    | "trackingSummary"
    | "briefingSummary"
    | "productIntelligenceSummary"
    | "businessHealthSummary"
    | "analyticsSummary"
    | "experimentMetricsSummary"
    | "dashboardSummary"
  >,
): string {
  const {
    workspace,
    activeTab,
    selectedItem,
    intelligenceSummary,
    trackingSummary,
    briefingSummary,
    productIntelligenceSummary,
    businessHealthSummary,
    analyticsSummary,
    experimentMetricsSummary,
    dashboardSummary,
  } = input;
  const issues = detectLikelyIssues(workspace);
  const openProjects = workspace.projects.filter((p) => p.status !== "done");
  const openExperiments = workspace.experiments.filter(
    (e) => e.status !== "done",
  );
  const openNotes = workspace.notes.filter((n) => n.status !== "done");

  const lines: string[] = [];

  if (dashboardSummary?.trim()) {
    lines.push(dashboardSummary.trim(), "");
  } else if (briefingSummary?.trim()) {
    lines.push(briefingSummary.trim(), "");
  }

  if (productIntelligenceSummary?.trim()) {
    lines.push(productIntelligenceSummary.trim(), "");
  }

  if (businessHealthSummary?.trim()) {
    lines.push(businessHealthSummary.trim(), "");
  }

  if (analyticsSummary?.trim()) {
    lines.push(analyticsSummary.trim(), "");
  }

  if (experimentMetricsSummary?.trim()) {
    lines.push(experimentMetricsSummary.trim(), "");
  }

  lines.push(
    "FOUNDER WORKSPACE SNAPSHOT (private — use only this data):",
    "",
    listSection("Projects", workspace.projects),
    "",
    listSection("Experiments", workspace.experiments),
    "",
    listSection("Notes", workspace.notes),
    "",
    `Active tab: ${activeTab}`,
    `Open (not done): ${openProjects.length} projects, ${openExperiments.length} experiments, ${openNotes.length} notes`,
    "",
    listSection(
      "Likely issues (keyword match)",
      issues.length ? issues : [],
    ),
    "",
    "Integrations available in this workspace:",
    "- Export → Google Docs (OAuth)",
    "- Export → PDF download",
    "- Supabase sync for workspace items (founder-only)",
    "",
  );

  if (intelligenceSummary?.trim()) {
    lines.push(intelligenceSummary.trim(), "");
  }

  if (trackingSummary?.trim()) {
    lines.push(trackingSummary.trim(), "");
  }

  if (selectedItem) {
    lines.push(
      "SELECTED / FOCUSED ITEM:",
      formatItem(selectedItem),
      "",
    );
  }

  return lines.join("\n");
}
