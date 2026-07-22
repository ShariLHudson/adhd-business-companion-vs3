"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  getBoardDirectorById,
  type BoardDirectorId,
} from "@/lib/board";
import {
  ROUND_TABLE_SCENE_SRC,
  ROUND_TABLE_SEATS,
  type RoundTableSeat,
} from "@/lib/board/roundTable";
import { useDismissibleWindow } from "@/lib/windowDismiss";
import "@/app/companion/round-table-overlay.css";

type Props = {
  open: boolean;
  activeDirectorId: BoardDirectorId | null;
  /** Directors included in Board Review — future discussion markers */
  includedDirectorIds?: readonly BoardDirectorId[];
  onClose: () => void;
  onSelectDirector: (directorId: BoardDirectorId) => void;
  onSelectMemberPlace?: () => void;
  /** Optional: open profile for highlighted Director without closing overlay first */
  onOpenDirectorProfile?: (directorId: BoardDirectorId) => void;
};

/**
 * Official Spark Estate Round Table — interactive Board navigation.
 * Empty chairs are not interactive Director seats.
 */
export function RoundTableOverlay({
  open,
  activeDirectorId,
  includedDirectorIds = [],
  onClose,
  onSelectDirector,
  onSelectMemberPlace,
  onOpenDirectorProfile,
}: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [hoveredSeatId, setHoveredSeatId] = useState<string | null>(null);
  const included = useMemo(
    () => new Set(includedDirectorIds),
    [includedDirectorIds],
  );

  const { requestClose, onBackdropClick } = useDismissibleWindow({
    open,
    onClose,
  });

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) setHoveredSeatId(null);
  }, [open]);

  if (!open) return null;

  const hoveredSeat = ROUND_TABLE_SEATS.find((s) => s.seatId === hoveredSeatId);
  const hoverName = resolveSeatDisplayName(hoveredSeat);
  const activeDirector =
    activeDirectorId != null ? getBoardDirectorById(activeDirectorId) : null;

  return (
    <div
      className="round-table-overlay"
      data-testid="round-table-overlay"
      role="presentation"
    >
      <button
        type="button"
        className="round-table-overlay__scrim"
        aria-label="Close Round Table"
        data-testid="round-table-overlay-scrim"
        onClick={() => onBackdropClick()}
        tabIndex={-1}
      />

      <div
        className="round-table-overlay__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="round-table-overlay-panel"
      >
        <header className="round-table-overlay__header">
          <div>
            <p className="round-table-overlay__kicker">Board of Directors</p>
            <h2 id={titleId} className="round-table-overlay__title">
              Choose Directors
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="round-table-overlay__close"
            aria-label="Close Round Table"
            data-testid="round-table-overlay-close"
            onClick={requestClose}
          >
            ×
          </button>
        </header>

        <div className="round-table-overlay__stage">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ROUND_TABLE_SCENE_SRC}
            alt="Spark Estate Round Table"
            className="round-table-overlay__scene"
            draggable={false}
          />

          <div
            className="round-table-overlay__hotspots"
            role="list"
            aria-label="Chairs at the Round Table"
          >
            {ROUND_TABLE_SEATS.map((seat) => {
              const isActive =
                seat.kind === "director" &&
                seat.directorId === activeDirectorId;
              const isIncluded =
                seat.directorId != null && included.has(seat.directorId);
              const name = resolveSeatDisplayName(seat);

              if (seat.kind === "empty") {
                return (
                  <div
                    key={seat.seatId}
                    role="listitem"
                    className="round-table-seat round-table-seat--empty"
                    style={{ left: `${seat.x}%`, top: `${seat.y}%` }}
                    data-testid={`round-table-seat-${seat.seatId}`}
                    data-seat-kind="empty"
                    aria-label={seat.label}
                    title={seat.label}
                  >
                    <span className="round-table-seat__marker" aria-hidden />
                  </div>
                );
              }

              const role =
                seat.kind === "director" && seat.directorId
                  ? getBoardDirectorById(seat.directorId)?.shortRole
                  : null;
              const dimUnselected =
                seat.kind === "director" &&
                includedDirectorIds.length > 0 &&
                !isIncluded;

              return (
                <button
                  key={seat.seatId}
                  type="button"
                  role="listitem"
                  className={[
                    "round-table-seat",
                    seat.kind === "member" ? "round-table-seat--member" : "",
                    seat.chairHighlight ? "round-table-seat--chair" : "",
                    isActive ? "round-table-seat--active" : "",
                    isIncluded ? "round-table-seat--included" : "",
                    dimUnselected ? "round-table-seat--dimmed" : "",
                    hoveredSeatId === seat.seatId
                      ? "round-table-seat--hover"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ left: `${seat.x}%`, top: `${seat.y}%` }}
                  data-testid={`round-table-seat-${seat.seatId}`}
                  data-director-id={seat.directorId ?? undefined}
                  data-seat-kind={seat.kind}
                  data-selected={
                    seat.kind === "director"
                      ? isIncluded
                        ? "true"
                        : "false"
                      : undefined
                  }
                  aria-label={role ? `${name}, ${role}` : name}
                  aria-pressed={
                    seat.kind === "director" ? isIncluded : undefined
                  }
                  aria-current={isActive ? "true" : undefined}
                  title={role ? `${name} — ${role}` : name}
                  onMouseEnter={() => setHoveredSeatId(seat.seatId)}
                  onMouseLeave={() => setHoveredSeatId(null)}
                  onFocus={() => setHoveredSeatId(seat.seatId)}
                  onBlur={() => setHoveredSeatId(null)}
                  onClick={() => {
                    if (seat.kind === "member") {
                      onSelectMemberPlace?.();
                      return;
                    }
                    if (seat.directorId) {
                      onSelectDirector(seat.directorId);
                    }
                  }}
                >
                  <span className="round-table-seat__marker" aria-hidden />
                  <span className="round-table-seat__label">
                    <span className="round-table-seat__label-name">{name}</span>
                    {role ? (
                      <span className="round-table-seat__label-role">{role}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          {hoverName ? (
            <p
              className="round-table-overlay__hover-name"
              data-testid="round-table-hover-name"
              aria-live="polite"
            >
              {hoverName}
            </p>
          ) : (
            <p className="round-table-overlay__hover-name round-table-overlay__hover-name--hint">
              Each Director&apos;s name is shown at their seat
            </p>
          )}
        </div>

        {activeDirector ? (
          <div className="round-table-overlay__actions">
            <button
              type="button"
              className="round-table-overlay__action"
              data-testid="round-table-open-director-profile"
              onClick={() => {
                onOpenDirectorProfile?.(activeDirector.id);
                onSelectDirector(activeDirector.id);
              }}
            >
              Open {activeDirector.name.split(/\s+/)[0]} Profile
            </button>
            <button
              type="button"
              className="round-table-overlay__action round-table-overlay__action--secondary"
              data-testid="round-table-return-to-director"
              onClick={requestClose}
            >
              Return to {activeDirector.name.split(/\s+/)[0]}
            </button>
          </div>
        ) : null}

        <p className="round-table-overlay__footnote">
          Official Board navigation — choose a Director&apos;s chair to meet
          them. Empty chairs are reserved for future Directors.
        </p>
      </div>
    </div>
  );
}

function resolveSeatDisplayName(seat: RoundTableSeat | undefined): string {
  if (!seat) return "";
  if (seat.kind === "member") return "Your seat";
  if (seat.kind === "empty" || !seat.directorId) return seat.label;
  const d = getBoardDirectorById(seat.directorId);
  return d?.name ?? seat.label;
}
