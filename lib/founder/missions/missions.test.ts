import { describe, expect, it, beforeEach } from "vitest";

import {
  DEFAULT_ACTIVE_MISSION_ID,
  composeMission,
  describeRelationship,
  getActiveMission,
  listMissions,
  missionService,
  relationshipsForMission,
} from "./index";

describe("Mission Engine™", () => {
  beforeEach(() => {
    missionService.setActiveMission(DEFAULT_ACTIVE_MISSION_ID);
  });

  it("lists configurable example missions", () => {
    const missions = listMissions();
    expect(missions.length).toBeGreaterThanOrEqual(7);
    expect(missions.map((m) => m.id)).toContain("listening-rooms");
    expect(missions.map((m) => m.id)).toContain("postcraft");
  });

  it("getActiveMission defaults to Listening Rooms", () => {
    expect(getActiveMission().id).toBe("listening-rooms");
    expect(getActiveMission().name).toContain("Listening Rooms");
  });

  it("mission switching updates active mission", () => {
    const switched = missionService.setActiveMission("companion");
    expect(switched?.id).toBe("companion");
    expect(missionService.getActiveMission().id).toBe("companion");
  });

  it("composeMission assembles overview from existing services", () => {
    const composed = composeMission("listening-rooms");
    expect(composed).not.toBeNull();
    expect(composed!.overview.headline).toContain("Listening Rooms");
    expect(composed!.overview.currentRecommendation).toBeTruthy();
    expect(composed!.overview.primaryAction.title).toBeTruthy();
    expect(composed!.overview.progress).toBeGreaterThan(0);
  });

  it("getMissionOverview and getMissionProgress match composed mission", () => {
    const overview = missionService.getMissionOverview("listening-rooms");
    const progress = missionService.getMissionProgress("listening-rooms");
    const composed = composeMission("listening-rooms");

    expect(overview?.missionId).toBe("listening-rooms");
    expect(progress?.overall).toBe(composed?.progress.overall);
    expect(progress?.milestonesTotal).toBeGreaterThan(0);
  });

  it("mission relationships interconnect initiatives", () => {
    const rels = relationshipsForMission("listening-rooms");
    expect(rels.length).toBeGreaterThan(0);
    expect(rels.some((r) => r.toMissionId === "companion" || r.fromMissionId === "companion")).toBe(
      true,
    );
    const description = describeRelationship(rels[0]);
    expect(description.length).toBeGreaterThan(10);
  });

  it("composed mission includes timeline, knowledge, and actions", () => {
    const composed = composeMission("listening-rooms")!;
    expect(composed.timeline.length).toBeGreaterThan(0);
    expect(composed.knowledge.some((g) => g.items.length > 0)).toBe(true);
    expect(composed.actions.length).toBeGreaterThan(0);
    expect(composed.decisions.length).toBeGreaterThan(0);
  });

  it("does not duplicate — pulls from workspace and workflow layers", () => {
    const composed = composeMission("listening-rooms")!;
    expect(composed.research.length + composed.content.length).toBeGreaterThan(0);
    expect(composed.opportunities.length).toBeGreaterThan(0);
    expect(composed.risks.length).toBeGreaterThan(0);
  });
});
