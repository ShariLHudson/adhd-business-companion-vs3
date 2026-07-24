/**
 * Visual Thinking Studio — Generation Engine Foundation (Build 4).
 * Creates structured editable deliverables from a confirmed Experience Plan.
 * Does not re-interpret goals, re-select experiences, or invent deliverables.
 */

import type {
  VisualThinkingDeliverable as PlanDeliverableType,
  VisualThinkingExperiencePlan,
  VisualThinkingGenerationStage,
  VisualThinkingInteractionStyle,
} from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";
import { deliverableLabel } from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";

// ─── Content blocks ─────────────────────────────────────────────────────────

export type VisualThinkingContentBlockType =
  | "heading"
  | "paragraph"
  | "numbered_step"
  | "checklist_item"
  | "warning"
  | "tip"
  | "example"
  | "question"
  | "summary"
  | "key_point"
  | "glossary_term"
  | "comparison_row"
  | "process_node"
  | "relationship_node"
  | "decision_branch"
  | "timeline_event"
  | "placeholder"
  | "user_note";

export type VisualThinkingContentBlock = {
  id: string;
  type: VisualThinkingContentBlockType;
  title: string | null;
  content: string;
  order: number;
  parentId: string | null;
  metadata: Record<string, unknown>;
  editable: boolean;
  userEdited: boolean;
};

// ─── Generated deliverable ──────────────────────────────────────────────────

export type VisualThinkingGeneratedDeliverableRole = "primary" | "supporting";

export type VisualThinkingGeneratedDeliverableStatus =
  | "draft"
  | "review_ready"
  | "approved"
  | "archived"
  | "failed";

export type VisualThinkingGeneratedDeliverable = {
  id: string;
  generationRunId: string;
  planId: string;
  type: PlanDeliverableType;
  role: VisualThinkingGeneratedDeliverableRole;
  title: string;
  purpose: string;
  audience: string | null;
  detailLevel: "essentials" | "guided" | "detailed";
  blocks: VisualThinkingContentBlock[];
  linkedDeliverableIds: string[];
  editable: boolean;
  userEdited: boolean;
  status: VisualThinkingGeneratedDeliverableStatus;
  sourceMode:
    | "deterministic_v1"
    | "user_supplied"
    | "research_placeholder"
    | "user_led_shell";
  sourceReferences: string[];
  /** Visual shell metadata (nodes/edges) — not rendered in this build. */
  visualShell: VisualThinkingVisualShell | null;
  createdAt: string;
  updatedAt: string;
  error: string | null;
};

export type VisualThinkingVisualShell = {
  kind: "process_flow" | "relationship_map" | "decision_tree" | "timeline" | "user_led";
  nodes: Array<{
    id: string;
    kind: string;
    label: string;
    placeholder?: boolean;
  }>;
  relationships: Array<{
    id: string;
    from: string;
    to: string;
    kind: string;
    label?: string;
  }>;
  starterPrompts: string[];
  suggestedRepresentation: string | null;
};

// ─── Generation run ─────────────────────────────────────────────────────────

export type VisualThinkingGenerationRunStatus =
  | "ready"
  | "generating"
  | "awaiting_research"
  | "awaiting_user_input"
  | "review_ready"
  | "completed"
  | "failed"
  | "cancelled"
  | "partial";

export type VisualThinkingGenerationError = {
  stage: VisualThinkingGenerationStage | "unknown";
  deliverableType: PlanDeliverableType | null;
  message: string;
};

export type VisualThinkingGenerationRun = {
  id: string;
  planId: string;
  understandingId: string;
  requestId: string;
  status: VisualThinkingGenerationRunStatus;
  currentStage: VisualThinkingGenerationStage | null;
  completedStages: VisualThinkingGenerationStage[];
  deliverableIds: string[];
  primaryDeliverableId: string | null;
  supportingDeliverableIds: string[];
  researchBlocked: boolean;
  researchBlockReason: string | null;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  generationMode: VisualThinkingInteractionStyle;
  generatedBy: "deterministic_v1";
  generationVersion: "vts-generation-1";
  errors: VisualThinkingGenerationError[];
  warnings: string[];
  userFacingStatus: string;
};

export type VisualThinkingGenerationContext = {
  requestId: string;
  understandingId: string;
  rawRequest: string;
  userFacingGoal?: string | null;
  successDefinition?: string | null;
  /** Explicit user-supplied body (steps, ideas) — never inferred from goal logic. */
  suppliedContent?: string | null;
  topicHint?: string | null;
  /**
   * When Research Acquisition Intelligence has satisfied required knowledge gaps.
   * Does not change the Experience Plan — only lifts the generation research gate.
   */
  knowledgeResearchSatisfied?: boolean;
};

export type VisualThinkingGenerationBundle = {
  run: VisualThinkingGenerationRun;
  deliverables: VisualThinkingGeneratedDeliverable[];
};

export type BlockEdit =
  | { kind: "edit"; blockId: string; content: string; title?: string | null }
  | { kind: "add"; afterBlockId: string | null; block: Omit<VisualThinkingContentBlock, "id" | "order" | "userEdited"> }
  | { kind: "remove"; blockId: string }
  | { kind: "reorder"; orderedBlockIds: string[] };

export type SectionTransform = "simplify" | "deepen" | "regenerate";

const GENERATION_DRAFT_KEY = "companion-visual-thinking-generation-run-v1";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function block(
  type: VisualThinkingContentBlockType,
  content: string,
  order: number,
  extras: Partial<VisualThinkingContentBlock> = {},
): VisualThinkingContentBlock {
  return {
    id: newId("vtb"),
    type,
    title: extras.title ?? null,
    content,
    order,
    parentId: extras.parentId ?? null,
    metadata: extras.metadata ?? {},
    editable: extras.editable ?? true,
    userEdited: extras.userEdited ?? false,
  };
}

function topicFromContext(ctx: VisualThinkingGenerationContext): string {
  const hint = ctx.topicHint?.trim();
  if (hint) return hint;
  const raw = ctx.rawRequest.trim();
  if (raw.length <= 72) return raw.replace(/[.?!]$/, "");
  return raw.slice(0, 72).trim() + "…";
}

function parseSuppliedLines(supplied: string | null | undefined): string[] {
  if (!supplied?.trim()) return [];
  return supplied
    .split(/\n+|(?:(?<=\d)[\).]\s+)/)
    .map((l) => l.replace(/^\s*[-*•]\s*/, "").replace(/^\d+[\).]\s*/, "").trim())
    .filter(Boolean);
}

function extractSuppliedFromRequest(raw: string): string[] {
  // Only treat clearly listed steps after a colon / "steps:" marker — not goal inference.
  const marker = raw.match(
    /(?:steps?|workflow|process|ideas)\s*:\s*([\s\S]+)$/i,
  );
  if (!marker?.[1]) return [];
  return parseSuppliedLines(marker[1]);
}

