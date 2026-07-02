/**
 * Momentum Institute Engine™ — runtime member state types.
 * Instances reference catalog definitions by id — never embed lesson content.
 */

import type { IntelligenceReadyHooks } from "@/lib/intelligence/intelligenceReadyTypes";
import type {
  GrowthCompetencyLevel,
  InstituteLifecycleStageId,
  LearningExperienceTypeId,
  MakeItMineIntent,
} from "@/lib/sparkMomentumInstitute/types";

/** Member's active or completed learning session */
export type MemberLearningExperience = IntelligenceReadyHooks & {
  kind: "institute-learning-experience";
  id: string;
  experienceDefinitionId: string;
  experienceType: LearningExperienceTypeId;
  knowledgeCardId: string;
  topicId: string;
  drawerId: string;
  departmentId: string;
  lifecycleStage: InstituteLifecycleStageId;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  /** Make It Mine™ outcome reference — coaching conversation id */
  makeItMineConversationId?: string;
  /** Cabinet reference if filed */
  cabinetReferenceId?: string;
  /** Journal entry reference if captured */
  journalEntryId?: string;
  /** Evidence entry reference — only after permission + real outcome */
  evidenceEntryId?: string;
  status: "in_progress" | "completed" | "returned" | "archived";
};

/** Make It Mine™ coaching session — Shari helps adapt lesson to member business */
export type MakeItMineSession = IntelligenceReadyHooks & {
  kind: "institute-make-it-mine";
  id: string;
  learningExperienceId: string;
  knowledgeCardId: string;
  intent: MakeItMineIntent;
  outcomeLabel: string;
  conversationId?: string;
  startedAt: string;
  completedAt?: string;
  status: "active" | "completed" | "abandoned";
};

/** My Institute Cabinet™ — reference only, never duplicates content */
export type InstituteCabinetItem = IntelligenceReadyHooks & {
  kind: "institute-cabinet-item";
  id: string;
  memberId?: string;
  knowledgeCardId: string;
  experienceDefinitionId?: string;
  learningExperienceId?: string;
  topicId: string;
  drawerId: string;
  departmentId: string;
  label: string;
  journalEntryId?: string;
  filedAt: string;
};

/** Quiet competency signal — auto-updated, no permission */
export type MemberCompetencyRecord = {
  competencyId: string;
  level: GrowthCompetencyLevel;
  lastDevelopedAt: string;
  sourceKnowledgeCardIds: string[];
  sourceExperienceIds: string[];
};

export type MemberSkillRecord = {
  skillId: string;
  label: string;
  developedAt: string;
  knowledgeCardId: string;
  experienceDefinitionId: string;
};

export type MemberLearningCompletion = {
  learningExperienceId: string;
  knowledgeCardId: string;
  experienceType: LearningExperienceTypeId;
  completedAt: string;
  drawerId: string;
  departmentId: string;
};

export type MemberLearningTimelineEntry = {
  id: string;
  at: string;
  event:
    | "started"
    | "completed"
    | "filed_cabinet"
    | "journaled"
    | "returned"
    | "evidence_saved"
    | "competency_updated";
  knowledgeCardId: string;
  experienceDefinitionId?: string;
  learningExperienceId?: string;
  label: string;
};

/** Growth Profile™ — automatic, member does not organize manually */
export type MemberGrowthProfile = IntelligenceReadyHooks & {
  kind: "institute-growth-profile";
  id: string;
  memberId?: string;
  competencies: MemberCompetencyRecord[];
  skillsDeveloped: MemberSkillRecord[];
  completedLearning: MemberLearningCompletion[];
  timeline: MemberLearningTimelineEntry[];
  updatedAt: string;
};

/**
 * Evidence opportunity — surfaced when member returns with real outcomes.
 * Never created automatically.
 */
export type EvidenceOpportunity = IntelligenceReadyHooks & {
  kind: "institute-evidence-opportunity";
  id: string;
  learningExperienceId: string;
  knowledgeCardId: string;
  experienceDefinitionId: string;
  /** Set only after member permission + real-world story */
  evidenceEntryId?: string;
  status: "pending_return" | "story_shared" | "permission_asked" | "saved" | "declined";
  createdAt: string;
  updatedAt: string;
};

/** Coaching conversation anchor for Institute experiences */
export type InstituteCoachingConversation = IntelligenceReadyHooks & {
  kind: "institute-coaching-conversation";
  id: string;
  learningExperienceId: string;
  knowledgeCardId: string;
  purpose: "make_it_mine" | "coach_with_shari" | "apply_in_business" | "return_story";
  conversationId?: string;
  startedAt: string;
  completedAt?: string;
};

export type InstituteMemberState = {
  growthProfile: MemberGrowthProfile;
  cabinetItems: InstituteCabinetItem[];
  activeExperiences: MemberLearningExperience[];
  evidenceOpportunities: EvidenceOpportunity[];
};
