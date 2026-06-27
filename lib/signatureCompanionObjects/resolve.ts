/**
 * Signature Companion Objects — form resolution and registry API.
 */

import type { CompanionObjectSize } from "@/components/companion/CompanionObjectVisual";
import { designerStoryForObjectId } from "@/lib/companionObjectsDesignSystem";
import {
  SIGNATURE_COMPANION_OBJECTS,
  SIGNATURE_OBJECTS_BY_ROOM,
} from "./roomCatalog";
import type {
  SignatureCompanionObject,
  SignatureObjectForm,
  SignatureRoomMeta,
  SignatureRoomZone,
} from "./types";
import { SIGNATURE_FORM_SIZE_PX, SIGNATURE_ROOM_META } from "./types";

export type SignatureVisualSpec = {
  form: SignatureObjectForm;
  size: CompanionObjectSize;
  variant: "icon" | "mini-scene";
  animate: boolean;
  catalogObjectId: string;
  featureObjectId: string | null;
  designerStory: string | undefined;
};

export function resolveSignatureVisualSpec(
  signature: SignatureCompanionObject,
  form: SignatureObjectForm = "navigation",
): SignatureVisualSpec {
  const size = sizeForSignatureForm(form);
  const variant = form === "navigation" ? "icon" : "mini-scene";
  const objectId = signature.featureObjectId ?? signature.catalogObjectId;

  return {
    form,
    size,
    variant,
    animate: Boolean(signature.animation) && form !== "navigation",
    catalogObjectId: signature.catalogObjectId,
    featureObjectId: signature.featureObjectId ?? null,
    designerStory: designerStoryForObjectId(signature.catalogObjectId),
  };
}

export function sizeForSignatureForm(
  form: SignatureObjectForm,
): CompanionObjectSize {
  switch (form) {
    case "navigation":
      return "sm";
    case "feature":
      return "card";
    case "environmental":
      return "hero";
    default:
      return "sm";
  }
}

export function signatureObjectById(
  id: string,
): SignatureCompanionObject | undefined {
  return SIGNATURE_COMPANION_OBJECTS.find((s) => s.id === id);
}

export function signaturesForRoom(
  room: SignatureRoomZone,
): SignatureCompanionObject[] {
  return SIGNATURE_OBJECTS_BY_ROOM[room];
}

export function primarySignatureForRoom(
  room: SignatureRoomZone,
): SignatureCompanionObject | undefined {
  return signaturesForRoom(room).find((s) => s.isPrimary);
}

export function signatureForFeatureObjectId(
  featureObjectId: string,
): SignatureCompanionObject | undefined {
  return SIGNATURE_COMPANION_OBJECTS.find(
    (s) => s.featureObjectId === featureObjectId,
  );
}

export function signatureForCatalogObjectId(
  catalogObjectId: string,
): SignatureCompanionObject | undefined {
  return SIGNATURE_COMPANION_OBJECTS.find(
    (s) => s.catalogObjectId === catalogObjectId,
  );
}

export function roomMetaById(id: SignatureRoomZone): SignatureRoomMeta {
  return SIGNATURE_ROOM_META.find((r) => r.id === id)!;
}

export function roomMetaForWorkspace(
  workspaceId: string,
): SignatureRoomMeta | undefined {
  return SIGNATURE_ROOM_META.find((r) => r.workspaceId === workspaceId);
}

/** Constitutional gate — workspace has a signature via room catalog or object registry. */
export function workspaceHasSignatureObject(workspaceId: string): boolean {
  if (signatureForFeatureObjectId(workspaceId)) return true;
  const room = roomMetaForWorkspace(workspaceId);
  if (room && primarySignatureForRoom(room.id)) return true;
  return false;
}

export function assertWorkspaceSignatureObject(workspaceId: string): void {
  if (!workspaceHasSignatureObject(workspaceId)) {
    throw new Error(
      `Signature Companion Objects: workspace "${workspaceId}" has no Signature Object. ` +
        `Every feature must answer: What is its Signature Companion Object?`,
    );
  }
}

export function signatureRegistrySummary() {
  const byRoom = Object.fromEntries(
    (Object.keys(SIGNATURE_OBJECTS_BY_ROOM) as SignatureRoomZone[]).map(
      (room) => [room, signaturesForRoom(room).length],
    ),
  ) as Record<SignatureRoomZone, number>;

  return {
    total: SIGNATURE_COMPANION_OBJECTS.length,
    byRoom,
    withFeatureLink: SIGNATURE_COMPANION_OBJECTS.filter((s) => s.featureObjectId)
      .length,
    withAnimation: SIGNATURE_COMPANION_OBJECTS.filter((s) => s.animation).length,
    formSizes: SIGNATURE_FORM_SIZE_PX,
  };
}
