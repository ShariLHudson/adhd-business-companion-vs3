"use client";

import type { ComponentProps } from "react";
import { StrategiesPanel } from "@/components/companion/StrategiesPanel";
import { StrategyLibraryRoomShell } from "@/components/companion/StrategyLibraryRoomShell";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";
import { useDismissibleWindow } from "@/lib/windowDismiss";

type StrategiesPanelProps = ComponentProps<typeof StrategiesPanel>;

type Props = {
  onBack: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
} & Omit<StrategiesPanelProps, "presentation" | "registerBack">;

/**
 * Guidance → Strategy Chamber (destination id: strategy-library).
 * Owns room shell, dismiss contract, and estate presentation flag.
 * StrategiesPanel owns inward Back (detail → list → home → exit).
 */
export function StrategyLibraryEstatePanel({
  onBack,
  registerBack,
  ...panelProps
}: Props) {
  useDismissibleWindow({
    open: true,
    onClose: onBack,
    closeOnEscape: true,
  });

  return (
    <StrategyLibraryRoomShell onOutsideDismiss={onBack}>
      <div
        className="plan-day-morning-note flex flex-col gap-3 pb-10"
        data-testid="strategy-library-estate-panel"
        data-estate-destination="strategy-library"
      >
        <button
          type="button"
          className="plan-day-morning-note__previous"
          onClick={onBack}
          data-testid="strategy-library-previous-screen"
          aria-label="Previous Screen"
        >
          <span aria-hidden="true">←</span>
          <span>{PLAN_MY_DAY_MORNING_COPY.previousScreen}</span>
        </button>

        <StrategiesPanel
          {...panelProps}
          presentation="estate"
          registerBack={registerBack}
        />
      </div>
    </StrategyLibraryRoomShell>
  );
}