function researchBlocksNeeded(
  plan: VisualThinkingExperiencePlan,
  ctx?: VisualThinkingGenerationContext,
): boolean {
  if (plan.researchStage !== "before_generation") return false;
  if (ctx?.knowledgeResearchSatisfied) return false;
  return true;
}

/** Guard used in tests — Generation must not import Understanding inference. */
export function generationEngineConsumesPlanOnly(
  plan: VisualThinkingExperiencePlan,
): boolean {
  return Boolean(
    plan.primaryDeliverable &&
      plan.generationStages &&
      plan.interactionStyle &&
      plan.researchStage &&
      plan.detailLevel,
  );
}

// ─── Generators ─────────────────────────────────────────────────────────────

function makeDeliverableBase(input: {
  runId: string;
  plan: VisualThinkingExperiencePlan;
  type: PlanDeliverableType;
  role: VisualThinkingGeneratedDeliverableRole;
  title: string;
  purpose: string;
  sourceMode: VisualThinkingGeneratedDeliverable["sourceMode"];
}): Omit<VisualThinkingGeneratedDeliverable, "blocks" | "visualShell"> & {
  blocks: VisualThinkingContentBlock[];
  visualShell: VisualThinkingVisualShell | null;
} {
  const timestamp = nowIso();
  return {
    id: newId("vtd"),
    generationRunId: input.runId,
    planId: input.plan.id,
    type: input.type,
    role: input.role,
    title: input.title,
    purpose: input.purpose,
    audience: null,
    detailLevel: input.plan.detailLevel,
    blocks: [],
    linkedDeliverableIds: [],
    editable: true,
    userEdited: false,
    status: "draft",
    sourceMode: input.sourceMode,
    sourceReferences: [],
    visualShell: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    error: null,
  };
}

function generateStepByStep(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
  role: VisualThinkingGeneratedDeliverableRole,
  researchBlocked: boolean,
): VisualThinkingGeneratedDeliverable {
  const topic = topicFromContext(ctx);
  const fromContext = parseSuppliedLines(ctx.suppliedContent);
  const supplied =
    fromContext.length > 0
      ? fromContext
      : extractSuppliedFromRequest(ctx.rawRequest);
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "step_by_step_guide",
    role,
    title: `Guide: ${topic}`,
    purpose: ctx.successDefinition || ctx.userFacingGoal || "Follow these steps with confidence.",
    sourceMode: researchBlocked
      ? "research_placeholder"
      : supplied.length
        ? "user_supplied"
        : "deterministic_v1",
  });

  const blocks: VisualThinkingContentBlock[] = [
    block("heading", topic, 0, { title: "Overview" }),
    block(
      "paragraph",
      plan.detailLevel === "essentials"
        ? "A concise sequence to complete this task."
        : "Follow these steps in order. You can edit any step.",
      1,
    ),
  ];

  if (researchBlocked && supplied.length === 0) {
    blocks.push(
      block(
        "placeholder",
        "Current product-specific steps will be filled after research is gathered. No interface sequence has been invented.",
        2,
        { title: "Awaiting verified steps", metadata: { researchDependent: true } },
      ),
      block("numbered_step", "Prepare your workspace and open the product.", 3, {
        title: "Step 1",
        metadata: { safeGeneric: true },
      }),
      block(
        "placeholder",
        "Record / capture — exact controls verified after research.",
        4,
        { title: "Step 2", metadata: { researchDependent: true } },
      ),
      block(
        "placeholder",
        "Review and share — exact options verified after research.",
        5,
        { title: "Step 3", metadata: { researchDependent: true } },
      ),
    );
  } else if (supplied.length > 0) {
    supplied.forEach((step, i) => {
      blocks.push(
        block("numbered_step", step, blocks.length, {
          title: `Step ${i + 1}`,
        }),
      );
    });
  } else if (plan.interactionStyle === "guide_me") {
    blocks.push(
      block("numbered_step", "Start with the first action you already know.", blocks.length, {
        title: "Step 1",
      }),
      block(
        "question",
        "What is the next concrete action after that?",
        blocks.length,
        { title: "Your turn" },
      ),
      block(
        "user_note",
        "Add the remaining steps in your own words.",
        blocks.length,
        { title: "Continue here" },
      ),
    );
  } else {
    const count = plan.detailLevel === "essentials" ? 3 : plan.detailLevel === "detailed" ? 6 : 4;
    for (let i = 0; i < count; i++) {
      blocks.push(
        block(
          "numbered_step",
          `Complete step ${i + 1} for ${topic}.`,
          blocks.length,
          { title: `Step ${i + 1}` },
        ),
      );
    }
    if (plan.detailLevel === "detailed") {
      blocks.push(
        block("tip", "Pause to review before the final step.", blocks.length, {
          title: "Check",
        }),
      );
    }
  }

  if (plan.detailLevel === "detailed" && !researchBlocked) {
    blocks.push(
      block("summary", "You should be able to repeat this sequence confidently.", blocks.length, {
        title: "Done when",
      }),
    );
  }

  d.blocks = blocks;
  d.status = researchBlocked ? "draft" : "review_ready";
  return d;
}

function generateChecklist(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
  role: VisualThinkingGeneratedDeliverableRole,
  researchBlocked: boolean,
): VisualThinkingGeneratedDeliverable {
  const topic = topicFromContext(ctx);
  const supplied =
    parseSuppliedLines(ctx.suppliedContent).length > 0
      ? parseSuppliedLines(ctx.suppliedContent)
      : extractSuppliedFromRequest(ctx.rawRequest);
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "checklist",
    role,
    title: `Checklist: ${topic}`,
    purpose: "Track completion without extra explanation.",
    sourceMode: researchBlocked ? "research_placeholder" : "deterministic_v1",
  });
  const blocks: VisualThinkingContentBlock[] = [
    block("heading", topic, 0, { title: "Checklist" }),
  ];
  if (researchBlocked && supplied.length === 0) {
    blocks.push(
      block(
        "placeholder",
        "Checklist items that depend on current product details will appear after research.",
        1,
        { metadata: { researchDependent: true } },
      ),
      block("checklist_item", "Prepare what you need before you begin", 2),
      block("checklist_item", "Complete the core action (details after research)", 3, {
        metadata: { researchDependent: true },
      }),
      block("checklist_item", "Review and finish", 4),
    );
  } else if (supplied.length > 0) {
    supplied.forEach((item, i) => {
      blocks.push(block("checklist_item", item, i + 1));
    });
  } else {
    const n = plan.detailLevel === "essentials" ? 3 : 5;
    for (let i = 0; i < n; i++) {
      blocks.push(
        block("checklist_item", `Item ${i + 1} for ${topic}`, i + 1),
      );
    }
  }
  d.blocks = blocks;
  d.status = researchBlocked ? "draft" : "review_ready";
  return d;
}

