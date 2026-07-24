import {
  createResearchCollection,
  getLiveResearchProviderStatus,
} from "@/lib/universalRequestOutcome";
import { applyGeneratedSectionUpdate } from "./editing";
import { nowIso } from "./ids";
import type { CreationWorkspace } from "./types";

/**
 * Selected-area Research This — updates only the selected scope unless approved.
 */
export function researchSelectedWorkspaceArea(input: {
  workspace: CreationWorkspace;
  itemId: string;
  approveUpdate?: boolean;
}): {
  workspace: CreationWorkspace;
  message: string;
  researchCollectionId: string;
} {
  const item = input.workspace.items.find((i) => i.id === input.itemId);
  if (!item) {
    return {
      workspace: input.workspace,
      message: "Select a section to research.",
      researchCollectionId: "",
    };
  }

  const live = getLiveResearchProviderStatus();
  const collection = createResearchCollection({
    topic: item.title,
    purpose: `Deepen “${item.title}” inside ${input.workspace.title}`,
    researchQuestion: `What matters most about ${item.title} for ${input.workspace.purpose}?`,
    intendedOutcome: `Improve section: ${item.title}`,
    sourceExperience: "creation_workspace",
    sourceEntityId: input.workspace.id,
    sourceSelectionIds: [item.id],
    stableFindings: [
      {
        title: `Stable notes on ${item.title}`,
        content: `For “${item.title}”, keep expectations clear, name practical next steps, and mark current-sensitive details for verification. ${
          live.liveResearchAvailable
            ? "Live research can refine this further."
            : "Current live research is unavailable; stable knowledge was used."
        }`,
        source: "Spark Estate stable knowledge",
      },
      {
        title: "Section-level caution",
        content:
          "Do not replace the whole Creation Package when only one section was researched.",
        source: "Creation Workspace guidance",
      },
    ],
  });

  const proposedBody = [
    item.body,
    "",
    "— Research enrichment —",
    ...collection.findings.map((f) => `• ${f.title}: ${f.content}`),
  ].join("\n");

  let workspace = {
    ...input.workspace,
    researchCollectionIds: Array.from(
      new Set([...input.workspace.researchCollectionIds, collection.id]),
    ),
    researchStatus: collection.status,
    status: "needs_research" as const,
    updatedAt: nowIso(),
  };

  if (input.approveUpdate) {
    workspace = applyGeneratedSectionUpdate(
      workspace,
      item.id,
      proposedBody,
    );
    workspace = {
      ...workspace,
      status: "developing",
    };
  } else {
    workspace = {
      ...workspace,
      suggestionIds: Array.from(
        new Set([...workspace.suggestionIds, item.id]),
      ),
      missingPieces: Array.from(
        new Set([
          ...workspace.missingPieces,
          `Research returned for “${item.title}” — review before applying.`,
        ]),
      ),
    };
  }

  const message = item.protected || item.userEdited
    ? `I researched “${item.title}” and prepared updates without overwriting your edits. Review the proposed enrichment when you’re ready.`
    : input.approveUpdate
      ? `I researched “${item.title}” and updated only that section. The rest of the workspace is unchanged.`
      : `I researched “${item.title}”. Proposed updates are ready for this section only.`;

  return {
    workspace,
    message,
    researchCollectionId: collection.id,
  };
}
