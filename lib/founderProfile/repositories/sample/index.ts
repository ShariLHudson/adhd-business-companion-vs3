import {
  SAMPLE_FOUNDER_FRICTION,
  SAMPLE_FOUNDER_OBSERVATIONS,
  SAMPLE_FOUNDER_PATTERNS,
  SAMPLE_FOUNDER_PREFERENCES,
  SAMPLE_FOUNDER_STRENGTHS,
} from "../../sample";
import type { FounderObservationKind } from "../../types";

export const founderProfileSampleRepository = {
  observations: () => [...SAMPLE_FOUNDER_OBSERVATIONS],
  patterns: () => [...SAMPLE_FOUNDER_PATTERNS],
  preferences: () => [...SAMPLE_FOUNDER_PREFERENCES],
  friction: () => [...SAMPLE_FOUNDER_FRICTION],
  strengths: () => [...SAMPLE_FOUNDER_STRENGTHS],
  byKind: (kind: FounderObservationKind) =>
    SAMPLE_FOUNDER_OBSERVATIONS.filter((o) => o.kind === kind),
  forMission: (missionId: string) =>
    SAMPLE_FOUNDER_OBSERVATIONS.filter((o) => o.missionId === missionId),
};
