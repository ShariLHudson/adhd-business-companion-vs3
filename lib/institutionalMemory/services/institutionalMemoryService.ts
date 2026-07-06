import type { InstitutionalMemory, MemoryConfidence, RememberInput } from "../types";
import { institutionalMemorySampleRepository } from "../repositories/sample";
import { buildBusinessReasoning, findDecisionHistory, listAllDecisions } from "../decisions/decisionHistory";
import { analyzeLessons, findLessons } from "../lessons/lessonEngine";
import { findProductHistory, productEvolutionSummary } from "../outcomes/productEvolution";
import { findPastExperiments } from "../outcomes/outcomeCatalog";
import { findBusinessReasoning } from "../reasoning/businessReasoning";
import { recall as recallMemories, findSimilar, rediscover } from "../reasoning/rediscovery";
import { ecosystemMemoryTimeline, memoryTimeline } from "../timeline/memoryTimeline";
import { validateRelationshipIntegrity } from "../relationships/memoryRelationships";
import {
  captureHistorySnapshot,
  mergedMemories,
  recordRecallEvent,
  runtimeMemories,
} from "../history/memoryHistory";

function defaultConfidence(): MemoryConfidence {
  return { level: "medium", score: 70, rationale: "Runtime capture — pending validation." };
}

function nextMemoryId(): string {
  return `mem-runtime-${Date.now()}-${runtimeMemories.length}`;
}

export class InstitutionalMemoryService {
  remember(input: RememberInput): InstitutionalMemory {
    const now = new Date().toISOString();
    const memory: InstitutionalMemory = {
      ...input,
      id: nextMemoryId(),
      confidence: input.confidence ?? defaultConfidence(),
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          id: `me-created-${now}`,
          memoryId: "",
          kind: "created",
          summary: "Memory captured in institutional store.",
          occurredAt: now,
        },
      ],
    };
    memory.timeline[0].memoryId = memory.id;
    runtimeMemories.push(memory);
    return memory;
  }

  recall(...args: Parameters<typeof recallMemories>) {
    const results = recallMemories(...args);
    for (const memory of results) recordRecallEvent(memory);
    return results;
  }

  get(id: string) {
    return mergedMemories().find((m) => m.id === id) ?? null;
  }

  list() {
    return mergedMemories();
  }

  findLessons(...args: Parameters<typeof findLessons>) {
    return findLessons(...args);
  }

  analyzeLessons(...args: Parameters<typeof analyzeLessons>) {
    return analyzeLessons(...args);
  }

  findSimilar(memoryId: string) {
    return findSimilar(memoryId);
  }

  findDecisionHistory(decisionId: string) {
    return findDecisionHistory(decisionId);
  }

  findBusinessReasoning(decisionId: string) {
    return findBusinessReasoning(decisionId);
  }

  explainDecision(decisionId: string) {
    return buildBusinessReasoning(decisionId)?.narrative ?? [];
  }

  findPastExperiments(...args: Parameters<typeof findPastExperiments>) {
    return findPastExperiments(...args);
  }

  findProductHistory(productId: string) {
    return findProductHistory(productId);
  }

  productEvolutionSummary(productId: string) {
    return productEvolutionSummary(productId);
  }

  rediscover(query: string) {
    return rediscover(query);
  }

  timelineForMemory(memoryId: string) {
    const memory = this.get(memoryId);
    if (!memory) return [];
    return memoryTimeline(memory);
  }

  ecosystemTimeline(limit = 20) {
    return ecosystemMemoryTimeline(mergedMemories(), limit);
  }

  listDecisions() {
    return listAllDecisions();
  }

  relationshipIntegrity() {
    return validateRelationshipIntegrity();
  }

  historySnapshot() {
    return captureHistorySnapshot();
  }

  sampleRepository() {
    return institutionalMemorySampleRepository;
  }
}

export const institutionalMemoryService = new InstitutionalMemoryService();

export function remember(input: RememberInput) {
  return institutionalMemoryService.remember(input);
}

export function recall(...args: Parameters<typeof recallMemories>) {
  return institutionalMemoryService.recall(...args);
}

export function findLessonsPublic(...args: Parameters<typeof findLessons>) {
  return institutionalMemoryService.findLessons(...args);
}

export function findSimilarPublic(memoryId: string) {
  return institutionalMemoryService.findSimilar(memoryId);
}

export function findDecisionHistoryPublic(decisionId: string) {
  return institutionalMemoryService.findDecisionHistory(decisionId);
}

export function findBusinessReasoningPublic(decisionId: string) {
  return institutionalMemoryService.findBusinessReasoning(decisionId);
}

export function findPastExperimentsPublic(...args: Parameters<typeof findPastExperiments>) {
  return institutionalMemoryService.findPastExperiments(...args);
}

export function findProductHistoryPublic(productId: string) {
  return institutionalMemoryService.findProductHistory(productId);
}

export function rediscoverMemory(query: string) {
  return institutionalMemoryService.rediscover(query);
}

export function resetRuntimeInstitutionalMemory() {
  runtimeMemories.length = 0;
}
