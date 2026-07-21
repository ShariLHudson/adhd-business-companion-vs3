/**
 * 054 — Open or resume any Connected Asset through the shared editor pattern.
 */

import { resolveLargerCreation } from "@/lib/creationEcosystem";
import { addAssetToSection } from "@/lib/eventsIntelligence/eventCapabilityRegistry";
import {
  getActiveEventRecord,
  getEventRecord,
} from "@/lib/eventsIntelligence";
import {
  getEventAssetDefinition,
  getEventAssetInstance,
  updateEventAssetInstance,
} from "@/lib/eventsIntelligence/eventAssetRegistry";
import type { EventSectionId } from "@/lib/eventsIntelligence/types";
import { initialBlocksForAsset, plainTextFromBlocks } from "./contentBuilders";
import {
  createDocumentId,
  getConnectedDocumentByInstance,
  upsertConnectedDocument,
} from "./documentStore";
import { buildEditorSession } from "./editorSession";
import type {
  ConnectedAssetDocument,
  ConnectedAssetEditorSession,
  OpenConnectedAssetEditorInput,
} from "./types";

/**
 * Open a connected editor for any registered asset type.
 * Creates the instance (053 Add Asset) when needed, then attaches a versioned document.
 */
export function openConnectedAssetEditor(
  input: OpenConnectedAssetEditorInput,
): ConnectedAssetEditorSession | null {
  const def = getEventAssetDefinition(input.assetTypeId);
  if (!def) return null;

  const record =
    (input.eventRecordId ? getEventRecord(input.eventRecordId) : null) ??
    getActiveEventRecord();
  if (!record) return null;

  // Resume existing document by instance
  if (input.instanceId) {
    const existingDoc = getConnectedDocumentByInstance(input.instanceId);
    const instance = getEventAssetInstance(input.instanceId);
    if (existingDoc && instance) {
      return buildEditorSession({
        document: existingDoc,
        instance,
        conversationGoal: input.conversationGoal,
      });
    }
  }

  const sectionId =
    (input.sectionId as EventSectionId | undefined) ??
    (def.eventSections[0] as EventSectionId | undefined) ??
    "agenda";

  const receipt = addAssetToSection({
    record,
    sectionId,
    assetTypeId: input.assetTypeId,
    templateId: input.templateId,
    displayName: input.title,
    allowVariant: input.allowVariant,
  });

  if (!receipt.instance) return null;

  const existingDoc = getConnectedDocumentByInstance(receipt.instance.instanceId);
  if (existingDoc) {
    return buildEditorSession({
      document: existingDoc,
      instance: receipt.instance,
      conversationGoal: input.conversationGoal,
    });
  }

  const templateId =
    input.templateId ??
    (receipt.instance.contentRef?.startsWith("template:")
      ? receipt.instance.contentRef.replace(/^template:/, "")
      : null);

  const creation = resolveLargerCreation({
    eventRecordId: record.id,
    preferActiveEvent: true,
  });
  const blocks = initialBlocksForAsset({
    assetTypeId: input.assetTypeId,
    templateId,
  });
  const now = new Date().toISOString();
  const document: ConnectedAssetDocument = {
    documentId: createDocumentId(),
    instanceId: receipt.instance.instanceId,
    assetTypeId: input.assetTypeId,
    creationRecordId:
      creation?.creationId || record.canonicalWorkId || record.id,
    eventRecordId: record.id,
    workspaceId: receipt.creationWorkspaceId,
    projectHomeId: receipt.projectHomeId,
    title: input.title?.trim() || receipt.instance.displayName,
    blocks,
    plainText: plainTextFromBlocks(blocks),
    templateId,
    version: 1,
    status: "drafting",
    meta: {},
    createdAt: now,
    updatedAt: now,
  };

  upsertConnectedDocument(document);
  updateEventAssetInstance(receipt.instance.instanceId, {
    contentRef: `doc:${document.documentId}`,
  });

  const instance =
    getEventAssetInstance(receipt.instance.instanceId) ?? receipt.instance;

  return buildEditorSession({
    document,
    instance,
    conversationGoal: input.conversationGoal,
  });
}
