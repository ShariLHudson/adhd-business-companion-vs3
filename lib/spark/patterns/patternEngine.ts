import type { SparkConnection, SparkPattern, SparkSignal, SparkTheme } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";

export class SparkPatternService {
  constructor(private readonly repo: SparkSampleRepository = sparkSampleRepository) {}

  findPatterns(): SparkPattern[] {
    return this.repo.patterns();
  }

  groupSignals(signals?: SparkSignal[]): Map<string, SparkSignal[]> {
    const list = signals ?? this.repo.signals();
    const groups = new Map<string, SparkSignal[]>();
    for (const signal of list) {
      const key = signal.category;
      const bucket = groups.get(key) ?? [];
      bucket.push(signal);
      groups.set(key, bucket);
    }
    return groups;
  }

  detectRelationships(pattern: SparkPattern): SparkConnection[] {
    return this.repo
      .connections()
      .filter((c) => c.toId === pattern.id || pattern.signalIds.includes(c.fromId));
  }

  identifyThemes(): SparkTheme[] {
    return this.repo.themes();
  }

  rankImportance(patterns?: SparkPattern[]): SparkPattern[] {
    const list = patterns ?? this.repo.patterns();
    return [...list].sort((a, b) => b.confidence.score - a.confidence.score);
  }
}

export const sparkPatternService = new SparkPatternService();

/** @deprecated Use sparkPatternService */
export const patternEngine = sparkPatternService;
