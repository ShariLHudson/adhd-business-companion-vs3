"use client";

import {
  connectedPlacesForProjectHome,
  type ProjectHomeRoomId,
} from "@/lib/projectHomes";

type Props = {
  projectHomeId: ProjectHomeRoomId;
};

/**
 * Connected Places — preparing state only.
 * No routing to old workspaces; items are not clickable destinations.
 */
export function ConnectedPlacesSection({ projectHomeId }: Props) {
  const places = connectedPlacesForProjectHome(projectHomeId);

  return (
    <section
      className="project-homes-section project-homes-connected"
      aria-label="Connected Places"
      data-testid="project-homes-connected-places"
    >
      <h3>Connected Places</h3>
      <p className="project-homes-connected__lead">
        Nearby destinations in Spark Estate — connections are being prepared.
      </p>
      <ul className="project-homes-connected__list">
        {places.map((place) => (
          <li key={place.id}>
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
          </li>
        ))}
      </ul>
    </section>
  );
}
