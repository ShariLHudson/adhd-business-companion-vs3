// Founder Ecosystem — Phase 6 Founder Memory Engine.
// Composes the relationship graph + per-object memories, and answers the
// context questions a founder should never have to remember the answer to.

import type { FounderEvent, ID } from "../events";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import { buildGraph } from "./relationshipGraph";
import {
  decisionsAffecting,
  documentsForProject,
  opportunitiesFromProject,
  relatedTo,
  tasksForProject,
} from "./memoryQueries";
import type {
  DecisionMemory,
  FounderMemory,
  OpportunityMemory,
  PainPointMemory,
  ProjectMemory,
} from "./memoryTypes";

const asStr = (v: unknown) => (typeof v === "string" ? v : undefined);

function originLabel(ws?: string): string {
  switch (ws) {
    case "clear-my-mind":
      return "Clear My Mind";
    case "projects":
      return "a project";
    case "create":
      return "Create";
    default:
      return "a conversation";
  }
}

const PAIN_SUPPORT: { re: RegExp; label: string; path: string }[] = [
  { re: /overwhelm|too much|drowning/i, label: "Overwhelm", path: "Clear My Mind, then one next step" },
  { re: /low energy|tired|exhaust|drained|burn/i, label: "Low energy", path: "Smaller steps + Breathe" },
  { re: /procrastinat|avoid|putting off/i, label: "Procrastination / avoidance", path: "The 2-Minute Entry" },
  { re: /focus|distract|attention/i, label: "Focus", path: "Focus Session + Focus Audio" },
  { re: /decision|can'?t (decide|choose)/i, label: "Decision fatigue", path: "Pick Then Learn" },
];
function classifyPain(text: string) {
  for (const r of PAIN_SUPPORT) if (r.re.test(text)) return r;
  return { label: "Friction", path: "Talk it through with Shari" };
}

export function buildFounderMemory(
  events: FounderEvent[],
  founderId: ID,
  intelOverride?: FounderIntelligence,
): FounderMemory {
  const mine = events.filter((e) => e.founderId === founderId);
  const intel = intelOverride ?? getFounderIntelligence(mine, founderId);
  const graph = buildGraph(mine, intel);

  const completedTasks = new Set(
    mine.filter((e) => e.type === "task.completed").map((e) => e.refs?.taskId),
  );

  const goals = [
    ...new Set(
      mine
        .filter((e) => e.type === "checkin.recorded")
        .flatMap((e) =>
          Array.isArray(e.data?.priorities) ? (e.data!.priorities as string[]) : [],
        ),
    ),
  ];

  // ---- Project memories -------------------------------------------------
  const projects: ProjectMemory[] = graph.nodes
    .filter((n) => n.type === "project")
    .map((proj) => {
      const decisions = decisionsAffecting(graph, proj.id);
      const purpose = decisions[0]?.label ?? goals[0] ?? null;
      const openTask = mine
        .filter(
          (e) =>
            e.type === "task.created" &&
            e.refs?.projectId === proj.id &&
            !completedTasks.has(e.refs?.taskId),
        )
        .sort((a, b) => (a.ts < b.ts ? 1 : -1))[0];
      return {
        projectId: proj.id,
        name: proj.label,
        purpose,
        goals,
        documents: documentsForProject(graph, proj.id).map((d) => ({
          id: d.id,
          title: d.label,
        })),
        tasks: tasksForProject(graph, proj.id).map((t) => ({
          id: t.id,
          title: t.label,
          done: completedTasks.has(t.id),
        })),
        decisions: decisions.map((d) => ({
          id: d.id,
          text: d.label,
          status: "open",
        })),
        wins: relatedTo(graph, proj.id, "win").map((w) => ({
          id: w.id,
          label: w.label,
        })),
        risks: intel.risks
          .filter((r) => r.relatedProjectIds.includes(proj.id))
          .map((r) => ({ type: r.type, label: r.label })),
        opportunities: opportunitiesFromProject(graph, proj.id).map((o) => ({
          id: o.id,
          text: o.label,
        })),
        lastActivity: proj.lastActivity ?? null,
        nextStep: asStr(openTask?.data?.title) ?? null,
      };
    });

  // ---- Decision memories ------------------------------------------------
  const resolved = new Map<ID, string>();
  for (const e of mine.filter((e) => e.type === "decision.updated")) {
    if (e.refs?.decisionId) resolved.set(e.refs.decisionId, asStr(e.data?.status) ?? "made");
  }
  const decisions: DecisionMemory[] = mine
    .filter((e) => e.type === "decision.created" && e.refs?.decisionId)
    .map((e) => {
      const text = asStr(e.data?.text) ?? "Decision";
      const alternatives = / or /i.test(text)
        ? text.replace(/\?$/, "").split(/\bor\b/i).map((s) => s.trim()).filter(Boolean)
        : [];
      return {
        id: e.refs!.decisionId!,
        decision: text,
        reason: asStr(e.data?.reason) ?? null,
        alternatives,
        outcome: null,
        status: resolved.get(e.refs!.decisionId!) ?? "open",
        relatedProjectIds: e.refs?.projectId ? [e.refs.projectId] : [],
      };
    });

  // ---- Opportunity memories ---------------------------------------------
  const opportunities: OpportunityMemory[] = mine
    .filter((e) => e.type === "opportunity.created" && e.refs?.opportunityId)
    .map((e) => {
      const text = asStr(e.data?.text) ?? "Idea";
      const impact: "low" | "medium" | "high" = /cohort|partner|revenue|launch|scale/i.test(
        text,
      )
        ? "high"
        : "medium";
      return {
        id: e.refs!.opportunityId!,
        idea: text,
        origin: originLabel(e.refs?.workspace),
        relatedProjectId: e.refs?.projectId,
        status: "idea",
        potentialImpact: impact,
      };
    });

  // ---- Pain point memories ----------------------------------------------
  const painGroups = new Map<string, PainPointMemory>();
  for (const e of mine.filter((e) => e.type === "painpoint.observed")) {
    const text = asStr(e.data?.text) ?? "";
    if (!text) continue;
    const { label, path } = classifyPain(text);
    const cur = painGroups.get(label);
    if (!cur) {
      painGroups.set(label, {
        id: `pain:${label}`,
        issue: label,
        frequency: 1,
        projectsImpacted: e.refs?.projectId ? [e.refs.projectId] : [],
        recommendedSupport: path,
      });
    } else {
      cur.frequency += 1;
      if (e.refs?.projectId && !cur.projectsImpacted.includes(e.refs.projectId))
        cur.projectsImpacted.push(e.refs.projectId);
    }
  }

  return {
    graph,
    projects,
    decisions,
    opportunities,
    painPoints: [...painGroups.values()].sort((a, b) => b.frequency - a.frequency),
  };
}

// ---- Context retrieval (the questions the founder shouldn't have to recall) --
export function whatAmIWorkingOn(memory: FounderMemory): ProjectMemory | null {
  return (
    memory.projects
      .slice()
      .sort((a, b) => (a.lastActivity ?? "") < (b.lastActivity ?? "") ? 1 : -1)[0] ??
    null
  );
}

export function whyAmIWorkingOn(
  memory: FounderMemory,
  projectId: ID,
): string | null {
  return memory.projects.find((p) => p.projectId === projectId)?.purpose ?? null;
}

export function whatDecisionsLedHere(
  memory: FounderMemory,
  projectId: ID,
): DecisionMemory[] {
  return memory.decisions.filter((d) => d.relatedProjectIds.includes(projectId));
}

export function whatOpportunitiesExist(memory: FounderMemory): OpportunityMemory[] {
  return memory.opportunities.filter((o) => o.status !== "completed");
}

export function whatShouldHappenNext(
  memory: FounderMemory,
): string | null {
  const active = whatAmIWorkingOn(memory);
  return active?.nextStep ?? active?.risks[0]?.label ?? null;
}

export function whatHappenedTo(
  memory: FounderMemory,
  ideaText: string,
): OpportunityMemory | null {
  const q = ideaText.toLowerCase();
  return (
    memory.opportunities.find((o) => o.idea.toLowerCase().includes(q)) ?? null
  );
}
