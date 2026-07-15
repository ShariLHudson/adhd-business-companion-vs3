"use client";

import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalGazeboWelcomeDesk } from "./JournalGazeboWelcomeDesk";

export type EstateDeskMoment =
  | "settling"
  | "ready"
  | "envelope-opening"
  | "letter"
  | "letter-fading"
  | "letter-closing"
  | "rest";

type Props = {
  /** Kept for call-site compatibility; no longer gates the plaques. */
  moment?: EstateDeskMoment;
  showWelcome: boolean;
  journals: JournalGazeboConfig[];
  onCreateJournal: () => void;
  onOpenJournal: (journal: JournalGazeboConfig) => void;
};

/** Gazebo welcome — estate green plaques anchored to the viewport (always visible). */
export function JournalGazeboEstateDesk({
  showWelcome,
  journals,
  onCreateJournal,
  onOpenJournal,
}: Props) {
  if (!showWelcome) return null;

  return (
    <JournalGazeboWelcomeDesk
      journals={journals}
      onCreateJournal={onCreateJournal}
      onOpenJournal={onOpenJournal}
    />
  );
}
