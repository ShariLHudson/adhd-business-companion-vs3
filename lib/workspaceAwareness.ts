// Workspace Awareness — what Shari can "see" beside chat and how she co-guides
// (one field at a time, energy-scoped, using the open panel — not generic advice).

import type { DayLevel } from "./companionStore";
import type { AppSection } from "./companionUi";
import type { WorkspaceOffer } from "./workspaceMode";
import { workspaceTitle } from "./workspaceMode";
import { resolveSopCoachTurn } from "./workspaceSopCoach";
import type { WorkspaceSession } from "./workspaceSop";
import { formatSopSessionForPrompt } from "./workspaceSop";
import {
  classifyWorkspaceIntent,
  classifyWorkspaceMessage,
  isFieldContentIntent,
  isHelpRequest,
  isProjectContent,
  type WorkspaceMessageClass,
} from "./workspaceIntent";
import {
  getEffectiveSuggestionCount,
  isSuggestionSelection,
  tryResolveSuggestionSelection,
} from "./workspaceSuggestion";
import { parseOptionSelection } from "./workspaceSop";
import {
  formatCollaborativeDocumentCoachHint,
  type DocumentPanelPhase,
} from "./collaborativeDocumentWorkflow";
import type { GoogleFileKind } from "./googleWorkspace";
import {
  formatCreationCoGuideHint,
  formatCreationContextForPrompt,
  isCreateWorkspaceChat,
  type CreationWorkspaceContext,
} from "./workspaceCreation";
import type { SavedArtifactRecord } from "./savedArtifact";
import {
  formatProjectGroundingForPrompt,
  groundedCoachReason,
  isProjectFieldVisible,
  PROJECT_GROUNDING_RULE,
} from "./projectGrounding";
import { projectCoachTrustHint } from "./projectCoachSession";
import {
  buildWorkspaceCoachAutoStart,
  workspaceCoachAutoStartHint,
  WORKSPACE_CONTEXT_RULE,
} from "./workspaceCoachAutoStart";

export type { WorkspaceMessageClass };
export { classifyWorkspaceMessage, isHelpRequest, isProjectContent };

/** Fields Shari can guide the user to (highlight/focus in the workspace). */
export type WorkspaceFieldId =
  | "project-title"
  | "project-goal"
  | "project-goals"
  | "project-tasks"
  | "project-next-action"
  | "project-horizon"
  | "project-status"
  | "workshop-audience"
  | "workshop-problem"
  | "workshop-sections"
  | "workshop-story"
  | "workshop-exercise"
  | "workshop-offer"
  | "create-topic"
  | "create-brief"
  | "create-audience"
  | "create-hook"
  | "create-main-point"
  | "create-cta";

export type WorkspacePanelDetail = {
  view?: string;
  stage?: string;
  selectedItemId?: string | null;
  selectedItemName?: string | null;
  selectedItemGoal?: string | null;
  selectedItemStatus?: string | null;
  selectedItemHorizon?: string | null;
  selectedItemColor?: string | null;
  /** True when project color swatch is shown on the list (visual mode on). */
  showProjectColor?: boolean;
  projectConversationCount?: number;
  projectFileCount?: number;
  projectTaskCount?: number;
  projectGoalCount?: number;
  /** Detail panel sections currently expanded (e.g. overview, tasks). */
  openDetailSections?: string[];
  nextAction?: string | null;
  draftPreview?: string | null;
};

export type WorkspaceContext = {
  section: AppSection;
  title: string;
} & WorkspacePanelDetail;

export type WorkspaceFieldGuide = {
  field: WorkspaceFieldId;
  label: string;
  reason: string;
};

const FOCUS_DIRECTIVE_RE = /^\[\[focus:([a-z0-9-]+)\]\]\s*/i;

const VALID_FOCUS_FIELDS = new Set<WorkspaceFieldId>([
  "project-title",
  "project-goal",
  "project-goals",
  "project-tasks",
  "project-next-action",
  "project-horizon",
  "project-status",
  "workshop-audience",
  "workshop-problem",
  "workshop-sections",
  "workshop-story",
  "workshop-exercise",
  "workshop-offer",
  "create-topic",
  "create-brief",
  "create-audience",
  "create-hook",
  "create-main-point",
  "create-cta",
]);

