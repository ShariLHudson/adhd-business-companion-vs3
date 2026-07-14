"use client";

import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalGazeboTableActions } from "./JournalGazeboTableActions";
import { JournalGazeboTableActionsPortal } from "./JournalGazeboTableActionsPortal";

type Props = {
  journals: JournalGazeboConfig[];
  featuredJournal: JournalGazeboConfig | null;
  sceneComposed?: boolean;
  onCreateJournal: () => void;
  onOpenJournal: (journal: JournalGazeboConfig) => void;
  onJournalClick?: () => void;
};

/**
 * Letter desk actions for return / rest — Create + Write under the letter plate.
 * No notecard overlay; journals stay available via Write.
 */
export function JournalGazeboSanctuaryDesk({
  journals,
  onCreateJournal,
  onOpenJournal,
}: Props) {
  return (
    <div
      className="jg-sanctuary-desk jg-sanctuary-desk--letter-actions"
      aria-label="Journal Gazebo sanctuary"
      data-testid="jg-returning-desk"
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
