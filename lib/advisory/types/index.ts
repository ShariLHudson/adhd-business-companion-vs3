/** Founder Advisory Council — executive board reasoning types (no UI). */

export type AdvisoryMemberId =
  | "ceo"
  | "visionary"
  | "strategist"
  | "product-manager"
  | "marketing-director"
  | "sales-director"
  | "customer-experience"
  | "adhd-expert"
  | "behavioral-psychology"
  | "learning-designer"
  | "technology-advisor"
  | "ai-advisor"
  | "operations"
  | "finance"
  | "community-builder"
  | "creative-director"
  | "research-analyst"
  | "accessibility-expert";

export type AdvisoryDiscussionTopicId =
  | "listening-rooms"
  | "founder-daily-workflow"
  | "voice-companion"
  | "decision-fatigue-workshop"
  | "executive-brief"
  | "micro-learning"
  | "pinterest-strategy"
  | "automation-studio";

export type AdvisoryConfidenceLevel = "high" | "medium" | "low" | "exploratory";

export type AdvisoryLinkKind =
  | "mission"
  | "research"
  | "decision-vault"
  | "executive-question"
  | "opportunity"
  | "roadmap"
  | "product"
  | "content"
  | "workshop"
  | "campaign";

export type AdvisoryEvidenceRef = {
  id: string;
  kind: AdvisoryLinkKind | "spark" | "analytics" | "customer-feedback";
  refId: string;
  label: string;
  summary?: string;
};

export type AdvisoryConfidence = {
  level: AdvisoryConfidenceLevel;
  /** 0–100 */
  score: number;
  rationale: string;
};

export type AdvisoryMember = {
  id: AdvisoryMemberId;
  name: string;
  role: string;
  expertise: string[];
  decisionStyle: string;
  primaryConcerns: string[];
  strengths: string[];
  typicalQuestions: string[];
  sampleRecommendations: string[];
};

export type AdvisoryPerspective = {
  id: string;
  topicId: AdvisoryDiscussionTopicId;
  memberId: AdvisoryMemberId;
  memberName: string;
  memberRole: string;
  opportunities: string[];
  concerns: string[];
  questions: string[];
  recommendations: string[];
  unknowns: string[];
  suggestedNextStep: string;
  evidenceRefs: AdvisoryEvidenceRef[];
  confidence: AdvisoryConfidence;
};

export type BoardConsensus = {
  agreement: string[];
  disagreement: string[];
  openQuestions: string[];
  needsResearch: string[];
  needsFounderDecision: string[];
};

export type AdvisoryLink = {
  id: string;
  kind: AdvisoryLinkKind;
  refId: string;
  label: string;
  summary: string;
};

export type AdvisoryRelationship = {
  id: string;
  topicId: AdvisoryDiscussionTopicId;
  link: AdvisoryLink;
};

export type BoardDiscussion = {
  id: string;
  topicId: AdvisoryDiscussionTopicId;
  title: string;
  question: string;
  summary: string;
  perspectives: AdvisoryPerspective[];
  consensus: BoardConsensus;
  links: AdvisoryLink[];
  missionIds: string[];
  updatedAt: string;
};

export type ComposedBoardDiscussion = BoardDiscussion & {
  memberCount: number;
  perspectiveCount: number;
};

export type AdvisoryCouncilFilter = {
  topicId?: AdvisoryDiscussionTopicId;
  memberId?: AdvisoryMemberId;
  missionId?: string;
};
