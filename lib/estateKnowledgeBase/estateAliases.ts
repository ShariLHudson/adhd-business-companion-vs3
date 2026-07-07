/**
 * Estate Knowledge Base™ — natural language alias resolver.
 */

import estateAliasesJson from "@/docs/estate-knowledge-base/estate-aliases.json";
import {
  longestPhraseMatch,
  stripNavigationVerbsFromQuery,
} from "./locationPhraseMatch";
import type { EstateAlias } from "./types";

type EstateAliasesFile = {
  aliases: EstateAlias[];
};

const FILE = estateAliasesJson as EstateAliasesFile;

const LIVE_ALIASES = FILE.aliases.filter((alias) => alias.status === "Live");

export function getEstateAliases(): EstateAlias[] {
  return FILE.aliases;
}

export function getLiveEstateAliases(): EstateAlias[] {
  return LIVE_ALIASES;
}

export function matchEstateAlias(query: string): EstateAlias | null {
  const probe = stripNavigationVerbsFromQuery(query) || query.trim();
  if (!probe) return null;

  const match = longestPhraseMatch(probe, LIVE_ALIASES, (alias) => alias.phrase);
  return match?.item ?? null;
}
