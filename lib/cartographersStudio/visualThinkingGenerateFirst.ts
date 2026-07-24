/**
 * Visual Thinking Studio — Generate-First Knowledge Completion (Corrective Build 6.6).
 * GENERATE FIRST. ASK ONLY WHEN PROGRESS CANNOT CONTINUE SAFELY.
 * Does not invent current product UI facts; does not restart Understanding/Experience.
 */

import type { VisualThinkingHelpDepth } from "@/lib/cartographersStudio/visualThinkingRequest";
import type { VisualThinkingCreationMode } from "@/lib/cartographersStudio/visualThinkingUnderstanding";
import type {
  VisualThinkingKnowledgeGap,
  VisualThinkingKnowledgeItem,
  VisualThinkingKnowledgePackage,
  VisualThinkingGenerationHandoff,
} from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";
import type {
  VisualThinkingContentBlock,
  VisualThinkingGeneratedDeliverable,
} from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
import { resolveAdaptivePresentation } from "@/lib/adaptiveCompanionIntelligence";

// ─── Contracts ──────────────────────────────────────────────────────────────

export type VisualThinkingRequestAuthorization = {
  authorized: boolean;
  reason: string;
  /** Aligns with Understanding creationMode (`build_myself` = user-led). */
  creationMode: VisualThinkingCreationMode;
  inferredDetail: Exclude<VisualThinkingHelpDepth, "unspecified" | "help_choose">;
  skipDetailScreen: boolean;
  skipRecommendationConfirm: boolean;
  skipSafeOutlineGate: boolean;
  acknowledgement: string;
};

export type VisualThinkingClarificationAssessment = {
  required: boolean;
  reason: string | null;
  question: string | null;
  blocksAllGeneration: boolean;
  blocksAreas: string[];
  resolvableByInference: boolean;
  resolvableByResearch: boolean;
  resolvableByExistingKnowledge: boolean;
  canUsePlaceholder: boolean;
};

export type VisualThinkingGapResolutionDecision = {
  gapId: string;
  resolutionType:
    | "existing_source"
    | "user_input"
    | "inference"
    | "external_research"
    | "clarification"
    | "optional_omission"
    | "unresolved";
  automatic: boolean;
  requiresUser: boolean;
  researchQuery: string | null;
  approvedSourceKinds: string[];
  safeInterimContent: string | null;
  placeholderAllowed: boolean;
  blockedAreas: string[];
  rationale: string;
};

export type VisualThinkingScopedReadiness = {
  safeGenerationScope: "structure_only" | "partial" | "full" | "none";
  blockedGenerationScope: string[];
  researchPendingScope: string[];
  userInputPendingScope: string[];
  mayProceedToGeneration: boolean;
  blocksAllGeneration: boolean;
};

export type VisualThinkingAutomaticContinuationPlan = {
  continueAutomatically: boolean;
  stages: Array<
    | "understand"
    | "experience"
    | "knowledge"
    | "research_route"
    | "generate"
    | "present"
  >;
  acknowledgement: string;
  progressLabels: string[];
};

export type VisualThinkingResultSubstanceAssessment = {
  substantive: boolean;
  completeness: "empty" | "echo" | "thin" | "partial" | "substantive";
  userRequestEchoRatio: number;
  meaningfulBlockCount: number;
  instructionalStepCount: number;
  knowledgeItemCoverage: number;
  unresolvedRequiredAreas: string[];
  placeholderOnlySections: number;
  failureReasons: string[];
};

export type InstructionalGenerationMaterial = {
  title: string;
  overview: string;
  steps: Array<{ title: string; content: string; freshnessSensitive?: boolean }>;
  troubleshooting: string[];
  checklist: string[];
  freshnessNotice: string | null;
  domain: "screen_recording_publish" | "generic_how_to" | "comparison_seed" | "none";
};

// ─── Request authorization ──────────────────────────────────────────────────

