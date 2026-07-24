/**
 * Visual Thinking Studio — request-first intake foundation (Build 1).
 * Understands what the member wants, how much help, and which form fits —
 * before any map, report, or research generation.
 */

import {
  limitVisibleChoices,
  resolveAdaptivePresentation,
} from "@/lib/adaptiveCompanionIntelligence";

export type VisualThinkingProvisionalIntent =
  | "create_process"
  | "explain_topic"
  | "research_topic"
  | "organize_ideas"
  | "compare_options"
  | "make_decision"
  | "create_plan"
  | "build_checklist"
  | "build_sop"
  | "create_visual"
  | "create_report"
  | "create_learning_guide"
  | "user_led_map"
  | "unclear";

export type VisualThinkingHelpDepth =
  | "essentials"
  | "guided"
  | "detailed"
  | "help_choose"
  | "unspecified";

export type VisualThinkingOutputForm =
  | "simple_explanation"
  | "step_by_step_guide"
  | "checklist"
  | "process_flow"
  | "visual_thinking_map"
  | "timeline"
  | "decision_tree"
  | "comparison"
  | "report"
  | "sop"
  | "learning_guide"
  | "action_plan";

export type VisualThinkingEntryPath =
  | "describe_request"
  | "user_led_visual"
  | "research_assisted"
  | "previous_work";

export type VisualThinkingRequestStatus =
  | "capturing"
  | "awaiting_depth"
  | "preview"
  | "confirmed"
  | "user_led"
  | "research_intake";

