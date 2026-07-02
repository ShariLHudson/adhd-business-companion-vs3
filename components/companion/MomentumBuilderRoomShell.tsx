"use client";

import type { ReactNode } from "react";
import { EstateRoomFullBleedBackground } from "@/components/companion/estate/EstateRoomFullBleedBackground";
import { celebrationMotionClass } from "@/lib/momentumBuilderRoom/estateIntegration";
import type { MomentumBuilderCelebrationKind } from "@/lib/momentumBuilderRoom/estateIntegration";
import { MOMENTUM_BUILDER_ROOM_BG } from "@/lib/momentumBuilderRoom/roomRegistry";
import type { TodaysPath } from "@/lib/momentumBuilderRoom/types";
import { MomentumBuilderPathPlaceholder } from "@/components/companion/momentumBuilder/MomentumBuilderPathPlaceholder";
import { MomentumBuilderPlanningTable } from "@/components/companion/momentumBuilder/MomentumBuilderPlanningTable";
import { MomentumBuilderStudioScene } from "@/components/companion/momentumBuilder/MomentumBuilderStudioScene";

type Props = {
  children: ReactNode;
  todaysPath?: TodaysPath | null;
  celebrationKind?: MomentumBuilderCelebrationKind | null;
};

/** Full-screen Momentum Builder™ planning studio — conversation primary. */
export function MomentumBuilderRoomShell({
  children,
  todaysPath,
  celebrationKind,
}: Props) {
  const showTable = Boolean(
    todaysPath &&
      (todaysPath.firstStep ||
        todaysPath.easyWins.length > 0 ||
        todaysPath.focusSessions.length > 0 ||
        todaysPath.roadblocks.length > 0 ||
        todaysPath.tomorrowStartsHere),
  );

  const celebrationClass = celebrationKind
    ? celebrationMotionClass(celebrationKind)
    : "";

  return (
    <div
      className={`momentum-builder-room${celebrationClass ? ` ${celebrationClass}` : ""}`}
      data-testid="momentum-builder-room"
      data-homestead-room="momentum-builder"
      data-path-visible={showTable ? "true" : "false"}
    >
      <EstateRoomFullBleedBackground
        roomId="momentum-builder"
        imageUrl={MOMENTUM_BUILDER_ROOM_BG}
        className="momentum-builder-room__fullbleed"
      />
      <MomentumBuilderStudioScene />
      <div
        className={`momentum-builder-room__planning-table${
          showTable ? " momentum-builder-room__planning-table--visible" : ""
        }`}
      >
        {showTable && todaysPath ? (
          <MomentumBuilderPlanningTable path={todaysPath} />
        ) : null}
      </div>
      <MomentumBuilderPathPlaceholder />
      <div className="momentum-builder-room__stage">{children}</div>
    </div>
  );
}
