"use client";

import type { ReactNode } from "react";
import { GardenFlagStake } from "./GardenFlagStake";
import { PATHWAY_GARDEN_STAKES, type EstateSignId } from "@/lib/peacefulPlaces/signpostLayout";

type Props = {
  openSign: EstateSignId | null;
  hoveredSign: EstateSignId | null;
  selectedSign: EstateSignId | null;
  onHoverSign: (id: EstateSignId | null) => void;
  onToggleSign: (id: EstateSignId) => void;
  onMenuPointerEnter?: () => void;
  onMenuPointerLeave?: () => void;
  renderDestinationMenu: (moodId: EstateSignId) => ReactNode;
};

/** Garden flag stakes staggered along the pathway curb in perspective depth. */
export function PathwayEstateSignposts({
  openSign,
  hoveredSign,
  selectedSign,
  onHoverSign,
  onToggleSign,
  onMenuPointerEnter,
  onMenuPointerLeave,
  renderDestinationMenu,
}: Props) {
  return (
    <div
      className="peaceful-places-pathway-scene__signposts"
      data-pathway-signposts="garden-stakes"
    >
      {PATHWAY_GARDEN_STAKES.map((stake) => (
        <div
          key={stake.id}
          className={`pathway-garden-stake-anchor ${stake.flagClass}`}
          data-flag-hovered={hoveredSign === stake.id ? "1" : undefined}
          data-flag-selected={selectedSign === stake.id ? "1" : undefined}
          data-menu-open={openSign === stake.id ? "1" : undefined}
        >
          <GardenFlagStake
            id={stake.id}
            label={stake.label}
            side={stake.side}
            open={openSign === stake.id}
            hovered={hoveredSign === stake.id}
            selected={selectedSign === stake.id}
            onHoverChange={onHoverSign}
            onToggle={() => onToggleSign(stake.id)}
            onMenuPointerEnter={onMenuPointerEnter}
            onMenuPointerLeave={onMenuPointerLeave}
          >
            {renderDestinationMenu(stake.id)}
          </GardenFlagStake>
        </div>
      ))}
    </div>
  );
}