const AUTHORIZING =
  /\b(teach me|show me how|walk me through|help me understand|help me learn|i need to learn|learn how|explain|create a guide|create an?|build (this|me|a|an)|research|compare|make (this|me|a)|give me|how do i|how to)\b/i;

const USER_LED =
  /\b(my own map|blank visual|let me (make|build|organize)|i want to make my own|create my own visual)\b/i;

const COLLAB =
  /\b(walk through it with me|ask me questions|help me work (it|this) out|guide me through)\b/i;

export function inferCreationModeFromRequest(
  raw: string,
): VisualThinkingCreationMode {
  const text = raw.trim();
  if (!text) return "unspecified";
  if (USER_LED.test(text)) return "build_myself";
  if (COLLAB.test(text) && !/\b(just|simply) (give|show|create)\b/i.test(text)) {
    return "guide_me";
  }
  if (
    AUTHORIZING.test(text) ||
    /\b(for me|build it|research and)\b/i.test(text)
  ) {
    return "build_for_me";
  }
  return "unspecified";
}

export function inferDetailLevelFromRequest(
  raw: string,
): Exclude<VisualThinkingHelpDepth, "unspecified" | "help_choose"> {
  const t = raw.toLowerCase();
  if (
    /\b(every step|complete|thorough|training|walk me through every|detailed)\b/.test(
      t,
    )
  ) {
    return "detailed";
  }
  if (/\b(basic|quick|essentials|just the steps|simple)\b/.test(t)) {
    return "essentials";
  }
  if (/\b(guided|help me learn|show me how|teach me|learn how)\b/.test(t)) {
    return "guided";
  }
  const adaptive = resolveAdaptivePresentation({
    destinationHint: "visual_thinking_studio",
  });
  if (adaptive.summaryFirst) return "essentials";
  return "guided";
}

export function assessRequestAuthorization(
  raw: string,
): VisualThinkingRequestAuthorization {
  const creationMode = inferCreationModeFromRequest(raw);
  const inferredDetail = inferDetailLevelFromRequest(raw);
  const authorized =
    creationMode === "build_for_me" ||
    creationMode === "guide_me" ||
    (creationMode === "build_myself" && USER_LED.test(raw));

  let acknowledgement = "I'll get started with what you've shared.";
  if (creationMode === "build_for_me") {
    if (/loom|youtube|video/i.test(raw)) {
      acknowledgement =
        "Absolutely. I'll create a clear step-by-step guide and verify current product details as I go.";
    } else if (/compare/i.test(raw)) {
      acknowledgement =
        "I'll build a practical comparison you can adjust as we go.";
    } else if (/research|medicare|explain/i.test(raw)) {
      acknowledgement =
        "I'll put together a clear explanation and check current details where they matter.";
    } else {
      acknowledgement =
        "I'm building that for you now — you can simplify or add detail anytime.";
    }
  } else if (creationMode === "build_myself") {
    acknowledgement = "I'll open a space you can organize yourself.";
  } else if (creationMode === "guide_me") {
    acknowledgement = "We'll work through this together, one clear step at a time.";
  }

  return {
    authorized,
    reason: authorized
      ? "Clear outcome request authorizes creation."
      : "Request does not clearly authorize automatic creation.",
    creationMode,
    inferredDetail,
    skipDetailScreen: authorized && creationMode !== "build_myself",
    skipRecommendationConfirm: authorized && creationMode === "build_for_me",
    skipSafeOutlineGate: authorized && creationMode === "build_for_me",
    acknowledgement,
  };
}

// ─── Clarification ──────────────────────────────────────────────────────────

