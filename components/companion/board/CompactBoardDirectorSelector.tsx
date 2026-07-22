"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";
import {
  CORE_BOARD_DIRECTOR_IDS,
  getBoardDirectorById,
  listVisibleBoardDirectors,
  recommendBoardDirectorsForDecision,
  resolveBoardDirectorPortraitPath,
  type BoardDirectorId,
} from "@/lib/board";
import "@/app/companion/board-director-meet.css";

type Props = {
  selectedIds: readonly BoardDirectorId[];
  onChange: (ids: BoardDirectorId[]) => void;
  /** Decision text drives Select Recommended Directors */
  decisionText?: string;
  /** Optional: open full biography without leaving selection */
  onLearnAbout?: (directorId: BoardDirectorId) => void;
  className?: string;
};

/**
 * Compact Director selector — photo, name, role, one-line specialty, checkbox.
 * Full biographies stay behind “Learn about…” (Prompt 145).
 */
export function CompactBoardDirectorSelector({
  selectedIds,
  onChange,
  decisionText = "",
  onLearnAbout,
  className,
}: Props) {
  const listId = useId();
  const [expandedId, setExpandedId] = useState<BoardDirectorId | null>(null);
  const directors = listVisibleBoardDirectors();
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  function setSelection(ids: readonly BoardDirectorId[]) {
    onChange([...ids]);
  }

  function toggle(id: BoardDirectorId) {
    if (selectedSet.has(id)) {
      setSelection(selectedIds.filter((x) => x !== id));
    } else {
      setSelection([...selectedIds, id]);
    }
  }

  function selectRecommended() {
    const rec = recommendBoardDirectorsForDecision(decisionText || "general");
    setSelection(rec.directorIds);
  }

  function selectCore() {
    setSelection(CORE_BOARD_DIRECTOR_IDS);
  }

  function selectAll() {
    setSelection(directors.map((d) => d.id));
  }

  function clearSelection() {
    setSelection([]);
  }

  function learnAbout(id: BoardDirectorId) {
    if (onLearnAbout) {
      onLearnAbout(id);
      return;
    }
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div
      className={`compact-board-director-selector${className ? ` ${className}` : ""}`}
      data-testid="compact-board-director-selector"
    >
      <p className="boardroom-purpose" id={`${listId}-label`}>
        Choose who sits at the Round Table. Expand a biography only if you want
        more detail.
      </p>
      <div
        className="compact-board-director-selector__bulk"
        role="group"
        aria-label="Quick director selection"
      >
        <button
          type="button"
          className="boardroom-btn boardroom-btn--secondary"
          data-testid="compact-select-recommended"
          onClick={selectRecommended}
        >
          Select Recommended Directors
        </button>
        <button
          type="button"
          className="boardroom-btn boardroom-btn--secondary"
          data-testid="compact-select-core"
          onClick={selectCore}
        >
          Select Core Board
        </button>
        <button
          type="button"
          className="boardroom-btn boardroom-btn--ghost"
          data-testid="compact-select-all"
          onClick={selectAll}
        >
          Select All
        </button>
        <button
          type="button"
          className="boardroom-btn boardroom-btn--ghost"
          data-testid="compact-clear-selection"
          onClick={clearSelection}
        >
          Clear Selection
        </button>
      </div>

      <ul
        className="compact-board-director-selector__list"
        role="listbox"
        aria-labelledby={`${listId}-label`}
        aria-multiselectable="true"
        data-testid="compact-board-director-list"
      >
        {directors.map((d) => {
          const selected = selectedSet.has(d.id);
          const portrait = resolveBoardDirectorPortraitPath(d);
          const specialty =
            d.decisionLens[0]?.trim() ||
            d.purpose.split(/(?<=\.)\s/)[0] ||
            d.boardRole;
          const expanded = expandedId === d.id;
          const inputId = `${listId}-${d.id}`;
          return (
            <li
              key={d.id}
              className={`compact-board-director-selector__row${
                selected
                  ? " compact-board-director-selector__row--selected"
                  : ""
              }`}
              role="option"
              aria-selected={selected}
              data-testid={`compact-director-row-${d.id}`}
              data-selected={selected ? "true" : "false"}
            >
              <label
                htmlFor={inputId}
                className="compact-board-director-selector__label"
              >
                <span className="compact-board-director-selector__photo">
                  <Image
                    src={portrait}
                    alt=""
                    width={48}
                    height={48}
                    className="compact-board-director-selector__img"
                    unoptimized
                  />
                </span>
                <span className="compact-board-director-selector__copy">
                  <span className="compact-board-director-selector__name">
                    {d.name}
                  </span>
                  <span className="compact-board-director-selector__role">
                    {d.shortRole}
                  </span>
                  <span className="compact-board-director-selector__specialty">
                    {specialty}
                  </span>
                </span>
                <input
                  id={inputId}
                  type="checkbox"
                  className="compact-board-director-selector__check"
                  checked={selected}
                  onChange={() => toggle(d.id)}
                  data-testid={`compact-director-check-${d.id}`}
                />
              </label>
              <button
                type="button"
                className="compact-board-director-selector__learn"
                data-testid={`compact-director-learn-${d.id}`}
                aria-expanded={expanded}
                onClick={() => learnAbout(d.id)}
              >
                Learn About This Director
              </button>
              {expanded && !onLearnAbout ? (
                <div
                  className="compact-board-director-selector__bio"
                  data-testid={`compact-director-bio-${d.id}`}
                >
                  <p>{d.purpose}</p>
                  {getBoardDirectorById(d.id)?.openingMessage ? (
                    <p className="compact-board-director-selector__opening">
                      {d.openingMessage}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
