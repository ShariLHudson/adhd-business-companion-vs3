// Founder Ecosystem — Phase 14 Context Packager.
// When work launches into another tool, package the context that tool needs:
// project, document, founder situation, relevant decisions and goals — so the
// founder never has to re-explain. Built from the memory + journey layers. Pure.

import type { FounderEvent, ID } from "../events";
import { buildFounderMemory } from "../memory/founderMemoryEngine";
import { detectFounderJourney } from "../journey/founderJourneyEngine";
import type { ContextPackage } from "./automationTypes";

export type PackageTarget = {
  projectId?: ID;
  documentId?: ID;
};

let seq = 0;
const pid = () => `ctx:${++seq}`;

export function buildContextPackage(
  events: FounderEvent[],
  founderId: ID,
  target: PackageTarget = {},
  now: Date = new Date(),
): ContextPackage {
  const mine = events.filter((e) => e.founderId === founderId);
  const memory = buildFounderMemory(mine, founderId);
  const journey = detectFounderJourney(mine, founderId, { now });

  const project = target.projectId
    ? memory.projects.find((p) => p.projectId === target.projectId)
    : memory.projects
        .slice()
        .sort((a, b) => ((a.lastActivity ?? "") < (b.lastActivity ?? "") ? 1 : -1))[0];

  const projectContext = project
    ? {
        id: project.projectId,
        name: project.name,
        purpose: project.purpose,
        nextStep: project.nextStep,
        openTasks: project.tasks.filter((t) => !t.done).map((t) => t.title),
        documents: project.documents.map((d) => ({ id: d.id, title: d.title })),
      }
    : undefined;

  const documentContext = target.documentId
    ? (() => {
        const doc = project?.documents.find((d) => d.id === target.documentId);
        return doc ? { id: doc.id, title: doc.title } : { id: target.documentId, title: "Document" };
      })()
    : undefined;

  const relevantDecisions = (
    project
      ? memory.decisions.filter((d) => d.relatedProjectIds.includes(project.projectId))
      : memory.decisions
  )
    .slice(0, 5)
    .map((d) => ({ id: d.id, text: d.decision }));

  const topGoals = project?.goals?.slice(0, 3) ?? [];

  const founderContext = {
    stage: journey.currentStage,
    primaryFocus: journey.primaryFocus,
    topGoals,
  };

  return {
    id: pid(),
    founderId,
    createdAt: now.toISOString(),
    projectContext,
    documentContext,
    founderContext,
    relevantDecisions,
    relevantGoals: topGoals,
    summaryText: renderSummary({
      projectContext,
      documentContext,
      founderContext,
      relevantDecisions,
    }),
  };
}

function renderSummary(p: {
  projectContext?: ContextPackage["projectContext"];
  documentContext?: ContextPackage["documentContext"];
  founderContext: ContextPackage["founderContext"];
  relevantDecisions: { id: ID; text: string }[];
}): string {
  const lines: string[] = [];
  lines.push(
    `Founder is in the ${p.founderContext.stage ?? "—"} stage` +
      (p.founderContext.primaryFocus ? `, focused on ${p.founderContext.primaryFocus}.` : "."),
  );
  if (p.projectContext) {
    lines.push(`Project: ${p.projectContext.name}.`);
    if (p.projectContext.purpose) lines.push(`Why it matters: ${p.projectContext.purpose}.`);
    if (p.projectContext.nextStep) lines.push(`Next step: ${p.projectContext.nextStep}.`);
    if (p.projectContext.openTasks.length)
      lines.push(`Open tasks: ${p.projectContext.openTasks.join("; ")}.`);
    if (p.projectContext.documents.length)
      lines.push(`Related documents: ${p.projectContext.documents.map((d) => d.title).join(", ")}.`);
  }
  if (p.documentContext) lines.push(`Working document: ${p.documentContext.title}.`);
  if (p.relevantDecisions.length)
    lines.push(`Relevant decisions: ${p.relevantDecisions.map((d) => d.text).join(" | ")}.`);
  if (p.founderContext.topGoals.length)
    lines.push(`Goals: ${p.founderContext.topGoals.join(", ")}.`);
  return lines.join("\n");
}
