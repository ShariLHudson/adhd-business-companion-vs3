import {
  getSampleInitiative,
  initiativesByCategory,
  initiativesForMission,
  initiativeForDecision,
  listSampleInitiatives,
} from "../../sample";

export const orchestratorSampleRepository = {
  list: () => listSampleInitiatives(),
  get: (id: string) => getSampleInitiative(id),
  forMission: (missionId: string) => initiativesForMission(missionId),
  byCategory: (category: Parameters<typeof initiativesByCategory>[0]) => initiativesByCategory(category),
  forDecision: (decisionId: string) => initiativeForDecision(decisionId),
};