export function emptyWorkspaceDetail(): WorkspacePanelDetail {
  return {
    view: undefined,
    stage: undefined,
    selectedItemId: null,
    selectedItemName: null,
    selectedItemGoal: null,
    selectedItemStatus: null,
    selectedItemHorizon: null,
    nextAction: null,
    draftPreview: null,
  };
}

export function resolveWorkspaceEnergy(
  dayEnergy: DayLevel | null | undefined,
  userText: string,
  overwhelm?: DayLevel | null,
): DayLevel {
  const t = userText.toLowerCase();
  if (
    /\b(low energy|no energy|don'?t have (the )?energy|exhausted|drained|so tired|barely|can'?t do much|overwhelmed|don'?t have the bandwidth|can'?t think)\b/.test(
      t,
    )
  ) {
    return "low";
  }
  if (
    /\b(high energy|energized|ready to go|let'?s build|full steam|lots of energy)\b/.test(
      t,
    )
  ) {
    return "high";
  }
  if (overwhelm === "high" && (dayEnergy ?? "medium") !== "high") {
    return "low";
  }
  return dayEnergy ?? "medium";
}

function isWorkshopLike(ctx: WorkspaceContext, userText = ""): boolean {
  const blob =
    `${ctx.selectedItemName ?? ""} ${ctx.stage ?? ""} ${userText}`.toLowerCase();
  return /\b(workshop|webinar|course|masterclass|curriculum)\b/.test(blob);
}

function workshopScopeLines(energy: DayLevel): string[] {
  if (energy === "low") {
    return [
      "TODAY'S SCOPE (low energy — workshop/project): ONLY these two fields:",
      "  ✓ Project name (title)",
      "  ✓ Outcome (why it matters / one-sentence goal)",
      "Ignore audience, agenda, modules, marketing, and next steps until a later session.",
    ];
  }
  if (energy === "medium") {
    return [
      "TODAY'S SCOPE (medium energy — workshop/project):",
      "  ✓ Outcome (goal field)",
      "  ✓ Audience (capture in the goal field — who it's for)",
      "  ✓ Agenda sketch (one line in next-step field after the project exists)",
      "Do not expand into full curriculum or launch planning today.",
    ];
  }
  return [
    "TODAY'S SCOPE (high energy — workshop/project):",
    "  Build the whole workshop structure across name, outcome, and concrete next steps.",
    "  You may guide multiple fields in sequence — still ONE field per reply.",
  ];
}

function createScopeLines(energy: DayLevel): string[] {
  if (energy === "low") {
    return [
      "TODAY'S SCOPE (low energy — create): topic + brief only. Do not generate the full draft until they confirm.",
    ];
  }
  if (energy === "medium") {
    return [
      "TODAY'S SCOPE (medium energy — create): topic, brief, then one draft pass.",
    ];
  }
  return [
    "TODAY'S SCOPE (high energy — create): full draft, then one refinement pass.",
  ];
}

/** Which single field Shari should guide next, based on what's visible. */
export function suggestNextWorkspaceField(
  ctx: WorkspaceContext,
  userText = "",
): WorkspaceFieldGuide | null {
  if (ctx.section === "projects") {
    if (ctx.view === "list" || !ctx.view) {
      return {
        field: "project-title",
        label: "Project name",
        reason: "No project selected — start the create flow with a title.",
      };
    }
    if (ctx.view === "create") {
      const hasTitle = Boolean(ctx.selectedItemName?.trim());
      const onOutcome =
        ctx.stage?.includes("outcome") || ctx.stage?.includes("why");
      if (!hasTitle && !onOutcome) {
        return {
          field: "project-title",
          label: "Project name",
          reason: groundedCoachReason("name", ctx),
        };
      }
      if (onOutcome) {
        return {
          field: "project-goal",
          label: "Outcome",
          reason: groundedCoachReason("outcome", ctx),
        };
      }
      return {
        field: "project-title",
        label: "Project name",
        reason: groundedCoachReason("name", ctx),
      };
    }
    if (ctx.view === "detail") {
      if (
        isProjectFieldVisible("outcome", ctx) &&
        !ctx.selectedItemGoal?.trim()
      ) {
        return {
          field: "project-goal",
          label: "Outcome",
          reason: groundedCoachReason("outcome", ctx),
        };
      }
      if (
        (ctx.projectTaskCount ?? 0) === 0 &&
        ctx.selectedItemGoal?.trim()
      ) {
        return {
          field: "project-next-action",
          label: "First task or next step",
          reason:
            "Outcome is set — help them name the first task or small next move.",
        };
      }
      if (isProjectFieldVisible("nextStep", ctx)) {
        return {
          field: "project-next-action",
          label: "Next step",
          reason: groundedCoachReason("nextStep", ctx),
        };
      }
      return null;
    }
  }

  if (ctx.section === "content-generator") {
    if (!ctx.selectedItemName?.trim()) {
      return {
        field: "create-topic",
        label: "Topic",
        reason: "No topic visible yet.",
      };
    }
    if (!ctx.draftPreview?.trim()) {
      return {
        field: "create-brief",
        label: "Brief",
        reason: "Topic set — clarify brief before generating.",
      };
    }
  }

  return null;
}

