/**
 * Artifact-aware Destination Gallery crystals.
 * Intelligent destination filtering underneath; painted crystal experience on top.
 *
 * @see lib/artifactDestinations/
 * @see docs/estate/recognition/library/156_DESTINATION_GALLERY_ARCHITECTURE.md
 */

import {
  classifyArtifactFamily,
  destinationCapabilitiesForArtifact,
  type ArtifactDestinationDef,
  type ArtifactDestinationId,
  type ArtifactFamily,
} from "@/lib/artifactDestinations";
import type { DestinationCrystalId } from "./constants";
import { DESTINATION_CRYSTAL_HIT_AREAS, type CrystalHitArea } from "./crystalLayout";

/** Member-visible crystal runtime states (Architecture + Create destination UX). */
export type ArtifactCrystalVisualState =
  | "connected"
  | "needs_connection"
  | "temporarily_unavailable"
  | "processing"
  | "completed"
  | "failed";

export type ArtifactDestinationCrystalOffer = {
  /** Stable key for React / tests — destination id */
  offerId: ArtifactDestinationId;
  destinationId: ArtifactDestinationId;
  label: string;
  purpose: string;
  /** Painted pillar slot hosting this destination crystal */
  slotId: DestinationCrystalId;
  hitArea: CrystalHitArea;
  state: ArtifactCrystalVisualState;
  /** Honest status line for aria / whisper (not a software dashboard). */
  statusHint: string;
};

export type ArtifactCrystalConnectionContext = {
  googleConfigured?: boolean;
  googleConnected?: boolean;
  outlookConnected?: boolean;
  canvaConnected?: boolean;
  printSupported?: boolean;
};

/** Overflow when preferred pillar is taken — avoid parking Docs on Schedule. */
const OVERFLOW_SLOT_ORDER: readonly DestinationCrystalId[] = [
  "save",
  "write",
  "create",
  "spark-social-media",
  "schedule",
  "print",
];

/** Prefer semantic pillars when free; otherwise OVERFLOW_SLOT_ORDER. */
const PREFERRED_SLOT: Readonly<
  Partial<Record<ArtifactDestinationId, DestinationCrystalId>>
> = {
  "google-calendar": "schedule",
  "outlook-calendar": "schedule",
  "google-docs": "write",
  "google-sheets": "write",
  "google-forms": "write",
  "microsoft-word": "save",
  "microsoft-excel": "save",
  csv: "spark-social-media",
  pdf: "create",
  download: "spark-social-media",
  markdown: "create",
  print: "print",
  canva: "create",
  powerpoint: "create",
};

/** Destinations that appear as crystals (not utility buttons). */
const CRYSTAL_DESTINATION_IDS = new Set<ArtifactDestinationId>([
  "google-docs",
  "google-sheets",
  "google-forms",
  "google-calendar",
  "microsoft-word",
  "microsoft-excel",
  "outlook-calendar",
  "canva",
  "powerpoint",
  "pdf",
  "csv",
  "print",
  "download",
]);

const PURPOSE: Readonly<Partial<Record<ArtifactDestinationId, string>>> = {
  "google-docs": "Send this as a Google Doc.",
  "google-sheets": "Send this as a Google Sheet.",
  "google-forms": "Send this as a Google Form.",
  "google-calendar": "Place this on Google Calendar.",
  "outlook-calendar": "Place this on Outlook Calendar.",
  "microsoft-word": "Download a Word document.",
  "microsoft-excel": "Download an Excel-friendly file.",
  csv: "Download a CSV file.",
  pdf: "Download a PDF.",
  print: "Prepare a printable version.",
  download: "Download this work.",
  canva: "Open your Canva destination.",
  powerpoint: "Download a presentation-friendly file.",
};

function hitAreaForSlot(slotId: DestinationCrystalId): CrystalHitArea {
  const area = DESTINATION_CRYSTAL_HIT_AREAS.find((a) => a.id === slotId);
  if (!area) {
    throw new Error(`Missing crystal hit area for slot ${slotId}`);
  }
  return area;
}

function includeDestinationAsCrystal(
  def: ArtifactDestinationDef,
  family: ArtifactFamily,
): boolean {
  if (!CRYSTAL_DESTINATION_IDS.has(def.id)) return false;
  // Spreadsheet / calendar / presentation already offer format crystals.
  if (
    def.id === "download" &&
    (family === "spreadsheet" ||
      family === "calendar" ||
      family === "presentation")
  ) {
    return false;
  }
  return true;
}

