"use client";

import { CelebrationGardenRoomShell } from "@/components/companion/CelebrationGardenRoomShell";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import { GrowthReportsPanel } from "@/components/companion/GrowthReportsPanel";
import "@/app/companion/celebration-garden-room.css";
import "@/app/companion/storybook-builder.css";

type Props = {
  onBack: () => void;
  backLabel?: string | null;
};

/** Create Your Storybook — a quiet publishing studio in the celebration garden. */
export function GrowthReportsPage({ onBack, backLabel }: Props) {
  return (
    <CelebrationGardenRoomShell>
      <EstateWorkspace className="storybook-builder-page companion-fade-in">
        <GrowthPanelBackButton onBack={onBack} label={backLabel ?? "My Story Library"} />
        <GrowthReportsPanel open embedded onClose={onBack} />
      </EstateWorkspace>
    </CelebrationGardenRoomShell>
  );
}
