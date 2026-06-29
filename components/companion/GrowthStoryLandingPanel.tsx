"use client";

import { GrowthRoomShell } from "@/components/companion/GrowthRoomShell";
import { GrowthPanelBackButton } from "@/components/companion/GrowthPanelBackButton";
import { GrowthStoryChoiceCard } from "@/components/companion/GrowthStoryChoiceCard";
import {
  GROWTH_ESTATE_CHOICES,
  GROWTH_STORY_ENTRANCE_PROMPT,
  type GrowthEstateChoiceId,
} from "@/lib/growth/growthEstateChoices";
import "@/app/companion/growth-story-hub.css";

type Props = {
  onBack: () => void;
  onOpenJournal: () => void;
  onOpenCapture: () => void;
  onOpenLibrary: () => void;
};

/** Your Story — three intentions: reflect, save, explore. */
export function GrowthStoryLandingPanel({
  onBack,
  onOpenJournal,
  onOpenCapture,
  onOpenLibrary,
}: Props) {
  function openChoice(id: GrowthEstateChoiceId) {
    if (id === "reflect") onOpenJournal();
    else if (id === "capture") onOpenCapture();
    else onOpenLibrary();
  }

  return (
    <GrowthRoomShell landing>
      <div className="growth-story-landing growth-story-landing--entrance companion-fade-in">
        <article className="growth-story-landing__card growth-story-landing__card--entrance companion-workspace-frosted">
          <GrowthPanelBackButton onBack={onBack} />

          <header className="growth-story-header growth-story-header--landing growth-story-header--intention">
            <h1 className="growth-story-header__intention">{GROWTH_STORY_ENTRANCE_PROMPT}</h1>
          </header>

          <nav
            className="growth-estate-choices"
            aria-label={GROWTH_STORY_ENTRANCE_PROMPT}
          >
            {GROWTH_ESTATE_CHOICES.map((choice) => (
              <GrowthStoryChoiceCard
                key={choice.id}
                choice={choice}
                onSelect={() => openChoice(choice.id)}
              />
            ))}
          </nav>
        </article>
      </div>
    </GrowthRoomShell>
  );
}
