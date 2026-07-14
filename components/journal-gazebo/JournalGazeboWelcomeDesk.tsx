"use client";

import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalGazeboTableActions } from "./JournalGazeboTableActions";
import { JournalGazeboTableActionsPortal } from "./JournalGazeboTableActionsPortal";

type Props = {
  journals: JournalGazeboConfig[];
  onCreateJournal: () => void;
  onOpenJournal: (journal: JournalGazeboConfig) => void;
};

/**
 * Letter desk — baked welcome letter in the plate + Create / Write plaques.
 * No HTML notecard overlay.
 */
export function JournalGazeboWelcomeDesk({
  journals,
  onCreateJournal,
  onOpenJournal,
}: Props) {
  return (
    <div
      className="jg-welcome-desk-root"
      data-testid="jg-first-visit-desk"
      aria-label="Welcome to the Journal Gazebo"
    >
      <JournalGazeboTableActionsPortal aria-label="Journal desk actions">
        <div className="jg-welcome-desk-actions">
          <JournalGazeboTableActions
            layout="welcome-plate"
            mode="returning"
            journals={journals}
            onCreateJournal={onCreateJournal}
            onOpenJournal={onOpenJournal}
          />
        </div>
      </JournalGazeboTableActionsPortal>
    </div>
  );
}
