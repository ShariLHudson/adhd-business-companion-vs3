"use client";

import { FOCUS_FEELING_ENTRIES, type FocusFeelingId, type FocusHubAction } from "@/lib/focusHub";
import { FocusDestinationPlaque } from "@/components/companion/FocusDestinationPlaque";

const DOCK_ALIGN: Record<FocusFeelingId, "left" | "right"> = {
  stuck: "left",
  "need-break": "right",
};

type Props = {
  expandedFeeling: FocusFeelingId | null;
  onToggleFeeling: (id: FocusFeelingId) => void;
  onSelectTool: (action: FocusHubAction) => void;
};

/** Cinematic bottom terrace — two destination plaques at the fork in the path. */
export function FocusConservatoryDock({
  expandedFeeling,
  onToggleFeeling,
  onSelectTool,
}: Props) {
  return (
    <div className="focus-conservatory-dock" data-testid="focus-area-panel">
      <div className="focus-brain-menu-bar">
        <div className="focus-brain-menu">
          {FOCUS_FEELING_ENTRIES.map((feeling) => (
            <FocusDestinationPlaque
              key={feeling.id}
              feelingId={feeling.id}
              align={DOCK_ALIGN[feeling.id]}
              expanded={expandedFeeling === feeling.id}
              onToggle={() => onToggleFeeling(feeling.id)}
              onSelectTool={onSelectTool}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
