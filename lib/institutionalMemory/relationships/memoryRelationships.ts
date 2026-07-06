import type { MemoryRelationship } from "../types";
import { institutionalMemorySampleRepository } from "../repositories/sample";

export function listMemoryRelationships(): MemoryRelationship[] {
  return institutionalMemorySampleRepository.listRelationships();
}

export function relationshipsForMemory(memoryId: string): MemoryRelationship[] {
  return listMemoryRelationships().filter(
    (r) => r.fromMemoryId === memoryId || r.toMemoryId === memoryId,
  );
}

export function validateRelationshipIntegrity(): { valid: boolean; orphanCount: number } {
  const ids = new Set(institutionalMemorySampleRepository.list().map((m) => m.id));
  let orphanCount = 0;
  for (const rel of listMemoryRelationships()) {
    if (!ids.has(rel.fromMemoryId) || !ids.has(rel.toMemoryId)) orphanCount += 1;
  }
  return { valid: orphanCount === 0, orphanCount };
}
