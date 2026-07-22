/**
 * Certification inventory — which living objects participate in the
 * shared relationship graph vs remain orphaned (Prompt 141 Phase 1).
 *
 * Status is documentation-as-code for the gap register — not a live scan.
 */

export type GraphParticipationStatus =
  | "in_graph"
  | "partial"
  | "orphaned"
  | "planned";

export type GraphParticipationEntry = {
  entity: string;
  kind: string;
  status: GraphParticipationStatus;
  /** Primary edge / hook surface today */
  surface: string;
  gap?: string;
};

/**
 * Phase 1 inventory — honest Provisional.
 * Update when an entity gains trusted lineage edges.
 */
export const RELATIONSHIP_GRAPH_PARTICIPATION: readonly GraphParticipationEntry[] =
  [
    {
      entity: "Universal Work",
      kind: "work",
      status: "in_graph",
      surface: "workRelationships + WorkIdentity",
    },
    {
      entity: "Project",
      kind: "project",
      status: "partial",
      surface: "part_of edges · project hooks (conversations/files/links/notes)",
      gap: "Not all legacy projects have Work edges; hub surfaces trusted links only",
    },
    {
      entity: "Blueprint",
      kind: "blueprint",
      status: "in_graph",
      surface: "implements edges on create lineage",
    },
    {
      entity: "Cartography node / Map",
      kind: "cartography_node",
      status: "partial",
      surface: "visualizes edges when launched from map context",
      gap: "Prompt 140 may deepen map UI — keep shared edges here",
    },
    {
      entity: "Conversation",
      kind: "conversation",
      status: "partial",
      surface: "projectConversations store · knownContext.conversation_id",
      gap: "No first-class WorkRelationshipTargetType for conversation yet",
    },
    {
      entity: "Evidence",
      kind: "evidence",
      status: "partial",
      surface: "WorkRelationshipTargetType.evidence · evidenceBankStore",
      gap: "Few auto-lineage paths; mostly explicit link",
    },
    {
      entity: "Win / Accomplishment",
      kind: "win",
      status: "partial",
      surface: "WorkRelationshipTargetType.win | accomplishment",
      gap: "Business Pulse / Wins not fully bridged to project hub",
    },
    {
      entity: "Strategy library entry",
      kind: "document",
      status: "orphaned",
      surface: "StrategiesPanel local tools only",
      gap: "No strategy target kind; Work origin=strategies when Create from Strategies",
    },
    {
      entity: "Business Pulse signal",
      kind: "intelligence-signal",
      status: "orphaned",
      surface: "Pulse UI",
      gap: "Deferred — Phase 2+ of 141",
    },
    {
      entity: "Thought / Clear My Mind",
      kind: "thought",
      status: "partial",
      surface: "IntelligenceReadyHooks · knownContext.clear_my_mind",
      gap: "Lineage to Work when promoted; not reverse-indexed in Projects hub",
    },
    {
      entity: "Journal entry",
      kind: "journal-entry",
      status: "planned",
      surface: "WorkRelationshipTargetType.journal-entry",
      gap: "Target type exists; auto-lineage not wired",
    },
    {
      entity: "Living Intelligence Graph (LIG)",
      kind: "connectionIds",
      status: "partial",
      surface: "IntelligenceReadyHooks.connectionIds",
      gap: "Hooks present; typed LIG edges not universally populated",
    },
  ] as const;

export function countByParticipationStatus(): Record<
  GraphParticipationStatus,
  number
> {
  const counts: Record<GraphParticipationStatus, number> = {
    in_graph: 0,
    partial: 0,
    orphaned: 0,
    planned: 0,
  };
  for (const entry of RELATIONSHIP_GRAPH_PARTICIPATION) {
    counts[entry.status] += 1;
  }
  return counts;
}

export function listOrphanedOrGapped(): GraphParticipationEntry[] {
  return RELATIONSHIP_GRAPH_PARTICIPATION.filter(
    (e) => e.status === "orphaned" || e.status === "planned" || Boolean(e.gap),
  );
}
