"use client";

import { AppBackButton } from "@/components/companion/AppBackButton";
import { NAV_CHAT } from "@/lib/navigationBack";

/** @deprecated Use AppBackButton directly. */
export function GrowthPanelBackButton({
  onBack,
  label,
}: {
  onBack: () => void;
  label?: string | null;
}) {
  return (
    <AppBackButton
      destination={label ?? NAV_CHAT}
      onBack={onBack}
      size="compact"
    />
  );
}
