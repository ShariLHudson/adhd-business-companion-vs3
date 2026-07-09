import { createEmptyBusinessCanvas } from "./businessCanvas/factory";
import { getStudioCardByMode } from "./studioCards";
import { purposeAnchorTitle, purposeQuestionForMode } from "@/lib/companionEntry/purposeAnchor";
import {
  buildMindMapDiscoveryInterview,
  buildMindMapDraftFromDiscovery,
} from "./discoveryInterview/mindMapDiscovery";
import type {
  VisualFocusDiscoveryInterview,
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

function treeTemplate(mode: VisualFocusMode): { title: string; root: VisualFocusNode } {
  const card = getStudioCardByMode(mode);

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

export type CreateVisualFocusMapOptions = {
  purposeAnswer?: string;
  /** Mind Map Discovery Interview answers (199) — preferred over purposeAnswer. */
  mindMapDiscovery?: {
    topic: string;
    everything: string;
    anythingElse?: string;
  };
};

export function createVisualFocusMap(
  mode: VisualFocusMode,
  purposeAnswerOrOptions?: string | CreateVisualFocusMapOptions,
): VisualFocusMap {
  const options: CreateVisualFocusMapOptions =
    typeof purposeAnswerOrOptions === "string"
      ? { purposeAnswer: purposeAnswerOrOptions }
      : (purposeAnswerOrOptions ?? {});
  const purposeAnswer = options.purposeAnswer;
  const now = new Date().toISOString();
  const id = `vf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  let discoveryInterview: VisualFocusDiscoveryInterview | undefined;
  let draftSuggestions: string[] | undefined;
  let title: string;
  let rooted: VisualFocusNode;
  let purposeAnchor: VisualFocusPurposeAnchor | undefined;

  let draftExplanation: string | undefined;
  let draftDuplicates: string[] | undefined;

  if (mode === "mind-map" && options.mindMapDiscovery) {
    const draft = buildMindMapDraftFromDiscovery(options.mindMapDiscovery);
    discoveryInterview = buildMindMapDiscoveryInterview(options.mindMapDiscovery);
    draftSuggestions = [
      ...draft.suggestedBranches,
      ...draft.suggestedGaps.filter((g) => !draft.suggestedBranches.includes(g)),
    ].slice(0, 4);
    draftExplanation = draft.explanation;
    draftDuplicates = draft.duplicates;
    title = draft.title;
    rooted = draft.root;
    purposeAnchor = {
      question: "What is the main topic?",
      userAnswer: options.mindMapDiscovery.topic.trim(),
      mode,
      capturedAt: now,
    };
  } else {
    const { title: templateTitle, root } = treeTemplate(mode);
    purposeAnchor = purposeAnswer?.trim()
      ? {
          question: purposeQuestionForMode(mode),
          userAnswer: purposeAnswer.trim(),
          mode,
          capturedAt: now,
        }
      : undefined;
    title = purposeAnchor ? purposeAnchorTitle(purposeAnchor) : templateTitle;
    rooted = purposeAnchor ? { ...root, label: purposeAnchor.userAnswer } : root;
  }

  if (mode === "visual-kanban") {
    const c1 = `col-${id}-ideas`;
    const c2 = `col-${id}-grouping`;
    const c3 = `col-${id}-exploring`;
    const c4 = `col-${id}-ready`;
    const card1 = `card-${id}-1`;
    return {
      id,
      title: purposeAnchor ? title : "Visual Kanban",
      mode,
      root: rooted,
      purposeAnchor,
      kanban: {
        columns: [
          { id: c1, label: "Ideas", cardIds: [card1] },
          { id: c2, label: "Grouping", cardIds: [] },
          { id: c3, label: "Exploring", cardIds: [] },
          { id: c4, label: "Ready to act", cardIds: [] },
        ],
        cards: {
          [card1]: { id: card1, label: "First idea" },
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
    root: rooted,
    purposeAnchor,
    discoveryInterview,
    draftSuggestions,
    draftExplanation,
    draftDuplicates,
    createdAt: now,
    updatedAt: now,
  };
}