export function formatWorkspaceCoGuideHint(
  ctx: WorkspaceContext,
  energy: DayLevel,
  userText = "",
): string {
  const next = suggestNextWorkspaceField(ctx, userText);
  const lines = [
    "WORKSPACE CO-GUIDE MODE (ACTIVE — panel is open beside chat):",
    WORKSPACE_CONTEXT_RULE,
    "You are co-working IN the visible workspace, not giving generic advice.",
    "- Reference what they can SEE (project name, stage, fields on screen).",
    "- Move ONE field per reply. Prefix with [[focus:field-id]] when pointing to a field.",
    "- NO app navigation instructions. NO multi-step plans outside the panel.",
    "- If nothing exists yet, guide creation NOW in the open panel (title first).",
    "- Stop when today's energy scope is complete — celebrate, don't add more.",
  ];

  if (/\bwalk me through\b/i.test(userText)) {
    lines.push(
      "USER ASKED FOR STEP-BY-STEP: ask ONE question only. Do NOT list topic, audience, outcome, sections, stories, exercise, and next action in one reply.",
    );
  }

  if (ctx.section === "projects" && isWorkshopLike(ctx, userText)) {
    lines.push(...workshopScopeLines(energy));
  } else if (ctx.section === "projects") {
    lines.push(PROJECT_GROUNDING_RULE);
    lines.push(projectCoachTrustHint(ctx));
    if (energy === "low") {
      lines.push(
        "TODAY'S SCOPE (low energy — project): name + outcome only. Ignore next steps and extras.",
      );
    } else if (energy === "medium") {
      lines.push(
        "TODAY'S SCOPE (medium energy — project): name, outcome, then one next step.",
      );
    } else {
      lines.push(
        "TODAY'S SCOPE (high energy — project): build out name, outcome, and next steps in sequence.",
      );
    }
  } else if (ctx.section === "content-generator") {
    lines.push(...createScopeLines(energy));
  }

  lines.push(workspaceCoachAutoStartHint(ctx));

  if (next) {
    lines.push(
      `NEXT FIELD TO GUIDE: ${next.label} → use [[focus:${next.field}]]`,
      `Why: ${next.reason}`,
    );
  }

  return lines.join("\n");
}

/** Strip optional [[focus:field-id]] prefix from model output before display. */
export function extractFocusDirective(assistantText: string): {
  field: WorkspaceFieldId | null;
  content: string;
} {
  const m = assistantText.match(FOCUS_DIRECTIVE_RE);
  if (!m?.[1]) return { field: null, content: assistantText };
  const id = m[1] as WorkspaceFieldId;
  const field = VALID_FOCUS_FIELDS.has(id) ? id : null;
  return {
    field,
    content: assistantText.replace(FOCUS_DIRECTIVE_RE, "").trimStart(),
  };
}

