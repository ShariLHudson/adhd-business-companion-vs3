/**
 * 054 — Connected Asset Editor Framework
 * One pattern. Many asset types. One connected result.
 */

export {
  CONNECTED_ASSET_EDITOR_CAPABILITIES,
  type ConnectedAssetEditorCapability,
  type ConnectedAssetBlock,
  type ConnectedAssetDocument,
  type ConnectedAssetVersion,
  type ConnectedAssetConnectionBundle,
  type ConnectedAssetEditorSession,
  type ConnectedAssetReturnState,
  type OpenConnectedAssetEditorInput,
  type SaveConnectedAssetInput,
} from "./types";

export {
  listConnectedDocuments,
  getConnectedDocument,
  getConnectedDocumentByInstance,
  listDocumentVersions,
  clearConnectedAssetEditorForTests,
} from "./documentStore";

export {
  blocksFromOutline,
  blocksFromPlainText,
  plainTextFromBlocks,
  initialBlocksForAsset,
} from "./contentBuilders";

export { assembleConnectionBundle } from "./connectionBundle";

export {
  buildEditorSession,
  saveConnectedAsset,
  resumeConnectedAssetEditor,
} from "./editorSession";

export { openConnectedAssetEditor } from "./openConnectedAssetEditor";

export {
  openAgendaEditor,
  resumeAgendaEditor,
  saveAgendaBlocks,
  agendaEditorProvesFramework,
} from "./agendaAdapter";
