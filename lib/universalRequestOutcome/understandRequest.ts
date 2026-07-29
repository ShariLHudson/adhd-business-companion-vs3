/**
 * Shared Universal Request Understanding — compositional intent, not nearest keyword.
 */

import type {
  UniversalCreationFamily,
  UniversalRequestUnderstanding,
} from "./types";
import {
  isCreateRejection,
  mentionsCreateDeliverable,
} from "@/lib/createIntentVocabulary";

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function normalizeRequest(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

function parseDuration(
  t: string,
): UniversalRequestUnderstanding["requestedDuration"] {
  const m = t.match(
    /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s*[- ]?(day|days|week|weeks|month|months)\b/i,
  );
  if (!m) return null;
  const wordMap: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
  };
  const n = /^\d+$/.test(m[1]!)
    ? Number(m[1])
    : wordMap[m[1]!.toLowerCase()] ?? null;
  if (!n) return null;
  const unitRaw = m[2]!.toLowerCase();
  const unit = unitRaw.startsWith("day")
    ? "day"
    : unitRaw.startsWith("week")
      ? "week"
      : "month";
  return { value: n, unit };
}

function parseQuantity(t: string): number | null {
  const m = t.match(
    /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(email|emails|post|posts|lesson|lessons|module|modules|session|sessions|chapter|chapters)\b/i,
  );
  if (!m) return null;
  const wordMap: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };
  return /^\d+$/.test(m[1]!)
    ? Number(m[1])
    : wordMap[m[1]!.toLowerCase()] ?? null;
}

function detectFamily(t: string): UniversalCreationFamily {
  if (/\b(content plan|content calendar|editorial calendar)\b/.test(t)) {
    return "content_plan";
  }
  if (/\b(social media plan|social plan|posting plan)\b/.test(t)) {
    return "content_plan";
  }
  if (/\b(business plan)\b/.test(t)) return "plan"; // mapped to Business Plan below
  if (/\b(launch campaign|campaign|promotion plan)\b/.test(t)) return "campaign";
  if (/\b(handbook|manual)\b/.test(t)) return "handbook";
  if (/\b(sop|standard operating)\b/.test(t)) return "sop";
  if (/\b(checklist)\b/.test(t)) return "checklist";
  if (/\b(curriculum|course|training program)\b/.test(t)) return "curriculum";
  if (/\b(mentoring program|volunteer program|program for)\b/.test(t)) {
    return "program";
  }
  if (/\b(workshop)\b/.test(t)) return "workshop";
  if (/\b(comparison|compare)\b/.test(t)) return "comparison";
  if (/\b(research report|report)\b/.test(t) && /\bresearch\b/.test(t)) {
    return "research_report";
  }
  if (/\b(report)\b/.test(t)) return "report";
  if (
    /\b(step[- ]by[- ]step|how (do|to)|teach me|walk me through|show me how)\b/.test(
      t,
    )
  ) {
    return "step_by_step_instructions";
  }
  if (/\b(guide|instructions)\b/.test(t)) return "guide";
  if (/\b(project plan|build a project|turn .+ into a project)\b/.test(t)) {
    return "project_plan";
  }
  if (/\b(timeline)\b/.test(t)) return "timeline";
  if (/\b(strategy|strategic)\b/.test(t)) return "strategy";
  if (/\b(proposal)\b/.test(t)) return "proposal";
  if (/\b(process|workflow)\b/.test(t)) return "process";
  if (/\b(email sequence|drip)\b/.test(t)) return "communication_series";
  if (/\b(marketing plan)\b/.test(t)) return "plan";
  if (/\b(plan)\b/.test(t) && !/\b(business|marketing|content|social|launch)\b/.test(t)) {
    return "plan";
  }
  if (/\b(facebook post|linkedin post|instagram post|social post|caption)\b/.test(t)) {
    return "single_deliverable";
  }
  return "unknown";
}

