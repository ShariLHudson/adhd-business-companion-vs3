"use client";

import {
  connectedPlacesForProjectHome,
  type ConnectedPlaceShortcut,
  type ProjectHomeRoomId,
} from "@/lib/projectHomes";

type Props = {
  projectHomeId: ProjectHomeRoomId;
  /** Prototype only — shortcuts do not navigate yet */
  onPlacePress?: (place: ConnectedPlaceShortcut) => void;
};

/** Connected Places — Estate destination shortcuts (no data duplication). */
export function ConnectedPlacesSection({
  projectHomeId,
  onPlacePress,
}: Props) {
  const places = connectedPlacesForProjectHome(projectHomeId);

  return (
    <section
      className="project-homes-section project-homes-connected"
      aria-label="Connected Places"
    >
      <h3>Connected Places</h3>
      <p className="project-homes-connected__lead">
        Nearby destinations in Spark Estate — shortcuts only, when you want
        them.
      </p>
      <ul className="project-homes-connected__list">
        {places.map((place) => (
          <li key={place.id}>
            <button
              type="button"
              className="project-homes-connected__item"
              onClick={() => onPlacePress?.(place)}
            >
              <span className="project-homes-connected__label">
                {place.label}
              </span>
              <span className="project-homes-connected__blurb">
                {place.blurb}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
