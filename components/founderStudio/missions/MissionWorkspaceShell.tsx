"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_ACTIVE_MISSION_ID,
  composeMission,
  listMissions,
  missionService,
  type MissionId,
} from "@/lib/founder/missions";

import { MissionActions } from "./MissionActions";
import { MissionHeader } from "./MissionHeader";
import { MissionKnowledge } from "./MissionKnowledge";
import { MissionSwitcher } from "./MissionSwitcher";
import { MissionTimeline } from "./MissionTimeline";
import { RelatedMissions } from "./RelatedMissions";

type MissionWorkspaceShellProps = {
  initialMissionId?: MissionId;
};

export function MissionWorkspaceShell({
  initialMissionId = DEFAULT_ACTIVE_MISSION_ID,
}: MissionWorkspaceShellProps) {
  const missions = useMemo(() => listMissions(), []);
  const [activeId, setActiveId] = useState<MissionId>(initialMissionId);

  const handleSelect = (id: MissionId) => {
    missionService.setActiveMission(id);
    setActiveId(id);
  };

  const composed = useMemo(() => composeMission(activeId), [activeId]);

  if (!composed) {
    return null;
  }

  return (
    <section className="founder-mission-workspace" aria-labelledby="founder-mission-workspace-title">
      <p className="founder-mission-workspace__eyebrow" id="founder-mission-workspace-title">
        Mission Workspace
      </p>

      <MissionSwitcher missions={missions} activeId={activeId} onSelect={handleSelect} />
      <MissionHeader composed={composed} />

      <div className="founder-mission-workspace__body">
        <MissionTimeline events={composed.timeline} />
        <MissionKnowledge groups={composed.knowledge} />
        <MissionActions actions={composed.actions} />
        <RelatedMissions missionId={activeId} relationships={composed.relationships} />
      </div>
    </section>
  );
}