/**
 * The request is *talking about* creating, not commanding it now: first-person
 * aspiration ("I want to", "my goal is to"), consideration ("thinking about",
 * "considering"), evaluation ("whether to", "should I", "help me decide"),
 * ideation / capability questions ("what could I", "ideas for", "how can I",
 * "what does it take to"), and attribution / incidental use ("who created",
 * "this could create"). A detected creation family in such a sentence names a
 * KIND of thing but is not execution intent — it must not open Create. The
 * boundary here is exploration-vs-execution, not an arbitrary phrase list, and
 * an explicit research→creation handoff still overrides it.
 */
const EXPLORATORY_CREATION_FRAMING_RE =
  /\b(?:i\s+(?:want|'?d\s+like|would\s+like|hope|'?d\s+love|would\s+love|plan|intend|aim|wish)\s+to|my\s+goal\s+is\s+to|i'?m\s+(?:hoping|planning|thinking|wanting)\s+(?:to|about)|i'?ve\s+(?:been\s+(?:thinking|wanting)|always\s+wanted)|thinking\s+about|think\s+i\s+(?:might|could|should|want)|considering|toying\s+with|maybe\s+i|whether\s+(?:to|i\s+should)|should\s+i|help\s+me\s+decide|deciding\s+whether|trying\s+to\s+decide|is\s+it\s+worth|do\s+you\s+think\s+i\s+should|what\s+(?:could|should|can|do|would|kind\s+of|type\s+of)\s+i|ideas?\s+(?:for|to)\b|brainstorm|how\s+(?:can|do|would|should)\s+i|what\s+does\s+it\s+take\s+to|what\s+goes\s+into|what'?s\s+involved\s+in|(?:could|can|should|would|do|might)\s+i\s+(?:create|make|build|write|draft|design|produce|generate|come\s+up\s+with)|who\s+(?:created|made|makes|built|designed)|(?:this|that|it)\s+(?:could|would|might|can)\s+(?:create|cause))\b/i;

function isExploratoryCreationFraming(t: string): boolean {
  return EXPLORATORY_CREATION_FRAMING_RE.test(t);
}

function isSeriesOrMulti(t: string, duration: ReturnType<typeof parseDuration>, qty: number | null): boolean {
  if (duration && duration.value >= 2) return true;
  if (qty && qty >= 2) return true;
  return /\b(series|sequence|campaign|program|curriculum|package|collection|multi[- ]?day|several|multiple)\b/.test(
    t,
  );
}

function mapCreateArtifactType(
  family: UniversalCreationFamily,
  t: string,
  multi: boolean,
): string | null {
  switch (family) {
    case "content_plan":
      // Prefer Content Calendar for multi-day social plans; never Social/Facebook Post.
      return multi || /\b(day|week|month|calendar|plan)\b/.test(t)
        ? "Content Calendar"
        : "Content Strategy";
    case "campaign":
      return "Marketing Plan";
    case "handbook":
      return "Training Guide";
    case "sop":
      return "SOP";
    case "checklist":
      return "Checklist";
    case "curriculum":
    case "course":
      return "Course Outline";
    case "program":
      return "Course Outline";
    case "workshop":
      return "Workshop";
    case "comparison":
      return "Document";
    case "research_report":
    case "report":
      return "Document";
    case "step_by_step_instructions":
    case "guide":
      return "Training Guide";
    case "project_plan":
      return "Launch Plan";
    case "timeline":
      return "Document";
    case "strategy":
      return "Marketing Strategy";
    case "proposal":
      return "Proposal";
    case "process":
      return "Process";
    case "communication_series":
      return "Email Campaign";
    case "plan":
      if (/\bbusiness plan\b/.test(t)) return "Business Plan";
      if (/\bmarketing plan\b/.test(t)) return "Marketing Plan";
      return "Marketing Plan";
    case "single_deliverable":
      if (/\bfacebook\b/.test(t) && !/\b(community|group|plan|campaign)\b/.test(t)) {
        return "Facebook Post";
      }
      if (/\blinkedin\b/.test(t)) return "LinkedIn Post";
      return "Social Post";
    default:
      return null;
  }
}

/**
 * Understand a creation / research / planning request compositionally.
 * Preserves duration, quantity, plan-vs-post, and series intent.
 */
export function understandUniversalRequest(
  rawRequest: string,
  options?: {
    /**
     * Explicit research→creation handoff (e.g. the user pressed "Use This
     * Research"). Treats a create-verb request as create intent even without a
     * concrete deliverable noun. Opt-in only — default behavior keeps the strict
     * deliverable requirement from 2a34c232.
     */
    explicitCreateHandoff?: boolean;
  },
): UniversalRequestUnderstanding {
  const normalizedRequest = normalizeRequest(rawRequest);
  const t = normalizedRequest.toLowerCase();
  const duration = parseDuration(t);
  const quantity = parseQuantity(t);
  const detectedFamily = detectFamily(t);
  // An exploratory / aspirational framing must not let a family keyword promote
  // to create intent ("I'm thinking about creating a course" names a curriculum
  // but is not a request to build one). An explicit handoff overrides this.
  const family: UniversalCreationFamily =
    detectedFamily !== "unknown" &&
    isExploratoryCreationFraming(t) &&
    options?.explicitCreateHandoff !== true
      ? "unknown"
      : detectedFamily;
  const multi = isSeriesOrMulti(t, duration, quantity);

  const wantsResearch = /\b(research|current|latest|now|best practices)\b/.test(
    t,
  );
  // A create verb only signals create intent when paired with a concrete
  // deliverable (or a known creation family). Bare "make"/"help me" no longer
  // qualifies, and a Create rejection never does — so "make the pasta", "help me
  // make a decision", and "I don't need the create room" are not create turns.
  const hasCreateVerb =
    /\b(?:create|build|make|write|draft|design|produce|generate)\b/.test(t);
  const wantsCreate =
    !isCreateRejection(t) &&
    (family !== "unknown" ||
      (hasCreateVerb &&
        (mentionsCreateDeliverable(t) ||
          options?.explicitCreateHandoff === true)));
  const wantsInstruct =
    /\b(how (do|to)|step[- ]by[- ]step|teach me|walk me through|show me how)\b/.test(
      t,
    );
  const wantsProject =
    /\b(project|turn .+ into a project|build a project)\b/.test(t);

  let primaryIntent: UniversalRequestUnderstanding["primaryIntent"] = "unknown";
  if (wantsResearch && (wantsCreate || wantsInstruct || wantsProject)) {
    primaryIntent = "mixed";
  } else if (wantsProject) primaryIntent = "project";
  else if (wantsInstruct) primaryIntent = "instruct";
  else if (wantsResearch && !wantsCreate) primaryIntent = "research";
  else if (wantsCreate || family !== "unknown") primaryIntent = "create";
  else if (/\bplan\b/.test(t)) primaryIntent = "plan";

  const secondaryIntents: string[] = [];
  if (wantsResearch) secondaryIntents.push("research");
  if (wantsCreate) secondaryIntents.push("create");
  if (wantsInstruct) secondaryIntents.push("instruct");
  if (wantsProject) secondaryIntents.push("project");
  if (multi) secondaryIntents.push("multi_item");

  const channel = /\b(facebook|instagram|linkedin|tiktok|youtube|social media)\b/.test(
    t,
  )
    ? (t.match(
        /\b(facebook|instagram|linkedin|tiktok|youtube|social media)\b/,
      )?.[1] ?? null)
    : null;

  // Plan / series intent must never collapse to a single social post.
  const planNotPost =
    family === "content_plan" ||
    family === "campaign" ||
    family === "plan" ||
    (multi && /\b(social|content|posting)\b/.test(t));

  const createArtifactType = mapCreateArtifactType(family, t, multi);

  const dayCount =
    duration?.unit === "day"
      ? duration.value
      : duration?.unit === "week"
        ? duration.value * 7
        : null;

  const desiredOutcome =
    family === "content_plan" && dayCount
      ? `A coordinated ${dayCount}-day social media content plan`
      : family === "step_by_step_instructions"
        ? "A detailed step-by-step instructional guide"
        : family === "program"
          ? "A structured program with roles, schedule, and evaluation"
          : normalizedRequest;

  const primaryDeliverable =
    family === "content_plan" && dayCount
      ? `${dayCount}-day social media content plan`
      : family === "step_by_step_instructions"
        ? "step-by-step guide"
        : createArtifactType ?? family;

  const supporting: string[] = [];
  if (family === "content_plan") {
    supporting.push(
      "captions",
      "calls to action",
      "format suggestions",
      "visual ideas",
      "posting schedule",
      "engagement prompts",
    );
  }
  if (family === "step_by_step_instructions" || family === "guide") {
    supporting.push("checklist", "troubleshooting", "visual process");
  }
  if (wantsProject) supporting.push("project proposal");

  const depth: UniversalRequestUnderstanding["requestedDepth"] =
    /\b(detailed|every step|exactly|comprehensive)\b/.test(t)
      ? "detailed"
      : /\b(quick|basic|essentials|simple)\b/.test(t)
        ? "essentials"
        : wantsInstruct || family === "content_plan"
          ? "guided"
          : "unspecified";

  const scope: UniversalRequestUnderstanding["requestedScope"] = multi
    ? family === "program" || family === "curriculum"
      ? "program"
      : family === "campaign"
        ? "package"
        : "series"
    : "single";

  const confidence =
    family !== "unknown" && (planNotPost || wantsInstruct || wantsProject)
      ? 0.92
      : family !== "unknown"
        ? 0.8
        : wantsCreate
          ? 0.55
          : 0.35;

  return {
    id: newId("uru"),
    rawRequest: rawRequest.trim(),
    normalizedRequest,
    primaryIntent,
    secondaryIntents: [...new Set(secondaryIntents)],
    desiredOutcome,
    desiredOutcomeType: family,
    requestedAction: primaryIntent,
    requestedDepth: depth,
    requestedScope: scope,
    requestedQuantity: quantity ?? dayCount,
    requestedDuration: duration,
    requestedTimeframe: duration
      ? `${duration.value} ${duration.unit}${duration.value === 1 ? "" : "s"}`
      : null,
    intendedAudience: /\b(audience|for my|for clients|for volunteers|students)\b/.test(
      t,
    )
      ? "inferred_from_request"
      : null,
    intendedChannel: channel,
    intendedDestination: null,
    intendedUse: wantsProject ? "execution" : "creation",
    primaryDeliverable,
    supportingDeliverables: supporting,
    creationFamily: family,
    requiresResearch: wantsResearch,
    requiresUserInformation: false,
    requiresCurrentInformation: /\b(current|latest|now)\b/.test(t),
    requiresExecutionPlanning: wantsProject,
    requiresVisualRepresentation:
      /\b(visual|map|process|show me)\b/.test(t) ||
      family === "step_by_step_instructions",
    requiresStrategicContext: /\b(strategy|strategic|campaign)\b/.test(t),
    knownConstraints: duration
      ? [`duration:${duration.value}_${duration.unit}`]
      : [],
    inferredConstraints: planNotPost ? ["must_not_collapse_to_single_post"] : [],
    unresolvedEssentialQuestions: [],
    confidence,
    interpretationSummary: planNotPost
      ? `Understood as a multi-item ${family.replace(/_/g, " ")}${
          dayCount ? ` across ${dayCount} days` : ""
        } — not a single social post.`
      : `Understood as ${family.replace(/_/g, " ")}.`,
    createArtifactType,
    qualifiers: {
      durationPreserved: Boolean(duration),
      quantityPreserved: Boolean(quantity || dayCount),
      planNotPost,
      seriesPreserved: multi,
      stepByStep: family === "step_by_step_instructions" || wantsInstruct,
    },
  };
}

/** True when understanding must override narrow catalog/post defaults. */
export function shouldPreferUniversalUnderstanding(
  u: UniversalRequestUnderstanding,
): boolean {
  if (
    u.qualifiers.planNotPost ||
    u.qualifiers.seriesPreserved ||
    u.qualifiers.stepByStep ||
    u.creationFamily === "content_plan" ||
    u.creationFamily === "program" ||
    u.creationFamily === "handbook" ||
    u.primaryIntent === "mixed"
  ) {
    return true;
  }
  // Specific named plans / guides with a mapped Create type beat keyword noise.
  if (
    u.createArtifactType &&
    /^(Business Plan|Marketing Plan|Content Calendar|Training Guide|Course Outline|Launch Plan)$/i.test(
      u.createArtifactType,
    )
  ) {
    return true;
  }
  return false;
}