function generateReport(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
  role: VisualThinkingGeneratedDeliverableRole,
  researchBlocked: boolean,
): VisualThinkingGeneratedDeliverable {
  const topic = topicFromContext(ctx);
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "report",
    role,
    title: `Report: ${topic}`,
    purpose: ctx.successDefinition || "A clear written explanation.",
    sourceMode: researchBlocked ? "research_placeholder" : "deterministic_v1",
  });
  const blocks: VisualThinkingContentBlock[] = [
    block("heading", topic, 0, { title: "Purpose" }),
    block(
      "paragraph",
      ctx.userFacingGoal || `Explain ${topic} clearly enough to move forward.`,
      1,
    ),
    block("heading", "Executive summary", 2, { title: "Executive summary" }),
  ];
  if (researchBlocked) {
    blocks.push(
      block(
        "placeholder",
        "Key findings will be filled after research. No current facts, regulations, or market claims have been invented.",
        3,
        { metadata: { researchDependent: true } },
      ),
      block("heading", "Background", 4, { title: "Background" }),
      block(
        "placeholder",
        "Background details await verified sources.",
        5,
        { metadata: { researchDependent: true } },
      ),
      block("heading", "Sources", 6, { title: "Sources" }),
      block("placeholder", "Sources will be listed when research is available.", 7, {
        metadata: { researchDependent: true },
      }),
    );
  } else {
    blocks.push(
      block(
        "summary",
        plan.detailLevel === "essentials"
          ? `Core points about ${topic}.`
          : `This report outlines what matters most about ${topic}.`,
        3,
      ),
      block("heading", "Explanation", 4, { title: "Explanation" }),
      block(
        "paragraph",
        ctx.suppliedContent?.trim() ||
          `Use your notes and known context about ${topic} here.`,
        5,
      ),
    );
    if (plan.detailLevel !== "essentials") {
      blocks.push(
        block("heading", "Considerations", 6, { title: "Considerations" }),
        block("question", "What else do you need to know before deciding?", 7),
      );
    }
    if (plan.detailLevel === "detailed") {
      blocks.push(
        block("heading", "Implications", 8, { title: "Implications" }),
        block("key_point", "Capture implications that matter for your next step.", 9),
      );
    }
  }
  d.blocks = blocks;
  d.status = researchBlocked ? "draft" : "review_ready";
  return d;
}

function generateSop(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
  role: VisualThinkingGeneratedDeliverableRole,
): VisualThinkingGeneratedDeliverable {
  const topic = topicFromContext(ctx);
  const supplied =
    parseSuppliedLines(ctx.suppliedContent).length > 0
      ? parseSuppliedLines(ctx.suppliedContent)
      : extractSuppliedFromRequest(ctx.rawRequest);
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "sop",
    role,
    title: `SOP: ${topic}`,
    purpose: "A repeatable procedure someone can follow consistently.",
    sourceMode: supplied.length ? "user_supplied" : "deterministic_v1",
  });
  const blocks: VisualThinkingContentBlock[] = [
    block("heading", "Purpose", 0, { title: "Purpose" }),
    block("paragraph", ctx.successDefinition || `Standardize how to complete ${topic}.`, 1),
    block("heading", "Scope", 2, { title: "Scope" }),
    block(
      plan.interactionStyle === "guide_me" ? "question" : "paragraph",
      plan.interactionStyle === "guide_me"
        ? "Who should follow this SOP, and when does it apply?"
        : `Applies to completing ${topic}.`,
      3,
    ),
    block("heading", "Prerequisites", 4, { title: "Prerequisites" }),
    block(
      plan.interactionStyle === "guide_me" ? "user_note" : "checklist_item",
      plan.interactionStyle === "guide_me"
        ? "List access, tools, or information needed before starting."
        : "Gather what you need before beginning",
      5,
    ),
    block("heading", "Procedure", 6, { title: "Procedure" }),
  ];
  if (supplied.length > 0) {
    supplied.forEach((step, i) => {
      blocks.push(
        block("numbered_step", step, blocks.length, { title: `${i + 1}.` }),
      );
    });
  } else if (plan.interactionStyle === "guide_me") {
    blocks.push(
      block("numbered_step", "Begin the known first action.", blocks.length, {
        title: "1.",
      }),
      block("question", "What happens next?", blocks.length),
      block("user_note", "Add remaining procedure steps.", blocks.length),
    );
  } else if (plan.interactionStyle === "let_me_build") {
    blocks.push(
      block("placeholder", "Add your procedure steps here.", blocks.length),
    );
  } else {
    const n = plan.detailLevel === "essentials" ? 3 : 5;
    for (let i = 0; i < n; i++) {
      blocks.push(
        block("numbered_step", `Procedure step ${i + 1}`, blocks.length, {
          title: `${i + 1}.`,
        }),
      );
    }
  }
  if (plan.detailLevel === "detailed" && plan.interactionStyle !== "guide_me") {
    blocks.push(
      block("heading", "Quality checks", blocks.length, { title: "Quality checks" }),
      block("checklist_item", "Confirm the outcome matches the completion criteria", blocks.length),
      block("heading", "Exception handling", blocks.length, {
        title: "Exception handling",
      }),
      block("paragraph", "Note what to do when a step cannot be completed.", blocks.length),
    );
  }
  blocks.push(
    block("heading", "Completion criteria", blocks.length, {
      title: "Completion criteria",
    }),
    block(
      "key_point",
      ctx.successDefinition || "The procedure is complete when the intended result is achieved.",
      blocks.length,
    ),
  );
  d.blocks = blocks;
  d.status =
    plan.interactionStyle === "guide_me" ? "draft" : "review_ready";
  return d;
}

