"use client";

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
  onCreateJournal: () => void;
  onOpenToday: () => void;
  hasSavedJournals?: boolean;
};

/** Gazebo welcome — letter in the plate; desk journal + plate button hits. */
export function JournalGazeboEstateDesk({
  moment,
  showWelcome,
  sceneComposed = false,
  onCreateJournal,
  onOpenToday,
  hasSavedJournals = false,
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
          onCreateJournal={onCreateJournal}
          onOpenToday={onOpenToday}
          hasSavedJournals={hasSavedJournals}
        />
      ) : null}
    </div>
  );
}
