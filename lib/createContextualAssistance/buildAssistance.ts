import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { resolvedTypeLabel } from "@/lib/createWorkflow";
import { resolveTemplateSections } from "@/lib/createTemplates";
import { resolveWorkTypeIdFromLabel } from "@/lib/workTypeSchema/registry";
import type {
  CreateAssistanceActionId,
  CreateAssistancePacket,
  CreateAssistanceResult,
} from "./types";

export function buildCreateAssistancePacket(input: {
  workflow: CreateWorkflowState;
  sectionId: string;
  actionId: CreateAssistanceActionId;
  constraints?: string[];
}): CreateAssistancePacket {
  const workId =
    input.workflow.sessionId?.trim() ||
    input.workflow.eventRecordId?.trim() ||
    "";
  const workTypeLabel =
    resolvedTypeLabel(input.workflow) ||
    input.workflow.selectedTypeLabel ||
    "Creation";
  const sections = resolveTemplateSections(input.workflow) ?? [];
  const section = sections.find((s) => s.id === input.sectionId);
  const sectionTitle =
    section?.label || input.sectionId || "This section";
  const sectionContent =
    input.workflow.sectionContent?.[input.sectionId]?.trim() || "";

  return {
    workId,
    workTypeId: resolveWorkTypeIdFromLabel(workTypeLabel),
    workTypeLabel,
    sectionId: input.sectionId,
    sectionTitle,
    sectionContent,
    workMetadata: {
      title: input.workflow.selectedTemplateName,
      knownFacts: input.workflow.workspaceKnownFacts ?? [],
      constraints: input.constraints ?? [],
    },
    actionId: input.actionId,
  };
}

function guidanceFor(packet: CreateAssistancePacket): {
  guidance: string;
  responseType: CreateAssistanceResult["responseType"];
} {
  const title = packet.sectionTitle;
  const hasContent = Boolean(packet.sectionContent);
  const snippet = hasContent
    ? packet.sectionContent.slice(0, 120)
    : "";

  switch (packet.actionId) {
    case "help_me_think":
      return {
        responseType: "help_think",
        guidance: hasContent
          ? `Let's think through “${title}” together. You already have: “${snippet}${packet.sectionContent.length > 120 ? "…" : ""}”. What feels true, and what still feels fuzzy?`
          : `Let's think through “${title}” together. What are you trying to make clearer before you write anything down?`,
      };
    case "give_me_ideas":
      return {
        responseType: "ideas",
        guidance: hasContent
          ? `Here are a few directions that could deepen “${title}”, building on what you already wrote.`
          : `Here are a few starting places for “${title}” — pick what feels closest, or tell me what's off.`,
      };
    case "im_not_sure":
      return {
        responseType: "unsure",
        guidance: `It's okay not to know “${title}” yet. We can name what you do know, what you're guessing, and what can wait.`,
      };
    case "show_examples":
      return {
        responseType: "examples",
        guidance: `I'll show a couple of short examples for “${title}” in a ${packet.workTypeLabel.toLowerCase()} — you can borrow wording, not copy a whole plan.`,
      };
    case "review_this":
      return {
        responseType: "review",
        guidance: hasContent
          ? `Let's review “${title}”. I'll reflect what I hear, note what's strong, and ask one clarifying question if something's missing.`
          : `There's nothing in “${title}” to review yet. Want ideas, or shall we think it through first?`,
      };
    default:
      return {
        responseType: "help_think",
        guidance: `What would help most with “${title}” right now?`,
      };
  }
}

export function runCreateAssistance(input: {
  workflow: CreateWorkflowState;
  sectionId: string;
  actionId: CreateAssistanceActionId;
  constraints?: string[];
}): CreateAssistanceResult {
  const packet = buildCreateAssistancePacket(input);
  const { guidance, responseType } = guidanceFor(packet);
  return { packet, guidance, responseType };
}

export const CREATE_ASSISTANCE_ACTION_ORDER: readonly CreateAssistanceActionId[] =
  [
    "help_me_think",
    "give_me_ideas",
    "im_not_sure",
    "show_examples",
    "review_this",
  ] as const;
