import { newCreationWorkspaceId, nowIso } from "./ids";
import type { CreationWorkspace, CreationWorkspaceItem } from "./types";

export function selectWorkspaceSection(
  workspace: CreationWorkspace,
  sectionId: string | null,
): CreationWorkspace {
  return {
    ...workspace,
    activeSectionId: sectionId,
    selectedSectionIds: sectionId ? [sectionId] : [],
    updatedAt: nowIso(),
    lastOpenedAt: nowIso(),
  };
}

export function editWorkspaceItem(
  workspace: CreationWorkspace,
  itemId: string,
  patch: Partial<Pick<CreationWorkspaceItem, "title" | "body" | "summary">>,
): CreationWorkspace {
  const now = nowIso();
  const items = workspace.items.map((item) => {
    if (item.id !== itemId) return item;
    if (item.locked) return item;
    return {
      ...item,
      ...patch,
      userEdited: true,
      protected: true,
      origin: item.userCreated ? item.origin : item.origin,
      updatedAt: now,
    };
  });
  const protectedIds = Array.from(
    new Set([
      ...workspace.protectedContentIds,
      ...items.filter((i) => i.protected).map((i) => i.id),
    ]),
  );
  return {
    ...workspace,
    items,
    protectedContentIds: protectedIds,
    status:
      workspace.status === "first_draft" || workspace.status === "forming"
        ? "developing"
        : workspace.status,
    updatedAt: now,
    lastOpenedAt: now,
    workspaceVersion: workspace.workspaceVersion + 1,
  };
}

export function applyGeneratedSectionUpdate(
  workspace: CreationWorkspace,
  itemId: string,
  nextBody: string,
  nextTitle?: string,
): CreationWorkspace {
  const item = workspace.items.find((i) => i.id === itemId);
  if (!item) return workspace;
  if (item.protected || item.userEdited || item.locked) {
    // Propose only — do not overwrite protected content
    return {
      ...workspace,
      suggestionIds: Array.from(
        new Set([...workspace.suggestionIds, itemId]),
      ),
      missingPieces: Array.from(
        new Set([
          ...workspace.missingPieces,
          `Proposed update for protected section “${item.title}” — review before applying.`,
        ]),
      ),
      updatedAt: nowIso(),
    };
  }
  return editWorkspaceItem(workspace, itemId, {
    body: nextBody,
    title: nextTitle ?? item.title,
    summary: nextBody.slice(0, 140),
  });
}

export type SelectedAreaActionId =
  | "improve"
  | "expand"
  | "simplify"
  | "rewrite"
  | "add_example"
  | "add_detail"
  | "make_practical"
  | "find_missing"
  | "research_this"
  | "compare_alternatives"
  | "create_checklist"
  | "turn_into_steps"
  | "ask_shari"
  | "keep_draft"
  | "remove"
  | "duplicate";

export function inferSelectedAreaActions(
  item: CreationWorkspaceItem | null,
): Array<{ id: SelectedAreaActionId; label: string }> {
  if (!item) return [];
  const actions: Array<{ id: SelectedAreaActionId; label: string }> = [
    { id: "improve", label: "Improve This" },
    { id: "expand", label: "Expand This" },
    { id: "simplify", label: "Simplify This" },
    { id: "ask_shari", label: "Ask Shari" },
    { id: "research_this", label: "Research This" },
  ];
  if (item.type === "timeline_item" || item.type === "section") {
    actions.push({ id: "add_example", label: "Add an Example" });
    actions.push({ id: "make_practical", label: "Make It More Practical" });
  }
  if (item.type === "process_step") {
    actions.push({ id: "turn_into_steps", label: "Turn Into Steps" });
  }
  if (item.type !== "checklist_item") {
    actions.push({ id: "create_checklist", label: "Create a Checklist" });
  }
  actions.push({ id: "compare_alternatives", label: "Compare Alternatives" });
  actions.push({ id: "duplicate", label: "Duplicate" });
  actions.push({ id: "remove", label: "Remove" });
  return actions.slice(0, 8);
}

