"use client";

import { useEffect, useState } from "react";
import {
  pickJournalGazeboReturnNote,
  type JournalGazeboReturnNote,
} from "@/lib/journalGazebo/returnGreetings";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalGazeboHeroJournal } from "./JournalGazeboHeroJournal";
import { JournalGazeboReturnNoteCard } from "./JournalGazeboReturnNoteCard";
import { JournalGazeboTableActions } from "./JournalGazeboTableActions";
import { JournalGazeboTableActionsPortal } from "./JournalGazeboTableActionsPortal";

const NOTE_ROTATE_MS = 18_000;

type Props = {
  journals: JournalGazeboConfig[];
  featuredJournal: JournalGazeboConfig | null;
  sceneComposed?: boolean;
  initialNote?: JournalGazeboReturnNote | null;
  onCreateJournal: () => void;
  onOpenJournal: (journal: JournalGazeboConfig) => void;
  onJournalClick?: () => void;
};

/** Return-visit gazebo table — clean desk plate, Shari note, journal, sanctuary actions. */
export function JournalGazeboSanctuaryDesk({
  journals,
  featuredJournal,
  sceneComposed = false,
  initialNote = null,
  onCreateJournal,
  onOpenJournal,
  onJournalClick,
}: Props) {
  const [note, setNote] = useState<JournalGazeboReturnNote>(
    () => initialNote ?? pickJournalGazeboReturnNote(),
  );

  useEffect(() => {
    if (initialNote) setNote(initialNote);
  }, [initialNote]);

  useEffect(() => {
    if (!sceneComposed) return;
    const timer = window.setInterval(() => {
      setNote((current) =>
        pickJournalGazeboReturnNote(current.question),
      );
    }, NOTE_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [sceneComposed]);

  if (!sceneComposed) {
    return (
      <JournalGazeboTableActionsPortal aria-label="Journal Gazebo sanctuary">
        <JournalGazeboTableActions
          layout="sanctuary"
          journals={journals}
          onCreateJournal={onCreateJournal}
          onOpenJournal={onOpenJournal}
        />
      </JournalGazeboTableActionsPortal>
    );
  }

  return (
    <div className="jg-sanctuary-desk" aria-label="Journal Gazebo sanctuary">
      <JournalGazeboReturnNoteCard note={note} />

      {featuredJournal ? (
        <div className="jg-sanctuary-desk__journal">
          <JournalGazeboHeroJournal
            config={featuredJournal}
            moment="closed"
            onDesk
            heirloom
            clickable={Boolean(onJournalClick)}
            onOpen={onJournalClick}
          />
        </div>
      ) : null}

      <JournalGazeboTableActionsPortal>
        <JournalGazeboTableActions
          layout="sanctuary"
          journals={journals}
          onCreateJournal={onCreateJournal}
          onOpenJournal={onOpenJournal}
        />
      </JournalGazeboTableActionsPortal>
    </div>
  );
}
