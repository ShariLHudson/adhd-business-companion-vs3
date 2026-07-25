/**
 * Distinguish questions about capabilities from commands to use them.
 */

const EXPLICIT_NAV_RE =
  /\b(?:take me to|go to|open|show me|bring me to|navigate to|enter|visit)\b/i;

const EXPLICIT_CREATE_COMMAND_RE =
  /^(?:please\s+)?(?:(?:help me|can you|could you|would you)\s+)?(?:create|write|draft|build|make|compose)\b(?!.*\b(?:how|what|why|when|should)\b)/i;

/** Allow light modifiers between article and artifact ("draft a customer email"). */
const CREATE_COMMAND_BODY_RE =
  /\b(?:create|write|draft|build|make|compose)\s+(?:me\s+)?(?:a |an |my |the )?(?:(?:short|quick|simple|brief|customer|client|welcome|follow[- ]?up|sales|marketing)\s+){0,4}?(?:strategic plan|client intake form|intake form|marketing plan|sop|e-?mails?|checklist|proposal|handbook|program|campaign|summary|agenda|script|post|outline)\b/i;

const QUESTION_ABOUT_CREATE_RE =
  /\b(?:how (?:do|can|would|should) i|how to|what (?:should|does|is)|explain how|teach me how|walk me through)\b.*\b(?:create|write|draft|build|make)\b/i;

const EXPLICIT_PROJECT_COMMAND_RE =
  /\b(?:turn (?:this|it) into (?:a |an |my )?(?:[\w-]+\s+){0,4}project|create a project|build (?:me )?a project|add (?:this )?to projects|open projects)\b/i;

const QUESTION_ABOUT_PROJECT_RE =
  /\b(?:how (?:do|can) i|what (?:should|goes|belongs)|explain|teach me).*\bproject/i;

const EXPLICIT_RESEARCH_COMMAND_RE =
  /\b(?:research (?:this|my|current|the)|find (?:active|current|the best)|look up|search for current)\b/i;

const QUESTION_ABOUT_RESEARCH_RE =
  /\b(?:how (?:do|can|would) i|how to|what is the (?:best )?way to)\b.*\bresearch\b/i;

const EXPLICIT_STRATEGY_BUILD_RE =
  /\b(?:create|build|start|draft)\s+(?:a |my |the )?(?:strategic plan|strategy plan|business strategy)\b/i;

const QUESTION_ABOUT_STRATEGY_RE =
  /\b(?:how (?:do|can) i|how to|what (?:is|goes in|should be in)|explain)\b.*\bstrateg(?:y|ic plan)\b/i;

const EXPLICIT_VISUAL_RE =
  /\b(?:show (?:this |it )?visually|make a (?:diagram|map|timeline|flowchart)|open visual thinking)\b/i;

export function isExplicitNavigationCommand(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  // Troubleshooting / status ("won't open", "doesn't open") is not navigation.
  if (/\b(?:won'?t|will not|doesn'?t|does not|can'?t|cannot)\s+open\b/i.test(t)) {
    return false;
  }
  if (!EXPLICIT_NAV_RE.test(t)) return false;
  // "show me how" is instructional, not navigation
  if (/\bshow me how\b/i.test(t)) return false;
  if (/\bshow me (?:what|why|whether)\b/i.test(t)) return false;
  // Require a destination name — bare "open" in other sentences is not nav.
  return /\b(?:research library|projects|create|visual thinking|strategic planning|playbook|chamber|boardroom|talk it out|clear my mind|settings|strategy library)\b/i.test(
    t,
  );
}

export function isExplicitCreationCommand(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (QUESTION_ABOUT_CREATE_RE.test(t)) return false;
  if (QUESTION_ABOUT_STRATEGY_RE.test(t) && !EXPLICIT_STRATEGY_BUILD_RE.test(t)) {
    return false;
  }
  return (
    EXPLICIT_CREATE_COMMAND_RE.test(t) ||
    CREATE_COMMAND_BODY_RE.test(t) ||
    EXPLICIT_STRATEGY_BUILD_RE.test(t)
  );
}

export function isQuestionAboutCreation(text: string): boolean {
  return QUESTION_ABOUT_CREATE_RE.test(text) || QUESTION_ABOUT_STRATEGY_RE.test(text);
}

export function isExplicitProjectCommand(text: string): boolean {
  const t = text.trim();
  if (!t || QUESTION_ABOUT_PROJECT_RE.test(t)) return false;
  return EXPLICIT_PROJECT_COMMAND_RE.test(t);
}

export function isQuestionAboutProjects(text: string): boolean {
  return QUESTION_ABOUT_PROJECT_RE.test(text);
}

export function isExplicitResearchCommand(text: string): boolean {
  const t = text.trim();
  if (!t || QUESTION_ABOUT_RESEARCH_RE.test(t)) return false;
  // "Find Facebook groups" methodology vs current groups
  if (
    /\bfind\b/i.test(t) &&
    /\b(?:active|current|best|right now|today)\b/i.test(t)
  ) {
    return true;
  }
  return EXPLICIT_RESEARCH_COMMAND_RE.test(t);
}

export function isQuestionAboutResearch(text: string): boolean {
  return QUESTION_ABOUT_RESEARCH_RE.test(text);
}

export function isExplicitVisualCommand(text: string): boolean {
  return EXPLICIT_VISUAL_RE.test(text.trim());
}

export function classifyQuestionVersusAction(text: string): {
  kind:
    | "explicit_navigation"
    | "explicit_creation"
    | "explicit_project"
    | "explicit_research"
    | "explicit_visual"
    | "question_about_creation"
    | "question_about_projects"
    | "question_about_research"
    | "ordinary_help"
    | "ordinary_question";
  reasons: string[];
} {
  const t = text.trim();
  if (isExplicitNavigationCommand(t)) {
    return { kind: "explicit_navigation", reasons: ["explicit_nav_verb"] };
  }
  if (isExplicitCreationCommand(t)) {
    return { kind: "explicit_creation", reasons: ["create_command"] };
  }
  if (isExplicitProjectCommand(t)) {
    return { kind: "explicit_project", reasons: ["project_command"] };
  }
  if (isExplicitResearchCommand(t)) {
    return { kind: "explicit_research", reasons: ["research_command"] };
  }
  if (isExplicitVisualCommand(t)) {
    return { kind: "explicit_visual", reasons: ["visual_command"] };
  }
  if (isQuestionAboutCreation(t)) {
    return { kind: "question_about_creation", reasons: ["question_not_command"] };
  }
  if (isQuestionAboutProjects(t)) {
    return { kind: "question_about_projects", reasons: ["question_not_command"] };
  }
  if (isQuestionAboutResearch(t)) {
    return { kind: "question_about_research", reasons: ["question_not_command"] };
  }
  if (/\b(?:how do i|how to|how can i|what should|should i|give me ideas|compare|why)\b/i.test(t)) {
    return { kind: "ordinary_help", reasons: ["help_phrasing"] };
  }
  return { kind: "ordinary_question", reasons: ["default"] };
}
