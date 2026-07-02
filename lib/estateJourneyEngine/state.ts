/**
 * Estate Journey Engine™ — state normalization and cloning.
 */

import type { EstateJourneyEngineState } from "./types";
import { ESTATE_JOURNEY_ENGINE_VERSION } from "./types";

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function newJourneyConversationId(): string {
  return newId("conv");
}

export function newJourneySessionId(): string {
  return newId("session");
}

export function createEmptyJourneySession(
  conversationId: string,
): EstateJourneyEngineState["sessions"][number] {
  const now = new Date().toISOString();
  return {
    id: newJourneySessionId(),
    startedAt: now,
    conversationId,
    roomIdsVisited: [],
    learningCompleted: [],
    projectsAdvanced: [],
    challengesCompleted: [],
    ideasCaptured: [],
  };
}

export function createEmptyJourneyEngineState(): EstateJourneyEngineState {
  const conversationId = newJourneyConversationId();
  const session = createEmptyJourneySession(conversationId);
  return {
    version: ESTATE_JOURNEY_ENGINE_VERSION,
    roomHistory: [],
    currentConversationId: conversationId,
    currentArtifactId: null,
    pausedWork: [],
    learning: [],
    sessions: [session],
    activeSessionId: session.id,
    profileTouches: [],
    topicStudy: [],
    newDayCount: 0,
  };
}

export function normalizeJourneyEngineState(
  slice?: EstateJourneyEngineState | null,
): EstateJourneyEngineState {
  if (!slice || slice.version !== ESTATE_JOURNEY_ENGINE_VERSION) {
    return createEmptyJourneyEngineState();
  }

  const sessions =
    slice.sessions?.length > 0
      ? slice.sessions.map((s) => ({
          ...s,
          roomIdsVisited: [...(s.roomIdsVisited ?? [])],
          learningCompleted: [...(s.learningCompleted ?? [])],
          projectsAdvanced: [...(s.projectsAdvanced ?? [])],
          challengesCompleted: [...(s.challengesCompleted ?? [])],
          ideasCaptured: [...(s.ideasCaptured ?? [])],
        }))
      : [createEmptyJourneySession(slice.currentConversationId)];

  const activeSessionId =
    sessions.some((s) => s.id === slice.activeSessionId) ?
      slice.activeSessionId
    : sessions[sessions.length - 1]!.id;

  return {
    version: ESTATE_JOURNEY_ENGINE_VERSION,
    roomHistory: [...(slice.roomHistory ?? [])],
    currentConversationId: slice.currentConversationId,
    currentArtifactId: slice.currentArtifactId ?? null,
    pausedWork: [...(slice.pausedWork ?? [])],
    learning: [...(slice.learning ?? [])],
    currentLesson: slice.currentLesson,
    currentApprenticeship: slice.currentApprenticeship,
    currentChallenge: slice.currentChallenge,
    currentSimulation: slice.currentSimulation,
    currentBusinessLab: slice.currentBusinessLab,
    currentGoal: slice.currentGoal,
    currentFocus: slice.currentFocus,
    currentMood: slice.currentMood,
    currentEnergy: slice.currentEnergy,
    sessions,
    activeSessionId,
    profileTouches: [...(slice.profileTouches ?? [])],
    topicStudy: [...(slice.topicStudy ?? [])],
    newDayCount: slice.newDayCount ?? 0,
  };
}

export function cloneJourneyEngineState(
  state: EstateJourneyEngineState,
): EstateJourneyEngineState {
  return normalizeJourneyEngineState(state);
}

export function getActiveJourneySession(
  state: EstateJourneyEngineState,
): EstateJourneyEngineState["sessions"][number] {
  return (
    state.sessions.find((s) => s.id === state.activeSessionId) ??
    state.sessions[state.sessions.length - 1]!
  );
}
