/**
 * 054 — Connected document + version persistence.
 */

import type {
  ConnectedAssetDocument,
  ConnectedAssetVersion,
} from "./types";

const DOC_KEY = "companion-connected-asset-docs-v1";
const VER_KEY = "companion-connected-asset-versions-v1";
const ACTIVE_KEY = "companion-connected-asset-active-session";

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function readJson<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJson<T>(key: string, rows: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(rows));
  } catch {
    /* quota */
  }
}

export function createDocumentId(): string {
  return newId("cad");
}

export function listConnectedDocuments(
  creationRecordId?: string,
): ConnectedAssetDocument[] {
  const all = readJson<ConnectedAssetDocument>(DOC_KEY);
  return creationRecordId
    ? all.filter((d) => d.creationRecordId === creationRecordId)
    : all;
}

export function getConnectedDocument(
  documentId: string,
): ConnectedAssetDocument | null {
  return readJson<ConnectedAssetDocument>(DOC_KEY).find(
    (d) => d.documentId === documentId,
  ) ?? null;
}

export function getConnectedDocumentByInstance(
  instanceId: string,
): ConnectedAssetDocument | null {
  return (
    readJson<ConnectedAssetDocument>(DOC_KEY).find(
      (d) => d.instanceId === instanceId,
    ) ?? null
  );
}

export function upsertConnectedDocument(
  doc: ConnectedAssetDocument,
): ConnectedAssetDocument {
  const all = readJson<ConnectedAssetDocument>(DOC_KEY);
  const next = [doc, ...all.filter((d) => d.documentId !== doc.documentId)];
  writeJson(DOC_KEY, next);
  return doc;
}

export function listDocumentVersions(
  documentId: string,
): ConnectedAssetVersion[] {
  return readJson<ConnectedAssetVersion>(VER_KEY)
    .filter((v) => v.documentId === documentId)
    .sort((a, b) => b.version - a.version);
}

export function appendDocumentVersion(
  doc: ConnectedAssetDocument,
  note?: string,
): ConnectedAssetVersion {
  const version: ConnectedAssetVersion = {
    versionId: newId("cav"),
    documentId: doc.documentId,
    version: doc.version,
    title: doc.title,
    blocks: doc.blocks.map((b) => ({ ...b })),
    plainText: doc.plainText,
    savedAt: new Date().toISOString(),
    note,
  };
  writeJson(VER_KEY, [version, ...readJson<ConnectedAssetVersion>(VER_KEY)]);
  return version;
}

export function setActiveEditorSessionId(sessionId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!sessionId) localStorage.removeItem(ACTIVE_KEY);
    else localStorage.setItem(ACTIVE_KEY, sessionId);
  } catch {
    /* quota */
  }
}

export function getActiveEditorSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

const SESSION_KEY = "companion-connected-asset-sessions-v1";

export type StoredEditorSession = {
  sessionId: string;
  documentId: string;
  openedAt: string;
  conversationGoal: string | null;
};

export function storeEditorSession(session: StoredEditorSession): void {
  const all = readJson<StoredEditorSession>(SESSION_KEY);
  writeJson(SESSION_KEY, [
    session,
    ...all.filter((s) => s.sessionId !== session.sessionId),
  ]);
  setActiveEditorSessionId(session.sessionId);
}

export function getStoredEditorSession(
  sessionId: string,
): StoredEditorSession | null {
  return (
    readJson<StoredEditorSession>(SESSION_KEY).find(
      (s) => s.sessionId === sessionId,
    ) ?? null
  );
}

export function clearConnectedAssetEditorForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DOC_KEY);
  localStorage.removeItem(VER_KEY);
  localStorage.removeItem(ACTIVE_KEY);
  localStorage.removeItem(SESSION_KEY);
}
