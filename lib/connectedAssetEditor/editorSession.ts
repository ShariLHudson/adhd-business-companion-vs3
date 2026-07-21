/**
 * 054 — Save / resume Connected Asset Editor sessions.
 */

import { computeCreationReadiness } from "@/lib/creationEcosystem";
import { recommendEventAssets, getEventRecord } from "@/lib/eventsIntelligence";
import {
  getEventAssetInstance,
  updateEventAssetInstance,
} from "@/lib/eventsIntelligence/eventAssetRegistry";
import type { EventAssetInstance } from "@/lib/eventsIntelligence/eventAssetRegistry/types";
import { assembleConnectionBundle } from "./connectionBundle";
import { plainTextFromBlocks } from "./contentBuilders";
import {
  appendDocumentVersion,
  getConnectedDocument,
  getConnectedDocumentByInstance,
  listDocumentVersions,
  storeEditorSession,
  upsertConnectedDocument,
} from "./documentStore";
import {
  CONNECTED_ASSET_EDITOR_CAPABILITIES,
  type ConnectedAssetDocument,
  type ConnectedAssetEditorSession,
  type SaveConnectedAssetInput,
} from "./types";

function sessionId(): string {
  return `caes-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function buildEditorSession(input: {
  document: ConnectedAssetDocument;
  instance: EventAssetInstance;
  conversationGoal?: string | null;
}): ConnectedAssetEditorSession {
  const record = input.document.eventRecordId
    ? getEventRecord(input.document.eventRecordId)
    : null;
  const connections = assembleConnectionBundle({
    instance: input.instance,
    record,
    conversationGoal: input.conversationGoal,
  });
  const recommendations = record
    ? recommendEventAssets(record, { focusLimit: 6 }).focused.filter(
        (r) => r.assetTypeId !== input.document.assetTypeId,
      )
    : [];

  const sid = sessionId();
  storeEditorSession({
    sessionId: sid,
    documentId: input.document.documentId,
    openedAt: new Date().toISOString(),
    conversationGoal: input.conversationGoal ?? null,
  });

  const orientation = connections.knownFacts.length
    ? `Editing ${input.document.title}. We already know ${connections.knownFacts
        .slice(0, 2)
        .map((f) => f.replace(/^[^:]+:\s*/, ""))
        .join("; ")}.`
    : `Editing ${input.document.title}.`;

  return {
    sessionId: sid,
    document: input.document,
    versions: listDocumentVersions(input.document.documentId),
    connections,
    recommendations,
    returnState: {
      documentId: input.document.documentId,
      instanceId: input.document.instanceId,
      assetTypeId: input.document.assetTypeId,
      sectionId: connections.sectionId,
      version: input.document.version,
      lastOpenedAt: new Date().toISOString(),
    },
    capabilities: CONNECTED_ASSET_EDITOR_CAPABILITIES,
    orientation,
  };
}

/**
 * Save edits — bumps version, preserves history, updates readiness hooks.
 */
export function saveConnectedAsset(
  input: SaveConnectedAssetInput,
): ConnectedAssetEditorSession | null {
  const prior = getConnectedDocument(input.documentId);
  if (!prior) return null;

  appendDocumentVersion(prior, input.versionNote ?? "autosave");

  const blocks = input.blocks ?? prior.blocks;
  const plainText = input.plainText ?? plainTextFromBlocks(blocks);
  const next: ConnectedAssetDocument = {
    ...prior,
    title: input.title?.trim() || prior.title,
    blocks,
    plainText,
    status: input.status ?? prior.status,
    meta: input.meta ? { ...prior.meta, ...input.meta } : prior.meta,
    version: prior.version + 1,
    updatedAt: new Date().toISOString(),
  };
  upsertConnectedDocument(next);

  updateEventAssetInstance(prior.instanceId, {
    displayName: next.title,
    contentRef: `doc:${next.documentId}`,
    status:
      next.status === "approved"
        ? "approved"
        : next.status === "in_review"
          ? "in_review"
          : next.status === "archived"
            ? "archived"
            : "drafting",
  });

  computeCreationReadiness({
    creationId: next.creationRecordId,
  });

  const instance = getEventAssetInstance(next.instanceId);
  if (!instance) return null;

  return buildEditorSession({
    document: next,
    instance,
    conversationGoal: null,
  });
}

export function resumeConnectedAssetEditor(input: {
  documentId?: string | null;
  instanceId?: string | null;
  conversationGoal?: string | null;
}): ConnectedAssetEditorSession | null {
  const doc = input.documentId
    ? getConnectedDocument(input.documentId)
    : input.instanceId
      ? getConnectedDocumentByInstance(input.instanceId)
      : null;
  if (!doc) return null;

  const instance = getEventAssetInstance(doc.instanceId);
  if (!instance) return null;

  return buildEditorSession({
    document: doc,
    instance,
    conversationGoal: input.conversationGoal,
  });
}