export function assessClarificationNecessity(input: {
  rawRequest: string;
  gaps: VisualThinkingKnowledgeGap[];
  creationMode: VisualThinkingCreationMode;
}): VisualThinkingClarificationAssessment {
  const { rawRequest, gaps, creationMode } = input;
  if (creationMode === "build_myself") {
    return {
      required: false,
      reason: null,
      question: null,
      blocksAllGeneration: false,
      blocksAreas: [],
      resolvableByInference: true,
      resolvableByResearch: false,
      resolvableByExistingKnowledge: true,
      canUsePlaceholder: true,
    };
  }

  const userOwned = gaps.find(
    (g) =>
      g.status === "open" &&
      g.priority === "required" &&
      (g.userInputNeeded ||
        g.resolutionType === "user_input" ||
        g.resolutionType === "clarification") &&
      !g.researchNeeded,
  );

  const legal = /\b(legal|termination|compliance|jurisdiction|policy for my)\b/i.test(
    rawRequest,
  );
  if (legal && userOwned) {
    return {
      required: true,
      reason: "consequential_jurisdiction",
      question: userOwned.focusedQuestion,
      blocksAllGeneration: false,
      blocksAreas: [userOwned.area],
      resolvableByInference: false,
      resolvableByResearch: false,
      resolvableByExistingKnowledge: false,
      canUsePlaceholder: true,
    };
  }

  if (
    /onboarding|sop|\bva\b|my (team|process|workflow)|our employee|my weekly/i.test(
      rawRequest,
    ) &&
    !/\b(loom|youtube|medicare|crm)\b/i.test(rawRequest)
  ) {
    return {
      required: true,
      reason: "organization_specific_process",
      question:
        userOwned?.focusedQuestion ||
        "What steps does your process follow today?",
      blocksAllGeneration: false,
      blocksAreas: userOwned ? [userOwned.area] : ["organization_process"],
      resolvableByInference: false,
      resolvableByResearch: false,
      resolvableByExistingKnowledge: false,
      canUsePlaceholder: true,
    };
  }

  // Public / researchable gaps never require user clarification.
  return {
    required: false,
    reason: null,
    question: null,
    blocksAllGeneration: false,
    blocksAreas: [],
    resolvableByInference: true,
    resolvableByResearch: gaps.some((g) => g.researchNeeded && g.status === "open"),
    resolvableByExistingKnowledge: true,
    canUsePlaceholder: true,
  };
}

// ─── Gap resolution ─────────────────────────────────────────────────────────

export function resolveKnowledgeGap(
  gap: VisualThinkingKnowledgeGap,
  context: { rawRequest: string; hasUserAnswer?: boolean },
): VisualThinkingGapResolutionDecision {
  if (gap.status === "resolved") {
    return {
      gapId: gap.id,
      resolutionType: "existing_source",
      automatic: true,
      requiresUser: false,
      researchQuery: null,
      approvedSourceKinds: [],
      safeInterimContent: null,
      placeholderAllowed: true,
      blockedAreas: [],
      rationale: "Gap already resolved.",
    };
  }

  if (gap.researchNeeded || gap.resolutionType === "external_research") {
    return {
      gapId: gap.id,
      resolutionType: "external_research",
      automatic: true,
      requiresUser: false,
      researchQuery: gap.description || gap.area,
      approvedSourceKinds: [
        "official_documentation",
        "trusted_reference",
        "verified_company_information",
      ],
      safeInterimContent:
        "Stable process steps can proceed; exact control labels may need verification.",
      placeholderAllowed: true,
      blockedAreas: [gap.area],
      rationale:
        "Public or product details should be researched automatically — do not ask the member.",
    };
  }

  if (
    gap.userInputNeeded ||
    gap.resolutionType === "user_input" ||
    gap.resolutionType === "clarification"
  ) {
    if (context.hasUserAnswer) {
      return {
        gapId: gap.id,
        resolutionType: "user_input",
        automatic: false,
        requiresUser: false,
        researchQuery: null,
        approvedSourceKinds: [],
        safeInterimContent: null,
        placeholderAllowed: true,
        blockedAreas: [],
        rationale: "User answer available.",
      };
    }
    return {
      gapId: gap.id,
      resolutionType: "clarification",
      automatic: false,
      requiresUser: true,
      researchQuery: null,
      approvedSourceKinds: [],
      safeInterimContent: "Structure continues while this detail is gathered.",
      placeholderAllowed: true,
      blockedAreas: gap.priority === "required" ? [gap.area] : [],
      rationale: "Only the member can provide this organization-specific detail.",
    };
  }

  if (gap.priority === "optional") {
    return {
      gapId: gap.id,
      resolutionType: "optional_omission",
      automatic: true,
      requiresUser: false,
      researchQuery: null,
      approvedSourceKinds: [],
      safeInterimContent: null,
      placeholderAllowed: true,
      blockedAreas: [],
      rationale: "Optional gap — omit without blocking.",
    };
  }

  return {
    gapId: gap.id,
    resolutionType: "inference",
    automatic: true,
    requiresUser: false,
    researchQuery: null,
    approvedSourceKinds: [],
    safeInterimContent: "Proceed with a safe structural default.",
    placeholderAllowed: true,
    blockedAreas: [],
    rationale: "Safe structural inference without inventing facts.",
  };
}

