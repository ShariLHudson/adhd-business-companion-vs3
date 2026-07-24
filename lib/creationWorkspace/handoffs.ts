import type { CreationPackage } from "@/lib/universalRequestOutcome";
import { newCreationWorkspaceId, nowIso } from "./ids";
import type {
  CreationWorkspace,
  CreationWorkspaceHandoff,
  CreationWorkspaceHandoffDestination,
  CreationWorkspaceUseOption,
} from "./types";
import {
  buildCreateHandoff,
  buildEstateHandoff,
  buildProjectHandoff,
  buildStrategyHandoff,
  buildVisualHandoff,
  storeCreateHandoff,
  storeEstateHandoff,
  storeProjectHandoff,
  storeStrategyHandoff,
  storeVisualHandoff,
} from "./destination";

function draftItems(workspace: CreationWorkspace) {
  return workspace.items
    .filter((i) => i.groupId !== "research" && i.status !== "removed")
    .sort((a, b) => a.order - b.order);
}

export function prepareCreationWorkspaceHandoff(input: {
  workspace: CreationWorkspace;
  option: CreationWorkspaceUseOption;
  creationPackage?: CreationPackage | null;
}): { workspace: CreationWorkspace; handoff: CreationWorkspaceHandoff } {
  const now = nowIso();
  const items = draftItems(input.workspace);
  const protectedContent = items
    .filter((i) => i.protected || i.userEdited)
    .map((i) => i.title);

  let payload = "";
  let requiresReview = false;
  let unresolvedAreas = input.workspace.missingPieces.slice(0, 8);
  let handoffId = newCreationWorkspaceId("cwh");

  if (input.option.destination === "create") {
    const createHandoff = buildCreateHandoff(input.workspace);
    handoffId = createHandoff.id;
    payload = JSON.stringify(createHandoff);
    storeCreateHandoff(createHandoff);
  } else if (input.option.destination === "projects") {
    requiresReview = true;
    const projectHandoff = buildProjectHandoff(
      input.workspace,
      input.creationPackage,
    );
    handoffId = projectHandoff.id;
    payload = JSON.stringify(projectHandoff);
    storeProjectHandoff(projectHandoff);
  } else if (input.option.destination === "visual_thinking") {
    const visualHandoff = buildVisualHandoff(input.workspace);
    handoffId = visualHandoff.id;
    payload = JSON.stringify(visualHandoff);
    storeVisualHandoff(visualHandoff);
  } else if (input.option.destination === "strategic_planning") {
    requiresReview = true;
    const strategyHandoff = buildStrategyHandoff(input.workspace);
    handoffId = strategyHandoff.id;
    payload = JSON.stringify(strategyHandoff);
    storeStrategyHandoff(strategyHandoff);
  } else if (input.option.destination === "business_estate") {
    requiresReview = true;
    const estateHandoff = buildEstateHandoff(input.workspace);
    handoffId = estateHandoff.id;
    payload = JSON.stringify(estateHandoff);
    storeEstateHandoff(estateHandoff);
  } else {
    payload = items.map((i) => `## ${i.title}\n${i.body}`).join("\n\n");
  }

  const handoff: CreationWorkspaceHandoff = {
    id: handoffId,
    workspaceId: input.workspace.id,
    creationPackageId: input.workspace.creationPackageId || "",
    destination: input.option.destination,
    requestedOutcome: input.option.label,
    includedSectionIds: items.map((i) => i.id),
    includedItemIds: items.map((i) => i.id),
    includedResearchCollectionIds: [
      ...input.workspace.researchCollectionIds,
    ],
    sourceReferences: items.flatMap((i) => i.sourceReferences).slice(0, 12),
    userNotes: [],
    protectedContent,
    unresolvedAreas,
    proposedChanges: [],
    requiresReview,
    status: requiresReview ? "ready_for_review" : "preparing",
    payload,
    createdAt: now,
    completedAt: null,
  };

  const workspace: CreationWorkspace = {
    ...input.workspace,
    handoffs: [...input.workspace.handoffs, handoff],
    status: "ready_for_destination",
    updatedAt: now,
    lastOpenedAt: now,
  };

  return { workspace, handoff };
}

export function completeHandoff(
  workspace: CreationWorkspace,
  handoffId: string,
  status: CreationWorkspaceHandoff["status"] = "completed",
): CreationWorkspace {
  const now = nowIso();
  return {
    ...workspace,
    handoffs: workspace.handoffs.map((h) =>
      h.id === handoffId
        ? { ...h, status, completedAt: status === "completed" ? now : h.completedAt }
        : h,
    ),
    completedHandoffIds:
      status === "completed"
        ? Array.from(new Set([...workspace.completedHandoffIds, handoffId]))
        : workspace.completedHandoffIds,
    status: status === "completed" ? "handed_off" : workspace.status,
    updatedAt: now,
  };
}

export function detectPostHandoffSyncOffer(
  workspace: CreationWorkspace,
  editedItemId: string,
): string | null {
  const completed = workspace.handoffs.filter((h) => h.status === "completed");
  if (!completed.length) return null;
  const item = workspace.items.find((i) => i.id === editedItemId);
  if (!item) return null;
  const dests = completed.map((h) => h.destination).join(", ");
  return `You updated “${item.title}” after handing work off to ${dests}. Review an update preview before replacing destination-owned content.`;
}

export function handoffDestinationLabel(
  destination: CreationWorkspaceHandoffDestination,
): string {
  switch (destination) {
    case "create":
      return "Create";
    case "projects":
      return "Projects";
    case "visual_thinking":
      return "Visual Thinking Studio";
    case "strategic_planning":
      return "Strategic Planning";
    case "business_estate":
      return "My Business Estate";
    case "research_library":
      return "Research Library";
    case "learning":
      return "Learning";
    case "save":
      return "Saved Working Material";
  }
}
