"use client";

import type { Mission, MissionId } from "@/lib/founder/missions";

type MissionSwitcherProps = {
  missions: Mission[];
  activeId: MissionId;
  onSelect: (id: MissionId) => void;
};

export function MissionSwitcher({ missions, activeId, onSelect }: MissionSwitcherProps) {
  const active = missions.find((m) => m.id === activeId);

  return (
    <div className="founder-mission-switcher">
      <label className="founder-mission-switcher__label" htmlFor="founder-mission-select">
        What are we building?
      </label>
      <select
        id="founder-mission-select"
        className="founder-mission-switcher__select"
        value={activeId}
        onChange={(e) => onSelect(e.target.value as MissionId)}
        aria-label="Switch active mission"
      >
        {missions.map((mission) => (
          <option key={mission.id} value={mission.id}>
            {mission.name}
          </option>
        ))}
      </select>
      {active ? (
        <p className="founder-mission-switcher__purpose">{active.purpose}</p>
      ) : null}
    </div>
  );
}
