/**
 * Research-Assisted Map Building — universal cartography intelligence.
 * Public API.
 */

export type {
  MapDetailLevel,
  MapKnowledgeState,
  ResearchEntryChoice,
  ResearchEntryDetection,
  ResearchConfidence,
  ResearchSource,
  MapNodeResearch,
  ResearchFreshness,
  ResearchAssistedMapMeta,
  ResearchedDraftResult,
  BuildResearchedDraftInput,
} from "./types";

export { detectResearchEntry, extractTopic } from "./detectResearchEntry";

export {
  RESEARCH_MODES,
  DETAIL_NODE_BUDGET,
  researchModesForMap,
  describeDetailedYieldForMap,
  resolveDetailLevel,
  type ResearchModeOption,
} from "./researchModes";

export { buildResearchAssistedDraft } from "./buildResearchedDraft";

export { buildMapFramework, type MapFramework } from "./mapTypeFrameworks";
