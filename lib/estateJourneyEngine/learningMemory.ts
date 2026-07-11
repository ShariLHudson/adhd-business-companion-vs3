/**
 * Estate Journey Engine — learning memory across the Estate.
 */

import { getJourneyEngineState, patchJourneyEngine } from "./journeyStore";
import { touchJourneyProfileConnection } from "./profileConnections";
import type { EstateLearningRecord, RecordJourneyLearningInput } from "./types";

const MAX_LEARNING_RECORDS = 64;

function newLearningId(): string {
  return `learn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeTopic(topic?: string): string | undefined {
  const t = topic?.trim().toLowerCase();
  return t || undefined;
}

function updateTopicStudy(
  journey: ReturnType<typeof getJourneyEngineState>,
  topic: string | undefined,
  completed: boolean,
) {
  if (!topic) return journey.topicStudy;
  const now = new Date().toISOString();
  const study = [...journey.topicStudy];
  const idx = study.findIndex((s) => s.topic === topic);
  if (idx < 0) {
    study.push({
      topic,
      firstSeenAt: now,
      lastSeenAt: now,
      completions: completed ? 1 : 0,
    });
    return study.slice(-24);
  }
  const prior = study[idx]!;
  study[idx] = {
    ...prior,
    lastSeenAt: now,
    completions: completed ? prior.completions + 1 : prior.completions,
  };
  return study;
}

function profileKindForLearning(
  kind: RecordJourneyLearningInput["kind"],
): Parameters<typeof touchJourneyProfileConnection>[0]["kind"] | null {
  switch (kind) {
    case "knowledge-card":
    case "lesson":
    case "apprenticeship":
    case "make-it-mine":
      return "institute-cabinet";
    case "reflection":
      return "journal";
    case "business-lab":
      return "portfolio";
    case "challenge":
    case "simulation":
      return "evidence-vault";
    default:
      return null;
  }
}

export function recordJourneyLearning(
  input: RecordJourneyLearningInput,
): EstateLearningRecord {
  const record: EstateLearningRecord = {
    id: newLearningId(),
    kind: input.kind,
    label: input.label,
    topic: normalizeTopic(input.topic),
    status: input.status,
    at: new Date().toISOString(),
    refId: input.refId,
  };

  patchJourneyEngine((journey) => {
    const learning = [record, ...journey.learning].slice(0, MAX_LEARNING_RECORDS);
    const topicStudy = updateTopicStudy(
      journey,
      record.topic,
      input.status === "completed",
    );

    let sessions = journey.sessions;
    if (input.status === "completed") {
      sessions = journey.sessions.map((s) =>
        s.id === journey.activeSessionId ?
          {
            ...s,
            learningCompleted: [...s.learningCompleted, input.label].slice(-20),
          }
        : s,
      );
    }

    return {
      ...journey,
      learning,
      topicStudy,
      sessions,
      currentLesson:
        input.kind === "lesson" ? input.label : journey.currentLesson,
      currentApprenticeship:
        input.kind === "apprenticeship" ? input.label : journey.currentApprenticeship,
      currentChallenge:
        input.kind === "challenge" ? input.label : journey.currentChallenge,
      currentSimulation:
        input.kind === "simulation" ? input.label : journey.currentSimulation,
      currentBusinessLab:
        input.kind === "business-lab" ? input.label : journey.currentBusinessLab,
    };
  });

  const profileKind = profileKindForLearning(input.kind);
  if (profileKind && input.status === "completed") {
    touchJourneyProfileConnection({
      kind: profileKind,
      refId: input.refId,
      label: input.label,
    });
  }

  return record;
}

export function weeksStudyingTopic(
  state: ReturnType<typeof getJourneyEngineState>,
  topic: string,
): number {
  const normalized = normalizeTopic(topic);
  if (!normalized) return 0;
  const entry = state.topicStudy.find((s) => s.topic === normalized);
  if (!entry) return 0;
  const ms = Date.now() - new Date(entry.firstSeenAt).getTime();
  return Math.max(1, Math.floor(ms / (7 * 24 * 60 * 60 * 1000)));
}
