"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState } from "react";
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
  /** Decision text drives Recommended Directors */
  decisionText?: string;
  /** Optional: open full biography without leaving selection */
  onLearnAbout?: (directorId: BoardDirectorId) => void;
  className?: string;
  /**
   * recommended — default path (preview + Use Recommended / Customize)
   * customize — single list interface (Core Board under More)
   */
  mode?: "recommended" | "customize";
  /** When mode is recommended, notify parent that Customize was chosen */
  onRequestCustomize?: () => void;
  /** Auto-apply recommendation when selection is empty */
  autoSelectRecommended?: boolean;
};

/**
 * Compact Director selector — photo, name, role, one-line specialty, checkbox.
 * Default path recommends Directors; Customize shows one list interface.
 */
export function CompactBoardDirectorSelector({
  selectedIds,
  onChange,
  decisionText = "",
  onLearnAbout,
  className,
  mode = "customize",
  onRequestCustomize,
  autoSelectRecommended = false,
}: Props) {
  const listId = useId();
  const [expandedId, setExpandedId] = useState<BoardDirectorId | null>(null);
  const [showMoreBulk, setShowMoreBulk] = useState(false);
  const directors = listVisibleBoardDirectors();
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const recommendation = useMemo(
    () => recommendBoardDirectorsForDecision(decisionText || "general"),
    [decisionText],
  );

  useEffect(() => {
    if (!autoSelectRecommended) return;
    if (selectedIds.length > 0) return;
    onChange([...recommendation.directorIds]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply once when empty
  }, [autoSelectRecommended, decisionText]);

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
    setSelection(recommendation.directorIds);
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

  if (mode === "recommended") {
    const recommendedNames = recommendation.directorIds
      .map((id) => getBoardDirectorById(id))
      .filter(Boolean);

    return (
      <div
        className={`compact-board-director-selector compact-board-director-selector--recommended${
          className ? ` ${className}` : ""
        }`}
        data-testid="compact-board-director-selector"
        data-mode="recommended"
      >
        <p className="boardroom-purpose" data-testid="board-recommended-intro">
          These Directors are especially well suited to help with this decision.
        </p>
        <ul
          className="compact-board-director-selector__list"
          aria-label="Recommended Directors"
          data-testid="board-recommended-preview"
        >
          {recommendedNames.map((d) => {
            if (!d) return null;
            const selected = selectedSet.has(d.id);
            const portrait = resolveBoardDirectorPortraitPath(d);
            return (
              <li
                key={d.id}
                className={`compact-board-director-selector__row board-director-card${
                  selected
                    ? " compact-board-director-selector__row--selected"
                    : ""
                }`}
                data-testid={`compact-director-row-${d.id}`}
                data-selected={selected ? "true" : "false"}
              >
                {selected ? (
                  <span
                    aria-hidden="true"
                    className="compact-board-director-selector__check-badge selection-check"
                  >
                    ✓
                  </span>
                ) : null}
                <span className="compact-board-director-selector__label">
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
                      {recommendation.rationaleByDirector[d.id] ||
                        d.decisionLens[0] ||
                        d.boardRole}
                    </span>
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        <div className="boardroom-actions" style={{ flexWrap: "wrap" }}>
          <button
            type="button"
            className="boardroom-btn boardroom-btn--primary"
            data-testid="compact-select-recommended"
            onClick={selectRecommended}
          >
            Use Recommended Directors
          </button>
          <button
            type="button"
            className="boardroom-btn boardroom-btn--secondary"
            data-testid="compact-customize-directors"
            onClick={() => {
              selectRecommended();
              onRequestCustomize?.();
            }}
          >
            Customize
          </button>
        </div>
        {recommendation.offerDevilsAdvocate ? (
          <p className="boardroom-purpose" data-testid="board-offer-devils-advocate">
            {recommendation.offerDevilsAdvocateReason}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`compact-board-director-selector${className ? ` ${className}` : ""}`}
      data-testid="compact-board-director-selector"
      data-mode="customize"
    >
      <p className="boardroom-purpose" id={`${listId}-label`}>
        Choose Directors for this discussion. One selection list — portraits,
        roles, and clear selected states.
      </p>
      <div
        className="compact-board-director-selector__bulk"
        role="group"
        aria-label="Director selection shortcuts"
      >
        <button
          type="button"
          className="boardroom-btn boardroom-btn--secondary"
          data-testid="compact-select-recommended"
          onClick={selectRecommended}
        >
          Use Recommended Directors
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
        <button
          type="button"
          className="boardroom-btn boardroom-btn--ghost"
          data-testid="compact-selection-more"
          aria-expanded={showMoreBulk}
          onClick={() => setShowMoreBulk((v) => !v)}
        >
          More
        </button>
      </div>
      {showMoreBulk ? (
        <div
          className="compact-board-director-selector__bulk"
          role="group"
          aria-label="More selection options"
          data-testid="compact-selection-more-menu"
        >
          <button
            type="button"
            className="boardroom-btn boardroom-btn--secondary"
            data-testid="compact-select-core"
            onClick={selectCore}
          >
            Use Core Board
          </button>
        </div>
      ) : null}

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
              className={`compact-board-director-selector__row board-director-card${
                selected
                  ? " compact-board-director-selector__row--selected"
                  : ""
              }`}
              role="option"
              aria-selected={selected}
              data-testid={`compact-director-row-${d.id}`}
              data-selected={selected ? "true" : "false"}
            >
              {selected ? (
                <span
                  aria-hidden="true"
                  className="compact-board-director-selector__check-badge selection-check"
                >
                  ✓
                </span>
              ) : null}
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
                View Profile
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
