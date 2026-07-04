"use client";

import { useState } from "react";
import {
  JOURNAL_GAZEBO_PROTOTYPE_PLACEHOLDERS,
  resetJournalGazeboFirstVisit,
  resetJournalGazeboPrototype,
} from "@/lib/journalGazebo/prototype";
import type { JournalGazeboPhase } from "@/lib/journalGazebo/types";

type Props = {
  phase: JournalGazeboPhase;
  onReplayArrival: () => void;
  onJumpToPhase: (phase: JournalGazeboPhase) => void;
};

export function JournalGazeboPrototypeRail({
  phase,
  onReplayArrival,
  onJumpToPhase,
}: Props) {
  const [open, setOpen] = useState(false);
  const [cleared, setCleared] = useState<string | null>(null);

  function flash(msg: string) {
    setCleared(msg);
    window.setTimeout(() => setCleared(null), 2400);
  }

  function handleResetFirstVisit() {
    resetJournalGazeboFirstVisit();
    flash("First visit reset — replaying arrival…");
    window.setTimeout(() => onReplayArrival(), 400);
  }

  function handleFullReset() {
    resetJournalGazeboPrototype(true);
    flash("Full reset — reloading…");
    window.setTimeout(() => window.location.reload(), 500);
  }

  return (
    <aside
      className={[
        "journal-gazebo-prototype",
        open ? "journal-gazebo-prototype--open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Journal Gazebo prototype controls"
    >
      <button
        type="button"
        className="journal-gazebo-prototype__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? "Hide prototype" : "Prototype"}
      </button>

      {open ? (
        <div className="journal-gazebo-prototype__panel">
          <p className="journal-gazebo-prototype__kicker">Living prototype</p>
          <h2 className="journal-gazebo-prototype__title">Feeling first</h2>
          <p className="journal-gazebo-prototype__lead">
            Experience arrival → welcome → writing. Placeholders are intentional.
          </p>

          <p className="journal-gazebo-prototype__phase">
            Current: <strong>{phase}</strong>
          </p>

          <div className="journal-gazebo-prototype__actions">
            <button type="button" onClick={onReplayArrival}>
              Replay arrival
            </button>
            <button type="button" onClick={handleResetFirstVisit}>
              Reset first visit
            </button>
            <button type="button" onClick={() => onJumpToPhase("estate")}>
              Jump → estate
            </button>
            <button type="button" onClick={() => onJumpToPhase("letter")}>
              Jump → letter
            </button>
            <button type="button" onClick={() => onJumpToPhase("creating")}>
              Jump → create
            </button>
            <button type="button" onClick={() => onJumpToPhase("journal-desk")}>
              Jump → desk
            </button>
            <button type="button" onClick={() => onJumpToPhase("writing")}>
              Jump → writing
            </button>
            <button
              type="button"
              className="journal-gazebo-prototype__danger"
              onClick={handleFullReset}
            >
              Full reset
            </button>
          </div>

          <ul className="journal-gazebo-prototype__list">
            {JOURNAL_GAZEBO_PROTOTYPE_PLACEHOLDERS.map((item) => (
              <li
                key={item.id}
                data-status={item.status}
                className="journal-gazebo-prototype__list-item"
              >
                {item.label}
              </li>
            ))}
          </ul>

          {cleared ? (
            <p className="journal-gazebo-prototype__toast" role="status">
              {cleared}
            </p>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
