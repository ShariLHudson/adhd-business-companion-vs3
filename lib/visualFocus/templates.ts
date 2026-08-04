import { createEmptyBusinessCanvas } from "./businessCanvas/factory";
import { createPriorityMatrixKanban } from "./priorityMatrix";
import { purposeAnchorTitle, purposeQuestionForMode } from "@/lib/companionEntry/purposeAnchor";import type { VisualThinkingHomeTypeId } from "../visualThinkingHome";
import { getStudioCardByMode } from "./studioCards";
import type {
  VisualFocusMap,
  VisualFocusMode,
  VisualFocusNode,
  VisualFocusPurposeAnchor,
} from "./types";

function newNodeId(): string {
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function node(label: string, children: VisualFocusNode[] = []): VisualFocusNode {
  return {
    id: newNodeId(),
    label,
    children,
  };
}

function chainFromLabels(labels: string[]): VisualFocusNode {
  if (labels.length === 0) {
    return node("Central idea");
  }
  const [head, ...rest] = labels;
  if (rest.length === 0) {
    return node(head!);
  }
  return node(head!, [chainFromLabels(rest)]);
}

function treeTemplate(
  mode: VisualFocusMode,
  homeTypeId?: VisualThinkingHomeTypeId,
): { title: string; root: VisualFocusNode } {
  const card = getStudioCardByMode(mode);

  if (homeTypeId === "process-flow") {
    return {
      title: "New process",
      root: chainFromLabels([
        "Start",
        "Step 1",
        "Step 2",
        "Finish",
      ]),
    };
  }
  if (homeTypeId === "workflow-map") {
    return {
      title: "New workflow",
      root: chainFromLabels([
        "Trigger",
        "Process",
        "Handoff",
        "Complete",
      ]),
    };
  }
  if (homeTypeId === "timeline") {
    return {
      title: "Project timeline",
      root: chainFromLabels([
        "Phase 1",
        "Phase 2",
        "Phase 3",
        "Launch",
      ]),
    };
  }

  switch (mode) {
    case "mind-map":
      return {
        title: "Launch Workshop",
        root: node("Launch Workshop", [
          node("Audience"),
          node("Pricing"),
          node("Bonuses"),
          node("Marketing"),
          node("Follow Up"),
        ]),
      };
    case "decision-tree":
      return {
        title: "Hire VA",
        root: chainFromLabels([
          "Hire VA",
          "More Time",
          "More Content",
          "More Leads",
        ]),
      };
    case "strategy-map":
      return {
        title: "Grow Revenue",
        root: chainFromLabels([
          "Grow Revenue",
          "Improve Visibility",
          "Create Content",
          "Generate Leads",
        ]),
      };
    case "project-map":
      return {
        title: "Course Launch",
        root: node("Course Launch", [
          node("Content"),
          node("Landing Page"),
          node("Emails"),
          node("Promotion"),
        ]),
      };
    case "relationship-map":
      return {
        title: "Business connections",
        root: node("Your business", [
          node("Audience"),
          node("Offer"),
          node("Marketing"),
          node("Revenue"),
        ]),
      };
    case "visual-kanban":
      return { title: card?.title ?? "Visual Board", root: node("Visual Kanban") };
    case "business-canvas":
      return {
        title: "Business Canvas",
        root: node("Business Canvas"),
      };
  }
}

export function createVisualFocusMap(
  mode: VisualFocusMode,
  purposeAnswer?: string,
  homeTypeId?: VisualThinkingHomeTypeId,
): VisualFocusMap {
  const now = new Date().toISOString();
  const id = `vf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const { title: templateTitle, root } = treeTemplate(mode, homeTypeId);
  const purposeAnchor: VisualFocusPurposeAnchor | undefined = purposeAnswer?.trim()
    ? {
        question: purposeQuestionForMode(mode),
        userAnswer: purposeAnswer.trim(),
        mode,
        capturedAt: new Date().toISOString(),
      }
    : undefined;
  const title = purposeAnchor
    ? purposeAnchorTitle(purposeAnchor)
    : templateTitle;
  const rooted: VisualFocusNode = purposeAnchor
    ? { ...root, label: purposeAnchor.userAnswer }
    : root;

  if (mode === "visual-kanban") {
    if (homeTypeId === "priority-matrix") {
      const { columns, cards } = createPriorityMatrixKanban(id);
      return {
        id,
        title: purposeAnchor ? title : "Priority Matrix",
        mode,
        homeTypeId,
        root: rooted,
        purposeAnchor,
        kanban: { columns, cards },
        createdAt: now,
        updatedAt: now,
      };
    }

    const isComparison = homeTypeId === "comparison-map";
    const isContentCalendar = homeTypeId === "content-calendar";
    const isPinterest = homeTypeId === "pinterest-planner";
    const c1 = `col-${id}-a`;
    const c2 = `col-${id}-b`;
    const c3 = `col-${id}-c`;
    const card1 = `card-${id}-1`;
    const columnDefs = isComparison
      ? [
          { id: c1, label: "Option A", cardIds: [card1] as string[] },
          { id: c2, label: "Option B", cardIds: [] as string[] },
          { id: c3, label: "Criteria", cardIds: [] as string[] },
        ]
      : isContentCalendar
        ? [
            { id: c1, label: "Week 1", cardIds: [card1] as string[] },
            { id: c2, label: "Week 2", cardIds: [] as string[] },
            { id: c3, label: "Week 3", cardIds: [] as string[] },
          ]
        : isPinterest
          ? [
              { id: c1, label: "Launch board", cardIds: [card1] as string[] },
              { id: c2, label: "Tips board", cardIds: [] as string[] },
              { id: c3, label: "Testimonials", cardIds: [] as string[] },
            ]
          : [
              { id: c1, label: "Ideas", cardIds: [card1] as string[] },
              { id: c2, label: "Grouping", cardIds: [] as string[] },
              { id: `col-${id}-exploring`, label: "Exploring", cardIds: [] as string[] },
              { id: `col-${id}-ready`, label: "Ready to act", cardIds: [] as string[] },
            ];
    const defaultTitle = isComparison
      ? "Compare options"
      : isContentCalendar
        ? "Content Calendar"
        : isPinterest
          ? "Pinterest Plan"
          : "Visual Kanban";
    const defaultCardLabel = isComparison
      ? "First note"
      : isContentCalendar
        ? "First content piece"
        : isPinterest
          ? "Pin idea"
          : "First idea";
    return {
      id,
      title: purposeAnchor ? title : defaultTitle,
      mode,
      homeTypeId,
      root: rooted,
      purposeAnchor,
      kanban: {
        columns: columnDefs,
        cards: {
          [card1]: { id: card1, label: defaultCardLabel },
        },
      },
      createdAt: now,
      updatedAt: now,
    };
  }
  if (mode === "business-canvas") {
    return {
      id,
      title: purposeAnchor ? title : "Business Canvas",
      mode,
      homeTypeId,
      root: rooted,
      purposeAnchor,
      businessCanvas: createEmptyBusinessCanvas(),
      businessCanvasWorkflow: "buildCurrentCanvas",
      createdAt: now,
      updatedAt: now,
    };
  }

  return {
    id,
    title,
    mode,
    homeTypeId,
    root: rooted,
    purposeAnchor,
    createdAt: now,
    updatedAt: now,
  };
}
