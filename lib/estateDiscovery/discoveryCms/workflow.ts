/**
 * Discovery CMS — editorial status workflow.
 */

import type { DiscoveryContentStatus } from "./types";

const ALLOWED_TRANSITIONS: Record<
  DiscoveryContentStatus,
  DiscoveryContentStatus[]
> = {
  Draft: ["Review", "Retired"],
  Review: ["Draft", "Approved", "Retired"],
  Approved: ["Review", "Live", "Retired"],
  Live: ["Hidden", "Retired"],
  Hidden: ["Live", "Retired"],
  Retired: [],
};

export function normalizeDiscoveryContentStatus(
  status: string,
): DiscoveryContentStatus | "Future" {
  if (status === "Future") return "Future";
  const allowed: DiscoveryContentStatus[] = [
    "Draft",
    "Review",
    "Approved",
    "Live",
    "Hidden",
    "Retired",
  ];
  if ((allowed as string[]).includes(status)) {
    return status as DiscoveryContentStatus;
  }
  return "Draft";
}

/** Legacy Future → Draft for workflow purposes */
export function editorialStatus(
  status: string,
): DiscoveryContentStatus {
  const normalized = normalizeDiscoveryContentStatus(status);
  if (normalized === "Future") return "Draft";
  return normalized;
}

export function canTransitionDiscoveryStatus(
  from: string,
  to: DiscoveryContentStatus,
): boolean {
  const fromStatus = editorialStatus(from);
  return ALLOWED_TRANSITIONS[fromStatus].includes(to);
}

export function isMemberFacingDiscoveryStatus(status: string): boolean {
  return editorialStatus(status) === "Live";
}

export function groupDiscoveriesByStatus<T extends { status: string }>(
  records: T[],
): Record<DiscoveryContentStatus, T[]> {
  const groups: Record<DiscoveryContentStatus, T[]> = {
    Draft: [],
    Review: [],
    Approved: [],
    Live: [],
    Hidden: [],
    Retired: [],
  };

  for (const record of records) {
    const key = editorialStatus(record.status);
    groups[key].push(record);
  }

  return groups;
}
