/**
 * Build a Visual Focus tree draft from guided-step answers.
 * Map-specific structure — not one generic questionnaire layout.
 */

import type { CartographyMapDefinition } from "@/lib/cartographersStudio/mapDefinitions";
import type { VisualFocusMode, VisualFocusNode } from "../types";

function newNodeId(): string {
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function node(label: string, children: VisualFocusNode[] = []): VisualFocusNode {
  return { id: newNodeId(), label: label.trim() || "Untitled", children };
}

function splitList(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function text(raw: unknown, fallback: string): string {
  const t = typeof raw === "string" ? raw.trim() : "";
  return t || fallback;
}

export type GuidedDraftResult = {
  title: string;
  root: VisualFocusNode;
  summaryHint: string;
};

export function buildDraftFromGuidedAnswers(
  definition: CartographyMapDefinition,
  answers: Record<string, string>,
): GuidedDraftResult {
  const mode = definition.visualFocusMode;
  switch (mode) {
    case "decision-tree":
      return buildDecision(answers);
    case "relationship-map":
      return buildRelationship(answers);
    case "process-map":
      return buildProcess(answers);
    case "journey-map":
      return buildJourney(answers);
    case "timeline-map":
      return buildTimeline(answers);
    case "strategy-map":
      return buildStrategy(answers);
    case "project-map":
      return buildProject(answers);
    case "system-map":
      return buildSystem(answers);
    case "opportunity-map":
      return buildOpportunity(answers);
    case "priority-map":
      return buildPriority(answers);
    case "mind-map":
    default:
      return buildMindLike(answers, definition.name);
  }
}

function buildMindLike(
  answers: Record<string, string>,
  fallbackTitle: string,
): GuidedDraftResult {
  const title = text(answers.topic ?? answers.center, fallbackTitle);
  const branches = splitList(answers.everything ?? answers.entities);
  return {
    title,
    root: node(
      title,
      branches.length > 0
        ? branches.map((b) => node(b))
        : [node("Ideas"), node("Questions"), node("Next steps")],
    ),
    summaryHint: "Branches from your captured ideas.",
  };
}

function buildDecision(answers: Record<string, string>): GuidedDraftResult {
  const decision = text(answers.decision, "Decision");
  const options = splitList(answers.options);
  const benefits = splitList(answers.benefits);
  const concerns = splitList(answers.concerns);
  const preferred = text(answers.preferred, "");
  const optionNodes =
    options.length > 0
      ? options.map((opt, i) => {
          const kids: VisualFocusNode[] = [];
          if (benefits[i]) kids.push(node(`Benefit: ${benefits[i]}`));
          if (concerns[i]) kids.push(node(`Concern: ${concerns[i]}`));
          if (preferred && preferred.toLowerCase().includes(opt.toLowerCase())) {
            kids.push(node("Preferred direction"));
          }
          return node(opt, kids);
        })
      : [node("Option A"), node("Option B")];
  if (benefits.length && options.length === 0) {
    optionNodes.push(node("Benefits", benefits.map((b) => node(b))));
  }
  if (concerns.length && options.length === 0) {
    optionNodes.push(node("Concerns", concerns.map((c) => node(c))));
  }
  return {
    title: decision,
    root: node(decision, optionNodes),
    summaryHint: "Options compared under your decision.",
  };
}

function buildRelationship(answers: Record<string, string>): GuidedDraftResult {
  const center = text(answers.center, "Center");
  const entities = splitList(answers.entities);
  const friction = splitList(answers.friction);
  const children = entities.map((e) => node(e));
  if (friction.length) {
    children.push(node("Friction / gaps", friction.map((f) => node(f))));
  }
  if (answers.connections?.trim()) {
    children.push(node("Connections", [node(answers.connections.trim())]));
  }
  return {
    title: center,
    root: node(center, children.length ? children : [node("Related people"), node("Systems")]),
    summaryHint: "People and systems around your center.",
  };
}

function buildProcess(answers: Record<string, string>): GuidedDraftResult {
  const name = text(answers.processName, "Process");
  const start = text(answers.start, "Start");
  const steps = splitList(answers.steps);
  const decisions = splitList(answers.decisions);
  const end = text(answers.end, "End");
  const chain = [start, ...steps, end].filter(Boolean);
  const ordered = chain.map((label, i) =>
    node(`${i + 1}. ${label}`, i === 0 && decisions.length
      ? decisions.map((d) => node(`Decision: ${d}`))
      : []),
  );
  // Nest as linear children under root for vertical-flow layout
  let cursor: VisualFocusNode | null = null;
  for (let i = ordered.length - 1; i >= 0; i--) {
    const n = ordered[i]!;
    if (cursor) n.children = [cursor, ...n.children];
    cursor = n;
  }
  return {
    title: name,
    root: node(name, cursor ? [cursor] : [node("Start"), node("End")]),
    summaryHint: "Ordered steps from start to finish.",
  };
}

function buildJourney(answers: Record<string, string>): GuidedDraftResult {
  const start = text(answers.start, "Starting point");
  const destination = text(answers.destination, "Destination");
  const stages = splitList(answers.stages);
  const turning = splitList(answers.turningPoints);
  const current = text(answers.current, "");
  const stageNodes = (stages.length ? stages : ["Discover", "Move", "Arrive"]).map(
    (s) => {
      const kids: VisualFocusNode[] = [];
      if (current && current.toLowerCase().includes(s.toLowerCase())) {
        kids.push(node("You are here"));
      }
      return node(s, kids);
    },
  );
  if (turning.length) {
    stageNodes.push(node("Turning points", turning.map((t) => node(t))));
  }
  return {
    title: `${start} → ${destination}`,
    root: node(start, [...stageNodes, node(destination)]),
    summaryHint: "Journey stages from start to destination.",
  };
}

function buildTimeline(answers: Record<string, string>): GuidedDraftResult {
  const subject = text(answers.subject, "Timeline");
  const beginning = text(answers.beginning, "Beginning");
  const milestones = splitList(answers.milestones);
  const end = text(answers.end, "End");
  const timing = text(answers.timing, "");
  const items = [beginning, ...milestones, end].map((label, i) =>
    node(label, i === 0 && timing ? [node(timing)] : []),
  );
  return {
    title: subject,
    root: node(subject, items),
    summaryHint: "Milestones in order along your timeline.",
  };
}

function buildStrategy(answers: Record<string, string>): GuidedDraftResult {
  const vision = text(answers.vision, "Vision");
  const goals = splitList(answers.goals);
  const resources = splitList(answers.resources);
  const obstacles = splitList(answers.obstacles);
  const priorities = splitList(answers.priorities);
  const children: VisualFocusNode[] = [];
  if (goals.length) children.push(node("Goals", goals.map((g) => node(g))));
  if (priorities.length)
    children.push(node("Priorities", priorities.map((p) => node(p))));
  if (resources.length)
    children.push(node("Resources", resources.map((r) => node(r))));
  if (obstacles.length)
    children.push(node("Obstacles", obstacles.map((o) => node(o))));
  return {
    title: vision,
    root: node(
      vision,
      children.length ? children : [node("Goals"), node("Priorities"), node("Next actions")],
    ),
    summaryHint: "Vision connected to goals and priorities.",
  };
}

function buildProject(answers: Record<string, string>): GuidedDraftResult {
  const project = text(answers.project, "Project");
  const phases = splitList(answers.phases);
  const deliverables = splitList(answers.deliverables);
  const first = text(answers.first, "");
  const phaseNodes = (phases.length ? phases : ["Phase 1", "Phase 2"]).map((p) =>
    node(p, first && first.toLowerCase().includes(p.toLowerCase())
      ? [node("Start here")]
      : []),
  );
  if (deliverables.length) {
    phaseNodes.push(node("Deliverables", deliverables.map((d) => node(d))));
  }
  return {
    title: project,
    root: node(project, phaseNodes),
    summaryHint: "Project phases and deliverables.",
  };
}

function buildSystem(answers: Record<string, string>): GuidedDraftResult {
  const system = text(answers.system, "System");
  const components = splitList(answers.components);
  const flow = text(answers.flow, "");
  const dependencies = splitList(answers.dependencies);
  const risks = splitList(answers.risks);
  const children: VisualFocusNode[] = (
    components.length ? components : ["Component A", "Component B"]
  ).map((c) => node(c));
  if (flow) children.push(node("How it flows", [node(flow)]));
  if (dependencies.length) {
    children.push(node("Dependencies", dependencies.map((d) => node(d))));
  }
  if (risks.length) {
    children.push(node("Friction points", risks.map((r) => node(r))));
  }
  return {
    title: system,
    root: node(system, children),
    summaryHint: "System components, flows, and friction points.",
  };
}

function buildOpportunity(answers: Record<string, string>): GuidedDraftResult {
  const focus = text(answers.focus, "Opportunities");
  const opportunities = splitList(answers.opportunities);
  const benefits = splitList(answers.benefits);
  const risks = splitList(answers.risks);
  const firstSteps = splitList(answers.firstSteps);
  const oppNodes = (opportunities.length ? opportunities : ["Opportunity A"]).map(
    (o, i) => {
      const kids: VisualFocusNode[] = [];
      if (benefits[i]) kids.push(node(`Benefit: ${benefits[i]}`));
      if (risks[i]) kids.push(node(`Risk: ${risks[i]}`));
      if (firstSteps[i]) kids.push(node(`First step: ${firstSteps[i]}`));
      return node(o, kids);
    },
  );
  return {
    title: focus,
    root: node(focus, oppNodes),
    summaryHint: "Opportunities with benefits, risks, and first steps.",
  };
}

function buildPriority(answers: Record<string, string>): GuidedDraftResult {
  const context = text(answers.context, "Priorities");
  const items = splitList(answers.items);
  const impact = splitList(answers.impact);
  const urgency = splitList(answers.urgency);
  const focus = text(answers.focus, "");
  const children: VisualFocusNode[] = [];
  if (impact.length)
    children.push(node("High impact", impact.map((i) => node(i))));
  if (urgency.length)
    children.push(node("Urgent", urgency.map((u) => node(u))));
  const remaining = items.filter(
    (item) =>
      !impact.some((i) => i.toLowerCase() === item.toLowerCase()) &&
      !urgency.some((u) => u.toLowerCase() === item.toLowerCase()),
  );
  if (remaining.length)
    children.push(node("Also on the list", remaining.map((r) => node(r))));
  if (focus) children.push(node("Selected focus", [node(focus)]));
  if (!children.length) {
    children.push(
      ...(items.length ? items : ["Priority 1", "Priority 2"]).map((i) => node(i)),
    );
  }
  return {
    title: context,
    root: node(context, children),
    summaryHint: "Priorities sorted by impact and urgency.",
  };
}

export function defaultTitleForMode(mode: VisualFocusMode): string {
  switch (mode) {
    case "decision-tree":
      return "Decision Map";
    case "process-map":
      return "Process Map";
    case "journey-map":
      return "Journey Map";
    case "timeline-map":
      return "Timeline Map";
    case "system-map":
      return "System Map";
    case "opportunity-map":
      return "Opportunity Map";
    case "priority-map":
      return "Priority Map";
    default:
      return mode
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}
