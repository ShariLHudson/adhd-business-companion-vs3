"use client";

import {
  buildChamberProgressMoments,
  type ChamberProgressMoment,
} from "@/lib/estate/chamberRoomExperience";

type Props = {
  moments?: ChamberProgressMoment[];
};

/** Progress recognition — recent wins and movement only. */
export function ChamberProgressRecognition({ moments }: Props) {
  const progressMoments = moments ?? buildChamberProgressMoments();
  if (progressMoments.length === 0) return null;

  return (
    <section
      className="chamber-room__panel chamber-room__progress"
      aria-label="Recent progress"
    >
      <h2 className="chamber-room__panel-title">You are moving</h2>
      <ul className="chamber-room__progress-list">
        {progressMoments.map((moment) => (
          <li key={moment.id} className="chamber-room__progress-item">
            {moment.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
