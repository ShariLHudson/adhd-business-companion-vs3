/**
 * Destination Gallery crystal activation (pass 1).
 * Safe routes only — no legacy Create / content-generator / Evidence Vault / Saved Work substitutes.
 * @see docs/estate/recognition/library/156_DESTINATION_GALLERY_ARCHITECTURE.md
 */

import type { DestinationCrystalId } from "./constants";

export type CrystalActivationKind =
  | "open_calendar"
  | "prepared_document"
  | "prepared_store"
  | "prepared_share"
  | "prepared_print"
  | "design_pending";

export type CrystalActivation = {
  crystalId: DestinationCrystalId;
  kind: CrystalActivationKind;
  /** Member-facing prepared title */
  title: string;
  /** Hospitality body copy for prepared states */
  body: string;
};

const ACTIVATIONS: Record<DestinationCrystalId, CrystalActivation> = {
  schedule: {
    crystalId: "schedule",
    kind: "open_calendar",
    title: "Schedule",
    body: "Opening your Calendar so we can place this work on your day.",
  },
  write: {
    crystalId: "write",
    kind: "prepared_document",
    title: "Document",
    body: "When you're ready, Spark can send written work to Google Docs. Nothing leaves until you choose.",
  },
  save: {
    crystalId: "save",
    kind: "prepared_store",
    title: "Store",
    body: "Spark can keep files in Google Drive when your Drive connection is ready. We won't open Drive as a place to browse.",
  },
  "spark-social-media": {
    crystalId: "spark-social-media",
    kind: "prepared_share",
    title: "Share",
    body: "I'll prepare this for sharing. Nothing is published — you approve before anything goes live.",
  },
  print: {
    crystalId: "print",
    kind: "prepared_print",
    title: "Print",
    body: "We can print or download a copy from here when there's something ready to send.",
  },
  create: {
    crystalId: "create",
    kind: "design_pending",
    title: "Design",
    body: "Design connection is being prepared.",
  },
};

/** Resolve the pass-1 activation for a Destination Gallery crystal. */
export function resolveCrystalActivation(
  crystalId: DestinationCrystalId,
): CrystalActivation {
  return ACTIVATIONS[crystalId];
}

/** Destinations that leave the gallery (navigate) vs stay in a prepared state. */
export function crystalLeavesGallery(kind: CrystalActivationKind): boolean {
  return kind === "open_calendar";
}

/** Guard: Design must never route to legacy Create / content-generator. */
export function isLegacyCreateForbidden(kind: CrystalActivationKind): boolean {
  return kind === "design_pending";
}

/** Forbidden navigation targets for Destination Gallery pass 1. */
export const FORBIDDEN_CRYSTAL_TARGETS = [
  "content-generator",
  "evidence-vault",
  "saved-work",
  "momentum-appointments",
  "time-block",
] as const;
