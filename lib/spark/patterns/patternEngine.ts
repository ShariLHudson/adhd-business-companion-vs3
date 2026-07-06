import type { SparkConnection, SparkPattern, SparkSignal, SparkTheme } from "../types";
import type { SparkSampleRepository } from "../repositories";
import { sparkSampleRepository } from "../repositories";

export class PatternEngine {
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
    return pattern.signalIds.map((signalId, index) => ({
      id: `rel-${pattern.id}-${index}`,
      fromKind: "signal" as const,
      fromId: signalId,
      toKind: "pattern" as const,
      toId: pattern.id,
      relationship: "supports" as const,
      notedAt: pattern.detectedAt,
    }));
  }

  identifyThemes(): SparkTheme[] {
    return this.repo.themes();
  }

  rankImportance(patterns?: SparkPattern[]): SparkPattern[] {
    const list = patterns ?? this.repo.patterns();
    return [...list].sort(
      (a, b) => b.confidence.score - a.confidence.score,
    );
  }
}

export const patternEngine = new PatternEngine();
