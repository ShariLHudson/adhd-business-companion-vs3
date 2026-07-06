import { memoryTheaterSampleRepository, matchReplay } from "../repositories/sample";
import type { MemoryTheaterBootstrap, MemoryTheaterSessionView } from "../types";

export function getMemoryTheaterBootstrap(): MemoryTheaterBootstrap {
  return {
    entryPoints: memoryTheaterSampleRepository.entryPoints(),
    featuredReplayId: "replay-workshop-decision",
    neverAgainLibrary: memoryTheaterSampleRepository.neverAgainLibrary(),
    doThisAgainLibrary: memoryTheaterSampleRepository.doThisAgainLibrary(),
  };
}

export function composeMemoryReplaySession(query: string): MemoryTheaterSessionView | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const replay = matchReplay(trimmed);
  if (!replay) return null;
  return {
    product: "founder",
    query: trimmed,
    replay,
    generatedAt: new Date().toISOString(),
  };
}

export function composeMemoryReplayById(id: string): MemoryTheaterSessionView | null {
  const replay = memoryTheaterSampleRepository.get(id);
  if (!replay) return null;
  return {
    product: "founder",
    query: replay.title,
    replay,
    generatedAt: new Date().toISOString(),
  };
}

export class ExecutiveMemoryTheaterService {
  compose(query: string) {
    return composeMemoryReplaySession(query);
  }

  composeById(id: string) {
    return composeMemoryReplayById(id);
  }

  bootstrap() {
    return getMemoryTheaterBootstrap();
  }

  sampleRepository() {
    return memoryTheaterSampleRepository;
  }
}

export const executiveMemoryTheaterService = new ExecutiveMemoryTheaterService();