export function assessScopedReadiness(
  pkg: VisualThinkingKnowledgePackage,
  decisions: VisualThinkingGapResolutionDecision[],
): VisualThinkingScopedReadiness {
  const researchPending = decisions
    .filter((d) => d.resolutionType === "external_research" && d.automatic)
    .flatMap((d) => d.blockedAreas);
  const userPending = decisions
    .filter((d) => d.requiresUser)
    .flatMap((d) => d.blockedAreas);
  const openRequired = pkg.knowledgeGaps.filter(
    (g) => g.status === "open" && g.priority === "required",
  );
  const onlyUserBlocking =
    openRequired.length > 0 &&
    openRequired.every(
      (g) =>
        (g.userInputNeeded || g.resolutionType === "clarification") &&
        !g.researchNeeded,
    ) &&
    userPending.length > 0 &&
    researchPending.length === 0;

  // Generate-first: research-only gaps never block all generation.
  const blocksAll =
    pkg.readiness === "not_ready" &&
    openRequired.length > 0 &&
    onlyUserBlocking &&
    !decisions.some((d) => d.placeholderAllowed);

  let safe: VisualThinkingScopedReadiness["safeGenerationScope"] = "partial";
  if (pkg.readiness === "full_ready" && researchPending.length === 0) {
    safe = "full";
  } else if (pkg.items.length === 0 && openRequired.length > 3) {
    safe = "structure_only";
  } else if (pkg.readiness === "not_ready" && blocksAll) {
    safe = "none";
  }

  return {
    safeGenerationScope: safe,
    blockedGenerationScope: userPending,
    researchPendingScope: researchPending,
    userInputPendingScope: userPending,
    mayProceedToGeneration: safe !== "none",
    blocksAllGeneration: blocksAll,
  };
}

export function buildAutomaticContinuationPlan(
  auth: VisualThinkingRequestAuthorization,
): VisualThinkingAutomaticContinuationPlan {
  if (!auth.authorized || auth.creationMode === "build_myself") {
    return {
      continueAutomatically: auth.creationMode === "build_myself",
      stages:
        auth.creationMode === "build_myself"
          ? ["understand", "experience", "present"]
          : ["understand", "experience"],
      acknowledgement: auth.acknowledgement,
      progressLabels: [],
    };
  }
  return {
    continueAutomatically: true,
    stages: [
      "understand",
      "experience",
      "knowledge",
      "research_route",
      "generate",
      "present",
    ],
    acknowledgement: auth.acknowledgement,
    progressLabels: [
      "Building the structure",
      "Adding practical steps",
      "Checking current product details",
      "Preparing your checklist",
    ],
  };
}

// ─── Stable instructional material (not routing; not fabricated UI labels) ─

