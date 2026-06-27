import type { ResolvedScene } from "./types";

/** Signature Companion Objects render only when both ids are present. */
export function hasRenderableSignatureObject(
  scene: Pick<ResolvedScene, "signatureId" | "objectId">,
): scene is ResolvedScene & { signatureId: string; objectId: string } {
  return Boolean(scene.signatureId?.trim() && scene.objectId?.trim());
}
