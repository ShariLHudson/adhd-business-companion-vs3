"use client";

import { StoryLibraryRoomShell } from "@/components/companion/StoryLibraryRoomShell";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import { GrowthStoryDestinationPanel } from "@/components/companion/GrowthStoryDestinationPanel";
import { GROWTH_STORY_HUB_PANELS } from "@/lib/growth/growthStoryHub";
import type { GrowthStoryHubPanelId } from "@/lib/growth/growthStoryHub";
import type { GrowthSectionId } from "@/lib/growthNavigation";
import "@/app/companion/growth-story-hub.css";

type Props = {
  onBack: () => void;
  backLabel?: string | null;
  onOpenSection: (section: GrowthSectionId) => void;
  onOpenTimeline?: () => void;
};

/** My Story Library — bright reading room catalogue. */
export function GrowthLibraryPanel({
  onBack,
  backLabel,
  onOpenSection,
  onOpenTimeline,
}: Props) {
  function openPanel(id: GrowthStoryHubPanelId) {
    if (id === "timeline") {
      onOpenTimeline?.();
      return;
    }
    onOpenSection(id);
  }

  return (
    <StoryLibraryRoomShell>
      <EstateWorkspace className="growth-story-library-page companion-fade-in">
        <GrowthPanelBackButton onBack={onBack} label={backLabel ?? "Your Story"} />

        <header className="growth-story-library-page__header">
          <p className="estate-workspace__kicker">My Story Library</p>
          <h1 className="estate-workspace__title">Explore Your Story</h1>
          <p className="estate-workspace__lead">
            Return to any place your story lives.
          </p>
        </header>

        <div className="growth-story-library" data-testid="growth-hub-destinations">
          {GROWTH_STORY_HUB_PANELS.map((panel) => {
            if (panel.id === "timeline" && !onOpenTimeline) return null;
            return (
              <GrowthStoryDestinationPanel
                key={panel.id}
                title={panel.title}
                description={panel.description}
                testId={`growth-story-panel-${panel.id}`}
                onOpen={() => openPanel(panel.id)}
              />
            );
          })}
        </div>
      </EstateWorkspace>
    </StoryLibraryRoomShell>
  );
}
