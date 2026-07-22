"use client";

import { useState } from "react";
import type { FocusHubAction } from "@/lib/focusHub";
import { FOCUS_LIBRARY_CATEGORIES } from "@/lib/focusLibrary/focusLibraryRoom";

type Props = {
  onAction: (action: FocusHubAction) => void;
};

/**
 * Focus Library — the focus resource collection (music, sounds, guided
 * focus, timers, saved favorites). A distinct destination from the Focus
 * My Brain hub and from Clear My Mind — Focus Library never routes there.
 */
export function FocusLibraryPanel({ onAction }: Props) {
  const [revealedStaticId, setRevealedStaticId] = useState<string | null>(null);

  return (
    <div className="focus-library-panel" data-testid="focus-library-panel">
      <div className="focus-library-panel__header">
        <p className="focus-library-panel__title">Focus Library</p>
        <p className="focus-library-panel__intro">
          Choose music, sounds, guided focus, timers, or saved favorites.
        </p>
      </div>
      <ul className="focus-library-panel__categories">
        {FOCUS_LIBRARY_CATEGORIES.map((category) => {
          const isStatic = !category.action;
          return (
            <li key={category.id}>
              <button
                type="button"
                className={[
                  "focus-library-panel__category",
                  isStatic ? "focus-library-panel__category--static" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-testid={`focus-library-category-${category.id}`}
                aria-expanded={isStatic ? revealedStaticId === category.id : undefined}
                onClick={() => {
                  if (category.action) {
                    onAction(category.action);
                    return;
                  }
                  setRevealedStaticId((current) =>
                    current === category.id ? null : category.id,
                  );
                }}
              >
                <span className="focus-library-panel__category-icon" aria-hidden>
                  {category.icon}
                </span>
                <span className="focus-library-panel__category-body">
                  <span className="focus-library-panel__category-label">
                    {category.label}
                  </span>
                  <span className="focus-library-panel__category-desc">
                    {isStatic && revealedStaticId === category.id
                      ? "Nothing saved yet — save a favorite from Music & Sounds and it will appear here."
                      : category.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