export function applySelectedAreaAction(
  workspace: CreationWorkspace,
  itemId: string,
  action: SelectedAreaActionId,
  shariNote?: string,
): CreationWorkspace {
  const item = workspace.items.find((i) => i.id === itemId);
  if (!item) return workspace;
  const now = nowIso();

  switch (action) {
    case "remove": {
      if (item.protected) {
        return {
          ...workspace,
          missingPieces: [
            ...workspace.missingPieces,
            `“${item.title}” is protected — confirm before removing.`,
          ],
          updatedAt: now,
        };
      }
      return {
        ...workspace,
        items: workspace.items.map((i) =>
          i.id === itemId ? { ...i, status: "removed" as const, updatedAt: now } : i,
        ),
        sectionIds: workspace.sectionIds.filter((id) => id !== itemId),
        updatedAt: now,
        workspaceVersion: workspace.workspaceVersion + 1,
      };
    }
    case "duplicate": {
      const copy: CreationWorkspaceItem = {
        ...item,
        id: newCreationWorkspaceId("cwi"),
        title: `${item.title} (copy)`,
        userCreated: true,
        userEdited: false,
        protected: false,
        origin: "user",
        order: item.order + 0.5,
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...workspace,
        items: [...workspace.items, copy],
        sectionIds: [...workspace.sectionIds, copy.id],
        itemIds: [...workspace.itemIds, copy.id],
        updatedAt: now,
        workspaceVersion: workspace.workspaceVersion + 1,
      };
    }
    case "simplify":
      return applyGeneratedSectionUpdate(
        workspace,
        itemId,
        `${item.body}\n\nSimplified focus: keep the clearest next action and drop secondary detail.${shariNote ? `\n\nShari note: ${shariNote}` : ""}`,
      );
    case "expand":
    case "add_detail":
    case "add_example":
    case "improve":
    case "rewrite":
    case "make_practical":
      return applyGeneratedSectionUpdate(
        workspace,
        itemId,
        `${item.body}\n\n[${action.replace(/_/g, " ")}]${shariNote ? `\n${shariNote}` : "\nAdd one clearer example and one practical next step."}`,
      );
    case "create_checklist": {
      const checklist: CreationWorkspaceItem = {
        id: newCreationWorkspaceId("cwi"),
        workspaceId: workspace.id,
        parentId: item.id,
        type: "checklist_item",
        title: `Checklist from ${item.title}`,
        summary: "Derived checklist",
        body: item.body
          .split(/[.!\n]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 12)
          .slice(0, 6)
          .map((s, i) => `${i + 1}. ${s}`)
          .join("\n"),
        order: item.order + 0.2,
        depth: item.depth + 1,
        groupId: "checklist",
        origin: "generated",
        status: "ready",
        confidence: "medium",
        verificationStatus: "unverified",
        sourceKnowledgeItemIds: [],
        sourceResearchFindingIds: [],
        sourceReferences: [],
        userCreated: false,
        userEdited: false,
        protected: false,
        locked: false,
        destinationEligibility: ["create", "projects"],
        presentationHints: [],
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...workspace,
        items: [...workspace.items, checklist],
        itemIds: [...workspace.itemIds, checklist.id],
        updatedAt: now,
        workspaceVersion: workspace.workspaceVersion + 1,
      };
    }
    default:
      return {
        ...workspace,
        suggestionIds: Array.from(new Set([...workspace.suggestionIds, itemId])),
        updatedAt: now,
      };
  }
}

export function askShariAboutSelection(
  workspace: CreationWorkspace,
  itemId: string,
  question: string,
): { workspace: CreationWorkspace; reply: string } {
  const item = workspace.items.find((i) => i.id === itemId);
  if (!item) {
    return {
      workspace,
      reply: "Select a section first, and I’ll look at it with you.",
    };
  }
  const reply = [
    `Looking at “${item.title}” in ${workspace.title}.`,
    "",
    question.trim()
      ? `You asked: ${question.trim()}`
      : "What would help most in this section?",
    "",
    "From what’s here:",
    item.body.slice(0, 280) + (item.body.length > 280 ? "…" : ""),
    "",
    item.protected
      ? "You’ve already edited this section, so I’ll suggest changes rather than overwrite it."
      : "I can improve, expand, simplify, or research just this section when you’re ready.",
  ].join("\n");

  return {
    workspace: {
      ...workspace,
      questionIds: Array.from(new Set([...workspace.questionIds, itemId])),
      updatedAt: nowIso(),
    },
    reply,
  };
}