function generateTrainingGuide(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
  role: VisualThinkingGeneratedDeliverableRole,
): VisualThinkingGeneratedDeliverable {
  const topic = topicFromContext(ctx);
  const supplied =
    parseSuppliedLines(ctx.suppliedContent).length > 0
      ? parseSuppliedLines(ctx.suppliedContent)
      : extractSuppliedFromRequest(ctx.rawRequest);
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "training_guide",
    role,
    title: `Training: ${topic}`,
    purpose: "Help someone else complete this process consistently.",
    sourceMode: supplied.length ? "user_supplied" : "deterministic_v1",
  });
  const blocks: VisualThinkingContentBlock[] = [
    block("heading", "Learning objective", 0, { title: "Learning objective" }),
    block(
      "paragraph",
      ctx.successDefinition ||
        "Staff can complete this process consistently without guessing.",
      1,
    ),
    block("heading", "Audience", 2, { title: "Audience" }),
    block("paragraph", "Team members who will perform this work.", 3),
    block("heading", "Explanation", 4, { title: "Explanation" }),
    block(
      "paragraph",
      `This training covers ${topic}. Walk through each part before practicing.`,
      5,
    ),
    block("heading", "Demonstration / procedure", 6, {
      title: "Demonstration",
    }),
  ];
  if (supplied.length > 0) {
    supplied.forEach((step, i) => {
      blocks.push(
        block("numbered_step", step, blocks.length, { title: `Step ${i + 1}` }),
      );
    });
  } else {
    blocks.push(
      block("numbered_step", "Show the first action.", blocks.length, {
        title: "Step 1",
      }),
      block("numbered_step", "Show the core action.", blocks.length, {
        title: "Step 2",
      }),
      block("numbered_step", "Show how to finish and confirm.", blocks.length, {
        title: "Step 3",
      }),
    );
  }
  if (plan.detailLevel !== "essentials") {
    blocks.push(
      block("heading", "Guided practice", blocks.length, {
        title: "Guided practice",
      }),
      block(
        "question",
        "Have the learner complete the process once with support nearby.",
        blocks.length,
      ),
      block("heading", "Common mistakes", blocks.length, {
        title: "Common mistakes",
      }),
      block(
        "warning",
        "Note the mistakes that cause rework — fill from your experience.",
        blocks.length,
      ),
    );
  }
  if (plan.detailLevel === "detailed") {
    blocks.push(
      block("heading", "Review questions", blocks.length, {
        title: "Review questions",
      }),
      block("question", "What is the trigger to start this process?", blocks.length),
      block("question", "How do you know it was completed correctly?", blocks.length),
    );
  }
  blocks.push(
    block("heading", "Completion standard", blocks.length, {
      title: "Completion standard",
    }),
    block(
      "key_point",
      "The learner can complete the process without prompting.",
      blocks.length,
    ),
  );
  d.blocks = blocks;
  d.status = "review_ready";
  return d;
}

function generateExplanation(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
  role: VisualThinkingGeneratedDeliverableRole,
  detailed: boolean,
): VisualThinkingGeneratedDeliverable {
  const topic = topicFromContext(ctx);
  const type: PlanDeliverableType = detailed
    ? "report"
    : "concise_explanation";
  // Prefer concise_explanation type when plan asked for it
  const deliverableType =
    plan.primaryDeliverable === "concise_explanation" || !detailed
      ? "concise_explanation"
      : plan.primaryDeliverable === "detailed_explanation" as never
        ? "report"
        : type;
  const d = makeDeliverableBase({
    runId,
    plan,
    type:
      plan.primaryDeliverable === "concise_explanation"
        ? "concise_explanation"
        : deliverableType === "concise_explanation"
          ? "concise_explanation"
          : "report",
    role,
    title: detailed ? `Explanation: ${topic}` : `Overview: ${topic}`,
    purpose: "A clear written explanation.",
    sourceMode: "deterministic_v1",
  });
  if (plan.primaryDeliverable === "concise_explanation" || plan.detailLevel === "essentials") {
    d.type = "concise_explanation";
    d.blocks = [
      block("heading", topic, 0),
      block(
        "paragraph",
        ctx.suppliedContent?.trim() ||
          `Here is a short overview of ${topic}.`,
        1,
      ),
      block("key_point", "Keep the next step small and clear.", 2),
    ];
  } else {
    d.type = "report";
    d.blocks = [
      block("heading", topic, 0),
      block("paragraph", `A fuller explanation of ${topic}.`, 1),
      block("heading", "Key points", 2),
      block("key_point", "What it is", 3),
      block("key_point", "Why it matters", 4),
      block("key_point", "What to do next", 5),
      block("example", "Add an example that fits your context.", 6),
    ];
  }
  d.status = "review_ready";
  return d;
}

function generateComparison(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
  role: VisualThinkingGeneratedDeliverableRole,
  researchBlocked: boolean,
): VisualThinkingGeneratedDeliverable {
  const topic = topicFromContext(ctx);
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "comparison",
    role,
    title: `Comparison: ${topic}`,
    purpose: "Clarify meaningful differences — you stay the decision-maker.",
    sourceMode: researchBlocked ? "research_placeholder" : "deterministic_v1",
  });
  const blocks: VisualThinkingContentBlock[] = [
    block("heading", topic, 0),
    block(
      "paragraph",
      "Compare options on the criteria that matter. Spark will not choose for you.",
      1,
    ),
  ];
  if (researchBlocked) {
    blocks.push(
      block(
        "placeholder",
        "Current product features, pricing, and market facts await research. Rows below are structure only.",
        2,
        { metadata: { researchDependent: true } },
      ),
    );
  }
  blocks.push(
    block("comparison_row", "Option A — criteria pending", blocks.length, {
      metadata: { option: "A" },
    }),
    block("comparison_row", "Option B — criteria pending", blocks.length, {
      metadata: { option: "B" },
    }),
    block("question", "Which differences matter most for your situation?", blocks.length),
  );
  d.blocks = blocks;
  d.status = researchBlocked ? "draft" : "review_ready";
  return d;
}

function generateActionPlan(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
  role: VisualThinkingGeneratedDeliverableRole,
): VisualThinkingGeneratedDeliverable {
  const topic = topicFromContext(ctx);
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "action_plan",
    role,
    title: `Action plan: ${topic}`,
    purpose: "Move from intention to concrete next actions.",
    sourceMode: "deterministic_v1",
  });
  d.blocks = [
    block("heading", topic, 0),
    block("paragraph", ctx.successDefinition || "A practical sequence of next actions.", 1),
    block("numbered_step", "Clarify the outcome you want.", 2, { title: "1" }),
    block("numbered_step", "Choose the first small action.", 3, { title: "2" }),
    block("numbered_step", "Schedule or start that action.", 4, { title: "3" }),
    block("checklist_item", "Review progress and adjust", 5),
  ];
  d.status = "review_ready";
  return d;
}

function generateCommonMistakes(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
): VisualThinkingGeneratedDeliverable {
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "common_mistakes",
    role: "supporting",
    title: `Common mistakes: ${topicFromContext(ctx)}`,
    purpose: "Avoid the pitfalls that slow people down.",
    sourceMode: "deterministic_v1",
  });
  d.blocks = [
    block("heading", "Common mistakes", 0),
    block("warning", "Skipping preparation and rushing the first step.", 1),
    block("warning", "Leaving no time to review before sharing or finishing.", 2),
    block("tip", "Add mistakes you have already seen in practice.", 3),
  ];
  d.status = "review_ready";
  return d;
}

function generateGlossary(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
): VisualThinkingGeneratedDeliverable {
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "glossary",
    role: "supporting",
    title: `Glossary: ${topicFromContext(ctx)}`,
    purpose: "Shared language for the topic.",
    sourceMode: "deterministic_v1",
  });
  d.blocks = [
    block("heading", "Glossary", 0),
    block("glossary_term", "Add a key term and a plain definition.", 1, {
      title: "Term 1",
    }),
    block("glossary_term", "Add another term your audience needs.", 2, {
      title: "Term 2",
    }),
  ];
  d.status = "review_ready";
  return d;
}