export function buildInstructionalGenerationMaterial(
  rawRequest: string,
): InstructionalGenerationMaterial {
  const t = rawRequest.toLowerCase();
  const loom = /\bloom\b/.test(t);
  const youtube = /\byoutube\b/.test(t);
  const video = /\bvideo|record|screen\b/.test(t);

  if (loom || (youtube && video) || (/\bupload\b/.test(t) && video)) {
    const freshnessNotice =
      "Loom and YouTube occasionally change the location or wording of controls. The overall process below is reliable; exact button names may vary by your current account version.";
    return {
      title: loom && youtube
        ? "How to Create a Loom Video and Share It on YouTube"
        : loom
          ? "How to Create a Loom Video"
          : "How to Upload a Video to YouTube",
      overview:
        "A practical sequence for preparing, recording, reviewing, and publishing a screen video — with room to verify current product labels.",
      domain: "screen_recording_publish",
      freshnessNotice,
      steps: [
        {
          title: "What you will create",
          content:
            "A short screen recording you can review, then publish to YouTube so others can watch a clear link.",
        },
        {
          title: "Before you begin",
          content:
            "Decide the one outcome of the video, close unrelated tabs, and ensure your microphone works in a quiet space.",
        },
        {
          title: "Set up your recording tool",
          content: loom
            ? "Open Loom in the browser or desktop app and sign in. Start a new recording from the main recording entry point (label may vary by version)."
            : "Open your screen recorder and start a new recording session.",
          freshnessSensitive: true,
        },
        {
          title: "Choose what to record",
          content:
            "Select screen only, camera only, or screen and camera. Pick the window or display that shows the steps you want to teach.",
          freshnessSensitive: true,
        },
        {
          title: "Check microphone and camera",
          content:
            "Confirm the correct microphone is selected and, if using camera, that framing and lighting look clear in the preview.",
          freshnessSensitive: true,
        },
        {
          title: "Record your video",
          content:
            "Start recording, speak slowly through one clear sequence, and avoid jumping between unrelated topics. Pause if your tool supports it when you need a moment.",
        },
        {
          title: "Finish and review",
          content:
            "Stop the recording, watch the playback, and trim dead air or mistakes before you export or download.",
          freshnessSensitive: true,
        },
        {
          title: "Export or save the file",
          content:
            "Download or export a standard video file when YouTube needs a local upload. If your recorder offers a share link first, still keep a local copy when publishing elsewhere.",
          freshnessSensitive: true,
        },
        {
          title: "Open YouTube Studio",
          content:
            "Go to YouTube Studio and begin a new upload. Use the create/upload entry that matches your channel (wording may vary).",
          freshnessSensitive: true,
        },
        {
          title: "Upload the video",
          content:
            "Select the exported file and wait for processing to begin. Keep the tab open until the upload finishes.",
          freshnessSensitive: true,
        },
        {
          title: "Add title, description, and thumbnail",
          content:
            "Write a clear title, a short description of what viewers will learn, and choose or upload a thumbnail that matches the lesson.",
        },
        {
          title: "Choose visibility and audience",
          content:
            "Set public, unlisted, or private, and answer the audience (made for kids) question honestly before publishing.",
          freshnessSensitive: true,
        },
        {
          title: "Publish or schedule",
          content:
            "Publish now or schedule a time. Copy the final watch link and open it in a private window to confirm it works.",
          freshnessSensitive: true,
        },
        {
          title: "Common problems and fixes",
          content:
            "No audio: re-check microphone permissions. Blurry screen: record a single window at full size. Upload stuck: confirm file finished exporting and retry once.",
        },
      ],
      troubleshooting: [
        "If Loom will not start, refresh permissions for mic/camera and try again.",
        "If YouTube processing stalls, wait, then refresh Studio — avoid re-uploading duplicates unless the first upload failed.",
      ],
      checklist: [
        "Decide the one teaching outcome",
        "Test microphone",
        "Record a clean take",
        "Trim and export",
        "Upload in YouTube Studio",
        "Title, description, thumbnail",
        "Visibility set",
        "Final link tested",
      ],
    };
  }

  if (/\b(how to|teach|learn|show me|guide|walk)\b/.test(t)) {
    return {
      title: "Step-by-step guide",
      overview:
        "A practical sequence based on your request. Adjust any step to match your tools.",
      domain: "generic_how_to",
      freshnessNotice: null,
      steps: [
        {
          title: "Clarify the outcome",
          content:
            "Name the finished result in one sentence so every step serves that outcome.",
        },
        {
          title: "Gather what you need",
          content:
            "Open the tools, files, or accounts you will use before you start the first action.",
        },
        {
          title: "Complete the first concrete action",
          content:
            "Do the smallest visible action that moves the work forward — not a preparation loop.",
        },
        {
          title: "Continue through the middle sequence",
          content:
            "Work in order. After each action, check that the next step is still possible.",
        },
        {
          title: "Review and finish",
          content:
            "Confirm the outcome matches your sentence from step 1, then save or share the result.",
        },
        {
          title: "Capture what to remember next time",
          content:
            "Note one friction point and one improvement so the next pass is easier.",
        },
      ],
      troubleshooting: [
        "If you feel stuck, return to the outcome sentence and remove any step that does not serve it.",
      ],
      checklist: [
        "Outcome named",
        "Tools ready",
        "First action done",
        "Sequence complete",
        "Result reviewed",
      ],
    };
  }

  return {
    title: "",
    overview: "",
    domain: "none",
    freshnessNotice: null,
    steps: [],
    troubleshooting: [],
    checklist: [],
  };
}

