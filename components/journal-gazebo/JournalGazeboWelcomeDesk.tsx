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
 * Welcome scene — plaques track the welcome plate image rect (top 78vh),
 * not the viewport bottom (which sits below the letter on dark chrome).
 */
export function JournalGazeboWelcomeDesk({
  journals,
  onCreateJournal,
  onOpenJournal,
}: Props) {
  return (
    <JournalGazeboTableActionsPortal aria-label="Welcome to the Journal Gazebo">
      <div className="jg-welcome-desk jg-welcome-desk--portaled">
        <JournalGazeboTableActions
          layout="welcome-plate"
          journals={journals}
          onCreateJournal={onCreateJournal}
          onOpenJournal={onOpenJournal}
        />
      </div>
    </JournalGazeboTableActionsPortal>
  );
}
