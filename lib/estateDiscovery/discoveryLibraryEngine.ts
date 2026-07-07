/**
 * Discovery Library Engine™ — validate discovery records against Estate Knowledge Base™.
 */

import { validateDiscoveryForLive } from "./discoveryCms/validation";
import { isMemberFacingDiscoveryStatus } from "./discoveryCms/workflow";
import { resolveRegistryNavigationRoute } from "./estateIntelligenceLoader";
import type { DiscoveryCmsRecord } from "./discoveryCms/types";
import type { DiscoveryLibraryItem } from "./types";

export type DiscoveryValidationResult =
  | { valid: true; item: DiscoveryLibraryItem; resolvedRoute: string | null }
  | { valid: false; reason: string };

export function validateDiscoveryRecord(
  item: DiscoveryLibraryItem,
): DiscoveryValidationResult {
  if (!isMemberFacingDiscoveryStatus(item.status)) {
    return { valid: false, reason: "not-live" };
  }

  const cmsResult = validateDiscoveryForLive(item as DiscoveryCmsRecord);
  if (!cmsResult.valid) {
    const firstError = cmsResult.issues.find((issue) => issue.severity === "error");
    return { valid: false, reason: firstError?.code ?? "validation-failed" };
  }

  const registryRoute = resolveRegistryNavigationRoute(
    item.targetRegistry,
    item.targetId,
  );

  const resolvedRoute =
    item.destinationRoute ??
    (item.destinationType ? registryRoute : null);

  return {
    valid: true,
    item,
    resolvedRoute,
  };
}

export function isDiscoveryRecordEligible(
  item: DiscoveryLibraryItem,
): boolean {
  return validateDiscoveryRecord(item).valid;
}
