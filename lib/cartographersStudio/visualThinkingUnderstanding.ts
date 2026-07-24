/**
 * Visual Thinking Studio — Understanding Engine (Build 2).
 * Goal-first interpretation between the captured request and any result plan.
 * Deterministic local logic; same contract can later accept AI-produced results.
 */

import {
  detectHelpDepth,
  detectRequestedOutput,
  detectsDeclinesMap,
  detectsUserLedVisual,
  detectsWantsVisualAlso,
  type VisualThinkingHelpDepth,
  type VisualThinkingOutputForm,
  type VisualThinkingRequest,
} from "@/lib/cartographersStudio/visualThinkingRequest";
import {
  limitVisibleChoices,
  resolveAdaptivePresentation,
} from "@/lib/adaptiveCompanionIntelligence";

export type VisualThinkingPrimaryGoal =
  | "learn_how"
  | "understand_topic"
  | "create_something"
  | "organize_information"
  | "compare_options"
  | "make_decision"
  | "teach_others"
  | "explain_something"
  | "plan_something"
  | "improve_something"
  | "troubleshoot"
  | "document_process"
  | "explore_possibilities"
  | "research_topic"
  | "see_relationships"
  | "communicate_idea"
  | "unclear";

export type VisualThinkingCognitiveTask =
  | "learn"
  | "understand"
  | "organize"
  | "research"
  | "compare"
  | "decide"
  | "create"
  | "plan"
  | "teach"
  | "explain"
  | "troubleshoot"
  | "evaluate"
  | "sequence"
  | "connect"
  | "apply";

export type VisualThinkingKnowledgeLevel =
  | "beginner"
  | "developing"
  | "experienced"
  | "advanced"
  | "mixed"
  | "unknown";

export type VisualThinkingCreationMode =
  | "build_for_me"
  | "guide_me"
  | "build_myself"
  | "unspecified";

export type VisualThinkingResearchNeed =
  | "not_needed"
  | "optional"
  | "required"
  | "unclear";

export type VisualThinkingPrimaryExperience =
  | "teaching"
  | "research"
  | "guided_creation"
  | "user_led_creation"
  | "visual_organization"
  | "comparison"
  | "decision_support"
  | "planning"
  | "process_development"
  | "explanation"
  | "troubleshooting";

/** Richer output vocabulary for understanding; maps into Build 1 forms when needed. */
export type VisualThinkingUnderstandingOutput =
  | VisualThinkingOutputForm
  | "concise_explanation"
  | "detailed_explanation"
  | "editable_visual_map"
  | "relationship_map"
  | "mind_map"
  | "cause_effect_map"
  | "training_guide"
  | "quick_reference"
  | "faq"
  | "glossary"
  | "common_mistakes"
  | "examples"
  | "practice_activity"
  | "questions_to_consider";

export type VisualThinkingConfidence = "low" | "medium" | "high";

export type VisualThinkingUnderstandingStatus =
  | "interpreted"
  | "needs_clarification"
  | "user_adjusted"
  | "ready_for_preview";

