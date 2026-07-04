"use client";

import type { ReactNode } from "react";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import {
  JournalGazeboHeroJournal,
  type JournalHeroMoment,
} from "./JournalGazeboHeroJournal";
import { JournalGazeboDeskPen } from "./JournalGazeboDeskPen";

export type DeskCamera = "wide" | "approach" | "writing";

type Props = {
  config: JournalGazeboConfig;
  camera: DeskCamera;
  journalMoment: JournalHeroMoment;
  onJournalOpen?: () => void;
  onJournalOpenComplete?: () => void;
  /** When true, journal accepts open / approach clicks. */
  journalClickable?: boolean;
  children?: ReactNode;
};

/** Writing desk stage — camera moves toward the member's journal. */
export function JournalGazeboDesk({
  config,
  camera,
  journalMoment,
  onJournalOpen,
  onJournalOpenComplete,
  journalClickable = false,
  children,
}: Props) {
  const clickable = journalClickable && journalMoment === "closed";

  return (
    <div
      className={[
        "journal-gazebo__desk-stage",
        `journal-gazebo__desk-stage--camera-${camera}`,
      ].join(" ")}
      aria-hidden={false}
    >
      <div className="journal-gazebo__desk-vignette" aria-hidden="true" />
      <div className="journal-gazebo__table-surface journal-gazebo__table-surface--hero" />
      <JournalGazeboHeroJournal
        config={config}
        moment={journalMoment}
        clickable={clickable}
        onOpen={onJournalOpen}
        onOpenComplete={onJournalOpenComplete}
      >
        {children}
      </JournalGazeboHeroJournal>
      {journalMoment !== "open" ? (
        <JournalGazeboDeskPen penVariant={config.penVariant} />
      ) : null}
    </div>
  );
}
