"use client";

import { useState } from "react";
import { CompanionWorkspaceShell } from "@/components/companion/CompanionWorkspaceShell";
import { LifeExperienceLetterWorkspace } from "@/components/companion/LifeExperienceLetterWorkspace";
import { LifeExperienceBookshelf } from "@/components/companion/LifeExperienceBookshelf";
import { LifeExperienceLetterReader } from "@/components/companion/LifeExperienceLetterReader";
import {
  getLifeExperienceLetter,
  type LifeExperienceLetterId,
} from "@/lib/lifeExperienceRoom";

type PanelView = "shelf" | "letter";

type Props = {
  onBackToChat: () => void;
};

/**
 * Life Experience Room — warm library sitting room; letters, not articles.
 */
export function LifeExperienceRoomPanel({ onBackToChat }: Props) {
  const [view, setView] = useState<PanelView>("shelf");
  const [letterId, setLetterId] = useState<LifeExperienceLetterId | null>(null);

  const letter = letterId ? getLifeExperienceLetter(letterId) : undefined;

  function openLetter(id: LifeExperienceLetterId) {
    setLetterId(id);
    setView("letter");
  }

  function backToShelf() {
    setView("shelf");
    setLetterId(null);
  }

  return (
    <div
      className="companion-fade-in life-experience-room-shell h-full min-h-0"
      data-testid="life-experience-room-panel"
    >
      <CompanionWorkspaceShell
        workspaceId="life-experience-room"
        hideHeader
      >
        <LifeExperienceLetterWorkspace onBackToChat={onBackToChat}>
          {view === "shelf" || !letter ? (
            <LifeExperienceBookshelf onSelect={openLetter} />
          ) : (
            <LifeExperienceLetterReader
              letter={letter}
              onBackToShelf={backToShelf}
            />
          )}
        </LifeExperienceLetterWorkspace>
      </CompanionWorkspaceShell>
    </div>
  );
}