export function instructionalMaterialToSuppliedLines(
  material: InstructionalGenerationMaterial,
): string[] {
  return material.steps.map((s) => `${s.title}: ${s.content}`);
}

export function enrichHandoffWithInstructionalMaterial(
  handoff: VisualThinkingGenerationHandoff,
  rawRequest: string,
  pkg: VisualThinkingKnowledgePackage | null,
): VisualThinkingGenerationHandoff & {
  instructionalLines: string[];
  instructionalTitle: string | null;
  freshnessNotice: string | null;
} {
  const fromPkg = (pkg?.items ?? [])
    .filter(
      (i) =>
        (i.type === "step" || i.type === "instruction") &&
        i.verificationStatus !== "gap",
    )
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
    .map((i) => (i.title ? `${i.title}: ${i.content}` : i.content));

  const material = buildInstructionalGenerationMaterial(rawRequest);
  const fromMaterial = instructionalMaterialToSuppliedLines(material);
  const instructionalLines =
    fromPkg.length >= 3 ? fromPkg : fromMaterial.length > 0 ? fromMaterial : handoff.suppliedSteps;

  return {
    ...handoff,
    suppliedSteps: instructionalLines,
    instructionalLines,
    instructionalTitle: material.title || null,
    freshnessNotice: material.freshnessNotice,
  };
}

// ─── Substance validation ───────────────────────────────────────────────────

