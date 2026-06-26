/**
 * Signature Companion Objects™ — permanent visual language of the Homestead.
 * @see docs/companion-homestead/SIGNATURE_COMPANION_OBJECTS.md
 */

export {
  SIGNATURE_FORM_SIZE_PX,
  SIGNATURE_OBJECT_FORMS,
  SIGNATURE_ROOM_META,
  SIGNATURE_ROOM_ZONES,
  type SignatureCompanionObject,
  type SignatureObjectForm,
  type SignatureRoomMeta,
  type SignatureRoomZone,
} from "./types";

export {
  BUSINESS_SIGNATURES,
  CLEAR_MY_MIND_SIGNATURES,
  CREATIVE_STUDIO_SIGNATURES,
  KINSEY_SIGNATURES,
  KITCHEN_SIGNATURES,
  LIVING_ROOM_SIGNATURES,
  NATURE_SIGNATURES,
  PLANNING_TABLE_SIGNATURES,
  READING_NOOK_SIGNATURES,
  SIGNATURE_COMPANION_OBJECTS,
  SIGNATURE_OBJECTS_BY_ROOM,
} from "./roomCatalog";

export {
  assertWorkspaceSignatureObject,
  primarySignatureForRoom,
  resolveSignatureVisualSpec,
  roomMetaById,
  roomMetaForWorkspace,
  signatureForCatalogObjectId,
  signatureForFeatureObjectId,
  signatureObjectById,
  signatureRegistrySummary,
  signaturesForRoom,
  sizeForSignatureForm,
  workspaceHasSignatureObject,
  type SignatureVisualSpec,
} from "./resolve";
