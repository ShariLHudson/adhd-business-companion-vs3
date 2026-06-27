"use client";

import { AppBackButton } from "@/components/companion/AppBackButton";
import { NAV_HOME, normalizeBackDestination } from "@/lib/navigationBack";

type BackButtonProps = {
  onClick: () => void;
  /** Destination name or legacy full label. Defaults to Home. */
  label?: string;
  className?: string;
  size?: "default" | "compact";
};

/**
 * @deprecated Prefer AppBackButton with an explicit destination.
 * Wraps AppBackButton for legacy call sites.
 */
export function BackButton({
  onClick,
  label = NAV_HOME,
  className = "",
  size = "default",
}: BackButtonProps) {
  const destination =
    !label || label === "Back" ? NAV_HOME : normalizeBackDestination(label);

  return (
    <AppBackButton
      destination={destination}
      onBack={onClick}
      className={className}
      size={size}
    />
  );
}
