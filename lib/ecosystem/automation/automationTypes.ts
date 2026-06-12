// Founder Ecosystem — Phase 14 Business OS Automation types.
//
// The ecosystem can now orchestrate work across tools: understand what needs to
// happen, which tool is involved, what can be automated, and what needs founder
// approval. CORE PRINCIPLE: never automate without permission. Observational /
// operational only — never medical, legal, or financial advice.

import type { ID, ISODateString } from "../models";

// ---- Tool taxonomy ------------------------------------------------------
export type ToolCategory =
  | "communications"
  | "documents"
  | "marketing"
  | "projects"
  | "calendar"
  | "research"
  | "ai-partners";

export type Tool =
  // communications
  | "gmail"
  | "outlook"
  | "ghl-conversations"
  // documents
  | "google-docs"
  | "google-sheets"
  | "google-forms"
  | "pdf-export"
  | "create" // internal Create workspace
  // marketing
  | "ghl"
  | "canva"
  | "social-scheduler"
  // projects
  | "internal-projects"
  | "odoo-projects"
  | "task-system"
  // calendar
  | "google-calendar"
  | "ghl-calendar"
  | "time-block" // internal
  // research
  | "web-research"
  | "knowledge-source"
  // ai partners
  | "claude"
  | "chatgpt";

// ---- Action taxonomy ----------------------------------------------------
export type AutomationActionType =
  // high-trust (may auto-execute)
  | "open-workspace"
  | "load-project"
  | "create-draft"
  | "draft-email"
  | "research-topic"
  | "create-google-doc"
  | "update-google-doc"
  | "create-google-sheet"
  | "update-google-sheet"
  | "create-google-form"
  | "open-existing-file"
  | "link-file-to-project"
  | "create-internal-task"
  | "generate-prompt"
  | "open-claude-session"
  | "send-context-package"
  // approval-required
  | "send-email"
  | "modify-calendar"
  | "schedule-appointment"
  | "create-external-record" // GHL contact / opportunity
  | "move-opportunity"
  | "create-ghl-task"
  | "create-workflow"
  | "trigger-workflow"
  | "publish-content";

export type TrustLevel = "high" | "approval-required";

export type AutomationStatus =
  | "suggested"
  | "pending-approval"
  | "approved"
  | "running"
  | "completed"
  | "failed"
  | "dismissed";

export type AutomationOutcome = {
  ok: boolean;
  message: string;
  timeSavedMinutes?: number;
  externalRef?: string; // e.g. created doc/contact id
};

export type AutomationAction = {
  id: ID;
  title: string;
  description: string;
  emoji: string;
  tool: Tool;
  toolCategory: ToolCategory;
  actionType: AutomationActionType;
  approvalRequired: boolean;
  status: AutomationStatus;
  /** What the founder can do with the action card. */
  buttons: AutomationButton[];
  /** Opens a panel beside chat (vs. acting in the background). */
  opensBesideChat: boolean;
  project?: { id: ID; title?: string };
  document?: { id: ID; title?: string };
  contextPackageId?: ID;
  dataNeeded: string[];
  createdAt: ISODateString;
  completedAt?: ISODateString;
  outcome?: AutomationOutcome;
};

export type AutomationButton = "open" | "approve" | "later" | "dismiss";

// ---- Router result ------------------------------------------------------
export type AutomationRoute = {
  toolCategory: ToolCategory;
  tool: Tool;
  actionType: AutomationActionType;
  title: string;
  description: string;
  emoji: string;
  approvalRequired: boolean;
  dataNeeded: string[];
  opensBesideChat: boolean;
  confidence: "low" | "medium" | "high";
};

// ---- Context package ----------------------------------------------------
export type ContextPackage = {
  id: ID;
  founderId: ID;
  createdAt: ISODateString;
  projectContext?: {
    id: ID;
    name: string;
    purpose: string | null;
    nextStep: string | null;
    openTasks: string[];
    documents: { id: ID; title: string }[];
  };
  documentContext?: { id: ID; title: string };
  founderContext: {
    stage?: string;
    primaryFocus?: string | null;
    topGoals: string[];
  };
  relevantDecisions: { id: ID; text: string }[];
  relevantGoals: string[];
  /** Flattened text suitable to hand to an external AI tool. */
  summaryText: string;
};

// ---- History ------------------------------------------------------------
export type AutomationHistoryRecord = {
  actionId: ID;
  title: string;
  tool: Tool;
  actionType: AutomationActionType;
  ts: ISODateString;
  ok: boolean;
  timeSavedMinutes: number;
};

export type AutomationHistoryStats = {
  total: number;
  succeeded: number;
  failed: number;
  totalTimeSavedMinutes: number;
  byTool: { tool: Tool; count: number; timeSaved: number }[];
};

// ---- Connected apps -----------------------------------------------------
export type ConnectedAppId =
  | "google"
  | "ghl"
  | "claude"
  | "canva"
  | "odoo"
  | "calendar"
  | "email";

export type AppStatus = "connected" | "disconnected" | "needs-attention";

export type ConnectedApp = {
  app: ConnectedAppId;
  label: string;
  status: AppStatus;
  category: ToolCategory[];
  lastCheckedAt?: ISODateString;
  note?: string;
};