export function formatWorkspaceContextForPrompt(
  ctx: WorkspaceContext | null,
): string | undefined {
  if (!ctx?.section) return undefined;

  const lines = [
    "CURRENT WORKSPACE (visible beside chat — the user can see this):",
    `- Surface: ${ctx.title}`,
  ];

  if (ctx.view) lines.push(`- View: ${ctx.view}`);
  if (ctx.stage) lines.push(`- Stage: ${ctx.stage}`);
  if (ctx.section === "projects") {
    lines.push(formatProjectGroundingForPrompt(ctx));
    if (ctx.projectTaskCount != null) {
      lines.push(`- Tasks on this project: ${ctx.projectTaskCount}`);
    }
    if (ctx.openDetailSections?.length) {
      lines.push(`- Open sections on screen: ${ctx.openDetailSections.join(", ")}`);
    }
  } else {
    if (ctx.selectedItemName) lines.push(`- Selected: ${ctx.selectedItemName}`);
    if (ctx.selectedItemGoal?.trim()) {
      lines.push(`- Outcome / goal on screen: ${ctx.selectedItemGoal.trim()}`);
    }
    if (ctx.selectedItemStatus) lines.push(`- Status: ${ctx.selectedItemStatus}`);
    if (ctx.selectedItemHorizon) lines.push(`- Horizon: ${ctx.selectedItemHorizon}`);
    if (ctx.nextAction?.trim()) {
      lines.push(`- Next step on screen: ${ctx.nextAction.trim()}`);
    }
  }
  if (ctx.draftPreview?.trim()) {
    lines.push(`- Draft in progress: ${ctx.draftPreview.trim().slice(0, 120)}…`);
  }

  return lines.join("\n");
}

/** Full workspace block for chat API when co-guide is active. */
export function buildWorkspaceChatHints(
  ctx: WorkspaceContext | null,
  opts: {
    coGuideActive: boolean;
    energy: DayLevel;
    userText?: string;
    sopSession?: WorkspaceSession | null;
    creationContext?: CreationWorkspaceContext | null;
    savedArtifact?: SavedArtifactRecord | null;
    /** When false, model must not claim the draft is on screen. */
    createDraftVisible?: boolean;
    collaborativePhase?: DocumentPanelPhase;
    preferredGoogleExport?: GoogleFileKind | null;
  },
): string | undefined {
  if (!ctx?.section) return undefined;
  if (!opts.coGuideActive) {
    return (
      "WORKSPACE NOT VISIBLE: Do NOT say any workspace is open beside chat. " +
      "If the user asks to work in Create or Projects, say you are opening it — do not claim it is already on screen."
    );
  }
  const parts = [formatWorkspaceContextForPrompt(ctx)];
  if (opts.creationContext) {
    parts.push(
      formatCreationContextForPrompt(
        opts.creationContext,
        opts.savedArtifact,
      ),
    );
  }
  const createChat = isCreateWorkspaceChat(ctx);
  if (opts.sopSession && !createChat) {
    parts.push(formatSopSessionForPrompt(opts.sopSession));
  }
  if (opts.coGuideActive) {
    if (createChat) {
      parts.push(
        formatCreationCoGuideHint(ctx, opts.creationContext ?? null, {
          draftVisible: opts.createDraftVisible !== false,
        }),
      );
      if (opts.collaborativePhase) {
        parts.push(
          formatCollaborativeDocumentCoachHint({
            phase: opts.collaborativePhase,
            artifactType: opts.creationContext?.itemType,
            title: opts.creationContext?.title,
            preferredExport: opts.preferredGoogleExport ?? undefined,
            draftVisible: opts.createDraftVisible !== false,
          }),
        );
      }
    } else if (opts.collaborativePhase === "google") {
      parts.push(
        formatCollaborativeDocumentCoachHint({
          phase: "google",
          artifactType: opts.creationContext?.itemType,
          title: opts.creationContext?.title,
        }),
      );
    } else {
      parts.push(formatWorkspaceCoGuideHint(ctx, opts.energy, opts.userText ?? ""));
    }
  } else {
    parts.push(
      "RULE: Do not offer to open a workspace that is already visible beside chat.",
    );
  }
  return parts.filter(Boolean).join("\n\n");
}

