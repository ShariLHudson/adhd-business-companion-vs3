/**
 * Estate Journey Engine™ — central journey state for the Spark Estate™.
 *
 * One continuous journey: rooms, work, learning, sessions, and return context.
 */

import type { AppSection } from "@/lib/companionUi";
import type { EstateEmotionalLabel } from "@/lib/estateMemory/types";

export const ESTATE_JOURNEY_ENGINE_VERSION = 1 as const;

export type EstatePausedWorkKind =
  | "artifact"
  | "sales-funnel"
  | "newsletter"
  | "workshop"
  | "decision"
  | "lesson"
  | "challenge"
  | "simulation"
  | "research"
  | "other";

export type EstatePausedWork = {
  id: string;
  kind: EstatePausedWorkKind;
  label: string;
  entryId?: string;
  section?: AppSection;
  artifactId?: string;
  pausedAt: string;
  reason?: string;
  resumeHint?: string;
};

export type EstateLearningRecordKind =
  | "knowledge-card"
  | "lesson"
  | "apprenticeship"
  | "business-lab"
  | "challenge"
  | "simulation"
  | "make-it-mine"
  | "reflection";

export type EstateLearningRecord = {
  id: string;
  kind: EstateLearningRecordKind;
  label: string;
  topic?: string;
  status: "started" | "completed" | "attempted";
  at: string;
  refId?: string;
};

export type EstateRoomHistoryEntry = {
  entryId: string;
  roomName: string;
  enteredAt: string;
};

export type EstateJourneySession = {
  id: string;
  startedAt: string;
  endedAt?: string;
  conversationId: string;
  roomIdsVisited: string[];
  learningCompleted: string[];
  projectsAdvanced: string[];
  challengesCompleted: string[];
  ideasCaptured: string[];
};

export type EstateProfileConnectionKind =
  | "growth-profile"
  | "institute-cabinet"
  | "portfolio"
  | "journal"
  | "evidence-vault"
  | "goals"
  | "seeds-planted";

export type EstateProfileTouch = {
  kind: EstateProfileConnectionKind;
  refId?: string;
  label?: string;
  at: string;
};

export type EstateTopicStudy = {
  topic: string;
  firstSeenAt: string;
  lastSeenAt: string;
  completions: number;
};

export type EstateJourneyEngineState = {
  version: typeof ESTATE_JOURNEY_ENGINE_VERSION;
  roomHistory: EstateRoomHistoryEntry[];
  currentConversationId: string;
  currentArtifactId: string | null;
  pausedWork: EstatePausedWork[];
  learning: EstateLearningRecord[];
  currentLesson?: string;
  currentApprenticeship?: string;
  currentChallenge?: string;
  currentSimulation?: string;
  currentBusinessLab?: string;
  currentGoal?: string;
  currentFocus?: string;
  currentMood?: EstateEmotionalLabel;
  currentEnergy?: "low" | "medium" | "high";
  sessions: EstateJourneySession[];
  activeSessionId: string;
  profileTouches: EstateProfileTouch[];
  topicStudy: EstateTopicStudy[];
  newDayCount: number;
};

export type RecordJourneyRoomTransitionInput = {
  toEntryId: string;
  toRoomName: string;
  fromEntryId?: string;
  fromSection?: AppSection;
  reason: string;
  userText?: string;
};

export type RecordJourneyLearningInput = {
  kind: EstateLearningRecordKind;
  label: string;
  topic?: string;
  status: EstateLearningRecord["status"];
  refId?: string;
};

export type PauseJourneyWorkInput = {
  kind: EstatePausedWorkKind;
  label: string;
  entryId?: string;
  section?: AppSection;
  artifactId?: string;
  reason?: string;
  resumeHint?: string;
};
