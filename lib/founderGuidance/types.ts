import type {
  FounderWorkspaceItem,
  FounderWorkspaceItemKind,
  FounderWorkspaceItemStatus,
  FounderWorkspaceSection,
} from "@/lib/founderWorkspace";

export type FounderGuidanceActionType =
  | "add_project"
  | "add_experiment"
  | "add_note"
  | "add_issue"
  | "add_tracked_experiment"
  | "issue_to_experiment"
  | "mark_done"
  | "park"
  | "export_google_doc"
  | "copy_summary"
  | "copy_cursor_prompt"
  | "start_working"
  | "research_this"
  | "needs_research";

export type FounderGuidanceActionPayload = {
  itemId?: string;
  issueId?: string;
  kind?: FounderWorkspaceItemKind;
  title?: string;
  description?: string;
  status?: FounderWorkspaceItemStatus;
  summary?: string;
  severity?: string;
  hypothesis?: string;
  testPlan?: string;
  expectedOutcome?: string;
  currentBehavior?: string;
  expectedBehavior?: string;
  likelyFiles?: string;
  promptKind?: "bug_fix" | "feature" | "experiment" | "retest";
  projectId?: string;
  experimentId?: string;
  prompt?: string;
  navigateTo?: "issue" | "dev_experiment" | "project" | "note" | "retest";
  issueFilter?: "retest";
  researchTopic?: string;
  researchContext?: string;
};

export type FounderGuidanceSuggestedAction = {
  type: FounderGuidanceActionType;
  label: string;
  payload?: FounderGuidanceActionPayload;
};

export type FounderGuidanceHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export type FounderGuidanceWorkspaceSnapshot = {
  projects: FounderWorkspaceItem[];
  experiments: FounderWorkspaceItem[];
  notes: FounderWorkspaceItem[];
};

export type FounderGuidanceRequest = {
  message: string;
  history?: FounderGuidanceHistoryMessage[];
  workspace: FounderGuidanceWorkspaceSnapshot;
  activeTab: string;
  selectedItem?: FounderWorkspaceItem | null;
  intelligenceSummary?: string;
  trackingSummary?: string;
  briefingSummary?: string;
  productIntelligenceSummary?: string;
  businessHealthSummary?: string;
  analyticsSummary?: string;
  experimentMetricsSummary?: string;
  dashboardSummary?: string;
};

export type FounderGuidanceResponse = {
  message: string;
  suggestedAction?: FounderGuidanceSuggestedAction | null;
};