/** Immediate companion line when user accepts a workspace offer — no generic advice. */
export function buildWorkspaceAcceptMessage(
  section: AppSection,
  energy: DayLevel,
  userText = "",
  ctx?: WorkspaceContext | null,
  extras?: import("./workspaceCoachAutoStart").WorkspaceCoachExtras,
): { content: string; focusField: WorkspaceFieldId | null } {
  const fullCtx = ctx ?? buildWorkspaceContext(section, null);
  if (fullCtx) {
    const auto = buildWorkspaceCoachAutoStart(fullCtx, extras);
    if (auto) {
      const { field: focusField, content: stripped } = extractFocusDirective(
        auto.content,
      );
      return {
        content: stripped,
        focusField: focusField ?? auto.focusField,
      };
    }
  }

  const workshop = /\b(workshop|webinar|course|masterclass)\b/i.test(userText);

  if (section === "projects") {
    if (energy === "low" && workshop) {
      return {
        content:
          "[[focus:project-title]]Good — Projects is open right beside us. With low energy, we only need two things today: a name and an outcome. Let's start with the title — what are you calling this workshop?",
        focusField: "project-title",
      };
    }
    return {
      content:
        "[[focus:project-title]]I can see Projects beside us. Let's build this together, one field at a time. First — what are you calling this project?",
      focusField: "project-title",
    };
  }

  if (section === "content-generator") {
    return {
      content:
        "[[focus:create-topic]]Create is open beside us. What is this piece about — one line in the topic field?",
      focusField: "create-topic",
    };
  }

  return {
    content: `I'm here beside your ${workspaceTitle(section)} workspace. Tell me what you see, and we'll take the next small step together.`,
    focusField: null,
  };
}

/** Don't re-offer opening a workspace that's already beside chat. */
export function shouldSuppressWorkspaceOffer(
  ctx: WorkspaceContext | null,
  offer: WorkspaceOffer | null,
): boolean {
  if (!offer || !ctx?.section) return false;
  return ctx.section === offer.section;
}

export function buildWorkspaceContext(
  section: AppSection | null,
  detail: WorkspacePanelDetail | null,
): WorkspaceContext | null {
  if (!section) return null;
  return {
    section,
    title: workspaceTitle(section),
    ...emptyWorkspaceDetail(),
    ...detail,
  };
}

/** @deprecated Use WorkspaceMessageClass */
export type WorkspaceMessageKind = WorkspaceMessageClass;

export type WorkspaceWorkflowAction = {
  type: "advance" | "confirm" | "skip";
};

export type WorkspaceCoachTurn = {
  reply: string;
  focusField?: WorkspaceFieldId | null;
  fill?: { field: WorkspaceFieldId; value: string; stepId?: string };
  workflow?: WorkspaceWorkflowAction;
  sessionPatch?: import("./workspaceSop").WorkspaceSession;
};

const CONTINUATION_RE =
  /^(?:now what|what now|what next|what do i do|what should i do next)\??$/i;

const CREATE_PROJECT_HOW_RE =
  /\bhow (?:do i|can i|to) (?:create|start|make|add) (?:a )?project\b/i;