function normalizeEcho(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function assessGeneratedResultSubstance(input: {
  deliverable: VisualThinkingGeneratedDeliverable;
  rawRequest: string;
  deliverableType?: string;
}): VisualThinkingResultSubstanceAssessment {
  const { deliverable, rawRequest } = input;
  const blocks = deliverable.blocks.filter((b) => b.content.trim());
  const req = normalizeEcho(rawRequest);
  const echoHits = blocks.filter((b) => {
    const c = normalizeEcho(b.content);
    if (!c || !req) return false;
    if (c === req) return true;
    if (req.length > 24 && c.includes(req.slice(0, Math.min(48, req.length)))) {
      return true;
    }
    // Near-identity title echo
    return (
      c.length < req.length + 20 &&
      req.includes(c) &&
      c.split(" ").length >= 6
    );
  }).length;

  const steps = blocks.filter(
    (b) => b.type === "numbered_step" || b.type === "checklist_item",
  );
  const meaningful = blocks.filter((b) => {
    const c = normalizeEcho(b.content);
    if (!c) return false;
    if (c === req) return false;
    if (/^complete step \d+ for /.test(c)) return false;
    if (b.type === "placeholder" && b.metadata?.researchDependent) return false;
    // Instructional steps may be short phrases ("Open app", even "A") and still count.
    if (b.type === "numbered_step" || b.type === "checklist_item") {
      return c.length >= 1;
    }
    return c.split(" ").length >= 5;
  });
  const placeholders = blocks.filter((b) => b.type === "placeholder").length;
  const echoRatio = blocks.length ? echoHits / blocks.length : 1;

  const failureReasons: string[] = [];
  if (meaningful.length < 3) {
    failureReasons.push("Too few meaningful content blocks.");
  }
  if (steps.length < 3 && deliverable.type === "step_by_step_guide") {
    failureReasons.push("Step-by-step guide lacks instructional steps.");
  }
  if (echoRatio >= 0.5) {
    failureReasons.push("Result largely repeats the user request.");
  }
  if (
    steps.every((s) => /^complete step \d+ for /i.test(s.content)) &&
    steps.length > 0
  ) {
    failureReasons.push("Steps are generic topic echoes, not instructions.");
  }
  if (placeholders > 0 && meaningful.length < 2) {
    failureReasons.push("Placeholder-only result.");
  }

  const substantive = failureReasons.length === 0;
  let completeness: VisualThinkingResultSubstanceAssessment["completeness"] =
    "substantive";
  if (blocks.length === 0) completeness = "empty";
  else if (echoRatio >= 0.5) completeness = "echo";
  else if (!substantive) completeness = "thin";
  else if (placeholders > 0) completeness = "partial";

  return {
    substantive,
    completeness,
    userRequestEchoRatio: echoRatio,
    meaningfulBlockCount: meaningful.length,
    instructionalStepCount: steps.length,
    knowledgeItemCoverage: meaningful.length,
    unresolvedRequiredAreas: [],
    placeholderOnlySections: placeholders,
    failureReasons,
  };
}

export function applyInstructionalMaterialToBlocks(
  material: InstructionalGenerationMaterial,
): VisualThinkingContentBlock[] {
  const blocks: VisualThinkingContentBlock[] = [];
  let order = 0;
  const push = (
    type: VisualThinkingContentBlock["type"],
    content: string,
    title: string | null,
    metadata: Record<string, unknown> = {},
  ) => {
    blocks.push({
      id: `vtb_gf_${order}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      title,
      content,
      order: order++,
      parentId: null,
      metadata,
      editable: true,
      userEdited: false,
    });
  };

  push("heading", material.title || "Guide", "Overview");
  push("paragraph", material.overview, null);
  if (material.freshnessNotice) {
    push("warning", material.freshnessNotice, "About current product details", {
      freshnessNotice: true,
    });
  }
  material.steps.forEach((s, i) => {
    push("numbered_step", s.content, s.title || `Step ${i + 1}`, {
      freshnessSensitive: Boolean(s.freshnessSensitive),
    });
  });
  if (material.troubleshooting.length) {
    push("heading", "Common problems", "Troubleshooting");
    material.troubleshooting.forEach((t) => push("tip", t, null));
  }
  if (material.checklist.length) {
    push("heading", "Quick checklist", "Checklist");
    material.checklist.forEach((c) => push("checklist_item", c, null));
  }
  push(
    "summary",
    "You should be able to repeat this sequence with confidence. Adjust any step to match your tools.",
    "Done when",
  );
  return blocks;
}

/** Knowledge items from instructional material for package enrichment (optional). */
export function instructionalMaterialToKnowledgeItems(
  material: InstructionalGenerationMaterial,
): Array<Pick<VisualThinkingKnowledgeItem, "type" | "title" | "content" | "sequence">> {
  return material.steps.map((s, i) => ({
    type: "step" as const,
    title: s.title,
    content: s.content,
    sequence: i + 1,
  }));
}
