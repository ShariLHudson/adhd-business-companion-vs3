import {
  decisionsByCategory,
  decisionsForMission,
  getSampleDecision,
  listSampleDecisionRelationships,
  listSampleDecisions,
} from "../../sample";

export const executiveDecisionSampleRepository = {
  list: () => listSampleDecisions(),
  get: (id: string) => getSampleDecision(id),
  listRelationships: () => listSampleDecisionRelationships(),
  forMission: (missionId: string) => decisionsForMission(missionId),
  byCategory: (category: Parameters<typeof decisionsByCategory>[0]) => decisionsByCategory(category),
};
