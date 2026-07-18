import { formatAppBackLabel } from "@/lib/navigationBack";
import {
  DESTINATION_LABELS,
  type NavigationBreadcrumbCrumb,
  type NavigationFrame,
  type NavigationStackState,
} from "./types";

export function labelForDestinationId(destinationId: string): string {
  return DESTINATION_LABELS[destinationId] ?? destinationId;
}

export function backLabelForFrame(frame: NavigationFrame | null | undefined): string {
  if (!frame) return "Back";
  if (frame.meta?.setupActive === true) return "Continue Profile Setup";
  return formatAppBackLabel(frame.label);
}

export function buildStackBreadcrumb(
  state: NavigationStackState,
): NavigationBreadcrumbCrumb[] {
  const crumbs: NavigationBreadcrumbCrumb[] = state.frames.map((frame, index) => ({
    id: frame.id,
    label: frame.label,
    stackIndex: index,
    clickable: true,
  }));
  if (state.current) {
    crumbs.push({
      id: `current-${state.current.destinationId}`,
      label: state.current.label,
      stackIndex: state.frames.length,
      clickable: false,
    });
  }
  return crumbs;
}
