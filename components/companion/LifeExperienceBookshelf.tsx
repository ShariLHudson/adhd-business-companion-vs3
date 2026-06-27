"use client";

import {
  LIFE_EXPERIENCE_LETTERS,
  LIFE_EXPERIENCE_SHELF_PROMPT,
} from "@/lib/lifeExperienceRoom";
import type { LifeExperienceLetterId } from "@/lib/lifeExperienceRoom";

type Props = {
  onSelect: (id: LifeExperienceLetterId) => void;
};

export function LifeExperienceBookshelf({ onSelect }: Props) {
  return (
    <div
      className="life-experience-bookshelf"
      data-testid="life-experience-bookshelf"
    >
      <p className="life-experience-bookshelf__prompt">
        {LIFE_EXPERIENCE_SHELF_PROMPT}
      </p>
      <ul className="life-experience-bookshelf__list" role="list">
        {LIFE_EXPERIENCE_LETTERS.map((letter) => (
          <li key={letter.id}>
            <button
              type="button"
              className="life-experience-bookshelf__spine"
              onClick={() => onSelect(letter.id)}
              data-testid={`life-experience-spine-${letter.id}`}
            >
              <span className="life-experience-bookshelf__spine-title">
                {letter.title}
              </span>
              <span className="life-experience-bookshelf__spine-invitation">
                {letter.invitation}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
