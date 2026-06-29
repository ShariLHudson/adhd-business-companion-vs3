"use client";

import { useState } from "react";
import { CaptureMomentRoomShell } from "@/components/companion/CaptureMomentRoomShell";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowthHubCapture } from "@/components/companion/GrowthHubCapture";
import { GrowthCelebrationMoment } from "@/components/companion/GrowthCelebrationMoment";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import type { GrowthSectionId } from "@/lib/growthNavigation";
import "@/app/companion/growth-story-hub.css";

type Props = {
  onBack: () => void;
  backLabel?: string | null;
  onOpenSection: (section: GrowthSectionId) => void;
  onOpenAssetLibrary?: () => void;
};

/** Capture room — orchard backdrop with unified estate workspace. */
export function GrowthStoryCapturePanel({
  onBack,
  backLabel,
  onOpenSection,
  onOpenAssetLibrary,
}: Props) {
  const [writingFocus, setWritingFocus] = useState(false);

  return (
    <CaptureMomentRoomShell reflecting={writingFocus}>
      <EstateWorkspace
        className={`growth-story-capture-page${writingFocus ? " growth-story-landing--writing-focus" : ""}`}
      >
        <GrowthPanelBackButton onBack={onBack} label={backLabel ?? "Your Story"} />

        <header className="growth-story-capture-page__header">
          <p className="estate-workspace__kicker">The Orchard</p>
          <h1 className="estate-workspace__title">Capture a Moment</h1>
          <p className="estate-workspace__lead">
            Some moments become memories because you choose to keep them.
          </p>
        </header>

        <div className="growth-story-hero" data-testid="growth-hub-capture-zone">
          <GrowthHubCapture
            onOpenSection={onOpenSection}
            onOpenAssetLibrary={onOpenAssetLibrary}
            onWritingFocusChange={setWritingFocus}
          />
        </div>

        <GrowthCelebrationMoment />
      </EstateWorkspace>
    </CaptureMomentRoomShell>
  );
}
