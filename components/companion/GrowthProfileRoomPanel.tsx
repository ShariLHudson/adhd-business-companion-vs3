"use client";

import { GrowthProfilePanel } from "@/components/companion/GrowthProfilePanel";
import { GrowthProfileRoomShell } from "@/components/companion/GrowthProfileRoomShell";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import type { EstateMenuActionId } from "@/lib/estateMenu";
import "@/app/companion/grow-room.css";

type Props = {
  emphasizeTimeline?: boolean;
  onOpenEstatePlace?: (actionId: EstateMenuActionId) => void;
};

/** Growth Profile — greenhouse sanctuary, frosted capability workspace. */
export function GrowthProfileRoomPanel({
  emphasizeTimeline = false,
  onOpenEstatePlace,
}: Props) {
  return (
    <GrowthProfileRoomShell>
      <EstateWorkspace className="grow-room-panel grow-room-panel--landing">
        <header className="grow-room__header">
          <p className="estate-workspace__kicker">Your Estate</p>
          <h1 className="estate-workspace__title">
            {emphasizeTimeline ? "Progress Timeline" : "Growth Profile"}
          </h1>
          <p className="grow-room__lead grow-room__intro-support">
            Capabilities earned through learning, reflection, and return — updated
            quietly as you grow.
          </p>
        </header>
        <GrowthProfilePanel
          emphasizeTimeline={emphasizeTimeline}
          embedded
          onOpenEstatePlace={onOpenEstatePlace}
        />
      </EstateWorkspace>
    </GrowthProfileRoomShell>
  );
}