const LOW_ENERGY_RE =
  /\b(?:still\s+)?(?:don'?t|do not) have (?:much )?energy|(?:still\s+)?low energy|no energy|not much energy\b/i;

function isCreateTitleStage(ctx: WorkspaceContext): boolean {
  return (
    ctx.view === "create" &&
    Boolean(ctx.stage?.includes("title") && !ctx.stage?.includes("outcome"))
  );
}

function isCreateOutcomeStage(ctx: WorkspaceContext): boolean {
  return ctx.view === "create" && Boolean(ctx.stage?.includes("outcome"));
}

function isWorkspaceCoachPhrase(text: string): boolean {
  const t = text.trim();
  return (
    CONTINUATION_RE.test(t) ||
    CREATE_PROJECT_HOW_RE.test(t) ||
    LOW_ENERGY_RE.test(t) ||
    /^can you help me with this project\??$/i.test(t) ||
    /\bwalk me through\b/i.test(t)
  );
}

function continuationReply(
  ctx: WorkspaceContext,
  energy: DayLevel,
): string {
  if (ctx.section === "projects") {
    if (ctx.view === "list") {
      return "[[focus:project-title]]I can see Projects is open. I don't see a workshop project yet — let's create one. What would you like to call it?";
    }
    if (ctx.view === "create") {
      const hasTitle = Boolean(ctx.selectedItemName?.trim());
      if (!hasTitle) {
        return "[[focus:project-title]]I can see Projects is open. Let's create or choose the workshop project first — I don't see a title yet. What would you like to call it?";
      }
      if (energy === "low") {
        return "[[focus:project-goal]]Good — title's there. With low energy, let's only complete one more field today: the outcome. In one sentence, what should attendees walk away able to do?";
      }
      return "[[focus:project-goal]]Title's started. Next field: outcome — why does this workshop matter right now?";
    }
    if (ctx.view === "detail") {
      const next = suggestNextWorkspaceField(ctx, "");
      if (next) {
        return `[[focus:${next.field}]]I can see Projects is open on "${ctx.selectedItemName}". Next up: **${next.label}**. ${next.reason}`;
      }
    }
  }
  return `[[focus:project-title]]I can see ${ctx.title} beside us. Tell me what you see on screen, and we'll take the next small step together.`;
}

/** Deterministic co-guide replies — avoids generic coaching when workspace is open. */
export function tryWorkspaceLocalReply(
  ctx: WorkspaceContext,
  userText: string,
  energy: DayLevel,
): string | null {
  const t = userText.trim();
  if (!t) return null;

  if (CREATE_PROJECT_HOW_RE.test(t) && ctx.section === "projects") {
    if (ctx.view === "create") {
      return "[[focus:project-title]]I can see Projects is already open beside us. You're in the new project flow — type the workshop name in the title field, and I'll help with the next bit.";
    }
    return "[[focus:project-title]]Projects is already open. Use the **New project** button, then enter the title — I'll walk you through one field at a time.";
  }

  if (CONTINUATION_RE.test(t) || /^help(?: me)?\??$/i.test(t)) {
    return continuationReply(ctx, energy);
  }

  if (LOW_ENERGY_RE.test(t) && ctx.section === "projects") {
    const next = suggestNextWorkspaceField(ctx, t);
    const label = next?.label ?? "outcome";
    const field = next?.field ?? "project-goal";
    return `[[focus:${field}]]That's okay. We're not building the whole workshop today. Let's only complete one field: **${label.toLowerCase()}**. ${next?.reason ?? "One sentence is enough."}`;
  }

  if (/^can you help me with this project\??$/i.test(t)) {
    const next = suggestNextWorkspaceField(ctx, t);
    if (next) {
      return `[[focus:${next.field}]]I'm right here with you in Projects. Let's focus on **${next.label}** — ${next.reason}`;
    }
  }

  if (/\bwalk me through\b/i.test(t)) {
    const next = suggestNextWorkspaceField(ctx, t);
    if (next) {
      const scope =
        energy === "low"
          ? "With low energy we won't build the whole workshop today — just one field at a time."
          : "We'll go one field at a time — I won't dump the whole plan.";
      return `[[focus:${next.field}]]${scope} First up: **${next.label}**. ${next.reason}`;
    }
  }

  return null;
}

function buildWorkspaceAdvanceReply(
  ctx: WorkspaceContext,
  energy: DayLevel,
  isSkip: boolean,
): WorkspaceCoachTurn {
  if (ctx.section === "projects" && isCreateTitleStage(ctx)) {
    const title = ctx.selectedItemName?.trim();
    if (!title && !isSkip) {
      return {
        reply:
          "[[focus:project-title]]Let's name it first — what are you calling this workshop?",
        focusField: "project-title",
      };
    }
    return {
      reply:
        energy === "low"
          ? "[[focus:project-goal]]Good. One more field for today: outcome — in one sentence, what should someone walk away able to do?"
          : "[[focus:project-goal]]Good — moving on. Next field: outcome. In one sentence, why does this workshop matter right now?",
      focusField: "project-goal",
      workflow: { type: isSkip ? "skip" : "advance" },
    };
  }

  if (ctx.section === "projects" && isCreateOutcomeStage(ctx)) {
    const outcome = ctx.selectedItemGoal?.trim();
    if (!outcome && !isSkip) {
      return {
        reply:
          "[[focus:project-goal]]Let's capture the outcome first — one sentence on what attendees will be able to do.",
        focusField: "project-goal",
      };
    }
    const label = ctx.selectedItemName?.trim() || "your project";
    return {
      reply: `[[focus:project-next-action]]Nice — "${label}" has a title and outcome. Tap **Create project** in the panel, or tell me when you're ready for a next step.`,
      focusField: "project-next-action",
      workflow: { type: isSkip ? "skip" : "advance" },
    };
  }

  if (ctx.section === "projects" && ctx.view === "detail") {
    const next = suggestNextWorkspaceField(ctx, "");
    if (next) {
      return {
        reply: `[[focus:${next.field}]]Moving on. Next up: **${next.label}**. ${next.reason}`,
        focusField: next.field,
        workflow: { type: "advance" },
      };
    }
  }

  return {
    reply: continuationReply(ctx, energy),
    workflow: { type: "advance" },
  };
}

function buildWorkspaceConfirmReply(
  ctx: WorkspaceContext,
  energy: DayLevel,
): WorkspaceCoachTurn {
  if (ctx.section === "projects" && isCreateTitleStage(ctx)) {
    const title = ctx.selectedItemName?.trim();
    if (!title) {
      return {
        reply:
          "[[focus:project-title]]Sounds good — what should we call it? Type the title in the field beside you.",
        focusField: "project-title",
      };
    }
    return {
      reply: `[[focus:project-goal]]Perfect — we'll keep **${title}** as the title. Next: outcome. In one sentence, what should someone walk away able to do?`,
      focusField: "project-goal",
      workflow: { type: "confirm" },
    };
  }

  if (ctx.section === "projects" && isCreateOutcomeStage(ctx)) {
    const outcome = ctx.selectedItemGoal?.trim();
    if (!outcome) {
      return {
        reply:
          "[[focus:project-goal]]Great — add the outcome in the field beside you, or tell me in one sentence.",
        focusField: "project-goal",
      };
    }
    const short =
      outcome.length > 100 ? `${outcome.slice(0, 97)}…` : outcome;
    if (energy === "low") {
      return {
        reply: `[[focus:project-goal]]Perfect — we'll keep that outcome: ${short}. That's plenty for today.`,
        focusField: "project-goal",
      };
    }
    return {
      reply: `[[focus:project-goal]]Perfect — outcome stays as: ${short}. Tap **Create project** when you're ready, or say next for a next step.`,
      focusField: "project-goal",
      workflow: { type: "confirm" },
    };
  }

  const next = suggestNextWorkspaceField(ctx, "");
  if (next) {
    return {
      reply: `[[focus:${next.field}]]Got it. Let's keep going with **${next.label}**. ${next.reason}`,
      focusField: next.field,
      workflow: { type: "confirm" },
    };
  }

  return {
    reply:
      "Got it. Tell me what you see in the workspace, and we'll take the next small step.",
  };
}

/** Single entry: classify message, then coach / advance / fill — never sync commands to fields. */
export function resolveWorkspaceCoachTurn(
  ctx: WorkspaceContext,
  userText: string,
  energy: DayLevel,
  lastAssistantText = "",
  sopSession?: WorkspaceSession | null,
): WorkspaceCoachTurn | null {
  // Create workspace = conversational chat + draft canvas. No SOP / field wizard.
  if (isCreateWorkspaceChat(ctx)) {
    return null;
  }

  const coachPhrase = tryWorkspaceLocalReply(ctx, userText, energy);
  if (coachPhrase) {
    return { reply: coachPhrase };
  }

  // Pending suggestion selection — never legacy field fill
  if (
    tryResolveSuggestionSelection(userText, sopSession ?? null, lastAssistantText)
  ) {
    if (sopSession) {
      const sopTurn = resolveSopCoachTurn(
        sopSession,
        ctx,
        userText,
        energy,
        lastAssistantText,
      );
      if (sopTurn) return sopTurn;
    }
    return null;
  }

  if (sopSession) {
    const sopTurn = resolveSopCoachTurn(
      sopSession,
      ctx,
      userText,
      energy,
      lastAssistantText,
    );
    if (sopTurn) return sopTurn;
  }

  const { intent } = classifyWorkspaceIntent(userText, lastAssistantText, {
    session: sopSession ?? null,
  });

  if (intent === "navigation") {
    const isSkip = /^skip\.?$/i.test(userText.trim());
    return buildWorkspaceAdvanceReply(ctx, energy, isSkip);
  }

  if (intent === "confirmation") {
    const count = getEffectiveSuggestionCount(sopSession ?? null, lastAssistantText);
    if (
      count >= 1 &&
      parseOptionSelection(userText.trim(), count) !== null &&
      sopSession
    ) {
      return resolveSopCoachTurn(
        sopSession,
        ctx,
        userText,
        energy,
        lastAssistantText,
      );
    }
    return buildWorkspaceConfirmReply(ctx, energy);
  }

  if (
    intent === "conversation" ||
    intent === "feedback" ||
    intent === "clarification" ||
    intent === "helpRequest" ||
    intent === "projectLookup" ||
    intent === "resumeRequest" ||
    intent === "reviewRequest"
  ) {
    return null;
  }

  const fill = inferWorkspaceChatFill(ctx, userText, lastAssistantText);
  if (fill) {
    return {
      reply: buildWorkspaceFillAck(fill, ctx, energy),
      fill,
      focusField: fill.field,
    };
  }

  return null;
}

function normalizeGoalText(text: string): string {
  return text
    .replace(/^(?:the goal is|outcome:|my outcome is)\s*/i, "")
    .trim();
}

const NON_CONTENT_SHORT_RE =
  /^(?:next|yes|yep|yeah|yup|ok|okay|sure|skip|done|finished|continue|move on|perfect|good|right|correct)$/i;

function looksLikeProjectTitle(text: string): boolean {
  const t = text.trim();
  if (t.length < 3 || t.length > 80) return false;
  if (/\?/.test(t)) return false;
  if (NON_CONTENT_SHORT_RE.test(t)) return false;
  if (!isProjectContent(t)) return false;
  if (
    /^(?:now what|walk me|i still|what should|how do|can you|help me|don't|still)\b/i.test(
      t,
    )
  ) {
    return false;
  }
  return true;
}

function looksLikeOutcome(text: string): boolean {
  const t = text.trim();
  if (t.length < 15) return false;
  if (CONTINUATION_RE.test(t) || LOW_ENERGY_RE.test(t)) return false;
  if (
    /^(?:the goal is|outcome:|my outcome is|they should|attendees will)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  return (
    t.length >= 40 &&
    /\b(?:help|learn|entrepreneur|workshop|attendees|outcome|action|spinning)\b/i.test(
      t,
    )
  );
}

/** Map a chat line to a workspace field when co-guide is active. */
export function inferWorkspaceChatFill(
  ctx: WorkspaceContext,
  userText: string,
  lastAssistantText = "",
): { field: WorkspaceFieldId; value: string } | null {
  const t = userText.trim();
  if (!t || isWorkspaceCoachPhrase(t)) return null;
  if (isSuggestionSelection(t, null, lastAssistantText)) return null;
  if (!isFieldContentIntent(t, lastAssistantText)) return null;

  if (ctx.section === "projects") {
    if (looksLikeOutcome(t)) {
      const value = normalizeGoalText(t);
      if (ctx.view === "create" && ctx.selectedItemName?.trim()) {
        return { field: "project-goal", value };
      }
      if (ctx.view === "detail") {
        return { field: "project-goal", value };
      }
      if (ctx.view === "create") {
        return null;
      }
    }
    if (
      (ctx.view === "create" || ctx.view === "list") &&
      looksLikeProjectTitle(t)
    ) {
      return { field: "project-title", value: t };
    }
  }

  return null;
}

export function buildWorkspaceFillAck(
  fill: { field: WorkspaceFieldId; value: string },
  ctx: WorkspaceContext,
  energy: DayLevel,
): string {
  if (fill.field === "project-title") {
    return `[[focus:project-title]]Got it — **${fill.value}** is in the title field beside you. When that looks right, tap Next — or tell me and we'll do the outcome next.`;
  }
  if (fill.field === "project-goal") {
    const short =
      fill.value.length > 100 ? `${fill.value.slice(0, 97)}…` : fill.value;
    if (energy === "low") {
      return `[[focus:project-goal]]Great — that sounds like your outcome: ${short}. That's enough for today if your energy is low.`;
    }
    return `[[focus:project-goal]]Great — that sounds like your outcome: ${short}. Next we can shape one clear next step when you're ready.`;
  }
  return `[[focus:${fill.field}]]I've added that to the ${fill.field.replace(/-/g, " ")} field beside you.`;
}