function generateFaq(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
): VisualThinkingGeneratedDeliverable {
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "faq",
    role: "supporting",
    title: `FAQ: ${topicFromContext(ctx)}`,
    purpose: "Answer the questions people ask most.",
    sourceMode: "deterministic_v1",
  });
  d.blocks = [
    block("heading", "FAQ", 0),
    block("question", "What is the first thing to know?", 1),
    block("paragraph", "Add a short answer here.", 2),
    block("question", "What is commonly misunderstood?", 3),
    block("paragraph", "Add a short answer here.", 4),
  ];
  d.status = "review_ready";
  return d;
}

function generateSummary(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
): VisualThinkingGeneratedDeliverable {
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "summary",
    role: "supporting",
    title: `Summary: ${topicFromContext(ctx)}`,
    purpose: "A short overview.",
    sourceMode: "deterministic_v1",
  });
  d.blocks = [
    block("heading", "Summary", 0),
    block(
      "summary",
      ctx.userFacingGoal || `The essentials of ${topicFromContext(ctx)}.`,
      1,
    ),
  ];
  d.status = "review_ready";
  return d;
}

function generateQuickReference(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
): VisualThinkingGeneratedDeliverable {
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "quick_reference",
    role: "supporting",
    title: `Quick reference: ${topicFromContext(ctx)}`,
    purpose: "A short card for recall.",
    sourceMode: "deterministic_v1",
  });
  d.blocks = [
    block("heading", "Quick reference", 0),
    block("key_point", "Start", 1),
    block("key_point", "Do the core action", 2),
    block("key_point", "Review and finish", 3),
  ];
  d.status = "review_ready";
  return d;
}

function generateExamples(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
): VisualThinkingGeneratedDeliverable {
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "examples",
    role: "supporting",
    title: `Examples: ${topicFromContext(ctx)}`,
    purpose: "Concrete examples to make the idea clearer.",
    sourceMode: "deterministic_v1",
  });
  d.blocks = [
    block("heading", "Examples", 0),
    block("example", "Example 1 — describe a realistic case.", 1),
    block("example", "Example 2 — describe a contrasting case.", 2),
  ];
  d.status = "review_ready";
  return d;
}

function generateProcessFlowShell(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
  role: VisualThinkingGeneratedDeliverableRole,
): VisualThinkingGeneratedDeliverable {
  const topic = topicFromContext(ctx);
  const supplied =
    parseSuppliedLines(ctx.suppliedContent).length > 0
      ? parseSuppliedLines(ctx.suppliedContent)
      : extractSuppliedFromRequest(ctx.rawRequest);
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "process_flow",
    role,
    title: `Process flow: ${topic}`,
    purpose: "Structured process nodes — canvas rendering comes later.",
    sourceMode: "deterministic_v1",
  });
  const startId = newId("node");
  const endId = newId("node");
  const stepNodes = (supplied.length > 0 ? supplied : ["First action", "Core action", "Finish"]).map(
    (label, i) => ({
      id: newId("node"),
      kind: "step",
      label,
      order: i,
    }),
  );
  const nodes = [
    { id: startId, kind: "start", label: "Start" },
    ...stepNodes.map(({ id, kind, label }) => ({ id, kind, label })),
    { id: endId, kind: "end", label: "End" },
  ];
  const relationships: VisualThinkingVisualShell["relationships"] = [];
  let prev = startId;
  for (const n of stepNodes) {
    relationships.push({
      id: newId("rel"),
      from: prev,
      to: n.id,
      kind: "next",
    });
    prev = n.id;
  }
  relationships.push({
    id: newId("rel"),
    from: prev,
    to: endId,
    kind: "next",
  });
  d.visualShell = {
    kind: "process_flow",
    nodes,
    relationships,
    starterPrompts: ["Add a decision point where the path can branch."],
    suggestedRepresentation: "process_flow",
  };
  d.blocks = [
    block("heading", topic, 0),
    block(
      "paragraph",
      "Process structure is ready as nodes and relationships. Visual canvas rendering is not included in this build.",
      1,
    ),
    ...stepNodes.map((n, i) =>
      block("process_node", n.label, i + 2, {
        title: n.kind,
        metadata: { nodeId: n.id },
      }),
    ),
  ];
  d.status = "review_ready";
  return d;
}

function generateRelationshipMapShell(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
  role: VisualThinkingGeneratedDeliverableRole,
  userLed: boolean,
): VisualThinkingGeneratedDeliverable {
  const topic = topicFromContext(ctx);
  const d = makeDeliverableBase({
    runId,
    plan,
    type: userLed ? "editable_relationship_map" : "relationship_visualization",
    role,
    title: userLed ? `Your map: ${topic}` : `Relationships: ${topic}`,
    purpose: userLed
      ? "An editable blank visual space — not a completed map."
      : "Relationship structure shell — canvas rendering comes later.",
    sourceMode: userLed ? "user_led_shell" : "deterministic_v1",
  });
  const centerId = newId("node");
  d.visualShell = {
    kind: userLed ? "user_led" : "relationship_map",
    nodes: [
      {
        id: centerId,
        kind: "central",
        label: userLed ? "Central topic (add yours)" : topic,
        placeholder: userLed,
      },
    ],
    relationships: [],
    starterPrompts: userLed
      ? [
          "What is the central idea?",
          "What related areas belong around it?",
          "How do those areas connect?",
        ]
      : ["Add related topics and label how they connect."],
    suggestedRepresentation: "relationship_map",
  };
  d.blocks = [
    block("heading", topic, 0),
    block(
      "placeholder",
      userLed
        ? "Empty node collection — add your own ideas. Spark has not completed a map for you."
        : "Central concept ready. Add related nodes when you review.",
      1,
      { title: "Central topic" },
    ),
    block("relationship_node", "Related area (optional)", 2, {
      metadata: { placeholder: true },
    }),
    ...(userLed
      ? [
          block("user_note", "Add nodes and connections in your own words.", 3, {
            title: "Starter",
          }),
        ]
      : []),
  ];
  d.status = "review_ready";
  return d;
}