function assignSlots(
  defs: readonly ArtifactDestinationDef[],
  family: ArtifactFamily,
): Array<{ def: ArtifactDestinationDef; slotId: DestinationCrystalId }> {
  const used = new Set<DestinationCrystalId>();
  const placed = new Map<ArtifactDestinationId, DestinationCrystalId>();
  const pending: ArtifactDestinationDef[] = [];

  for (const def of defs) {
    if (!includeDestinationAsCrystal(def, family)) continue;
    const preferred = PREFERRED_SLOT[def.id];
    if (preferred && !used.has(preferred)) {
      used.add(preferred);
      placed.set(def.id, preferred);
    } else {
      pending.push(def);
    }
  }

  for (const def of pending) {
    const slotId = OVERFLOW_SLOT_ORDER.find((s) => !used.has(s));
    if (!slotId) break;
    used.add(slotId);
    placed.set(def.id, slotId);
  }

  const ordered: Array<{
    def: ArtifactDestinationDef;
    slotId: DestinationCrystalId;
  }> = [];
  for (const def of defs) {
    const slotId = placed.get(def.id);
    if (slotId) ordered.push({ def, slotId });
  }
  return ordered;
}

function resolveInitialState(
  def: ArtifactDestinationDef,
  ctx: ArtifactCrystalConnectionContext,
): { state: ArtifactCrystalVisualState; statusHint: string } {
  const googleConfigured = ctx.googleConfigured !== false;
  const googleConnected = ctx.googleConnected === true;
  const outlookConnected = ctx.outlookConnected === true;
  const canvaConnected = ctx.canvaConnected === true;
  const printSupported = ctx.printSupported !== false;

  if (def.id === "print") {
    if (!printSupported) {
      return {
        state: "temporarily_unavailable",
        statusHint: "Print isn’t available here right now.",
      };
    }
    return {
      state: "connected",
      statusHint: "Ready to print",
    };
  }

  if (def.requires === "google") {
    if (!googleConfigured) {
      return {
        state: "temporarily_unavailable",
        statusHint: "Google isn’t available here right now.",
      };
    }
    if (!googleConnected) {
      return {
        state: "needs_connection",
        statusHint: "Connect Google to use this destination",
      };
    }
    return { state: "connected", statusHint: "Connected and available" };
  }

  if (def.requires === "outlook") {
    if (!outlookConnected) {
      return {
        state: "needs_connection",
        statusHint: "Connect Outlook to use this destination",
      };
    }
    return { state: "connected", statusHint: "Connected and available" };
  }

  if (def.requires === "canva") {
    if (!canvaConnected) {
      return {
        state: "needs_connection",
        statusHint: "Connect Canva to use this destination",
      };
    }
    return { state: "connected", statusHint: "Connected and available" };
  }

  // Local destinations (PDF, Download, Word, Excel, CSV, PowerPoint)
  return { state: "connected", statusHint: "Ready" };
}

/**
 * Build crystal offers for the current artifact.
 * Incompatible destinations are omitted — connection alone never surfaces them.
 */
export function resolveArtifactDestinationCrystalOffers(
  artifactType: string | null | undefined,
  content = "",
  ctx: ArtifactCrystalConnectionContext = {},
): ArtifactDestinationCrystalOffer[] {
  const family = classifyArtifactFamily(artifactType, content);
  const caps = destinationCapabilitiesForArtifact(artifactType, content);
  return assignSlots(caps.destinations, family).map(({ def, slotId }) => {
    const { state, statusHint } = resolveInitialState(def, ctx);
    return {
      offerId: def.id,
      destinationId: def.id,
      label: def.label,
      purpose: PURPOSE[def.id] ?? `Send this to ${def.label}.`,
      slotId,
      hitArea: hitAreaForSlot(slotId),
      state,
      statusHint,
    };
  });
}

export function crystalOfferAriaLabel(
  offer: ArtifactDestinationCrystalOffer,
): string {
  const statePart =
    offer.state === "needs_connection"
      ? " — connection needed"
      : offer.state === "temporarily_unavailable"
        ? " — temporarily unavailable"
        : offer.state === "failed"
          ? " — failed, retry available"
          : offer.state === "processing"
            ? " — working"
            : offer.state === "completed"
              ? " — completed"
              : "";
  return `Open ${offer.label} destination${statePart}`;
}

/** Destinations the gallery may host on painted pillars (max 6). */
export function crystalDestinationIdsForArtifact(
  artifactType: string | null | undefined,
  content = "",
): ArtifactDestinationId[] {
  return resolveArtifactDestinationCrystalOffers(artifactType, content).map(
    (o) => o.destinationId,
  );
}
