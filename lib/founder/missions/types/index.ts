/** Mission Workspace — reusable mission types (no UI). */

export type MissionId =
  | "listening-rooms"
  | "founder-studio"
  | "companion"
  | "postcraft"
  | "workshop-series"
  | "estate"
  | "marketing-launch";

export type MissionStatus = "active" | "paused" | "complete" | "planned";

export type MissionPriority = "critical" | "high" | "medium" | "low";

export type MissionPhase =
  | "Discover"
  | "Define"
  | "Build"
  | "Launch"
  | "Grow"
  | "Review";

export type MissionRelationshipKind =
  | "supports"
  | "connects_to"
  | "creates_content_for"
  | "launches_through"
  | "depends_on"
  | "informs";

export type Mission = {
  id: MissionId;
  name: string;
  purpose: string;
  status: MissionStatus;
  phase: MissionPhase;
  priority: MissionPriority;
  /** 0–100 */
  strategicValue: number;
  /** 0–100 */
  progress: number;
  estimatedImpact: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type MissionGoal = {
  id: string;
  missionId: MissionId;
  title: string;
  summary: string;
};

export type MissionMilestone = {
  id: string;
  missionId: MissionId;
  title: string;
  summary: string;
  completed: boolean;
  dueLabel?: string;
};

export type MissionDecision = {
  id: string;
  missionId: MissionId;
  title: string;
  summary: string;
  href?: string;
  status: "pending" | "decided" | "revisit";
};

export type MissionResearch = {
  id: string;
  missionId: MissionId;
  title: string;
  summary: string;
  source?: string;
};

export type MissionContent = {
  id: string;
  missionId: MissionId;
  title: string;
  summary: string;
  format?: string;
};

export type MissionMarketing = {
  id: string;
  missionId: MissionId;
  title: string;
  summary: string;
  channel?: string;
};

export type MissionAnalytics = {
  id: string;
  missionId: MissionId;
  title: string;
  summary: string;
};

export type MissionTeam = {
  id: string;
  missionId: MissionId;
  title: string;
  summary: string;
  assignee?: string;
};

export type MissionAutomation = {
  id: string;
  missionId: MissionId;
  title: string;
  summary: string;
  status: "draft" | "active" | "paused";
};

export type MissionOpportunity = {
  id: string;
  missionId: MissionId;
  title: string;
  summary: string;
};

export type MissionRisk = {
  id: string;
  missionId: MissionId;
  title: string;
  summary: string;
  severity: "low" | "medium" | "high";
};

export type MissionNextAction = {
  id: string;
  missionId: MissionId;
  title: string;
  summary: string;
  href?: string;
  hrefLabel?: string;
  kind:
    | "build"
    | "research"
    | "decision"
    | "content"
    | "strategy"
    | "team"
    | "marketing";
};

export type MissionTimelineEventKind =
  | "idea"
  | "research"
  | "decision"
  | "milestone"
  | "marketing"
  | "launch"
  | "update";

export type MissionTimelineEvent = {
  id: string;
  missionId: MissionId;
  kind: MissionTimelineEventKind;
  title: string;
  summary: string;
  occurredAt: string;
};

export type MissionRelationship = {
  id: string;
  fromMissionId: MissionId;
  toMissionId: MissionId;
  relationship: MissionRelationshipKind;
  summary: string;
};

export type MissionKnowledgeGroup = {
  id: string;
  title: string;
  items: { id: string; title: string; summary: string }[];
};

export type MissionAction = {
  id: string;
  label: string;
  summary?: string;
  href?: string;
};

export type MissionOverview = {
  missionId: MissionId;
  headline: string;
  currentRecommendation: string;
  primaryAction: MissionNextAction;
  priorityLabel: string;
  phase: MissionPhase;
  strategicValue: number;
  estimatedImpact: string;
  progress: number;
};

export type MissionProgress = {
  missionId: MissionId;
  overall: number;
  milestonesCompleted: number;
  milestonesTotal: number;
  phase: MissionPhase;
  nextMilestone?: string;
};

export type ComposedMission = {
  mission: Mission;
  overview: MissionOverview;
  progress: MissionProgress;
  goals: MissionGoal[];
  milestones: MissionMilestone[];
  decisions: MissionDecision[];
  research: MissionResearch[];
  content: MissionContent[];
  marketing: MissionMarketing[];
  analytics: MissionAnalytics[];
  team: MissionTeam[];
  automation: MissionAutomation[];
  opportunities: MissionOpportunity[];
  risks: MissionRisk[];
  timeline: MissionTimelineEvent[];
  knowledge: MissionKnowledgeGroup[];
  actions: MissionAction[];
  relationships: MissionRelationship[];
};
