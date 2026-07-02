/**
 * Estate Knowledge Base™ — runtime hints synced with docs/estate/*.md
 * @see docs/estate/KNOWLEDGE_BASE.md
 */

import {
  MOMENTUM_INSTITUTE_CHAT_KNOWLEDGE,
  MOMENTUM_INSTITUTE_REGISTRY_ID,
} from "./momentumInstitute";

const ROOM_KNOWLEDGE_BY_REGISTRY_ID: Readonly<Record<string, string>> = {
  [MOMENTUM_INSTITUTE_REGISTRY_ID]: MOMENTUM_INSTITUTE_CHAT_KNOWLEDGE,
};

export function estateRoomKnowledgeHintForChat(
  registryEntryId: string,
): string | null {
  return ROOM_KNOWLEDGE_BY_REGISTRY_ID[registryEntryId] ?? null;
}

export {
  MOMENTUM_INSTITUTE_CHAT_KNOWLEDGE,
  MOMENTUM_INSTITUTE_REGISTRY_ID,
} from "./momentumInstitute";
