// Founder Ecosystem — Phase 5 Advisor Memory.
// Learns which advisors and recommendations actually help, so the board gets
// better over time. Built from a log of past deliberations.

import type { AdvisorId, BoardResponse } from "./advisorTypes";
import { ADVISORS } from "./advisorTypes";

export type DeliberationRecord = {
  id: string;
  ts: string;
  message: string;
  response: BoardResponse;
  helpful?: boolean; // optional founder feedback
};

export type AdvisorMemory = {
  mostUsedAdvisors: { advisor: AdvisorId; label: string; count: number }[];
  mostHelpfulRecommendations: { text: string; count: number }[];
  commonChallenges: { challenge: string; count: number }[];
  commonPairings: { pair: string; advisors: AdvisorId[]; count: number }[];
};

// A tiny append-only log; swap for a DB later.
export class AdvisorLog {
  private records: DeliberationRecord[] = [];
  add(rec: DeliberationRecord) {
    this.records.push(rec);
  }
  all() {
    return this.records.slice();
  }
}

function top<T>(map: Map<string, { item: T; count: number }>, limit = 5) {
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

export function buildAdvisorMemory(
  records: DeliberationRecord[],
): AdvisorMemory {
  const used = new Map<AdvisorId, number>();
  const helpful = new Map<string, { item: string; count: number }>();
  const challenges = new Map<string, { item: string; count: number }>();
  const pairings = new Map<string, { item: AdvisorId[]; count: number }>();

  for (const r of records) {
    const advisors = [
      r.response.primaryAdvisor,
      ...r.response.secondaryAdvisors,
    ];
    for (const a of advisors) used.set(a, (used.get(a) ?? 0) + 1);

    if (r.helpful) {
      const k = r.response.message;
      const cur = helpful.get(k) ?? { item: k, count: 0 };
      cur.count += 1;
      helpful.set(k, cur);
    }

    // Challenge category ≈ the primary advisor's domain.
    const ch = ADVISORS[r.response.primaryAdvisor].name;
    const cc = challenges.get(ch) ?? { item: ch, count: 0 };
    cc.count += 1;
    challenges.set(ch, cc);

    // Pairing = primary + first secondary (sorted for stable key).
    const sec = r.response.secondaryAdvisors[0];
    if (sec) {
      const pair = [r.response.primaryAdvisor, sec].sort();
      const key = pair.join("+");
      const cur = pairings.get(key) ?? { item: pair as AdvisorId[], count: 0 };
      cur.count += 1;
      pairings.set(key, cur);
    }
  }

  return {
    mostUsedAdvisors: [...used.entries()]
      .map(([advisor, count]) => ({
        advisor,
        label: ADVISORS[advisor].name,
        count,
      }))
      .sort((a, b) => b.count - a.count),
    mostHelpfulRecommendations: top(helpful).map((x) => ({
      text: x.item,
      count: x.count,
    })),
    commonChallenges: top(challenges).map((x) => ({
      challenge: x.item,
      count: x.count,
    })),
    commonPairings: [...pairings.entries()]
      .map(([pair, v]) => ({ pair, advisors: v.item, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
}
