import { sampleMemoryRepository } from "../repositories/sample";
import type { FounderTimelineEvent } from "../types";

export function listMemoryTimeline(limit?: number): FounderTimelineEvent[] {
  return sampleMemoryRepository.listTimeline(limit);
}
