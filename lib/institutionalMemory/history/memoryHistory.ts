import type { InstitutionalMemory, MemoryEvent, RememberInput } from "../types";
import { institutionalMemorySampleRepository } from "../repositories/sample";
import { ecosystemMemoryTimeline } from "../timeline/memoryTimeline";

const runtimeMemories: InstitutionalMemory[] = [];

function mergedMemories(): InstitutionalMemory[] {
  const byId = new Map<string, InstitutionalMemory>();
  for (const m of institutionalMemorySampleRepository.list()) byId.set(m.id, m);
  for (const m of runtimeMemories) byId.set(m.id, m);
  return [...byId.values()];
}

export function captureHistorySnapshot() {
  const memories = mergedMemories();
  return {
    capturedAt: new Date().toISOString(),
    memoryCount: memories.length,
    relationshipCount: institutionalMemorySampleRepository.listRelationships().length,
    recentEvents: ecosystemMemoryTimeline(memories, 10),
  };
}

export function recordRecallEvent(memory: InstitutionalMemory): MemoryEvent {
  const event: MemoryEvent = {
    id: `me-recall-${memory.id}-${Date.now()}`,
    memoryId: memory.id,
    kind: "recalled",
    summary: "Memory recalled from institutional store.",
    occurredAt: new Date().toISOString(),
  };
  memory.timeline.push(event);
  return event;
}

export { runtimeMemories, mergedMemories };
