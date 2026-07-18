/**
 * Helpers for pushing leave frames from Companion destinations.
 */

import { pushNavigationFrame, setNavigationCurrent } from "./stack";
import { labelForDestinationId } from "./labels";
import type { NavigationFrame, NavigationFrameKind } from "./types";

export type CaptureLeaveInput = {
  /** Destination being left (origin). */
  fromDestinationId: string;
  fromLabel?: string;
  fromKind?: NavigationFrameKind;
  tab?: string;
  section?: string;
  accordion?: string;
  selectedId?: string;
  scrollY?: number;
  editingFieldId?: string;
  filters?: string;
  sort?: string;
  search?: string;
  meta?: NavigationFrame["meta"];
  /** Destination being opened. */
  toDestinationId: string;
  toLabel?: string;
  toKind?: NavigationFrameKind;
};

/** Push origin frame + set current opened surface. */
export function captureNavigationLeave(input: CaptureLeaveInput): void {
  pushNavigationFrame({
    destinationId: input.fromDestinationId,
    label: input.fromLabel ?? labelForDestinationId(input.fromDestinationId),
    kind: input.fromKind ?? "destination",
    tab: input.tab,
    section: input.section,
    accordion: input.accordion,
    selectedId: input.selectedId,
    scrollY: input.scrollY,
    editingFieldId: input.editingFieldId,
    filters: input.filters,
    sort: input.sort,
    search: input.search,
    meta: input.meta,
  });
  setNavigationCurrent({
    destinationId: input.toDestinationId,
    label: input.toLabel ?? labelForDestinationId(input.toDestinationId),
    kind: input.toKind ?? "destination",
  });
}

/** Push a nested frame within the same destination family (Projects › Project › Task). */
export function pushNestedNavigationFrame(input: {
  destinationId: string;
  label: string;
  selectedId?: string;
  scrollY?: number;
  section?: string;
  meta?: NavigationFrame["meta"];
  currentLabel?: string;
  currentDestinationId?: string;
}): void {
  pushNavigationFrame({
    destinationId: input.destinationId,
    label: input.label,
    kind: "nested",
    selectedId: input.selectedId,
    scrollY: input.scrollY,
    section: input.section,
    meta: input.meta,
  });
  if (input.currentDestinationId) {
    setNavigationCurrent({
      destinationId: input.currentDestinationId,
      label: input.currentLabel ?? input.label,
      kind: "nested",
    });
  }
}
