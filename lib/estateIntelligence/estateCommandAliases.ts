/**
 * Estate Command Router™ — spoken room names → registry ids.
 * @deprecated Prefer lib/estate/estateRoomAliasRegistry.ts for new code.
 */

import {
  resolveEstateRoomAliasBounded,
  resolveEstateRoomAliasExact,
} from "@/lib/estate/estateRoomAliasRegistry";

export type EstateCommandAlias = {
  phrase: string;
  entryId: string;
};

/** @deprecated use ESTATE_ROOM_ALIAS_REGISTRY */
export const ESTATE_COMMAND_ALIASES: readonly EstateCommandAlias[] = [];

/** Map spoken phrase → estate registry entry id (room id). */
export function resolveEstateCommandAliasPhrase(
  phrase: string,
  options?: { bounded?: boolean },
): string | null {
  if (options?.bounded) {
    return resolveEstateRoomAliasBounded(phrase);
  }
  return resolveEstateRoomAliasExact(phrase);
}