function generateDecisionTreeShell(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
  role: VisualThinkingGeneratedDeliverableRole,
): VisualThinkingGeneratedDeliverable {
  const topic = topicFromContext(ctx);
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "decision_tree",
    role,
    title: `Decision structure: ${topic}`,
    purpose: "Structure the decision — Spark does not decide for you.",
    sourceMode: "deterministic_v1",
  });
  const qId = newId("node");
  const aId = newId("node");
  const bId = newId("node");
  d.visualShell = {
    kind: "decision_tree",
    nodes: [
      { id: qId, kind: "decision", label: `What decision are you making about ${topic}?` },
      { id: aId, kind: "option", label: "Option A" },
      { id: bId, kind: "option", label: "Option B" },
    ],
    relationships: [
      { id: newId("rel"), from: qId, to: aId, kind: "branches_to", label: "If A" },
      { id: newId("rel"), from: qId, to: bId, kind: "branches_to", label: "If B" },
    ],
    starterPrompts: [
      "What criteria matter most?",
      "What would make Option A the better fit?",
      "What risk would you regret missing?",
    ],
    suggestedRepresentation: "decision_tree",
  };
  d.blocks = [
    block("heading", topic, 0),
    block("question", `What decision are you making about ${topic}?`, 1),
    block("decision_branch", "Option A — criteria and outcome placeholder", 2),
    block("decision_branch", "Option B — criteria and outcome placeholder", 3),
    block(
      "key_point",
      "You remain the decision-maker. This structure only clarifies tradeoffs.",
      4,
    ),
  ];
  d.status = "review_ready";
  return d;
}

function generateTimelineShell(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
): VisualThinkingGeneratedDeliverable {
  const d = makeDeliverableBase({
    runId,
    plan,
    type: "timeline",
    role: "supporting",
    title: `Timeline: ${topicFromContext(ctx)}`,
    purpose: "Sequence events over time — shell only.",
    sourceMode: "deterministic_v1",
  });
  d.visualShell = {
    kind: "timeline",
    nodes: [
      { id: newId("node"), kind: "event", label: "Beginning" },
      { id: newId("node"), kind: "event", label: "Middle" },
      { id: newId("node"), kind: "event", label: "Later" },
    ],
    relationships: [],
    starterPrompts: ["Add dates or milestones that matter."],
    suggestedRepresentation: "timeline",
  };
  d.blocks = [
    block("heading", "Timeline", 0),
    block("timeline_event", "Beginning", 1),
    block("timeline_event", "Middle", 2),
    block("timeline_event", "Later", 3),
  ];
  d.status = "review_ready";
  return d;
}

function isVisualType(type: PlanDeliverableType): boolean {
  return (
    type === "process_flow" ||
    type === "relationship_visualization" ||
    type === "editable_relationship_map" ||
    type === "decision_tree" ||
    type === "timeline" ||
    type === "mind_map" as never
  );
}

function generateOne(
  type: PlanDeliverableType,
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
  runId: string,
  role: VisualThinkingGeneratedDeliverableRole,
  researchBlocked: boolean,
): VisualThinkingGeneratedDeliverable {
  // Explicit exclusions
  if (plan.declinesMap && isVisualType(type) && type !== "decision_tree") {
    // decision_tree may remain as structured decision support without map canvas
    if (
      type === "process_flow" ||
      type === "relationship_visualization" ||
      type === "editable_relationship_map" ||
      type === "timeline"
    ) {
      throw new Error("Map/visual deliverable blocked by no-map preference.");
    }
  }

  switch (type) {
    case "step_by_step_guide":
    case "learning_guide":
      return generateStepByStep(plan, ctx, runId, role, researchBlocked);
    case "checklist":
      return generateChecklist(plan, ctx, runId, role, researchBlocked);
    case "report":
      return generateReport(plan, ctx, runId, role, researchBlocked);
    case "sop":
      return generateSop(plan, ctx, runId, role);
    case "training_guide":
      return generateTrainingGuide(plan, ctx, runId, role);
    case "concise_explanation":
      return generateExplanation(plan, ctx, runId, role, false);
    case "comparison":
      return generateComparison(plan, ctx, runId, role, researchBlocked);
    case "action_plan":
      return generateActionPlan(plan, ctx, runId, role);
    case "common_mistakes":
      return generateCommonMistakes(plan, ctx, runId);
    case "glossary":
      return generateGlossary(plan, ctx, runId);
    case "faq":
      return generateFaq(plan, ctx, runId);
    case "summary":
      return generateSummary(plan, ctx, runId);
    case "quick_reference":
      return generateQuickReference(plan, ctx, runId);
    case "examples":
      return generateExamples(plan, ctx, runId);
    case "process_flow":
      return generateProcessFlowShell(plan, ctx, runId, role);
    case "relationship_visualization":
      return generateRelationshipMapShell(plan, ctx, runId, role, false);
    case "editable_relationship_map":
      return generateRelationshipMapShell(plan, ctx, runId, role, true);
    case "decision_tree":
      return generateDecisionTreeShell(plan, ctx, runId, role);
    case "timeline":
      return generateTimelineShell(plan, ctx, runId);
    case "questions_to_consider":
      return (() => {
        const d = makeDeliverableBase({
          runId,
          plan,
          type,
          role,
          title: `Questions: ${topicFromContext(ctx)}`,
          purpose: "Questions to consider — not answers.",
          sourceMode: "deterministic_v1",
        });
        d.blocks = [
          block("heading", "Questions to consider", 0),
          block("question", "What matters most here?", 1),
          block("question", "What would you regret overlooking?", 2),
          block("question", "What is the smallest useful next step?", 3),
        ];
        d.status = "review_ready";
        return d;
      })();
    default: {
      // Safe generic shell for less common types
      const d = makeDeliverableBase({
        runId,
        plan,
        type,
        role,
        title: deliverableLabel(type),
        purpose: `Structured draft for ${deliverableLabel(type)}.`,
        sourceMode: "deterministic_v1",
      });
      d.blocks = [
        block("heading", deliverableLabel(type), 0),
        block("paragraph", `Draft structure for ${topicFromContext(ctx)}.`, 1),
        block("placeholder", "Add the details that matter most.", 2),
      ];
      d.status = "review_ready";
      return d;
    }
  }
}

// ─── Run lifecycle ──────────────────────────────────────────────────────────

export function createGenerationRun(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
): VisualThinkingGenerationRun {
  const blocked = researchBlocksNeeded(plan, ctx);
  const timestamp = nowIso();
  return {
    id: newId("vtgr"),
    planId: plan.id,
    understandingId: ctx.understandingId,
    requestId: ctx.requestId,
    status: blocked ? "awaiting_research" : "ready",
    currentStage: plan.generationStages[0] ?? null,
    completedStages: [],
    deliverableIds: [],
    primaryDeliverableId: null,
    supportingDeliverableIds: [],
    researchBlocked: blocked,
    researchBlockReason: blocked
      ? "Research is required before generation can fill current facts, product steps, or market details."
      : null,
    startedAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
    generationMode: plan.interactionStyle,
    generatedBy: "deterministic_v1",
    generationVersion: "vts-generation-1",
    errors: [],
    warnings: [],
    userFacingStatus: blocked
      ? "I’m ready to build this once the research is gathered."
      : "Ready to create your first version.",
  };
}