export type VisualThinkingUnderstanding = {
  id: string;
  requestId: string;
  rawRequest: string;
  primaryGoal: VisualThinkingPrimaryGoal;
  secondaryGoals: VisualThinkingPrimaryGoal[];
  intendedOutcome: string;
  successDefinition: string;
  cognitiveTasks: VisualThinkingCognitiveTask[];
  primaryCognitiveTask: VisualThinkingCognitiveTask | null;
  userKnowledgeLevel: VisualThinkingKnowledgeLevel;
  knowledgeConfidence: VisualThinkingConfidence;
  requestedDepth: VisualThinkingHelpDepth;
  effectiveDepth: Exclude<VisualThinkingHelpDepth, "unspecified">;
  creationMode: VisualThinkingCreationMode;
  researchNeed: VisualThinkingResearchNeed;
  researchReason: string | null;
  researchDepth:
    | Exclude<VisualThinkingHelpDepth, "unspecified" | "help_choose">
    | null;
  primaryExperience: VisualThinkingPrimaryExperience;
  supportingExperiences: VisualThinkingPrimaryExperience[];
  recommendedPrimaryOutput: VisualThinkingUnderstandingOutput;
  recommendedSupportingOutputs: VisualThinkingUnderstandingOutput[];
  recommendationRationale: string;
  userFacingRecommendation: string;
  userFacingGoal: string;
  assumptions: string[];
  clarificationNeed: string | null;
  sourceContext: string | null;
  confidence: VisualThinkingConfidence;
  status: VisualThinkingUnderstandingStatus;
  declinesMap: boolean;
  interpretedBy: "deterministic_v1";
  interpretationVersion: "vts-understanding-1";
  userAdjusted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VisualThinkingPreviewProjection = {
  goalLine: string;
  primaryLine: string;
  supportingLines: string[];
  researchLine: string | null;
  creationModeLine: string | null;
  clarificationQuestion: string | null;
  showSupporting: boolean;
};

export type UnderstandingCorrection =
  | { kind: "simplify" }
  | { kind: "add_detail" }
  | { kind: "checklist_only" }
  | { kind: "report_only" }
  | { kind: "no_map" }
  | { kind: "add_visual" }
  | { kind: "build_myself" }
  | { kind: "remove_supporting"; output: VisualThinkingUnderstandingOutput }
  | { kind: "change_included" }
  | { kind: "natural_language"; text: string };

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return `vtu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function topicHint(raw: string): string {
  const cleaned = raw
    .trim()
    .replace(
      /^(show me how to|help me|i (need|want)|create|research|organize|map)\s+/i,
      "",
    )
    .replace(/\.\s*(i need every step|no map|not a map|i do not want a map).*$/i, "")
    .replace(/\.$/, "");
  if (cleaned.length <= 80) return cleaned;
  return `${cleaned.slice(0, 77).trim()}…`;
}

export function detectCreationMode(raw: string): VisualThinkingCreationMode {
  const t = normalize(raw);
  if (
    /\b(my own (map|visual|ideas)|build (it )?myself|make my own|i want to (map|make|build) my own|create my own visual|let me (build|map|organize)|map my own|blank visual)\b/.test(
      t,
    )
  ) {
    return "build_myself";
  }
  // Collaborative pacing — only when the member asks to work together, not for clear build requests.
  if (
    /\b(ask me questions( as we go)?|help me work (it|this) out|walk through it with me|guide me through)\b/.test(
      t,
    ) &&
    !/\b(teach me|show me how|learn how|create (a |an |the )?(guide|sop|report)|research|compare|build (this |it )?for me|how (do i|to))\b/.test(
      t,
    )
  ) {
    return "guide_me";
  }
  if (
    /\b(teach me|show me how|help me (learn|understand)|i need to learn|learn how|walk me through|explain|create a guide|create an? |give me (a |an )?|research|compare|how do i|how to|make (this|me|a|an)|build (this|me|a|an)|create (it |this |every |everything )?for me|build (it |this )?for me|do it for me|research and build)\b/.test(
      t,
    )
  ) {
    return "build_for_me";
  }
  return "unspecified";
}

export function detectKnowledgeLevel(raw: string): {
  level: VisualThinkingKnowledgeLevel;
  confidence: VisualThinkingConfidence;
} {
  const t = normalize(raw);
  if (
    /\b(never (done|used|tried)|brand new|complete beginner|i don't know anything|first time)\b/.test(
      t,
    )
  ) {
    return { level: "beginner", confidence: "high" };
  }
  if (
    /\b(already know the basics|know the basics|not a beginner|beyond the basics)\b/.test(
      t,
    )
  ) {
    return { level: "developing", confidence: "high" };
  }
  if (
    /\b(i (already )?do this for clients|i teach this|expert|advanced user)\b/.test(
      t,
    )
  ) {
    return { level: "advanced", confidence: "medium" };
  }
  if (/\b(experienced|i've done this before|i do this regularly)\b/.test(t)) {
    return { level: "experienced", confidence: "medium" };
  }
  if (/\b(beginner|new to)\b/.test(t)) {
    return { level: "beginner", confidence: "medium" };
  }
  return { level: "unknown", confidence: "low" };
}

export function inferPrimaryGoal(raw: string): {
  primary: VisualThinkingPrimaryGoal;
  secondary: VisualThinkingPrimaryGoal[];
} {
  const t = normalize(raw);

  if (
    /\b(train(ing)? (my )?(staff|team|employees)|teach (my |the )?(staff|team)|for training my)\b/.test(
      t,
    )
  ) {
    return { primary: "teach_others", secondary: ["document_process"] };
  }
  if (
    detectsUserLedVisual(t) ||
    /\b(map how|map my|how .+ connect|relationship|map .+ business)\b/.test(t)
  ) {
    return {
      primary: "see_relationships",
      secondary: ["organize_information"],
    };
  }
  if (/\b(compar(e|ison)|versus|vs\.?)\b/.test(t)) {
    return { primary: "compare_options", secondary: [] };
  }
  if (/\b(decid(e|ing)|should i hire|help me decide)\b/.test(t)) {
    return { primary: "make_decision", secondary: ["compare_options"] };
  }
  if (/\b(research)\b/.test(t)) {
    return { primary: "research_topic", secondary: ["understand_topic"] };
  }
  if (/\b(organize|organise|group these|ideas i pasted|these ideas)\b/.test(t)) {
    return { primary: "organize_information", secondary: [] };
  }
  if (/\b(troubleshoot|fix|not working|broken)\b/.test(t)) {
    return { primary: "troubleshoot", secondary: [] };
  }
  if (/\b(plan|roadmap)\b/.test(t) && !/\b(how to)\b/.test(t)) {
    return { primary: "plan_something", secondary: [] };
  }
  if (/\b(s\.?o\.?p\.?|onboarding process|standardize|document)\b/.test(t)) {
    return { primary: "document_process", secondary: [] };
  }
  if (/\b(how (do|to)|show me how|walk me through|learn how)\b/.test(t)) {
    return { primary: "learn_how", secondary: ["create_something"] };
  }
  if (/\b(explain|help me understand|what is)\b/.test(t)) {
    return { primary: "understand_topic", secondary: [] };
  }
  if (
    /\b(medicare|artificial intelligence|ai for)\b/.test(t) &&
    !/\b(how|map|compare|decide)\b/.test(t)
  ) {
    return { primary: "understand_topic", secondary: ["research_topic"] };
  }
  if (/\b(create|build|make)\b/.test(t) && !/\b(how)\b/.test(t)) {
    return { primary: "create_something", secondary: [] };
  }
  if (/\b(i don't know what would be best|not sure what)\b/.test(t)) {
    return { primary: "unclear", secondary: [] };
  }
  return { primary: "unclear", secondary: [] };
}

export function inferCognitiveTasks(
  primaryGoal: VisualThinkingPrimaryGoal,
): {
  tasks: VisualThinkingCognitiveTask[];
  primary: VisualThinkingCognitiveTask | null;
} {
  const tasks: VisualThinkingCognitiveTask[] = [];
  const push = (task: VisualThinkingCognitiveTask) => {
    if (!tasks.includes(task)) tasks.push(task);
  };

  switch (primaryGoal) {
    case "learn_how":
      push("learn");
      push("create");
      push("sequence");
      push("apply");
      break;
    case "understand_topic":
    case "research_topic":
      push("understand");
      push("research");
      push("explain");
      break;
    case "organize_information":
      push("organize");
      break;
    case "see_relationships":
      push("organize");
      push("connect");
      push("understand");
      break;
    case "compare_options":
      push("compare");
      push("evaluate");
      break;
    case "make_decision":
      push("decide");
      push("compare");
      push("evaluate");
      break;
    case "teach_others":
      push("teach");
      push("sequence");
      push("explain");
      break;
    case "document_process":
      push("sequence");
      push("explain");
      push("create");
      break;
    case "plan_something":
      push("plan");
      push("create");
      break;
    case "troubleshoot":
      push("troubleshoot");
      push("evaluate");
      break;
    case "create_something":
      push("create");
      break;
    case "explain_something":
      push("explain");
      break;
    default:
      break;
  }

  return { tasks, primary: tasks[0] ?? null };
}

export function inferSuccessDefinition(input: {
  raw: string;
  primaryGoal: VisualThinkingPrimaryGoal;
  topic: string;
}): string {
  switch (input.primaryGoal) {
    case "learn_how":
      if (/loom/i.test(input.raw)) {
        return "You can confidently record, review, and share a Loom video.";
      }
      return `You can confidently complete ${input.topic || "the task"} on your own.`;
    case "teach_others":
      return "Your staff can complete the process consistently without guessing.";
    case "compare_options":
      return "You understand the meaningful differences and can identify best-fit options.";
    case "make_decision":
      return "You have a clear structure for deciding — without Spark deciding for you.";
    case "organize_information":
      return "Your ideas are grouped clearly and you know what deserves attention next.";
    case "see_relationships":
      return "You can see how the parts connect and where the picture is incomplete.";
    case "research_topic":
    case "understand_topic":
      return "You feel informed enough to ask better questions or take a next step.";
    case "document_process":
      return "The process is clear enough that someone else could follow it.";
    default:
      return "You have a clear next step that matches what you asked for.";
  }
}

export function assessResearchNeed(input: {
  raw: string;
  primaryGoal: VisualThinkingPrimaryGoal;
  creationMode: VisualThinkingCreationMode;
}): {
  need: VisualThinkingResearchNeed;
  reason: string | null;
  depth: Exclude<VisualThinkingHelpDepth, "unspecified" | "help_choose"> | null;
} {
  const t = normalize(input.raw);
  if (
    input.creationMode === "build_myself" ||
    /\b(organize (these )?ideas|pasted|my own (map|ideas|business)|map how my|map my own)\b/.test(
      t,
    )
  ) {
    return { need: "not_needed", reason: null, depth: null };
  }
  if (/\b(research|current (steps|options|platforms)|compare current)\b/.test(t)) {
    return {
      need: "required",
      reason: "Current external information is needed for an accurate result.",
      depth:
        detectHelpDepth(input.raw) === "essentials" ? "essentials" : "detailed",
    };
  }
  if (
    input.primaryGoal === "compare_options" ||
    input.primaryGoal === "research_topic"
  ) {
    return {
      need: "required",
      reason:
        "Comparing or researching current options needs up-to-date information.",
      depth: "guided",
    };
  }
  if (
    input.primaryGoal === "learn_how" &&
    /\b(loom|software|app|platform|tool)\b/.test(t)
  ) {
    return {
      need: "optional",
      reason:
        "Current product steps may need a quick verification before building.",
      depth: "guided",
    };
  }
  if (
    input.primaryGoal === "understand_topic" &&
    /\b(medicare|ai|artificial)\b/.test(t)
  ) {
    return {
      need: "required",
      reason: "This topic benefits from careful research before explaining.",
      depth: "guided",
    };
  }
  if (input.primaryGoal === "unclear") {
    return { need: "unclear", reason: null, depth: null };
  }
  return { need: "not_needed", reason: null, depth: null };
}

export function outputLabel(output: VisualThinkingUnderstandingOutput): string {
  const labels: Record<VisualThinkingUnderstandingOutput, string> = {
    simple_explanation: "concise explanation",
    concise_explanation: "concise explanation",
    detailed_explanation: "detailed explanation",
    step_by_step_guide: "step-by-step guide",
    checklist: "checklist",
    process_flow: "movable visual process",
    visual_thinking_map: "editable visual map",
    editable_visual_map: "editable visual map",
    relationship_map: "relationship map",
    mind_map: "mind map",
    timeline: "timeline",
    decision_tree: "decision structure",
    cause_effect_map: "cause-and-effect map",
    comparison: "comparison",
    report: "report",
    sop: "SOP",
    learning_guide: "learning guide",
    training_guide: "training guide",
    action_plan: "action plan",
    quick_reference: "quick-reference guide",
    faq: "FAQ",
    glossary: "glossary",
    common_mistakes: "common mistakes",
    examples: "examples",
    practice_activity: "practice activity",
    questions_to_consider: "questions to consider",
  };
  return labels[output] ?? String(output).replace(/_/g, " ");
}

function isMapOutput(output: VisualThinkingUnderstandingOutput): boolean {
  return (
    output === "visual_thinking_map" ||
    output === "editable_visual_map" ||
    output === "relationship_map" ||
    output === "mind_map" ||
    output === "process_flow" ||
    output === "decision_tree" ||
    output === "cause_effect_map"
  );
}

function inferPrimaryExperience(
  goal: VisualThinkingPrimaryGoal,
  creationMode: VisualThinkingCreationMode,
): VisualThinkingPrimaryExperience {
  if (creationMode === "build_myself") return "user_led_creation";
  switch (goal) {
    case "teach_others":
      return "teaching";
    case "research_topic":
      return "research";
    case "compare_options":
      return "comparison";
    case "make_decision":
      return "decision_support";
    case "see_relationships":
    case "organize_information":
      return "visual_organization";
    case "learn_how":
    case "document_process":
      return "process_development";
    case "plan_something":
      return "planning";
    case "troubleshoot":
      return "troubleshooting";
    case "understand_topic":
    case "explain_something":
      return "explanation";
    case "create_something":
      return creationMode === "guide_me" ? "guided_creation" : "guided_creation";
    default:
      return "explanation";
  }
}

function recommendFromUnderstanding(input: {
  raw: string;
  primaryGoal: VisualThinkingPrimaryGoal;
  effectiveDepth: Exclude<VisualThinkingHelpDepth, "unspecified">;
  knowledge: VisualThinkingKnowledgeLevel;
  creationMode: VisualThinkingCreationMode;
  declinesMap: boolean;
  wantsVisualAlso: boolean;
  explicitOutput: VisualThinkingOutputForm | null;
  checklistOnly: boolean;
}): {
  primary: VisualThinkingUnderstandingOutput;
  supporting: VisualThinkingUnderstandingOutput[];
  rationale: string;
  userFacing: string;
} {
  if (input.checklistOnly) {
    return {
      primary: "checklist",
      supporting: [],
      rationale:
        "The user asked only for a checklist, so the plan stays focused on that deliverable.",
      userFacing: "A focused checklist — nothing extra unless you ask for it.",
    };
  }

  if (input.creationMode === "build_myself") {
    return {
      primary: "editable_visual_map",
      supporting: [],
      rationale:
        "The user wants to build it themselves, so Spark prepares a user-led visual space rather than a completed result.",
      userFacing:
        "A blank, editable visual space so you can map it yourself — Spark will not generate a finished map.",
    };
  }

  if (input.explicitOutput === "report" || (input.declinesMap && /\breport\b/i.test(input.raw))) {
    return {
      primary: "report",
      supporting: input.effectiveDepth === "essentials" ? [] : ["questions_to_consider"],
      rationale:
        "The user asked for a report and declined a map, so the written report stays primary.",
      userFacing:
        input.effectiveDepth === "essentials"
          ? "A clear report — no map."
          : "A clear report with optional questions to consider — no map.",
    };
  }

  if (input.explicitOutput === "checklist") {
    return {
      primary: "checklist",
      supporting: [],
      rationale: "Explicit checklist preference overrides broader process recommendations.",
      userFacing: "A checklist that matches what you asked for.",
    };
  }

  let primary: VisualThinkingUnderstandingOutput = "step_by_step_guide";
  let supporting: VisualThinkingUnderstandingOutput[] = [];
  let rationale = "";
  let userFacing = "";

  switch (input.primaryGoal) {
    case "learn_how": {
      primary = "step_by_step_guide";
      if (input.knowledge === "beginner" || input.knowledge === "unknown") {
        supporting = input.declinesMap
          ? ["checklist", "common_mistakes"]
          : ["process_flow", "checklist"];
        rationale =
          "A guided step-by-step process fits learning a sequential task. A visual flow and checklist support execution without replacing the written guide.";
        userFacing =
          input.effectiveDepth === "detailed"
            ? "A detailed step-by-step guide written for a beginner."
            : "A clear step-by-step guide.";
      } else {
        supporting = input.declinesMap ? ["checklist"] : ["process_flow", "checklist"];
        rationale =
          "The user already knows the basics, so the guide skips remedial overview and focuses on the steps that matter.";
        userFacing =
          "A practical step-by-step guide that skips the basics you already know.";
      }
      break;
    }
    case "teach_others":
    case "document_process": {
      primary =
        input.primaryGoal === "teach_others" ? "training_guide" : "sop";
      supporting = input.declinesMap
        ? ["checklist"]
        : ["process_flow", "checklist"];
      rationale =
        "Teaching and standardization need a durable written process staff can follow, with a flow and checklist for consistent execution.";
      userFacing =
        primary === "training_guide"
          ? "A training guide your staff can follow consistently."
          : "An SOP your team can follow consistently.";
      break;
    }
    case "research_topic":
    case "understand_topic": {
      primary =
        input.effectiveDepth === "essentials"
          ? "concise_explanation"
          : "report";
      supporting =
        input.declinesMap
          ? ["glossary", "questions_to_consider"]
          : ["glossary", "questions_to_consider"];
      if (input.declinesMap) {
        supporting = supporting.filter((o) => !isMapOutput(o));
      }
      rationale =
        "Understanding a complex topic starts with a clear written explanation; glossary and questions help without forcing a decision.";
      userFacing =
        primary === "concise_explanation"
          ? "A simple, clear explanation."
          : "A clear explanatory report.";
      break;
    }
    case "compare_options": {
      primary = "comparison";
      supporting = ["questions_to_consider"];
      rationale =
        "Comparison is the primary cognitive task; a concise recommendation summary can follow without deciding for the user.";
      userFacing = "A clear comparison with a concise summary of tradeoffs.";
      break;
    }
    case "make_decision": {
      primary = "decision_tree";
      supporting = ["comparison", "questions_to_consider"];
      if (input.declinesMap) {
        primary = "comparison";
        supporting = ["questions_to_consider", "action_plan"];
      }
      rationale =
        "Decision support should structure criteria and tradeoffs — Spark recommends structure, not the decision itself.";
      userFacing =
        "A decision-support structure with criteria, tradeoffs, and questions to consider — you stay the decision-maker.";
      break;
    }
    case "see_relationships":
    case "organize_information": {
      primary =
        input.primaryGoal === "see_relationships"
          ? "relationship_map"
          : "editable_visual_map";
      supporting = ["simple_explanation"];
      rationale =
        "Organizing existing knowledge fits an editable visual first; research is not required unless asked.";
      userFacing =
        input.primaryGoal === "see_relationships"
          ? "An editable relationship map of how the parts connect."
          : "An editable visual to organize what you already have.";
      break;
    }
    case "unclear": {
      primary = "step_by_step_guide";
      supporting = ["checklist"];
      rationale =
        "When the best form is unclear, one calm starting guide keeps momentum without a large menu.";
      userFacing =
        "A clear guided starting point — we can change the form anytime.";
      break;
    }
    default: {
      primary = input.explicitOutput ?? "step_by_step_guide";
      supporting = ["checklist"];
      rationale = "A focused written starting point matches the request.";
      userFacing = `A ${outputLabel(primary)}.`;
      break;
    }
  }

  // Explicit format wins — but soft "how to / show me how" detection is a
  // learning cue, not a hard format lock. Goal-first goals must not be
  // overwritten by that soft signal (e.g. training correction after a Loom how-to).
  if (input.explicitOutput && input.explicitOutput !== "visual_thinking_map") {
    const softHowToStepGuide =
      input.explicitOutput === "step_by_step_guide" &&
      /\b(show me how|how (do|to))\b/i.test(input.raw) &&
      !/\b(step[- ]by[- ]step|every step|all the steps)\b/i.test(input.raw);
    const goalOwnsFormat =
      softHowToStepGuide &&
      (input.primaryGoal === "teach_others" ||
        input.primaryGoal === "document_process" ||
        input.primaryGoal === "make_decision" ||
        input.primaryGoal === "compare_options" ||
        input.primaryGoal === "research_topic" ||
        input.primaryGoal === "understand_topic" ||
        input.primaryGoal === "see_relationships" ||
        input.primaryGoal === "organize_information");
    if (!goalOwnsFormat) {
      primary = input.explicitOutput;
    }
  }

  if (input.declinesMap) {
    supporting = supporting.filter((o) => !isMapOutput(o));
    if (isMapOutput(primary)) {
      primary =
        input.explicitOutput && !isMapOutput(input.explicitOutput)
          ? input.explicitOutput
          : "report";
    }
  }

  if (input.wantsVisualAlso && !input.declinesMap && !supporting.includes("process_flow")) {
    if (!isMapOutput(primary)) supporting = [...supporting, "process_flow"];
  }

  // Keep the combination small
  supporting = supporting.slice(0, 3);

  return { primary, supporting, rationale, userFacing };
}

function buildUserFacingGoal(input: {
  primaryGoal: VisualThinkingPrimaryGoal;
  topic: string;
  raw: string;
}): string {
  switch (input.primaryGoal) {
    case "learn_how":
      if (/loom/i.test(input.raw)) {
        return "Learn how to confidently create and share a Loom video.";
      }
      return `Learn how to ${input.topic || "do this"} with confidence.`;
    case "teach_others":
      return "Teach your staff a repeatable process they can follow consistently.";
    case "research_topic":
    case "understand_topic":
      return `Understand ${input.topic || "this topic"} clearly enough to move forward.`;
    case "compare_options":
      return `Compare ${input.topic || "your options"} so the differences are clear.`;
    case "make_decision":
      return "Think through a decision with clear criteria — without Spark deciding for you.";
    case "see_relationships":
      return "See how the parts of your business connect.";
    case "organize_information":
      return "Organize what you already have so the next step is easier to see.";
    case "document_process":
      return "Document a repeatable process others can follow.";
    default:
      return input.topic
        ? `Make progress on ${input.topic}.`
        : "Make progress on what you asked for.";
  }
}

function computeConfidence(input: {
  primaryGoal: VisualThinkingPrimaryGoal;
  requestedDepth: VisualThinkingHelpDepth;
  creationMode: VisualThinkingCreationMode;
  explicitOutput: VisualThinkingOutputForm | null;
}): VisualThinkingConfidence {
  let score = 0;
  if (input.primaryGoal !== "unclear") score += 2;
  if (input.requestedDepth !== "unspecified") score += 1;
  if (input.creationMode !== "unspecified") score += 1;
  if (input.explicitOutput) score += 1;
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

function maybeClarification(input: {
  raw: string;
  primaryGoal: VisualThinkingPrimaryGoal;
  confidence: VisualThinkingConfidence;
  knowledge: VisualThinkingKnowledgeLevel;
}): string | null {
  const t = normalize(input.raw);
  // Ambiguous Medicare-style help without research/report/how cues
  if (
    input.primaryGoal === "understand_topic" &&
    /\bhelp me with\b/.test(t) &&
    !/\b(research|report|explain|decide|compare)\b/.test(t)
  ) {
    return "Would you like a clear overview, help preparing for a decision, or something else?";
  }
  if (
    input.confidence === "low" &&
    input.primaryGoal === "unclear" &&
    !/\b(don't know what would be best)\b/.test(t)
  ) {
    return "What would be most helpful — understanding, creating, organizing, or deciding?";
  }
  // Knowledge level only if it would change the result and is unknown with learn_how
  if (
    input.primaryGoal === "learn_how" &&
    input.knowledge === "unknown" &&
    /\b(advanced|expert)\b/.test(t) === false &&
    input.confidence === "low"
  ) {
    return null; // recommend instead of quiz
  }
  return null;
}

/**
 * Interpret a Build 1 request into a goal-first understanding.
 * Does not copy ownership of request draft fields — references requestId.
 */
export function interpretVisualThinkingUnderstanding(
  request: VisualThinkingRequest,
): VisualThinkingUnderstanding {
  const raw = request.rawRequest.trim();
  const topic = topicHint(raw);
  const { primary: primaryGoal, secondary: secondaryGoals } =
    inferPrimaryGoal(raw);
  const { tasks, primary: primaryCognitiveTask } =
    inferCognitiveTasks(primaryGoal);
  const knowledge = detectKnowledgeLevel(raw);
  const creationMode =
    request.entryPath === "user_led_visual"
      ? "build_myself"
      : detectCreationMode(raw);
  const requestedDepth =
    request.requestedDepth !== "unspecified"
      ? request.requestedDepth
      : detectHelpDepth(raw);
  const effectiveDepth: Exclude<VisualThinkingHelpDepth, "unspecified"> =
    requestedDepth === "unspecified"
      ? "guided"
      : requestedDepth === "help_choose"
        ? "guided"
        : requestedDepth;
  const declinesMap = request.declinesMap || detectsDeclinesMap(raw);
  const wantsVisualAlso = request.wantsVisualAlso || detectsWantsVisualAlso(raw);
  const explicitOutput =
    request.requestedOutput ?? detectRequestedOutput(raw);
  const checklistOnly = /\b(only (want |need )?a checklist|just (want |need )?a checklist|checklist only)\b/i.test(
    raw,
  );
  const research = assessResearchNeed({
    raw,
    primaryGoal,
    creationMode,
  });
  const primaryExperience = inferPrimaryExperience(primaryGoal, creationMode);
  const successDefinition = inferSuccessDefinition({
    raw,
    primaryGoal,
    topic,
  });
  const userFacingGoal = buildUserFacingGoal({ primaryGoal, topic, raw });
  const rec = recommendFromUnderstanding({
    raw,
    primaryGoal,
    effectiveDepth,
    knowledge: knowledge.level,
    creationMode,
    declinesMap,
    wantsVisualAlso,
    explicitOutput,
    checklistOnly,
  });
  const confidence = computeConfidence({
    primaryGoal,
    requestedDepth,
    creationMode,
    explicitOutput,
  });
  const clarificationNeed = maybeClarification({
    raw,
    primaryGoal,
    confidence,
    knowledge: knowledge.level,
  });

  const assumptions: string[] = [];
  if (knowledge.level === "unknown" && primaryGoal === "learn_how") {
    assumptions.push("Knowledge level is unknown — treating guidance as beginner-friendly until corrected.");
  }
  if (research.need === "optional") {
    assumptions.push("Current product instructions may need verification.");
  }
  if (!/\b(staff|team|client|audience)\b/i.test(raw)) {
    assumptions.push("No specific audience was identified.");
  }

  const timestamp = nowIso();
  return {
    id: newId(),
    requestId: request.id,
    rawRequest: raw,
    primaryGoal,
    secondaryGoals,
    intendedOutcome: successDefinition,
    successDefinition,
    cognitiveTasks: tasks,
    primaryCognitiveTask,
    userKnowledgeLevel: knowledge.level,
    knowledgeConfidence: knowledge.confidence,
    requestedDepth,
    effectiveDepth,
    creationMode,
    researchNeed: research.need,
    researchReason: research.reason,
    researchDepth: research.depth,
    primaryExperience,
    supportingExperiences: [],
    recommendedPrimaryOutput: rec.primary,
    recommendedSupportingOutputs: rec.supporting,
    recommendationRationale: rec.rationale,
    userFacingRecommendation: rec.userFacing,
    userFacingGoal,
    assumptions,
    clarificationNeed,
    sourceContext: request.sourceContext,
    confidence,
    status: clarificationNeed ? "needs_clarification" : "ready_for_preview",
    declinesMap,
    interpretedBy: "deterministic_v1",
    interpretationVersion: "vts-understanding-1",
    userAdjusted: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Project understanding into calm member-facing preview copy. */
export function projectUnderstandingPreview(
  understanding: VisualThinkingUnderstanding,
): VisualThinkingPreviewProjection {
  const supportingLines = understanding.recommendedSupportingOutputs.map(
    (o) => outputLabel(o),
  );
  const presentation = resolveAdaptivePresentation({
    destinationHint: "visual_thinking_studio",
  });
  const { visible, hiddenCount } = limitVisibleChoices(
    supportingLines,
    presentation,
  );

  let researchLine: string | null = null;
  if (
    understanding.researchNeed === "required" ||
    understanding.researchNeed === "optional"
  ) {
    researchLine =
      understanding.researchNeed === "required"
        ? "I'll gather current information before building it."
        : "I'll verify the current steps before building it.";
  }

  let creationModeLine: string | null = null;
  if (understanding.creationMode === "build_myself") {
    creationModeLine =
      "You'll build it yourself — Spark will not generate a finished result.";
  }

  return {
    goalLine: understanding.userFacingGoal,
    primaryLine: understanding.userFacingRecommendation,
    supportingLines: hiddenCount > 0 ? visible : supportingLines,
    researchLine,
    creationModeLine,
    clarificationQuestion: understanding.clarificationNeed,
    showSupporting:
      understanding.recommendedSupportingOutputs.length > 0 &&
      understanding.creationMode !== "build_myself",
  };
}

export function applyUnderstandingCorrection(
  understanding: VisualThinkingUnderstanding,
  correction: UnderstandingCorrection,
): VisualThinkingUnderstanding {
  const next: VisualThinkingUnderstanding = {
    ...understanding,
    userAdjusted: true,
    status: "user_adjusted",
    updatedAt: nowIso(),
    // Preserve raw request always
    rawRequest: understanding.rawRequest,
  };

  switch (correction.kind) {
    case "simplify":
      next.effectiveDepth = "essentials";
      next.requestedDepth = "essentials";
      break;
    case "add_detail":
      next.effectiveDepth = "detailed";
      next.requestedDepth = "detailed";
      break;
    case "checklist_only":
      next.recommendedPrimaryOutput = "checklist";
      next.recommendedSupportingOutputs = [];
      next.userFacingRecommendation =
        "A focused checklist — nothing extra unless you ask for it.";
      next.recommendationRationale =
        "User asked to keep only the checklist.";
      return next;
    case "report_only":
      next.recommendedPrimaryOutput = "report";
      next.recommendedSupportingOutputs = [];
      next.declinesMap = true;
      next.userFacingRecommendation = "A clear report — no map.";
      return next;
    case "no_map":
      next.declinesMap = true;
      next.recommendedSupportingOutputs =
        next.recommendedSupportingOutputs.filter((o) => !isMapOutput(o));
      if (isMapOutput(next.recommendedPrimaryOutput)) {
        next.recommendedPrimaryOutput = "report";
        next.userFacingRecommendation = "A clear written result — no map.";
      }
      return next;
    case "add_visual":
      next.declinesMap = false;
      if (
        !next.recommendedSupportingOutputs.includes("process_flow") &&
        !isMapOutput(next.recommendedPrimaryOutput)
      ) {
        next.recommendedSupportingOutputs = [
          ...next.recommendedSupportingOutputs,
          "process_flow",
        ];
      }
      return next;
    case "build_myself":
      next.creationMode = "build_myself";
      next.primaryExperience = "user_led_creation";
      next.researchNeed = "not_needed";
      next.researchReason = null;
      next.recommendedPrimaryOutput = "editable_visual_map";
      next.recommendedSupportingOutputs = [];
      next.userFacingRecommendation =
        "A blank, editable visual space so you can map it yourself — Spark will not generate a finished map.";
      next.userFacingGoal =
        next.userFacingGoal || "Map or organize this in your own way.";
      return next;
    case "remove_supporting":
      next.recommendedSupportingOutputs =
        next.recommendedSupportingOutputs.filter(
          (o) => o !== correction.output,
        );
      return next;
    case "change_included":
      next.clarificationNeed =
        "What would you like included — or left out — of this plan?";
      next.status = "needs_clarification";
      return next;
    case "natural_language": {
      const text = correction.text.trim();
      const combined = `${understanding.rawRequest} ${text}`.trim();
      // Re-interpret with preserved request id and original rawRequest
      const syntheticRequest: VisualThinkingRequest = {
        id: understanding.requestId,
        rawRequest: combined,
        provisionalIntent: "unclear",
        requestedDepth: detectHelpDepth(combined),
        requestedOutput: detectRequestedOutput(combined),
        recommendedPrimaryOutput: null,
        recommendedSupportingOutputs: [],
        recommendationSummary: "",
        declinesMap:
          understanding.declinesMap || detectsDeclinesMap(text),
        wantsVisualAlso:
          detectsWantsVisualAlso(text) || detectsWantsVisualAlso(combined),
        userConfirmed: false,
        entryPath: detectsUserLedVisual(text)
          ? "user_led_visual"
          : "describe_request",
        sourceContext: understanding.sourceContext,
        status: "preview",
        createdAt: understanding.createdAt,
        updatedAt: nowIso(),
      };
      const reinterpreted = interpretVisualThinkingUnderstanding(syntheticRequest);
      return {
        ...reinterpreted,
        id: understanding.id,
        requestId: understanding.requestId,
        rawRequest: understanding.rawRequest,
        userAdjusted: true,
        status: "user_adjusted",
        // Keep history of original + correction via assumptions note
        assumptions: [
          ...understanding.assumptions,
          `User correction applied: "${text}"`,
        ],
      };
    }
  }

  // Recompute recommendation after depth-only changes
  const rec = recommendFromUnderstanding({
    raw: next.rawRequest,
    primaryGoal: next.primaryGoal,
    effectiveDepth: next.effectiveDepth,
    knowledge: next.userKnowledgeLevel,
    creationMode: next.creationMode,
    declinesMap: next.declinesMap,
    wantsVisualAlso: false,
    explicitOutput: null,
    checklistOnly: false,
  });
  next.recommendedPrimaryOutput = rec.primary;
  next.recommendedSupportingOutputs = next.declinesMap
    ? rec.supporting.filter((o) => !isMapOutput(o))
    : rec.supporting;
  next.recommendationRationale = rec.rationale;
  next.userFacingRecommendation = rec.userFacing;
  return next;
}

/** Map understanding primary output into Build 1 request form for draft sync. */
export function understandingOutputToRequestForm(
  output: VisualThinkingUnderstandingOutput,
): VisualThinkingOutputForm {
  switch (output) {
    case "concise_explanation":
    case "detailed_explanation":
      return "simple_explanation";
    case "editable_visual_map":
    case "relationship_map":
    case "mind_map":
    case "cause_effect_map":
      return "visual_thinking_map";
    case "training_guide":
      return "learning_guide";
    case "quick_reference":
    case "faq":
    case "glossary":
    case "common_mistakes":
    case "examples":
    case "practice_activity":
    case "questions_to_consider":
      return "simple_explanation";
    default:
      return output as VisualThinkingOutputForm;
  }
}

/** Sync understanding recommendations back onto a Build 1 request draft. */
export function syncRequestFromUnderstanding(
  request: VisualThinkingRequest,
  understanding: VisualThinkingUnderstanding,
): VisualThinkingRequest {
  return {
    ...request,
    recommendedPrimaryOutput: understandingOutputToRequestForm(
      understanding.recommendedPrimaryOutput,
    ),
    recommendedSupportingOutputs: understanding.recommendedSupportingOutputs
      .map(understandingOutputToRequestForm)
      .filter((v, i, arr) => arr.indexOf(v) === i),
    recommendationSummary: understanding.userFacingRecommendation,
    declinesMap: understanding.declinesMap,
    requestedDepth: understanding.requestedDepth,
    status:
      understanding.creationMode === "build_myself"
        ? "user_led"
        : request.status === "confirmed"
          ? "confirmed"
          : request.status === "awaiting_depth"
            ? "awaiting_depth"
            : "preview",
    updatedAt: nowIso(),
  };
}
