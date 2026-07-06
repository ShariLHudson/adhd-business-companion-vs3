import {
  getSampleMemory,
  listSampleMemories,
  listSampleMemoryRelationships,
  memoriesForGraphNode,
  memoriesForMission,
} from "../../sample";

export const institutionalMemorySampleRepository = {
  list: () => listSampleMemories(),
  get: (id: string) => getSampleMemory(id),
  listRelationships: () => listSampleMemoryRelationships(),
  forMission: (missionId: string) => memoriesForMission(missionId),
  forGraphNode: (graphNodeId: string) => memoriesForGraphNode(graphNodeId),
};
