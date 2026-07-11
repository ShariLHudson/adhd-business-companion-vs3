"use client";

import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalGazeboTableActions } from "./JournalGazeboTableActions";

type Props = {
  sceneComposed?: boolean;
  journals: JournalGazeboConfig[];
  onCreateJournal: () => void;
  onOpenJournal: (journal: JournalGazeboConfig) => void;
};

/**
 * Welcome scene — estate green plaques anchored to the viewport bottom so clicks
 * stay reliable while the welcome plate image loads and scales.
 */
export function JournalGazeboWelcomeDesk({
  sceneComposed = false,
  journals,
  onCreateJournal,
  onOpenJournal,
}: Props) {
  return (
    <div
      className={[
        "jg-welcome-desk",
        "jg-welcome-desk--actions-only",
        sceneComposed ? "jg-welcome-desk--composed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Welcome to the Journal Gazebo"
    >
      <JournalGazeboTableActions
        layout="sanctuary"
        journals={journals}
        onCreateJournal={onCreateJournal}
        onOpenJournal={onOpenJournal}
      />
    </div>
  );
}