export function executeGenerationRun(
  run: VisualThinkingGenerationRun,
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
): VisualThinkingGenerationBundle {
  // Plan must be confirmed / ready
  if (plan.status !== "ready_to_generate" && plan.status !== "confirmed") {
    return {
      run: {
        ...run,
        status: "failed",
        errors: [
          ...run.errors,
          {
            stage: "unknown",
            deliverableType: null,
            message: "Plan was not confirmed before generation.",
          },
        ],
        updatedAt: nowIso(),
        userFacingStatus: "Confirm the plan before creating anything.",
      },
      deliverables: [],
    };
  }

  let next: VisualThinkingGenerationRun = {
    ...run,
    status: "generating",
    currentStage: "create_primary",
    updatedAt: nowIso(),
    userFacingStatus: "Creating your first version…",
  };

  const deliverables: VisualThinkingGeneratedDeliverable[] = [];
  const completedStages: VisualThinkingGenerationStage[] = [...run.completedStages];

  // Research stage bookkeeping
  if (plan.generationStages.includes("research")) {
    completedStages.push("research");
  }
  if (plan.generationStages.includes("organize")) {
    completedStages.push("organize");
  }
  if (plan.generationStages.includes("prepare_user_led_canvas")) {
    next.currentStage = "prepare_user_led_canvas";
  }

  // Primary
  try {
    const primary = generateOne(
      plan.primaryDeliverable,
      plan,
      ctx,
      next.id,
      "primary",
      next.researchBlocked,
    );
    // Interaction: let_me_build must stay a shell
    if (plan.interactionStyle === "let_me_build") {
      primary.sourceMode = "user_led_shell";
      if (!primary.visualShell) {
        const shell = generateRelationshipMapShell(plan, ctx, next.id, "primary", true);
        primary.visualShell = shell.visualShell;
        primary.blocks = shell.blocks;
        primary.type = "editable_relationship_map";
      }
      // Ensure not presented as a completed populated map
      const hasOnlyPlaceholders = primary.blocks.every(
        (b) =>
          b.type === "placeholder" ||
          b.type === "heading" ||
          b.type === "user_note" ||
          b.type === "relationship_node" ||
          b.type === "paragraph",
      );
      if (!hasOnlyPlaceholders) {
        primary.blocks = primary.blocks.filter(
          (b) =>
            b.type === "heading" ||
            b.type === "placeholder" ||
            b.type === "user_note" ||
            b.type === "relationship_node",
        );
      }
    }
    deliverables.push(primary);
    next.primaryDeliverableId = primary.id;
    next.deliverableIds.push(primary.id);
    completedStages.push("create_primary");
  } catch (err) {
    next.errors.push({
      stage: "create_primary",
      deliverableType: plan.primaryDeliverable,
      message: err instanceof Error ? err.message : "Primary generation failed.",
    });
    next.status = "failed";
    next.userFacingStatus = "Something got tangled creating the main result.";
    next.updatedAt = nowIso();
    return { run: next, deliverables };
  }

  // Supporting — only what the plan lists
  next.currentStage = "create_supporting";
  const supportingIds: string[] = [];
  for (const type of plan.supportingDeliverables) {
    if (plan.declinesMap && isVisualType(type) && type !== "decision_tree") {
      next.warnings.push(
        `Skipped ${type} because a map/visual was declined.`,
      );
      continue;
    }
    try {
      const supporting = generateOne(
        type,
        plan,
        ctx,
        next.id,
        "supporting",
        next.researchBlocked,
      );
      deliverables.push(supporting);
      supportingIds.push(supporting.id);
      next.deliverableIds.push(supporting.id);
    } catch (err) {
      next.errors.push({
        stage: "create_supporting",
        deliverableType: type,
        message: err instanceof Error ? err.message : "Supporting generation failed.",
      });
      next.warnings.push(
        `Supporting ${deliverableLabel(type)} could not be created; primary was kept.`,
      );
    }
  }
  next.supportingDeliverableIds = supportingIds;
  if (plan.supportingDeliverables.length > 0) {
    completedStages.push("create_supporting");
  }

  // Link supporting ↔ primary
  const primary = deliverables.find((d) => d.id === next.primaryDeliverableId);
  if (primary) {
    primary.linkedDeliverableIds = supportingIds;
    for (const s of deliverables.filter((d) => d.role === "supporting")) {
      s.linkedDeliverableIds = [primary.id];
    }
  }

  completedStages.push("review");
  next.completedStages = [...new Set(completedStages)];
  next.currentStage = "return_to_user";
  next.updatedAt = nowIso();

  const primaryOk = Boolean(primary && primary.status !== "failed");
  const anyFailedSupporting = next.errors.some(
    (e) => e.stage === "create_supporting",
  );

  if (next.researchBlocked) {
    next.status = "awaiting_research";
    next.userFacingStatus =
      "I’m ready to build this once the research is gathered. A safe outline is available with placeholders for current facts.";
    if (primary) primary.status = "draft";
  } else if (
    plan.interactionStyle === "guide_me" &&
    primary &&
    primary.blocks.some((b) => b.type === "question" || b.type === "user_note")
  ) {
    next.status = "awaiting_user_input";
    next.userFacingStatus =
      "A guided structure is ready — a few places still need your words.";
    primary.status = "draft";
  } else if (primaryOk && anyFailedSupporting) {
    next.status = "partial";
    next.userFacingStatus =
      "Your main result is ready. One of the extras could not be created.";
    if (primary) primary.status = "review_ready";
  } else if (primaryOk) {
    next.status = "review_ready";
    next.completedAt = nowIso();
    next.userFacingStatus = "Your first version is ready.";
    if (primary) primary.status = "review_ready";
    completedStages.push("return_to_user");
    next.completedStages = [...new Set(completedStages)];
  } else {
    next.status = "failed";
    next.userFacingStatus = "The main result could not be created.";
  }

  return { run: next, deliverables };
}

export function startGenerationFromConfirmedPlan(
  plan: VisualThinkingExperiencePlan,
  ctx: VisualThinkingGenerationContext,
): VisualThinkingGenerationBundle {
  const run = createGenerationRun(plan, ctx);
  return executeGenerationRun(run, plan, ctx);
}

// ─── Editing & regeneration ─────────────────────────────────────────────────

