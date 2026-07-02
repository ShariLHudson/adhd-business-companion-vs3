/**
 * Facilitation questions mapped to workspace sections — one at a time.
 */

import { getDiscoveryQuestions } from "@/lib/createWorkflow";
import { defaultTemplateFor } from "@/lib/createTemplates";

export type FacilitationQuestion = {
  id: string;
  sectionId: string;
  prompt: string;
  why: string;
};

const OFFER_FACILITATION: FacilitationQuestion[] = [
  {
    id: "audience",
    sectionId: "audience",
    prompt: "Who is this offer for?",
    why: "So every piece speaks to the right person.",
  },
  {
    id: "problem",
    sectionId: "problem",
    prompt: "What problem are they struggling with?",
    why: "So the offer meets a real need.",
  },
  {
    id: "promise",
    sectionId: "promise",
    prompt: "What promise or transformation are you offering?",
    why: "So they see the outcome, not just features.",
  },
  {
    id: "price",
    sectionId: "price",
    prompt: "What price or investment are you considering?",
    why: "So pricing fits the value you're describing.",
  },
];

const WORKSHOP_FACILITATION: FacilitationQuestion[] = [
  {
    id: "audience",
    sectionId: "overview",
    prompt: "Who is this workshop for?",
    why: "So examples and pace fit the room.",
  },
  {
    id: "outcome",
    sectionId: "outcomes",
    prompt: "What transformation should people walk away with?",
    why: "So the workshop has a clear payoff.",
  },
  {
    id: "topic",
    sectionId: "overview",
    prompt: "What's the main topic or theme?",
    why: "So every activity supports one idea.",
  },
];

const BLUEPRINT_OVERRIDES: Record<string, FacilitationQuestion[]> = {
  Offer: OFFER_FACILITATION,
  Workshop: WORKSHOP_FACILITATION,
};

function fromDiscovery(artifactType: string): FacilitationQuestion[] {
  const discovery = getDiscoveryQuestions(artifactType);
  const template = defaultTemplateFor(artifactType);
  const sections = template.sections;
  return discovery.map((q, index) => ({
    id: q.id,
    sectionId: sections[index % sections.length]?.id ?? q.id,
    prompt: q.prompt,
    why: q.why,
  }));
}

export function facilitationQuestionsForType(
  artifactType: string,
): FacilitationQuestion[] {
  const override = BLUEPRINT_OVERRIDES[artifactType];
  if (override?.length) return override;
  const fromDisc = fromDiscovery(artifactType);
  if (fromDisc.length) return fromDisc;
  const template = defaultTemplateFor(artifactType);
  return template.sections.map((s) => ({
    id: s.id,
    sectionId: s.id,
    prompt: `What should go in **${s.label}**?`,
    why: "So we shape this one piece at a time.",
  }));
}
