"use client";

import {
  buildChamberMomentumPathItems,
  type ChamberMomentumPathItem,
} from "@/lib/estate/chamberRoomExperience";

type Props = {
  items?: ChamberMomentumPathItem[];
};

/** Momentum path — only when movement exists (no empty sections). */
export function ChamberMomentumPathArea({ items }: Props) {
  const pathItems = items ?? buildChamberMomentumPathItems();
  if (pathItems.length === 0) return null;

  return (
    <section
      className="chamber-room__panel chamber-room__path"
      aria-label="Current movement"
    >
      <h2 className="chamber-room__panel-title">Your momentum path</h2>
      <ul className="chamber-room__path-list">
        {pathItems.map((item) => (
          <li key={item.id} className="chamber-room__path-item">
            <span className="chamber-room__path-trademark">{item.trademark}</span>
            <span className="chamber-room__path-label">{item.label}</span>
            {item.detail ? (
              <span className="chamber-room__path-detail">{item.detail}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
