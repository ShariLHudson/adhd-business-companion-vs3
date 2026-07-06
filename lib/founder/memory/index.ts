import type { FounderMemoryItem } from "../types";
import { sampleMemoryRepository } from "../repositories";

export function listFounderMemory(): FounderMemoryItem[] {
  return sampleMemoryRepository.list();
}

export function getFounderMemory(id: string): FounderMemoryItem | null {
  return sampleMemoryRepository.getById(id);
}

export function searchFounderMemory(query: string): FounderMemoryItem[] {
  return sampleMemoryRepository.search(query);
}

export function listFounderMemoryByCategory(
  category: FounderMemoryItem["category"],
): FounderMemoryItem[] {
  return sampleMemoryRepository.listByCategory(category);
}
