/**
 * Make It Mine™ — coaching conversation launcher.
 * Shari helps the member adapt the lesson to THEIR business.
 */

import type { MakeItMineSession } from "../types";
import type { MakeItMineIntent } from "@/lib/sparkMomentumInstitute/types";
import { loadInstituteCatalog } from "./catalog/provider";
import { resolveExperienceById } from "./experienceResolver";

function newId(): string {
  return `mim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type StartMakeItMineInput = {
  learningExperienceId: string;
  experienceDefinitionId: string;
  intent?: MakeItMineIntent;
};

export function resolveMakeItMineForExperience(
  experienceDefinitionId: string,
  intent?: MakeItMineIntent,
): {
  intent: MakeItMineIntent;
  outcomeLabel: string;
  coachingPromptKey: string;
} | null {
  const resolved = resolveExperienceById(experienceDefinitionId);
  if (!resolved) return null;

  const catalog = loadInstituteCatalog();
  const template =
    catalog.makeItMineTemplates.find(
      (t) =>
        t.knowledgeCardId === resolved.knowledgeCard.id &&
        (!intent || t.intent === intent),
    ) ??
    catalog.makeItMineTemplates.find(
      (t) => t.knowledgeCardId === resolved.knowledgeCard.id,
    );

  if (template) {
    return {
      intent: template.intent,
      outcomeLabel: template.outcomeLabel,
      coachingPromptKey: template.coachingPromptKey,
    };
  }

  const defaultIntent: MakeItMineIntent = intent ?? "custom";
  const outcomeByIntent: Record<MakeItMineIntent, string> = {
    create_my_plan: `Create MY plan for ${resolved.knowledgeCard.title}`,
    improve_my_pricing: `Improve MY pricing using ${resolved.knowledgeCard.title}`,
    solve_my_challenge: `Solve MY challenge with ${resolved.knowledgeCard.title}`,
    adapt_strategy: `Adapt this strategy to MY business`,
    custom: `Make ${resolved.knowledgeCard.title} mine`,
  };

  return {
    intent: defaultIntent,
    outcomeLabel: outcomeByIntent[defaultIntent],
    coachingPromptKey: `institute.make_it_mine.${defaultIntent}`,
  };
}

export function startMakeItMineSession(
  input: StartMakeItMineInput,
): MakeItMineSession | null {
  const resolved = resolveExperienceById(input.experienceDefinitionId);
  if (!resolved) return null;

  const makeItMine = resolveMakeItMineForExperience(
    input.experienceDefinitionId,
    input.intent,
  );
  if (!makeItMine) return null;

  const now = new Date().toISOString();
  return {
    kind: "institute-make-it-mine",
    id: newId(),
    createdAt: now,
    learningExperienceId: input.learningExperienceId,
    knowledgeCardId: resolved.knowledgeCard.id,
    intent: makeItMine.intent,
    outcomeLabel: makeItMine.outcomeLabel,
    startedAt: now,
    status: "active",
    originatedFromId: input.experienceDefinitionId,
    originatedFromKind: "knowledge-card",
  };
}

export function makeItMineInvitationLine(outcomeLabel: string): string {
  return `Let's make this yours — ${outcomeLabel}. Ready to work through it together?`;
}
