// Founder Ecosystem — Phase 6 sample graph data.
// Builds a fully-connected memory + relationship graph from the master-workflow
// simulation, so UI and tests have realistic, derived data to work with.

import { simulateMasterWorkflow } from "../fixtures/masterWorkflow";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import { buildFounderMemory } from "./founderMemoryEngine";
import { buildGraph } from "./relationshipGraph";
import type { FounderMemory, RelationshipGraph } from "./memoryTypes";

export const SAMPLE_FOUNDER_ID = "founder-sample";

export function sampleEvents() {
  return simulateMasterWorkflow(SAMPLE_FOUNDER_ID, new Date("2026-06-01T09:00:00.000Z"));
}

export function sampleGraph(): RelationshipGraph {
  const events = sampleEvents();
  const intel = getFounderIntelligence(events, SAMPLE_FOUNDER_ID);
  return buildGraph(events, intel);
}

export function sampleMemory(): FounderMemory {
  return buildFounderMemory(sampleEvents(), SAMPLE_FOUNDER_ID);
}
