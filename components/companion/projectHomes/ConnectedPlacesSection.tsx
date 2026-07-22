"use client";

import {
  activeConnectedPlaces,
  comingLaterConnectedPlaces,
  type ProjectHomeRecord,
  type ProjectHomeRoomId,
} from "@/lib/projectHomes";

type Props = {
  projectHomeId: ProjectHomeRoomId;
  /** Present when a real "Boardroom" hand-off is wired for this project. */
  project?: ProjectHomeRecord;
  onCallTheBoard?: (project: ProjectHomeRecord) => void;
};

/**
 * Connected Places — only genuinely wired destinations act like buttons.
 * Everything else is named once, in plain language, in a small
 * "Coming later" line — never a large grid of "Coming soon" cards
 * competing with working tools (Connected Places Completion).
 */
export function ConnectedPlacesSection({
  projectHomeId,
  project,
  onCallTheBoard,
}: Props) {
  const active = activeConnectedPlaces(projectHomeId);
  const comingLater = comingLaterConnectedPlaces(projectHomeId);

  return (
    <section
      className="project-homes-section project-homes-connected"
      aria-label="Connected Places"
      data-testid="project-homes-connected-places"
    >
      <h3>Connected Places</h3>
      <p className="project-homes-connected__lead">
        Nearby places in Spark Estate that can help with this project.
      </p>
      {active.length > 0 ? (
        <ul className="project-homes-connected__list">
          {active.map((place) => {
            const canOpen = place.id === "boardroom" && Boolean(onCallTheBoard) && Boolean(project);
            return (
              <li key={place.id}>
                {canOpen ? (
                  <button
                    type="button"
                    className="project-homes-connected__item project-homes-connected__item--active"
                    data-testid={`project-homes-connected-${place.id}`}
                    onClick={() => project && onCallTheBoard?.(project)}
                  >
                    <span className="project-homes-connected__label">
                      {place.label}
                    </span>
                    <span className="project-homes-connected__blurb">
                      {place.blurb}
                    </span>
                  </button>
                ) : (
                  <div
                    className="project-homes-connected__item project-homes-connected__item--preparing"
                    data-testid={`project-homes-connected-${place.id}`}
                    aria-disabled="true"
                  >
                    <span className="project-homes-connected__label">
                      {place.label}
                    </span>
                    <span className="project-homes-connected__blurb">
                      {place.blurb}
                    </span>
                    <span className="project-homes-connected__coming-soon">
                      Coming soon — this connection is being prepared.
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
      {comingLater.length > 0 ? (
        <p
          className="project-homes-connected__coming-later"
          data-testid="project-homes-connected-coming-later"
        >
          Coming later: {comingLater.map((p) => p.label).join(", ")}.
        </p>
      ) : null}
    </section>
  );
}
