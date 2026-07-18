"use client";

import { useEffect, useState } from "react";
import {
  backLabelForFrame,
  buildStackBreadcrumb,
  getNavigationStack,
  peekNavigationFrame,
  subscribeNavigationStack,
  type NavigationBreadcrumbCrumb,
  type NavigationFrame,
  type NavigationStackState,
} from "@/lib/navigationContext";
import "@/app/companion/profile-return-bar.css";

type Props = {
  /** Hide when current surface matches this destination id. */
  currentDestination?: string | null;
  /** Pop one level (Back control). */
  onReturn: (frame: NavigationFrame) => void;
  /** Jump to breadcrumb index (clickable crumb). */
  onJumpToIndex?: (index: number, frame: NavigationFrame) => void;
};

/**
 * Universal return control + breadcrumb for destination / nested workflows.
 * Not mounted on Living Place glass.
 */
export function NavigationReturnBar({
  currentDestination,
  onReturn,
  onJumpToIndex,
}: Props) {
  const [state, setState] = useState<NavigationStackState>(() =>
    getNavigationStack(),
  );

  useEffect(() => {
    return subscribeNavigationStack(() => {
      setState(getNavigationStack());
    });
  }, []);

  const origin = state.frames[state.frames.length - 1] ?? null;
  if (!origin) return null;
  if (
    currentDestination &&
    currentDestination === origin.destinationId &&
    state.frames.length <= 1 &&
    !state.current
  ) {
    return null;
  }

  const label = backLabelForFrame(origin);
  const crumbs: NavigationBreadcrumbCrumb[] = buildStackBreadcrumb(state);

  return (
    <div
      className="profile-return-bar"
      data-testid="navigation-return-bar"
      role="region"
      aria-label={label}
    >
      <nav
        className="profile-return-bar__breadcrumb"
        aria-label="Navigation path"
        data-testid="navigation-return-breadcrumb"
      >
        {crumbs.map((crumb, index) => (
          <span key={crumb.id} className="profile-return-bar__crumb-wrap">
            {index > 0 ? (
              <span className="profile-return-bar__sep" aria-hidden="true">
                ›
              </span>
            ) : null}
            {crumb.clickable ? (
              <button
                type="button"
                className="profile-return-bar__crumb profile-return-bar__crumb--link"
                data-testid={`navigation-return-crumb-${crumb.stackIndex}`}
                onClick={() => {
                  const frame =
                    state.frames[crumb.stackIndex] ?? peekNavigationFrame();
                  if (!frame) return;
                  if (onJumpToIndex) onJumpToIndex(crumb.stackIndex, frame);
                  else onReturn(frame);
                }}
              >
                {crumb.label}
              </button>
            ) : (
              <span
                className="profile-return-bar__crumb"
                data-testid={`navigation-return-crumb-current`}
              >
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>
      <button
        type="button"
        className="profile-return-bar__button"
        data-testid="navigation-return-button"
        onClick={() => onReturn(origin)}
      >
        <span aria-hidden="true">←</span>
        <span>{label}</span>
      </button>
    </div>
  );
}

/** @deprecated Use NavigationReturnBar — Profile alias during migration. */
export { NavigationReturnBar as ProfileReturnBar };
