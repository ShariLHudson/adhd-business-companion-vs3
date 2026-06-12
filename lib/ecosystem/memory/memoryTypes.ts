// Founder Ecosystem — Phase 6 Memory & Relationship Graph types.
//
// One graph connects every object so the founder never has to remember where
// something came from. Nodes are objects; edges are relationships. Everything
// is derived from the event stream and is graph-friendly (ready to visualize).

import type { ID, ISODateString } from "../models";

export type NodeType =
  | "founder"
  | "project"
  | "task"
  | "document"
  | "decision"
  | "opportunity"
  | "goal"
  | "timeblock"
  | "focus-session"
  | "painpoint"
  | "win"
  | "recommendation"
  | "advisor-insight";

export type RelationType =
  | "belongs-to" // document/task → project
  | "affects" // decision/painpoint → project
  | "supports" // task → goal
  | "came-from" // opportunity → project
  | "completed" // win → project/goal/task
  | "references" // recommendation → decision
  | "scheduled-for" // timeblock → project
  | "worked-on" // focus-session → project
  | "pursues"; // founder → goal

export type GraphNode = {
  id: ID;
  type: NodeType;
  label: string;
  data?: Record<string, unknown>;
  createdAt?: ISODateString;
  lastActivity?: ISODateString;
};

export type GraphEdge = {
  id: ID;
  from: ID;
  to: ID;
  type: RelationType;
  label?: string;
};

export type RelationshipGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

// ---- Per-object memory views -------------------------------------------
export type ProjectMemory = {
  projectId: ID;
  name: string;
  purpose: string | null; // the decision/goal that motivated it
  goals: string[];
  documents: { id: ID; title: string }[];
  tasks: { id: ID; title: string; done: boolean }[];
  decisions: { id: ID; text: string; status: string }[];
  wins: { id: ID; label: string }[];
  risks: { type: string; label: string }[];
  opportunities: { id: ID; text: string }[];
  lastActivity: ISODateString | null;
  nextStep: string | null;
};

export type DecisionMemory = {
  id: ID;
  decision: string;
  reason: string | null;
  alternatives: string[];
  outcome: string | null;
  status: string;
  relatedProjectIds: ID[];
};

export type OpportunityMemory = {
  id: ID;
  idea: string;
  origin: string; // where it surfaced (chat / clear-my-mind / project / create)
  relatedProjectId?: ID;
  status: string;
  potentialImpact: "low" | "medium" | "high";
};

export type PainPointMemory = {
  id: ID;
  issue: string;
  frequency: number;
  projectsImpacted: ID[];
  recommendedSupport: string;
};

export type FounderMemory = {
  graph: RelationshipGraph;
  projects: ProjectMemory[];
  decisions: DecisionMemory[];
  opportunities: OpportunityMemory[];
  painPoints: PainPointMemory[];
};
