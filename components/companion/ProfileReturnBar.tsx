"use client";

import { useEffect, useState } from "react";
import {
  getNavigationOrigin,
  subscribeNavigationOrigin,
  type NavigationOriginContext,
} from "@/lib/navigationOrigin";
import "@/app/companion/profile-return-bar.css";

type Props = {
  /** Current destination id — hide bar when already on the origin route. */
  currentDestination?: string | null;
  onReturn: (origin: NavigationOriginContext) => void;
};

/**
 * Visible Return-to-Profile control for destinations opened from Profile.
 * Not browser-back — restores the stored origin context.
 */
export function ProfileReturnBar({ currentDestination, onReturn }: Props) {
  const [origin, setOrigin] = useState<NavigationOriginContext | null>(() =>
    getNavigationOrigin(),
  );

  useEffect(() => {
    return subscribeNavigationOrigin(() => {
      setOrigin(getNavigationOrigin());
    });
  }, []);

  if (!origin) return null;
  if (
    currentDestination &&
    currentDestination === origin.originRoute
  ) {
    return null;
  }

  const label = origin.returnLabel ?? "Return to My Profile";

  return (
    <div
      className="profile-return-bar"
      data-testid="profile-return-bar"
      role="region"
      aria-label={label}
    >
      <button
        type="button"
        className="profile-return-bar__button"
        data-testid="profile-return-button"
        onClick={() => onReturn(origin)}
      >
        <span aria-hidden="true">←</span>
        <span>{label}</span>
      </button>
    </div>
  );
}
