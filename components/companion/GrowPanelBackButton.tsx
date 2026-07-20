"use client";

import {
  BACK_TO_ESTATE,
  formatAppBackLabel,
  isEstateHomeDestination,
} from "@/lib/navigationBackLabels";

type Props = {
  onBack: () => void;
  label?: string;
};

export function GrowPanelBackButton({ onBack, label = "Grow" }: Props) {
  const visibleLabel = isEstateHomeDestination(label)
    ? BACK_TO_ESTATE
    : label;
  const ariaLabel = isEstateHomeDestination(label)
    ? BACK_TO_ESTATE
    : formatAppBackLabel(label ?? "Grow");

  return (
    <button
      type="button"
      className="journal-room__back grow-room__back"
      onClick={onBack}
      data-testid="grow-panel-back"
      aria-label={ariaLabel}
    >
      ← {visibleLabel}
    </button>
  );
}
