"use client";

import type { StablesExperienceDefinition, StablesExperienceId } from "@/lib/stables/types";
import { listStablesExperiences } from "@/lib/stables/stablesExperiences";

type Props = {
  selectedExperienceId: StablesExperienceId | null;
  hoveredExperienceId: StablesExperienceId | null;
  onSelect: (id: StablesExperienceId) => void;
  onHover: (id: StablesExperienceId | null) => void;
};

function experienceLabel(experience: StablesExperienceDefinition): string {
  return experience.trademark;
}

/** Experience chooser — placeholders until content ships. */
export function StablesExperienceRail({
  selectedExperienceId,
  hoveredExperienceId,
  onSelect,
  onHover,
}: Props) {
  const experiences = listStablesExperiences();

  return (
    <nav
      className="stables-experience-rail"
      aria-label="Stables experiences"
      data-testid="stables-experience-rail"
    >
      <p className="stables-experience-rail__heading">When you are ready</p>
      <ul className="stables-experience-rail__list">
        {experiences.map((experience) => {
          const active =
            selectedExperienceId === experience.id ||
            hoveredExperienceId === experience.id;
          return (
            <li key={experience.id}>
              <button
                type="button"
                className={`stables-experience-rail__item${
                  active ? " stables-experience-rail__item--active" : ""
                }`}
                onClick={() => onSelect(experience.id)}
                onMouseEnter={() => onHover(experience.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(experience.id)}
                onBlur={() => onHover(null)}
                aria-pressed={selectedExperienceId === experience.id}
              >
                <span className="stables-experience-rail__item-title">
                  {experienceLabel(experience)}
                </span>
                <span className="stables-experience-rail__item-summary">
                  {experience.summary}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
