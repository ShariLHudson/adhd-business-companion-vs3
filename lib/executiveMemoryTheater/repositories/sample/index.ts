import {
  DO_THIS_AGAIN_LIBRARY,
  MEMORY_THEATER_PRINCIPLE,
  NEVER_AGAIN_LIBRARY,
  REPLAY_ENTRY_POINTS,
  SAMPLE_REPLAYS,
  getSampleReplay,
} from "../../sample/memoryTheaterData";

export const memoryTheaterSampleRepository = {
  principle: () => MEMORY_THEATER_PRINCIPLE,
  entryPoints: () => REPLAY_ENTRY_POINTS,
  replays: () => SAMPLE_REPLAYS,
  neverAgainLibrary: () => NEVER_AGAIN_LIBRARY,
  doThisAgainLibrary: () => DO_THIS_AGAIN_LIBRARY,
  get: (id: string) => getSampleReplay(id),
};

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchReplay(query: string) {
  const q = normalizeQuery(query);
  if (q.includes("workshop") || q.includes("membership") || q.includes("launch decision")) {
    return getSampleReplay("replay-workshop-decision");
  }
  if (q.includes("founder") && (q.includes("journey") || q.includes("studio") || q.includes("build"))) {
    return getSampleReplay("replay-founder-journey");
  }
  if (q.includes("research") || q.includes("restart") || q.includes("adhd")) {
    return getSampleReplay("replay-restart-research");
  }
  if (q.includes("listening") || q.includes("product")) {
    return getSampleReplay("replay-workshop-decision");
  }
  if (q.includes("quarter") || q.includes("q1")) {
    return getSampleReplay("replay-workshop-decision");
  }
  return SAMPLE_REPLAYS[0];
}
