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
  moment: EstateDeskMoment;
  showWelcome: boolean;
  journals: JournalGazeboConfig[];
  onCreateJournal: () => void;
  onOpenJournal: (journal: JournalGazeboConfig) => void;
};

/** Gazebo welcome — estate green plaques anchored to the viewport (always visible). */
export function JournalGazeboEstateDesk({
  moment,
  showWelcome,
  journals,
  onCreateJournal,
  onOpenJournal,
}: Props) {
  const showDeskActions =
    showWelcome &&
    moment !== "letter-fading" &&
    moment !== "letter-closing";

  if (!showDeskActions) return null;

  return (
    <JournalGazeboWelcomeDesk
      journals={journals}
      onCreateJournal={onCreateJournal}
      onOpenJournal={onOpenJournal}
    />
  );
}