export type VisualThinkingRequest = {
  id: string;
  rawRequest: string;
  provisionalIntent: VisualThinkingProvisionalIntent;
  requestedDepth: VisualThinkingHelpDepth;
  requestedOutput: VisualThinkingOutputForm | null;
  recommendedPrimaryOutput: VisualThinkingOutputForm | null;
  recommendedSupportingOutputs: VisualThinkingOutputForm[];
  recommendationSummary: string;
  declinesMap: boolean;
  wantsVisualAlso: boolean;
  userConfirmed: boolean;
  entryPath: VisualThinkingEntryPath;
  sourceContext: string | null;
  status: VisualThinkingRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type VisualThinkingDepthChoice = {
  id: Exclude<VisualThinkingHelpDepth, "unspecified">;
  label: string;
};

export type VisualThinkingUserControl =
  | "simplify"
  | "add_detail"
  | "report_only"
  | "no_map"
  | "add_visual"
  | "build_myself"
  | "options_first"
  | "different_format";

export const VISUAL_THINKING_STUDIO_TITLE = "Visual Thinking Studio" as const;

export const VISUAL_THINKING_STUDIO_SUPPORTING =
  "What would you like help seeing, understanding, creating, or working through?" as const;

export const VISUAL_THINKING_REQUEST_PLACEHOLDER =
  "Tell me what you are trying to understand, create, organize, research, or decide." as const;

export const VISUAL_THINKING_DEPTH_QUESTION =
  "How much help would feel useful?" as const;

export const VISUAL_THINKING_DEPTH_CHOICES: readonly VisualThinkingDepthChoice[] =
  [
    { id: "essentials", label: "Just the essentials" },
    { id: "guided", label: "A clear guided version" },
    { id: "detailed", label: "Detailed and thorough" },
    { id: "help_choose", label: "Help me choose" },
  ] as const;

export const VISUAL_THINKING_USER_LED_PROMPT =
  "What would you like to map or organize?" as const;

export const VISUAL_THINKING_RESEARCH_PROMPT =
  "What would you like me to help you learn, understand, or create?" as const;

const DRAFT_KEY = "companion-visual-thinking-request-draft-v1";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return `vtr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Detect explicit help-depth signals in ordinary language. */
export function detectHelpDepth(raw: string): VisualThinkingHelpDepth {
  const t = normalize(raw);
  if (!t) return "unspecified";

  if (
    /\b(every step|step[- ]by[- ]step|walk me through|expert[- ]level|detailed|thorough|in[- ]depth|deeply|complete guide|all the steps)\b/.test(
      t,
    )
  ) {
    return "detailed";
  }
  if (
    /\b(basics?|essentials?|quick explanation|just tell me what matters|short version|briefly|quick overview|high[- ]level)\b/.test(
      t,
    )
  ) {
    return "essentials";
  }
  if (
    /\b(guided|walk[- ]through|clear version|help me through)\b/.test(t)
  ) {
    return "guided";
  }
  if (
    /\b(several options|give me options|help me choose|i don't know what (would be|format|form)|not sure what (would be|format|form))\b/.test(
      t,
    )
  ) {
    return "help_choose";
  }
  return "unspecified";
}

/** Detect an explicitly requested output form. */
export function detectRequestedOutput(
  raw: string,
): VisualThinkingOutputForm | null {
  const t = normalize(raw);
  if (!t) return null;

  if (/\b(s\.?o\.?p\.?|standard operating procedure)\b/.test(t)) return "sop";
  if (/\b(checklist|check list)\b/.test(t)) return "checklist";
  if (/\b(decision tree|decision map)\b/.test(t)) return "decision_tree";
  if (/\b(timeline)\b/.test(t)) return "timeline";
  if (/\b(comparison|compare)\b/.test(t)) return "comparison";
  if (/\b(learning guide|teach me|lesson)\b/.test(t)) return "learning_guide";
  if (/\b(action plan|plan of action)\b/.test(t)) return "action_plan";
  if (/\b(report)\b/.test(t)) return "report";
  if (
    /\b(process flow|flowchart|flow chart|process map)\b/.test(t)
  ) {
    return "process_flow";
  }
  if (
    /\b(step[- ]by[- ]step|every step|all the steps|how (do|to) i|show me how)\b/.test(
      t,
    )
  ) {
    return "step_by_step_guide";
  }
  if (
    /\b(simple explanation|explain|help me understand)\b/.test(t) &&
    !/\b(map|visual|research|report)\b/.test(t)
  ) {
    return "simple_explanation";
  }
  if (
    /\b(mind map|relationship map|visual map|map my|make (a |my )?map|visual thinking map)\b/.test(
      t,
    )
  ) {
    return "visual_thinking_map";
  }
  return null;
}

export function detectsDeclinesMap(raw: string): boolean {
  const t = normalize(raw);
  return (
    /\b(not a map|no map|don't want a map|do not want a map|without a map|report,? not a map)\b/.test(
      t,
    )
  );
}

export function detectsWantsVisualAlso(raw: string): boolean {
  const t = normalize(raw);
  return /\b(visually too|show it visually|with a visual|and a (map|visual|diagram|flow)|optional visual)\b/.test(
    t,
  );
}

export function detectsUserLedVisual(raw: string): boolean {
  const t = normalize(raw);
  return /\b(my own (map|visual)|make my own|map (my|of) my|i want to map|let me (build|map)|create my own visual)\b/.test(
    t,
  );
}

export function detectProvisionalIntent(
  raw: string,
): VisualThinkingProvisionalIntent {
  const t = normalize(raw);
  if (!t) return "unclear";

  if (detectsUserLedVisual(t)) return "user_led_map";
  if (/\b(research|look (this|it) up|find (out|sources)|deep dive)\b/.test(t)) {
    return "research_topic";
  }
  if (/\b(compare|versus|vs\.?|which (is|one|should))\b/.test(t)) {
    return "compare_options";
  }
  if (/\b(decid(e|ing)|decision)\b/.test(t)) return "make_decision";
  if (/\b(s\.?o\.?p\.?|standard operating)\b/.test(t)) return "build_sop";
  if (/\b(checklist)\b/.test(t)) return "build_checklist";
  if (/\b(report)\b/.test(t)) return "create_report";
  if (/\b(onboard|process|steps for|how (do|to)|loom|workflow)\b/.test(t)) {
    return "create_process";
  }
  if (/\b(plan|roadmap)\b/.test(t)) return "create_plan";
  if (/\b(learning|teach|guide me)\b/.test(t)) return "create_learning_guide";
  if (/\b(organize|organise|sort|connect|parts of my business)\b/.test(t)) {
    return "organize_ideas";
  }
  if (/\b(map|visual|diagram)\b/.test(t)) return "create_visual";
  if (/\b(explain|understand|what is|help me see)\b/.test(t)) {
    return "explain_topic";
  }
  return "unclear";
}

function depthLabel(depth: VisualThinkingHelpDepth): string {
  switch (depth) {
    case "essentials":
      return "essentials";
    case "guided":
      return "a clear guided";
    case "detailed":
      return "a detailed";
    case "help_choose":
      return "a thoughtfully chosen";
    default:
      return "a clear";
  }
}

function outputPhrase(form: VisualThinkingOutputForm): string {
  switch (form) {
    case "simple_explanation":
      return "simple explanation";
    case "step_by_step_guide":
      return "step-by-step guide";
    case "checklist":
      return "checklist";
    case "process_flow":
      return "visual process flow";
    case "visual_thinking_map":
      return "visual thinking map";
    case "timeline":
      return "timeline";
    case "decision_tree":
      return "decision tree";
    case "comparison":
      return "comparison";
    case "report":
      return "report";
    case "sop":
      return "SOP";
    case "learning_guide":
      return "learning guide";
    case "action_plan":
      return "action plan";
  }
}

/**
 * Recommend one primary form (+ optional supporting) from the request.
 * Never forces a map. Honors explicit output and decline signals.
 */
export function recommendOutputs(input: {
  rawRequest: string;
  provisionalIntent: VisualThinkingProvisionalIntent;
  requestedDepth: VisualThinkingHelpDepth;
  requestedOutput: VisualThinkingOutputForm | null;
  declinesMap: boolean;
  wantsVisualAlso: boolean;
}): {
  primary: VisualThinkingOutputForm;
  supporting: VisualThinkingOutputForm[];
  summary: string;
} {
  const depth = input.requestedDepth === "unspecified"
    ? "guided"
    : input.requestedDepth;

  let primary: VisualThinkingOutputForm =
    input.requestedOutput ?? "simple_explanation";
  let supporting: VisualThinkingOutputForm[] = [];

  if (!input.requestedOutput) {
    switch (input.provisionalIntent) {
      case "create_process":
      case "build_sop":
        primary = "step_by_step_guide";
        supporting = ["process_flow", "checklist"];
        break;
      case "research_topic":
        primary = "report";
        supporting = depth === "detailed" ? ["checklist"] : [];
        break;
      case "compare_options":
        primary = "comparison";
        supporting = ["action_plan"];
        break;
      case "make_decision":
        primary = "decision_tree";
        supporting = ["comparison"];
        break;
      case "organize_ideas":
      case "create_visual":
      case "user_led_map":
        primary = "visual_thinking_map";
        supporting = ["simple_explanation"];
        break;
      case "create_plan":
        primary = "action_plan";
        supporting = ["checklist"];
        break;
      case "build_checklist":
        primary = "checklist";
        break;
      case "create_report":
        primary = "report";
        break;
      case "create_learning_guide":
        primary = "learning_guide";
        supporting = ["checklist"];
        break;
      case "explain_topic":
        primary =
          depth === "essentials" ? "simple_explanation" : "step_by_step_guide";
        break;
      default:
        primary = "step_by_step_guide";
        supporting = ["checklist"];
        break;
    }
  }

  if (input.declinesMap) {
    supporting = supporting.filter(
      (o) => o !== "visual_thinking_map" && o !== "process_flow",
    );
    if (
      primary === "visual_thinking_map" ||
      primary === "process_flow" ||
      primary === "decision_tree"
    ) {
      primary = input.requestedOutput === "report" ? "report" : "report";
      if (input.requestedOutput && input.requestedOutput !== "visual_thinking_map") {
        primary = input.requestedOutput;
      }
    }
  }

  if (input.wantsVisualAlso && !input.declinesMap) {
    if (
      primary !== "visual_thinking_map" &&
      primary !== "process_flow" &&
      !supporting.includes("process_flow") &&
      !supporting.includes("visual_thinking_map")
    ) {
      supporting = [...supporting, "process_flow"];
    }
  }

  // Process how-to with detailed depth → visual flow + checklist as supporting
  if (
    (input.provisionalIntent === "create_process" ||
      primary === "step_by_step_guide") &&
    !input.declinesMap &&
    supporting.length === 0
  ) {
    supporting = ["process_flow", "checklist"];
  }

  const parts = [
    `${depthLabel(depth)} ${outputPhrase(primary)}`,
  ];
  if (supporting.length > 0) {
    const supportLabels = supporting.map(outputPhrase);
    if (supportLabels.length === 1) {
      parts.push(`with an optional ${supportLabels[0]}`);
    } else {
      parts.push(
        `with optional ${supportLabels.slice(0, -1).join(", ")} and ${supportLabels[supportLabels.length - 1]}`,
      );
    }
  }

  const topicHint = input.rawRequest.trim()
    ? ` for ${shortenTopic(input.rawRequest)}`
    : "";

  return {
    primary,
    supporting,
    summary: `A ${parts.join(" ")}${topicHint}.`.replace(/\s+/g, " "),
  };
}

function shortenTopic(raw: string): string {
  const cleaned = raw
    .trim()
    .replace(/^(show me how to|help me|i (need|want)|create|research)\s+/i, "")
    .replace(/\.\s*i need every step\.?$/i, "")
    .replace(/\.$/, "");
  if (cleaned.length <= 72) return cleaned;
  return `${cleaned.slice(0, 69).trim()}…`;
}

export function createVisualThinkingRequest(input: {
  rawRequest?: string;
  entryPath?: VisualThinkingEntryPath;
  sourceContext?: string | null;
}): VisualThinkingRequest {
  const raw = input.rawRequest?.trim() ?? "";
  const entryPath = input.entryPath ?? "describe_request";
  const timestamp = nowIso();

  if (entryPath === "user_led_visual") {
    return {
      id: newId(),
      rawRequest: raw,
      provisionalIntent: "user_led_map",
      requestedDepth: detectHelpDepth(raw),
      requestedOutput: "visual_thinking_map",
      recommendedPrimaryOutput: "visual_thinking_map",
      recommendedSupportingOutputs: [],
      recommendationSummary:
        "A user-led visual space to map or organize what matters — layout can come after the content is clear.",
      declinesMap: false,
      wantsVisualAlso: true,
      userConfirmed: false,
      entryPath,
      sourceContext: input.sourceContext ?? null,
      status: "user_led",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  if (entryPath === "research_assisted") {
    const depth = detectHelpDepth(raw);
    const intent = raw ? detectProvisionalIntent(raw) : "research_topic";
    const requestedOutput = detectRequestedOutput(raw);
    const declinesMap = detectsDeclinesMap(raw);
    const wantsVisualAlso = detectsWantsVisualAlso(raw);
    const rec = raw
      ? recommendOutputs({
          rawRequest: raw,
          provisionalIntent:
            intent === "unclear" ? "research_topic" : intent,
          requestedDepth: depth === "unspecified" ? "guided" : depth,
          requestedOutput: requestedOutput ?? "report",
          declinesMap,
          wantsVisualAlso,
        })
      : {
          primary: "report" as const,
          supporting: [] as VisualThinkingOutputForm[],
          summary:
            "A research-backed report with key findings — depth can be tuned once the topic is clear.",
        };

    return {
      id: newId(),
      rawRequest: raw,
      provisionalIntent: intent === "unclear" ? "research_topic" : intent,
      requestedDepth: depth,
      requestedOutput: requestedOutput ?? "report",
      recommendedPrimaryOutput: rec.primary,
      recommendedSupportingOutputs: rec.supporting,
      recommendationSummary: rec.summary,
      declinesMap,
      wantsVisualAlso,
      userConfirmed: false,
      entryPath,
      sourceContext: input.sourceContext ?? null,
      status: raw ? (depth === "unspecified" ? "awaiting_depth" : "preview") : "research_intake",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  if (!raw) {
    return {
      id: newId(),
      rawRequest: "",
      provisionalIntent: "unclear",
      requestedDepth: "unspecified",
      requestedOutput: null,
      recommendedPrimaryOutput: null,
      recommendedSupportingOutputs: [],
      recommendationSummary: "",
      declinesMap: false,
      wantsVisualAlso: false,
      userConfirmed: false,
      entryPath,
      sourceContext: input.sourceContext ?? null,
      status: "capturing",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  return applyRequestText(
    {
      id: newId(),
      rawRequest: "",
      provisionalIntent: "unclear",
      requestedDepth: "unspecified",
      requestedOutput: null,
      recommendedPrimaryOutput: null,
      recommendedSupportingOutputs: [],
      recommendationSummary: "",
      declinesMap: false,
      wantsVisualAlso: false,
      userConfirmed: false,
      entryPath,
      sourceContext: input.sourceContext ?? null,
      status: "capturing",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    raw,
  );
}

/** Apply or replace the member's ordinary-language request. */
export function applyRequestText(
  request: VisualThinkingRequest,
  rawRequest: string,
): VisualThinkingRequest {
  const raw = rawRequest.trim();
  const depth = detectHelpDepth(raw);
  const requestedOutput = detectRequestedOutput(raw);
  const declinesMap = detectsDeclinesMap(raw);
  const wantsVisualAlso = detectsWantsVisualAlso(raw);
  let provisionalIntent = detectProvisionalIntent(raw);

  if (detectsUserLedVisual(raw) || request.entryPath === "user_led_visual") {
    provisionalIntent = "user_led_map";
  }

  if (provisionalIntent === "user_led_map") {
    return {
      ...request,
      rawRequest: raw,
      provisionalIntent,
      requestedDepth: depth,
      requestedOutput: requestedOutput ?? "visual_thinking_map",
      recommendedPrimaryOutput: "visual_thinking_map",
      recommendedSupportingOutputs: [],
      recommendationSummary:
        "A user-led visual space to map or organize what matters — without choosing a map type first.",
      declinesMap: false,
      wantsVisualAlso: true,
      userConfirmed: false,
      entryPath: "user_led_visual",
      status: "user_led",
      updatedAt: nowIso(),
    };
  }

  if (request.entryPath === "research_assisted" && provisionalIntent === "unclear") {
    provisionalIntent = "research_topic";
  }

  const needsDepth = depth === "unspecified";
  const depthForRec = needsDepth ? "guided" : depth;
  const effectiveOutput =
    requestedOutput ??
    (request.entryPath === "research_assisted" ? "report" : null);
  const rec = recommendOutputs({
    rawRequest: raw,
    provisionalIntent,
    requestedDepth: depthForRec,
    requestedOutput: effectiveOutput,
    declinesMap,
    wantsVisualAlso,
  });

  return {
    ...request,
    rawRequest: raw,
    provisionalIntent,
    requestedDepth: depth,
    requestedOutput: effectiveOutput,
    recommendedPrimaryOutput: rec.primary,
    recommendedSupportingOutputs: rec.supporting,
    recommendationSummary: rec.summary,
    declinesMap,
    wantsVisualAlso,
    userConfirmed: false,
    entryPath:
      request.entryPath === "research_assisted"
        ? "research_assisted"
        : request.entryPath,
    status: needsDepth ? "awaiting_depth" : "preview",
    updatedAt: nowIso(),
  };
}

export function applyHelpDepth(
  request: VisualThinkingRequest,
  depth: Exclude<VisualThinkingHelpDepth, "unspecified">,
): VisualThinkingRequest {
  const effectiveDepth = depth === "help_choose" ? "guided" : depth;
  const rec = recommendOutputs({
    rawRequest: request.rawRequest,
    provisionalIntent: request.provisionalIntent,
    requestedDepth: effectiveDepth,
    requestedOutput: request.requestedOutput,
    declinesMap: request.declinesMap,
    wantsVisualAlso: request.wantsVisualAlso,
  });

  return {
    ...request,
    requestedDepth: depth,
    recommendedPrimaryOutput: rec.primary,
    recommendedSupportingOutputs: rec.supporting,
    recommendationSummary: rec.summary,
    status: "preview",
    updatedAt: nowIso(),
  };
}

export function detectUserControl(raw: string): VisualThinkingUserControl | null {
  const t = normalize(raw);
  if (!t) return null;
  if (/\b(too much|make it simpler|simpler|less detail)\b/.test(t)) {
    return "simplify";
  }
  if (/\b(more detail|add more detail|more thorough|deeper)\b/.test(t)) {
    return "add_detail";
  }
  if (/\b(just (give me )?the report|report only|only (a |the )?report)\b/.test(t)) {
    return "report_only";
  }
  if (/\b(don't want a map|no map|not a map)\b/.test(t)) return "no_map";
  if (/\b(visually too|show it visually|add a visual)\b/.test(t)) {
    return "add_visual";
  }
  if (/\b(build it myself|let me build|my own)\b/.test(t)) {
    return "build_myself";
  }
  if (/\b(options first|give me options)\b/.test(t)) return "options_first";
  if (/\b(different format|choose a different)\b/.test(t)) {
    return "different_format";
  }
  return null;
}

/** Adjust the planned result without restarting intake. */
export function applyUserControl(
  request: VisualThinkingRequest,
  control: VisualThinkingUserControl,
): VisualThinkingRequest {
  let next: VisualThinkingRequest = { ...request, updatedAt: nowIso() };

  switch (control) {
    case "simplify": {
      next.requestedDepth = "essentials";
      break;
    }
    case "add_detail": {
      next.requestedDepth = "detailed";
      break;
    }
    case "report_only": {
      next.requestedOutput = "report";
      next.declinesMap = true;
      next.wantsVisualAlso = false;
      break;
    }
    case "no_map": {
      next.declinesMap = true;
      next.wantsVisualAlso = false;
      if (
        next.requestedOutput === "visual_thinking_map" ||
        next.requestedOutput === "process_flow"
      ) {
        next.requestedOutput = "report";
      }
      break;
    }
    case "add_visual": {
      next.declinesMap = false;
      next.wantsVisualAlso = true;
      break;
    }
    case "build_myself": {
      return {
        ...next,
        entryPath: "user_led_visual",
        provisionalIntent: "user_led_map",
        status: "user_led",
        userConfirmed: false,
        recommendationSummary:
          "A user-led visual space — you shape it; Spark can suggest a layout later.",
        recommendedPrimaryOutput: "visual_thinking_map",
        recommendedSupportingOutputs: [],
      };
    }
    case "options_first": {
      next.requestedDepth = "help_choose";
      break;
    }
    case "different_format": {
      next.status = "capturing";
      next.userConfirmed = false;
      next.recommendationSummary = "";
      return next;
    }
  }

  const rec = recommendOutputs({
    rawRequest: next.rawRequest,
    provisionalIntent: next.provisionalIntent,
    requestedDepth:
      next.requestedDepth === "unspecified" ? "guided" : next.requestedDepth,
    requestedOutput: next.requestedOutput,
    declinesMap: next.declinesMap,
    wantsVisualAlso: next.wantsVisualAlso,
  });

  return {
    ...next,
    recommendedPrimaryOutput: rec.primary,
    recommendedSupportingOutputs: rec.supporting,
    recommendationSummary: rec.summary,
    status: "preview",
    userConfirmed: false,
  };
}

export function confirmRecommendation(
  request: VisualThinkingRequest,
): VisualThinkingRequest {
  return {
    ...request,
    userConfirmed: true,
    status: "confirmed",
    updatedAt: nowIso(),
  };
}

/** Depth choices with Adaptive Companion reduced-choice capping (presentation only). */
export function visibleDepthChoices(options?: {
  showAll?: boolean;
}): {
  visible: VisualThinkingDepthChoice[];
  hiddenCount: number;
  fullDetailAvailable: true;
} {
  const all = [...VISUAL_THINKING_DEPTH_CHOICES];
  if (options?.showAll) {
    return { visible: all, hiddenCount: 0, fullDetailAvailable: true };
  }
  const presentation = resolveAdaptivePresentation({
    destinationHint: "visual_thinking_studio",
  });
  const { visible, hiddenCount } = limitVisibleChoices(all, presentation);
  return {
    visible,
    hiddenCount,
    fullDetailAvailable: true,
  };
}

export function saveVisualThinkingRequestDraft(
  request: VisualThinkingRequest,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(request));
  } catch {
    /* noop */
  }
}

export function loadVisualThinkingRequestDraft(): VisualThinkingRequest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VisualThinkingRequest;
    if (!parsed?.id || typeof parsed.rawRequest !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearVisualThinkingRequestDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* noop */
  }
}

/** Studio opens request-first when there is no active map/item. */
export function shouldShowRequestFirstExperience(input: {
  hasActiveMap: boolean;
  hasPendingMapOverlay: boolean;
}): boolean {
  return !input.hasActiveMap && !input.hasPendingMapOverlay;
}
