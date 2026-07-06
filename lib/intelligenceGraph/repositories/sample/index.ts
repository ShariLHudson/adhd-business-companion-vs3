import {
  getSampleExecutiveMemory,
  getSampleNode,
  listSampleExecutiveMemory,
  listSampleNodes,
  listSampleRelationships,
  relationshipsFrom,
  relationshipsTo,
} from "../../sample";

export const intelligenceGraphSampleRepository = {
  listNodes: () => listSampleNodes(),
  getNode: (id: string) => getSampleNode(id),
  listRelationships: () => listSampleRelationships(),
  relationshipsFrom: (nodeId: string) => relationshipsFrom(nodeId),
  relationshipsTo: (nodeId: string) => relationshipsTo(nodeId),
  listExecutiveMemory: () => listSampleExecutiveMemory(),
  getExecutiveMemory: (decisionNodeId: string) => getSampleExecutiveMemory(decisionNodeId),
};

export type IntelligenceGraphSampleRepository = typeof intelligenceGraphSampleRepository;
