/**
 * 106 — Relationship Explorer model ("This Blueprint Is Used By").
 */

import {
  listWorkBlueprintStates,
  listWorkRelationships,
  type WorkRelationship,
  type WorkRelationshipTargetType,
} from "@/lib/universalWorkEngine";

export type RelationshipExplorerBucketId =
  | "projects"
  | "works"
  | "calendar"
  | "tasks"
  | "goals"
  | "visual_maps"
  | "research"
  | "files"
  | "people"
  | "evidence";

export type RelationshipExplorerItem = {
  id: string;
  bucket: RelationshipExplorerBucketId;
  label: string;
  relationship: string;
  /** Navigation hint for host — never invent destinations. */
  navigateHint: {
    kind: WorkRelationshipTargetType | "work";
    id: string;
  };
};

export type RelationshipExplorerModel = {
  blueprintId: string;
  title: string;
  items: readonly RelationshipExplorerItem[];
  buckets: Readonly<Record<RelationshipExplorerBucketId, RelationshipExplorerItem[]>>;
};

const BUCKET_FOR: Partial<
  Record<WorkRelationshipTargetType, RelationshipExplorerBucketId>
> = {
  project: "projects",
  work: "works",
  "calendar-event": "calendar",
  task: "tasks",
  goal: "goals",
  "visual-thinking": "visual_maps",
  research: "research",
  file: "files",
  person: "people",
  evidence: "evidence",
};

const EMPTY_BUCKETS = (): Record<
  RelationshipExplorerBucketId,
  RelationshipExplorerItem[]
> => ({
  projects: [],
  works: [],
  calendar: [],
  tasks: [],
  goals: [],
  visual_maps: [],
  research: [],
  files: [],
  people: [],
  evidence: [],
});

function labelFor(rel: WorkRelationship): string {
  return rel.note?.trim() || `${rel.relationship} → ${rel.toRef.kind}`;
}

export function buildRelationshipExplorer(
  blueprintId: string,
): RelationshipExplorerModel {
  const works = listWorkBlueprintStates().filter(
    (w) => w.blueprintId === blueprintId,
  );
  const items: RelationshipExplorerItem[] = [];
  const buckets = EMPTY_BUCKETS();

  for (const work of works) {
    const workItem: RelationshipExplorerItem = {
      id: `work:${work.workId}`,
      bucket: "works",
      label: `Work ${work.workId}`,
      relationship: "uses blueprint",
      navigateHint: { kind: "work", id: work.workId },
    };
    items.push(workItem);
    buckets.works.push(workItem);

    for (const rel of listWorkRelationships(work.workId)) {
      const bucket = BUCKET_FOR[rel.toRef.kind];
      if (!bucket) continue;
      const item: RelationshipExplorerItem = {
        id: rel.id,
        bucket,
        label: labelFor(rel),
        relationship: rel.relationship,
        navigateHint: { kind: rel.toRef.kind, id: rel.toRef.id },
      };
      items.push(item);
      buckets[bucket].push(item);
    }
  }

  return {
    blueprintId,
    title: "This Blueprint Is Used By",
    items,
    buckets,
  };
}