export function applyBlockEdit(
  deliverable: VisualThinkingGeneratedDeliverable,
  edit: BlockEdit,
): VisualThinkingGeneratedDeliverable {
  const next = {
    ...deliverable,
    blocks: [...deliverable.blocks],
    userEdited: true,
    updatedAt: nowIso(),
  };

  switch (edit.kind) {
    case "edit": {
      next.blocks = next.blocks.map((b) =>
        b.id === edit.blockId
          ? {
              ...b,
              content: edit.content,
              title: edit.title !== undefined ? edit.title : b.title,
              userEdited: true,
            }
          : b,
      );
      break;
    }
    case "add": {
      const insertAt =
        edit.afterBlockId == null
          ? next.blocks.length
          : next.blocks.findIndex((b) => b.id === edit.afterBlockId) + 1;
      const newBlock: VisualThinkingContentBlock = {
        ...edit.block,
        id: newId("vtb"),
        order: insertAt,
        userEdited: true,
      };
      next.blocks.splice(Math.max(0, insertAt), 0, newBlock);
      next.blocks = next.blocks.map((b, i) => ({ ...b, order: i }));
      break;
    }
    case "remove": {
      next.blocks = next.blocks
        .filter((b) => b.id !== edit.blockId)
        .map((b, i) => ({ ...b, order: i }));
      break;
    }
    case "reorder": {
      const map = new Map(next.blocks.map((b) => [b.id, b]));
      next.blocks = edit.orderedBlockIds
        .map((id, i) => {
          const b = map.get(id);
          return b ? { ...b, order: i } : null;
        })
        .filter((b): b is VisualThinkingContentBlock => Boolean(b));
      break;
    }
  }
  return next;
}

export function transformBlock(
  deliverable: VisualThinkingGeneratedDeliverable,
  blockId: string,
  transform: SectionTransform,
): VisualThinkingGeneratedDeliverable {
  const target = deliverable.blocks.find((b) => b.id === blockId);
  if (!target) return deliverable;
  if (target.userEdited && transform === "regenerate") {
    // Preserve user-edited blocks by default
    return deliverable;
  }

  const nextBlocks = deliverable.blocks.map((b) => {
    if (b.id !== blockId) return b;
    if (b.userEdited && transform !== "simplify" && transform !== "deepen") {
      return b;
    }
    if (transform === "simplify") {
      const shortened =
        b.content.length > 120 ? b.content.slice(0, 117).trim() + "…" : b.content;
      return {
        ...b,
        content: shortened.replace(/\s+/g, " ").trim(),
        metadata: { ...b.metadata, simplified: true },
        // simplify of non-user text doesn't clear userEdited
      };
    }
    if (transform === "deepen") {
      if (b.type === "placeholder" || b.metadata.researchDependent) {
        return b; // never invent facts
      }
      return {
        ...b,
        content:
          b.content +
          (b.content.endsWith(".") ? " " : ". ") +
          "Add any local detail you already know — nothing external has been invented.",
        metadata: { ...b.metadata, deepened: true },
      };
    }
    // regenerate non-user block with same id
    if (b.type === "placeholder" || b.metadata.researchDependent) {
      return {
        ...b,
        content:
          "Still awaiting research — no current facts were fabricated.",
      };
    }
    return {
      ...b,
      content: b.content,
      metadata: { ...b.metadata, regenerated: true },
    };
  });

  return {
    ...deliverable,
    blocks: nextBlocks,
    updatedAt: nowIso(),
  };
}

export function simplifyDeliverable(
  deliverable: VisualThinkingGeneratedDeliverable,
): VisualThinkingGeneratedDeliverable {
  const keptTypes = new Set<VisualThinkingContentBlockType>([
    "heading",
    "numbered_step",
    "checklist_item",
    "summary",
    "key_point",
    "placeholder",
    "process_node",
    "question",
  ]);
  const blocks = deliverable.blocks
    .filter((b) => b.userEdited || keptTypes.has(b.type))
    .map((b, i) => {
      if (b.userEdited) return { ...b, order: i };
      const shortened =
        b.content.length > 120 ? `${b.content.slice(0, 117).trim()}…` : b.content;
      return {
        ...b,
        content: shortened.replace(/\s+/g, " ").trim(),
        order: i,
        metadata: { ...b.metadata, simplified: true },
      };
    });
  return {
    ...deliverable,
    detailLevel: "essentials",
    blocks,
    updatedAt: nowIso(),
  };
}

export function deepenDeliverable(
  deliverable: VisualThinkingGeneratedDeliverable,
): VisualThinkingGeneratedDeliverable {
  if (deliverable.blocks.some((b) => b.metadata.researchDependent)) {
    // Do not invent facts; only add structural review prompts
    const extra = block(
      "question",
      "What local detail do you already know that should be added here?",
      deliverable.blocks.length,
      { title: "Deepen with what you know" },
    );
    return {
      ...deliverable,
      detailLevel: "detailed",
      blocks: [...deliverable.blocks, extra],
      updatedAt: nowIso(),
    };
  }
  const tip = block(
    "tip",
    "Review each section and add an example from your own work.",
    deliverable.blocks.length,
    { title: "Add depth" },
  );
  const example = block(
    "example",
    "Example placeholder — fill with a real case you know.",
    deliverable.blocks.length + 1,
  );
  return {
    ...deliverable,
    detailLevel: "detailed",
    blocks: [...deliverable.blocks, tip, example],
    updatedAt: nowIso(),
  };
}

export function getPrimaryDeliverable(
  bundle: VisualThinkingGenerationBundle,
): VisualThinkingGeneratedDeliverable | null {
  return (
    bundle.deliverables.find((d) => d.id === bundle.run.primaryDeliverableId) ??
    null
  );
}

export function getSupportingDeliverables(
  bundle: VisualThinkingGenerationBundle,
): VisualThinkingGeneratedDeliverable[] {
  return bundle.deliverables.filter((d) => d.role === "supporting");
}

export function projectGenerationStatus(
  run: VisualThinkingGenerationRun,
): {
  headline: string;
  detail: string | null;
  showReview: boolean;
  researchBlocked: boolean;
} {
  return {
    headline: run.userFacingStatus,
    detail: run.researchBlockReason,
    showReview:
      run.status === "review_ready" ||
      run.status === "partial" ||
      run.status === "awaiting_user_input" ||
      run.status === "awaiting_research",
    researchBlocked: run.researchBlocked,
  };
}

// ─── Persistence (session) ──────────────────────────────────────────────────

export function saveGenerationBundle(bundle: VisualThinkingGenerationBundle): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(GENERATION_DRAFT_KEY, JSON.stringify(bundle));
  } catch {
    /* ignore */
  }
}

export function loadGenerationBundle(): VisualThinkingGenerationBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(GENERATION_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisualThinkingGenerationBundle;
  } catch {
    return null;
  }
}

export function clearGenerationBundle(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(GENERATION_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function replaceDeliverableInBundle(
  bundle: VisualThinkingGenerationBundle,
  deliverable: VisualThinkingGeneratedDeliverable,
): VisualThinkingGenerationBundle {
  return {
    ...bundle,
    deliverables: bundle.deliverables.map((d) =>
      d.id === deliverable.id ? deliverable : d,
    ),
    run: { ...bundle.run, updatedAt: nowIso() },
  };
}
