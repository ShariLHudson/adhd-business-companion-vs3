import type { BoardConsensus, BoardDiscussion } from "../types";

export function composeConsensus(discussion: BoardDiscussion): BoardConsensus {
  return discussion.consensus;
}

export function consensusAgreementCount(consensus: BoardConsensus): number {
  return consensus.agreement.length;
}

export function consensusNeedsFounderDecision(consensus: BoardConsensus): boolean {
  return consensus.needsFounderDecision.length > 0;
}

export function mergeOpenQuestions(...consensuses: BoardConsensus[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const c of consensuses) {
    for (const q of c.openQuestions) {
      if (!seen.has(q)) {
        seen.add(q);
        merged.push(q);
      }
    }
  }
  return merged;
}
