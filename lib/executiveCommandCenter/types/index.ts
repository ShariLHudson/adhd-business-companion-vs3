/** Executive Command Center — Visual Spark Studios Executive Headquarters */

export type ExecutivePanelId = "today" | "discover" | "decide" | "build" | "run" | "learn";

export type ExecutiveLevel = "low" | "moderate" | "elevated" | "high";

export type ExecutiveMomentum = "restoring" | "building" | "accelerating" | "launching";

export type AssistantPrepKind =
  | "research"
  | "document"
  | "builder-packet"
  | "cursor-prompt"
  | "postcraft-campaign"
  | "meeting-agenda"
  | "decision-comparison"
  | "review-brief"
  | "executive-brief";

export type ExecutiveAssistantItem = {
  id: string;
  kind: AssistantPrepKind;
  title: string;
  summary: string;
  status: "draft";
  sourceEngine: string;
};

export type ExecutiveStatusBar = {
  currentMission: string;
  currentFocus: string;
  currentEnergy: string;
  currentMomentum: ExecutiveMomentum;
  currentRiskLevel: ExecutiveLevel;
  currentOpportunityLevel: ExecutiveLevel;
};

export type ExecutiveSixQuestions = {
  whatMattersToday: string;
  whyItMatters: string;
  whatWeRecommend: string;
  opportunitiesToKnow: string;
  decisionsWaiting: string;
  whatToDoNext: string;
};

export type ExecutivePanelItem = {
  id: string;
  label: string;
  detail: string;
  roomHref?: string;
};

export type ExecutivePanelSummary = {
  id: ExecutivePanelId;
  title: string;
  mission: string;
  teaser: string;
  itemCount: number;
  primaryRoomHref: string;
  items: ExecutivePanelItem[];
};

export type ExecutiveCommandCenterBootstrap = {
  principle: string;
  headquartersMessage: string;
  overnightMessage: string;
  assistantQueueCount: number;
  panelCount: 6;
  intelligenceSources: string[];
};

export type ExecutiveCommandCenterView = {
  product: "founder";
  generatedAt: string;
  principle: string;
  headquartersMessage: string;
  overnightMessage: string;
  companionVoice: string;
  status: ExecutiveStatusBar;
  sixQuestions: ExecutiveSixQuestions;
  primaryMission: string;
  primaryRecommendation: string;
  primaryRecommendationSummary: string;
  todaysGoal: string;
  estimatedProgress: number;
  nextAction: string;
  assistantQueue: ExecutiveAssistantItem[];
  panels: ExecutivePanelSummary[];
};

export type ExecutivePanelDetailView = {
  product: "founder";
  panel: ExecutivePanelSummary;
  generatedAt: string;
};
