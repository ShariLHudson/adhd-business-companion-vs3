import type { MemoryEvent, InstitutionalMemory } from "../types";

export function memoryTimeline(memory: InstitutionalMemory): MemoryEvent[] {
  return [...memory.timeline].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

export function ecosystemMemoryTimeline(memories: InstitutionalMemory[], limit = 20): MemoryEvent[] {
  return memories
    .flatMap((m) => m.timeline)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, limit);
}
