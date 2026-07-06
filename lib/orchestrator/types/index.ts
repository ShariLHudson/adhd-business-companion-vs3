/** Executive Orchestrator™ — from decision to prepared execution. */

export type OrchestratorStep =
  | "discover"
  | "understand"
  | "options"
  | "decision"
  | "plan"
  | "prepare"
  | "approve"
  | "orchestrate"
  | "monitor"
  | "adapt"
  | "learn"
  | "remember";

export type ExecutiveStatus =
  | "draft"
  | "planned"
  | "awaiting_approval"
  | "approved"
  | "orchestrating"
  | "in_progress"
  | "blocked"
  | "at_risk"
  | "waiting_on"
  | "needs_review"
  | "needs_founder_decision"
  | "completed";

export type DelegationMode =
  | "manual"
  | "delegate"
  | "prepare"
  | "semi_automate"
  | "fully_automate"
  | "future_automation";

export type AssigneeKind =
  | "founder"
  | "izna"
  | "team"
  | "founder_product"
  | "postcraft"
  | "ghl"
  | "cursor"
  | "companion"
  | "future_ai"
  | "future_automation";

export type InitiativeCategory =
  | "mission"
  | "product"
  | "launch"
  | "workshop"
  | "course"
  | "marketing"
  | "automation"
  | "executive"
  | "content"
  | "strategy";

export type ExecutiveROI = {
  founderTimeRequiredHours: number;
  founderTimeSavedHours: number;
  teamTimeRequiredHours: number;
  estimatedRevenue: string;
  customerValue: string;
  strategicValue: number;
  risk: "low" | "medium" | "high";
  confidence: number;
  difficulty: number;
  longTermBenefit: string;
};

export type ExecutiveRisk = {
  id: string;
  label: string;
  likelihood: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  mitigation: string;
};

export type ExecutiveBlocker = {
  id: string;
  label: string;
  waitingOn: string;
  status: "open" | "resolved";
  notes: string;
};

export type ExecutiveDependency = {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  kind: "blocks" | "requires" | "informs";
  reason: string;
};

export type ExecutiveAutomationCandidate = {
  id: string;
  taskId: string;
  label: string;
  mode: DelegationMode;
  canAutomate: boolean;
  canDelegate: boolean;
  mustShariDo: boolean;
  iznaCandidate: boolean;
  founderCanPrepare: boolean;
  sparkProduct?: AssigneeKind;
  rationale: string;
};

export type ExecutiveAssignment = {
  id: string;
  taskId: string;
  assigneeKind: AssigneeKind;
  assigneeLabel: string;
  mode: DelegationMode;
  status: "draft" | "proposed" | "accepted" | "complete";
  notes: string;
};

export type ExecutiveTask = {
  id: string;
  title: string;
  summary: string;
  phaseId: string;
  status: ExecutiveStatus;
  estimatedHours: number;
  assigneeKind: AssigneeKind;
  delegationMode: DelegationMode;
  requiresFounderApproval: boolean;
  checklistItemIds: string[];
};

export type ExecutiveMilestone = {
  id: string;
  label: string;
  dueAt?: string;
  status: ExecutiveStatus;
  taskIds: string[];
};

export type ExecutivePhase = {
  id: string;
  name: string;
  summary: string;
  order: number;
  taskIds: string[];
  milestoneIds: string[];
};

export type ExecutiveChecklist = {
  id: string;
  initiativeId: string;
  title: string;
  items: { id: string; label: string; completed: boolean; requiresApproval: boolean }[];
};

export type ExecutiveApproval = {
  id: string;
  label: string;
  status: "pending" | "approved" | "declined" | "deferred";
  requiresExplicitApproval: boolean;
  blockedActions: string[];
  notes: string;
};

export type ExecutiveProgress = {
  initiativeId: string;
  percentComplete: number;
  tasksTotal: number;
  tasksComplete: number;
  blockedCount: number;
  atRiskCount: number;
  waitingOn: string[];
  updatedAt: string;
};

export type ExecutiveMonitoring = {
  initiativeId: string;
  status: ExecutiveStatus;
  progress: ExecutiveProgress;
  blockers: ExecutiveBlocker[];
  risks: ExecutiveRisk[];
  needsFounderDecision: boolean;
  briefFeedItems: string[];
};

export type ExecutiveOutcome = {
  initiativeId: string;
  succeeded: boolean | "partial";
  summary: string;
  surprises: string[];
  lessons: string[];
  recordedAt: string;
};

export type ExecutiveReview = {
  initiativeId: string;
  worked: boolean | "partial";
  surprised: string[];
  wouldRepeat: boolean | "partial";
  adaptNextTime: string[];
  narrative: string[];
  reviewedAt: string;
};

export type ImplementationPlans = {
  developmentPlan: string[];
  researchPlan: string[];
  contentPlan: string[];
  marketingPlan: string[];
  launchPlan: string[];
  trainingPlan: string[];
  teamPlan: string[];
  automationPlan: string[];
  measurementPlan: string[];
  reviewPlan: string[];
};

export type ExecutivePlan = {
  initiativeId: string;
  phases: ExecutivePhase[];
  milestones: ExecutiveMilestone[];
  tasks: ExecutiveTask[];
  dependencies: ExecutiveDependency[];
  plans: ImplementationPlans;
  status: "draft";
};

export type FounderPromise = {
  whatHappened: string;
  whyItMatters: string;
  options: string[];
  recommendation: string;
  whatFounderWillPrepare: string[];
  requiresApproval: string[];
  howWeMeasureSuccess: string[];
  whatHappensNext: string[];
};

export type ExecutiveInitiative = {
  id: string;
  title: string;
  category: InitiativeCategory;
  missionId?: string;
  productId?: string;
  decisionId?: string;
  goal: string;
  purpose: string;
  businessValue: string;
  expectedOutcome: string;
  priority: "critical" | "high" | "medium" | "low";
  strategicImportance: number;
  estimatedTime: string;
  estimatedEffort: string;
  estimatedRevenue: string;
  estimatedCustomerImpact: string;
  estimatedTimeSaved: string;
  estimatedAutomationPotential: number;
  estimatedConfidence: number;
  currentStep: OrchestratorStep;
  completedSteps: OrchestratorStep[];
  status: ExecutiveStatus;
  plan?: ExecutivePlan;
  checklist?: ExecutiveChecklist;
  assignments: ExecutiveAssignment[];
  automationCandidates: ExecutiveAutomationCandidate[];
  approvals: ExecutiveApproval[];
  monitoring?: ExecutiveMonitoring;
  roi?: ExecutiveROI;
  outcome?: ExecutiveOutcome;
  review?: ExecutiveReview;
  founderPromise?: FounderPromise;
  graphNodeIds: string[];
  institutionalMemoryId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateInitiativeInput = {
  title: string;
  category: InitiativeCategory;
  missionId?: string;
  productId?: string;
  decisionId?: string;
  goal: string;
  purpose: string;
  businessValue: string;
  expectedOutcome: string;
  priority?: ExecutiveInitiative["priority"];
  strategicImportance?: number;
  estimatedTime?: string;
  estimatedEffort?: string;
  estimatedRevenue?: string;
  estimatedCustomerImpact?: string;
  estimatedTimeSaved?: string;
  estimatedAutomationPotential?: number;
  estimatedConfidence?: number;
  graphNodeIds?: string[];
};
