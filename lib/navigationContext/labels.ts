import { formatAppBackLabel } from "@/lib/navigationBackLabels";
import {
  type NavigationBreadcrumbCrumb,
  type NavigationFrame,
  type NavigationStackState,
} from "./types";

export { labelForDestinationId } from "./destinationLabels";

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
