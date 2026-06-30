"use client";

import { GrowPanelBackButton } from "@/components/companion/GrowPanelBackButton";
import { GrowRoomShell } from "@/components/companion/GrowRoomShell";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GROW_SECTION_META } from "@/lib/growNavigation";
import type { GrowSectionId } from "@/lib/growNavigation";
import "@/app/companion/grow-room.css";

type Props = {
  section: Exclude<GrowSectionId, "grow">;
  onBack: () => void;
  backLabel?: string | null;
};

/** Placeholder until full Spark Cards, Guilds, etc. ship. */
export function GrowPlaceholderPanel({ section, onBack, backLabel }: Props) {
  const meta = GROW_SECTION_META[section];

  return (
    <GrowRoomShell>
      <EstateWorkspace className="grow-room-panel journal-room-panel">
        <GrowPanelBackButton onBack={onBack} label={backLabel ?? "Grow"} />
        <header className="grow-room__header journal-room__header">
          <p className="estate-workspace__kicker">Grow</p>
          <h1 className="estate-workspace__title">{meta.title}</h1>
          <p className="grow-room__lead journal-room__intro-support">{meta.lead}</p>
        </header>
        <p className="grow-room__coming-soon">
          This room is taking shape. The architecture is in place — guided experiences
          will arrive here soon.
        </p>
      </EstateWorkspace>
    </GrowRoomShell>
  );
}
