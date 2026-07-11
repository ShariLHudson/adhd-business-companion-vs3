import type {
  Mission,
  MissionId,
  MissionMilestone,
  MissionRelationship,
  MissionTimelineEvent,
} from "../types";

const TS = "2026-07-06T08:00:00.000Z";

export const SAMPLE_MISSIONS: Mission[] = [
  {
    id: "listening-rooms",
    name: "Listening Rooms",
    purpose:
      "Calm estate spaces where members return without pressure — gentle re-entry after interruption.",
    status: "active",
    phase: "Build",
    priority: "critical",
    strategicValue: 92,
    progress: 64,
    estimatedImpact: "High member trust and reduced restart friction",
    tags: ["estate", "companion", "adhd"],
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: TS,
  },
  {
    id: "founder-studio",
    name: "Founder Studio",
    purpose: "Shari's private executive headquarters — one operating system for the entire day.",
    status: "active",
    phase: "Build",
    priority: "high",
    strategicValue: 88,
    progress: 72,
    estimatedImpact: "Executive clarity without module hunting",
    tags: ["founder", "executive"],
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: TS,
  },
  {
    id: "companion",
    name: "Spark Companion",
    purpose: "Member-facing ADHD business companion — relationship is the product.",
    status: "active",
    phase: "Grow",
    priority: "critical",
    strategicValue: 95,
    progress: 58,
    estimatedImpact: "Daily member partnership over generic AI",
    tags: ["companion", "conversation"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: TS,
  },
  {
    id: "postcraft",
    name: "PostCraft",
    purpose: "Transform ideas into campaigns — content that traces to real member outcomes.",
    status: "active",
    phase: "Launch",
    priority: "high",
    strategicValue: 80,
    progress: 45,
    estimatedImpact: "Revenue-aligned content pipeline",
    tags: ["postcraft", "marketing"],
    createdAt: "2026-03-15T00:00:00.000Z",
    updatedAt: TS,
  },
  {
    id: "workshop-series",
    name: "Workshop Series",
    purpose: "Live transformation experiences that feed courses, content, and member growth.",
    status: "active",
    phase: "Define",
    priority: "medium",
    strategicValue: 76,
    progress: 38,
    estimatedImpact: "Cohort momentum and offer ladder",
    tags: ["workshop", "revenue"],
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: TS,
  },
  {
    id: "estate",
    name: "Spark Estate",
    purpose: "Premium cognitive interface — beauty before information, places not pages.",
    status: "active",
    phase: "Grow",
    priority: "high",
    strategicValue: 90,
    progress: 55,
    estimatedImpact: "Memorable places members want to stay",
    tags: ["estate", "experience"],
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: TS,
  },
  {
    id: "marketing-launch",
    name: "Marketing Launch",
    purpose: "Gentle Restart campaign — PostCraft through GHL nurture to member re-entry.",
    status: "planned",
    phase: "Discover",
    priority: "medium",
    strategicValue: 70,
    progress: 22,
    estimatedImpact: "Campaign aligned to SPARK restart pattern",
    tags: ["ghl", "postcraft"],
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: TS,
  },
];

export const SAMPLE_MISSION_RELATIONSHIPS: MissionRelationship[] = [
  {
    id: "rel-lr-companion",
    fromMissionId: "listening-rooms",
    toMissionId: "companion",
    relationship: "supports",
    summary: "Listening Rooms give Companion a calm re-entry surface.",
  },
  {
    id: "rel-lr-workshop",
    fromMissionId: "listening-rooms",
    toMissionId: "workshop-series",
    relationship: "connects_to",
    summary: "Workshop narratives can reference calm return rituals.",
  },
  {
    id: "rel-lr-postcraft",
    fromMissionId: "listening-rooms",
    toMissionId: "postcraft",
    relationship: "creates_content_for",
    summary: "Gentle Restart content educates members on re-entry.",
  },
  {
    id: "rel-lr-ghl",
    fromMissionId: "listening-rooms",
    toMissionId: "marketing-launch",
    relationship: "launches_through",
    summary: "GHL nurture sequence carries restart campaign.",
  },
  {
    id: "rel-fs-estate",
    fromMissionId: "founder-studio",
    toMissionId: "estate",
    relationship: "informs",
    summary: "Founder decisions shape estate room priorities.",
  },
  {
    id: "rel-companion-estate",
    fromMissionId: "companion",
    toMissionId: "estate",
    relationship: "depends_on",
    summary: "Companion conversation floats over estate scenes.",
  },
];

export const SAMPLE_MISSION_MILESTONES: MissionMilestone[] = [
  {
    id: "ms-lr-1",
    missionId: "listening-rooms",
    title: "Estate scene polish",
    summary: "Living scene with gentle light flicker passes Photograph Test.",
    completed: true,
    dueLabel: "Complete",
  },
  {
    id: "ms-lr-2",
    missionId: "listening-rooms",
    title: "SPARK restart pattern wired",
    summary: "Mission consumes pat-restart-001 without Companion duplication.",
    completed: false,
    dueLabel: "This week",
  },
  {
    id: "ms-lr-3",
    missionId: "listening-rooms",
    title: "PostCraft campaign draft",
    summary: "Gentle Restart series aligned to mission knowledge.",
    completed: false,
    dueLabel: "Next",
  },
];

export const SAMPLE_MISSION_TIMELINE: MissionTimelineEvent[] = [
  {
    id: "tl-lr-1",
    missionId: "listening-rooms",
    kind: "idea",
    title: "Calm re-entry estate space",
    summary: "Idea: members need a listening room before productivity pressure.",
    occurredAt: "2026-05-12T10:00:00.000Z",
  },
  {
    id: "tl-lr-2",
    missionId: "listening-rooms",
    kind: "research",
    title: "ADHD restart research aligned",
    summary: "Member feedback matches research on interruption recovery.",
    occurredAt: "2026-06-02T14:00:00.000Z",
  },
  {
    id: "tl-lr-3",
    missionId: "listening-rooms",
    kind: "decision",
    title: "Invest in restart intelligence first",
    summary: "Executive Strategy Center — no new dashboards before re-entry.",
    occurredAt: "2026-06-18T16:30:00.000Z",
  },
  {
    id: "tl-lr-4",
    missionId: "listening-rooms",
    kind: "milestone",
    title: "Listening Rooms scene shipped",
    summary: "Estate background and flicker live in Conservatory adjacency.",
    occurredAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "tl-lr-5",
    missionId: "listening-rooms",
    kind: "marketing",
    title: "Gentle Restart campaign outlined",
    summary: "PostCraft draft hooks tied to mission — pending approval.",
    occurredAt: "2026-07-05T11:00:00.000Z",
  },
];

export const DEFAULT_ACTIVE_MISSION_ID: MissionId = "listening-rooms";

export function getSampleMission(id: MissionId): Mission | undefined {
  return SAMPLE_MISSIONS.find((m) => m.id === id);
}

export function listSampleMissions(): Mission[] {
  return SAMPLE_MISSIONS.filter((m) => m.status === "active" || m.status === "planned");
}

export function getSampleRelationshipsForMission(
  missionId: MissionId,
): MissionRelationship[] {
  return SAMPLE_MISSION_RELATIONSHIPS.filter(
    (r) => r.fromMissionId === missionId || r.toMissionId === missionId,
  );
}

export function getSampleTimelineForMission(
  missionId: MissionId,
): MissionTimelineEvent[] {
  return SAMPLE_MISSION_TIMELINE.filter((t) => t.missionId === missionId).sort(
    (a, b) => a.occurredAt.localeCompare(b.occurredAt),
  );
}

export function getSampleMilestonesForMission(
  missionId: MissionId,
): MissionMilestone[] {
  return SAMPLE_MISSION_MILESTONES.filter((m) => m.missionId === missionId);
}
