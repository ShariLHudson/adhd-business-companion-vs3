/**
 * Destination Gallery crystal activation.
 * Preference-aware launches via resolveCrystalLaunch; never legacy Create.
 * @see docs/estate/recognition/library/156_DESTINATION_GALLERY_ARCHITECTURE.md
 * @see Prompt 142 Destination Gallery & Connections Integration
 */

import {
  DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
  type DigitalWorkspacePreferences,
} from "@/lib/connections/digitalWorkspacePreferences";
import type { DestinationCrystalId } from "./constants";
import type { CrystalConnectionSnapshot } from "./crystalConnectionMapping";
import {
  crystalLaunchLeavesGallery,
  resolveCrystalLaunch,
  type CrystalLaunchKind,
  type CrystalLaunchPlan,
} from "./resolveCrystalLaunch";

export type CrystalActivationKind =
  | "open_calendar"
  | "open_external_url"
  | "prepared_document"
  | "prepared_store"
  | "prepared_share"
  | "prepared_print"
  | "needs_connection"
  | "unavailable"
  /** @deprecated Prefer needs_connection for Canva — kept for type narrowing */
  | "design_pending";

export type CrystalActivation = {
  crystalId: DestinationCrystalId;
  kind: CrystalActivationKind;
  /** Member-facing prepared title */
  title: string;
  /** Hospitality body copy for prepared states */
  body: string;
  externalUrl?: string | null;
  shouldOpenConnections?: boolean;
  preferenceLabel?: string;
};

export type ResolveCrystalActivationOptions = {
  connections?: CrystalConnectionSnapshot;
  preferences?: DigitalWorkspacePreferences;
  canvaDestinationUrl?: string | null;
};

const DEFAULT_CONNECTIONS: CrystalConnectionSnapshot = {
  google: { configured: true, connected: false, email: null },
  outlookConnected: false,
  canvaConnected: false,
};

function launchKindToActivationKind(
  kind: CrystalLaunchKind,
): CrystalActivationKind {
  return kind;
}

/** Resolve activation for a Destination Gallery crystal (preference-aware). */
export function resolveCrystalActivation(
  crystalId: DestinationCrystalId,
  options?: ResolveCrystalActivationOptions,
): CrystalActivation {
  const plan = resolveCrystalLaunch(crystalId, {
    connections: options?.connections ?? DEFAULT_CONNECTIONS,
    preferences: options?.preferences ?? DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
    canvaDestinationUrl: options?.canvaDestinationUrl ?? null,
  });
  return activationFromLaunchPlan(plan);
}

export function activationFromLaunchPlan(
  plan: CrystalLaunchPlan,
): CrystalActivation {
  return {
    crystalId: plan.crystalId,
    kind: launchKindToActivationKind(plan.kind),
    title: plan.title,
    body: plan.body,
    externalUrl: plan.externalUrl,
    shouldOpenConnections: plan.shouldOpenConnections,
    preferenceLabel: plan.preferenceLabel,
  };
}

/** Destinations that leave the gallery (navigate / external) vs stay prepared. */
export function crystalLeavesGallery(kind: CrystalActivationKind): boolean {
  if (kind === "design_pending") return false;
  return crystalLaunchLeavesGallery(kind as CrystalLaunchKind);
}

/** Guard: Design must never route to legacy Create / content-generator. */
export function isLegacyCreateForbidden(kind: CrystalActivationKind): boolean {
  return (
    kind === "design_pending" ||
    kind === "open_external_url" ||
    kind === "needs_connection" ||
    kind === "unavailable"
  );
}

/** Forbidden navigation targets for Destination Gallery. */
export const FORBIDDEN_CRYSTAL_TARGETS = [
  "content-generator",
  "evidence-vault",
  "saved-work",
  "momentum-appointments",
  "time-block",
] as const;
