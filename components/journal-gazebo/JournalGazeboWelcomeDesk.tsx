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
 * Welcome scene — estate green plaques anchored to the viewport bottom so clicks
 * stay reliable while the welcome plate image loads and scales.
 */
export function JournalGazeboWelcomeDesk({
  journals,
  onCreateJournal,
  onOpenJournal,
}: Props) {
  return (
    <JournalGazeboTableActionsPortal aria-label="Welcome to the Journal Gazebo">
      <JournalGazeboTableActions
        layout="sanctuary"
        journals={journals}
        onCreateJournal={onCreateJournal}
        onOpenJournal={onOpenJournal}
      />
    </JournalGazeboTableActionsPortal>
  );
}
