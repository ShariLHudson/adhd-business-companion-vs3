/**
 * 054 — Event Agenda reference implementation of the Connected Asset Editor.
 * Budgets, workbooks, surveys, etc. reuse openConnectedAssetEditor the same way.
 */

import type { EventRecord } from "@/lib/eventsIntelligence/types";
import { openConnectedAssetEditor } from "./openConnectedAssetEditor";
import { resumeConnectedAssetEditor, saveConnectedAsset } from "./editorSession";
import type {
  ConnectedAssetBlock,
  ConnectedAssetEditorSession,
} from "./types";

export function openAgendaEditor(input: {
  record?: EventRecord | null;
  eventRecordId?: string | null;
  templateId?: string | null;
  conversationGoal?: string | null;
}): ConnectedAssetEditorSession | null {
  return openConnectedAssetEditor({
    assetTypeId: "agenda",
    eventRecordId: input.eventRecordId ?? input.record?.id,
    sectionId: "agenda",
    templateId: input.templateId ?? "tpl-agenda-one-day-workshop",
    title: "Agenda",
    conversationGoal:
      input.conversationGoal ?? "Shape a clear agenda for this gathering",
  });
}

export function resumeAgendaEditor(input: {
  documentId?: string | null;
  instanceId?: string | null;
}): ConnectedAssetEditorSession | null {
  return resumeConnectedAssetEditor(input);
}

export function saveAgendaBlocks(input: {
  documentId: string;
  blocks: ConnectedAssetBlock[];
  title?: string;
  versionNote?: string;
}): ConnectedAssetEditorSession | null {
  return saveConnectedAsset({
    documentId: input.documentId,
    blocks: input.blocks,
    title: input.title,
    versionNote: input.versionNote ?? "agenda update",
  });
}

/** Prove the Agenda path exposes every framework capability. */
export function agendaEditorProvesFramework(
  session: ConnectedAssetEditorSession,
): boolean {
  return (
    session.document.assetTypeId === "agenda" &&
    Boolean(session.document.creationRecordId) &&
    Boolean(session.document.instanceId) &&
    session.document.version >= 1 &&
    session.capabilities.length === 8 &&
    Boolean(session.connections.relationshipRegistryKey) &&
    Array.isArray(session.recommendations)
  );
}
