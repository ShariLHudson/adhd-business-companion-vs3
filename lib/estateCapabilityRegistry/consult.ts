/**
 * Consult API — Spark always consults the registry before routing.
 */

import {
  ESTATE_CAPABILITY_CATALOG,
  capabilityById,
  relatedCapabilities,
} from "./catalog";
import type { CapabilityConsultMatch, EstateCapabilityEntry } from "./types";

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scorePhrase(haystack: string, phrase: string): number {
  const n = normalize(phrase);
  if (!n || n.length < 2) return 0;
  if (haystack === n) return 100;
  if (haystack.includes(n)) {
    const base = 60 + Math.min(n.length, 40);
    if (n.length <= 5) {
      const re = new RegExp(`\\b${escapeRegex(n)}\\b`, "i");
      if (!re.test(haystack)) return 0;
      return base + (n.length <= 3 ? 15 : 5);
    }
    return base;
  }
  const words = n.split(" ").filter((w) => w.length > 2);
  if (!words.length) return 0;
  const hits = words.filter((w) => haystack.includes(w)).length;
  return hits >= 2 ? 35 + hits * 8 : hits === 1 && words.length === 1 ? 30 : 0;
}

function scoreEntry(
  entry: EstateCapabilityEntry,
  userText: string,
): CapabilityConsultMatch | null {
  const haystack = normalize(userText);
  let best: CapabilityConsultMatch | null = null;

  const consider = (
    phrase: string,
    matchedOn: CapabilityConsultMatch["matchedOn"],
    baseBoost = 0,
  ) => {
    const score = scorePhrase(haystack, phrase) + baseBoost;
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score, matchedOn };
    }
  };

  consider(entry.name, "name", 10);
  for (const alias of entry.aliases) consider(alias, "alias", 5);
  for (const trigger of entry.triggers) {
    try {
      if (trigger.startsWith("\\") || trigger.includes("(?")) {
        if (new RegExp(trigger, "i").test(userText)) {
          consider(trigger, "trigger", 20);
        }
      } else {
        consider(trigger, "trigger", trigger.length <= 5 ? 12 : 8);
      }
    } catch {
      consider(trigger, "trigger", 8);
    }
  }
  for (const when of entry.bestUsedWhen) {
    const s = scorePhrase(haystack, when);
    if (s >= 30) consider(when, "bestUsedWhen", 0);
  }

  const matched = best as CapabilityConsultMatch | null;
  if (matched && entry.id.endsWith(".general")) {
    return { ...matched, score: matched.score - 28 };
  }

  return matched;
}

/** Primary consult — call before any estate routing decision. */
export function consultEstateCapabilities(
  userText: string,
  options?: { minScore?: number; limit?: number },
): CapabilityConsultMatch[] {
  const minScore = options?.minScore ?? 30;
  const limit = options?.limit ?? 8;
  const matches: CapabilityConsultMatch[] = [];

  for (const entry of ESTATE_CAPABILITY_CATALOG) {
    if (!entry.canRecommend && !entry.canLaunchDirectly) continue;
    const match = scoreEntry(entry, userText);
    if (match && match.score >= minScore) matches.push(match);
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function consultBestCapability(
  userText: string,
): EstateCapabilityEntry | null {
  const [best] = consultEstateCapabilities(userText, { limit: 1 });
  return best?.entry ?? null;
}

export function consultCapabilityById(id: string): EstateCapabilityEntry | null {
  return capabilityById(id);
}

export function consultRelatedCapabilities(
  capabilityId: string,
): EstateCapabilityEntry[] {
  return relatedCapabilities(capabilityId);
}

export function capabilityMatchesExplicitRequest(
  userText: string,
  capabilityId: string,
): boolean {
  const entry = capabilityById(capabilityId);
  if (!entry) return false;
  const match = scoreEntry(entry, userText);
  return (match?.score ?? 0) >= 45;
}

export { ESTATE_CAPABILITY_CATALOG, capabilityById };
