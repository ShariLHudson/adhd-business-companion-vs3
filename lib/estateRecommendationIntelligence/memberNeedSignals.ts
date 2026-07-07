/**
 * Member need signal loader — human-side of Estate Recommendation Intelligence™.
 */

import memberNeedSignalsJson from "@/docs/estate-knowledge-base/member-need-signals.json";
import type { MemberNeedSignal } from "./types";

type MemberNeedSignalsFile = {
  signals: MemberNeedSignal[];
};

const FILE = memberNeedSignalsJson as MemberNeedSignalsFile;

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getMemberNeedSignals(): MemberNeedSignal[] {
  return FILE.signals;
}

export function getLiveMemberNeedSignals(): MemberNeedSignal[] {
  return FILE.signals.filter((signal) => signal.status === "Live");
}

export function getMemberNeedSignalById(
  signalId: string,
): MemberNeedSignal | null {
  return FILE.signals.find((signal) => signal.signalId === signalId) ?? null;
}

export type MemberNeedSignalMatch = {
  signal: MemberNeedSignal;
  matchedPhrase: string;
};

export function matchMemberNeedSignal(
  query: string,
): MemberNeedSignalMatch | null {
  const normalized = normalize(query);
  if (!normalized) return null;

  for (const signal of getLiveMemberNeedSignals()) {
    for (const phrase of signal.memberMaySay) {
      const normalizedPhrase = normalize(phrase);
      if (normalized.includes(normalizedPhrase)) {
        return { signal, matchedPhrase: phrase };
      }
    }

    for (const keyword of signal.keywords) {
      if (normalized.includes(normalize(keyword))) {
        return { signal, matchedPhrase: keyword };
      }
    }
  }

  return null;
}
