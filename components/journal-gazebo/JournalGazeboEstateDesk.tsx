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
  sceneComposed?: boolean;
  journals: JournalGazeboConfig[];
  onCreateJournal: () => void;
  onOpenJournal: (journal: JournalGazeboConfig) => void;
};

/** Gazebo welcome — letter in the plate; desk journal + plate button hits. */
export function JournalGazeboEstateDesk({
  moment,
  showWelcome,
  sceneComposed = false,
  journals,
  onCreateJournal,
  onOpenJournal,
}: Props) {
  const welcomeVisible =
    showWelcome &&
    sceneComposed &&
    moment !== "letter-fading" &&
    moment !== "letter-closing";

  return (
    <div
      className={[
        "journal-estate",
        "journal-estate--photo-scene",
        sceneComposed ? "journal-estate--composed" : "",
        welcomeVisible ? "journal-estate--ready" : "",
        moment === "rest" ? "journal-estate--rest" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="journal-estate__glow" aria-hidden="true" />

      {welcomeVisible ? (
        <JournalGazeboWelcomeDesk
          sceneComposed={sceneComposed}
          journals={journals}
          onCreateJournal={onCreateJournal}
          onOpenJournal={onOpenJournal}
        />
      ) : null}
    </div>
  );
}
