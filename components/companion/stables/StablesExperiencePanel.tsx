"use client";

import type { StablesDiscussMode } from "@/lib/stables/types";
import type { StablesExperienceDefinition } from "@/lib/stables/types";
import { STABLES_SAVE_DESTINATIONS } from "@/lib/stables/stablesSavePaths";

type Props = {
  experience: StablesExperienceDefinition;
  onClose: () => void;
  onDiscuss: (mode: StablesDiscussMode) => void;
};

/** Placeholder learning surface — conversation-first until experiences ship. */
export function StablesExperiencePanel({
  experience,
  onClose,
  onDiscuss,
}: Props) {
  return (
    <aside
      className="stables-experience-panel"
      data-testid="stables-experience-panel"
      aria-label={experience.trademark}
    >
      <header className="stables-experience-panel__header">
        <div>
          <p className="stables-experience-panel__eyebrow">Stables experience</p>
          <h2 className="stables-experience-panel__title">{experience.trademark}</h2>
        </div>
        <button
          type="button"
          className="stables-experience-panel__close"
          onClick={onClose}
          aria-label="Close experience panel"
        >
          ×
        </button>
      </header>

      <p className="stables-experience-panel__summary">{experience.summary}</p>
      <p className="stables-experience-panel__placeholder">{experience.placeholderCopy}</p>

      <p className="stables-experience-panel__status" aria-live="polite">
        Coming soon — for now, talk with Shari here.
      </p>

      <div className="stables-experience-panel__actions">
        <button
          type="button"
          className="stables-experience-panel__chip stables-experience-panel__chip--primary"
          onClick={() => onDiscuss("reflect")}
        >
          Reflect with Shari
        </button>
        <button
          type="button"
          className="stables-experience-panel__chip"
          onClick={() => onDiscuss("challenge")}
        >
          Small brave step
        </button>
        <button
          type="button"
          className="stables-experience-panel__chip"
          onClick={() => onDiscuss("apply")}
        >
          Apply to my situation
        </button>
      </div>

      <footer className="stables-experience-panel__save">
        <p className="stables-experience-panel__save-label">When you are ready to keep something</p>
        <ul className="stables-experience-panel__save-list">
          {STABLES_SAVE_DESTINATIONS.map((destination) => (
            <li key={destination.id}>
              <button
                type="button"
                className="stables-experience-panel__save-chip"
                onClick={() => onDiscuss("save-reflection")}
                title={destination.whenAppropriate}
              >
                {destination.trademark}
              </button>
            </li>
          ))}
        </ul>
      </footer>
    </aside>
  );
}
