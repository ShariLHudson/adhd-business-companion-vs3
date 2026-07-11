/**
 * Estate Object Intelligence — natural language object alias resolver.
 */

import objectAliasesJson from "@/docs/estate-knowledge-base/object-aliases.json";
import type { ObjectAlias } from "./types";

type ObjectAliasesFile = {
  aliases: ObjectAlias[];
};

const FILE = objectAliasesJson as ObjectAliasesFile;

function normalizePhrase(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

const SORTED_ALIASES = [...FILE.aliases].sort(
  (a, b) => b.phrase.length - a.phrase.length,
);

export function getObjectAliases(): ObjectAlias[] {
  return FILE.aliases;
}

export function getLiveObjectAliases(): ObjectAlias[] {
  return FILE.aliases.filter((alias) => alias.status === "Live");
}

export function matchObjectAlias(query: string): ObjectAlias | null {
  const normalized = normalizePhrase(query);
  if (!normalized) return null;

  for (const alias of SORTED_ALIASES) {
    if (alias.status !== "Live") continue;
    const phrase = normalizePhrase(alias.phrase);
    if (normalized.includes(phrase)) {
      return alias;
    }
  }

  return null;
}
