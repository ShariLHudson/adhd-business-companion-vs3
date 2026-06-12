// Founder Ecosystem — Phase 6 Relationship Graph builder.
// Turns the event stream into a connected graph of nodes (objects) and edges
// (relationships). Optional intelligence adds recommendation / advisor-insight
// nodes. Pure; output is visualization-ready.

import type { FounderEvent, ID } from "../events";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import type {
  GraphEdge,
  GraphNode,
  NodeType,
  RelationshipGraph,
  RelationType,
} from "./memoryTypes";

const asStr = (v: unknown) => (typeof v === "string" ? v : undefined);
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

class Builder {
  nodes = new Map<ID, GraphNode>();
  edges = new Map<ID, GraphEdge>();

  node(id: ID, type: NodeType, label: string, ts?: string, data?: Record<string, unknown>) {
    const existing = this.nodes.get(id);
    if (existing) {
      if (ts && (!existing.lastActivity || ts > existing.lastActivity))
        existing.lastActivity = ts;
      return;
    }
    this.nodes.set(id, {
      id,
      type,
      label,
      data,
      createdAt: ts,
      lastActivity: ts,
    });
  }
  edge(from: ID, to: ID, type: RelationType, label?: string) {
    if (!this.nodes.has(from) || !this.nodes.has(to)) return;
    const id = `${from}->${to}:${type}`;
    if (!this.edges.has(id)) this.edges.set(id, { id, from, to, type, label });
  }
  build(): RelationshipGraph {
    return { nodes: [...this.nodes.values()], edges: [...this.edges.values()] };
  }
}

export function buildGraph(
  events: FounderEvent[],
  intel?: FounderIntelligence,
): RelationshipGraph {
  const b = new Builder();
  if (events[0]) b.node(`founder:${events[0].founderId}`, "founder", "You");
  const founderNode = events[0] ? `founder:${events[0].founderId}` : null;

  for (const e of events) {
    const p = e.refs?.projectId;
    switch (e.type) {
      case "project.created":
        if (p) b.node(p, "project", asStr(e.data?.title) ?? "Project", e.ts);
        break;
      case "task.created":
        if (e.refs?.taskId) {
          b.node(e.refs.taskId, "task", asStr(e.data?.title) ?? "Task", e.ts);
          if (p) b.edge(e.refs.taskId, p, "belongs-to");
        }
        break;
      case "document.created":
        if (e.refs?.documentId) {
          b.node(e.refs.documentId, "document", asStr(e.data?.title) ?? "Document", e.ts);
          if (p) b.edge(e.refs.documentId, p, "belongs-to");
        }
        break;
      case "decision.created":
        if (e.refs?.decisionId) {
          b.node(e.refs.decisionId, "decision", asStr(e.data?.text) ?? "Decision", e.ts);
          if (p) b.edge(e.refs.decisionId, p, "affects");
        }
        break;
      case "opportunity.created":
        if (e.refs?.opportunityId) {
          b.node(e.refs.opportunityId, "opportunity", asStr(e.data?.text) ?? "Idea", e.ts);
          if (p) b.edge(e.refs.opportunityId, p, "came-from");
        }
        break;
      case "painpoint.observed":
        if (e.refs?.painPointId) {
          b.node(e.refs.painPointId, "painpoint", asStr(e.data?.text) ?? "Pain point", e.ts);
          if (p) b.edge(e.refs.painPointId, p, "affects");
        }
        break;
      case "timeblock.created":
        if (e.refs?.timeBlockId) {
          b.node(e.refs.timeBlockId, "timeblock", asStr(e.data?.title) ?? "Time block", e.ts);
          if (p) b.edge(e.refs.timeBlockId, p, "scheduled-for");
        }
        break;
      case "focus.completed": {
        const fs = `fs:${e.id}`;
        b.node(fs, "focus-session", "Focus session", e.ts);
        if (p) b.edge(fs, p, "worked-on");
        break;
      }
      case "checkin.recorded": {
        const priorities = Array.isArray(e.data?.priorities)
          ? (e.data!.priorities as string[])
          : [];
        for (const g of priorities) {
          const gid = `goal:${slug(g)}`;
          b.node(gid, "goal", g, e.ts);
          if (founderNode) b.edge(founderNode, gid, "pursues");
        }
        break;
      }
      default:
        break;
    }

    // Wins: any completion → a win node tied to its project (+ task).
    if (
      e.type === "task.completed" ||
      e.type === "project.completed" ||
      e.type === "document.exported"
    ) {
      const wid = `win:${e.id}`;
      const label =
        e.type === "task.completed"
          ? "Finished a task"
          : e.type === "project.completed"
            ? "Completed a project"
            : "Finished a document";
      b.node(wid, "win", label, e.ts);
      if (p) b.edge(wid, p, "completed");
      if (e.refs?.taskId && b.nodes.has(e.refs.taskId))
        b.edge(wid, e.refs.taskId, "completed");
    }
  }

  // Intelligence overlay: recommendations + advisor insights.
  if (intel) {
    for (const rec of intel.recommendations) {
      b.node(rec.id, "recommendation", rec.text);
      for (const objId of rec.relatedObjectIds) b.edge(rec.id, objId, "references");
    }
    for (const ins of intel.insights) {
      b.node(ins.id, "advisor-insight", ins.text);
    }
  }

  return b.build();
}
